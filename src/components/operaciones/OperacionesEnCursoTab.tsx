'use client'

import React from 'react';
import { motion } from 'framer-motion';
import { PendingOperationsSection } from '@/components/dashboard/PendingOperationsSection';
import type { PendingOperation, LoadingState } from '@/types';

interface OperacionesEnCursoTabProps {
  pendingOperations: PendingOperation[];
  loading: LoadingState;
  onCompleteOperation: (operationId: string) => Promise<void>;
}

export function OperacionesEnCursoTab({
  pendingOperations,
  loading,
  onCompleteOperation
}: OperacionesEnCursoTabProps) {
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
        onCompleteOperation={onCompleteOperation}
        showProfits={false}
      />
    </motion.div>
  );
}
