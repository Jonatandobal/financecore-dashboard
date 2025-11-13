'use client'

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Clock, User, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react';
import type { PendingOperation } from '@/types';

interface PendingOperationsSectionProps {
  operations: PendingOperation[];
  isLoading: boolean;
  onCompleteOperation: (operationId: string) => Promise<void>;
}

export function PendingOperationsSection({ operations, isLoading, onCompleteOperation }: PendingOperationsSectionProps) {
  const [completingId, setCompletingId] = useState<string | null>(null);

  // Calcular total de ganancias estimadas
  const totalGananciasEstimadas = operations.reduce((total, op) => {
    return total + (op.ganancia_bruta_usd || 0);
  }, 0);

  const handleComplete = async (operationId: string, operationNumber: number) => {
    if (window.confirm(`¿Confirmar que desea completar la operación #${operationNumber}?`)) {
      setCompletingId(operationId);
      try {
        await onCompleteOperation(operationId);
      } finally {
        setCompletingId(null);
      }
    }
  };
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
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex-1">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent flex items-center gap-3">
              <span className="text-3xl">⏳</span>
              Operaciones en Curso
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {operations.length} operación{operations.length !== 1 ? 'es' : ''} pendiente{operations.length !== 1 ? 's' : ''} de completar
            </p>
          </div>

          {/* Total Ganancias Estimadas */}
          <div className="bg-gradient-to-br from-emerald-500/20 to-green-500/20 dark:from-emerald-600/20 dark:to-green-600/20 backdrop-blur-sm px-6 py-4 rounded-2xl shadow-lg border-2 border-emerald-300/50 dark:border-emerald-700/50">
            <p className="text-xs text-gray-600 dark:text-gray-400 font-medium mb-1 flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              Ganancia Total Estimada
            </p>
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              ${totalGananciasEstimadas.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </p>
          </div>
        </div>

        {/* Operations List - Ticket Style */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-96 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-2xl animate-pulse"
              />
            ))}
          </div>
        ) : operations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {operations.map((op, index) => {
              const config = getPriorityConfig(op.prioridad, op.horas_transcurridas);

              return (
                <motion.div
                  key={op.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative group"
                >
                  {/* Ticket Container */}
                  <div className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-xl border-2 ${config.borderColor} overflow-hidden hover:shadow-2xl transition-all duration-300`}>
                    {/* Decorative top border with perforations effect */}
                    <div className={`h-2 bg-gradient-to-r ${config.gradient.replace('/10', '/30')}`}>
                      <div className="flex justify-around h-full">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="w-0.5 h-full bg-white/50 dark:bg-gray-800/50" />
                        ))}
                      </div>
                    </div>

                    {/* Ticket Header */}
                    <div className="bg-gradient-to-br from-gray-50 to-white dark:from-gray-800 dark:to-gray-900 p-4 border-b-2 border-dashed border-gray-300 dark:border-gray-700">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className="text-3xl font-black text-gray-900 dark:text-white font-mono">
                            #{op.numero_operacion}
                          </span>
                          <span className={`px-2 py-1 rounded-md text-xs font-bold ${config.badgeColor} flex items-center gap-1`}>
                            {config.icon} {op.prioridad}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 justify-end">
                            <Clock className="w-3 h-3" />
                            {formatTime(op.horas_transcurridas)}
                          </p>
                          <span className="text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300">
                            {op.estado}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <User className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate">
                          {op.usuario_telegram_nombre || 'Cliente'}
                        </span>
                      </div>
                    </div>

                    {/* Ticket Body */}
                    <div className="p-4 space-y-4">
                      {/* Transaction Details */}
                      <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-left flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">ENTREGA</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {op.cantidad_entrada.toLocaleString()}
                            </p>
                            <p className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                              {op.divisa_entrada || ''}
                            </p>
                          </div>
                          <div className="px-3">
                            <div className="text-2xl text-gray-400">→</div>
                          </div>
                          <div className="text-right flex-1">
                            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1">RECIBE</p>
                            <p className="text-lg font-bold text-gray-900 dark:text-white">
                              {op.cantidad_salida.toLocaleString()}
                            </p>
                            <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                              {op.divisa_salida || ''}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Exchange Rates */}
                      <div className="space-y-2">
                        {op.tasa_cambio && (
                          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">TASA DE CAMBIO</p>
                            <p className="text-sm font-bold text-blue-700 dark:text-blue-400">
                              1 {op.divisa_entrada} = ${op.tasa_cambio.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 4
                              })} {op.divisa_salida}
                            </p>
                          </div>
                        )}

                        <div className="grid grid-cols-2 gap-2">
                          {op.precio_entrada && (
                            <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 border border-orange-200 dark:border-orange-800">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Compra</p>
                              <p className="text-sm font-bold text-orange-700 dark:text-orange-400">
                                ${op.precio_entrada.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </p>
                            </div>
                          )}

                          {op.precio_salida && (
                            <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border border-green-200 dark:border-green-800">
                              <p className="text-xs text-gray-600 dark:text-gray-400">Venta</p>
                              <p className="text-sm font-bold text-green-700 dark:text-green-400">
                                ${op.precio_salida.toLocaleString(undefined, {
                                  minimumFractionDigits: 2,
                                  maximumFractionDigits: 2
                                })}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Ganancia (si existe) */}
                      {op.ganancia_bruta_usd != null && op.ganancia_bruta_usd > 0 && (
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-3 border-2 border-dashed border-emerald-300 dark:border-emerald-700">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-600 dark:text-gray-400 font-medium">GANANCIA EST.</span>
                            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                              ${op.ganancia_bruta_usd.toLocaleString(undefined, {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2
                              })}
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Ticket Footer - Action Button */}
                    <div className="p-4 bg-gray-50 dark:bg-gray-900/50 border-t-2 border-dashed border-gray-300 dark:border-gray-700">
                      <motion.button
                        onClick={() => handleComplete(op.id, op.numero_operacion)}
                        disabled={completingId === op.id}
                        whileHover={{ scale: completingId === op.id ? 1 : 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg transition-all duration-300 flex items-center justify-center gap-2 ${
                          completingId === op.id
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white'
                        }`}
                      >
                        <CheckCircle className="w-5 h-5" />
                        <span>{completingId === op.id ? 'COMPLETANDO...' : 'COMPLETAR OPERACIÓN'}</span>
                      </motion.button>
                    </div>

                    {/* Decorative bottom border with perforations effect */}
                    <div className={`h-2 bg-gradient-to-r ${config.gradient.replace('/10', '/30')}`}>
                      <div className="flex justify-around h-full">
                        {[...Array(20)].map((_, i) => (
                          <div key={i} className="w-0.5 h-full bg-white/50 dark:bg-gray-800/50" />
                        ))}
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
