'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, User, TrendingUp, AlertCircle } from 'lucide-react';
import type { PendingOperation } from '@/types';

interface PendingOperationsSectionProps {
  operations: PendingOperation[];
  isLoading: boolean;
}

export function PendingOperationsSection({ operations, isLoading }: PendingOperationsSectionProps) {
  const getPriorityConfig = (prioridad: string, horas: number) => {
    if (prioridad === 'ALTA' || horas > 6) {
      return {
        gradient: 'from-red-500/10 via-orange-500/10 to-red-500/10',
        borderColor: 'border-red-300 dark:border-red-700',
        badgeColor: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
        glowColor: 'shadow-red-500/20',
        icon: '🔴',
      };
    } else if (prioridad === 'MEDIA' || horas > 2) {
      return {
        gradient: 'from-yellow-500/10 via-amber-500/10 to-yellow-500/10',
        borderColor: 'border-yellow-300 dark:border-yellow-700',
        badgeColor: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300',
        glowColor: 'shadow-yellow-500/20',
        icon: '🟡',
      };
    } else {
      return {
        gradient: 'from-green-500/10 via-emerald-500/10 to-green-500/10',
        borderColor: 'border-green-300 dark:border-green-700',
        badgeColor: 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300',
        glowColor: 'shadow-green-500/20',
        icon: '🟢',
      };
    }
  };

  const formatTime = (horas: number) => {
    if (horas < 1) {
      const minutos = Math.floor(horas * 60);
      return `${minutos} min`;
    } else if (horas < 24) {
      return `${Math.floor(horas)}h ${Math.floor((horas % 1) * 60)}m`;
    } else {
      const dias = Math.floor(horas / 24);
      const horasRestantes = Math.floor(horas % 24);
      return `${dias}d ${horasRestantes}h`;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="relative overflow-hidden"
    >
      {/* Glass effect background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              Operaciones en Curso
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {operations.length} operación{operations.length !== 1 ? 'es' : ''} pendiente{operations.length !== 1 ? 's' : ''} de completar
            </p>
          </div>
          <motion.div
            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 180 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <AlertCircle className="w-7 h-7 text-white" />
          </motion.div>
        </div>

        {/* Operations List */}
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-32 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : operations.length > 0 ? (
          <div className="space-y-4">
            {operations.map((op, index) => {
              const config = getPriorityConfig(op.prioridad, op.horas_transcurridas);

              return (
                <motion.div
                  key={op.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className={`relative overflow-hidden rounded-2xl border-2 ${config.borderColor} bg-gradient-to-br ${config.gradient} backdrop-blur-sm shadow-lg ${config.glowColor} hover:shadow-xl transition-all duration-300 group`}
                >
                  {/* Animated border glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

                  <div className="relative p-5">
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                      {/* Left section: Main info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-white/80 dark:bg-gray-800/80 flex items-center justify-center shadow-md">
                              <span className="text-xl font-bold bg-gradient-to-br from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                #{op.numero_operacion}
                              </span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${config.badgeColor} shadow-sm flex items-center gap-1`}>
                                  <span>{config.icon}</span>
                                  {op.prioridad}
                                </span>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300 shadow-sm">
                                  {op.estado}
                                </span>
                              </div>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTime(op.horas_transcurridas)} transcurrido{op.horas_transcurridas >= 2 ? 's' : ''}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                          <span className="font-medium">{op.usuario_telegram_nombre || 'Cliente'}</span>
                        </div>
                      </div>

                      {/* Center section: Exchange info */}
                      <div className="flex-1 lg:text-center">
                        <div className="inline-flex items-center gap-3 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md">
                          <div className="text-right">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Entrega</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {op.cantidad_entrada.toLocaleString()}
                            </p>
                          </div>
                          <div className="text-2xl">
                            <span className="animate-pulse">→</span>
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Recibe</p>
                            <p className="text-base font-bold text-gray-900 dark:text-white">
                              {op.cantidad_salida.toLocaleString()}
                            </p>
                          </div>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-2 font-semibold">
                          {op.tipo_cambio}
                        </p>
                      </div>

                      {/* Right section: Profit */}
                      <div className="flex-shrink-0 text-right">
                        <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-600/20 dark:to-green-600/20 backdrop-blur-sm px-4 py-3 rounded-xl shadow-md border border-emerald-300/50 dark:border-emerald-700/50">
                          <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center justify-end gap-1">
                            <TrendingUp className="w-3 h-3" />
                            Ganancia Est.
                          </p>
                          <p className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                            {op.ganancia_bruta_usd != null
                              ? `$${op.ganancia_bruta_usd.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2,
                                })}`
                              : '-'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
              className="inline-block"
            >
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-xl">
                <span className="text-5xl">✅</span>
              </div>
            </motion.div>
            <p className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
              ¡Todo al día!
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              No hay operaciones pendientes en este momento
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
