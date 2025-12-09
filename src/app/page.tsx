'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { OperacionesEnCursoTab } from '@/components/operaciones/OperacionesEnCursoTab';
import { DivisasTab } from '@/components/divisas/DivisasTab';
import { BotTab } from '@/components/bot/BotTab';
import { ProfileTab } from '@/components/profile/ProfileTab';
import { UsersManagementTab } from '@/components/users/UsersManagementTab';
import { LoginPage } from '@/components/auth/LoginPage';
import { useAuth } from '@/contexts/AuthContext';
import { useDataContext } from '@/contexts/DataContext';
import type { Divisa } from '@/types';

export default function HemisferiaDashboard() {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    divisas,
    setDivisas,
    loadAllDashboardData,
    loadDivisasData,
  } = useDataContext();

  useEffect(() => {
    loadAllDashboardData();
    loadDivisasData();
  }, [loadAllDashboardData, loadDivisasData]);

  const handleDivisaChange = useCallback((index: number, field: keyof Divisa, value: string) => {
    const newDivisas = [...divisas];
    const numValue = parseFloat(value);

    // Handle empty string case
    if (value === '') {
      newDivisas[index] = {
        ...newDivisas[index],
        [field]: ''
      };
    } else {
      newDivisas[index] = {
        ...newDivisas[index],
        [field]: isNaN(numValue) ? newDivisas[index][field] : numValue
      };
    }
    setDivisas(newDivisas);
  }, [divisas, setDivisas]);

  // TODO: Temporarily bypassing authentication for full view
  // Uncomment the following when ready to re-enable login
  /*
  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show login page if not authenticated
  if (!isAuthenticated) {
    return <LoginPage />
  }
  */

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 transition-colors duration-500">
      {/* Sidebar Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content with left padding for sidebar */}
      <div className="pl-24 lg:pl-32">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && (
              <DashboardTab />
            )}

            {activeTab === 'operaciones' && (
              <OperacionesEnCursoTab />
            )}

            {activeTab === 'divisas' && (
              <DivisasTab
                onChange={handleDivisaChange}
              />
            )}

            {activeTab === 'bot' && <BotTab />}

            {activeTab === 'profile' && <ProfileTab />}

            {activeTab === 'users' && <UsersManagementTab />}
          </motion.div>
        </main>

        <footer className="border-t border-gray-200 dark:border-gray-800 mt-16 backdrop-blur-xl bg-white/50 dark:bg-gray-900/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <p className="text-center text-sm text-gray-600 dark:text-gray-400">
              &copy; {new Date().getFullYear()} Hemisferia. Todos los derechos reservados.
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}
