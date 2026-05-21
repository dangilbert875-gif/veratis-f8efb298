import React from 'react'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'VERATIS'

interface OrderCancelledProps {
  orderNumber?: string
  customerName?: string
  reason?: string
}

const OrderCancelledEmail = ({
  orderNumber = '1500',
  customerName,
  reason,
}: OrderCancelledProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Order {orderNumber} has been cancelled</Preview>
    <Body style={main}>
      <Container style={container}>
        <Text style={eyebrow}>— {SITE_NAME}</Text>
        <Heading style={h1}>
          {customerName ? `${customerName}, your order has been cancelled.` : 'Your order has been cancelled.'}
        </Heading>
        <Text style={lead}>
          Order <strong>{orderNumber}</strong> has been cancelled. If a payment
          was received, it will be refunded to the originating wallet.
        </Text>

        <Section style={refBox}>
          <Text style={refLabel}>— Reference</Text>
          <Text style={refNumber}>{orderNumber}</Text>
        </Section>

        {reason ? (
          <>
            <Hr style={hr} />
            <Text style={sectionLabel}>— Reason</Text>
            <Text style={bodyText}>{reason}</Text>
          </>
        ) : null}

        <Hr style={hr} />
        <Text style={bodyText}>
          If this was unexpected, or you'd like to place a new order, reply to
          this email and our team will assist you directly.
        </Text>

        <Hr style={hr} />
        <Text style={footer}>
          Questions? Reply to this email, reach us at support@veratisbio.com, or contact us on Telegram{' '}
          <a href="https://t.me/veratisbio" style={link}>@veratisbio</a>.
        </Text>
        <Text style={footer}>— The {SITE_NAME} team</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: OrderCancelledEmail,
  subject: (data: Record<string, any>) =>
    `Order ${data?.orderNumber ?? ''} cancelled — VERATIS`,
  displayName: 'Order cancelled',
  previewData: {
    orderNumber: '1502',
    customerName: 'Alex',
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Arial, sans-serif',
  color: '#1a1a1a',
}
const container = { maxWidth: '560px', padding: '40px 28px', margin: '0 auto' }
const eyebrow = {
  fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase' as const,
  color: '#888', margin: '0 0 16px',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
}
const h1 = { fontSize: '22px', fontWeight: 500, color: '#0a0a0a', margin: '0 0 16px', letterSpacing: '-0.01em' }
const lead = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 24px' }
const refBox = {
  border: '1px solid #e5e5e5', borderRadius: '3px', padding: '14px 18px',
  margin: '0 0 8px', textAlign: 'center' as const, backgroundColor: '#fafafa',
}
const refLabel = {
  fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase' as const,
  color: '#888', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 4px',
}
const refNumber = { fontSize: '18px', color: '#0a0a0a', margin: 0, letterSpacing: '0.04em' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0' }
const sectionLabel = {
  fontSize: '10.5px', letterSpacing: '0.22em', textTransform: 'uppercase' as const,
  color: '#666', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 12px',
}
const bodyText = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 14px' }
const footer = { fontSize: '12px', color: '#888', margin: '6px 0', lineHeight: '1.5' }
const link = { color: '#0a0a0a', textDecoration: 'underline' }
