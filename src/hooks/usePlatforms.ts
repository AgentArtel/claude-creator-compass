import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Platform, PlatformStatus } from "@/data/platforms";

interface DbPlatform {
  id: string;
  name: string;
  category: string;
  color: string;
  icon: string;
  insight_potential: number;
  description: string | null;
  data_types: string[];
  export_instructions: string[];
  analysis_capabilities: string[];
}

function mapStatus(dbStatus: string | undefined): PlatformStatus {
  const map: Record<string, PlatformStatus> = {
    pending: 'not_started',
    exporting: 'exporting',
    uploaded: 'uploaded',
    processing: 'processing',
    processed: 'indexed',
    failed: 'not_started',
  };
  return map[dbStatus ?? ''] ?? 'not_started';
}

export function usePlatforms() {
  return useQuery({
    queryKey: ['platforms'],
    queryFn: async (): Promise<Platform[]> => {
      const { data: dbPlatforms, error: pErr } = await supabase
        .from('platforms')
        .select('*');

      if (pErr) throw pErr;

      const { data: imports, error: iErr } = await supabase
        .from('platform_imports')
        .select('platform_id, status, created_at')
        .order('created_at', { ascending: false });

      if (iErr) throw iErr;

      // Latest import per platform
      const latestImport = new Map<string, string>();
      for (const imp of imports ?? []) {
        if (!latestImport.has(imp.platform_id)) {
          latestImport.set(imp.platform_id, imp.status);
        }
      }

      return (dbPlatforms as DbPlatform[]).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        color: p.color,
        icon: p.icon,
        status: mapStatus(latestImport.get(p.id)),
        insightPotential: p.insight_potential,
        description: p.description ?? '',
        dataTypes: (p.data_types ?? []) as string[],
        exportInstructions: (p.export_instructions ?? []) as string[],
        analysisCapabilities: (p.analysis_capabilities ?? []) as string[],
      }));
    },
  });
}
