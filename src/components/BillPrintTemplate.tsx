import React from 'react';
import { useOrganization } from '../context/OrganizationContext';
import type { BillItem } from '../pages/purchase/Bills';
import { useTranslation } from 'react-i18next';

// Define interface locally
export interface Bill {
  id: string;
  number: string;
  vendor: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  items?: BillItem[];
}

interface BillPrintTemplateProps {
  data: Bill;
}

export const BillPrintTemplate: React.FC<BillPrintTemplateProps> = ({ data }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  // Calculate subtotal and tax
  let subtotal = 0;
  let tax = 0;
  const items = data.items || [];
  
  if (items.length > 0) {
      subtotal = items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
      tax = subtotal * (settings.vatRate / 100);
  } else {
      subtotal = data.amount / (1 + settings.vatRate / 100);
      tax = data.amount - subtotal;
  }

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
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('purchase.bills.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.number}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`common.${data.status}`) || data.status}
          </div>
        </div>
      </div>

      {/* Vendor & Bill Info */}
      <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 rtl:flex-row-reverse">
        <div className="w-1/2 rtl:text-right">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('purchase.bills.print.vendor')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.vendor}</p>
          <p className="text-gray-500 text-xs mt-1">Vendor Address...</p>
        </div>
        
        <div className="w-1/2 text-right rtl:text-left">
          <div className="mb-2">
            <span className="text-gray-500 text-xs font-medium uppercase mr-2">{t('purchase.bills.print.billDate')}:</span>
            <span className="font-bold text-gray-900">{data.date}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium uppercase mr-2">{t('purchase.bills.print.dueDate')}:</span>
            <span className="font-bold text-gray-900">{data.dueDate}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-200">
            <th className="py-3 px-4 text-left rtl:text-right font-bold text-gray-700 w-16 text-xs uppercase tracking-wider">#</th>
            <th className="py-3 px-4 text-left rtl:text-right font-bold text-gray-700 text-xs uppercase tracking-wider">{t('purchase.bills.print.itemDescription')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-24 text-xs uppercase tracking-wider">{t('purchase.bills.print.quantity')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('purchase.bills.print.rate')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('purchase.bills.print.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-left rtl:text-right text-gray-600">{index + 1}</td>
                <td className="py-3 px-4 text-left rtl:text-right font-medium text-gray-900">{item.description}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-600">{item.quantity}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-600">{settings.currency} {item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-900 font-medium">{settings.currency} {(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))
          ) : (
             <tr className="border-b border-gray-100">
                <td colSpan={5} className="py-8 text-center text-gray-500 italic">
                    {t('common.noData') || 'No items found'}
                </td>
             </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end rtl:justify-start">
        <div className="w-1/2 sm:w-1/3">
          <div className="flex justify-between py-2 text-gray-600">
            <span>{t('sales.subtotal') || 'Subtotal'}</span>
            <span className="font-medium">{settings.currency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 text-gray-600 border-b border-gray-200">
            <span>{t('sales.vat') || 'VAT'} ({settings.vatRate}%)</span>
            <span className="font-medium">{settings.currency} {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 text-xl font-bold text-indigo-600">
            <span>{t('sales.total') || 'Total'}</span>
            <span>{settings.currency} {data.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
