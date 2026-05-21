import React from 'react'
import {
  Body, Container, Head, Heading, Html, Preview, Section, Text, Hr,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'VERATIS'

interface OrderShippedProps {
  orderNumber?: string
  customerName?: string
  trackingNumber?: string
  carrier?: string
  trackingUrl?: string
  shippingAddress?: {
    name?: string
    address_1?: string
    address_2?: string | null
    city?: string
    state?: string
    zip?: string
    country?: string
  }
}

const carrierTrackingUrl = (carrier?: string, tracking?: string) => {
  if (!tracking) return undefined
  const c = (carrier ?? '').toLowerCase()
  if (c.includes('ups')) return `https://www.ups.com/track?tracknum=${tracking}`
  if (c.includes('fedex')) return `https://www.fedex.com/fedextrack/?trknbr=${tracking}`
  if (c.includes('usps')) return `https://tools.usps.com/go/TrackConfirmAction?tLabels=${tracking}`
  if (c.includes('dhl')) return `https://www.dhl.com/en/express/tracking.html?AWB=${tracking}`
  return undefined
}

const OrderShippedEmail = ({
  orderNumber = '1500',
  customerName,
  trackingNumber,
  carrier,
  trackingUrl,
  shippingAddress,
}: OrderShippedProps) => {
  const url = trackingUrl || carrierTrackingUrl(carrier, trackingNumber)
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Order {orderNumber} has shipped{trackingNumber ? ` — tracking ${trackingNumber}` : ''}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={eyebrow}>— {SITE_NAME}</Text>
          <Heading style={h1}>
            {customerName ? `${customerName}, your order is on its way.` : 'Your order is on its way.'}
          </Heading>
          <Text style={lead}>
            Order <strong>{orderNumber}</strong> has shipped, insured and temperature-controlled.
          </Text>

          <Section style={refBox}>
            <Text style={refLabel}>— Tracking number</Text>
            <Text style={refNumber}>{trackingNumber || '—'}</Text>
            {carrier ? <Text style={carrierStyle}>via {carrier}</Text> : null}
          </Section>

          {url ? (
            <Text style={bodyText}>
              Track your shipment: <a href={url} style={link}>{url}</a>
            </Text>
          ) : null}

          {shippingAddress && (
            <>
              <Hr style={hr} />
              <Text style={sectionLabel}>— Shipping to</Text>
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
          <Text style={footer}>
            Questions? Reply to this email, reach us at support@veratisbio.com, or contact us on Telegram{' '}
            <a href="https://t.me/veratisbio" style={link}>@veratisbio</a>.
          </Text>
          <Text style={footer}>— The {SITE_NAME} team</Text>
        </Container>
      </Body>
    </Html>
  )
}

export const template = {
  component: OrderShippedEmail,
  subject: (data: Record<string, any>) =>
    `Order ${data?.orderNumber ?? ''} shipped — VERATIS`,
  displayName: 'Order shipped',
  previewData: {
    orderNumber: '1502',
    customerName: 'Alex',
    trackingNumber: '1Z999AA10123456784',
    carrier: 'UPS',
    shippingAddress: {
      name: 'Alex Researcher',
      address_1: '1148 Mission St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94103',
      country: 'USA',
    },
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
  margin: '0 0 16px', textAlign: 'center' as const, backgroundColor: '#fafafa',
}
const refLabel = {
  fontSize: '10px', letterSpacing: '0.22em', textTransform: 'uppercase' as const,
  color: '#888', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 4px',
}
const refNumber = { fontSize: '18px', color: '#0a0a0a', margin: 0, letterSpacing: '0.04em' }
const carrierStyle = { fontSize: '12px', color: '#666', margin: '4px 0 0' }
const hr = { borderColor: '#e5e5e5', margin: '28px 0' }
const sectionLabel = {
  fontSize: '10.5px', letterSpacing: '0.22em', textTransform: 'uppercase' as const,
  color: '#666', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
  margin: '0 0 12px',
}
const bodyText = { fontSize: '14px', color: '#444', lineHeight: '1.6', margin: '0 0 14px' }
const addr = { fontSize: '13px', color: '#333', margin: '0 0 2px', lineHeight: '1.5' }
const link = { color: '#0a0a0a', textDecoration: 'underline' }
const footer = { fontSize: '12px', color: '#888', margin: '6px 0', lineHeight: '1.5' }
