// =============================================================================
// DocAI — Database Types
// Matches the structure Supabase JS v2 expects for its generic.
// Run `npm run db:types` after connecting to a live project to auto-generate.
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          plan: "free" | "pro" | "team";
          storage_used: number;
          doc_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "team";
          storage_used?: number;
          doc_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          plan?: "free" | "pro" | "team";
          storage_used?: number;
          doc_count?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      documents: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          original_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          page_count: number | null;
          word_count: number | null;
          status: "pending" | "processing" | "ready" | "error";
          error_message: string | null;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          original_name: string;
          file_path: string;
          file_size: number;
          mime_type: string;
          page_count?: number | null;
          word_count?: number | null;
          status?: "pending" | "processing" | "ready" | "error";
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          original_name?: string;
          file_path?: string;
          file_size?: number;
          mime_type?: string;
          page_count?: number | null;
          word_count?: number | null;
          status?: "pending" | "processing" | "ready" | "error";
          error_message?: string | null;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "documents_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      document_chunks: {
        Row: {
          id: string;
          document_id: string;
          user_id: string;
          chunk_index: number;
          content: string;
          token_count: number | null;
          page_number: number | null;
          embedding: number[] | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          document_id: string;
          user_id: string;
          chunk_index: number;
          content: string;
          token_count?: number | null;
          page_number?: number | null;
          embedding?: number[] | null;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          document_id?: string;
          user_id?: string;
          chunk_index?: number;
          content?: string;
          token_count?: number | null;
          page_number?: number | null;
          embedding?: number[] | null;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "document_chunks_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "document_chunks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_sessions: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          document_ids: string[] | null;
          model: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          document_ids?: string[] | null;
          model?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          document_ids?: string[] | null;
          model?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          session_id: string;
          user_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          sources: Json;
          tokens_used: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          session_id: string;
          user_id: string;
          role: "user" | "assistant" | "system";
          content: string;
          sources?: Json;
          tokens_used?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          session_id?: string;
          user_id?: string;
          role?: "user" | "assistant" | "system";
          content?: string;
          sources?: Json;
          tokens_used?: number | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "chat_messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      session_documents: {
        Row: {
          session_id: string;
          document_id: string;
          added_at: string;
        };
        Insert: {
          session_id: string;
          document_id: string;
          added_at?: string;
        };
        Update: {
          session_id?: string;
          document_id?: string;
          added_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "session_documents_session_id_fkey";
            columns: ["session_id"];
            isOneToOne: false;
            referencedRelation: "chat_sessions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "session_documents_document_id_fkey";
            columns: ["document_id"];
            isOneToOne: false;
            referencedRelation: "documents";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      match_chunks: {
        Args: {
          query_embedding: number[];
          match_threshold?: number;
          match_count?: number;
          filter_user_id?: string;
          filter_doc_ids?: string[];
        };
        Returns: Array<{
          id: string;
          document_id: string;
          chunk_index: number;
          content: string;
          page_number: number | null;
          metadata: Json;
          similarity: number;
        }>;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

// =============================================================================
// Convenience aliases
// =============================================================================
export type Profile          = Database["public"]["Tables"]["profiles"]["Row"];
export type Document         = Database["public"]["Tables"]["documents"]["Row"];
export type DocumentChunk    = Database["public"]["Tables"]["document_chunks"]["Row"];
export type ChatSession      = Database["public"]["Tables"]["chat_sessions"]["Row"];
export type ChatMessage      = Database["public"]["Tables"]["chat_messages"]["Row"];
export type SessionDocument  = Database["public"]["Tables"]["session_documents"]["Row"];

export type DocumentStatus = "pending" | "processing" | "ready" | "error";
export type MessageRole    = "user" | "assistant" | "system";
export type UserPlan       = "free" | "pro" | "team";

export type MatchChunkResult =
  Database["public"]["Functions"]["match_chunks"]["Returns"][number];
