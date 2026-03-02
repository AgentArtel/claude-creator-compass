import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export type ProfileDimension = Tables<"profile_dimensions">;

const DIMENSION_LABELS: Record<string, string> = {
  communication_style: "Communication Style",
  interest_genome: "Interest Genome",
  values: "Values",
  cognitive_patterns: "Cognitive Patterns",
  emotional_profile: "Emotional Profile",
  social_dynamics: "Social Dynamics",
  aesthetic_preferences: "Aesthetic Preferences",
  temporal_patterns: "Temporal Patterns",
};

const DIMENSION_COLORS: Record<string, string> = {
  communication_style: "hsl(217, 91%, 60%)",
  interest_genome: "hsl(263, 70%, 50%)",
  values: "hsl(160, 84%, 39%)",
  cognitive_patterns: "hsl(36, 100%, 44%)",
  emotional_profile: "hsl(330, 81%, 60%)",
  social_dynamics: "hsl(200, 80%, 50%)",
  aesthetic_preferences: "hsl(280, 60%, 55%)",
  temporal_patterns: "hsl(45, 90%, 50%)",
};

export const ALL_DIMENSIONS = Object.keys(DIMENSION_LABELS);

export function getDimensionLabel(dim: string) {
  return DIMENSION_LABELS[dim] ?? dim.replace(/_/g, " ");
}

export function getDimensionColor(dim: string) {
  return DIMENSION_COLORS[dim] ?? "hsl(217, 91%, 60%)";
}

export function useProfileDimensions() {
  return useQuery({
    queryKey: ["profile_dimensions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profile_dimensions")
        .select("*")
        .order("dimension");

      if (error) throw error;
      return data as ProfileDimension[];
    },
  });
}
