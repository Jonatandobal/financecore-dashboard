'use client'

import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../../lib/supabase';

interface Divisa {
  id: number;
  divisa: string;
  precio_compra: number;
  precio_venta: number;
  stock_disponible: number;
  updated_at?: string;
}

export default function DivisasMVP() {
  const [divisas, setDivisas] = useState<Divisa[]>([]);
  const [dashboard, setDashboard] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadDivisas();
    loadDashboard();
  }, []);

  const loadDivisas = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('divisas_stock')
        .select('*')
        .order('id', { ascending: true });

      if (error) throw error;

      if (data && data.length > 0) {
        setDivisas(data);
        setMessage('✅ Divisas cargadas desde Supabase');
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage('⚠️ No hay divisas en la base de datos');
      }
    } catch (error: any) {
      console.error('Error cargando divisas:', error);
      setMessage('❌ Error conectando a Supabase: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadDashboard = async () => {
  try {
    // Contar sesiones únicas (números únicos) de hoy
    const hoy = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('chat_memory')
      .select('session_id')
      .gte('created_at', hoy);

    if (error) throw error;

    // Contar session_id únicos
    const sessionesUnicas = new Set(data?.map(item => item.session_id) || []);
    const consultasHoy = sessionesUnicas.size;

    setDashboard({ consultasHoy });
  } catch (error) {
    console.error('Error cargando dashboard:', error);
    setDashboard({ consultasHoy: 0 });
  }
};

  const updateDivisa = async (divisa: Divisa) => {
    setLoading(true);
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

      setMessage(`✅ ${divisa.divisa} actualizada correctamente`);
      loadDivisas();
      setTimeout(() => setMessage(''), 3000);
    } catch (error: any) {
      console.error('Error actualizando:', error);
      setMessage('❌ Error actualizando: ' + error.message);
    }
    setLoading(false);
  };

  const handleDivisaChange = (index: number, field: keyof Divisa, value: string) => {
    const newDivisas = [...divisas];
    newDivisas[index] = { ...newDivisas[index], [field]: parseFloat(value) || 0 };
    setDivisas(newDivisas);
  };

  const DashboardTab = () => {
    const consultasHoy = dashboard?.consultasHoy || 0;
    const metricas = [
      { nombre: 'Consultas Hoy', valor: consultasHoy, icono: '📊', color: 'bg-blue-500' },
      { nombre: 'Divisas Activas', valor: divisas.length, icono: '💰', color: 'bg-green-500' },
      { nombre: 'Stock Total USD', valor: divisas.find(d => d.divisa === 'USD')?.stock_disponible || 0, icono: '💵', color: 'bg-purple-500' },
      { nombre: 'Bot Status', valor: 'Activo', icono: '🤖', color: 'bg-cyan-500' }
    ];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">📊 Dashboard de Operaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {metricas.map((metrica, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`${metrica.color} px-4 py-2`}>
                <div className="flex items-center">
                  <span className="text-2xl mr-2">{metrica.icono}</span>
                  <span className="text-white font-semibold">{metrica.nombre}</span>
                </div>
              </div>
              <div className="p-4">
                <div className="text-2xl font-bold text-gray-800">
                  {typeof metrica.valor === 'number' ? metrica.valor.toLocaleString() : metrica.valor}
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">💰 Stock Disponible por Divisa</h3>
          {divisas.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={divisas}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="divisa" />
                <YAxis />
                <Tooltip formatter={(value) => [Number(value).toLocaleString(), 'Stock']} />
                <Bar dataKey="stock_disponible" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center text-gray-500 py-8">
              No hay datos para mostrar
            </div>
          )}
        </div>
      </div>
    );
  };

  const DivisasTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">💰 Gestión de Divisas</h2>
        <button 
          onClick={loadDivisas} 
          disabled={loading}
          className="bg-gray-500 hover:bg-gray-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {loading ? '⏳' : '🔄'} Actualizar
        </button>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Divisa</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Compra</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Precio Venta</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {divisas.length > 0 ? (
                divisas.map((divisa, index) => (
                  <tr key={divisa.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">
                          {divisa.divisa === 'USD' && '💵'}
                          {divisa.divisa === 'EUR' && '💶'}
                          {divisa.divisa === 'REAL' && '🇧🇷'}
                          {divisa.divisa === 'BTC' && '₿'}
                          {divisa.divisa === 'ETH' && '⟠'}
                          {divisa.divisa === 'ARS' && '🇦🇷'}
                        </span>
                        <span className="font-semibold text-gray-900">{divisa.divisa}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={divisa.precio_compra}
                        onChange={(e) => handleDivisaChange(index, 'precio_compra', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={divisa.precio_venta}
                        onChange={(e) => handleDivisaChange(index, 'precio_venta', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <input
                        type="number"
                        value={divisa.stock_disponible}
                        onChange={(e) => handleDivisaChange(index, 'stock_disponible', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        step="0.01"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => updateDivisa(divisa)}
                        disabled={loading}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors flex items-center"
                      >
                        {loading ? '⏳' : '💾'} Guardar
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    {loading ? 'Cargando divisas...' : 'No hay divisas disponibles'}
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
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Estado Actual</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span>Bot Telegram:</span>
              <span className="text-green-600 font-semibold">🟢 Activo</span>
            </div>
            <div className="flex justify-between">
              <span>Base de Datos:</span>
              <span className="text-green-600 font-semibold">🟢 Conectada</span>
            </div>
            <div className="flex justify-between">
              <span>API Endpoints:</span>
              <span className="text-green-600 font-semibold">🟢 Funcionando</span>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Acciones Rápidas</h3>
          <div className="space-y-3">
            <button className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors">
              📊 Ver Logs del Bot
            </button>
            <button className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors">
              🔄 Reiniciar Bot
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">💱</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Casa de Cambio Bot</h1>
                <p className="text-sm text-gray-600">Panel de Administración MVP</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-600">Última actualización</div>
              <div className="text-sm font-medium text-gray-900">{new Date().toLocaleString()}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="flex space-x-1 bg-white rounded-xl p-1 shadow-lg">
          {[
            { id: 'dashboard', name: 'Dashboard', icon: '📊' },
            { id: 'divisas', name: 'Divisas', icon: '💰' },
            { id: 'bot', name: 'Bot Status', icon: '🤖' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.name}</span>
            </button>
          ))}
        </div>
      </div>

      {message && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className={`rounded-lg p-4 ${
            message.includes('✅') ? 'bg-green-100 text-green-800' : 
            message.includes('⚠️') ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {message}
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-12">
        {activeTab === 'dashboard' && <DashboardTab />}
        {activeTab === 'divisas' && <DivisasTab />}
        {activeTab === 'bot' && <BotTab />}
      </div>
    </div>
  );
}