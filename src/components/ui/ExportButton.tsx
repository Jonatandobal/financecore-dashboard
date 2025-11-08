'use client'

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, FileDown, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { exportToCSV, exportToJSON, exportToExcel, getTimestampForFilename } from '@/lib/utils/exportUtils';

interface ExportButtonProps<T extends Record<string, any>> {
  data: T[];
  filename: string;
  headers?: Record<keyof T, string>;
  sheetName?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function ExportButton<T extends Record<string, any>>({
  data,
  filename,
  headers,
  sheetName = 'Datos',
  variant = 'default',
  className = ''
}: ExportButtonProps<T>) {
  const [isOpen, setIsOpen] = useState(false);

  const handleExport = (format: 'csv' | 'json' | 'excel') => {
    const timestamp = getTimestampForFilename();
    const fullFilename = `${filename}_${timestamp}`;

    try {
      switch (format) {
        case 'csv':
          exportToCSV(data, fullFilename, headers);
          break;
        case 'json':
          exportToJSON(data, fullFilename);
          break;
        case 'excel':
          exportToExcel(data, fullFilename, sheetName, headers);
          break;
      }
      setIsOpen(false);
    } catch (error) {
      console.error('Error exportando datos:', error);
      alert('Error al exportar los datos');
    }
  };

  const exportOptions = [
    {
      format: 'excel' as const,
      icon: FileSpreadsheet,
      label: 'Excel (.xlsx)',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgHover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
    },
    {
      format: 'csv' as const,
      icon: FileDown,
      label: 'CSV',
      color: 'text-blue-600 dark:text-blue-400',
      bgHover: 'hover:bg-blue-50 dark:hover:bg-blue-900/20'
    },
    {
      format: 'json' as const,
      icon: FileJson,
      label: 'JSON',
      color: 'text-purple-600 dark:text-purple-400',
      bgHover: 'hover:bg-purple-50 dark:hover:bg-purple-900/20'
    }
  ];

  if (variant === 'compact') {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          disabled={!data || data.length === 0}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
        >
          <Download className="w-4 h-4" />
          <ChevronDown className={`w-3 h-3 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setIsOpen(false)}
              />
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
              >
                {exportOptions.map((option) => (
                  <button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    className={`w-full flex items-center gap-3 px-4 py-3 ${option.bgHover} transition-colors`}
                  >
                    <option.icon className={`w-5 h-5 ${option.color}`} />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {option.label}
                    </span>
                  </button>
                ))}
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        disabled={!data || data.length === 0}
        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all ${className}`}
      >
        <Download className="w-5 h-5" />
        <span>Exportar</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-10"
              onClick={() => setIsOpen(false)}
            />

            {/* Dropdown Menu */}
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden z-20"
            >
              <div className="p-2">
                <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Formato de exportación
                </div>
                {exportOptions.map((option, index) => (
                  <motion.button
                    key={option.format}
                    onClick={() => handleExport(option.format)}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, delay: index * 0.05 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl ${option.bgHover} transition-all group`}
                  >
                    <div className={`p-2 rounded-lg bg-white dark:bg-gray-700 shadow-sm group-hover:shadow-md transition-shadow`}>
                      <option.icon className={`w-5 h-5 ${option.color}`} />
                    </div>
                    <div className="flex-1 text-left">
                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 block">
                        {option.label}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {data.length} registro{data.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </motion.button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
