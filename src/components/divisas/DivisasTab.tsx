'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { RefreshCw, Save } from 'lucide-react';
import { ExportButton } from '@/components/ui/ExportButton';
import type { Divisa, LoadingState } from '@/types';

interface DivisasTabProps {
  divisas: Divisa[];
  loading: LoadingState;
  onRefresh: () => void;
  onUpdate: (divisa: Divisa) => void;
  onChange: (index: number, field: keyof Divisa, value: string) => void;
}

export function DivisasTab({ divisas, loading, onRefresh, onUpdate, onChange }: DivisasTabProps) {
  const getCurrencyIcon = (divisa: string) => {
    const icons: Record<string, string> = {
      USD: '🇺🇸',
      EUR: '🇪🇺',
      REAL: '🇧🇷',
      BTC: '₿',
      ETH: 'Ξ',
      ARS: '🇦🇷',
    };
    return icons[divisa] || '🏳️';
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            💰 Gestión de Divisas
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Administra precios y stock de las divisas
          </p>
        </div>
        <div className="flex gap-3">
          <motion.button
            onClick={onRefresh}
            disabled={loading.divisas}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading.divisas ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </motion.button>
          <ExportButton
            data={divisas}
            filename="divisas_stock"
            sheetName="Divisas"
            headers={{
              id: 'ID',
              divisa: 'Divisa',
              precio_compra: 'Precio Compra',
              precio_venta: 'Precio Venta',
              stock_disponible: 'Stock Disponible',
              updated_at: 'Última Actualización'
            }}
          />
        </div>
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
                    Divisa
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Precio Compra
                    <span className="block text-[10px] normal-case text-gray-500 dark:text-gray-400">(Cliente entrega)</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Precio Venta
                    <span className="block text-[10px] normal-case text-gray-500 dark:text-gray-400">(Cliente recibe)</span>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Stock Disponible
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {divisas.length > 0 ? (
                  divisas.map((divisa, index) => (
                    <motion.tr
                      key={divisa.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: index * 0.05 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
                    >
                      <td className="px-6 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <span className="text-3xl">{getCurrencyIcon(divisa.divisa)}</span>
                          <span className="font-bold text-gray-900 dark:text-white text-lg">
                            {divisa.divisa}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="number"
                          value={divisa.precio_compra}
                          onChange={(e) => onChange(index, 'precio_compra', e.target.value)}
                          className="w-full max-w-[140px] px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          step="any"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="number"
                          value={divisa.precio_venta}
                          onChange={(e) => onChange(index, 'precio_venta', e.target.value)}
                          className="w-full max-w-[140px] px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          step="any"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <input
                          type="number"
                          value={divisa.stock_disponible}
                          onChange={(e) => onChange(index, 'stock_disponible', e.target.value)}
                          className="w-full max-w-[160px] px-4 py-2.5 border-2 border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                          step="any"
                        />
                      </td>
                      <td className="px-6 py-5">
                        <motion.button
                          onClick={() => onUpdate(divisa)}
                          disabled={loading.divisas}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center gap-2 text-sm font-medium"
                        >
                          <Save className="w-4 h-4" />
                          <span>Guardar</span>
                        </motion.button>
                      </td>
                    </motion.tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center">
                      {loading.divisas ? (
                        <div className="space-y-3">
                          <div className="text-4xl">⏳</div>
                          <p className="text-gray-500 dark:text-gray-400">Cargando divisas...</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="text-6xl">💱</div>
                          <p className="text-gray-500 dark:text-gray-400">No hay divisas disponibles</p>
                        </div>
                      )}
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
