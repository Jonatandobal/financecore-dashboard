'use client'

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { KpiCard } from '@/components/ui/KpiCard';
import { InfoWidget } from '@/components/ui/InfoWidget';
import { ProfitChart } from './ProfitChart';
import { CurrencyPieChart } from './CurrencyPieChart';
import { RecentOperationsTable } from './RecentOperationsTable';
import { PendingOperationsSection } from './PendingOperationsSection';
import type { KpiData, DailySummary, RecentOperation, ProfitByCurrency, Divisa, LoadingState, PendingOperation } from '@/types';

interface DashboardTabProps {
  kpis: KpiData | null;
  dailySummary: DailySummary[];
  recentOperations: RecentOperation[];
  profitByCurrency: ProfitByCurrency[];
  divisas: Divisa[];
  pendingOperations: PendingOperation[];
  loading: LoadingState;
  onCompleteOperation: (operationId: string) => Promise<void>;
}

export function DashboardTab({
  kpis,
  dailySummary,
  recentOperations,
  profitByCurrency,
  divisas,
  pendingOperations,
  loading,
  onCompleteOperation
}: DashboardTabProps) {
  const stockUSD = useMemo(() => {
    return divisas.find(d => d.divisa === 'USD')?.stock_disponible || 0;
  }, [divisas]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <KpiCard
          title="Ganancia HOY"
          value={kpis?.ganancia_hoy}
          isLoading={loading.kpis}
          isCurrency={true}
          icon="💵"
          index={0}
        />
        <KpiCard
          title="Operaciones HOY"
          value={kpis?.operaciones_hoy}
          isLoading={loading.kpis}
          icon="🔄"
          index={1}
        />
        <KpiCard
          title="Ganancia MES"
          value={kpis?.ganancia_mes}
          isLoading={loading.kpis}
          isCurrency={true}
          icon="💰"
          index={2}
        />
        <KpiCard
          title="Operaciones Pendientes"
          value={pendingOperations.length}
          isLoading={loading.pendingOps}
          icon="⏳"
          index={3}
        />
      </div>

      {/* Pending Operations Section */}
      <PendingOperationsSection
        operations={pendingOperations}
        isLoading={loading.pendingOps}
        onCompleteOperation={onCompleteOperation}
      />

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2">
          <ProfitChart data={dailySummary} isLoading={loading.dailySummary} />
        </div>

        {/* Side Widgets */}
        <div className="space-y-6">
          <InfoWidget
            title="Stock Total (USD)"
            value={stockUSD}
            isCurrency={true}
            isLoading={loading.divisas}
            icon="🏦"
            index={0}
          />
          <InfoWidget
            title="Bot Status"
            value="Activo"
            icon="🤖"
            valueColor="text-emerald-600 dark:text-emerald-400"
            index={1}
          />
          <CurrencyPieChart data={profitByCurrency} isLoading={loading.profitByCurrency} />
        </div>
      </div>

      {/* Recent Operations */}
      <RecentOperationsTable operations={recentOperations} isLoading={loading.recentOps} />
    </motion.div>
  );
}
