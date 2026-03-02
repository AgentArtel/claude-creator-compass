export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agent_configs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          model_config: Json
          name: string
          personality: Json
          rag_filter: Json
          system_prompt: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_config?: Json
          name: string
          personality?: Json
          rag_filter?: Json
          system_prompt?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          model_config?: Json
          name?: string
          personality?: Json
          rag_filter?: Json
          system_prompt?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      analysis_results: {
        Row: {
          analysis_type: Database["public"]["Enums"]["analysis_type"]
          confidence: number
          created_at: string
          id: string
          import_id: string
          metadata: Json
          results: Json
          user_id: string
        }
        Insert: {
          analysis_type: Database["public"]["Enums"]["analysis_type"]
          confidence?: number
          created_at?: string
          id?: string
          import_id: string
          metadata?: Json
          results?: Json
          user_id: string
        }
        Update: {
          analysis_type?: Database["public"]["Enums"]["analysis_type"]
          confidence?: number
          created_at?: string
          id?: string
          import_id?: string
          metadata?: Json
          results?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_results_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "platform_imports"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_chunks: {
        Row: {
          chunk_type: string
          content: string
          created_at: string
          id: string
          import_id: string | null
          metadata: Json
          platform_id: string | null
          token_count: number | null
          user_id: string
        }
        Insert: {
          chunk_type?: string
          content: string
          created_at?: string
          id?: string
          import_id?: string | null
          metadata?: Json
          platform_id?: string | null
          token_count?: number | null
          user_id: string
        }
        Update: {
          chunk_type?: string
          content?: string
          created_at?: string
          id?: string
          import_id?: string | null
          metadata?: Json
          platform_id?: string | null
          token_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_chunks_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "platform_imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "knowledge_chunks_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_imports: {
        Row: {
          completed_at: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          metadata: Json
          platform_id: string
          started_at: string | null
          status: Database["public"]["Enums"]["import_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          platform_id: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          metadata?: Json
          platform_id?: string
          started_at?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "platform_imports_platform_id_fkey"
            columns: ["platform_id"]
            isOneToOne: false
            referencedRelation: "platforms"
            referencedColumns: ["id"]
          },
        ]
      }
      platforms: {
        Row: {
          analysis_capabilities: Json
          category: Database["public"]["Enums"]["platform_category"]
          color: string
          config: Json
          created_at: string
          data_types: Json
          description: string | null
          export_instructions: Json
          icon: string
          id: string
          insight_potential: number
          name: string
        }
        Insert: {
          analysis_capabilities?: Json
          category: Database["public"]["Enums"]["platform_category"]
          color?: string
          config?: Json
          created_at?: string
          data_types?: Json
          description?: string | null
          export_instructions?: Json
          icon?: string
          id: string
          insight_potential?: number
          name: string
        }
        Update: {
          analysis_capabilities?: Json
          category?: Database["public"]["Enums"]["platform_category"]
          color?: string
          config?: Json
          created_at?: string
          data_types?: Json
          description?: string | null
          export_instructions?: Json
          icon?: string
          id?: string
          insight_potential?: number
          name?: string
        }
        Relationships: []
      }
      profile_dimensions: {
        Row: {
          confidence: number
          created_at: string
          dimension: Database["public"]["Enums"]["dimension_type"]
          id: string
          source_imports: string[]
          updated_at: string
          user_id: string
          value: Json
          version: number
        }
        Insert: {
          confidence?: number
          created_at?: string
          dimension: Database["public"]["Enums"]["dimension_type"]
          id?: string
          source_imports?: string[]
          updated_at?: string
          user_id: string
          value?: Json
          version?: number
        }
        Update: {
          confidence?: number
          created_at?: string
          dimension?: Database["public"]["Enums"]["dimension_type"]
          id?: string
          source_imports?: string[]
          updated_at?: string
          user_id?: string
          value?: Json
          version?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      analysis_type:
        | "sentiment"
        | "topics"
        | "temporal"
        | "behavioral"
        | "communication"
        | "interests"
      dimension_type:
        | "communication_style"
        | "interest_genome"
        | "values"
        | "cognitive_patterns"
        | "emotional_profile"
        | "social_dynamics"
        | "aesthetic_preferences"
        | "temporal_patterns"
      import_status:
        | "pending"
        | "exporting"
        | "uploaded"
        | "processing"
        | "processed"
        | "failed"
      platform_category:
        | "core"
        | "social"
        | "professional"
        | "consumption"
        | "behavioral"
        | "creative"
        | "ai"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      analysis_type: [
        "sentiment",
        "topics",
        "temporal",
        "behavioral",
        "communication",
        "interests",
      ],
      dimension_type: [
        "communication_style",
        "interest_genome",
        "values",
        "cognitive_patterns",
        "emotional_profile",
        "social_dynamics",
        "aesthetic_preferences",
        "temporal_patterns",
      ],
      import_status: [
        "pending",
        "exporting",
        "uploaded",
        "processing",
        "processed",
        "failed",
      ],
      platform_category: [
        "core",
        "social",
        "professional",
        "consumption",
        "behavioral",
        "creative",
        "ai",
      ],
    },
  },
} as const
