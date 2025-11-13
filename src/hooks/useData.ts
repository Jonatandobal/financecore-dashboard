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
      // Usar la vista ganancias_mes_actual
      const { data: gananciaMesData, error: gananciaMesError } = await supabase
        .from('ganancias_mes_actual')
        .select('*')
        .single();

      if (gananciaMesError) throw gananciaMesError;

      // Calcular operaciones de hoy manualmente
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString();

      const { data: todayOps, error: todayError } = await supabase
        .from('operaciones_cambio')
        .select('ganancia_bruta_usd')
        .eq('estado', 'completada')
        .gte('created_at', todayStart);

      if (todayError) throw todayError;

      const gananciaHoy = todayOps?.reduce((sum, op) => sum + (op.ganancia_bruta_usd || 0), 0) || 0;
      const operacionesHoy = todayOps?.length || 0;

      setKpis({
        ganancia_hoy: gananciaHoy,
        operaciones_hoy: operacionesHoy,
        ganancia_mes: gananciaMesData.ganancia_total_usd || 0,
        operaciones_mes: gananciaMesData.total_operaciones || 0,
        margen_promedio_mes: gananciaMesData.margen_promedio || 0,
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
      // Usar la vista operaciones_completadas
      const { data, error } = await supabase
        .from('operaciones_completadas')
        .select(`
          numero_operacion,
          fecha_creacion,
          usuario_telegram_nombre,
          cantidad_entrada,
          cantidad_salida,
          ganancia_bruta_usd,
          tipo_cambio
        `)
        .order('fecha_completada', { ascending: false })
        .limit(7);

      if (error) throw error;

      const formattedData = data?.map(op => {
        // Extraer divisas del tipo_cambio (formato: "ARS → USD")
        const [divisa_entrada, divisa_salida] = op.tipo_cambio?.split(' → ') || ['', ''];
        
        return {
          numero_operacion: op.numero_operacion,
          created_at: op.fecha_creacion,
          usuario_telegram_nombre: op.usuario_telegram_nombre,
          cantidad_entrada: op.cantidad_entrada,
          divisa_entrada: divisa_entrada,
          cantidad_salida: op.cantidad_salida,
          divisa_salida: divisa_salida,
          ganancia_bruta_usd: parseFloat(op.ganancia_bruta_usd || '0'),
          estado: 'completada',
          entregado: `${op.cantidad_entrada || ''} ${divisa_entrada}`,
          recibido: `${op.cantidad_salida || ''} ${divisa_salida}`,
          created_at_formatted: new Date(op.fecha_creacion).toLocaleString('es-AR', {
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
  }, []);

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
      // Usar la vista operaciones_pendientes
      const { data, error } = await supabase
        .from('operaciones_pendientes')
        .select('*')
        .order('horas_transcurridas', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(op => ({
        id: op.id,
        numero_operacion: op.numero_operacion,
        usuario_telegram_nombre: op.usuario_telegram_nombre,
        usuario_telegram_id: op.usuario_telegram_id,
        tipo_cambio: op.tipo_cambio,
        cantidad_entrada: parseFloat(op.cantidad_entrada || '0'),
        cantidad_salida: parseFloat(op.cantidad_salida || '0'),
        ganancia_bruta_usd: parseFloat(op.ganancia_bruta_usd || '0'),
        estado: op.estado,
        created_at: op.created_at,
        horas_transcurridas: parseFloat(op.horas_transcurridas || '0'),
        prioridad: op.prioridad as 'ALTA' | 'MEDIA' | 'NORMAL',
        tasa_cambio: parseFloat(op.tasa_cambio || '0'),
        precio_entrada: parseFloat(op.precio_entrada || '0'),
        precio_salida: parseFloat(op.precio_salida || '0'),
        divisa_entrada: op.divisa_entrada,
        divisa_salida: op.divisa_salida
      })) || [];

      setPendingOperations(formattedData as PendingOperation[]);
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
