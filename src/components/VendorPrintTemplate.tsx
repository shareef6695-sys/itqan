import React from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useTranslation } from 'react-i18next';

// Define interface locally to avoid circular dependencies
export interface Vendor {
  id: string;
  name: string;
  email: string;
  phone: string;
  contactPerson: string;
  taxId: string;
  currency: string;
  address: string;
  status: 'active' | 'inactive';
  createdAt?: string;
}

interface VendorPrintTemplateProps {
  data: Vendor;
}

export const VendorPrintTemplate: React.FC<VendorPrintTemplateProps> = ({ data }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] text-sm text-gray-900 font-sans" id="print-content" dir={document.dir}>
      {/* Header */}
      <div className="flex justify-between items-start border-b border-gray-200 pb-6 mb-8 rtl:flex-row-reverse">
        <div className="flex items-center rtl:flex-row-reverse">
          {settings.logo ? (
            <img src={settings.logo} alt="Company Logo" className="h-16 w-auto object-contain mr-4 rtl:ml-4 rtl:mr-0" />
          ) : (
            <div className="h-16 w-16 bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xl mr-4 rtl:ml-4 rtl:mr-0 rounded-lg">
              {settings.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}
          <div className="rtl:text-right">
            <h1 className="text-xl font-bold text-gray-900">{settings.companyName}</h1>
            <p className="text-gray-600 whitespace-pre-line text-xs mt-1">{settings.address}</p>
            <p className="text-gray-600 text-xs">{t('settings.fields.phone')}: {settings.phone}</p>
            <p className="text-gray-600 text-xs">{t('settings.fields.email')}: {settings.email}</p>
            <p className="text-gray-600 text-xs">{t('settings.fields.taxId')}: {settings.vatNumber}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('purchase.vendors.print.vendorProfile')}</h2>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`common.${data.status}`) || data.status}
          </div>
        </div>
      </div>

      {/* Vendor Details */}
      <div className="mb-8">
        <div className="bg-gray-50 p-4 rounded-t-lg border border-gray-200 border-b-0">
          <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide rtl:text-right">{data.name}</h3>
        </div>
        <div className="border border-gray-200 rounded-b-lg p-6">
          <div className="grid grid-cols-2 gap-x-8 gap-y-6">
            <div className="rtl:text-right">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">{t('purchase.vendors.print.contactInfo')}</h4>
              
              <div className="mb-3">
                <span className="block text-gray-500 text-xs mb-1">{t('purchase.vendors.print.contactPerson')}</span>
                <span className="text-gray-900 font-medium">{data.contactPerson}</span>
              </div>
              
              <div className="mb-3">
                <span className="block text-gray-500 text-xs mb-1">{t('purchase.vendors.print.email')}</span>
                <span className="text-gray-900 font-medium">{data.email}</span>
              </div>
              
              <div>
                <span className="block text-gray-500 text-xs mb-1">{t('purchase.vendors.print.phone')}</span>
                <span className="text-gray-900 font-medium">{data.phone}</span>
              </div>
            </div>
            
            <div className="rtl:text-right">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3 border-b border-gray-100 pb-1">{t('purchase.vendors.print.businessDetails')}</h4>
              
              <div className="mb-3">
                <span className="block text-gray-500 text-xs mb-1">{t('purchase.vendors.print.vatNumber')}</span>
                <span className="text-gray-900 font-medium">{data.taxId || '-'}</span>
              </div>
              
              <div className="mb-3">
                <span className="block text-gray-500 text-xs mb-1">{t('common.currency')}</span>
                <span className="text-gray-900 font-medium">{data.currency}</span>
              </div>

              <div>
                <span className="block text-gray-500 text-xs mb-1">{t('purchase.vendors.print.address')}</span>
                <span className="text-gray-900 font-medium whitespace-pre-line">{data.address}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-gray-400 text-xs mt-12 pt-8 border-t border-gray-100">
        <p>{t('purchase.vendors.print.generatedOn')}: {new Date().toLocaleDateString()}</p>
      </div>
    </div>
  );
};
