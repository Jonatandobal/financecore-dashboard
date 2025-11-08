'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import type { DailySummary } from '@/types';

interface ProfitChartProps {
  data: DailySummary[];
  isLoading: boolean;
}

export function ProfitChart({ data, isLoading }: ProfitChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="group relative overflow-hidden"
    >
      {/* Glass effect background */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 sm:p-8 hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Ganancias Últimos 30 Días
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Tendencia de beneficios diarios
            </p>
          </div>
          <motion.div
            className="w-12 h-12 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="text-2xl">📈</span>
          </motion.div>
        </div>

        {isLoading ? (
          <div className="h-[350px] flex items-center justify-center">
            <div className="space-y-4 w-full px-8">
              <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
              <div className="h-64 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : data.length > 0 ? (
          <ResponsiveContainer width="100%" height={350}>
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGanancia" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" className="dark:stroke-gray-700" opacity={0.5} />
              <XAxis
                dataKey="diaLabel"
                fontSize={12}
                stroke="#6B7280"
                className="dark:stroke-gray-400"
              />
              <YAxis
                fontSize={12}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
                width={70}
                stroke="#6B7280"
                className="dark:stroke-gray-400"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number) => [
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  'Ganancia'
                ]}
              />
              <Area
                type="monotone"
                dataKey="ganancia_usd"
                stroke="#10B981"
                strokeWidth={3}
                fill="url(#colorGanancia)"
                activeDot={{ r: 8, strokeWidth: 2, stroke: '#fff' }}
                name="Ganancia USD"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[350px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-500 dark:text-gray-400">No hay datos de ganancias diarias</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
