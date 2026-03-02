

# Italicize All Mock Data

All data currently displayed comes from static files (`src/data/dashboard.ts` and `src/data/platforms.ts`) — none of it is wired to Supabase yet. The approach is to create a small utility wrapper component and apply italic styling to all mock/static values across the two active pages.

## Approach

1. **Create a `<MockData>` wrapper component** — a simple `<span className="italic opacity-80">` wrapper that visually marks any value as mock data. This makes it easy to later find and replace with real data (just search for `MockData` usage).

2. **Dashboard page (`src/pages/Dashboard.tsx`)** — Wrap all dynamic values in `MockData`:
   - Stat card values (7, 12, 64%, 24,847)
   - Identity dimension labels and percentages
   - Processing queue items and progress values
   - System status values (model name, DB, version, last updated)
   - Knowledge base stat values
   - Next steps list items
   - Platform grid data (names, statuses, percentages)

3. **Platforms page (`src/pages/Platforms.tsx`)** — Wrap mock values:
   - Platform count summary line
   - Platform card content (names, descriptions, statuses, insight percentages)
   - Detail panel content (description, data types, export instructions, analysis capabilities)

This is a lightweight visual change — just wrapping text in italic spans. When data gets wired to Supabase, you remove the `MockData` wrapper from each value.

