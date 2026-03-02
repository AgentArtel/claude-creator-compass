import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type KnowledgeChunk = Tables<"knowledge_chunks">;

export function useKnowledgeChunks({
  search = "",
  platformFilter = "",
  chunkTypeFilter = "",
  page = 0,
  pageSize = 50,
}: {
  search?: string;
  platformFilter?: string;
  chunkTypeFilter?: string;
  page?: number;
  pageSize?: number;
} = {}) {
  return useQuery({
    queryKey: ["knowledge_chunks", search, platformFilter, chunkTypeFilter, page, pageSize],
    queryFn: async () => {
      let query = supabase
        .from("knowledge_chunks")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .range(page * pageSize, (page + 1) * pageSize - 1);

      if (search) query = query.ilike("content", `%${search}%`);
      if (platformFilter) query = query.eq("platform_id", platformFilter);
      if (chunkTypeFilter) query = query.eq("chunk_type", chunkTypeFilter);

      const { data, error, count } = await query;
      if (error) throw error;
      return { chunks: data as KnowledgeChunk[], total: count ?? 0 };
    },
  });
}

export function useKnowledgeStats() {
  return useQuery({
    queryKey: ["knowledge_stats"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("knowledge_chunks")
        .select("platform_id, token_count, created_at, chunk_type");

      if (error) throw error;

      const totalChunks = data.length;
      const uniquePlatforms = new Set(data.map((c) => c.platform_id).filter(Boolean)).size;
      const totalTokens = data.reduce((sum, c) => sum + (c.token_count ?? 0), 0);

      let dateRange = "No data";
      if (data.length > 0) {
        const dates = data.map((c) => new Date(c.created_at).getTime());
        const min = new Date(Math.min(...dates));
        const max = new Date(Math.max(...dates));
        dateRange = `${min.toLocaleDateString("en-US", { month: "short", year: "numeric" })} – ${max.toLocaleDateString("en-US", { month: "short", year: "numeric" })}`;
      }

      // Get distinct chunk types for filter
      const chunkTypes = [...new Set(data.map((c) => c.chunk_type))];
      const platformIds = [...new Set(data.map((c) => c.platform_id).filter(Boolean))];

      return { totalChunks, uniquePlatforms, totalTokens, dateRange, chunkTypes, platformIds };
    },
  });
}
