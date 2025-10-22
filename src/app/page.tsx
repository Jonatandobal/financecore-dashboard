'use client'

import React, { useState, useEffect, useMemo } from 'react';
// Importa los componentes necesarios de Recharts
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { supabase } from '../../lib/supabase'; // Asegúrate que la ruta sea correcta

// --- TIPOS DE DATOS (Ajustados según tus tablas y vistas probables) ---

interface KpiData {
  ganancia_hoy: number;
  operaciones_hoy: number;
  ganancia_mes: number;
  operaciones_mes: number; // Añadido operaciones del mes
  margen_promedio_mes: number;
}

interface DailySummary {
  dia: string;
  ganancia_usd: number | null;
  operaciones: number | null;
  diaLabel?: string; // Para mostrar en el gráfico
}

interface RecentOperation {
  numero_operacion: string;
  created_at: string;
  created_at_formatted?: string; // Para mostrar en la tabla
  usuario_telegram_nombre: string | null;
  entregado: string;
  recibido: string;
  ganancia_bruta_usd: number | null;
  estado: string;
  // Añadimos los campos originales para construir entregado/recibido si es necesario
  cantidad_entrada?: number | null;
  divisa_entrada?: string | null;
  cantidad_salida?: number | null;
  divisa_salida?: string | null;
}

// Usaremos la vista 'operaciones_por_divisa' (asumiendo que existe)
interface ProfitByCurrency {
  par_divisas: string; // Columna probable de la vista 'operaciones_por_divisa'
  ganancia_total_usd: number;
  // Puedes añadir 'operaciones' si la vista lo incluye y lo necesitas
}

interface Divisa {
  id: number;
  divisa: string;
  precio_compra: number;
  precio_venta: number;
  stock_disponible: number;
  updated_at?: string;
}

// --- COMPONENTE PRINCIPAL ---

export default function HemisferiaDashboard() {
  // --- ESTADO ---
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState({
    kpis: false,
    dailySummary: false,
    recentOps: false,
    profitByCurrency: false,
    divisas: false,
  });
  const [message, setMessage] = useState('');

  const [kpis, setKpis] = useState<KpiData | null>(null);
  const [dailySummary, setDailySummary] = useState<DailySummary[]>([]);
  const [recentOperations, setRecentOperations] = useState<RecentOperation[]>([]);
  const [profitByCurrency, setProfitByCurrency] = useState<ProfitByCurrency[]>([]);
  const [divisas, setDivisas] = useState<Divisa[]>([]);

  // --- EFECTOS ---
  useEffect(() => {
    loadAllDashboardData();
    loadDivisasData();
  }, []);

  // --- FUNCIONES DE CARGA DE DATOS ---

  const showMessage = (text: string, type: 'success' | 'warning' | 'error') => {
    let prefix = '';
    if (type === 'success') prefix = '✅ ';
    if (type === 'warning') prefix = '⚠️ ';
    if (type === 'error') prefix = '❌ ';
    setMessage(prefix + text);
    setTimeout(() => setMessage(''), 4000);
  };

  const loadAllDashboardData = async () => {
    await Promise.all([
      loadKpisData(),
      loadDailySummaryData(),
      loadRecentOperationsData(),
      loadProfitByCurrencyData(),
    ]);
  };

  // ***** FUNCIÓN KPI MODIFICADA *****
  // Calcula los KPIs directamente desde 'operaciones_cambio'
  const loadKpisData = async () => {
    setLoading(prev => ({ ...prev, kpis: true }));
    try {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString(); // Hoy a las 00:00 UTC
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1).toISOString(); // Principio de mes UTC

      // Consulta para obtener agregados
      const { data, error } = await supabase
        .from('operaciones_cambio')
        .select('ganancia_bruta_usd, margen_porcentaje, created_at', { count: 'exact' }) // Pedimos el conteo total también implícitamente
        .eq('estado', 'completada') // Solo operaciones completadas
        .gte('created_at', monthStart); // Desde el inicio del mes actual

      if (error) throw error;

      // Calcular KPIs desde los datos devueltos
      let gananciaHoy = 0;
      let operacionesHoy = 0;
      let gananciaMes = 0;
      let operacionesMes = 0;
      let margenSumaMes = 0;

      data?.forEach(op => {
        const opDate = new Date(op.created_at);
        const opDateStart = new Date(opDate.getFullYear(), opDate.getMonth(), opDate.getDate()).toISOString();

        // Sumar al mes
        gananciaMes += op.ganancia_bruta_usd || 0;
        operacionesMes++;
        margenSumaMes += op.margen_porcentaje || 0;

        // Sumar a hoy si coincide la fecha
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
        operaciones_mes: operacionesMes, // Añadido
        margen_promedio_mes: margenPromedioMes,
      });

    } catch (error: any) {
      console.error('Error calculando KPIs:', error);
      showMessage('Error calculando KPIs: ' + error.message, 'error');
      setKpis(null);
    } finally {
      setLoading(prev => ({ ...prev, kpis: false }));
    }
  };


  const loadDailySummaryData = async () => {
    setLoading(prev => ({ ...prev, dailySummary: true }));
    try {
      // **VERIFICAR**: Asegúrate que la vista 'resumen_diario_ultimos_30_dias' existe en Supabase.
      const { data, error } = await supabase
        .from('resumen_diario_ultimos_30_dias') // Usamos el nombre esperado de la vista
        .select('dia, ganancia_usd, operaciones')
        .order('dia', { ascending: true });

      if (error) throw error;
      const formattedData = data?.map(item => ({
        ...item,
        diaLabel: item.dia ? new Date(item.dia + 'T00:00:00Z').toLocaleDateString('es-AR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' }) : 'N/A'
      })) || [];
      setDailySummary(formattedData);
    } catch (error: any) {
      console.error('Error cargando resumen diario:', error);
      // Mensaje más específico si la vista no existe
      if (error.message.includes('relation "resumen_diario_ultimos_30_dias" does not exist')) {
           showMessage('Error: La vista "resumen_diario_ultimos_30_dias" no existe en Supabase. Verifica que el script SQL se ejecutó.', 'error');
      } else {
           showMessage('Error cargando resumen diario: ' + error.message, 'error');
      }
      setDailySummary([]); // Limpiar datos si hay error
    } finally {
      setLoading(prev => ({ ...prev, dailySummary: false }));
    }
  };

 const loadRecentOperationsData = async () => {
    setLoading(prev => ({ ...prev, recentOps: true }));
    try {
        // Usamos la tabla 'operaciones_cambio' que SÍ existe
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
            created_at_formatted: new Date(op.created_at).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'}) // Formato más corto
        })) || [];

        setRecentOperations(formattedData as RecentOperation[]);
    } catch (error: any) {
        console.error('Error cargando operaciones recientes:', error);
        showMessage('Error cargando operaciones recientes: ' + error.message, 'error');
        setRecentOperations([]);
    } finally {
        setLoading(prev => ({ ...prev, recentOps: false }));
    }
};


  const loadProfitByCurrencyData = async () => {
    setLoading(prev => ({ ...prev, profitByCurrency: true }));
    try {
      // **VERIFICAR**: Asume que existe la vista 'operaciones_por_divisa' creada por tus scripts.
      // Ajusta 'par_divisas' si la columna en tu vista se llama diferente.
      const { data, error } = await supabase
        .from('operaciones_por_divisa') // Usamos el nombre de vista probable
        .select('par_divisas, ganancia_total_usd') // Asegúrate que estas columnas existan en la vista
        .order('ganancia_total_usd', { ascending: false });

      if (error) throw error;
      setProfitByCurrency(data as ProfitByCurrency[] || []);
    } catch (error: any) {
      console.error('Error cargando ganancias por divisa:', error);
       if (error.message.includes('relation "operaciones_por_divisa" does not exist')) {
           showMessage('Error: La vista "operaciones_por_divisa" no existe. Verifica que el script SQL se ejecutó.', 'error');
      } else if (error.message.includes('column "par_divisas" does not exist')) {
           showMessage('Error: La columna "par_divisas" no existe en la vista "operaciones_por_divisa". Revisa la definición de la vista.', 'error');
      }
      else {
           showMessage('Error cargando ganancias por divisa: ' + error.message, 'error');
      }
      setProfitByCurrency([]); // Limpiar datos si hay error
    } finally {
      setLoading(prev => ({ ...prev, profitByCurrency: false }));
    }
  };

  const loadDivisasData = async () => {
    setLoading(prev => ({ ...prev, divisas: true }));
    try {
      // Usamos la tabla 'divisas_stock' que SÍ existe
      const { data, error } = await supabase
        .from('divisas_stock')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;
      setDivisas(data || []);
    } catch (error: any) {
      console.error('Error cargando divisas:', error);
      showMessage('Error cargando lista de divisas: ' + error.message, 'error');
      setDivisas([]);
    } finally {
      setLoading(prev => ({ ...prev, divisas: false }));
    }
  };

  // --- RESTO DE FUNCIONES (updateDivisa, handleDivisaChange) ---
  // (Sin cambios, puedes copiar las de la respuesta anterior)
    const updateDivisa = async (divisa: Divisa) => {
    setLoading(prev => ({ ...prev, divisas: true })); // Reutilizamos el loading de divisas
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

      showMessage(`${divisa.divisa} actualizada correctamente`, 'success');
      loadDivisasData(); // Recarga la lista de divisas
    } catch (error: any) {
      console.error('Error actualizando:', error);
      showMessage('Error actualizando divisa: ' + error.message, 'error');
    }
    setLoading(prev => ({ ...prev, divisas: false }));
  };

  const handleDivisaChange = (index: number, field: keyof Divisa, value: string) => {
    const newDivisas = [...divisas];
    const numValue = parseFloat(value);
    // Validar que no sea NaN antes de asignar
    newDivisas[index] = { ...newDivisas[index], [field]: isNaN(numValue) ? newDivisas[index][field] : numValue };
    setDivisas(newDivisas);
  };

  // --- COMPONENTES DE TABS Y AUXILIARES ---
  // (Sin cambios significativos en la estructura, puedes copiar DashboardTab, KpiCard, InfoWidget, DivisasTab, BotTab de la respuesta anterior)

      const DashboardTab = () => {
        const stockUSD = useMemo(() => {
            return divisas.find(d => d.divisa === 'USD')?.stock_disponible || 0;
        }, [divisas]);

        const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280']; // Verde, Azul, Violeta, Naranja, Rojo, Gris

        const pieChartData = useMemo(() => {
          if (!profitByCurrency || profitByCurrency.length === 0) return [];
          // Agrupamos por divisa principal (ej. USD/ARS -> USD, ARS/USD -> ARS) si 'par_divisas' existe
           const grouped = profitByCurrency.reduce((acc, item) => {
                // Heurística simple para extraer la divisa base o vendida del par
                const name = item.par_divisas?.split('/')[1] || item.par_divisas || 'Desconocido'; // Intenta obtener la segunda divisa (la vendida)
                acc[name] = (acc[name] || 0) + item.ganancia_total_usd;
                return acc;
            }, {} as Record<string, number>);

            const sortedEntries = Object.entries(grouped).sort(([, a], [, b]) => b - a);

            const top5 = sortedEntries.slice(0, 5);
            const othersValue = sortedEntries.slice(5).reduce((sum, [, value]) => sum + value, 0);

            let result = top5.map(([name, value]) => ({ name, value }));

            if (othersValue > 0) {
                result.push({ name: 'Otros', value: othersValue });
            }
            return result;

        }, [profitByCurrency]);


        return (
          <div className="space-y-6">
            {/* --- KPIs --- */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard
                title="Ganancia HOY"
                value={kpis?.ganancia_hoy}
                isLoading={loading.kpis}
                isCurrency={true}
                // change="+15%" // Placeholder
                // changeColor="text-green-600"
                icon="💵"
              />
              <KpiCard
                title="Operaciones HOY"
                value={kpis?.operaciones_hoy}
                isLoading={loading.kpis}
                // change="+5" // Placeholder
                // changeColor="text-green-600"
                icon="🔄"
              />
              <KpiCard
                title="Ganancia MES"
                value={kpis?.ganancia_mes}
                isLoading={loading.kpis}
                isCurrency={true}
                icon="💰"
              />
              <KpiCard
                title="Margen MES"
                value={kpis?.margen_promedio_mes}
                isLoading={loading.kpis}
                isPercentage={true}
                icon="📈"
              />
            </div>

            {/* --- Gráficos Principales --- */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Gráfico de Línea - ocupa 2/3 */}
              <div className="lg:col-span-2 bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Ganancias (Últimos 30 Días)</h3>
                {loading.dailySummary ? (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">Cargando gráfico...</div>
                ) : dailySummary.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={dailySummary} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                      <XAxis dataKey="diaLabel" fontSize={12} />
                      <YAxis fontSize={12} tickFormatter={(value) => `$${value.toLocaleString()}`} width={60} />
                      <Tooltip formatter={(value: number) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, 'Ganancia']} />
                      <Line type="monotone" dataKey="ganancia_usd" stroke="#10B981" strokeWidth={2} dot={false} activeDot={{ r: 6 }} name="Ganancia USD"/>
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[300px] flex items-center justify-center text-gray-500">No hay datos de ganancias diarias.</div>
                )}
              </div>

              {/* Widgets Laterales - ocupa 1/3 */}
              <div className="space-y-4">
                <InfoWidget title="Stock Total (USD)" value={stockUSD} isCurrency={true} isLoading={loading.divisas} icon="🏦" />
                <InfoWidget title="Bot Status" value="Activo" icon="🤖" valueColor="text-green-600" />
                {/* Gráfico de Dona */}
                <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4">
                    <h3 className="text-base font-semibold text-gray-800 mb-2 text-center">Top Divisas Vendidas (Ganancia Mes)</h3>
                    {loading.profitByCurrency ? (
                        <div className="h-[150px] flex items-center justify-center text-gray-500">Cargando...</div>
                    ) : pieChartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={150}>
                            <PieChart>
                                <Pie
                                    data={pieChartData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={40}
                                    outerRadius={60}
                                    fill="#8884d8"
                                    paddingAngle={3}
                                    dataKey="value"
                                    nameKey="name" // Importante para Tooltip
                                >
                                    {pieChartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number, name: string) => [`$${value.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`, name]}/>
                                {/* Podrías añadir Legend si quieres, ajusta el layout */}
                                {/* <Legend verticalAlign="bottom" height={36}/> */}
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-[150px] flex items-center justify-center text-gray-500">Sin datos de ganancias.</div>
                    )}
                </div>
              </div>
            </div>

            {/* --- Tabla de Operaciones Recientes --- */}
            <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Operaciones Recientes</h3>
                {/* Podrías enlazar a una página completa de historial si la creas */}
                {/* <button className="text-sm text-blue-600 hover:underline">Ver todas</button> */}
              </div>
              <div className="overflow-x-auto">
                {loading.recentOps ? (
                    <div className="text-center py-4 text-gray-500">Cargando operaciones...</div>
                ) : recentOperations.length > 0 ? (
                    <table className="w-full min-w-[700px]"> {/* Aumentado min-w */}
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nro</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Entregó</th>
                            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recibió</th>
                            <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Ganancia</th>
                            <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {recentOperations.map((op) => (
                            <tr key={op.numero_operacion} className="hover:bg-gray-50">
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700 font-mono">{op.numero_operacion}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-500">{op.created_at_formatted}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm font-medium text-gray-900 truncate max-w-[120px]">{op.usuario_telegram_nombre || 'N/A'}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{op.entregado}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-700">{op.recibido}</td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-right font-medium text-green-700">
                                {op.ganancia_bruta_usd != null ? `$${op.ganancia_bruta_usd.toLocaleString(undefined,{minimumFractionDigits: 2, maximumFractionDigits: 2})}` : '-'}
                            </td>
                            <td className="px-3 py-3 whitespace-nowrap text-sm text-center">
                                <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                    op.estado === 'completada' ? 'bg-green-100 text-green-800' :
                                    op.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                                    op.estado === 'cancelada' ? 'bg-red-100 text-red-800' :
                                     op.estado === 'escalada' ? 'bg-purple-100 text-purple-800' : // Añadido estado escalada
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {op.estado}
                                </span>
                            </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                ) : (
                    <div className="text-center py-4 text-gray-500">No hay operaciones recientes.</div>
                )}
              </div>
            </div>
          </div>
        );
      };

    // Componente reutilizable para las tarjetas KPI
    const KpiCard = ({ title, value, isLoading, isCurrency = false, isPercentage = false, change, changeColor = 'text-gray-500', icon } : {
        title: string;
        value: number | null | undefined;
        isLoading: boolean;
        isCurrency?: boolean;
        isPercentage?: boolean;
        change?: string;
        changeColor?: string;
        icon: string;
    }) => (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 min-h-[100px] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-gray-500">{title}</span>
                  <span className="text-xl opacity-70">{icon}</span>
              </div>
              {isLoading ? (
                  <div className="h-7 bg-gray-200 rounded animate-pulse w-3/4 mt-1"></div> // Ajustado altura
              ) : (
                  <div className="text-2xl font-bold text-gray-900">
                      {value != null ?
                          (isCurrency ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                          isPercentage ? `${value.toFixed(2)}%` :
                          value.toLocaleString())
                          : '-'}
                  </div>
              )}
            </div>
            {change && !isLoading && (
                <div className={`text-xs mt-1 ${changeColor}`}>{change}</div>
            )}
            {/* Placeholder para change si está cargando */}
            {isLoading && <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4 mt-1"></div>}
        </div>
    );

    // Componente reutilizable para widgets de información simple
    const InfoWidget = ({ title, value, isLoading = false, isCurrency = false, icon, valueColor = 'text-gray-900' } : {
        title: string;
        value: string | number | null | undefined;
        isLoading?: boolean;
        isCurrency?: boolean;
        icon: string;
        valueColor?: string;
    }) => (
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-4 min-h-[90px] flex flex-col justify-center">
            <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-gray-500">{title}</span>
                <span className="text-xl opacity-70">{icon}</span>
            </div>
            {isLoading ? (
                <div className="h-7 bg-gray-200 rounded animate-pulse w-3/4 mt-1"></div>
            ) : (
                 <div className={`text-2xl font-bold ${valueColor}`}>
                    {value != null ?
                        (isCurrency ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` :
                         value)
                        : '-'}
                 </div>
            )}
        </div>
    );

   const DivisasTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">💰 Gestión de Divisas</h2>
        <button
          onClick={loadDivisasData}
          disabled={loading.divisas}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors text-sm flex items-center space-x-1"
        >
          {loading.divisas ? '⏳' : '🔄'} <span>Actualizar</span>
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisa</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Compra (Cliente entrega)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta (Cliente recibe)</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Disponible</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {divisas.length > 0 ? (
                divisas.map((divisa, index) => (
                  <tr key={divisa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {/* Iconos mejorados */}
                        <span className="text-2xl mr-2 w-6 text-center">
                          {divisa.divisa === 'USD' ? '🇺🇸' :
                           divisa.divisa === 'EUR' ? '🇪🇺' :
                           divisa.divisa === 'REAL' ? '🇧🇷' :
                           divisa.divisa === 'BTC' ? '₿' :
                           divisa.divisa === 'ETH' ? 'Ξ' : // Usando Ξ para ETH
                           divisa.divisa === 'ARS' ? '🇦🇷' : '🏳️'}
                        </span>
                        <span className="font-semibold text-gray-900">{divisa.divisa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={divisa.precio_compra}
                        onChange={(e) => handleDivisaChange(index, 'precio_compra', e.target.value)}
                        className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="any" // Permite más decimales si es necesario
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={divisa.precio_venta}
                        onChange={(e) => handleDivisaChange(index, 'precio_venta', e.target.value)}
                         className="w-full max-w-[120px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="any"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={divisa.stock_disponible}
                        onChange={(e) => handleDivisaChange(index, 'stock_disponible', e.target.value)}
                         className="w-full max-w-[150px] px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                        step="any"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => updateDivisa(divisa)}
                        disabled={loading.divisas}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-3 py-1.5 rounded-md transition-colors flex items-center text-sm"
                      >
                        {loading.divisas ? '⏳' : '💾'} <span className="ml-1">Guardar</span>
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {loading.divisas ? 'Cargando divisas...' : 'No hay divisas disponibles'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

   const BotTab = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🤖 Estado del Bot</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado Actual</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Bot Telegram:</span>
              <span className="text-green-600 font-semibold flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> Activo</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Base de Datos Supabase:</span>
              <span className="text-green-600 font-semibold flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> Conectada</span>
            </div>
             <div className="flex justify-between items-center">
              <span className="text-gray-600">Workflow n8n:</span>
              <span className="text-green-600 font-semibold flex items-center"><span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span> Activo</span> {/* Asumiendo que está activo */}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Enlaces Útiles</h3>
          <div className="space-y-3">
             {/* Reemplaza '#' con tus URLs reales */}
            <a href="https://app.supabase.com/" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300">
              Ir a Supabase ↗️
            </a>
             <a href="#" target="_blank" rel="noopener noreferrer" className="block w-full text-center bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors border border-gray-300">
              Ir a n8n ↗️ {/* Reemplaza con tu URL de n8n */}
            </a>
            {/* Puedes añadir más enlaces */}
          </div>
        </div>
      </div>
    </div>
  );

  // --- RENDERIZADO PRINCIPAL ---
  return (
    <div className="min-h-screen bg-gray-50 font-sans"> {/* Añadido font-sans */}
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo y Título */}
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">H</div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900">Hemisferia</h1>
                <p className="text-xs text-gray-500">Panel de Operaciones</p>
              </div>
            </div>
            {/* Fecha/Hora Actualización */}
            <div className="text-right hidden sm:block">
              <div className="text-xs text-gray-500">Última actualización</div>
              <div className="text-sm font-medium text-gray-700">{new Date().toLocaleString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Pestañas (Tabs) */}
        <div className="mb-6">
            <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm border border-gray-200 max-w-md">
            {[
                { id: 'dashboard', name: 'Dashboard', icon: '📊' },
                { id: 'divisas', name: 'Divisas', icon: '💰' },
                { id: 'bot', name: 'Bot Status', icon: '🤖' }
            ].map((tab) => (
                <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                 className={`flex-1 flex items-center justify-center space-x-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm' // Azul un poco más oscuro
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                 }`}
                >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
                </button>
            ))}
            </div>
        </div>

        {/* Mensaje Global */}
        {message && (
          <div className="mb-4">
            <div className={`rounded-md p-3 text-sm shadow-sm ${
              message.includes('✅') ? 'bg-green-50 text-green-800 border border-green-200' :
              message.includes('⚠️') ? 'bg-yellow-50 text-yellow-800 border border-yellow-200' :
              'bg-red-50 text-red-800 border border-red-200'
            }`}>
              {message}
            </div>
          </div>
        )}

        {/* Contenido de la Pestaña Activa */}
        <div>
          {activeTab === 'dashboard' && <DashboardTab />}
          {activeTab === 'divisas' && <DivisasTab />}
          {activeTab === 'bot' && <BotTab />}
        </div>
      </main>

       {/* Footer simple */}
       <footer className="text-center py-4 border-t border-gray-200 mt-8">
            <p className="text-xs text-gray-500">&copy; {new Date().getFullYear()} Hemisferia. Todos los derechos reservados.</p>
       </footer>
    </div>
  );
}