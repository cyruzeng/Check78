export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      measurements: {
        Row: {
          id: string
          name: string
          length: number
          evaluation: string
          ip_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          length: number
          evaluation: string
          ip_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          length?: number
          evaluation?: string
          ip_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      rankings: {
        Row: {
          id: string
          name: string
          length: number
          ip_address: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          length: number
          ip_address?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          length?: number
          ip_address?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      forbidden_strings: {
        Row: {
          id: string
          string: string
          created_at: string
        }
        Insert: {
          id?: string
          string: string
          created_at?: string
        }
        Update: {
          id?: string
          string?: string
          created_at?: string
        }
      }
      easter_eggs: {
        Row: {
          id: string
          name: string
          length: number
          message: string
          is_special: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          length: number
          message: string
          is_special?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          length?: number
          message?: string
          is_special?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      admin_config: {
        Row: {
          id: string
          forbidden_strings: string[]
          easter_eggs: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          forbidden_strings: string[]
          easter_eggs: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          forbidden_strings?: string[]
          easter_eggs?: Json
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}