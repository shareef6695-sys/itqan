import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { StockTransfer } from '../pages/inventory/StockTransfers';

interface StockTransferPrintTemplateProps {
  data: StockTransfer;
}

export const StockTransferPrintTemplate: React.FC<StockTransferPrintTemplateProps> = ({ data }) => {
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
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('inventory.stockTransfers.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.reference}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`inventory.stockTransfers.status.${data.status}`) || data.status.replace('_', ' ')}
          </div>
        </div>
      </div>

      {/* Transfer Details */}
      <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 rtl:flex-row-reverse">
        <div className="w-1/3 rtl:text-right">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('inventory.stockTransfers.print.fromWarehouse')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.fromWarehouseName}</p>
          <p className="text-gray-500 text-xs mt-1">{t('inventory.stockTransfers.print.sourceLocation')}</p>
        </div>
        
        <div className="flex items-center justify-center w-1/3">
            <div className="h-px bg-gray-300 w-full relative">
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                    <span className="text-gray-400 text-xs">{t('inventory.stockTransfers.print.transferring')}</span>
                </div>
            </div>
        </div>

        <div className="w-1/3 text-right rtl:text-left">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('inventory.stockTransfers.print.toWarehouse')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.toWarehouseName}</p>
          <p className="text-gray-500 text-xs mt-1">{t('inventory.stockTransfers.print.destinationLocation')}</p>
        </div>
      </div>

      <div className="mb-8 flex justify-end rtl:justify-start">
          <div className="text-right rtl:text-left">
              <span className="text-gray-500 text-xs font-medium uppercase mr-2 rtl:ml-2 rtl:mr-0">{t('inventory.stockTransfers.print.transferDate')}:</span>
              <span className="font-bold text-gray-900">{data.date}</span>
          </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12 border-collapse text-left rtl:text-right">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-200">
            <th className="py-3 px-4 font-bold text-gray-700 w-16 text-xs uppercase tracking-wider">#</th>
            <th className="py-3 px-4 font-bold text-gray-700 text-xs uppercase tracking-wider">{t('inventory.stockTransfers.print.itemDescription')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('inventory.stockTransfers.print.quantity')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items && data.items.length > 0 ? (
            data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-500 text-xs">{index + 1}</td>
                <td className="py-3 px-4 text-gray-900 font-medium">{item.productName}</td>
                <td className="py-3 px-4 text-right rtl:text-left text-gray-900 font-bold">{item.quantity}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="py-8 text-center text-gray-500 italic">{t('common.noData')}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-auto pt-12 border-t border-gray-200 rtl:flex-row-reverse">
        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('inventory.stockTransfers.print.authorizedBySource')}</p>
          <p className="text-gray-500 text-[10px] mt-1">{t('inventory.stockTransfers.print.signatureDate')}</p>
        </div>
        
        <div className="w-1/3 text-center px-8">
            <div className="h-20 border-b border-gray-300 mb-2"></div>
            <p className="font-bold text-gray-900 text-xs uppercase">{t('inventory.stockTransfers.print.carrierDriver')}</p>
            <p className="text-gray-500 text-[10px] mt-1">{t('inventory.stockTransfers.print.signatureDate')}</p>
        </div>

        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('inventory.stockTransfers.print.receivedByDestination')}</p>
          <p className="text-gray-500 text-[10px] mt-1">{t('inventory.stockTransfers.print.signatureDate')}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-[10px]">
        <p>{t('inventory.stockTransfers.print.disclaimer')}</p>
        <p className="mt-1">{settings.website}</p>
      </div>
    </div>
  );
};
