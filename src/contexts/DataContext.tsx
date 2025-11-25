'use client'

import { createContext, useContext, ReactNode } from 'react';
import { useData } from '@/hooks/useData';
import { useAuth } from './AuthContext';

type DataContextType = ReturnType<typeof useData>;

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const data = useData(user);

  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useDataContext() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useDataContext must be used within a DataProvider');
  }
  return context;
}
