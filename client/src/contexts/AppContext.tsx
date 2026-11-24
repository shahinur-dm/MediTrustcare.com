import React, { createContext, useContext, useState } from 'react';

interface AppContextType {
  activeBranch: string;
  setActiveBranch: (branch: string) => void;
  activeWarehouse: string;
  setActiveWarehouse: (wh: string) => void;
  currency: string;
  currencySymbol: string;
  formatCurrency: (amount: number) => string;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeBranch, setActiveBranch] = useState('BR-FDP'); // Faridpur Central default
  const [activeWarehouse, setActiveWarehouse] = useState('WH-FDP-01');

  const formatCurrency = (amount: number) => {
    return `৳ ${Number(amount || 0).toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <AppContext.Provider
      value={{
        activeBranch,
        setActiveBranch,
        activeWarehouse,
        setActiveWarehouse,
        currency: 'BDT',
        currencySymbol: '৳',
        formatCurrency,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
