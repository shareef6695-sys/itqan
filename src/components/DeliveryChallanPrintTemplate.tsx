import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { DeliveryChallan } from '../pages/sales/DeliveryChallans';

interface DeliveryChallanPrintTemplateProps {
  data: DeliveryChallan;
}

export const DeliveryChallanPrintTemplate: React.FC<DeliveryChallanPrintTemplateProps> = ({ data }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

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
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('sales.deliveryChallans.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.number}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`sales.deliveryChallans.status.${data.status}`)}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 rtl:flex-row-reverse">
        <div className="w-1/2 pr-4 rtl:pl-4 rtl:pr-0 rtl:text-right">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('sales.deliveryChallans.print.deliveredTo')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.client}</p>
          <p className="text-gray-500 text-xs mt-1">{t('sales.deliveryChallans.print.clientID')}: {data.id}</p>
        </div>
        
        <div className="w-1/2 pl-4 border-l border-gray-200 rtl:pr-4 rtl:pl-0 rtl:border-l-0 rtl:border-r rtl:text-right">
          <div className="flex justify-between mb-2 rtl:flex-row-reverse">
            <span className="text-gray-500 text-xs uppercase font-medium">{t('sales.deliveryChallans.challanDate')}:</span>
            <span className="font-bold text-gray-900">{data.date}</span>
          </div>
          <div className="flex justify-between mb-2 rtl:flex-row-reverse">
            <span className="text-gray-500 text-xs uppercase font-medium">{t('sales.deliveryChallans.reference')}:</span>
            <span className="font-bold text-gray-900">{data.reference}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-12 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-200">
            <th className="py-3 px-4 text-left rtl:text-right font-bold text-gray-700 w-16 text-xs uppercase tracking-wider">#</th>
            <th className="py-3 px-4 text-left rtl:text-right font-bold text-gray-700 text-xs uppercase tracking-wider">{t('sales.deliveryChallans.print.itemDescription')}</th>
            <th className="py-3 px-4 text-right rtl:text-left font-bold text-gray-700 w-32 text-xs uppercase tracking-wider">{t('sales.deliveryChallans.print.quantity')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items && data.items.length > 0 ? (
            data.items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-500 text-xs rtl:text-right">{index + 1}</td>
                <td className="py-3 px-4 text-gray-900 font-medium rtl:text-right">{item.description}</td>
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
          <p className="font-bold text-gray-900 text-xs uppercase">{t('sales.deliveryChallans.print.preparedBy')}</p>
          <p className="text-gray-500 text-[10px] mt-1">{t('sales.deliveryChallans.print.signatureDate')}</p>
        </div>
        
        <div className="w-1/3 text-center px-8">
            <div className="h-20 border-b border-gray-300 mb-2"></div>
            <p className="font-bold text-gray-900 text-xs uppercase">{t('sales.deliveryChallans.print.deliveredBy')}</p>
            <p className="text-gray-500 text-[10px] mt-1">{t('sales.deliveryChallans.print.driverSignature')}</p>
        </div>

        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('sales.deliveryChallans.print.receivedBy')}</p>
          <p className="text-gray-500 text-[10px] mt-1">{t('sales.deliveryChallans.print.clientSignature')}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-[10px]">
        <p>{t('sales.deliveryChallans.print.disclaimer')}</p>
        <p className="mt-1">{settings.website}</p>
      </div>
    </div>
  );
};
