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
  PendingOperation
} from '@/types';

export function useData() {
  const [loading, setLoading] = useState<LoadingState>({
    kpis: false,
    dailySummary: false,
    recentOps: false,
    profitByCurrency: false,
    divisas: false,
    pendingOps: false,
  });

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([]);
  const [recentOperations, setRecentOperations] = useState<RecentOperation[]>([]);
  const [profitByCurrency, setProfitByCurrency] = useState<ProfitByCurrency[]>([]);
  const [divisas, setDivisas] = useState<Divisa[]>([]);
  const [pendingOperations, setPendingOperations] = useState<PendingOperation[]>([]);

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

  const loadPendingOperationsData = useCallback(async () => {
    setLoading(prev => ({ ...prev, pendingOps: true }));
    try {
      // Intentar con la vista usando select *
      const { data, error } = await supabase
        .from('operaciones_pendientes')
        .select('*')
        .order('horas_transcurridas', { ascending: false });

      if (error) throw error;

      setPendingOperations(data as PendingOperation[] || []);
    } catch (error: any) {
      console.error('Error cargando operaciones pendientes:', error);
      toast.error('Error cargando operaciones pendientes');
      setPendingOperations([]);
    } finally {
      setLoading(prev => ({ ...prev, pendingOps: false }));
    }
  }, []);

  const loadAllDashboardData = useCallback(async () => {
    await Promise.all([
      loadKpisData(),
      loadDailySummaryData(),
      loadRecentOperationsData(),
      loadProfitByCurrencyData(),
      loadPendingOperationsData(),
    ]);
  }, [loadKpisData, loadDailySummaryData, loadRecentOperationsData, loadProfitByCurrencyData, loadPendingOperationsData]);

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

  const completeOperation = useCallback(async (operationId: string) => {
    setLoading(prev => ({ ...prev, pendingOps: true }));
    try {
      const { error } = await supabase
        .from('operaciones_cambio')
        .update({
          estado: 'completada',
          updated_at: new Date().toISOString()
        })
        .eq('id', operationId);

      if (error) throw error;

      toast.success('Operación completada exitosamente');

      // Reload data to refresh the dashboard
      await Promise.all([
        loadPendingOperationsData(),
        loadRecentOperationsData(),
        loadKpisData(),
      ]);
    } catch (error: any) {
      console.error('Error completando operación:', error);
      toast.error('Error al completar operación: ' + error.message);
    } finally {
      setLoading(prev => ({ ...prev, pendingOps: false }));
    }
  }, [loadPendingOperationsData, loadRecentOperationsData, loadKpisData]);

  return {
    loading,
    kpis,
    dailySummary,
    recentOperations,
    profitByCurrency,
    divisas,
    pendingOperations,
    setDivisas,
    loadAllDashboardData,
    loadDivisasData,
    updateDivisa,
    completeOperation,
  };
}
