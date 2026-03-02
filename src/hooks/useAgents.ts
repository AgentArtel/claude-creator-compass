import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables, TablesInsert, TablesUpdate } from "@/integrations/supabase/types";

export type AgentConfig = Tables<"agent_configs">;

export function useAgents() {
  return useQuery({
    queryKey: ["agent_configs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("agent_configs")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AgentConfig[];
    },
  });
}

export function useCreateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (agent: Omit<TablesInsert<"agent_configs">, "user_id">) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("agent_configs")
        .insert({ ...agent, user_id: user.id })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent_configs"] }),
  });
}

export function useUpdateAgent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...updates }: TablesUpdate<"agent_configs"> & { id: string }) => {
      const { data, error } = await supabase
        .from("agent_configs")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["agent_configs"] }),
  });
}
