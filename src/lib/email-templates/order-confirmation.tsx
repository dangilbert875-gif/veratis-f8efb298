import React from 'react'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'VERATIS'

interface OrderItem {
  name: string
  size?: string
  lot?: string
  quantity: number
  price: number
}

interface OrderConfirmationProps {
  orderNumber?: string
  customerName?: string
  items?: OrderItem[]
  subtotal?: number
  shipping?: number
  total?: number
  shippingAddress?: {
    name?: string
    address_1?: string
    address_2?: string | null
    city?: string
    state?: string
    zip?: string
    country?: string
  }
  orderUrl?: string
}

const fmt = (n?: number) =>
  typeof n === 'number' ? `$${n.toFixed(2)}` : '$0.00'

const OrderConfirmationEmail = ({
  orderNumber = '1500',
  customerName,
  items = [],
  subtotal = 0,
  shipping = 0,
  total = 0,
  shippingAddress,
  orderUrl,
}: OrderConfirmationProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order {orderNumber} received. awaiting payment verification</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>{SITE_NAME}</Text>
        <Heading style={h1}>
          {customerName ? `Thank you, ${customerName}.` : 'Thank you for your order.'}
        </Heading>
        <Text style={lead}>
          We've received your order and proof of payment. Our team will verify
          the Bitcoin transaction on-chain and dispatch your specimens within
          48 hours of confirmation.
        </Text>

        <Section style={refBox}>
          <Text style={refLabel}>Reference</Text>
          <Text style={refNumber}>{orderNumber}</Text>
        </Section>

        <Hr style={hr} />

        <Text style={sectionLabel}>Receipt</Text>
        {items.map((i, idx) => (
          <Section key={idx} style={itemRow}>
            <Text style={itemName}>{i.name}</Text>
            <Text style={itemMeta}>
              {i.size ? `${i.size} · ` : ''}
              {i.lot ? `Lot ${i.lot} · ` : ''}Qty {i.quantity}
            </Text>
            <Text style={itemPrice}>{fmt(Number(i.price) * Number(i.quantity))}</Text>
          </Section>
        ))}

        <Hr style={hrThin} />
        <Section style={totalsRow}>
          <Text style={totalLabel}>Subtotal</Text>
          <Text style={totalValue}>{fmt(subtotal)}</Text>
        </Section>
        <Section style={totalsRow}>
          <Text style={totalLabel}>Shipping · standard cold-chain</Text>
          <Text style={totalValue}>{shipping === 0 ? 'Free' : fmt(shipping)}</Text>
        </Section>
        <Hr style={hrThin} />
        <Section style={totalsRow}>
          <Text style={grandLabel}>Total · USD</Text>
          <Text style={grandValue}>{fmt(total)}</Text>
        </Section>

        {shippingAddress && (
          <>
            <Hr style={hr} />
            <Text style={sectionLabel}>Shipping to</Text>
            <Text style={addr}>{shippingAddress.name}</Text>
            <Text style={addr}>
              {shippingAddress.address_1}
              {shippingAddress.address_2 ? `, ${shippingAddress.address_2}` : ''}
            </Text>
            <Text style={addr}>
              {shippingAddress.city}, {shippingAddress.state} {shippingAddress.zip}
            </Text>
            <Text style={addr}>{shippingAddress.country}</Text>
          </>
        )}

        <Hr style={hr} />
        <Text style={sectionLabel}>What happens next</Text>
        <Text style={bodyText}>
          1. We confirm your Bitcoin transaction on-chain. typically within 1–3 hours.
        </Text>
        <Text style={bodyText}>
          2. Your specimens ship within 48 hours of confirmation, insured and
          temperature-controlled.
        </Text>
        <Text style={bodyText}>
          3. Tracking details will be emailed to you once your order is dispatched.
        </Text>

        {orderUrl && (
          <Text style={bodyText}>
            View your order status:{' '}
            <a href={orderUrl} style={link}>{orderUrl}</a>
          </Text>
        )}

        <Hr style={hr} />
        <Text style={footer}>
          Questions? Reply to this email, reach us at support@veratisbio.com, or contact us on Telegram{' '}
          <a href="https://t.me/veratisbio" style={link}>@veratisbio</a>.
        </Text>
        <Text style={footer}>The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderConfirmationEmail,
  subject: (data: Record<string, any>) =>
    `Order ${data?.orderNumber ?? ''} received. VERATIS`,
  displayName: 'Order confirmation',
  previewData: {
    orderNumber: '1502',
    customerName: 'Alex',
    items: [
      { name: 'Semaglutide', size: '5 mg', lot: 'V-2410', quantity: 2, price: 119 },
      { name: 'BPC-157', size: '10 mg', lot: 'V-2411', quantity: 1, price: 79 },
    ],
    subtotal: 317,
    shipping: 0,
    total: 317,
    shippingAddress: {
      name: 'Alex Researcher',
      address_1: '1148 Mission St',
      address_2: 'Suite 220',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      country: 'USA',
    },
    orderUrl: 'https://veratis.lovable.app/checkout/1502',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  color: '#1a1a1a',
}
const container = { maxWidth: '560px', padding: '40px 28px', margin: '0 auto' }
const eyebrow = {
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: '#888',
  margin: '0 0 16px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}
const h1 = {
  fontSize: '22px',
  fontWeight: 500,
  color: '#0a0a0a',
  margin: '0 0 16px',
  letterSpacing: '-0.01em',
}
const lead = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 24px' }
const refBox = {
  border: '1px solid #e5e5e5',
  borderRadius: '3px',
  padding: '14px 18px',
  margin: '0 0 8px',
  textAlign: 'center' as const,
  backgroundColor: '#fafafa',
}
const refLabel = {
  fontSize: '10px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: '#888',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 4px',
}
const refNumber = { fontSize: '18px', color: '#0a0a0a', margin: 0, letterSpacing: '0.04em' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0' }
const hrThin = { borderColor: '#eee', margin: '14px 0' }
const sectionLabel = {
  fontSize: '10.5px',
  letterSpacing: '0.22em',
  textTransform: 'uppercase' as const,
  color: '#666',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 12px',
}
const itemRow = { margin: '0 0 12px' }
const itemName = { fontSize: '13.5px', color: '#1a1a1a', margin: '0 0 2px' }
const itemMeta = {
  fontSize: '11px',
  letterSpacing: '0.14em',
  textTransform: 'uppercase' as const,
  color: '#888',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 2px',
}
const itemPrice = { fontSize: '13.5px', color: '#1a1a1a', margin: 0 }
const totalsRow = { margin: '6px 0', display: 'flex', justifyContent: 'space-between' as const }
const totalLabel = { fontSize: '13px', color: '#555', margin: 0 }
const totalValue = { fontSize: '13px', color: '#1a1a1a', margin: 0 }
const grandLabel = {
  fontSize: '11px',
  letterSpacing: '0.18em',
  textTransform: 'uppercase' as const,
  color: '#0a0a0a',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: 0,
}
const grandValue = { fontSize: '16px', color: '#0a0a0a', margin: 0 }
const addr = { fontSize: '13px', color: '#444', margin: '0 0 2px', lineHeight: '1.5' }
const bodyText = { fontSize: '13px', color: '#444', lineHeight: '1.6', margin: '0 0 10px' }
const link = { color: '#0a0a0a', textDecoration: 'underline' }
const footer = { fontSize: '11px', color: '#999', margin: '4px 0' }