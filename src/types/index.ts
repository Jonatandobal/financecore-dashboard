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

// Nuevos tipos para tablas adicionales

export interface MovimientoDivisa {
  id: number;
  divisa: string;
  tipo: 'entrada' | 'salida' | 'ajuste';
  cantidad: number;
  motivo?: string;
  usuario?: string;
  created_at: string;
  created_at_formatted?: string;
}

export interface ResumenGanancia {
  id: number;
  fecha: string;
  periodo: 'dia' | 'semana' | 'mes';
  ganancia_total: number;
  operaciones_total: number;
  margen_promedio: number;
  fecha_formatted?: string;
}

export interface SuscripcionCotizacion {
  id: number;
  chat_id: string;
  usuario_nombre?: string;
  activo: boolean;
  created_at: string;
  updated_at?: string;
}

export interface User {
  id: number;
  email: string;
  nombre?: string;
  created_at: string;
  ultimo_acceso?: string;
}

export interface ChatMemory {
  id: number;
  chat_id: string;
  mensaje: string;
  rol: 'user' | 'assistant' | 'system';
  created_at: string;
}

export interface ConfigOperacion {
  id: number;
  divisa: string;
  comision_porcentaje: number;
  spread_porcentaje: number;
  monto_minimo: number;
  monto_maximo: number;
  activo: boolean;
}

export interface CotizacionCambioLog {
  id: number;
  divisa_origen: string;
  divisa_destino: string;
  tasa_anterior: number;
  tasa_nueva: number;
  cambio_porcentaje: number;
  created_at: string;
  created_at_formatted?: string;
}

export interface LoadingState {
  kpis: boolean;
  dailySummary: boolean;
  recentOps: boolean;
  profitByCurrency: boolean;
  divisas: boolean;
  movimientos: boolean;
  resumenes: boolean;
  suscripciones: boolean;
  users: boolean;
  config: boolean;
  cotizaciones: boolean;
}

export type MessageType = 'success' | 'warning' | 'error';

// Tipos para estadísticas agregadas
export interface EstadisticasGenerales {
  total_usuarios: number;
  total_suscripciones_activas: number;
  total_operaciones_mes: number;
  total_movimientos_mes: number;
  volumen_total_operado: number;
}
