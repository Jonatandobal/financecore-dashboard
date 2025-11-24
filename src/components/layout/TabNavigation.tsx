'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Coins, Bot, Clock, User, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const baseTabs = [
  { id: 'dashboard', name: 'Dashboard', icon: BarChart3, emoji: '📊' },
  { id: 'operaciones', name: 'En Curso', icon: Clock, emoji: '⏳' },
  { id: 'divisas', name: 'Divisas', icon: Coins, emoji: '💰' },
  { id: 'bot', name: 'Bot Status', icon: Bot, emoji: '🤖' },
];

const userTabs = [
  { id: 'profile', name: 'Perfil', icon: User, emoji: '👤' },
];

const managerTabs = [
  { id: 'users', name: 'Usuarios', icon: Users, emoji: '👥', requiresManager: true },
];

export function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const { user } = useAuth();

  const tabs = [
    ...baseTabs,
    ...userTabs,
    ...(user?.rol === 'manager' ? managerTabs : []),
  ];
  return (
    <aside className="fixed left-0 top-0 h-screen w-24 lg:w-32 flex flex-col items-center py-8 px-4 z-30">
      {/* Background with glassmorphism */}
      <div className="absolute inset-0 bg-gradient-to-b from-indigo-600/90 via-blue-600/90 to-purple-700/90 dark:from-indigo-900/90 dark:via-blue-900/90 dark:to-purple-900/90 backdrop-blur-2xl shadow-2xl" />

      {/* Logo/Brand */}
      <motion.div
        className="relative mb-12 w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border border-white/30"
        whileHover={{ scale: 1.05, rotate: -5 }}
        transition={{ type: "spring", stiffness: 400 }}
      >
        <span className="text-3xl">🏦</span>
      </motion.div>

      {/* Navigation Tabs */}
      <nav className="relative flex-1 flex flex-col gap-4 w-full">
        {tabs.map((tab, index) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="relative group w-full"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {/* Active indicator */}
              {isActive && (
                <motion.div
                  layoutId="activeSidebarTab"
                  className="absolute inset-0 bg-white/30 dark:bg-white/20 backdrop-blur-sm rounded-2xl shadow-xl border-2 border-white/50"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              )}

              {/* Button content */}
              <div className={`relative flex flex-col items-center justify-center py-4 px-2 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-white'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}>
                <Icon className={`w-7 h-7 mb-2 transition-transform ${isActive ? 'scale-110' : ''}`} />
                <span className="text-xs font-semibold text-center leading-tight">
                  {tab.name}
                </span>
              </div>

              {/* Hover glow effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity bg-white/5" />
              )}
            </motion.button>
          );
        })}
      </nav>

      {/* Footer decoration */}
      <div className="relative mt-4 text-white/50 text-xs text-center">
        <div className="w-12 h-0.5 bg-white/30 mx-auto mb-2 rounded-full" />
        <span className="font-mono">{new Date().getFullYear()}</span>
      </div>
    </aside>
  );
}
