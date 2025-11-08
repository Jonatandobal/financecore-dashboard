'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Header } from '@/components/layout/Header';
import { TabNavigation } from '@/components/layout/TabNavigation';
import { DashboardTab } from '@/components/dashboard/DashboardTab';
import { DivisasTab } from '@/components/divisas/DivisasTab';
import { BotTab } from '@/components/bot/BotTab';
import { MovimientosTab } from '@/components/movimientos/MovimientosTab';
import { AnalyticsTab } from '@/components/analytics/AnalyticsTab';
import { ConfigTab } from '@/components/config/ConfigTab';
import { useData } from '@/hooks/useData';
import type { Divisa } from '@/types';

export default function HemisferiaDashboard() {
  const [activeTab, setActiveTab] = useState('dashboard');

  const {
    loading,
    kpis,
    dailySummary,
    recentOperations,
    profitByCurrency,
    divisas,
    movimientos,
    suscripciones,
    users,
    config,
    cotizaciones,
    estadisticas,
    setDivisas,
    loadAllDashboardData,
    loadDivisasData,
    updateDivisa,
    loadMovimientosData,
    loadSuscripcionesData,
    loadUsersData,
    loadConfigData,
    loadCotizacionesData,
    loadEstadisticasGenerales,
  } = useData();

  useEffect(() => {
    loadAllDashboardData();
    loadDivisasData();
    loadMovimientosData();
    loadSuscripcionesData();
    loadUsersData();
    loadConfigData();
    loadCotizacionesData();
    loadEstadisticasGenerales();
  }, [
    loadAllDashboardData,
    loadDivisasData,
    loadMovimientosData,
    loadSuscripcionesData,
    loadUsersData,
    loadConfigData,
    loadCotizacionesData,
    loadEstadisticasGenerales
  ]);

  const handleDivisaChange = useCallback((index: number, field: keyof Divisa, value: string) => {
    const newDivisas = [...divisas];
    const numValue = parseFloat(value);
    newDivisas[index] = {
      ...newDivisas[index],
      [field]: isNaN(numValue) ? newDivisas[index][field] : numValue
    };
    setDivisas(newDivisas);
  }, [divisas, setDivisas]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20 transition-colors duration-500">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === 'dashboard' && (
            <DashboardTab
              kpis={kpis}
              dailySummary={dailySummary}
              recentOperations={recentOperations}
              profitByCurrency={profitByCurrency}
              divisas={divisas}
              loading={loading}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsTab
              estadisticas={estadisticas}
              suscripciones={suscripciones}
              users={users}
              cotizaciones={cotizaciones}
              loading={loading}
            />
          )}

          {activeTab === 'divisas' && (
            <DivisasTab
              divisas={divisas}
              loading={loading}
              onRefresh={loadDivisasData}
              onUpdate={updateDivisa}
              onChange={handleDivisaChange}
            />
          )}

          {activeTab === 'movimientos' && (
            <MovimientosTab
              movimientos={movimientos}
              loading={loading}
              onRefresh={loadMovimientosData}
            />
          )}

          {activeTab === 'config' && (
            <ConfigTab
              config={config}
              loading={loading}
              onRefresh={loadConfigData}
            />
          )}

          {activeTab === 'bot' && <BotTab />}
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
  );
}
