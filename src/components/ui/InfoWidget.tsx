'use client'

import React from 'react';
import { motion } from 'framer-motion';

interface InfoWidgetProps {
  title: string;
  value: string | number | null | undefined;
  isLoading?: boolean;
  isCurrency?: boolean;
  icon: string;
  valueColor?: string;
  index?: number;
}

export function InfoWidget({
  title,
  value,
  isLoading = false,
  isCurrency = false,
  icon,
  valueColor = 'text-gray-900 dark:text-white',
  index = 0
}: InfoWidgetProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative overflow-hidden"
    >
      {/* Glass effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/60 to-white/30 dark:from-gray-800/60 dark:to-gray-900/30 backdrop-blur-xl" />

      <div className="relative bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 p-5 min-h-[110px] flex flex-col justify-center hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-300">{title}</span>
          <motion.span
            className="text-2xl filter drop-shadow-lg"
            whileHover={{ scale: 1.2, rotate: 10 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            {icon}
          </motion.span>
        </div>

        {isLoading ? (
          <div className="h-8 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 rounded-lg animate-pulse w-3/4" />
        ) : (
          <motion.div
            className={`text-2xl font-bold ${valueColor}`}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            {value != null
              ? isCurrency
                ? `$${Number(value).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                : value
              : '-'}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
