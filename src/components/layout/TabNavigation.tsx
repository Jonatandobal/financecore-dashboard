'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Coins, Bot, TrendingUp, Package, Settings } from 'lucide-react';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, emoji: '📊' },
  { id: 'analytics', name: 'Analytics', icon: TrendingUp, emoji: '📈' },
  { id: 'divisas', name: 'Divisas', icon: Coins, emoji: '💰' },
  { id: 'movimientos', name: 'Movimientos', icon: Package, emoji: '📦' },
  { id: 'config', name: 'Config', icon: Settings, emoji: '⚙️' },
  { id: 'bot', name: 'Bot', icon: Bot, emoji: '🤖' },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <div className="mb-8 overflow-x-auto">
      <div className="relative inline-flex p-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 min-w-fit">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-6 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? 'text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
              }`}
              whileHover={{ scale: isActive ? 1 : 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 rounded-xl shadow-lg"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              <span className="relative flex items-center gap-2 z-10">
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{tab.name}</span>
                <span className="sm:hidden text-lg">{tab.emoji}</span>
              </span>
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
