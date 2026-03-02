

# Phase 1: Build DB-Backed Pages (Profile, Knowledge, Agents)

These three pages have existing Supabase tables with RLS policies. No migrations needed.

## 1. Profile Page (`src/pages/Profile.tsx`)

**Data source**: `profile_dimensions` table (8 dimension types: communication_style, interest_genome, values, cognitive_patterns, emotional_profile, social_dynamics, aesthetic_preferences, temporal_patterns)

**UI**:
- Header with "Identity Profile" title and profile completion percentage
- Grid of 8 dimension cards, each showing: dimension name, confidence score bar, version number, last updated timestamp
- Click a card to expand and see the `value` JSONB content rendered as key-value pairs
- Export section with buttons for SOUL.md, USER.md, GENIUS_PROFILE.md (generate markdown from dimension data, download as files)
- Empty state when no dimensions exist yet ("No profile data yet. Process platform data to build your identity profile.")

**Hook**: `src/hooks/useProfileDimensions.ts` — fetches from `profile_dimensions` with React Query

## 2. Knowledge Page (`src/pages/Knowledge.tsx`)

**Data source**: `knowledge_chunks` table

**UI**:
- Header with "Knowledge Base" title and vector count
- Search input ("Ask anything about your data...") that filters chunks by content text match
- Stats bar: total chunks, unique platforms, total tokens, date range
- Chunk browser: scrollable list of knowledge chunks showing content preview (truncated), platform source, chunk type, token count, created date
- Filter by platform_id and chunk_type
- Empty state when no chunks exist

**Hook**: `src/hooks/useKnowledgeBase.ts` — fetches chunks with pagination (50 per page), search, and filters

## 3. Agents Page (`src/pages/Agents.tsx`)

**Data source**: `agent_configs` table

**UI**:
- Header with "Agents" title and count
- Grid of agent config cards showing: name, description, model config (model name, temperature), active/inactive toggle, personality summary
- Click card to open detail panel (similar to Platforms detail pattern) showing: full system prompt in a code block, RAG filter config, personality JSONB rendered, prompt preview section
- "New Agent" button opening a form dialog to create an agent config (name, description, system prompt, model selection)
- Toggle agent active/inactive via switch (updates `is_active` in Supabase)

**Hook**: `src/hooks/useAgents.ts` — CRUD operations on `agent_configs`

## 4. Wire Routes in App.tsx

- Import the 3 new pages
- Add routes: `/profile`, `/knowledge`, `/agents`
- Remove `disabled: true` from those 3 nav items in Layout.tsx

## Files

- **New**: `src/pages/Profile.tsx`, `src/pages/Knowledge.tsx`, `src/pages/Agents.tsx`, `src/hooks/useProfileDimensions.ts`, `src/hooks/useKnowledgeBase.ts`, `src/hooks/useAgents.ts`
- **Edit**: `src/App.tsx` (add routes), `src/components/Layout.tsx` (enable nav items)

