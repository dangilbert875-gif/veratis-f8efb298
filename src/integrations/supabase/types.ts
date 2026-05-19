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
      affiliate_referrals: {
        Row: {
          affiliate_id: string
          commission_amount: number
          created_at: string
          id: string
          order_id: string | null
        }
        Insert: {
          affiliate_id: string
          commission_amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
        }
        Update: {
          affiliate_id?: string
          commission_amount?: number
          created_at?: string
          id?: string
          order_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_referrals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          affiliate_code: string
          archived_at: string | null
          clicks: number
          commission_percent: number
          conversions: number
          created_at: string
          id: string
          paid_payout_total: number
          payout_address: string | null
          payout_balance: number
          payout_preference: string
          pending_payout: number
          status: Database["public"]["Enums"]["affiliate_status"]
          total_referrals: number
          total_sales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          archived_at?: string | null
          clicks?: number
          commission_percent?: number
          conversions?: number
          created_at?: string
          id?: string
          paid_payout_total?: number
          payout_address?: string | null
          payout_balance?: number
          payout_preference?: string
          pending_payout?: number
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          archived_at?: string | null
          clicks?: number
          commission_percent?: number
          conversions?: number
          created_at?: string
          id?: string
          paid_payout_total?: number
          payout_address?: string | null
          payout_balance?: number
          payout_preference?: string
          pending_payout?: number
          status?: Database["public"]["Enums"]["affiliate_status"]
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      article_views: {
        Row: {
          article_id: string
          id: string
          ip_hash: string | null
          viewed_at: string
        }
        Insert: {
          article_id: string
          id?: string
          ip_hash?: string | null
          viewed_at?: string
        }
        Update: {
          article_id?: string
          id?: string
          ip_hash?: string | null
          viewed_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          diff: Json | null
          entity_id: string | null
          entity_type: string
          id: string
          ip: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          diff?: Json | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip?: string | null
        }
        Relationships: []
      }
      customer_meta: {
        Row: {
          admin_notes: string | null
          affiliate_id: string | null
          archived_at: string | null
          created_at: string
          created_by: string | null
          id: string
          last_order_at: string | null
          profile_id: string
          referral_source: string | null
          state: Database["public"]["Enums"]["customer_state"]
          tags: string[]
          total_spend: number
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          affiliate_id?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_order_at?: string | null
          profile_id: string
          referral_source?: string | null
          state?: Database["public"]["Enums"]["customer_state"]
          tags?: string[]
          total_spend?: number
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          affiliate_id?: string | null
          archived_at?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          last_order_at?: string | null
          profile_id?: string
          referral_source?: string | null
          state?: Database["public"]["Enums"]["customer_state"]
          tags?: string[]
          total_spend?: number
          updated_at?: string
        }
        Relationships: []
      }
      educational_articles: {
        Row: {
          archived_at: string | null
          author: string | null
          body: string | null
          category: string | null
          citations: Json
          created_at: string
          created_by: string | null
          excerpt: string | null
          external_links: Json
          featured_image: string | null
          id: string
          peptide_tags: string[]
          publish_at: string | null
          published: boolean
          related_article_ids: string[]
          related_product_ids: string[]
          seo_description: string | null
          seo_title: string | null
          slug: string
          status: Database["public"]["Enums"]["article_status"]
          tags: string[]
          title: string
          updated_at: string
          view_count: number
        }
        Insert: {
          archived_at?: string | null
          author?: string | null
          body?: string | null
          category?: string | null
          citations?: Json
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          external_links?: Json
          featured_image?: string | null
          id?: string
          peptide_tags?: string[]
          publish_at?: string | null
          published?: boolean
          related_article_ids?: string[]
          related_product_ids?: string[]
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title: string
          updated_at?: string
          view_count?: number
        }
        Update: {
          archived_at?: string | null
          author?: string | null
          body?: string | null
          category?: string | null
          citations?: Json
          created_at?: string
          created_by?: string | null
          excerpt?: string | null
          external_links?: Json
          featured_image?: string | null
          id?: string
          peptide_tags?: string[]
          publish_at?: string | null
          published?: boolean
          related_article_ids?: string[]
          related_product_ids?: string[]
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["article_status"]
          tags?: string[]
          title?: string
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          archived_at: string | null
          btc_address: string | null
          btc_amount: number | null
          created_at: string
          created_by: string | null
          customer_email: string
          customer_id: string | null
          id: string
          internal_notes: string | null
          invoice_number: string | null
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          risk_flag: boolean
          shipping_status: string
          status: Database["public"]["Enums"]["order_status"]
          total_usd: number
          tracking_number: string | null
          transaction_hash: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          archived_at?: string | null
          btc_address?: string | null
          btc_amount?: number | null
          created_at?: string
          created_by?: string | null
          customer_email: string
          customer_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          items?: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          risk_flag?: boolean
          shipping_status?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          tracking_number?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          archived_at?: string | null
          btc_address?: string | null
          btc_amount?: number | null
          created_at?: string
          created_by?: string | null
          customer_email?: string
          customer_id?: string | null
          id?: string
          internal_notes?: string | null
          invoice_number?: string | null
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          risk_flag?: boolean
          shipping_status?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          tracking_number?: string | null
          transaction_hash?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount_usd: number
          btc_address: string | null
          btc_amount: number | null
          created_at: string
          id: string
          notes: string | null
          paid_at: string | null
          partner_id: string
          status: Database["public"]["Enums"]["payout_status"]
          updated_at: string
        }
        Insert: {
          amount_usd: number
          btc_address?: string | null
          btc_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Update: {
          amount_usd?: number
          btc_address?: string | null
          btc_amount?: number | null
          created_at?: string
          id?: string
          notes?: string | null
          paid_at?: string | null
          partner_id?: string
          status?: Database["public"]["Enums"]["payout_status"]
          updated_at?: string
        }
        Relationships: []
      }
      product_lots: {
        Row: {
          active: boolean
          archived_at: string | null
          best_before: string | null
          coa_url: string | null
          created_at: string
          created_by: string | null
          endotoxin: string | null
          hplc_url: string | null
          id: string
          identity_method: string | null
          identity_status: string | null
          lab_partner: string | null
          lcms_url: string | null
          lot_number: string
          notes: string | null
          product_id: string | null
          purity: string | null
          raw_data: Json
          release_date: string | null
          tested_by: string | null
          updated_at: string
          water_content: string | null
        }
        Insert: {
          active?: boolean
          archived_at?: string | null
          best_before?: string | null
          coa_url?: string | null
          created_at?: string
          created_by?: string | null
          endotoxin?: string | null
          hplc_url?: string | null
          id?: string
          identity_method?: string | null
          identity_status?: string | null
          lab_partner?: string | null
          lcms_url?: string | null
          lot_number: string
          notes?: string | null
          product_id?: string | null
          purity?: string | null
          raw_data?: Json
          release_date?: string | null
          tested_by?: string | null
          updated_at?: string
          water_content?: string | null
        }
        Update: {
          active?: boolean
          archived_at?: string | null
          best_before?: string | null
          coa_url?: string | null
          created_at?: string
          created_by?: string | null
          endotoxin?: string | null
          hplc_url?: string | null
          id?: string
          identity_method?: string | null
          identity_status?: string | null
          lab_partner?: string | null
          lcms_url?: string | null
          lot_number?: string
          notes?: string | null
          product_id?: string | null
          purity?: string | null
          raw_data?: Json
          release_date?: string | null
          tested_by?: string | null
          updated_at?: string
          water_content?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_lots_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          archived_at: string | null
          category: string | null
          compare_at_price: number | null
          created_at: string
          created_by: string | null
          description: string | null
          endotoxin: string | null
          featured: boolean
          featured_image: string | null
          full_description: string | null
          gallery_images: Json
          id: string
          inventory_count: number
          lot_number: string | null
          low_stock_threshold: number
          lyophilized: boolean
          meta_keywords: string[]
          molecular_class: string | null
          name: string
          price_usd: number
          purity: string | null
          related_article_ids: string[]
          related_product_ids: string[]
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["product_status"]
          stock_status: string
          storage_guidance: string | null
          tags: string[]
          updated_at: string
        }
        Insert: {
          archived_at?: string | null
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          endotoxin?: string | null
          featured?: boolean
          featured_image?: string | null
          full_description?: string | null
          gallery_images?: Json
          id?: string
          inventory_count?: number
          lot_number?: string | null
          low_stock_threshold?: number
          lyophilized?: boolean
          meta_keywords?: string[]
          molecular_class?: string | null
          name: string
          price_usd?: number
          purity?: string | null
          related_article_ids?: string[]
          related_product_ids?: string[]
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_status?: string
          storage_guidance?: string | null
          tags?: string[]
          updated_at?: string
        }
        Update: {
          archived_at?: string | null
          category?: string | null
          compare_at_price?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          endotoxin?: string | null
          featured?: boolean
          featured_image?: string | null
          full_description?: string | null
          gallery_images?: Json
          id?: string
          inventory_count?: number
          lot_number?: string | null
          low_stock_threshold?: number
          lyophilized?: boolean
          meta_keywords?: string[]
          molecular_class?: string | null
          name?: string
          price_usd?: number
          purity?: string | null
          related_article_ids?: string[]
          related_product_ids?: string[]
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["product_status"]
          stock_status?: string
          storage_guidance?: string | null
          tags?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      referral_clicks: {
        Row: {
          affiliate_code: string | null
          affiliate_id: string
          converted_at: string | null
          converted_order_id: string | null
          id: string
          ip_hash: string | null
          landed_at: string
          referrer: string | null
        }
        Insert: {
          affiliate_code?: string | null
          affiliate_id: string
          converted_at?: string | null
          converted_order_id?: string | null
          id?: string
          ip_hash?: string | null
          landed_at?: string
          referrer?: string | null
        }
        Update: {
          affiliate_code?: string | null
          affiliate_id?: string
          converted_at?: string | null
          converted_order_id?: string | null
          id?: string
          ip_hash?: string | null
          landed_at?: string
          referrer?: string | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          clicks: number
          code: string
          commission_rate: number
          conversions: number
          created_at: string
          id: string
          label: string | null
          partner_id: string
          revenue_usd: number
          updated_at: string
        }
        Insert: {
          clicks?: number
          code: string
          commission_rate?: number
          conversions?: number
          created_at?: string
          id?: string
          label?: string | null
          partner_id: string
          revenue_usd?: number
          updated_at?: string
        }
        Update: {
          clicks?: number
          code?: string
          commission_rate?: number
          conversions?: number
          created_at?: string
          id?: string
          label?: string | null
          partner_id?: string
          revenue_usd?: number
          updated_at?: string
        }
        Relationships: []
      }
      research_partners: {
        Row: {
          account_manager_id: string | null
          archived_at: string | null
          contact_email: string | null
          created_at: string
          created_by: string | null
          id: string
          institution: string
          nda_accepted_at: string | null
          notes: string | null
          pricing_tier: string | null
          profile_id: string | null
          purchase_volume: number
          research_category: string | null
          status: Database["public"]["Enums"]["research_partner_status"]
          updated_at: string
          verification_docs: Json
        }
        Insert: {
          account_manager_id?: string | null
          archived_at?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          institution: string
          nda_accepted_at?: string | null
          notes?: string | null
          pricing_tier?: string | null
          profile_id?: string | null
          purchase_volume?: number
          research_category?: string | null
          status?: Database["public"]["Enums"]["research_partner_status"]
          updated_at?: string
          verification_docs?: Json
        }
        Update: {
          account_manager_id?: string | null
          archived_at?: string | null
          contact_email?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          institution?: string
          nda_accepted_at?: string | null
          notes?: string | null
          pricing_tier?: string | null
          profile_id?: string | null
          purchase_volume?: number
          research_category?: string | null
          status?: Database["public"]["Enums"]["research_partner_status"]
          updated_at?: string
          verification_docs?: Json
        }
        Relationships: []
      }
      schema_migrations: {
        Row: {
          applied_at: string
          applied_by: string | null
          checksum: string | null
          id: string
          name: string
          notes: string | null
          version: string
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          checksum?: string | null
          id?: string
          name: string
          notes?: string | null
          version: string
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          checksum?: string | null
          id?: string
          name?: string
          notes?: string | null
          version?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          btc_wallet: string | null
          id: string
          site_name: string
          support_email: string | null
          updated_at: string
        }
        Insert: {
          btc_wallet?: string | null
          id?: string
          site_name?: string
          support_email?: string | null
          updated_at?: string
        }
        Update: {
          btc_wallet?: string | null
          id?: string
          site_name?: string
          support_email?: string | null
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
      verification_logs: {
        Row: {
          created_at: string
          id: string
          lookup_ip: string | null
          lot_number: string
        }
        Insert: {
          created_at?: string
          id?: string
          lookup_ip?: string | null
          lot_number: string
        }
        Update: {
          created_at?: string
          id?: string
          lookup_ip?: string | null
          lot_number?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_user_is_admin: { Args: never; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      restore: { Args: { _id: string; _table: string }; Returns: undefined }
      soft_delete: { Args: { _id: string; _table: string }; Returns: undefined }
    }
    Enums: {
      affiliate_status: "active" | "paused" | "suspended"
      app_role: "admin" | "research_partner" | "customer"
      article_status: "draft" | "published" | "archived"
      customer_state:
        | "active"
        | "vip"
        | "research_partner"
        | "suspended"
        | "flagged"
      order_status:
        | "pending"
        | "awaiting_payment"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
        | "packed"
      payout_status: "pending" | "approved" | "sent" | "cancelled"
      product_status: "draft" | "published" | "archived" | "out_of_stock"
      research_partner_status: "applied" | "approved" | "rejected" | "suspended"
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
      affiliate_status: ["active", "paused", "suspended"],
      app_role: ["admin", "research_partner", "customer"],
      article_status: ["draft", "published", "archived"],
      customer_state: [
        "active",
        "vip",
        "research_partner",
        "suspended",
        "flagged",
      ],
      order_status: [
        "pending",
        "awaiting_payment",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
        "packed",
      ],
      payout_status: ["pending", "approved", "sent", "cancelled"],
      product_status: ["draft", "published", "archived", "out_of_stock"],
      research_partner_status: ["applied", "approved", "rejected", "suspended"],
    },
  },
} as const
