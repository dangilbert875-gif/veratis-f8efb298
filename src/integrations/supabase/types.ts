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
          commission_percent: number
          created_at: string
          id: string
          payout_balance: number
          total_referrals: number
          total_sales: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_code: string
          commission_percent?: number
          created_at?: string
          id?: string
          payout_balance?: number
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_code?: string
          commission_percent?: number
          created_at?: string
          id?: string
          payout_balance?: number
          total_referrals?: number
          total_sales?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      educational_articles: {
        Row: {
          body: string | null
          category: string | null
          created_at: string
          excerpt: string | null
          featured_image: string | null
          id: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          body?: string | null
          category?: string | null
          created_at?: string
          excerpt?: string | null
          featured_image?: string | null
          id?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string
          title?: string
          updated_at?: string
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
          btc_address: string | null
          btc_amount: number | null
          created_at: string
          customer_email: string
          customer_id: string | null
          id: string
          items: Json
          notes: string | null
          order_number: string
          payment_method: string | null
          payment_status: string
          shipping_status: string
          status: Database["public"]["Enums"]["order_status"]
          total_usd: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          btc_address?: string | null
          btc_amount?: number | null
          created_at?: string
          customer_email: string
          customer_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number: string
          payment_method?: string | null
          payment_status?: string
          shipping_status?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          btc_address?: string | null
          btc_amount?: number | null
          created_at?: string
          customer_email?: string
          customer_id?: string | null
          id?: string
          items?: Json
          notes?: string | null
          order_number?: string
          payment_method?: string | null
          payment_status?: string
          shipping_status?: string
          status?: Database["public"]["Enums"]["order_status"]
          total_usd?: number
          tracking_number?: string | null
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
          best_before: string | null
          coa_url: string | null
          created_at: string
          endotoxin: string | null
          id: string
          identity_status: string | null
          lot_number: string
          product_id: string | null
          purity: string | null
          release_date: string | null
          tested_by: string | null
          updated_at: string
          water_content: string | null
        }
        Insert: {
          best_before?: string | null
          coa_url?: string | null
          created_at?: string
          endotoxin?: string | null
          id?: string
          identity_status?: string | null
          lot_number: string
          product_id?: string | null
          purity?: string | null
          release_date?: string | null
          tested_by?: string | null
          updated_at?: string
          water_content?: string | null
        }
        Update: {
          best_before?: string | null
          coa_url?: string | null
          created_at?: string
          endotoxin?: string | null
          id?: string
          identity_status?: string | null
          lot_number?: string
          product_id?: string | null
          purity?: string | null
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
          category: string | null
          created_at: string
          description: string | null
          endotoxin: string | null
          featured: boolean
          id: string
          lot_number: string | null
          name: string
          price_usd: number
          purity: string | null
          slug: string
          stock_status: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          endotoxin?: string | null
          featured?: boolean
          id?: string
          lot_number?: string | null
          name: string
          price_usd?: number
          purity?: string | null
          slug: string
          stock_status?: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          endotoxin?: string | null
          featured?: boolean
          id?: string
          lot_number?: string | null
          name?: string
          price_usd?: number
          purity?: string | null
          slug?: string
          stock_status?: string
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "research_partner" | "customer"
      order_status:
        | "pending"
        | "awaiting_payment"
        | "paid"
        | "shipped"
        | "delivered"
        | "cancelled"
        | "refunded"
      payout_status: "pending" | "approved" | "sent" | "cancelled"
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
      app_role: ["admin", "research_partner", "customer"],
      order_status: [
        "pending",
        "awaiting_payment",
        "paid",
        "shipped",
        "delivered",
        "cancelled",
        "refunded",
      ],
      payout_status: ["pending", "approved", "sent", "cancelled"],
    },
  },
} as const
