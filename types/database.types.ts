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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      audio_files: {
        Row: {
          created_at: string | null
          duration: number | null
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          transcription_status: string | null
          updated_at: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          transcription_status?: string | null
          updated_at?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          duration?: number | null
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          transcription_status?: string | null
          updated_at?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "audio_files_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      email_logs: {
        Row: {
          content: string | null
          id: string
          sent_at: string | null
          status: string | null
          subject: string
          type: string
          user_id: string
        }
        Insert: {
          content?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject: string
          type: string
          user_id: string
        }
        Update: {
          content?: string | null
          id?: string
          sent_at?: string | null
          status?: string | null
          subject?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          added_to_google_calendar: boolean | null
          audio_id: string
          created_at: string | null
          description: string | null
          end_time: string | null
          id: string
          location: string | null
          notified: boolean | null
          start_time: string
          title: string
        }
        Insert: {
          added_to_google_calendar?: boolean | null
          audio_id: string
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          notified?: boolean | null
          start_time: string
          title: string
        }
        Update: {
          added_to_google_calendar?: boolean | null
          audio_id?: string
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          id?: string
          location?: string | null
          notified?: boolean | null
          start_time?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      qa_logs: {
        Row: {
          answer: string
          audio_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          question: string
          user_id: string
        }
        Insert: {
          answer: string
          audio_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          question: string
          user_id: string
        }
        Update: {
          answer?: string
          audio_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          question?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "qa_logs_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "qa_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      summaries: {
        Row: {
          audio_id: string
          created_at: string | null
          highlights: string[] | null
          id: string
          key_topics: string[] | null
          sentiment: string | null
          text: string
          todo: string[] | null
        }
        Insert: {
          audio_id: string
          created_at?: string | null
          highlights?: string[] | null
          id?: string
          key_topics?: string[] | null
          sentiment?: string | null
          text: string
          todo?: string[] | null
        }
        Update: {
          audio_id?: string
          created_at?: string | null
          highlights?: string[] | null
          id?: string
          key_topics?: string[] | null
          sentiment?: string | null
          text?: string
          todo?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "summaries_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      transcription_words: {
        Row: {
          confidence: number | null
          end_time: number | null
          id: number
          start_time: number | null
          text: string
          transcript_id: string
          word_is_final: boolean | null
        }
        Insert: {
          confidence?: number | null
          end_time?: number | null
          id?: number
          start_time?: number | null
          text: string
          transcript_id: string
          word_is_final?: boolean | null
        }
        Update: {
          confidence?: number | null
          end_time?: number | null
          id?: number
          start_time?: number | null
          text?: string
          transcript_id?: string
          word_is_final?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_transcript"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transcription_words_transcript_id_fkey"
            columns: ["transcript_id"]
            isOneToOne: false
            referencedRelation: "transcripts"
            referencedColumns: ["id"]
          },
        ]
      }
      transcripts: {
        Row: {
          audio_id: string
          confidence_score: number | null
          created_at: string | null
          id: string
          language: string | null
          speakers_detected: number | null
          text: string
        }
        Insert: {
          audio_id: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          language?: string | null
          speakers_detected?: number | null
          text: string
        }
        Update: {
          audio_id?: string
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          language?: string | null
          speakers_detected?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "transcripts_audio_id_fkey"
            columns: ["audio_id"]
            isOneToOne: false
            referencedRelation: "audio_files"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          created_at: string | null
          email: string
          google_auth_token: string | null
          id: string
          name: string
          settings: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          google_auth_token?: string | null
          id: string
          name: string
          settings?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          google_auth_token?: string | null
          id?: string
          name?: string
          settings?: Json | null
          updated_at?: string | null
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
      [_ in never]: never
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
