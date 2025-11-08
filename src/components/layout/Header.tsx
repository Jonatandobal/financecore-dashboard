'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

export function Header() {
  const currentTime = new Date().toLocaleString('es-AR', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200 dark:border-gray-800 shadow-lg"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          {/* Logo y Título */}
          <motion.div
            className="flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-2xl blur-sm group-hover:blur-md transition-all opacity-75" />
              <div className="relative w-14 h-14 bg-gradient-to-br from-emerald-400 via-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-xl">
                H
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-900 dark:from-white dark:via-blue-300 dark:to-purple-300 bg-clip-text text-transparent">
                Hemisferia
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
                Panel de Operaciones
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Time Display */}
            <div className="hidden sm:block text-right">
              <div className="text-xs text-gray-500 dark:text-gray-400">Última actualización</div>
              <div className="text-sm font-semibold text-gray-700 dark:text-gray-300">{currentTime}</div>
            </div>

            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
