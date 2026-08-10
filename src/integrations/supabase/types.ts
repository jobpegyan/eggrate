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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          metadata: Json
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ad_slots: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_enabled: boolean
          name: string
          position: string
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          position: string
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          position?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_market_insights: {
        Row: {
          analysis_date: string
          city_id: string | null
          confidence: Database["public"]["Enums"]["insight_confidence"]
          confidence_reason: string | null
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          prompt_id: string | null
          provider_id: string | null
          scope: string
          source_data_ids: string[] | null
          state_id: string | null
          status: Database["public"]["Enums"]["insight_status"]
          summary: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
          updated_at: string | null
        }
        Insert: {
          analysis_date?: string
          city_id?: string | null
          confidence?: Database["public"]["Enums"]["insight_confidence"]
          confidence_reason?: string | null
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt_id?: string | null
          provider_id?: string | null
          scope: string
          source_data_ids?: string[] | null
          state_id?: string | null
          status?: Database["public"]["Enums"]["insight_status"]
          summary?: string | null
          title: string
          type: Database["public"]["Enums"]["insight_type"]
          updated_at?: string | null
        }
        Update: {
          analysis_date?: string
          city_id?: string | null
          confidence?: Database["public"]["Enums"]["insight_confidence"]
          confidence_reason?: string | null
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          prompt_id?: string | null
          provider_id?: string | null
          scope?: string
          source_data_ids?: string[] | null
          state_id?: string | null
          status?: Database["public"]["Enums"]["insight_status"]
          summary?: string | null
          title?: string
          type?: Database["public"]["Enums"]["insight_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_market_insights_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_market_insights_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "regional_price_movers"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "ai_market_insights_prompt_id_fkey"
            columns: ["prompt_id"]
            isOneToOne: false
            referencedRelation: "ai_prompts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_market_insights_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_market_insights_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_prompts: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean
          name: string
          type: Database["public"]["Enums"]["insight_type"]
          updated_at: string | null
          version: number
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          name: string
          type: Database["public"]["Enums"]["insight_type"]
          updated_at?: string | null
          version?: number
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean
          name?: string
          type?: Database["public"]["Enums"]["insight_type"]
          updated_at?: string | null
          version?: number
        }
        Relationships: []
      }
      ai_providers: {
        Row: {
          api_key_secret_name: string | null
          config: Json | null
          created_at: string | null
          id: string
          is_active: boolean
          max_tokens: number
          model_name: string
          priority: number
          provider_name: string
          temperature: number
          updated_at: string | null
        }
        Insert: {
          api_key_secret_name?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number
          model_name: string
          priority?: number
          provider_name: string
          temperature?: number
          updated_at?: string | null
        }
        Update: {
          api_key_secret_name?: string | null
          config?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean
          max_tokens?: number
          model_name?: string
          priority?: number
          provider_name?: string
          temperature?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_usage_logs: {
        Row: {
          completion_tokens: number
          created_at: string | null
          error_message: string | null
          estimated_cost: number
          id: string
          model: string
          prompt_tokens: number
          provider_id: string | null
          status: string
        }
        Insert: {
          completion_tokens?: number
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number
          id?: string
          model: string
          prompt_tokens?: number
          provider_id?: string | null
          status: string
        }
        Update: {
          completion_tokens?: number
          created_at?: string | null
          error_message?: string | null
          estimated_cost?: number
          id?: string
          model?: string
          prompt_tokens?: number
          provider_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "ai_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          ends_at: string | null
          id: string
          is_active: boolean
          message: string
          starts_at: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message: string
          starts_at?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean
          message?: string
          starts_at?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          updated_at?: string
        }
        Relationships: []
      }
      anomaly_rules: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metric: string
          name: string
          operator: string
          threshold_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metric: string
          name: string
          operator: string
          threshold_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metric?: string
          name?: string
          operator?: string
          threshold_value?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      automation_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          details: Json | null
          id: string
          job_id: string | null
          status: string
        }
        Insert: {
          action: string
          created_at?: string | null
          details?: Json | null
          id?: string
          job_id?: string | null
          status: string
        }
        Update: {
          action?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          job_id?: string | null
          status?: string
        }
        Relationships: []
      }
      automation_settings: {
        Row: {
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      cities: {
        Row: {
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          is_featured: boolean
          latitude: number | null
          longitude: number | null
          meta_description: string | null
          name: string
          population: number | null
          seo_title: string | null
          slug: string
          state_id: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          name: string
          population?: number | null
          seo_title?: string | null
          slug: string
          state_id: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          is_featured?: boolean
          latitude?: number | null
          longitude?: number | null
          meta_description?: string | null
          name?: string
          population?: number | null
          seo_title?: string | null
          slug?: string
          state_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cities_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      data_conflicts: {
        Row: {
          city_id: string | null
          created_at: string | null
          date: string
          id: string
          rate_a: number
          rate_b: number
          resolution_details: Json | null
          resolution_method: string | null
          resolved: boolean | null
          resolved_by: string | null
          source_a: string | null
          source_b: string | null
        }
        Insert: {
          city_id?: string | null
          created_at?: string | null
          date: string
          id?: string
          rate_a: number
          rate_b: number
          resolution_details?: Json | null
          resolution_method?: string | null
          resolved?: boolean | null
          resolved_by?: string | null
          source_a?: string | null
          source_b?: string | null
        }
        Update: {
          city_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          rate_a?: number
          rate_b?: number
          resolution_details?: Json | null
          resolution_method?: string | null
          resolved?: boolean | null
          resolved_by?: string | null
          source_a?: string | null
          source_b?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "data_conflicts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_conflicts_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "regional_price_movers"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "data_conflicts_source_a_fkey"
            columns: ["source_a"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "data_conflicts_source_b_fkey"
            columns: ["source_b"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      data_quality_scores: {
        Row: {
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          recorded_date: string | null
          score_value: number
        }
        Insert: {
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          recorded_date?: string | null
          score_value: number
        }
        Update: {
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          recorded_date?: string | null
          score_value?: number
        }
        Relationships: []
      }
      data_sources: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_trusted: boolean
          key: string
          kind: Database["public"]["Enums"]["source_kind"]
          name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_trusted?: boolean
          key: string
          kind?: Database["public"]["Enums"]["source_kind"]
          name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_trusted?: boolean
          key?: string
          kind?: Database["public"]["Enums"]["source_kind"]
          name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          url?: string | null
        }
        Relationships: []
      }
      egg_rate_history: {
        Row: {
          action: Database["public"]["Enums"]["rate_action"]
          changed_by: string | null
          city_id: string | null
          created_at: string
          currency: string
          dozen_price: number | null
          effective_date: string | null
          egg_rate: number | null
          hundred_price: number | null
          id: string
          is_published: boolean | null
          is_verified: boolean | null
          market_id: string | null
          peti_price: number | null
          rate_id: string | null
          retail_price: number | null
          snapshot: Json
          state_id: string | null
          tray_price: number | null
          wholesale_price: number | null
        }
        Insert: {
          action?: Database["public"]["Enums"]["rate_action"]
          changed_by?: string | null
          city_id?: string | null
          created_at?: string
          currency?: string
          dozen_price?: number | null
          effective_date?: string | null
          egg_rate?: number | null
          hundred_price?: number | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          market_id?: string | null
          peti_price?: number | null
          rate_id?: string | null
          retail_price?: number | null
          snapshot?: Json
          state_id?: string | null
          tray_price?: number | null
          wholesale_price?: number | null
        }
        Update: {
          action?: Database["public"]["Enums"]["rate_action"]
          changed_by?: string | null
          city_id?: string | null
          created_at?: string
          currency?: string
          dozen_price?: number | null
          effective_date?: string | null
          egg_rate?: number | null
          hundred_price?: number | null
          id?: string
          is_published?: boolean | null
          is_verified?: boolean | null
          market_id?: string | null
          peti_price?: number | null
          rate_id?: string | null
          retail_price?: number | null
          snapshot?: Json
          state_id?: string | null
          tray_price?: number | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "egg_rate_history_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "egg_rates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rate_history_rate_id_fkey"
            columns: ["rate_id"]
            isOneToOne: false
            referencedRelation: "latest_city_rates"
            referencedColumns: ["id"]
          },
        ]
      }
      egg_rates: {
        Row: {
          category_id: string | null
          city_id: string
          created_at: string
          created_by: string | null
          currency: string
          dozen_price: number | null
          effective_date: string
          egg_rate: number
          hundred_price: number | null
          id: string
          import_id: string | null
          is_published: boolean
          is_verified: boolean
          market_id: string | null
          notes: string | null
          peti_price: number | null
          published_at: string | null
          retail_price: number | null
          source_id: string | null
          state_id: string
          status: Database["public"]["Enums"]["record_status"]
          tray_price: number | null
          updated_at: string
          updated_by: string | null
          verified_at: string | null
          verified_by: string | null
          wholesale_price: number | null
        }
        Insert: {
          category_id?: string | null
          city_id: string
          created_at?: string
          created_by?: string | null
          currency?: string
          dozen_price?: number | null
          effective_date: string
          egg_rate: number
          hundred_price?: number | null
          id?: string
          import_id?: string | null
          is_published?: boolean
          is_verified?: boolean
          market_id?: string | null
          notes?: string | null
          peti_price?: number | null
          published_at?: string | null
          retail_price?: number | null
          source_id?: string | null
          state_id: string
          status?: Database["public"]["Enums"]["record_status"]
          tray_price?: number | null
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wholesale_price?: number | null
        }
        Update: {
          category_id?: string | null
          city_id?: string
          created_at?: string
          created_by?: string | null
          currency?: string
          dozen_price?: number | null
          effective_date?: string
          egg_rate?: number
          hundred_price?: number | null
          id?: string
          import_id?: string | null
          is_published?: boolean
          is_verified?: boolean
          market_id?: string | null
          notes?: string | null
          peti_price?: number | null
          published_at?: string | null
          retail_price?: number | null
          source_id?: string | null
          state_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          tray_price?: number | null
          updated_at?: string
          updated_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
          wholesale_price?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "egg_rates_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "rate_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rates_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rates_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "regional_price_movers"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "egg_rates_import_id_fkey"
            columns: ["import_id"]
            isOneToOne: false
            referencedRelation: "imports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rates_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rates_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      exports: {
        Row: {
          created_at: string
          created_by: string | null
          file_format: Database["public"]["Enums"]["export_format"]
          filters: Json
          id: string
          row_count: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_format?: Database["public"]["Enums"]["export_format"]
          filters?: Json
          id?: string
          row_count?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_format?: Database["public"]["Enums"]["export_format"]
          filters?: Json
          id?: string
          row_count?: number
        }
        Relationships: []
      }
      faqs: {
        Row: {
          answer: string
          category: string
          created_at: string
          display_order: number
          id: string
          is_active: boolean
          question: string
          updated_at: string
        }
        Insert: {
          answer: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question: string
          updated_at?: string
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string
          display_order?: number
          id?: string
          is_active?: boolean
          question?: string
          updated_at?: string
        }
        Relationships: []
      }
      imports: {
        Row: {
          created_at: string
          created_by: string | null
          duplicate_rows: number
          errors: Json
          file_format: Database["public"]["Enums"]["export_format"]
          file_name: string
          id: string
          imported_rows: number
          invalid_rows: number
          notes: string | null
          preview: Json
          rolled_back_at: string | null
          source_id: string | null
          status: Database["public"]["Enums"]["import_status"]
          total_rows: number
          updated_at: string
          valid_rows: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          duplicate_rows?: number
          errors?: Json
          file_format?: Database["public"]["Enums"]["export_format"]
          file_name: string
          id?: string
          imported_rows?: number
          invalid_rows?: number
          notes?: string | null
          preview?: Json
          rolled_back_at?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          total_rows?: number
          updated_at?: string
          valid_rows?: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          duplicate_rows?: number
          errors?: Json
          file_format?: Database["public"]["Enums"]["export_format"]
          file_name?: string
          id?: string
          imported_rows?: number
          invalid_rows?: number
          notes?: string | null
          preview?: Json
          rolled_back_at?: string | null
          source_id?: string | null
          status?: Database["public"]["Enums"]["import_status"]
          total_rows?: number
          updated_at?: string
          valid_rows?: number
        }
        Relationships: [
          {
            foreignKeyName: "imports_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      markets: {
        Row: {
          city_id: string
          created_at: string
          created_by: string | null
          id: string
          market_type: Database["public"]["Enums"]["rate_market_type"]
          meta_description: string | null
          name: string
          peti_size: number | null
          seo_title: string | null
          slug: string
          state_id: string
          status: Database["public"]["Enums"]["record_status"]
          supports_retail: boolean
          supports_wholesale: boolean
          updated_at: string
        }
        Insert: {
          city_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          market_type?: Database["public"]["Enums"]["rate_market_type"]
          meta_description?: string | null
          name: string
          peti_size?: number | null
          seo_title?: string | null
          slug: string
          state_id: string
          status?: Database["public"]["Enums"]["record_status"]
          supports_retail?: boolean
          supports_wholesale?: boolean
          updated_at?: string
        }
        Update: {
          city_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          market_type?: Database["public"]["Enums"]["rate_market_type"]
          meta_description?: string | null
          name?: string
          peti_size?: number | null
          seo_title?: string | null
          slug?: string
          state_id?: string
          status?: Database["public"]["Enums"]["record_status"]
          supports_retail?: boolean
          supports_wholesale?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "markets_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "markets_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "regional_price_movers"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "markets_state_id_fkey"
            columns: ["state_id"]
            isOneToOne: false
            referencedRelation: "states"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          city_slug: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          source: string
        }
        Insert: {
          city_slug?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          source?: string
        }
        Update: {
          city_slug?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          source?: string
        }
        Relationships: []
      }
      normalization_mappings: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          mapping_type: string
          source_name: string
          target_name: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mapping_type: string
          source_name: string
          target_name: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          mapping_type?: string
          source_name?: string
          target_name?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          key: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          key?: string
          name?: string
        }
        Relationships: []
      }
      posts: {
        Row: {
          author_name: string | null
          content: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string | null
          excerpt: string | null
          id: string
          is_published: boolean
          meta_description: string | null
          meta_title: string | null
          published_at: string
          read_minutes: number
          slug: string
          tags: string[]
          title: string
          updated_at: string
        }
        Insert: {
          author_name?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string
          read_minutes?: number
          slug: string
          tags?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          author_name?: string | null
          content?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          id?: string
          is_published?: boolean
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string
          read_minutes?: number
          slug?: string
          tags?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          language: string
          last_login_at: string | null
          phone: string | null
          status: Database["public"]["Enums"]["user_status"]
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          language?: string
          last_login_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          language?: string
          last_login_at?: string | null
          phone?: string | null
          status?: Database["public"]["Enums"]["user_status"]
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      rate_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          key: string
          name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          key: string
          name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          key?: string
          name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      rate_logs: {
        Row: {
          action: Database["public"]["Enums"]["rate_action"]
          actor_id: string | null
          changes: Json
          created_at: string
          description: string | null
          entity_id: string | null
          entity_type: string
          id: string
          rate_id: string | null
        }
        Insert: {
          action: Database["public"]["Enums"]["rate_action"]
          actor_id?: string | null
          changes?: Json
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          rate_id?: string | null
        }
        Update: {
          action?: Database["public"]["Enums"]["rate_action"]
          actor_id?: string | null
          changes?: Json
          created_at?: string
          description?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          rate_id?: string | null
        }
        Relationships: []
      }
      raw_data: {
        Row: {
          created_at: string | null
          error_message: string | null
          fetch_time: string | null
          hash: string
          id: string
          raw_payload: Json
          request_id: string | null
          source_id: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          fetch_time?: string | null
          hash: string
          id?: string
          raw_payload: Json
          request_id?: string | null
          source_id?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          fetch_time?: string | null
          hash?: string
          id?: string
          raw_payload?: Json
          request_id?: string | null
          source_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_data_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "data_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_key: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_key?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_key_fkey"
            columns: ["permission_key"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["key"]
          },
        ]
      }
      roles: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          key: Database["public"]["Enums"]["app_role"]
          level: number
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key: Database["public"]["Enums"]["app_role"]
          level?: number
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          key?: Database["public"]["Enums"]["app_role"]
          level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      seo_redirects: {
        Row: {
          created_at: string
          id: string
          new_url: string
          old_url: string
          status_code: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          new_url: string
          old_url: string
          status_code?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          new_url?: string
          old_url?: string
          status_code?: number
          updated_at?: string
        }
        Relationships: []
      }
      seo_settings: {
        Row: {
          group_name: string
          id: string
          input_type: string
          is_public: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          value: string | null
        }
        Insert: {
          group_name?: string
          id?: string
          input_type?: string
          is_public?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Update: {
          group_name?: string
          id?: string
          input_type?: string
          is_public?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      seo_templates: {
        Row: {
          created_at: string
          description_template: string
          id: string
          is_active: boolean
          page_type: string
          title_template: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_template: string
          id?: string
          is_active?: boolean
          page_type: string
          title_template: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_template?: string
          id?: string
          is_active?: boolean
          page_type?: string
          title_template?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          group_name: string
          id: string
          input_type: string
          is_public: boolean
          key: string
          label: string
          sort_order: number
          updated_at: string
          value: Json
        }
        Insert: {
          group_name?: string
          id?: string
          input_type?: string
          is_public?: boolean
          key: string
          label: string
          sort_order?: number
          updated_at?: string
          value?: Json
        }
        Update: {
          group_name?: string
          id?: string
          input_type?: string
          is_public?: boolean
          key?: string
          label?: string
          sort_order?: number
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      states: {
        Row: {
          code: string | null
          created_at: string
          created_by: string | null
          display_order: number
          id: string
          meta_description: string | null
          name: string
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          meta_description?: string | null
          name: string
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          code?: string | null
          created_at?: string
          created_by?: string | null
          display_order?: number
          id?: string
          meta_description?: string | null
          name?: string
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          context: Json
          created_at: string
          id: string
          level: Database["public"]["Enums"]["log_level"]
          message: string
          source: string
        }
        Insert: {
          context?: Json
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message: string
          source?: string
        }
        Update: {
          context?: Json
          created_at?: string
          id?: string
          level?: Database["public"]["Enums"]["log_level"]
          message?: string
          source?: string
        }
        Relationships: []
      }
      units: {
        Row: {
          created_at: string
          display_order: number
          eggs_per_unit: number
          id: string
          key: string
          name: string
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          eggs_per_unit?: number
          id?: string
          key: string
          name: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          eggs_per_unit?: number
          id?: string
          key?: string
          name?: string
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      city_rate_changes: {
        Row: {
          city_id: string | null
          city_name: string | null
          city_slug: string | null
          dozen_price: number | null
          effective_date: string | null
          egg_rate: number | null
          hundred_price: number | null
          is_featured: boolean | null
          is_verified: boolean | null
          market_id: string | null
          peti_price: number | null
          previous_price: number | null
          price_change: number | null
          price_change_percent: number | null
          retail_price: number | null
          state_name: string | null
          state_slug: string | null
          tray_price: number | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "egg_rates_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "egg_rates_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "regional_price_movers"
            referencedColumns: ["city_id"]
          },
          {
            foreignKeyName: "egg_rates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_city_rates: {
        Row: {
          avg_price: number | null
          city_name: string | null
          city_slug: string | null
          effective_date: string | null
          markets_count: number | null
        }
        Relationships: []
      }
      daily_national_rates: {
        Row: {
          avg_price: number | null
          effective_date: string | null
          markets_count: number | null
        }
        Relationships: []
      }
      daily_state_rates: {
        Row: {
          avg_price: number | null
          effective_date: string | null
          markets_count: number | null
          state_name: string | null
          state_slug: string | null
        }
        Relationships: []
      }
      latest_city_rates: {
        Row: {
          city_name: string | null
          city_slug: string | null
          dozen_price: number | null
          effective_date: string | null
          egg_rate: number | null
          hundred_price: number | null
          id: string | null
          is_featured: boolean | null
          is_verified: boolean | null
          market_id: string | null
          peti_price: number | null
          retail_price: number | null
          rn: number | null
          state_name: string | null
          state_slug: string | null
          tray_price: number | null
          updated_at: string | null
          wholesale_price: number | null
        }
        Relationships: [
          {
            foreignKeyName: "egg_rates_market_id_fkey"
            columns: ["market_id"]
            isOneToOne: false
            referencedRelation: "markets"
            referencedColumns: ["id"]
          },
        ]
      }
      regional_price_movers: {
        Row: {
          city_id: string | null
          city_name: string | null
          city_slug: string | null
          current_price: number | null
          effective_date: string | null
          percentage_change: number | null
          previous_price: number | null
          price_change: number | null
          state_name: string | null
          state_slug: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      auto_update_egg_rates: { Args: never; Returns: undefined }
      get_data_coverage_stats: {
        Args: { _date: string }
        Returns: {
          coverage_percent: number
          total_cities: number
          updated_cities: number
        }[]
      }
      get_region_history: {
        Args: { p_days?: number; p_slug?: string; p_type: string }
        Returns: {
          avg_price: number
          effective_date: string
        }[]
      }
      has_permission: {
        Args: { _permission: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "guest" | "user" | "editor" | "admin" | "super_admin"
      export_format: "csv" | "xlsx" | "json"
      import_status:
        | "pending"
        | "validating"
        | "previewed"
        | "importing"
        | "completed"
        | "failed"
        | "rolled_back"
      insight_confidence: "low" | "medium" | "high"
      insight_status: "draft" | "review" | "published" | "archived"
      insight_type:
        | "daily_summary"
        | "price_movement"
        | "city_analysis"
        | "state_analysis"
        | "national_analysis"
        | "weekly_summary"
        | "monthly_summary"
        | "trend_detection"
        | "anomaly_explanation"
        | "data_quality"
      log_level: "debug" | "info" | "warning" | "error" | "critical"
      notification_type: "success" | "warning" | "error" | "info"
      rate_action:
        | "created"
        | "updated"
        | "deleted"
        | "published"
        | "unpublished"
        | "verified"
        | "unverified"
        | "restored"
        | "imported"
        | "rolled_back"
      rate_market_type: "wholesale" | "retail" | "both"
      record_status: "active" | "inactive" | "draft" | "archived"
      source_kind:
        | "manual"
        | "csv"
        | "excel"
        | "api"
        | "cron"
        | "webhook"
        | "scrape"
      user_status: "active" | "suspended" | "pending"
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
      app_role: ["guest", "user", "editor", "admin", "super_admin"],
      export_format: ["csv", "xlsx", "json"],
      import_status: [
        "pending",
        "validating",
        "previewed",
        "importing",
        "completed",
        "failed",
        "rolled_back",
      ],
      insight_confidence: ["low", "medium", "high"],
      insight_status: ["draft", "review", "published", "archived"],
      insight_type: [
        "daily_summary",
        "price_movement",
        "city_analysis",
        "state_analysis",
        "national_analysis",
        "weekly_summary",
        "monthly_summary",
        "trend_detection",
        "anomaly_explanation",
        "data_quality",
      ],
      log_level: ["debug", "info", "warning", "error", "critical"],
      notification_type: ["success", "warning", "error", "info"],
      rate_action: [
        "created",
        "updated",
        "deleted",
        "published",
        "unpublished",
        "verified",
        "unverified",
        "restored",
        "imported",
        "rolled_back",
      ],
      rate_market_type: ["wholesale", "retail", "both"],
      record_status: ["active", "inactive", "draft", "archived"],
      source_kind: [
        "manual",
        "csv",
        "excel",
        "api",
        "cron",
        "webhook",
        "scrape",
      ],
      user_status: ["active", "suspended", "pending"],
    },
  },
} as const
