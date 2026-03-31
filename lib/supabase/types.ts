export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      inquiries: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string;
          phone: string;
          whatsapp: string | null;
          city: string;
          country: string;
          service_type: string;
          education_level: string;
          field_of_study: string | null;
          gpa_percentage: number | null;
          graduation_year: number | null;
          preferred_countries: string[];
          intake_period: string;
          budget_range: string;
          tests_taken: string[] | null;
          test_scores: Json | null;
          referral_source: string;
          referrer_name: string | null;
          additional_notes: string | null;
          opted_in_emails: boolean;
          status: InquiryStatus;
          priority: Priority;
          assigned_to: string | null;
          internal_notes: string | null;
          tags: string[] | null;
          next_action_date: string | null;
          utm_source: string | null;
          utm_medium: string | null;
          utm_campaign: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["inquiries"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["inquiries"]["Insert"]>;
      };
      consultations: {
        Row: {
          id: string;
          created_at: string;
          inquiry_id: string | null;
          student_name: string;
          student_email: string;
          student_phone: string | null;
          scheduled_date: string;
          scheduled_time: string;
          timezone: string;
          duration_minutes: number;
          meeting_link: string | null;
          consultant_id: string | null;
          status: ConsultationStatus;
          consultation_notes: string | null;
          outcome: ConsultationOutcome | null;
          follow_up_date: string | null;
          reminder_24h_sent: boolean;
          reminder_1h_sent: boolean;
          confirmation_sent: boolean;
        };
        Insert: Omit<Database["public"]["Tables"]["consultations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["consultations"]["Insert"]>;
      };
      staff_profiles: {
        Row: {
          id: string;
          created_at: string;
          full_name: string;
          email: string;
          role: StaffRole;
          available_for_bookings: boolean;
          calendar_link: string | null;
          avatar_url: string | null;
          phone: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["staff_profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["staff_profiles"]["Insert"]>;
      };
      email_logs: {
        Row: {
          id: string;
          created_at: string;
          recipient_email: string;
          subject: string;
          template_name: string;
          status: EmailStatus;
          inquiry_id: string | null;
          consultation_id: string | null;
          sent_at: string | null;
          opened_at: string | null;
          error_message: string | null;
        };
        Insert: Omit<Database["public"]["Tables"]["email_logs"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["email_logs"]["Insert"]>;
      };
      chat_conversations: {
        Row: {
          id: string;
          created_at: string;
          user_email: string | null;
          user_name: string | null;
          messages: Json;
          escalated_to_human: boolean;
          resolved: boolean;
          metadata: Json | null;
        };
        Insert: Omit<Database["public"]["Tables"]["chat_conversations"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["chat_conversations"]["Insert"]>;
      };
      analytics_events: {
        Row: {
          id: string;
          created_at: string;
          event_name: string;
          event_category: string;
          event_label: string | null;
          event_value: number | null;
          session_id: string | null;
          user_id: string | null;
          page_url: string | null;
          properties: Json | null;
        };
        Insert: Omit<Database["public"]["Tables"]["analytics_events"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["analytics_events"]["Insert"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
}

export type InquiryStatus =
  | "new"
  | "reviewed"
  | "contacted"
  | "consultation_booked"
  | "proposal_sent"
  | "client"
  | "lost"
  | "on_hold";

export type Priority = "low" | "medium" | "high";

export type ConsultationStatus =
  | "scheduled"
  | "completed"
  | "no_show"
  | "cancelled"
  | "rescheduled";

export type ConsultationOutcome =
  | "proposal_sent"
  | "needs_more_info"
  | "not_interested"
  | "follow_up_scheduled";

export type StaffRole = "admin" | "consultant" | "viewer" | "consultation_admin" | "business_admin" | "site_admin";

export type EmailStatus =
  | "sent"
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "failed";

export type Inquiry = Database["public"]["Tables"]["inquiries"]["Row"];
export type InquiryInsert = Database["public"]["Tables"]["inquiries"]["Insert"];
export type Consultation = Database["public"]["Tables"]["consultations"]["Row"];
export type StaffProfile = Database["public"]["Tables"]["staff_profiles"]["Row"];
export type EmailLog = Database["public"]["Tables"]["email_logs"]["Row"];
export type ChatConversation = Database["public"]["Tables"]["chat_conversations"]["Row"];
export type AnalyticsEvent = Database["public"]["Tables"]["analytics_events"]["Row"];
