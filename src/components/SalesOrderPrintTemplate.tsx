import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { SalesOrder } from '../pages/sales/SalesOrders';

interface SalesOrderPrintTemplateProps {
  data: SalesOrder;
}

export const SalesOrderPrintTemplate: React.FC<SalesOrderPrintTemplateProps> = ({ data }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  // Calculate subtotal and tax
  const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.rate), 0);
  const tax = data.amount - subtotal; // Assuming amount is total

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] text-sm text-gray-900 font-sans" dir={document.dir}>
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
            <p className="text-gray-600 text-xs">{t('settings.fields.vatNumber')}: {settings.vatNumber}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('sales.salesOrders.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.number}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`sales.salesOrders.status.${data.status}`)}
          </div>
        </div>
      </div>

      {/* Client & Order Info */}
      <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 rtl:flex-row-reverse">
        <div className="w-1/2 rtl:text-right">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('sales.salesOrders.print.billTo')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.client}</p>
          <p className="text-gray-500 text-xs mt-1">{t('settings.fields.address')}</p>
        </div>
        
        <div className="w-1/2 text-right rtl:text-left">
          <div className="mb-2">
            <span className="text-gray-500 text-xs font-medium uppercase mr-2 rtl:ml-2 rtl:mr-0">{t('sales.salesOrders.print.orderDate')}:</span>
            <span className="font-bold text-gray-900">{data.date}</span>
          </div>
          <div>
            <span className="text-gray-500 text-xs font-medium uppercase mr-2 rtl:ml-2 rtl:mr-0">{t('sales.salesOrders.print.deliveryDate')}:</span>
            <span className="font-bold text-gray-900">{data.deliveryDate}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-200">
            <th className="py-3 px-4 text-left rtl:text-right font-bold text-gray-700 w-16 text-xs uppercase tracking-wider">#</th>
            <th className="py-3 px-4 text-left rtl:text-right font-bold text-gray-700 text-xs uppercase tracking-wider">{t('sales.salesOrders.print.itemDescription')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-24 text-xs uppercase tracking-wider">{t('sales.salesOrders.print.quantity')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('sales.salesOrders.print.rate')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('sales.salesOrders.print.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items && data.items.length > 0 ? (
            data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-500 text-xs text-left rtl:text-right">{index + 1}</td>
                <td className="py-3 px-4 text-gray-900 font-medium text-left rtl:text-right">{item.description}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-900">{item.quantity} {item.unit}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-900">{settings.currency} {item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-900 font-medium">{settings.currency} {(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500 italic">{t('common.noData')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12 rtl:justify-start">
        <div className="w-1/3">
          <div className="flex justify-between py-2 border-b border-gray-100 rtl:flex-row-reverse">
            <span className="text-gray-600 text-xs font-medium">{t('sales.subtotal')}</span>
            <span className="font-bold text-gray-900">{settings.currency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 rtl:flex-row-reverse">
            <span className="text-gray-600 text-xs font-medium">{t('sales.vat')} ({settings.vatRate}%)</span>
            <span className="font-bold text-gray-900">{settings.currency} {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b-2 border-gray-200 rtl:flex-row-reverse">
            <span className="text-gray-800 text-sm font-bold uppercase">{t('sales.total')}</span>
            <span className="font-bold text-indigo-600 text-lg">{settings.currency} {data.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Terms & Signatures */}
      <div className="mt-auto">
        <div className="mb-8 text-xs text-gray-500 rtl:text-right">
          <h4 className="font-bold text-gray-700 uppercase mb-2">{t('sales.salesOrders.print.termsConditions')}</h4>
          <p>1. {t('sales.salesOrders.print.terms1')}</p>
          <p>2. {t('sales.salesOrders.print.terms2')}</p>
          <p>3. {t('sales.salesOrders.print.terms3')}</p>
        </div>

        <div className="flex justify-between items-end pt-8 border-t border-gray-200 rtl:flex-row-reverse">
          <div className="w-1/3 text-center">
            <div className="h-20 border-b border-gray-300 mb-2"></div>
            <p className="font-bold text-gray-900 text-xs uppercase">{t('sales.salesOrders.print.preparedBy')}</p>
          </div>
          <div className="w-1/3 text-center">
            <div className="h-20 border-b border-gray-300 mb-2"></div>
            <p className="font-bold text-gray-900 text-xs uppercase">{t('sales.salesOrders.print.approvedBy')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
