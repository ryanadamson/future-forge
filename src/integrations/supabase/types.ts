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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      ai_plans: {
        Row: {
          content_md: string
          data_json: Json | null
          id: string
          kind: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_md: string
          data_json?: Json | null
          id?: string
          kind: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_md?: string
          data_json?: Json | null
          id?: string
          kind?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      career_goals: {
        Row: {
          company: string | null
          job_description: string | null
          job_link: string | null
          job_title: string | null
          posted_salary: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          job_description?: string | null
          job_link?: string | null
          job_title?: string | null
          posted_salary?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          job_description?: string | null
          job_link?: string | null
          job_title?: string | null
          posted_salary?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          created_at: string
          id: string
          parts_json: Json
          role: string
          thread_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          parts_json: Json
          role: string
          thread_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          parts_json?: Json
          role?: string
          thread_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "chat_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_threads: {
        Row: {
          created_at: string
          id: string
          title: string
          tool: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string
          tool: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string
          tool?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cvs: {
        Row: {
          content_json: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          content_json?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          content_json?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      finance_snapshots: {
        Row: {
          breakdown_json: Json | null
          debt_estimate: number | null
          monthly_save: number | null
          target_house_cost: number | null
          target_year: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          breakdown_json?: Json | null
          debt_estimate?: number | null
          monthly_save?: number | null
          target_house_cost?: number | null
          target_year?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          breakdown_json?: Json | null
          debt_estimate?: number | null
          monthly_save?: number | null
          target_house_cost?: number | null
          target_year?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      gcse_subjects: {
        Row: {
          created_at: string
          id: string
          predicted_grade: string
          subject: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          predicted_grade: string
          subject: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          predicted_grade?: string
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      house_plans: {
        Row: {
          bathrooms: number | null
          bedrooms: number | null
          design_json: Json | null
          est_cost: number | null
          mode: Database["public"]["Enums"]["house_mode"] | null
          notes: string | null
          style: string | null
          target_year: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bathrooms?: number | null
          bedrooms?: number | null
          design_json?: Json | null
          est_cost?: number | null
          mode?: Database["public"]["Enums"]["house_mode"] | null
          notes?: string | null
          style?: string | null
          target_year?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bathrooms?: number | null
          bedrooms?: number | null
          design_json?: Json | null
          est_cost?: number | null
          mode?: Database["public"]["Enums"]["house_mode"] | null
          notes?: string | null
          style?: string | null
          target_year?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          current_location: string | null
          dream_location: string | null
          full_name: string | null
          id: string
          onboarded: boolean
          part_time_hours_week: number | null
          part_time_wage_hourly: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          current_location?: string | null
          dream_location?: string | null
          full_name?: string | null
          id: string
          onboarded?: boolean
          part_time_hours_week?: number | null
          part_time_wage_hourly?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          current_location?: string | null
          dream_location?: string | null
          full_name?: string | null
          id?: string
          onboarded?: boolean
          part_time_hours_week?: number | null
          part_time_wage_hourly?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tutoring_posts: {
        Row: {
          author_name: string | null
          body: string
          contact: string | null
          created_at: string
          id: string
          level: string | null
          subject: string
          type: Database["public"]["Enums"]["tutor_post_type"]
          user_id: string
        }
        Insert: {
          author_name?: string | null
          body: string
          contact?: string | null
          created_at?: string
          id?: string
          level?: string | null
          subject: string
          type: Database["public"]["Enums"]["tutor_post_type"]
          user_id: string
        }
        Update: {
          author_name?: string | null
          body?: string
          contact?: string | null
          created_at?: string
          id?: string
          level?: string | null
          subject?: string
          type?: Database["public"]["Enums"]["tutor_post_type"]
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      house_mode: "renovate" | "redecorate"
      tutor_post_type: "offer" | "request"
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
      app_role: ["admin", "user"],
      house_mode: ["renovate", "redecorate"],
      tutor_post_type: ["offer", "request"],
    },
  },
} as const
