'use client'

import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';
import type {
  KpiData,
  DailySummary,
  RecentOperation,
  ProfitByCurrency,
  Divisa,
  LoadingState,
  MovimientoDivisa,
  SuscripcionCotizacion,
  User,
  ConfigOperacion,
  CotizacionCambioLog,
  EstadisticasGenerales
} from '@/types';

export function useData() {
  const [loading, setLoading] = useState<LoadingState>({
    kpis: false,
    dailySummary: false,
    recentOps: false,
    profitByCurrency: false,
    divisas: false,
    movimientos: false,
    resumenes: false,
    suscripciones: false,
    users: false,
    config: false,
    cotizaciones: false,
  });

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([]);
  const [recentOperations, setRecentOperations] = useState<RecentOperation[]>([]);
  const [profitByCurrency, setProfitByCurrency] = useState<ProfitByCurrency[]>([]);
  const [divisas, setDivisas] = useState<Divisa[]>([]);
  const [movimientos, setMovimientos] = useState<MovimientoDivisa[]>([]);
  const [suscripciones, setSuscripciones] = useState<SuscripcionCotizacion[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [config, setConfig] = useState<ConfigOperacion[]>([]);
  const [cotizaciones, setCotizaciones] = useState<CotizacionCambioLog[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasGenerales | null>(null);

  const loadKpisData = useCallback(async () => {
    setLoading(prev => ({ ...prev, kpis: true }));
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      const { data, error } = await supabase
        .from('operaciones_cambio')
        .select('ganancia_bruta_usd, margen_porcentaje, created_at', { count: 'exact' })
        .eq('estado', 'completada')
        .gte('created_at', monthStart);

      if (error) throw error;

      let gananciaHoy = 0;
      let operacionesHoy = 0;
      let gananciaMes = 0;
      let operacionesMes = 0;
      let margenSumaMes = 0;

      data?.forEach(op => {
        const opDate = new Date(op.created_at);
        const opDateStart = new Date(opDate.getFullYear(), opDate.getMonth(), opDate.getDate()).toISOString();

        gananciaMes += op.ganancia_bruta_usd || 0;
        operacionesMes++;
        margenSumaMes += op.margen_porcentaje || 0;

        if (opDateStart === todayStart) {
          gananciaHoy += op.ganancia_bruta_usd || 0;
          operacionesHoy++;
        }
      });

      const margenPromedioMes = operacionesMes > 0 ? margenSumaMes / operacionesMes : 0;

      setKpis({
        ganancia_hoy: gananciaHoy,
        operaciones_hoy: operacionesHoy,
        ganancia_mes: gananciaMes,
        operaciones_mes: operacionesMes,
        margen_promedio_mes: margenPromedioMes,
      });
    } catch (error: any) {
      console.error('Error calculando KPIs:', error);
      toast.error('Error calculando KPIs: ' + error.message);
      setKpis(null);
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  }, []);

  const loadDailySummaryData = useCallback(async () => {
    setLoading(prev => ({ ...prev, dailySummary: true }));
    try {
      const { data, error } = await supabase
        .from('resumen_diario_ultimos_30_dias')
        .select('dia, ganancia_usd, operaciones')
        .order('dia', { ascending: true });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        ...item,
        diaLabel: item.dia ? new Date(item.dia + 'T00:00:00Z').toLocaleDateString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          timeZone: 'UTC'
        }) : 'N/A'
      })) || [];

      setDailySummary(formattedData);
    } catch (error: any) {
      console.error('Error cargando resumen diario:', error);
      toast.error('Error cargando resumen diario');
      setDailySummary([]);
    } finally {
      setLoading(prev => ({ ...prev, dailySummary: false }));
    }
  }, []);

  const loadRecentOperationsData = useCallback(async () => {
    setLoading(prev => ({ ...prev, recentOps: true }));
    try {
      const { data, error } = await supabase
        .from('operaciones_cambio')
        .select(`
          numero_operacion, created_at, usuario_telegram_nombre,
          cantidad_entrada, divisa_entrada, cantidad_salida, divisa_salida,
          ganancia_bruta_usd, estado
        `)
        .order('created_at', { ascending: false })
        .limit(7);

      if (error) throw error;

      const formattedData = data?.map(op => ({
        ...op,
        entregado: `${op.cantidad_entrada ?? ''} ${op.divisa_entrada ?? ''}`,
        recibido: `${op.cantidad_salida ?? ''} ${op.divisa_salida ?? ''}`,
        created_at_formatted: new Date(op.created_at).toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      })) || [];

      setRecentOperations(formattedData as RecentOperation[]);
    } catch (error: any) {
      console.error('Error cargando operaciones recientes:', error);
      toast.error('Error cargando operaciones recientes');
      setRecentOperations([]);
    } finally {
      setLoading(prev => ({ ...prev, recentOps: false }));
    }
  }, []);

  const loadProfitByCurrencyData = useCallback(async () => {
    setLoading(prev => ({ ...prev, profitByCurrency: true }));
    try {
      const { data, error } = await supabase
        .from('operaciones_por_divisa')
        .select('par_divisas, ganancia_total_usd')
        .order('ganancia_total_usd', { ascending: false });

      if (error) throw error;
      setProfitByCurrency(data as ProfitByCurrency[] || []);
    } catch (error: any) {
      console.error('Error cargando ganancias por divisa:', error);
      toast.error('Error cargando ganancias por divisa');
      setProfitByCurrency([]);
    } finally {
      setLoading(prev => ({ ...prev, profitByCurrency: false }));
    }
  }, []);

  const loadDivisasData = useCallback(async () => {
    setLoading(prev => ({ ...prev, divisas: true }));
    try {
      const { data, error } = await supabase
        .from('divisas_stock')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setDivisas(data || []);
    } catch (error: any) {
      console.error('Error cargando divisas:', error);
      toast.error('Error cargando lista de divisas');
      setDivisas([]);
    } finally {
      setLoading(prev => ({ ...prev, divisas: false }));
    }
  }, []);

  const loadAllDashboardData = useCallback(async () => {
    await Promise.all([
      loadKpisData(),
      loadDailySummaryData(),
      loadRecentOperationsData(),
      loadProfitByCurrencyData(),
    ]);
  }, [loadKpisData, loadDailySummaryData, loadRecentOperationsData, loadProfitByCurrencyData]);

  const updateDivisa = useCallback(async (divisa: Divisa) => {
    setLoading(prev => ({ ...prev, divisas: true }));
    try {
      const { error } = await supabase
        .from('divisas_stock')
        .update({
          precio_compra: divisa.precio_compra,
          precio_venta: divisa.precio_venta,
          stock_disponible: divisa.stock_disponible,
          updated_at: new Date().toISOString()
        })
        .eq('id', divisa.id);

      if (error) throw error;

      toast.success(`${divisa.divisa} actualizada correctamente`);
      loadDivisasData();
    } catch (error: any) {
      console.error('Error actualizando:', error);
      toast.error('Error actualizando divisa: ' + error.message);
    }
    setLoading(prev => ({ ...prev, divisas: false }));
  }, [loadDivisasData]);

  // Nuevas funciones de carga de datos

  const loadMovimientosData = useCallback(async (limit = 20) => {
    setLoading(prev => ({ ...prev, movimientos: true }));
    try {
      const { data, error } = await supabase
        .from('movimientos_divisas')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedData = data?.map(mov => ({
        ...mov,
        created_at_formatted: new Date(mov.created_at).toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      })) || [];

      setMovimientos(formattedData as MovimientoDivisa[]);
    } catch (error: any) {
      console.error('Error cargando movimientos:', error);
      toast.error('Error cargando movimientos de divisas');
      setMovimientos([]);
    } finally {
      setLoading(prev => ({ ...prev, movimientos: false }));
    }
  }, []);

  const loadSuscripcionesData = useCallback(async () => {
    setLoading(prev => ({ ...prev, suscripciones: true }));
    try {
      const { data, error } = await supabase
        .from('suscripciones_cotizacion')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setSuscripciones(data || []);
    } catch (error: any) {
      console.error('Error cargando suscripciones:', error);
      toast.error('Error cargando suscripciones');
      setSuscripciones([]);
    } finally {
      setLoading(prev => ({ ...prev, suscripciones: false }));
    }
  }, []);

  const loadUsersData = useCallback(async () => {
    setLoading(prev => ({ ...prev, users: true }));
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error cargando usuarios:', error);
      toast.error('Error cargando usuarios');
      setUsers([]);
    } finally {
      setLoading(prev => ({ ...prev, users: false }));
    }
  }, []);

  const loadConfigData = useCallback(async () => {
    setLoading(prev => ({ ...prev, config: true }));
    try {
      const { data, error } = await supabase
        .from('config_operaciones')
        .select('*')
        .order('divisa', { ascending: true });

      if (error) throw error;
      setConfig(data || []);
    } catch (error: any) {
      console.error('Error cargando configuración:', error);
      toast.error('Error cargando configuración');
      setConfig([]);
    } finally {
      setLoading(prev => ({ ...prev, config: false }));
    }
  }, []);

  const loadCotizacionesData = useCallback(async (limit = 10) => {
    setLoading(prev => ({ ...prev, cotizaciones: true }));
    try {
      const { data, error } = await supabase
        .from('cotizaciones_cambios_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      const formattedData = data?.map(cot => ({
        ...cot,
        created_at_formatted: new Date(cot.created_at).toLocaleString('es-AR', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit'
        })
      })) || [];

      setCotizaciones(formattedData as CotizacionCambioLog[]);
    } catch (error: any) {
      console.error('Error cargando cotizaciones:', error);
      toast.error('Error cargando historial de cotizaciones');
      setCotizaciones([]);
    } finally {
      setLoading(prev => ({ ...prev, cotizaciones: false }));
    }
  }, []);

  const loadEstadisticasGenerales = useCallback(async () => {
    try {
      const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

      const [usersCount, suscripcionesCount, operacionesCount, movimientosCount] = await Promise.all([
        supabase.from('users').select('*', { count: 'exact', head: true }),
        supabase.from('suscripciones_cotizacion').select('*', { count: 'exact', head: true }).eq('activo', true),
        supabase.from('operaciones_cambio').select('cantidad_entrada, cantidad_salida', { count: 'exact' }).gte('created_at', monthStart),
        supabase.from('movimientos_divisas').select('*', { count: 'exact', head: true }).gte('created_at', monthStart)
      ]);

      let volumenTotal = 0;
      operacionesCount.data?.forEach(op => {
        volumenTotal += (op.cantidad_entrada || 0);
      });

      setEstadisticas({
        total_usuarios: usersCount.count || 0,
        total_suscripciones_activas: suscripcionesCount.count || 0,
        total_operaciones_mes: operacionesCount.count || 0,
        total_movimientos_mes: movimientosCount.count || 0,
        volumen_total_operado: volumenTotal
      });
    } catch (error: any) {
      console.error('Error cargando estadísticas generales:', error);
      setEstadisticas(null);
    }
  }, []);

  return {
    loading,
    kpis,
    dailySummary,
    recentOperations,
    profitByCurrency,
    divisas,
    movimientos,
    suscripciones,
    users,
    config,
    cotizaciones,
    estadisticas,
    setDivisas,
    loadAllDashboardData,
    loadDivisasData,
    updateDivisa,
    loadMovimientosData,
    loadSuscripcionesData,
    loadUsersData,
    loadConfigData,
    loadCotizacionesData,
    loadEstadisticasGenerales,
  };
}
