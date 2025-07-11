import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          name: string;
          google_auth_token: string | null;
          settings: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          name: string;
          google_auth_token?: string | null;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          name?: string;
          google_auth_token?: string | null;
          settings?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      audio_files: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          url: string;
          duration: number;
          file_size: number;
          mime_type: string | null;
          transcription_status: 'pending' | 'processing' | 'done' | 'failed';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          url: string;
          duration?: number;
          file_size?: number;
          mime_type?: string | null;
          transcription_status?: 'pending' | 'processing' | 'done' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          url?: string;
          duration?: number;
          file_size?: number;
          mime_type?: string | null;
          transcription_status?: 'pending' | 'processing' | 'done' | 'failed';
          created_at?: string;
          updated_at?: string;
        };
      };
      transcripts: {
        Row: {
          id: string;
          audio_id: string;
          text: string;
          language: string;
          confidence_score: number | null;
          speakers_detected: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          audio_id: string;
          text: string;
          language?: string;
          confidence_score?: number | null;
          speakers_detected?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          audio_id?: string;
          text?: string;
          language?: string;
          confidence_score?: number | null;
          speakers_detected?: number;
          created_at?: string;
        };
      };
      summaries: {
        Row: {
          id: string;
          audio_id: string;
          text: string;
          highlights: string[];
          todo: string[];
          key_topics: string[];
          sentiment: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          audio_id: string;
          text: string;
          highlights?: string[];
          todo?: string[];
          key_topics?: string[];
          sentiment?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          audio_id?: string;
          text?: string;
          highlights?: string[];
          todo?: string[];
          key_topics?: string[];
          sentiment?: string | null;
          created_at?: string;
        };
      };
      qa_logs: {
        Row: {
          id: string;
          audio_id: string;
          user_id: string;
          question: string;
          answer: string;
          confidence_score: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          audio_id: string;
          user_id: string;
          question: string;
          answer: string;
          confidence_score?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          audio_id?: string;
          user_id?: string;
          question?: string;
          answer?: string;
          confidence_score?: number | null;
          created_at?: string;
        };
      };
      events: {
        Row: {
          id: string;
          audio_id: string;
          title: string;
          description: string | null;
          start_time: string;
          end_time: string | null;
          location: string | null;
          added_to_google_calendar: boolean;
          notified: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          audio_id: string;
          title: string;
          description?: string | null;
          start_time: string;
          end_time?: string | null;
          location?: string | null;
          added_to_google_calendar?: boolean;
          notified?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          audio_id?: string;
          title?: string;
          description?: string | null;
          start_time?: string;
          end_time?: string | null;
          location?: string | null;
          added_to_google_calendar?: boolean;
          notified?: boolean;
          created_at?: string;
        };
      };
      email_logs: {
        Row: {
          id: string;
          user_id: string;
          type: 'summary' | 'event' | 'reminder' | 'digest';
          subject: string;
          content: string | null;
          sent_at: string;
          status: 'sent' | 'failed' | 'pending';
        };
        Insert: {
          id?: string;
          user_id: string;
          type: 'summary' | 'event' | 'reminder' | 'digest';
          subject: string;
          content?: string | null;
          sent_at?: string;
          status?: 'sent' | 'failed' | 'pending';
        };
        Update: {
          id?: string;
          user_id?: string;
          type?: 'summary' | 'event' | 'reminder' | 'digest';
          subject?: string;
          content?: string | null;
          sent_at?: string;
          status?: 'sent' | 'failed' | 'pending';
        };
      };
    };
  };
};