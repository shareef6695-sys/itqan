import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import { QRCodeCanvas } from 'qrcode.react';
import { generateZatcaTLV } from '../utils/zatca';

export interface PrintItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

export interface PrintData {
  title: string;
  documentNo: string;
  date: string;
  dueDate?: string;
  clientName: string;
  clientAddress?: string;
  clientVatNo?: string;
  items: PrintItem[];
  subtotal: number;
  tax: number;
  total: number;
  terms?: string;
  status?: string;
}

interface PrintTemplateProps {
  data: PrintData;
}

export const PrintTemplate: React.FC<PrintTemplateProps> = ({ data }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  return (
    <div className="bg-white p-8 max-w-[210mm] mx-auto min-h-[297mm] text-sm text-gray-900 font-sans" id="print-content" dir={document.dir}>
      {/* Header */}
      <div className="flex justify-between items-start border-b pb-6 mb-6 rtl:flex-row-reverse">
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
            <p className="text-gray-600 text-xs">{t('common.printTemplate.vatNo')}: {settings.vatNumber}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{data.title}</h2>
          <p className="text-gray-500 mt-1"># {data.documentNo}</p>
          {data.status && (
             <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
               {t(`common.${data.status.toLowerCase()}`) || data.status}
             </div>
          )}
        </div>
      </div>

      {/* Client & Document Info */}
      <div className="flex justify-between mb-8 rtl:flex-row-reverse">
        <div className="w-1/2 pr-4 rtl:pl-4 rtl:pr-0 rtl:text-right">
          <h3 className="text-gray-500 font-medium mb-1 uppercase text-xs">{t('common.printTemplate.billTo')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.clientName}</p>
          {data.clientAddress && <p className="text-gray-600">{data.clientAddress}</p>}
          {data.clientVatNo && <p className="text-gray-600">{t('common.printTemplate.vatNo')}: {data.clientVatNo}</p>}
        </div>
        <div className="w-1/3 text-right rtl:text-left">
          <div className="flex justify-between mb-1 rtl:flex-row-reverse">
            <span className="text-gray-500">{t('common.printTemplate.date')}:</span>
            <span className="font-medium">{data.date}</span>
          </div>
          {data.dueDate && (
            <div className="flex justify-between mb-1 rtl:flex-row-reverse">
              <span className="text-gray-500">{t('common.printTemplate.dueDate')}:</span>
              <span className="font-medium">{data.dueDate}</span>
            </div>
          )}
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse rtl:text-right">
        <thead>
          <tr className="bg-gray-50 border-y border-gray-200 text-xs uppercase">
            <th className="py-2 px-3 text-left rtl:text-right font-semibold text-gray-700 w-12">#</th>
            <th className="py-2 px-3 text-left rtl:text-right font-semibold text-gray-700">{t('common.printTemplate.description')}</th>
            <th className="py-2 px-3 text-right rtl:text-left font-semibold text-gray-700 w-24">{t('common.printTemplate.quantity')}</th>
            <th className="py-2 px-3 text-right rtl:text-left font-semibold text-gray-700 w-32">{t('common.printTemplate.rate')}</th>
            <th className="py-2 px-3 text-right rtl:text-left font-semibold text-gray-700 w-32">{t('common.printTemplate.amount')}</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.id} className="border-b border-gray-100">
              <td className="py-3 px-3 text-gray-500">{index + 1}</td>
              <td className="py-3 px-3 text-gray-900">{item.description}</td>
              <td className="py-3 px-3 text-right rtl:text-left text-gray-900">{item.quantity}</td>
              <td className="py-3 px-3 text-right rtl:text-left text-gray-900">{item.rate.toFixed(2)}</td>
              <td className="py-3 px-3 text-right rtl:text-left font-medium text-gray-900">{item.amount.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Footer & Totals */}
      <div className="flex justify-between items-start rtl:flex-row-reverse">
        <div className="w-1/2 pr-8 rtl:pl-8 rtl:pr-0 rtl:text-right">
           {/* Terms */}
           {data.terms && (
             <div className="mb-6">
               <h4 className="font-semibold text-gray-700 mb-2">{t('common.printTemplate.terms')}</h4>
               <p className="text-gray-600 text-xs whitespace-pre-wrap">{data.terms}</p>
             </div>
           )}

           {/* ZATCA QR Code */}
           {settings.zatca?.enabled && (
            <div className="mt-4">
              <div className="inline-block p-2 bg-white border border-gray-200 rounded">
                 <QRCodeCanvas
                    value={generateZatcaTLV({
                      sellerName: settings.companyName,
                      vatRegistrationNumber: settings.vatNumber,
                      timestamp: `${data.date}T12:00:00Z`,
                      invoiceTotal: data.total.toString(),
                      vatTotal: data.tax.toFixed(2)
                    })}
                    size={100}
                    level={"M"}
                  />
              </div>
            </div>
           )}
        </div>

        <div className="w-1/3">
          <div className="space-y-2">
            <div className="flex justify-between text-gray-600 rtl:flex-row-reverse">
              <span>{t('common.printTemplate.subtotal')}</span>
              <span>{settings.currency} {data.subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600 rtl:flex-row-reverse">
              <span>{t('common.printTemplate.vat')} ({settings.vatRate}%)</span>
              <span>{settings.currency} {data.tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 border-t border-gray-200 pt-2 mt-2 rtl:flex-row-reverse">
              <span>{t('common.printTemplate.total')}</span>
              <span>{settings.currency} {data.total.toFixed(2)}</span>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-300 pt-4 text-center">
            <p className="text-gray-500 text-xs">{t('common.printTemplate.authorizedSignature')}</p>
          </div>
        </div>
      </div>
      
      {/* Page Footer */}
      <div className="mt-auto pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
        <p>{t('common.printTemplate.thankYou')}</p>
        <p>{settings.phone} | {settings.email} | {settings.website}</p>
      </div>
    </div>
  );
};
