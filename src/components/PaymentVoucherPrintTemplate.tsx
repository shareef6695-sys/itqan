import React from 'react';
import { useOrganization } from '../context/OrganizationContext';
import { useTranslation } from 'react-i18next';

// Define interface locally
export interface PaymentMade {
  id: string;
  date: string;
  number: string;
  vendor: string;
  vendorId?: string; // Added field
  amount: number;
  mode: string;
  reference: string;
  description: string;
  status: 'paid' | 'pending' | 'cancelled'; // Updated status types
}

interface PaymentVoucherPrintTemplateProps {
  data: PaymentMade;
}

export const PaymentVoucherPrintTemplate: React.FC<PaymentVoucherPrintTemplateProps> = ({ data }) => {
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
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('purchase.paymentsMade.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.number}</p>
        </div>
      </div>

      {/* Payment Info */}
      <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex justify-between items-center rtl:flex-row-reverse">
          <div className="rtl:text-right">
            <span className="text-gray-500 text-xs font-medium uppercase block mb-1">{t('purchase.paymentsMade.print.paidTo')}</span>
            <span className="text-xl font-bold text-gray-900">{data.vendor}</span>
          </div>
          <div className="text-right rtl:text-left">
            <span className="text-gray-500 text-xs font-medium uppercase block mb-1">{t('purchase.paymentsMade.print.vendorId')}</span>
            <span className="text-gray-900 font-medium">{data.vendorId || '-'}</span>
          </div>
        </div>
        
        <div className="p-6">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4 border-b border-gray-100 pb-2 rtl:text-right">{t('purchase.paymentsMade.print.paymentInfo')}</h3>
          
          <div className="grid grid-cols-2 gap-y-4 gap-x-8">
            <div className="flex justify-between rtl:flex-row-reverse border-b border-gray-50 pb-2">
              <span className="text-gray-600">{t('purchase.paymentsMade.print.paymentDate')}</span>
              <span className="font-medium text-gray-900">{data.date}</span>
            </div>
            
            <div className="flex justify-between rtl:flex-row-reverse border-b border-gray-50 pb-2">
              <span className="text-gray-600">{t('purchase.paymentsMade.print.paymentMode')}</span>
              <span className="font-medium text-gray-900">{data.mode}</span>
            </div>
            
            <div className="flex justify-between rtl:flex-row-reverse border-b border-gray-50 pb-2">
              <span className="text-gray-600">{t('purchase.paymentsMade.print.reference')}</span>
              <span className="font-medium text-gray-900">{data.reference || '-'}</span>
            </div>
            
            <div className="flex justify-between rtl:flex-row-reverse border-b border-gray-50 pb-2">
              <span className="text-gray-600 font-bold">{t('purchase.paymentsMade.print.amountPaid')}</span>
              <span className="font-bold text-indigo-600">{settings.currency} {data.amount.toFixed(2)}</span>
            </div>
          </div>
          
          {data.description && (
            <div className="mt-6 pt-4 border-t border-gray-100 rtl:text-right">
              <span className="block text-gray-500 text-xs font-medium uppercase mb-2">{t('purchase.paymentsMade.print.description')}</span>
              <p className="text-gray-700 bg-gray-50 p-3 rounded text-sm">{data.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Amount in Words (Placeholder for now as we don't have a utility for this yet) */}
      <div className="mb-12 rtl:text-right">
         <p className="text-sm text-gray-600 italic border-l-4 border-indigo-200 pl-4 py-2 bg-indigo-50 rtl:border-l-0 rtl:border-r-4 rtl:pl-0 rtl:pr-4">
           {/* We can add amount in words logic later */}
           ** {settings.currency} {data.amount.toFixed(2)} **
         </p>
      </div>

      {/* Signatures */}
      <div className="grid grid-cols-2 gap-12 mt-20">
        <div className="border-t border-gray-300 pt-4 text-center">
          <p className="font-bold text-gray-900">{t('purchase.paymentsMade.print.preparedBy')}</p>
          <p className="text-xs text-gray-500 mt-1">{settings.companyName}</p>
        </div>
        <div className="border-t border-gray-300 pt-4 text-center">
          <p className="font-bold text-gray-900">{t('purchase.paymentsMade.print.receiversSignature')}</p>
          <p className="text-xs text-gray-500 mt-1">{data.vendor}</p>
        </div>
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-xs text-gray-400">This is a computer generated receipt.</p>
      </div>
    </div>
  );
};
