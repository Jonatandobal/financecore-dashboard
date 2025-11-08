'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ExportButton } from '@/components/ui/ExportButton';
import type { RecentOperation } from '@/types';

interface RecentOperationsTableProps {
  operations: RecentOperation[];
  isLoading: boolean;
}

export function RecentOperationsTable({ operations, isLoading }: RecentOperationsTableProps) {
  const getStatusColor = (estado: string) => {
    switch (estado) {
      case 'completada':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'cancelada':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'escalada':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="relative overflow-hidden"
    >
      {/* Glass effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Operaciones Recientes
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Últimas 7 transacciones
            </p>
          </div>
          <div className="flex items-center gap-3">
            <ExportButton
              data={operations}
              filename="operaciones_recientes"
              sheetName="Operaciones"
              variant="compact"
              headers={{
                numero_operacion: 'Nro Operación',
                created_at_formatted: 'Fecha',
                usuario_telegram_nombre: 'Cliente',
                entregado: 'Entregó',
                recibido: 'Recibió',
                ganancia_bruta_usd: 'Ganancia (USD)',
                estado: 'Estado'
              }}
            />
            <motion.div
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: -5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="text-2xl">🔄</span>
            </motion.div>
          </div>
        </div>

        <div className="overflow-x-auto -mx-6 sm:mx-0">
          {isLoading ? (
            <div className="space-y-3 px-6 sm:px-0">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          ) : operations.length > 0 ? (
            <div className="min-w-[700px]">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Nro
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Fecha
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Entregó
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Recibió
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Ganancia
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {operations.map((op, index) => (
                    <motion.tr
                      key={op.numero_operacion}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-mono text-gray-700 dark:text-gray-300">
                        {op.numero_operacion}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                        {op.created_at_formatted}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white truncate max-w-[120px]">
                        {op.usuario_telegram_nombre || 'N/A'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {op.entregado}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                        {op.recibido}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-right font-semibold text-emerald-600 dark:text-emerald-400">
                        {op.ganancia_bruta_usd != null
                          ? `$${op.ganancia_bruta_usd.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })}`
                          : '-'}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-center">
                        <span
                          className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                            op.estado
                          )}`}
                        >
                          {op.estado}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <p className="text-gray-500 dark:text-gray-400">No hay operaciones recientes</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
