import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Tipos para las tablas
export type Divisa = {
  id: number
  divisa: string
  precio_compra: number
  precio_venta: number
  stock_disponible: number
  updated_at: string
}

export type Message = {
  id: number
  created_at: string
  user_id?: string
  content?: string
}

export type OperacionCambio = {
  id: number
  created_at: string
  divisa?: string
  tipo?: string
  monto?: number
  estado?: string
}