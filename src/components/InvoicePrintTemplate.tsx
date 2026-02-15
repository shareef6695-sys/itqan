import React from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import { generateZatcaTLV } from '../utils/zatca';
import type { Invoice } from '../pages/sales/Invoices';

interface InvoicePrintTemplateProps {
  data: Invoice;
}

export const InvoicePrintTemplate: React.FC<InvoicePrintTemplateProps> = ({ data }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  // Calculate totals if not present (assuming data structure)
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

  // Generate ZATCA QR Code Data
  const zatcaTLV = generateZatcaTLV({
    sellerName: settings.companyName,
    vatRegistrationNumber: settings.vatNumber,
    timestamp: data.date, // Should be timestamp ideally
    invoiceTotal: data.amount.toString(),
    vatTotal: tax.toString()
  });

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
            <p className="text-gray-600 text-xs">{t('settings.fields.vatNumber') || 'VAT No'}: {settings.vatNumber}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('sales.invoices.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.number}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`sales.invoices.status.${data.status}`)}
          </div>
        </div>
      </div>

      {/* Client & Invoice Info with QR Code */}
      <div className="flex justify-between mb-8 bg-gray-50 p-6 rounded-lg border border-gray-100 relative rtl:flex-row-reverse">
        <div className="w-1/3 rtl:text-right">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('sales.invoices.print.billTo')}</h3>
          <p className="font-bold text-gray-900 text-lg">{data.client}</p>
          <p className="text-gray-500 text-xs mt-1">Client Address...</p>
          <p className="text-gray-500 text-xs">{t('settings.fields.vatNumber') || 'VAT No'}: 300000000000003</p>
        </div>
        
        {/* QR Code Center */}
        <div className="w-1/3 flex justify-center items-center">
             <div className="bg-white p-2 rounded shadow-sm border border-gray-200">
                <QRCodeCanvas value={zatcaTLV} size={100} level="M" />
             </div>
        </div>

        <div className="w-1/3 text-right rtl:text-left">
          <div className="mb-2">
            <span className="text-gray-500 text-xs font-medium uppercase mr-2 rtl:ml-2 rtl:mr-0">{t('sales.invoices.print.invoiceDate')}:</span>
            <span className="font-bold text-gray-900">{data.date}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-500 text-xs font-medium uppercase mr-2 rtl:ml-2 rtl:mr-0">{t('sales.invoices.print.dueDate')}:</span>
            <span className="font-bold text-gray-900">{data.dueDate}</span>
          </div>
          <div className="mb-2">
            <span className="text-gray-500 text-xs font-medium uppercase mr-2 rtl:ml-2 rtl:mr-0">{t('sales.invoices.print.supplyDate')}:</span>
            <span className="font-bold text-gray-900">{data.date}</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full mb-8 border-collapse">
        <thead>
          <tr className="bg-gray-100 border-y border-gray-200">
            <th className="py-3 px-4 text-left font-bold text-gray-700 w-16 text-xs uppercase tracking-wider rtl:text-right">#</th>
            <th className="py-3 px-4 text-left font-bold text-gray-700 text-xs uppercase tracking-wider rtl:text-right">{t('sales.invoices.print.itemDescription') || 'Description'}</th>
            <th className="py-3 px-4 text-right font-bold text-gray-700 w-24 text-xs uppercase tracking-wider rtl:text-left">{t('sales.invoices.print.quantity') || 'Qty'}</th>
            <th className="py-3 px-4 text-right font-bold text-gray-700 w-32 text-xs uppercase tracking-wider rtl:text-left">{t('sales.invoices.print.rate') || 'Rate'}</th>
            <th className="py-3 px-4 text-right font-bold text-gray-700 w-32 text-xs uppercase tracking-wider rtl:text-left">{t('sales.invoices.print.amount') || 'Amount'}</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-gray-500 text-xs rtl:text-right">{index + 1}</td>
                <td className="py-3 px-4 text-gray-900 font-medium rtl:text-right">{item.description}</td>
                <td className="py-3 px-4 text-right text-gray-900 rtl:text-left">{item.quantity}</td>
                <td className="py-3 px-4 text-right text-gray-900 rtl:text-left">{settings.currency} {item.rate.toFixed(2)}</td>
                <td className="py-3 px-4 text-right text-gray-900 font-medium rtl:text-left">{settings.currency} {(item.quantity * item.rate).toFixed(2)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="py-8 text-center text-gray-500 italic">{t('common.noItems') || 'No items listed.'}</td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Totals */}
      <div className="flex justify-end mb-12 rtl:justify-start">
        <div className="w-1/3">
          <div className="flex justify-between py-2 border-b border-gray-100 rtl:flex-row-reverse">
            <span className="text-gray-600 text-xs font-medium">{t('sales.invoices.print.subtotalExclVat')}</span>
            <span className="font-bold text-gray-900">{settings.currency} {subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-gray-100 rtl:flex-row-reverse">
            <span className="text-gray-600 text-xs font-medium">{t('sales.invoices.print.vat')} ({settings.vatRate}%)</span>
            <span className="font-bold text-gray-900">{settings.currency} {tax.toFixed(2)}</span>
          </div>
          <div className="flex justify-between py-3 border-b-2 border-gray-200 rtl:flex-row-reverse">
            <span className="text-gray-800 text-sm font-bold uppercase">{t('sales.invoices.print.totalInclVat')}</span>
            <span className="font-bold text-indigo-600 text-lg">{settings.currency} {data.amount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Banking Info */}
      <div className="mt-auto pt-8 border-t border-gray-200">
        <div className="flex justify-between rtl:flex-row-reverse">
            <div className="text-xs text-gray-500 w-1/2 rtl:text-right">
                <h4 className="font-bold text-gray-700 uppercase mb-2">{t('sales.invoices.print.paymentDetails')}</h4>
                <p><span className="font-medium">{t('sales.invoices.print.bank')}:</span> {settings.bankName || 'Bank Name'}</p>
                <p><span className="font-medium">{t('sales.invoices.print.accountNo')}:</span> {settings.accountNumber || '0000 0000 0000'}</p>
                <p><span className="font-medium">{t('sales.invoices.print.iban')}:</span> {settings.iban || 'SA00 0000 0000 0000 0000 0000'}</p>
            </div>
            <div className="text-xs text-gray-500 w-1/3 text-right rtl:text-left">
                <h4 className="font-bold text-gray-700 uppercase mb-2">{t('sales.invoices.print.termsConditions')}</h4>
                <p>1. {t('sales.invoices.print.terms1')}</p>
                <p>2. {t('sales.invoices.print.terms2')}</p>
            </div>
        </div>
        <p className="text-center text-gray-400 text-[10px] mt-8">
            {t('sales.invoices.print.generatedBy')} - {new Date().toLocaleDateString()}
        </p>
      </div>
    </div>
  );
};
