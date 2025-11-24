'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { PendingOperationsSection } from '@/components/dashboard/PendingOperationsSection';
import { useDataContext } from '@/contexts/DataContext';
import type { PendingOperation, LoadingState } from '@/types';

export function OperacionesEnCursoTab() {
  const {
    pendingOperations,
    loading,
    completeOperation,
  } = useDataContext();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <PendingOperationsSection
        operations={pendingOperations}
        isLoading={loading.pendingOps}
        onCompleteOperation={completeOperation}
        showProfits={false}
      />
    </motion.div>
  );
}
