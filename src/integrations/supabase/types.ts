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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      case_manager_family_assignments: {
        Row: {
          case_manager_id: string
          created_at: string
          end_date: string | null
          family_id: string
          id: string
          start_date: string
          updated_at: string
        }
        Insert: {
          case_manager_id: string
          created_at?: string
          end_date?: string | null
          family_id: string
          id?: string
          start_date?: string
          updated_at?: string
        }
        Update: {
          case_manager_id?: string
          created_at?: string
          end_date?: string | null
          family_id?: string
          id?: string
          start_date?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_manager_family_assignments_case_manager_id_fkey"
            columns: ["case_manager_id"]
            isOneToOne: false
            referencedRelation: "case_manager_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_manager_family_assignments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      case_manager_profiles: {
        Row: {
          created_at: string
          id: string
          phone: string | null
          region: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          phone?: string | null
          region?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string | null
          region?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "case_manager_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      children: {
        Row: {
          age: number | null
          created_at: string
          family_id: string
          gender: string | null
          id: string
          name: string
          notes: string | null
          photo_url: string | null
          school: string | null
          updated_at: string
        }
        Insert: {
          age?: number | null
          created_at?: string
          family_id: string
          gender?: string | null
          id?: string
          name: string
          notes?: string | null
          photo_url?: string | null
          school?: string | null
          updated_at?: string
        }
        Update: {
          age?: number | null
          created_at?: string
          family_id?: string
          gender?: string | null
          id?: string
          name?: string
          notes?: string | null
          photo_url?: string | null
          school?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "children_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_family_assignments: {
        Row: {
          created_at: string
          donor_id: string
          end_date: string | null
          family_id: string
          id: string
          start_date: string
          status: Database["public"]["Enums"]["assignment_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          end_date?: string | null
          family_id: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          end_date?: string | null
          family_id?: string
          id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["assignment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_family_assignments_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donor_family_assignments_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      donor_profiles: {
        Row: {
          bio: string | null
          communication_preferences: Json | null
          created_at: string
          id: string
          preferred_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          bio?: string | null
          communication_preferences?: Json | null
          created_at?: string
          id?: string
          preferred_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          bio?: string | null
          communication_preferences?: Json | null
          created_at?: string
          id?: string
          preferred_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "donor_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      families: {
        Row: {
          banner_image_url: string | null
          created_at: string
          family_user_id: string | null
          id: string
          location_city: string | null
          location_country: string | null
          name: string
          status: Database["public"]["Enums"]["family_status"]
          story: string | null
          updated_at: string
        }
        Insert: {
          banner_image_url?: string | null
          created_at?: string
          family_user_id?: string | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          name: string
          status?: Database["public"]["Enums"]["family_status"]
          story?: string | null
          updated_at?: string
        }
        Update: {
          banner_image_url?: string | null
          created_at?: string
          family_user_id?: string | null
          id?: string
          location_city?: string | null
          location_country?: string | null
          name?: string
          status?: Database["public"]["Enums"]["family_status"]
          story?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "families_family_user_id_fkey"
            columns: ["family_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_threads: {
        Row: {
          created_at: string
          donor_id: string
          family_id: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          family_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          family_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_threads_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_threads_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          body: string
          body_ar: string | null
          body_en: string | null
          created_at: string
          id: string
          original_language: string | null
          read_at: string | null
          sender_user_id: string
          thread_id: string
        }
        Insert: {
          body: string
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          id?: string
          original_language?: string | null
          read_at?: string | null
          sender_user_id: string
          thread_id: string
        }
        Update: {
          body?: string
          body_ar?: string | null
          body_en?: string | null
          created_at?: string
          id?: string
          original_language?: string | null
          read_at?: string | null
          sender_user_id?: string
          thread_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_sender_user_id_fkey"
            columns: ["sender_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_thread_id_fkey"
            columns: ["thread_id"]
            isOneToOne: false
            referencedRelation: "message_threads"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          caption: string | null
          created_at: string
          file_url: string
          id: string
          media_type: string
          post_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string
          file_url: string
          id?: string
          media_type?: string
          post_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string
          file_url?: string
          id?: string
          media_type?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          body: string
          created_at: string
          created_by_user_id: string
          family_id: string
          id: string
          title: string | null
          updated_at: string
          visibility: string
        }
        Insert: {
          body: string
          created_at?: string
          created_by_user_id: string
          family_id: string
          id?: string
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Update: {
          body?: string
          created_at?: string
          created_by_user_id?: string
          family_id?: string
          id?: string
          title?: string | null
          updated_at?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_created_by_user_id_fkey"
            columns: ["created_by_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          id: string
          name: string
          role: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          id?: string
          name?: string
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      update_requests: {
        Row: {
          created_at: string
          donor_id: string
          family_id: string
          handled_by_case_manager_id: string | null
          id: string
          request_text: string
          responded_post_id: string | null
          status: Database["public"]["Enums"]["update_request_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          donor_id: string
          family_id: string
          handled_by_case_manager_id?: string | null
          id?: string
          request_text: string
          responded_post_id?: string | null
          status?: Database["public"]["Enums"]["update_request_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          donor_id?: string
          family_id?: string
          handled_by_case_manager_id?: string | null
          id?: string
          request_text?: string
          responded_post_id?: string | null
          status?: Database["public"]["Enums"]["update_request_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "update_requests_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donor_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_requests_family_id_fkey"
            columns: ["family_id"]
            isOneToOne: false
            referencedRelation: "families"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_requests_handled_by_case_manager_id_fkey"
            columns: ["handled_by_case_manager_id"]
            isOneToOne: false
            referencedRelation: "case_manager_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "update_requests_responded_post_id_fkey"
            columns: ["responded_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
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
          check_role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: never; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "case_manager" | "donor" | "family"
      assignment_status: "active" | "paused" | "ended"
      family_status: "active" | "inactive" | "graduated"
      update_request_status: "pending" | "in_progress" | "completed"
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
      app_role: ["admin", "case_manager", "donor", "family"],
      assignment_status: ["active", "paused", "ended"],
      family_status: ["active", "inactive", "graduated"],
      update_request_status: ["pending", "in_progress", "completed"],
    },
  },
} as const
