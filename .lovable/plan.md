## Veratis Operations Console — Refinement Plan

This is a large change touching the overview, quick actions, header, orders panel, order detail, plus two brand-new pages. To keep each step verifiable, I'll ship it in 4 phases. After each phase the console remains fully usable.

---

### Phase 1 — Overview + Quick Actions + ⌘K hint

**Files:** `OverviewPanel.tsx`, `QuickActions.tsx`, `AdminDashboard.tsx`, `admin.functions.ts` (extend `getAdminOverview`)

- Add global time-scope toggle: `Today / 7d / 30d / All time`. Passed to overview server fn; recomputes revenue, orders, new customers for the chosen window.
- Reorder hero into three rows:
  - **Row 1 — Action required** (large, clickable → orders panel pre-filtered): Orders to Ship, Awaiting Payment, Flagged, Active Alerts (count).
  - **Row 2 — Time-scoped**: Revenue, Orders, New Customers (scope toggle applies).
  - **Row 3 — Inventory health**: Low-stock SKUs, Lots expiring ≤30d, COAs pending upload. Each navigates to inventory / coa panels.
- Rewrite `QuickActions`:
  - **Fulfillment row**: Print Today's Labels (badge = today's unshipped paid count), Today's Picking List (same count, navigates to new page), Mark Batch Shipped (opens bulk modal), Process Refunds (badge = refund-requested count).
  - **Inventory row**: Upload COA (badge = pending), Add New Lot, Adjust Stock.
  - **Admin row** (collapsed under "Show admin actions"): existing 6 creator actions.
- `AdminDashboard` header: add `⌘K to search` muted mono pill on all pages (currently only on overview as wide search). Keep existing search input on desktop; show compact `⌘K` chip on smaller widths and for non-overview sections.

---

### Phase 2 — Orders table upgrade

**Files:** `OrdersPanel.tsx` (substantial rewrite), `admin.functions.ts` (extend `listOrders` with search/pagination/sort/filter; add `getCustomerLifetime`).

- Stat cards become clickable filter chips; active filter renders as chip with `[×]` above table.
- Search bar (order #, customer name, email) + Filter button opening side panel (payment multi, fulfillment multi, date range, country, product, flagged only, >$500 only).
- Columns: `☐  Order#  Date(rel)  Customer  Items(chip+hover)  Total  Payment  Fulfillment  Country(flag)  Actions(hover)`. Sortable column headers, default Date desc.
- Row-hover action cluster: View · Mark Paid · Print Label · `⋯` menu.
- Pagination: prev/next + page-size (25/50/100).
- Sticky bulk-action bar when ≥1 row checked: Mark Paid · Mark Shipped · Print Labels · Print Packing Slips · Export CSV · Cancel · `×`.

---

### Phase 3 — Order detail rebuild

**File:** `OrdersPanel.tsx` detail subview (or split into `OrderDetail.tsx`).

- Three-column desktop layout (40 / 35 / 25), single-column mobile.
- **LEFT**: Order summary, **new Line Items table** with per-line Lot dropdown (writes to `order_items.lot_number`), subtotal/shipping/tax/total, status action buttons (Mark Paid, Mark Shipped). Remove redundant status dropdowns — action buttons only.
- **CENTER**: Customer (name clickable → side panel with lifetime stats from new `getCustomerLifetime` fn), Shipping, Billing. Email shows explicit copy icon (replaces underline).
- **RIGHT**: Vertical timeline (placed → payment → fulfillment → delivery, ● complete / ○ pending), Internal Notes (reuse existing `InternalNotes`), Flag strip (first-time, international, ship≠bill, >$500, flagged).
- Top-right actions: Print Packing Slip, Print Shipping Label, explicit More dropdown (Duplicate, Resend confirmation, Add to do-not-ship, Export PDF, Archive).
- Toast feedback on all mutations; undo toast for destructive actions (cancel/refund) within 6s.
- "Last updated" timestamp under order header.

---

### Phase 4 — New pages + small UX

**New files:** `panels/PickingListPanel.tsx`, `panels/InventoryPanel.tsx`. **Edited:** `AdminDashboard.tsx` (nav entries), `admin.functions.ts` (`getPickingList`, `getLotInventory`).

- **Picking List** (`Console → Picking list`, also linked from Quick Actions): aggregates today's unshipped paid orders into SKU → total qty → lots required table. Print Picking List / All Labels / All Packing Slips buttons. Below: per-order checklist (Packed → Shipped progression, persists via `patchOrder`).
- **Inventory** (`Operations → Inventory`): lot table — Lot, SKU, Stock, Status (Active / LOW / OUT, color dot), COA (Live / Missing). Low-stock threshold editable inline (writes to `products.low_stock_threshold`). Out-of-stock auto-toggles `products.stock_status='out_of_stock'`.
- Keyboard shortcut hints in order detail (`P` = mark paid, `S` = mark shipped, `L` = print label) shown as muted kbd hints.

---

### Notes on scope & constraints

- Preserves serif headers, mono labels, monochrome palette; accents only for status (amber/green/red/blue dots and pills).
- No gradients, shadows, or skeuomorphism.
- Print actions in Phase 1–4 are wired to a `window.print()` route variant — actual label PDF generation is out of scope and can be a follow-up; buttons trigger placeholder print views that render the appropriate document.
- Customer history side panel surfaces aggregate stats only (no new PII exposure).
- All server-side reads continue to use `requireSupabaseAuth` + `assertAdmin`.

---

### Out of scope for this pass

- Real shipping-carrier API integration (label PDF generation stays as printable HTML view).
- Fixing the unrelated security-scan findings shown in the Security view (payment-proofs bucket, public BTC wallet read, checkout order PII enumeration, etc.) — happy to do those next; flag if you want them folded in.
- Migrating order/lot data; uses existing schema.

Ship Phase 1 first, then I'll proceed through 2 → 4 unless you want to reorder.
