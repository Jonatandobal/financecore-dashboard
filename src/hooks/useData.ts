// src/hooks/useData.ts - VERSIÓN OPTIMIZADA
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
  PendingOperation,
  UserProfile
} from '@/types';

export function useData(user: UserProfile | null = null) {
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
      const isManager = user?.rol === 'manager';

      // Calcular operaciones del mes
      const today = new Date();
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString();

      let mesQuery = supabase
        .from('operaciones_cambio')
        .select('ganancia_bruta_usd')
        .eq('estado', 'completada')
        .gte('created_at', monthStart);

      if (!isManager && user) {
        mesQuery = mesQuery.eq('user_id', user.id);
      }

      const { data: mesOps, error: mesError } = await mesQuery;
      if (mesError) throw mesError;

      const gananciaMes = mesOps?.reduce((sum, op) => sum + (op.ganancia_bruta_usd || 0), 0) || 0;
      const operacionesMes = mesOps?.length || 0;
      const margenPromedio = operacionesMes > 0 ? gananciaMes / operacionesMes : 0;

      // Calcular operaciones de hoy
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

      let todayQuery = supabase
        .from('operaciones_cambio')
        .select('ganancia_bruta_usd')
        .eq('estado', 'completada')
        .gte('created_at', todayStart);

      if (!isManager && user) {
        todayQuery = todayQuery.eq('user_id', user.id);
      }

      const { data: todayOps, error: todayError } = await todayQuery;

      if (todayError) throw todayError;

      const gananciaHoy = todayOps?.reduce((sum, op) => sum + (op.ganancia_bruta_usd || 0), 0) || 0;
      const operacionesHoy = todayOps?.length || 0;

      setKpis({
        ganancia_hoy: gananciaHoy,
        operaciones_hoy: operacionesHoy,
        ganancia_mes: gananciaMes,
        operaciones_mes: operacionesMes,
        margen_promedio_mes: margenPromedio,
      });
    } catch (error: any) {
      console.error('Error calculando KPIs:', error);
      toast.error('Error calculando KPIs: ' + error.message);
      setKpis(null);
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  }, [user]);

  const loadDailySummaryData = useCallback(async () => {
    setLoading(prev => ({ ...prev, dailySummary: true }));
    try {
      // Usar la vista resumen_diario_ultimos_30_dias
      const { data, error } = await supabase
        .from('resumen_diario_ultimos_30_dias')
        .select('dia, ganancia_usd, operaciones')
        .order('dia', { ascending: true });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        dia: item.dia,
        ganancia_usd: parseFloat(item.ganancia_usd || '0'),
        operaciones: parseInt(item.operaciones || '0'),
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
      const isManager = user?.rol === 'manager';

      let query = supabase
        .from('operaciones_cambio')
        .select('*')
        .eq('estado', 'completada')
        .order('updated_at', { ascending: false })
        .limit(7);

      if (!isManager && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map(op => {
        return {
          numero_operacion: op.numero_operacion,
          created_at: op.created_at,
          usuario_whatsapp_nombre: op.usuario_whatsapp_nombre,
          cantidad_entrada: op.cantidad_entrada,
          divisa_entrada: op.divisa_entrada,
          cantidad_salida: op.cantidad_salida,
          divisa_salida: op.divisa_salida,
          ganancia_bruta_usd: parseFloat(op.ganancia_bruta_usd || '0'),
          estado: 'completada',
          entregado: `${op.cantidad_entrada || ''} ${op.divisa_entrada || ''}`,
          recibido: `${op.cantidad_salida || ''} ${op.divisa_salida || ''}`,
          created_at_formatted: new Date(op.created_at).toLocaleString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
          })
        };
      }) || [];

      setRecentOperations(formattedData as RecentOperation[]);
    } catch (error: any) {
      console.error('Error cargando operaciones recientes:', error);
      toast.error('Error cargando operaciones recientes');
      setRecentOperations([]);
    } finally {
      setLoading(prev => ({ ...prev, recentOps: false }));
    }
  }, [user]);

  const loadProfitByCurrencyData = useCallback(async () => {
    setLoading(prev => ({ ...prev, profitByCurrency: true }));
    try {
      // Usar la vista operaciones_por_divisa
      const { data, error } = await supabase
        .from('operaciones_por_divisa')
        .select('par_divisas, ganancia_total_usd')
        .order('ganancia_total_usd', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        par_divisas: item.par_divisas,
        ganancia_total_usd: parseFloat(item.ganancia_total_usd || '0')
      })) || [];

      setProfitByCurrency(formattedData as ProfitByCurrency[]);
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
      // Usar la vista balance_actual_divisas
      const { data, error } = await supabase
        .from('balance_actual_divisas')
        .select('divisa, precio_compra, precio_venta, stock_actual')
        .order('divisa', { ascending: true });

      if (error) throw error;

      // Mapear a la estructura de Divisa
      const formattedData = data?.map((item, index) => ({
        id: index + 1, // Generar ID temporal
        divisa: item.divisa,
        precio_compra: parseFloat(item.precio_compra || '0'),
        precio_venta: parseFloat(item.precio_venta || '0'),
        stock_disponible: parseFloat(item.stock_actual || '0')
      })) || [];

      setDivisas(formattedData);
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
      const isManager = user?.rol === 'manager';

      let query = supabase
        .from('operaciones_cambio')
        .select('*')
        .eq('estado', 'pendiente')
        .order('created_at', { ascending: false });

      if (!isManager && user) {
        query = query.eq('user_id', user.id);
      }

      const { data, error } = await query;

      if (error) throw error;

      const formattedData = data?.map(op => {
        const createdAt = new Date(op.created_at);
        const now = new Date();
        const horasTranscurridas = (now.getTime() - createdAt.getTime()) / (1000 * 60 * 60);
        const prioridad = horasTranscurridas > 24 ? 'ALTA' : horasTranscurridas > 12 ? 'MEDIA' : 'NORMAL';

        return {
          id: op.id,
          numero_operacion: op.numero_operacion,
          usuario_whatsapp_nombre: op.usuario_whatsapp_nombre,
          usuario_whatsapp_id: op.usuario_whatsapp_id,
          tipo_cambio: `${op.divisa_entrada} → ${op.divisa_salida}`,
          cantidad_entrada: parseFloat(op.cantidad_entrada || '0'),
          cantidad_salida: parseFloat(op.cantidad_salida || '0'),
          ganancia_bruta_usd: parseFloat(op.ganancia_bruta_usd || '0'),
          estado: op.estado,
          created_at: op.created_at,
          horas_transcurridas: horasTranscurridas,
          prioridad: prioridad as 'ALTA' | 'MEDIA' | 'NORMAL',
          tasa_cambio: parseFloat(op.tasa_cambio || '0'),
          precio_entrada: parseFloat(op.precio_entrada || '0'),
          precio_salida: parseFloat(op.precio_salida || '0'),
          divisa_entrada: op.divisa_entrada,
          divisa_salida: op.divisa_salida,
          user_id: op.user_id
        };
      }) || [];

      setPendingOperations(formattedData as PendingOperation[]);
    } catch (error: any) {
      console.error('Error cargando operaciones pendientes:', error);
      toast.error('Error cargando operaciones pendientes');
      setPendingOperations([]);
    } finally {
      setLoading(prev => ({ ...prev, pendingOps: false }));
    }
  }, [user]);

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
      // Actualizar en la tabla base divisas_stock
      const { error } = await supabase
        .from('divisas_stock')
        .update({
          precio_compra: divisa.precio_compra,
          precio_venta: divisa.precio_venta,
          stock_disponible: divisa.stock_disponible,
          updated_at: new Date().toISOString()
        })
        .eq('divisa', divisa.divisa); // Usar divisa como identificador único

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
