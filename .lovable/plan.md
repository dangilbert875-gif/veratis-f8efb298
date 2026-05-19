# VERATIS Admin Control Panel — Build Plan

This is a large, multi-phase build. Implementing all 13 sections in one shot would produce thousands of lines across 40+ files and likely break the existing admin in transit. I'll deliver in 5 sequential phases — each shippable, each leaves `/admin` working — and confirm with you before moving to the next.

## Aesthetic guardrails (apply to every phase)
- Reuse existing `src/components/admin/ui.tsx` primitives, the current sidebar, mono palette, hairline borders, restrained type.
- No new dashboard chart libraries with default styles — use minimal SVG/CSS for sparklines and bars.
- No emoji, no gradients, no colored status pills beyond the existing muted variants.
- All toasts via existing `sonner`.

---

## Phase 1 — Schema, storage, RLS foundation (backend only)

One migration adding everything later phases need, so we don't migrate twice.

Tables added/extended (all with `created_at`, `updated_at`, `archived_at`, `created_by`):
- `products`: add `short_description`, `full_description`, `molecular_class`, `storage_guidance`, `lyophilized`, `featured_image`, `gallery_images jsonb`, `compare_at_price`, `inventory_count`, `low_stock_threshold`, `tags text[]`, `seo_title`, `seo_description`, `meta_keywords`, `status` (draft/published/archived/out_of_stock), `sort_order`, `related_product_ids uuid[]`, `related_article_ids uuid[]`.
- `product_lots`: add `identity_method`, `lab_partner`, `lcms_url`, `hplc_url`, `raw_data jsonb`, `notes`, `active boolean`.
- `educational_articles`: add `author`, `publish_at`, `tags text[]`, `peptide_tags text[]`, `citations jsonb`, `related_product_ids uuid[]`, `related_article_ids uuid[]`, `external_links jsonb`, `view_count`, `status` (draft/published/archived).
- `orders`: add `transaction_hash`, `risk_flag`, `internal_notes`, `invoice_number`. Extend status enum (`pending|awaiting_payment|paid|packed|shipped|delivered|refunded|cancelled`).
- `customers_meta` (new, FK profiles.id): `tags text[]`, `state` (active/vip/research_partner/suspended/flagged), `admin_notes`, `total_spend`, `last_order_at`, `referral_source`.
- `research_partners` (new): institution, category, status (applied/approved/rejected/suspended), nda_accepted_at, verification_docs jsonb, pricing_tier, account_manager_id, notes.
- `affiliates`: add `payout_address`, `payout_preference`, `status`, `pending_payout`, `paid_payout_total`, `clicks`, `conversions`.
- `referral_clicks` (new): affiliate_id, ip_hash, referrer, landed_at, converted_order_id.
- `audit_logs` (new): actor_id, action, entity_type, entity_id, diff jsonb, ip.
- `article_views` (new, append-only): article_id, viewed_at, ip_hash.
- `verification_logs` already exists — reuse.

Storage buckets (private + admin RLS, signed URLs for COA PDFs; public for product/article images):
- `product-images` (public)
- `article-images` (public)
- `coa-pdfs` (private)
- `chromatograms` (private)
- `raw-lab-data` (private)

RLS pattern: public read on `products`/`product_lots`/`educational_articles` filtered by `status='published'`; everything else admin-write via `has_role(auth.uid(),'admin')`. Customer/affiliate self-read where applicable.

Triggers: `touch_updated_at` on every new table; soft-delete helper `archive_row(table, id)`; `audit_log_change` trigger on products, orders, articles, lots.

## Phase 2 — Products & COA/Verification

- Rewrite `ProductsPanel` with: searchable table, status filter, drag-sort (`@dnd-kit/sortable`), inline visibility/featured toggles, duplicate action, bulk archive.
- New `ProductEditor` drawer (full schema) with image upload to `product-images`, gallery manager, lot picker, related-product/article pickers.
- Rewrite `CoaUploadsPanel`: COA upload (PDF → `coa-pdfs`), chromatogram upload, lot editor with all new fields, active/inactive toggle, search, recent verification activity feed (from `verification_logs`).
- Public `/verify/[lot]` page renders dynamically from `product_lots` (uses existing route — wire to DB).

## Phase 3 — Education CMS & Orders

- `ArticlesPanel`: list with status filter, draft/scheduled/published tabs.
- `ArticleEditor`: title/slug/author, markdown body (`@uiw/react-md-editor` with theme override to match aesthetic), featured image upload, scheduled `publish_at`, tags, citations editor (repeating rows), related products/articles, SEO fields, analytics readout (views, top referrers).
- `OrdersPanel`: list with state filter, search by order#/email/tx hash, detail drawer with status timeline, tracking#, internal notes, risk flag, manual state transitions, invoice generation (HTML → print PDF), refund action.
- Dashboard metrics block (revenue, AOV, pending count, refund rate).

## Phase 4 — Affiliates, Customers, Research Partners

- `PartnersPanel` (affiliates): list, code editor, commission %, payout address, status toggle, click/conversion counters, leaderboard view.
- `PayoutsPanel`: pending/paid tabs, mark-paid action with tx hash.
- `ReferralsPanel`: per-code analytics (clicks, conversions, revenue, conversion rate sparkline).
- `CustomersPanel`: profile drawer (orders, total spend, tags, notes, state, affiliate link, risk indicators).
- New `ResearchPartnersPanel`: application queue → approve/reject, pricing tier assignment, NDA tracking, partner profile with docs.

## Phase 5 — Overview analytics, audit log, admin UX polish

- `OverviewPanel`: live metrics (revenue 7/30d, orders, conversions, top products, inventory alerts, recent verifications) with minimal sparklines.
- `ArchivePanel` → audit log viewer (filter by actor/entity/action).
- Global admin search (`⌘K`) across products, orders, articles, customers.
- Bulk actions, pagination, confirmation modals via existing `AlertDialog`, mobile breakpoint pass on every panel.

---

## Technical notes
- All admin data fetching via `createServerFn` + `requireSupabaseAuth` (no admin client in components).
- File uploads go through signed-upload server fns for private buckets, direct from client for public buckets.
- Drag-sort uses one new dep: `@dnd-kit/core` + `@dnd-kit/sortable`.
- Markdown editor: `@uiw/react-md-editor` (lightweight, themable).
- No new chart library — hand-rolled SVG sparklines/bars to stay on-aesthetic.
- Audit log written via DB trigger so it can't be bypassed from app code.

## What I need from you before starting
1. **Confirm phased delivery** (5 phases, each shippable) vs. all-at-once. Phased is strongly recommended — single-shot will produce a thousand-line patch I can't verify properly.
2. **Markdown editor approval**: OK with `@uiw/react-md-editor`, or do you prefer a pure-textarea approach with a tiny custom toolbar?
3. **Storage privacy**: COAs as private (signed URLs, 1h expiry) or public (anyone with the URL can view)? Verification page works either way; private is more controlled.
4. **Audit logging scope**: log every admin write (recommended), or only sensitive ops (orders, payouts, role changes)?

Reply with answers (or just "proceed with defaults") and I'll start Phase 1.
