# Phase 2.5 — Operational UX & Workflow

Scope is 17 sections — too large to land in one safe pass without regressions. Proposing **4 sub-phases**, each independently shippable, preserving the existing VERATIS monochrome aesthetic. No public storefront changes.

## Sub-phase A — Shell & Foundation (ship first)

1. **Admin shell upgrade** (`src/routes/admin.tsx`)
   - Persistent top bar with global command bar trigger (⌘K).
   - Subtle status token system added to `src/styles.css`: `--state-success`, `--state-warning`, `--state-danger`, `--state-archived` (all muted/desaturated).
2. **Global Command Bar** (§1)
   - `cmdk` palette; fuzzy search over products, orders, customers, articles, lots, affiliates, research partners.
   - Quick actions: new product, upload COA, publish article, create affiliate, create customer note, create order.
   - Recent searches + recently viewed (localStorage).
3. **Dashboard prioritization + Quick Actions + Alerts** (§2, §13, §14)
   - Reorder dashboard: Orders → Verification/COAs → Inventory → Customers → secondary.
   - Quick-action row at top.
   - Alerts strip: low inventory, expired lots, pending payouts, failed uploads.
4. **Improved empty states** (§5) across all existing panels.

## Sub-phase B — Activity, Audit, Relationships

5. **Operational activity feed** (§3) — reads `audit_logs` + `verification_logs` + `article_views`, filterable.
6. **Audit log viewer** (§15) — dedicated panel with before/after diff (already captured by `log_audit_change`).
7. **Relational linking** (§6) — show linked entities on product/customer/article/COA detail drawers; all clickable.
8. **Internal notes** (§8) — new `internal_notes` table (polymorphic: entity_type + entity_id), with pinning + markdown.

## Sub-phase C — Tables, Bulk, Exports

9. **Table UX** (§12) — reusable `<DataTable>` with pagination, sticky headers, sorting, inline search, page size; applied to products/orders/customers/articles/lots.
10. **Bulk actions** (§7) — checkbox selection + bulk publish/archive/tag/ship/export.
11. **CSV/JSON exports + backup history** (§11) — server function streaming exports; `export_history` table.

## Sub-phase D — Roles, Media, Polish

12. **Expanded admin roles** (§10) — extend `app_role` enum: `super_admin`, `operations`, `fulfillment`, `editor`, `affiliate_manager`, `research_manager`. Role-permission matrix + management UI. Existing `admin` maps to `super_admin`.
13. **Centralized media library** (§9) — unified browser over `product-images`, `article-images`, `coa-pdfs`, `chromatograms`, `raw-lab-data` with tagging table.
14. **Performance polish** (§16) — skeletons, optimistic updates via TanStack Query, debounced search.

## Technical notes

- New tables (Sub-phase B/C/D):
  - `internal_notes(id, entity_type, entity_id, author_id, body_md, pinned, created_at, updated_at)`
  - `export_history(id, kind, format, generated_by, row_count, file_path, created_at)`
  - `media_tags(asset_path, bucket, tags[], uploaded_by, created_at)`
- Enum extension for roles requires careful migration (Postgres `ALTER TYPE ... ADD VALUE`, non-transactional).
- Activity feed driven entirely by existing `audit_logs` — no schema change needed.
- All new UI components reuse `src/components/admin/ui.tsx` primitives.

## What I will NOT do

- Touch public storefront, marketing pages, branding.
- Add bright SaaS colors, charts, or animations beyond subtle transitions.
- Introduce dashboards-with-graphs aesthetic.

## Recommended execution order

Ship **Sub-phase A** now (shell + command bar + dashboard reorg + alerts + empty states). This is the highest leverage and unblocks everything else visually. After your approval of A, I continue with B, C, D in sequence.

Reply **"proceed with A"** (or specify a different sub-phase / subset) to start.
