'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, ArrowUpCircle, Settings, RefreshCw } from 'lucide-react';
import type { MovimientoDivisa, LoadingState } from '@/types';

interface MovimientosTabProps {
  movimientos: MovimientoDivisa[];
  loading: LoadingState;
  onRefresh: () => void;
}

export function MovimientosTab({ movimientos, loading, onRefresh }: MovimientosTabProps) {
  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return <ArrowDownCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
      case 'salida':
        return <ArrowUpCircle className="w-5 h-5 text-red-600 dark:text-red-400" />;
      case 'ajuste':
        return <Settings className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
      default:
        return null;
    }
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'salida':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'ajuste':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            📦 Movimientos de Divisas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Historial de entradas, salidas y ajustes de stock
          </p>
        </div>
        <motion.button
          onClick={onRefresh}
          disabled={loading.movimientos}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading.movimientos ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </motion.button>
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="relative overflow-hidden"
      >
        {/* Glass effect */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

        <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Divisa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Cantidad
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Motivo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {loading.movimientos ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i}>
                      <td colSpan={6} className="px-6 py-4">
                        <div className="h-12 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
                      </td>
                    </tr>
                  ))
                ) : movimientos.length > 0 ? (
                  movimientos.map((mov, index) => (
                    <motion.tr
                      key={mov.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {getTipoIcon(mov.tipo)}
                          <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTipoColor(mov.tipo)}`}>
                            {mov.tipo}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="font-bold text-gray-900 dark:text-white text-lg">
                          {mov.divisa}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`font-semibold ${
                          mov.tipo === 'entrada'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : mov.tipo === 'salida'
                            ? 'text-red-600 dark:text-red-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}>
                          {mov.tipo === 'entrada' ? '+' : mov.tipo === 'salida' ? '-' : '±'}
                          {mov.cantidad.toLocaleString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {mov.motivo || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {mov.usuario || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {mov.created_at_formatted || new Date(mov.created_at).toLocaleDateString('es-AR')}
                        </span>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="space-y-3">
                        <div className="text-6xl">📦</div>
                        <p className="text-gray-500 dark:text-gray-400">No hay movimientos registrados</p>
                      </div>
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
