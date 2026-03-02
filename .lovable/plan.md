

# Identity Intelligence Platform — Implementation Plan

## Overview
A dark-themed, futuristic web dashboard for managing personal data exports from digital platforms, processing them through an analysis pipeline, and building a progressive identity profile. The app combines two UI prototypes from the uploaded files into a unified experience.

## Pages & Views

### 1. Dashboard (Home)
- **Identity Map** with stat cards: Platforms Connected, Data Sources Processed, Profile Completion %, Knowledge Vectors
- **Identity Dimensions** progress bars (Communication Style, Interest Genome, Values, Creative Patterns, etc.)
- **Quick platform grid** showing top 9 data sources with status indicators
- Right sidebar with system status, processing queue, and knowledge base stats

### 2. Platforms View
- **All 16 platforms** organized by category (Core, Social, Professional, Consumption, Behavioral, Creative, AI)
- Platform cards with icons, colors, status badges, and insight potential scores
- **Platform detail view** when clicked: description, export instructions, data types, analysis capabilities, and action buttons (Mark as Exporting → Upload → Process → Indexed)

### 3. Local Agent — Folder Access
- **Folder permission system**: suggested folders (Downloads, Documents, Dropbox, iMessage, etc.) with grant/revoke
- Custom path input for additional folders
- Active grants list with watch status and revoke buttons
- Security model display (Read-Only, Local-Only, Revocable)
- **Scan button** with animated progress bar

### 4. Local Agent — Discoveries
- List of auto-discovered data sources after scanning (Google Takeout, Instagram, Dropbox, ChatGPT, etc.)
- Each discovery shows: type, path, size, file count, confidence %, platform color
- Expandable details with "Process into Knowledge Base" action
- Summary bar with total files and processed count

### 5. Processing Pipeline
- **6-stage pipeline visualization**: Extract → Normalize → Analyze → Embed → Profile → Index
- Each stage with icon, label, and description
- **Live processing log terminal** with timestamped entries, color-coded by level (info, success, error)
- Animated progress through pipeline stages
- Technical architecture diagram (ASCII art)

### 6. Identity Profile
- User profile card with version number and source count
- **Core Identity Signals**, **Communication Fingerprint**, **Creative Patterns**, **Values (Behavioral)** sections
- Profile output formats: SOUL.md, USER.md, GENIUS_PROFILE.md, system_prompt.txt, RAG Context Package, JSON Knowledge Graph

### 7. Knowledge Base
- Stats grid: Vector Chunks, Platforms, Date Range, Dimensions
- **Query interface** with search input ("Ask anything about your data...")
- Identity Dimensions progress bars with dynamic values based on processed sources

### 8. Agent Configuration
- 4 agent types: Mirror, Creative, Strategic, Research
- Each with role description, detailed capabilities, and RAG source tags

### 9. MCP Integration
- 3 MCP server cards: identity-knowledge-base, identity-filesystem, identity-agents
- Each with tool list, status indicator, and description
- Claude Desktop and Claude Code configuration snippets
- Example conversation showing Claude using the knowledge base

## Design System
- **Dark theme**: Background `#030507`/`#040608`, cards `#080C14`, borders `#111827`
- **Fonts**: DM Sans (body), DM Mono (labels/code), Space Grotesk (headings)
- **Colors**: Blue `#3B82F6`, Purple `#8B5CF6`, Green `#10B981`, Amber `#D97706`, Pink `#EC4899`
- **Effects**: Subtle grid overlay, scanline animation, glow effects, slide-up transitions
- Custom scrollbar styling, gradient accents

## Architecture
- All data is mock/simulated (no backend needed for initial build)
- State management via React useState/useCallback
- React Router for page navigation
- Unified header with navigation tabs across all views

