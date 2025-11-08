'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | null | undefined;
  isLoading: boolean;
  isCurrency?: boolean;
  isPercentage?: boolean;
  change?: string;
  changeColor?: string;
  icon: string;
  index?: number;
}

export function KpiCard({
  title,
  value,
  isLoading,
  isCurrency = false,
  isPercentage = false,
  change,
  changeColor = 'text-gray-500',
  icon,
  index = 0
}: KpiCardProps) {
  const isPositiveChange = change?.startsWith('+');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="group relative overflow-hidden"
    >
      {/* Gradient background effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-800 dark:via-gray-900 dark:to-gray-800 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      {/* Glass effect border */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl shadow-xl border border-white/20 dark:border-gray-700/30" />

      {/* Content */}
      <div className="relative bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-6 min-h-[140px] flex flex-col justify-between hover:shadow-2xl hover:scale-[1.02] transition-all duration-300">
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</span>
            <motion.span
              className="text-3xl filter drop-shadow-lg"
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              {icon}
            </motion.span>
          </div>

          {isLoading ? (
            <div className="space-y-2">
              <div className="h-9 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse w-3/4" />
            </div>
          ) : (
            <motion.div
              className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text text-transparent"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3, delay: index * 0.1 + 0.3 }}
            >
              {value != null
                ? isCurrency
                  ? `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                  : isPercentage
                  ? `${value.toFixed(2)}%`
                  : value.toLocaleString()
                : '-'}
            </motion.div>
          )}
        </div>

        {change && !isLoading && (
          <motion.div
            className={`flex items-center gap-1 text-sm mt-2 ${changeColor}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 + 0.4 }}
          >
            {isPositiveChange ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
            <span className="font-medium">{change}</span>
          </motion.div>
        )}

        {isLoading && (
          <div className="h-5 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded animate-pulse w-1/4 mt-2" />
        )}
      </div>
    </motion.div>
  );
}
