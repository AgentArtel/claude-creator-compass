
-- ============================================
-- 1. ENUMS
-- ============================================
CREATE TYPE public.import_status AS ENUM ('pending', 'exporting', 'uploaded', 'processing', 'processed', 'failed');
CREATE TYPE public.platform_category AS ENUM ('core', 'social', 'professional', 'consumption', 'behavioral', 'creative', 'ai');
CREATE TYPE public.analysis_type AS ENUM ('sentiment', 'topics', 'temporal', 'behavioral', 'communication', 'interests');
CREATE TYPE public.dimension_type AS ENUM ('communication_style', 'interest_genome', 'values', 'cognitive_patterns', 'emotional_profile', 'social_dynamics', 'aesthetic_preferences', 'temporal_patterns');

-- ============================================
-- 2. PLATFORMS (static registry, no user_id)
-- ============================================
CREATE TABLE public.platforms (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category public.platform_category NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT 'hsl(0,0%,50%)',
  description TEXT,
  data_types JSONB NOT NULL DEFAULT '[]'::jsonb,
  export_instructions JSONB NOT NULL DEFAULT '[]'::jsonb,
  analysis_capabilities JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  insight_potential INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platforms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Platforms readable by authenticated" ON public.platforms FOR SELECT TO authenticated USING (true);

-- ============================================
-- 3. PLATFORM_IMPORTS
-- ============================================
CREATE TABLE public.platform_imports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform_id TEXT NOT NULL REFERENCES public.platforms(id),
  status public.import_status NOT NULL DEFAULT 'pending',
  file_path TEXT,
  file_size_bytes BIGINT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.platform_imports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own imports" ON public.platform_imports FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_imports_user_platform ON public.platform_imports(user_id, platform_id);
CREATE INDEX idx_imports_status ON public.platform_imports(status);

-- ============================================
-- 4. ANALYSIS_RESULTS
-- ============================================
CREATE TABLE public.analysis_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  import_id UUID NOT NULL REFERENCES public.platform_imports(id) ON DELETE CASCADE,
  analysis_type public.analysis_type NOT NULL,
  results JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence REAL NOT NULL DEFAULT 0,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.analysis_results ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own analysis" ON public.analysis_results FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users insert own analysis" ON public.analysis_results FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_analysis_user ON public.analysis_results(user_id);
CREATE INDEX idx_analysis_import ON public.analysis_results(import_id);

-- ============================================
-- 5. PROFILE_DIMENSIONS
-- ============================================
CREATE TABLE public.profile_dimensions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  dimension public.dimension_type NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  value JSONB NOT NULL DEFAULT '{}'::jsonb,
  confidence REAL NOT NULL DEFAULT 0,
  source_imports UUID[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, dimension, version)
);
ALTER TABLE public.profile_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own dimensions" ON public.profile_dimensions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_dimensions_user ON public.profile_dimensions(user_id);

-- ============================================
-- 6. KNOWLEDGE_CHUNKS
-- ============================================
CREATE TABLE public.knowledge_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  import_id UUID REFERENCES public.platform_imports(id) ON DELETE SET NULL,
  platform_id TEXT REFERENCES public.platforms(id),
  chunk_type TEXT NOT NULL DEFAULT 'text',
  content TEXT NOT NULL,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  token_count INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.knowledge_chunks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own chunks" ON public.knowledge_chunks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_chunks_user ON public.knowledge_chunks(user_id);
CREATE INDEX idx_chunks_platform ON public.knowledge_chunks(platform_id);

-- ============================================
-- 7. AGENT_CONFIGS
-- ============================================
CREATE TABLE public.agent_configs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  system_prompt TEXT NOT NULL DEFAULT '',
  personality JSONB NOT NULL DEFAULT '{}'::jsonb,
  rag_filter JSONB NOT NULL DEFAULT '{}'::jsonb,
  model_config JSONB NOT NULL DEFAULT '{"model":"gemini-3-flash-preview","temperature":0.7}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.agent_configs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own agents" ON public.agent_configs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_agents_user ON public.agent_configs(user_id);

-- ============================================
-- 8. UPDATED_AT TRIGGER FUNCTION
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_platform_imports_updated_at BEFORE UPDATE ON public.platform_imports FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_profile_dimensions_updated_at BEFORE UPDATE ON public.profile_dimensions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agent_configs_updated_at BEFORE UPDATE ON public.agent_configs FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================
-- 9. STORAGE BUCKET
-- ============================================
INSERT INTO storage.buckets (id, name, public) VALUES ('data-exports', 'data-exports', false);

CREATE POLICY "Users upload own exports" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'data-exports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users read own exports" ON storage.objects FOR SELECT TO authenticated USING (bucket_id = 'data-exports' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users delete own exports" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'data-exports' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================
-- 10. SEED PLATFORM DATA
-- ============================================
INSERT INTO public.platforms (id, name, category, icon, color, description, data_types, export_instructions, analysis_capabilities, insight_potential, config) VALUES
('google', 'Google Takeout', 'core', '🔍', 'hsl(217, 91%, 60%)', 'Search history, Gmail, Drive, YouTube, Maps, and more.', '["Search History","Email Metadata","Drive Files","Location History","YouTube Watch History"]', '["Go to takeout.google.com","Select data to include","Choose export format (JSON preferred)","Download when ready"]', '["Interest mapping","Communication patterns","Location insights","Content consumption"]', 95, '{"parser":"google_takeout","formats":["json","mbox"]}'),
('apple', 'Apple Privacy', 'core', '🍎', 'hsl(0, 0%, 70%)', 'iCloud, Health, Screen Time, and Apple ecosystem data.', '["Health Data","Screen Time","iCloud Drive","Messages","Photos Metadata"]', '["Go to privacy.apple.com","Request a copy of your data","Wait for processing","Download archives"]', '["Health patterns","Device usage","Communication style","Photo interests"]', 88, '{"parser":"apple_privacy","formats":["csv","json"]}'),
('twitter', 'Twitter/X', 'social', '𝕏', 'hsl(200, 100%, 50%)', 'Tweets, likes, bookmarks, DMs, and engagement data.', '["Tweets","Likes","Bookmarks","DMs","Following/Followers"]', '["Settings → Your Account → Download archive","Request archive","Wait for email","Download ZIP"]', '["Opinion mining","Interest graph","Communication style","Network analysis"]', 82, '{"parser":"twitter_archive","formats":["json"]}'),
('instagram', 'Instagram', 'social', '📸', 'hsl(330, 81%, 60%)', 'Posts, stories, reels, messages, and interaction data.', '["Posts","Stories","Reels","Messages","Saved Posts"]', '["Settings → Privacy → Download your data","Request download in JSON","Wait for email","Download"]', '["Visual preferences","Social patterns","Content creation style","Aesthetic profile"]', 75, '{"parser":"instagram_export","formats":["json"]}'),
('linkedin', 'LinkedIn', 'professional', '💼', 'hsl(210, 80%, 45%)', 'Profile, connections, messages, and professional activity.', '["Profile Data","Connections","Messages","Activity","Job Applications"]', '["Settings → Data Privacy → Get a copy","Select data categories","Request archive","Download from email"]', '["Career trajectory","Professional interests","Network topology","Skills mapping"]', 78, '{"parser":"linkedin_export","formats":["csv"]}'),
('spotify', 'Spotify', 'consumption', '🎵', 'hsl(141, 73%, 42%)', 'Listening history, playlists, saved tracks, and podcasts.', '["Streaming History","Playlists","Saved Library","Podcast History","Search Queries"]', '["Account → Privacy Settings → Download your data","Request extended history","Wait 5-30 days","Download JSON files"]', '["Mood patterns","Musical taste genome","Listening habits","Discovery patterns"]', 85, '{"parser":"spotify_export","formats":["json"]}'),
('notion', 'Notion', 'professional', '📝', 'hsl(0, 0%, 90%)', 'Notes, databases, wikis, and knowledge management.', '["Pages","Databases","Comments","Templates","Integrations"]', '["Settings → Export all workspace content","Choose Markdown & CSV","Include subpages","Download ZIP"]', '["Thinking patterns","Knowledge organization","Project management style","Writing analysis"]', 90, '{"parser":"notion_export","formats":["markdown","csv"]}'),
('github', 'GitHub', 'creative', '🐙', 'hsl(0, 0%, 80%)', 'Repositories, commits, issues, PRs, and contributions.', '["Repositories","Commits","Issues","Pull Requests","Stars","Gists"]', '["Settings → Account → Export account data","Or use GitHub API for specific data","Clone repositories locally","Download via takeout"]', '["Coding style","Technology preferences","Collaboration patterns","Project interests"]', 88, '{"parser":"github_export","formats":["json"]}'),
('reddit', 'Reddit', 'social', '🤖', 'hsl(16, 100%, 50%)', 'Posts, comments, saved items, upvotes, and subscriptions.', '["Posts","Comments","Saved","Upvoted","Subscriptions"]', '["Settings → Request your data","Or use old.reddit.com/prefs/data-request","Wait for processing","Download CSV/JSON"]', '["Interest communities","Opinion patterns","Knowledge domains","Engagement style"]', 80, '{"parser":"reddit_export","formats":["csv","json"]}'),
('chatgpt', 'ChatGPT', 'ai', '🧠', 'hsl(160, 84%, 39%)', 'All conversations, custom instructions, and interaction patterns.', '["Conversations","Custom Instructions","Shared Links","Feedback"]', '["Settings → Data Controls → Export data","Wait for email","Download ZIP","Contains conversations.json"]', '["Thinking patterns","Problem domains","Learning style","Question patterns"]', 96, '{"parser":"chatgpt_export","formats":["json"]}'),
('claude', 'Claude', 'ai', '🎭', 'hsl(36, 100%, 44%)', 'Conversations and interaction history with Claude.', '["Conversations","Projects","Artifacts","Preferences"]', '["Account Settings → Export Data","Request data export","Download when ready"]', '["Reasoning patterns","Creative interests","Technical depth","Communication style"]', 94, '{"parser":"claude_export","formats":["json"]}'),
('amazon', 'Amazon', 'consumption', '📦', 'hsl(36, 100%, 44%)', 'Order history, wishlists, reviews, and browsing data.', '["Orders","Wishlists","Reviews","Browsing History","Kindle Highlights"]', '["Request Your Data page","Select categories","Submit request","Download when available"]', '["Purchase patterns","Interest categories","Review style","Reading habits"]', 72, '{"parser":"amazon_export","formats":["csv","json"]}'),
('youtube', 'YouTube', 'consumption', '▶️', 'hsl(0, 100%, 50%)', 'Watch history, subscriptions, likes, and playlists.', '["Watch History","Subscriptions","Likes","Playlists","Comments"]', '["Included in Google Takeout","Select YouTube data","Choose JSON format","Download"]', '["Content preferences","Learning interests","Entertainment patterns","Creator network"]', 86, '{"parser":"youtube_takeout","formats":["json"]}'),
('dropbox', 'Dropbox', 'behavioral', '📁', 'hsl(217, 91%, 60%)', 'Files, shared folders, and collaboration data.', '["Files","Folders","Shared Links","Activity Log"]', '["Download files directly","Use Dropbox API for metadata","Export activity log"]', '["File organization","Collaboration patterns","Document types","Work habits"]', 65, '{"parser":"dropbox_export","formats":["json"]}'),
('slack', 'Slack', 'professional', '💬', 'hsl(283, 60%, 50%)', 'Messages, channels, reactions, and workspace data.', '["Messages","Channels","Reactions","Files","Bookmarks"]', '["Workspace Settings → Import/Export","Request workspace export","Download when ready"]', '["Communication style","Team dynamics","Topic interests","Responsiveness"]', 82, '{"parser":"slack_export","formats":["json"]}'),
('kindle', 'Kindle', 'consumption', '📚', 'hsl(36, 100%, 44%)', 'Reading highlights, notes, bookmarks, and reading progress.', '["Highlights","Notes","Bookmarks","Reading Progress","Library"]', '["Visit read.amazon.com/notebook","Export highlights per book","Or use Clippings.txt from device"]', '["Reading interests","Highlight patterns","Knowledge extraction","Learning style"]', 78, '{"parser":"kindle_export","formats":["txt","csv"]}'),
('netflix', 'Netflix', 'consumption', '🎬', 'hsl(0, 100%, 42%)', 'Viewing history, ratings, and preferences.', '["Viewing History","Ratings","My List","Profile Data"]', '["Account → Get My Info","Request data download","Wait for email","Download"]', '["Entertainment preferences","Viewing patterns","Genre interests","Binge patterns"]', 70, '{"parser":"netflix_export","formats":["csv"]}'),
('discord', 'Discord', 'social', '🎮', 'hsl(235, 86%, 65%)', 'Messages, servers, reactions, and community data.', '["Messages","Servers","Reactions","Voice Activity","Friends"]', '["Settings → Privacy → Request all of my Data","Wait for email","Download package"]', '["Community interests","Communication style","Gaming preferences","Social patterns"]', 76, '{"parser":"discord_export","formats":["json"]}');
