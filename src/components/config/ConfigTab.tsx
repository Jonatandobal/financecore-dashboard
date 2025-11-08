'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Settings, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import type { ConfigOperacion, LoadingState } from '@/types';

interface ConfigTabProps {
  config: ConfigOperacion[];
  loading: LoadingState;
  onRefresh: () => void;
}

export function ConfigTab({ config, loading, onRefresh }: ConfigTabProps) {
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
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
            ⚙️ Configuración de Operaciones
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
            Parámetros y comisiones por divisa
          </p>
        </div>
        <motion.button
          onClick={onRefresh}
          disabled={loading.config}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800 disabled:from-gray-300 disabled:to-gray-400 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center gap-2 font-medium"
        >
          <RefreshCw className={`w-4 h-4 ${loading.config ? 'animate-spin' : ''}`} />
          <span>Actualizar</span>
        </motion.button>
      </div>

      {/* Config Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading.config ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-3xl animate-pulse" />
          ))
        ) : config.length > 0 ? (
          config.map((cfg, index) => (
            <motion.div
              key={cfg.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="relative overflow-hidden group"
            >
              {/* Glass effect */}
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-500">
                {/* Currency Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl">{getCurrencyIcon(cfg.divisa)}</span>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{cfg.divisa}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Configuración</p>
                    </div>
                  </div>
                  <div>
                    {cfg.activo ? (
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <XCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                    )}
                  </div>
                </div>

                {/* Config Details */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Comisión</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cfg.comision_porcentaje.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Spread</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      {cfg.spread_porcentaje.toFixed(2)}%
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monto Mínimo</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${cfg.monto_minimo.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Monto Máximo</span>
                    <span className="font-semibold text-gray-900 dark:text-white">
                      ${cfg.monto_maximo.toLocaleString()}
                    </span>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center justify-center gap-2">
                      <span className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        cfg.activo
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {cfg.activo ? '✓ Activo' : '✗ Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden"
            >
              <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

              <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-12 text-center">
                <div className="text-6xl mb-4">⚙️</div>
                <p className="text-gray-500 dark:text-gray-400">No hay configuraciones disponibles</p>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
