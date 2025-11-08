// Tipos de datos para el dashboard
export interface KpiData {
  ganancia_hoy: number;
  operaciones_hoy: number;
  ganancia_mes: number;
  operaciones_mes: number;
  margen_promedio_mes: number;
}

export interface DailySummary {
  dia: string;
  ganancia_usd: number | null;
  operaciones: number | null;
  diaLabel?: string;
}

export interface RecentOperation {
  numero_operacion: string;
  created_at: string;
  created_at_formatted?: string;
  usuario_telegram_nombre: string | null;
  entregado: string;
  recibido: string;
  ganancia_bruta_usd: number | null;
  estado: string;
  cantidad_entrada?: number | null;
  divisa_entrada?: string | null;
  cantidad_salida?: number | null;
  divisa_salida?: string | null;
}

export interface ProfitByCurrency {
  par_divisas: string;
  ganancia_total_usd: number;
}

export interface Divisa {
  id: number;
  divisa: string;
  precio_compra: number;
  precio_venta: number;
  stock_disponible: number;
  updated_at?: string;
}

export interface LoadingState {
  kpis: boolean;
  dailySummary: boolean;
  recentOps: boolean;
  profitByCurrency: boolean;
  divisas: boolean;
}

export type MessageType = 'success' | 'warning' | 'error';
