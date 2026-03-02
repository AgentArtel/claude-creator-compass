

# Database & Architecture Setup

Based on the Claude Code architecture document, here's the plan to set up the Supabase database schema and supporting infrastructure.

## Database Schema (Supabase Migration)

Create the following tables, adapted from the architecture spec for Supabase (using `auth.users` references instead of a custom users table):

1. **`platforms`** — Static platform registry (google, meta, spotify, etc.) with config JSONB for export instructions and parser configs
2. **`platform_imports`** — Tracks each data export upload per user: status workflow (pending → exporting → uploaded → processing → processed → failed), file paths, metadata
3. **`analysis_results`** — NLP analysis outputs per import (sentiment, topics, temporal, behavioral) with confidence scores
4. **`profile_dimensions`** — Progressive identity profile dimensions (communication_style, interest_genome, values, etc.) versioned per user
5. **`knowledge_chunks`** — Pre-embedding document chunks with platform, type, content, and metadata for RAG retrieval
6. **`agent_configs`** — User-configured AI agents with system prompts, RAG filters, and personality config

All user-facing tables will reference `auth.users(id)` and have RLS policies scoped to the authenticated user.

## RLS Policies

Each table gets a policy allowing authenticated users to read/write only their own rows (`auth.uid() = user_id`). The `platforms` table is read-only for all authenticated users (reference data).

## Seed Data

Insert all 18 platform definitions (Google, Apple, Meta, Instagram, Twitter, LinkedIn, Spotify, Claude AI, ChatGPT, Financial, Health, Dropbox, Browser, Reddit, Amazon, Netflix, GitHub, Discord) with their categories and config JSON.

## Storage Bucket

Create a `data-exports` storage bucket for raw export file uploads, with RLS policies so users can only access their own uploads.

## What This Enables

- The frontend can track platform import statuses in real-time via Supabase subscriptions
- File uploads go to Supabase Storage
- Analysis results and profile dimensions persist across sessions
- Knowledge chunks are ready for future vector/RAG integration
- Agent configs are stored per user

## Files Modified

- **New migration**: Creates all 6 tables, RLS policies, indexes, and seed data
- **New migration**: Creates storage bucket with policies
- **`src/integrations/supabase/types.ts`**: Auto-updated after migration

