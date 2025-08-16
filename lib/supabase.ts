import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      team_members: {
        Row: {
          id: string
          name: string
          role: string
          bio: string
          image_url: string | null
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          role: string
          bio: string
          image_url?: string | null
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          role?: string
          bio?: string
          image_url?: string | null
          order_index?: number
          created_at?: string
        }
      }
      careers: {
        Row: {
          id: string
          title: string
          department: string
          location: string
          type: string
          description: string
          requirements: string[]
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          department: string
          location: string
          type: string
          description: string
          requirements: string[]
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          department?: string
          location?: string
          type?: string
          description?: string
          requirements?: string[]
          is_active?: boolean
          created_at?: string
        }
      }
      portfolio_items: {
        Row: {
          id: string
          title: string
          description: string
          image_url: string | null
          project_url: string | null
          category: string
          technologies: string[]
          is_featured: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          description: string
          image_url?: string | null
          project_url?: string | null
          category: string
          technologies: string[]
          is_featured?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          description?: string
          image_url?: string | null
          project_url?: string | null
          category?: string
          technologies?: string[]
          is_featured?: boolean
          order_index?: number
          created_at?: string
        }
      }
      clients: {
        Row: {
          id: string
          name: string
          logo_url: string | null
          website_url: string | null
          is_featured: boolean
          order_index: number
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          logo_url?: string | null
          website_url?: string | null
          is_featured?: boolean
          order_index?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          logo_url?: string | null
          website_url?: string | null
          is_featured?: boolean
          order_index?: number
          created_at?: string
        }
      }
    }
  }
}