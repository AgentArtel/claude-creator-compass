

# Wire Platforms Page to Supabase

## What Changes

1. **Create `src/hooks/usePlatforms.ts`** — A React Query hook that fetches from the `platforms` table via `supabase.from('platforms').select('*')`. Maps the DB row shape (snake_case JSONB fields like `data_types`, `export_instructions`, `analysis_capabilities`, `insight_potential`) to the frontend `Platform` type. Also fetches the user's `platform_imports` to determine per-platform status.

2. **Update `src/pages/Platforms.tsx`** — Replace `import { platforms } from "@/data/platforms"` with the `usePlatforms` hook. Show a loading skeleton while fetching. Remove `MockData` wrappers from platform data (it's now real). Keep the `statusSteps` and `advanceStatus` logic but wire it to update `platform_imports` in Supabase instead of local state.

3. **Update `src/pages/Dashboard.tsx`** — Replace `import { platforms } from "@/data/platforms"` with the same hook for the "Data Sources" grid section. Remove `MockData` wrappers from platform-sourced values.

4. **Update `src/data/platforms.ts`** — Keep only the type definitions (`Platform`, `PlatformStatus`, `statusLabels`, `statusColors`, `platformCategories`) and remove the hardcoded `platforms` array. The DB `platform_category` enum uses lowercase (`core`, `social`, etc.) so the category filter labels will map from lowercase DB values to display labels.

## Key Mapping (DB → Frontend)

- `data_types` (JSONB array) → `dataTypes: string[]`
- `export_instructions` (JSONB array) → `exportInstructions: string[]`
- `analysis_capabilities` (JSONB array) → `analysisCapabilities: string[]`
- `insight_potential` (int) → `insightPotential: number`
- `category` (enum, lowercase) → displayed with capitalize
- Status comes from `platform_imports` table (latest import per platform), defaulting to `'not_started'` if no import exists

## Files

- **New**: `src/hooks/usePlatforms.ts`
- **Edit**: `src/pages/Platforms.tsx`, `src/pages/Dashboard.tsx`, `src/data/platforms.ts`

