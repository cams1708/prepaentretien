// Types écrits à la main pour correspondre à supabase/migrations/0001_init.sql.
// Peuvent être régénérés avec `npx supabase gen types typescript`.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserRole = "student" | "staff" | "admin";
export type ChatConversationKind = "interview_prep";
export type ChatMessageRole = "user" | "assistant";

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          first_name: string;
          last_name: string;
          email: string;
          headline: string | null;
          degree: string | null;
          current_year: string | null;
          skills: string[];
          experiences: string[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          role?: UserRole;
          first_name?: string;
          last_name?: string;
          email: string;
          headline?: string | null;
          degree?: string | null;
          current_year?: string | null;
          skills?: string[];
          experiences?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          role?: UserRole;
          first_name?: string;
          last_name?: string;
          email?: string;
          headline?: string | null;
          degree?: string | null;
          current_year?: string | null;
          skills?: string[];
          experiences?: string[];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      chat_conversations: {
        Row: {
          id: string;
          student_id: string;
          kind: ChatConversationKind;
          status: string;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          student_id: string;
          kind: ChatConversationKind;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          student_id?: string;
          kind?: ChatConversationKind;
          status?: string;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_conversations_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      chat_messages: {
        Row: {
          id: string;
          conversation_id: string;
          role: ChatMessageRole;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          conversation_id: string;
          role: ChatMessageRole;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          conversation_id?: string;
          role?: ChatMessageRole;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey";
            columns: ["conversation_id"];
            isOneToOne: false;
            referencedRelation: "chat_conversations";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: {
      is_staff_or_admin: { Args: Record<string, never>; Returns: boolean };
    };
    Enums: {
      user_role: UserRole;
      chat_conversation_kind: ChatConversationKind;
      chat_message_role: ChatMessageRole;
    };
    CompositeTypes: { [_ in never]: never };
  };
};
