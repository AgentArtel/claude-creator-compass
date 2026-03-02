import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

export interface DashboardStats {
  platformsConnected: number;
  dataSourcesProcessed: number;
  profileCompletion: number;
  knowledgeVectors: number;
}

export interface KnowledgeBaseStats {
  vectorChunks: number;
  platforms: number;
  dateRange: string;
  dimensions: number;
}

export interface QueueItem {
  source: string;
  icon: string;
  status: string;
  progress: number;
}

async function fetchDashboardStats() {
  // Platforms connected: distinct platforms with a processed import
  const { count: platformsConnected } = await supabase
    .from("platform_imports")
    .select("platform_id", { count: "exact", head: false })
    .eq("status", "processed");

  // Deduplicate platform_ids client-side
  const { data: processedImports } = await supabase
    .from("platform_imports")
    .select("platform_id")
    .eq("status", "processed");

  const uniquePlatforms = new Set(processedImports?.map((r) => r.platform_id));

  // Sources processed
  const { count: sourcesProcessed } = await supabase
    .from("platform_imports")
    .select("*", { count: "exact", head: true })
    .eq("status", "processed");

  // Profile completion: how many of the 8 dimension types have data
  const { data: dims } = await supabase
    .from("profile_dimensions")
    .select("dimension");

  const uniqueDims = new Set(dims?.map((d) => d.dimension));
  const profileCompletion = Math.round((uniqueDims.size / 8) * 100);

  // Knowledge vectors
  const { count: knowledgeVectors } = await supabase
    .from("knowledge_chunks")
    .select("*", { count: "exact", head: true });

  // Knowledge base stats
  const { data: chunkDates } = await supabase
    .from("knowledge_chunks")
    .select("created_at, platform_id");

  const chunkPlatforms = new Set(chunkDates?.map((c) => c.platform_id).filter(Boolean));

  let dateRange = "No data yet";
  if (chunkDates && chunkDates.length > 0) {
    const dates = chunkDates.map((c) => new Date(c.created_at).getTime());
    const min = new Date(Math.min(...dates));
    const max = new Date(Math.max(...dates));
    dateRange = `${format(min, "MMM yyyy")} – ${format(max, "MMM yyyy")}`;
  }

  // Processing queue
  const { data: queueRows } = await supabase
    .from("platform_imports")
    .select("status, metadata, platform_id, platforms(name, icon)")
    .in("status", ["pending", "exporting", "uploaded", "processing"])
    .order("created_at", { ascending: true });

  const queue: QueueItem[] = (queueRows ?? []).map((row: any) => ({
    source: row.platforms?.name ?? "Unknown",
    icon: row.platforms?.icon ?? "📦",
    status: row.status,
    progress: row.status === "processing" ? 50 : row.status === "uploaded" ? 25 : row.status === "exporting" ? 10 : 0,
  }));

  return {
    stats: {
      platformsConnected: uniquePlatforms.size,
      dataSourcesProcessed: sourcesProcessed ?? 0,
      profileCompletion,
      knowledgeVectors: knowledgeVectors ?? 0,
    } as DashboardStats,
    knowledgeBase: {
      vectorChunks: knowledgeVectors ?? 0,
      platforms: chunkPlatforms.size,
      dateRange,
      dimensions: 1536,
    } as KnowledgeBaseStats,
    queue,
  };
}

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
  });
}
