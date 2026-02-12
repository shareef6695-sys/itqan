import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  isDefault: boolean;
}

export interface ZatcaSettings {
  enabled: boolean;
  phase: '1' | '2';
  csrCommonName?: string;
  csrOrganizationName?: string;
  csrOrganizationUnitName?: string;
  csrCountryName?: string;
  csrInvoiceType?: string;
  csrLocation?: string;
  csrIndustry?: string;
}

export interface OrganizationSettings {
  companyName: string;
  address: string;
  country: string;
  crNumber: string;
  vatNumber: string;
  currency: string;
  vatRate: number;
  warehouses: Warehouse[];
  zatca?: ZatcaSettings;
}

interface OrganizationContextType {
  settings: OrganizationSettings;
  updateSettings: (newSettings: Partial<OrganizationSettings>) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

// GCC Country Configurations
export const GCC_COUNTRIES: Record<string, { currency: string; vatRate: number }> = {
  'Saudi Arabia': { currency: 'SAR', vatRate: 15 },
  'United Arab Emirates': { currency: 'AED', vatRate: 5 },
  'Bahrain': { currency: 'BHD', vatRate: 10 },
  'Oman': { currency: 'OMR', vatRate: 5 },
  'Qatar': { currency: 'QAR', vatRate: 0 },
  'Kuwait': { currency: 'KWD', vatRate: 0 },
};

const DEFAULT_SETTINGS: OrganizationSettings = {
  companyName: 'My Company',
  address: '',
  country: 'Saudi Arabia',
  crNumber: '',
  vatNumber: '',
  currency: 'SAR',
  vatRate: 15,
  warehouses: [
    {
      id: '1',
      name: 'Main Warehouse',
      location: 'Main Branch',
      isDefault: true
    }
  ],
  zatca: {
    enabled: false,
    phase: '1'
  }
};

export const OrganizationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<OrganizationSettings>(() => {
    const saved = localStorage.getItem('organizationSettings');
    return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
  });

  useEffect(() => {
    localStorage.setItem('organizationSettings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<OrganizationSettings>) => {
    setSettings((prev) => {
      // Auto-update currency and VAT rate if country changes
      if (newSettings.country && GCC_COUNTRIES[newSettings.country]) {
        const { currency, vatRate } = GCC_COUNTRIES[newSettings.country];
        return { ...prev, ...newSettings, currency, vatRate };
      }
      return { ...prev, ...newSettings };
    });
  };

  return (
    <OrganizationContext.Provider value={{ settings, updateSettings }}>
      {children}
    </OrganizationContext.Provider>
  );
};

export const useOrganization = () => {
  const context = useContext(OrganizationContext);
  if (!context) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
};
