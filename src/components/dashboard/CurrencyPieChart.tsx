'use client'

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { ProfitByCurrency } from '@/types';

interface CurrencyPieChartProps {
  data: ProfitByCurrency[];
  isLoading: boolean;
}

const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#6B7280'];

export function CurrencyPieChart({ data, isLoading }: CurrencyPieChartProps) {
  const pieChartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    const grouped = data.reduce((acc, item) => {
      const name = item.par_divisas?.split('/')[1] || item.par_divisas || 'Desconocido';
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
  }, [data]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="relative overflow-hidden"
    >
      {/* Glass effect */}
      <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-2xl transition-all duration-500">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Top Divisas Vendidas
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Ganancia del mes</p>
          </div>
          <motion.span
            className="text-2xl"
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
          >
            💰
          </motion.span>
        </div>

        {isLoading ? (
          <div className="h-[220px] flex items-center justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 animate-pulse" />
          </div>
        ) : pieChartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={pieChartData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                nameKey="name"
                animationBegin={0}
                animationDuration={800}
              >
                {pieChartData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PIE_COLORS[index % PIE_COLORS.length]}
                    className="hover:opacity-80 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                }}
                formatter={(value: number, name: string) => [
                  `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
                  name
                ]}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                iconType="circle"
                wrapperStyle={{ fontSize: '12px' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[220px] flex items-center justify-center">
            <div className="text-center">
              <div className="text-4xl mb-2">📊</div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos</p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
