import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import { QRCodeCanvas } from 'qrcode.react';

interface Client {
  id: string;
  customerId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  crNumber: string;
  vatNumber: string;
  vatRate: number;
  status: 'active' | 'inactive';
  balance: number;
}

interface ClientPrintTemplateProps {
  client: Client;
}

export const ClientPrintTemplate: React.FC<ClientPrintTemplateProps> = ({ client }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  return (
    <div className="p-8 bg-white text-gray-900 font-sans" dir={document.dir}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-4 rtl:flex-row-reverse">
        <div className="rtl:text-right">
          <h1 className="text-2xl font-bold text-indigo-600">{settings.companyName}</h1>
          <p className="text-sm text-gray-500 mt-1">{settings.address}</p>
          <p className="text-sm text-gray-500">{settings.email} | {settings.phone}</p>
          <p className="text-sm text-gray-500">{t('settings.fields.vatNumber') || 'VAT No'}: {settings.vatNumber}</p>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-3xl font-bold text-gray-800">{t('sales.clients.print.title')}</h2>
          <p className="text-gray-500 mt-1">{t('sales.clients.print.generatedOn')}: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Client Info & QR */}
      <div className="mb-8">
        <div className="flex justify-between items-start rtl:flex-row-reverse">
            <div className="rtl:text-right">
                 <h3 className="text-2xl font-bold text-gray-900">{client.companyName}</h3>
                 <p className="text-lg text-gray-600 mb-1">{client.customerId}</p>
                 <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${client.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {t(`sales.clients.status.${client.status}`)}
                 </span>
            </div>
            <div>
                <QRCodeCanvas value={`Client:${client.customerId}|VAT:${client.vatNumber}`} size={100} />
            </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 gap-x-12 gap-y-6 mb-8 rtl:text-right">
         <div className="col-span-2">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">{t('sales.clients.print.contactInfo')}</h4>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.contactPerson')}</span>
            <span className="font-medium text-lg">{client.contactPerson}</span>
         </div>
         
         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.email')}</span>
            <span className="font-medium text-lg">{client.email}</span>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.phone')}</span>
            <span className="font-medium text-lg">{client.phone}</span>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.address')}</span>
            <span className="font-medium text-lg">{client.address}</span>
            <span className="block text-gray-600">{client.country}</span>
         </div>

         <div className="col-span-2 mt-4">
            <h4 className="text-lg font-semibold text-gray-800 border-b border-gray-200 pb-2 mb-4">{t('sales.clients.print.businessDetails')}</h4>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.crNumber')}</span>
            <span className="font-medium text-lg">{client.crNumber || '-'}</span>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.vatNumber')}</span>
            <span className="font-medium text-lg">{client.vatNumber || '-'}</span>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.vatRate')}</span>
            <span className="font-medium text-lg">{client.vatRate}%</span>
         </div>

         <div>
            <span className="text-gray-500 block text-sm uppercase tracking-wider">{t('sales.clients.print.currentBalance')}</span>
            <span className={`font-medium text-lg ${client.balance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {settings.currency} {client.balance.toFixed(2)}
            </span>
         </div>
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>{t('sales.clients.print.confidential')}</p>
      </div>
    </div>
  );
};
