import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { StockAdjustment } from '../pages/inventory/StockAdjustments';

interface StockAdjustmentPrintTemplateProps {
  data: StockAdjustment;
}

export const StockAdjustmentPrintTemplate: React.FC<StockAdjustmentPrintTemplateProps> = ({ data }) => {
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
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('inventory.stockAdjustments.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.reference}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`inventory.stockAdjustments.status.${data.status}`) || data.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Adjustment Details */}
      <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 rtl:flex-row-reverse">
        <div className="w-1/3 rtl:text-right">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('inventory.stockAdjustments.print.warehouse')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.warehouseName}</p>
          <p className="text-gray-500 text-xs mt-1">{t('inventory.stockAdjustments.print.location')}</p>
        </div>
        
        <div className="w-1/3 text-center">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('inventory.stockAdjustments.print.reason')}</h3>
          <p className="font-bold text-gray-900 text-lg">{t(`inventory.stockAdjustments.reasons.${data.reason}`) || data.reason}</p>
        </div>

        <div className="w-1/3 text-right rtl:text-left">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('inventory.stockAdjustments.print.date')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.date}</p>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12 border-collapse text-left rtl:text-right">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-200">
            <th className="py-3 px-4 font-bold text-gray-700 w-16 text-xs uppercase tracking-wider">#</th>
            <th className="py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">{t('inventory.stockAdjustments.print.itemDescription')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('inventory.stockAdjustments.print.currentStock')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('inventory.stockAdjustments.print.adjustment')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items && data.items.length > 0 ? (
            data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                <td className="py-3 px-4 text-gray-900 font-medium">{item.productName}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-900">{item.currentStock}</td>
                <td className={`py-3 px-4 text-right rtl:text-left font-bold ${item.quantityChange < 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="py-8 text-center text-gray-500 italic">{t('common.noData')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-auto pt-12 border-t border-gray-200 rtl:flex-row-reverse">
        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('inventory.stockAdjustments.print.preparedBy')}</p>
        </div>
        
        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('inventory.stockAdjustments.print.authorizedBy')}</p>
        </div>
      </div>
      
      <div className="mt-8 text-center text-xs text-gray-400">
        <p>{t('inventory.stockAdjustments.print.disclaimer')}</p>
      </div>
    </div>
  );
};
