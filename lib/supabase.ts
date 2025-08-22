import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// Helper function to ensure the storage bucket exists
async function ensureStorageBucket() {
  const { data: buckets, error: listError } = await supabase.storage.listBuckets()
  
  if (listError) {
    console.warn('Could not list buckets:', listError.message)
    return
  }
  
  const imagesBucket = buckets?.find(bucket => bucket.name === 'images')
  
  if (!imagesBucket) {
    const { error: createError } = await supabase.storage.createBucket('images', {
      public: true,
      allowedMimeTypes: ['image/*'],
      fileSizeLimit: 5242880 // 5MB
    })
    
    if (createError) {
      console.warn('Could not create bucket:', createError.message)
    }
  }
}

// Helper function to upload images to Supabase storage
export async function uploadImage(file: File, folder: string = 'team'): Promise<string> {
  // Ensure bucket exists first
  await ensureStorageBucket()
  
  const fileExt = file.name.split('.').pop()
  const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
  const filePath = `${folder}/${fileName}`

  const { data, error } = await supabase.storage
    .from('images')
    .upload(filePath, file)

  if (error) {
    console.error('Upload error:', error)
    throw new Error(`Failed to upload image: ${error.message}`)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('images')
    .getPublicUrl(filePath)

  return publicUrl
}

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          user_id: string
        }
        Insert: {
          user_id: string
        }
        Update: {
          user_id?: string
        }
      }
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