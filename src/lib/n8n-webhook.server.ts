import { supabaseAdmin } from "@/integrations/supabase/client.server";

export const N8N_NEW_ORDER_WEBHOOK_URL = "https://veratis.app.n8n.cloud/webhook/New-Order-Clean";

export type N8nOrderWebhookPayload = {
  ordernumber: string;
  customername: string | null;
  customeremail: string | null;
  customerphone: string | null;
  products: Array<{
    name: string;
    quantity: number | string;
  }>;
  ordertotal: number;
  paymentmethod: string;
  paymentstatus: string | null;
  btcamountquoted: string;
  btctxid: string;
  btcpaymentproofurl: string;
  venmousername: string;
  venmonotes: string;
  venmopaymentproofurl: string;
  fulfillmentstatus: string | null;
  shippingaddress: {
    name: string | null;
    address1: string | null;
    address2: string | null;
    city: string | null;
    state: string | null;
    zip: string | null;
    country: string | null;
  };
  timestamp: string;
};

export type N8nWebhookDebugResult = {
  webhook_attempted: boolean;
  url: string;
  payload: N8nOrderWebhookPayload;
  response_status: number | null;
  response_body: string | null;
  error_message: string | null;
  source: string;
  recorded_at: string;
};

async function recordN8nWebhookDebug({
  actorId,
  entityId,
  result,
}: {
  actorId?: string | null;
  entityId?: string | null;
  result: N8nWebhookDebugResult;
}) {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    actor_id: actorId ?? null,
    action: result.error_message ? "N8N_WEBHOOK_ERROR" : "N8N_WEBHOOK_ATTEMPT",
    entity_type: "n8n_webhook",
    entity_id: entityId ?? result.payload.ordernumber,
    diff: result,
  });

  if (error) {
    console.error("[n8n new-order-clean webhook] Debug log write failed", error.message);
  }
}

export async function postN8nOrderWebhook({
  payload,
  source,
  entityId,
  actorId,
}: {
  payload: N8nOrderWebhookPayload;
  source: string;
  entityId?: string | null;
  actorId?: string | null;
}): Promise<N8nWebhookDebugResult> {
  const result: N8nWebhookDebugResult = {
    webhook_attempted: false,
    url: N8N_NEW_ORDER_WEBHOOK_URL,
    payload,
    response_status: null,
    response_body: null,
    error_message: null,
    source,
    recorded_at: new Date().toISOString(),
  };

  try {
    result.webhook_attempted = true;
    console.log("[n8n new-order-clean webhook] webhook attempted", true);
    console.log("[n8n new-order-clean webhook] full URL used", result.url);
    console.log("FINAL N8N WEBHOOK PAYLOAD", payload);
    console.log("[n8n new-order-clean webhook] JSON payload", JSON.stringify(payload));

    const response = await fetch(result.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    result.response_status = response.status;
    result.response_body = await response.text();
  } catch (error) {
    result.error_message = error instanceof Error ? error.message : String(error);
  } finally {
    console.log("[n8n new-order-clean webhook] response status", result.response_status);
    console.log("[n8n new-order-clean webhook] response body", result.response_body ?? "");
    if (result.error_message) {
      console.error("[n8n new-order-clean webhook] error message", result.error_message);
    }
    await recordN8nWebhookDebug({ actorId, entityId, result });
  }

  return result;
}

export function createSampleN8nOrderPayload(): N8nOrderWebhookPayload {
  return {
    ordernumber: "TEST-1530",
    customername: "Test Customer",
    customeremail: "test@example.com",
    customerphone: "555-0100",
    products: [
      {
        name: "Test Product",
        quantity: 1,
      },
    ],
    ordertotal: 99,
    paymentmethod: "Bitcoin",
    paymentstatus: "pending",
    btcamountquoted: "0.00123456",
    btctxid: "sample-btc-txid",
    btcpaymentproofurl: "https://example.com/btc-proof.png",
    venmousername: "N/A",
    venmonotes: "N/A",
    venmopaymentproofurl: "N/A",
    fulfillmentstatus: "not_started",
    shippingaddress: {
      name: "Test Customer",
      address1: "123 Test Street",
      address2: null,
      city: "Test City",
      state: "CA",
      zip: "90210",
      country: "US",
    },
    timestamp: new Date().toISOString(),
  };
}
