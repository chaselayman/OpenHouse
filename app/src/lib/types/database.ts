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
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          phone: string | null;
          brokerage: string | null;
          license_number: string | null;
          avatar_url: string | null;
          plan_type: "individual" | "brokerage";
          plan_tier: "base" | "unlimited";
          client_limit: number;
          showingtime_connected: boolean;
          calendar_connected: boolean;
          mls_connected: boolean;
          last_session_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          phone?: string | null;
          brokerage?: string | null;
          license_number?: string | null;
          avatar_url?: string | null;
          plan_type?: "individual" | "brokerage";
          plan_tier?: "base" | "unlimited";
          client_limit?: number;
          showingtime_connected?: boolean;
          calendar_connected?: boolean;
          mls_connected?: boolean;
          last_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          phone?: string | null;
          brokerage?: string | null;
          license_number?: string | null;
          avatar_url?: string | null;
          plan_type?: "individual" | "brokerage";
          plan_tier?: "base" | "unlimited";
          client_limit?: number;
          showingtime_connected?: boolean;
          calendar_connected?: boolean;
          mls_connected?: boolean;
          last_session_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      clients: {
        Row: {
          id: string;
          agent_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          status: "active" | "inactive" | "closed";
          min_price: number | null;
          max_price: number | null;
          min_beds: number | null;
          max_beds: number | null;
          min_baths: number | null;
          max_baths: number | null;
          min_sqft: number | null;
          max_sqft: number | null;
          property_types: string[] | null;
          locations: string[] | null;
          must_haves: string[] | null;
          dealbreakers: string[] | null;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          status?: "active" | "inactive" | "closed";
          min_price?: number | null;
          max_price?: number | null;
          min_beds?: number | null;
          max_beds?: number | null;
          min_baths?: number | null;
          max_baths?: number | null;
          min_sqft?: number | null;
          max_sqft?: number | null;
          property_types?: string[] | null;
          locations?: string[] | null;
          must_haves?: string[] | null;
          dealbreakers?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          status?: "active" | "inactive" | "closed";
          min_price?: number | null;
          max_price?: number | null;
          min_beds?: number | null;
          max_beds?: number | null;
          min_baths?: number | null;
          max_baths?: number | null;
          min_sqft?: number | null;
          max_sqft?: number | null;
          property_types?: string[] | null;
          locations?: string[] | null;
          must_haves?: string[] | null;
          dealbreakers?: string[] | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      properties: {
        Row: {
          id: string;
          agent_id: string;
          mls_id: string | null;
          address: string;
          city: string | null;
          state: string | null;
          zip: string | null;
          price: number | null;
          beds: number | null;
          baths: number | null;
          sqft: number | null;
          lot_size: number | null;
          year_built: number | null;
          property_type: string | null;
          status: "active" | "pending" | "sold" | "off_market";
          listing_agent_name: string | null;
          listing_agent_phone: string | null;
          listing_agent_email: string | null;
          photos: string[] | null;
          description: string | null;
          features: string[] | null;
          ai_score: number | null;
          ai_analysis: Json | null;
          red_flags: string[] | null;
          highlights: string[] | null;
          analyzed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          mls_id?: string | null;
          address: string;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          price?: number | null;
          beds?: number | null;
          baths?: number | null;
          sqft?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          property_type?: string | null;
          status?: "active" | "pending" | "sold" | "off_market";
          listing_agent_name?: string | null;
          listing_agent_phone?: string | null;
          listing_agent_email?: string | null;
          photos?: string[] | null;
          description?: string | null;
          features?: string[] | null;
          ai_score?: number | null;
          ai_analysis?: Json | null;
          red_flags?: string[] | null;
          highlights?: string[] | null;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          mls_id?: string | null;
          address?: string;
          city?: string | null;
          state?: string | null;
          zip?: string | null;
          price?: number | null;
          beds?: number | null;
          baths?: number | null;
          sqft?: number | null;
          lot_size?: number | null;
          year_built?: number | null;
          property_type?: string | null;
          status?: "active" | "pending" | "sold" | "off_market";
          listing_agent_name?: string | null;
          listing_agent_phone?: string | null;
          listing_agent_email?: string | null;
          photos?: string[] | null;
          description?: string | null;
          features?: string[] | null;
          ai_score?: number | null;
          ai_analysis?: Json | null;
          red_flags?: string[] | null;
          highlights?: string[] | null;
          analyzed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_properties: {
        Row: {
          id: string;
          client_id: string;
          property_id: string;
          status: "suggested" | "viewed" | "interested" | "rejected" | "toured";
          client_rating: number | null;
          client_notes: string | null;
          agent_notes: string | null;
          sent_at: string | null;
          viewed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          property_id: string;
          status?: "suggested" | "viewed" | "interested" | "rejected" | "toured";
          client_rating?: number | null;
          client_notes?: string | null;
          agent_notes?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          client_id?: string;
          property_id?: string;
          status?: "suggested" | "viewed" | "interested" | "rejected" | "toured";
          client_rating?: number | null;
          client_notes?: string | null;
          agent_notes?: string | null;
          sent_at?: string | null;
          viewed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      showings: {
        Row: {
          id: string;
          agent_id: string;
          client_id: string;
          property_id: string;
          scheduled_date: string;
          scheduled_time: string;
          duration_minutes: number;
          status: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          showingtime_id: string | null;
          confirmation_code: string | null;
          notes: string | null;
          feedback: string | null;
          client_feedback: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          client_id: string;
          property_id: string;
          scheduled_date: string;
          scheduled_time: string;
          duration_minutes?: number;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          showingtime_id?: string | null;
          confirmation_code?: string | null;
          notes?: string | null;
          feedback?: string | null;
          client_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          client_id?: string;
          property_id?: string;
          scheduled_date?: string;
          scheduled_time?: string;
          duration_minutes?: number;
          status?: "pending" | "confirmed" | "cancelled" | "completed" | "no_show";
          showingtime_id?: string | null;
          confirmation_code?: string | null;
          notes?: string | null;
          feedback?: string | null;
          client_feedback?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      integrations: {
        Row: {
          id: string;
          agent_id: string;
          type: "mls" | "showingtime" | "google_calendar" | "outlook_calendar";
          credentials: Json | null;
          settings: Json | null;
          connected_at: string | null;
          last_sync_at: string | null;
          status: "connected" | "disconnected" | "error";
          error_message: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          agent_id: string;
          type: "mls" | "showingtime" | "google_calendar" | "outlook_calendar";
          credentials?: Json | null;
          settings?: Json | null;
          connected_at?: string | null;
          last_sync_at?: string | null;
          status?: "connected" | "disconnected" | "error";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          agent_id?: string;
          type?: "mls" | "showingtime" | "google_calendar" | "outlook_calendar";
          credentials?: Json | null;
          settings?: Json | null;
          connected_at?: string | null;
          last_sync_at?: string | null;
          status?: "connected" | "disconnected" | "error";
          error_message?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Property = Database["public"]["Tables"]["properties"]["Row"];
export type ClientProperty = Database["public"]["Tables"]["client_properties"]["Row"];
export type Showing = Database["public"]["Tables"]["showings"]["Row"];
export type Integration = Database["public"]["Tables"]["integrations"]["Row"];
