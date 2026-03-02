

# Wire Dashboard Stats to Supabase

The four stat cards and the Knowledge Base panel currently read from `src/data/dashboard.ts`. All the data needed already exists in Supabase tables and the `usePlatforms` hook.

## What changes

### 1. Create `src/hooks/useDashboardStats.ts`
A React Query hook that fetches real counts from Supabase:
- **Platforms Connected**: count of platforms where user has at least one import with status `processed` -- derived from `platform_imports`
- **Sources Processed**: count of `platform_imports` with status `processed`
- **Profile Completion**: derived from `profile_dimensions` -- percentage of the 8 dimension types that have at least one row
- **Knowledge Vectors**: count from `knowledge_chunks` table

Also fetch **Knowledge Base** stats:
- `vectorChunks`: count of `knowledge_chunks`
- `platforms`: count of distinct `platform_id` in `knowledge_chunks`
- `dimensions`: hardcoded 1536 (embedding model constant, keep as-is)
- `dateRange`: min/max `created_at` from `knowledge_chunks`, formatted

And **Processing Queue**: query `platform_imports` where status is `processing` or `pending`/`exporting`/`uploaded`, join with `platforms` for name. Real queue, not mock.

### 2. Update `src/pages/Dashboard.tsx`
- Replace `identityStats` import with `useDashboardStats()` hook data
- Replace `processingQueue` import with real queue from the hook
- Replace `knowledgeBaseStats` import with real stats from the hook
- Remove `<MockData>` wrappers from all stat values that are now data-driven
- Keep `<MockData>` on Identity Dimensions (still from `profile_dimensions`, which maps to the mock `identityDimensions` array), System Status, and Next Steps since those remain static
- Show skeleton loading states while fetching

### 3. Clean up `src/data/dashboard.ts`
- Remove `identityStats`, `processingQueue`, and `knowledgeBaseStats` exports (now fetched live)
- Keep `identityDimensions` and `systemStatus` (still mock/static)

## Data sources

| Stat | Supabase query |
|------|---------------|
| Platforms Connected | `select count(distinct platform_id) from platform_imports where status = 'processed'` |
| Sources Processed | `select count(*) from platform_imports where status = 'processed'` |
| Profile Completion | `select count(distinct dimension) from profile_dimensions` / 8 * 100 |
| Knowledge Vectors | `select count(*) from knowledge_chunks` |
| Processing Queue | `select pi.*, p.name, p.icon from platform_imports pi join platforms p on pi.platform_id = p.id where pi.status in ('pending','exporting','uploaded','processing') order by pi.created_at` |

No database migrations needed -- all tables and RLS policies already exist.

## Files
- **New**: `src/hooks/useDashboardStats.ts`
- **Edit**: `src/pages/Dashboard.tsx`, `src/data/dashboard.ts`

