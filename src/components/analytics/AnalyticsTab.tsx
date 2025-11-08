'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Users, UserCheck, TrendingUp, Activity, Download } from 'lucide-react';
import { InfoWidget } from '@/components/ui/InfoWidget';
import { exportToExcelMultiSheet, getTimestampForFilename } from '@/lib/utils/exportUtils';
import type { EstadisticasGenerales, SuscripcionCotizacion, User, CotizacionCambioLog, LoadingState } from '@/types';

interface AnalyticsTabProps {
  estadisticas: EstadisticasGenerales | null;
  suscripciones: SuscripcionCotizacion[];
  users: User[];
  cotizaciones: CotizacionCambioLog[];
  loading: LoadingState;
}

export function AnalyticsTab({ estadisticas, suscripciones, users, cotizaciones, loading }: AnalyticsTabProps) {
  const handleExportAll = () => {
    const timestamp = getTimestampForFilename();

    exportToExcelMultiSheet([
      {
        data: users,
        sheetName: 'Usuarios',
        headers: {
          id: 'ID',
          email: 'Email',
          nombre: 'Nombre',
          created_at: 'Fecha Registro',
          ultimo_acceso: 'Último Acceso'
        }
      },
      {
        data: suscripciones,
        sheetName: 'Suscripciones',
        headers: {
          id: 'ID',
          chat_id: 'Chat ID',
          usuario_nombre: 'Usuario',
          activo: 'Activo',
          created_at: 'Fecha Creación',
          updated_at: 'Última Actualización'
        }
      },
      {
        data: cotizaciones,
        sheetName: 'Cotizaciones',
        headers: {
          id: 'ID',
          divisa_origen: 'Divisa Origen',
          divisa_destino: 'Divisa Destino',
          tasa_anterior: 'Tasa Anterior',
          tasa_nueva: 'Tasa Nueva',
          cambio_porcentaje: 'Cambio %',
          created_at_formatted: 'Fecha'
        }
      }
    ], `analytics_completo_${timestamp}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            📈 Analytics & Estadísticas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Estadísticas generales y métricas avanzadas
          </p>
        </div>
        <motion.button
          onClick={handleExportAll}
          disabled={users.length === 0 && suscripciones.length === 0 && cotizaciones.length === 0}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Download className="w-5 h-5" />
          <span>Exportar Todo</span>
        </motion.button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <InfoWidget
          title="Total Usuarios"
          value={estadisticas?.total_usuarios}
          icon="👥"
          index={0}
        />
        <InfoWidget
          title="Suscripciones Activas"
          value={estadisticas?.total_suscripciones_activas}
          icon="✅"
          valueColor="text-emerald-600 dark:text-emerald-400"
          index={1}
        />
        <InfoWidget
          title="Operaciones Mes"
          value={estadisticas?.total_operaciones_mes}
          icon="🔄"
          index={2}
        />
        <InfoWidget
          title="Movimientos Mes"
          value={estadisticas?.total_movimientos_mes}
          icon="📦"
          index={3}
        />
      </div>

      {/* Two columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg">
                <Users className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Usuarios Recientes</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Últimos {users.length} usuarios registrados</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {loading.users ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse" />
                ))
              ) : users.length > 0 ? (
                users.slice(0, 5).map((user, index) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-600 flex items-center justify-center text-white font-bold">
                        {user.nombre?.charAt(0) || user.email.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {user.nombre || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(user.created_at).toLocaleDateString('es-AR')}
                    </span>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay usuarios</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Active Subscriptions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="relative overflow-hidden"
        >
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

          <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-green-600 flex items-center justify-center shadow-lg">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">Suscripciones</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estados de suscripciones</p>
              </div>
            </div>

            <div className="space-y-3 max-h-[300px] overflow-y-auto">
              {loading.suscripciones ? (
                [...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-xl animate-pulse" />
                ))
              ) : suscripciones.length > 0 ? (
                suscripciones.slice(0, 5).map((sus, index) => (
                  <motion.div
                    key={sus.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${sus.activo ? 'bg-emerald-500' : 'bg-gray-400'} shadow-lg`} />
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white text-sm">
                          {sus.usuario_nombre || 'Usuario'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">Chat: {sus.chat_id}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                      sus.activo
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                    }`}>
                      {sus.activo ? 'Activa' : 'Inactiva'}
                    </span>
                  </motion.div>
                ))
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">No hay suscripciones</p>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Recent Cotizaciones Changes */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative overflow-hidden"
      >
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-600 flex items-center justify-center shadow-lg">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">Cambios en Cotizaciones</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">Historial de actualizaciones de tasas</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Par</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Anterior</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Nueva</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Cambio</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">Fecha</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading.cotizaciones ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={5} className="px-4 py-3">
                        <div className="h-10 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : cotizaciones.length > 0 ? (
                  cotizaciones.map((cot, index) => (
                    <motion.tr
                      key={cot.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {cot.divisa_origen}/{cot.divisa_destino}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {cot.tasa_anterior.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-white">
                        {cot.tasa_nueva.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`font-semibold ${
                          cot.cambio_porcentaje > 0
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {cot.cambio_porcentaje > 0 ? '+' : ''}{cot.cambio_porcentaje.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {cot.created_at_formatted || new Date(cot.created_at).toLocaleDateString('es-AR')}
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                      No hay cambios de cotizaciones registrados
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
