import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { Expense } from '../pages/finance/Expenses';

interface ExpenseVoucherPrintTemplateProps {
  data: Expense;
}

export const ExpenseVoucherPrintTemplate: React.FC<ExpenseVoucherPrintTemplateProps> = ({ data }) => {
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
          <h2 className="text-2xl font-bold text-indigo-600 uppercase tracking-wide">{t('finance.expenses.print.title')}</h2>
          <p className="text-gray-500 mt-1 font-medium"># {data.id}</p>
          <div className="mt-2 inline-block px-3 py-1 bg-gray-100 border border-gray-200 rounded text-xs font-semibold uppercase text-gray-700">
            {t(`common.${data.status}`) || data.status}
          </div>
        </div>
      </div>

      {/* Expense Details */}
      <div className="mb-8 grid grid-cols-2 gap-8 rtl:text-right">
        <div>
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('finance.expenses.print.paidTo')}</h3>
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
            <p className="font-bold text-gray-900 text-lg">{data.vendor}</p>
            <p className="text-gray-500 text-xs mt-1">{t('finance.expenses.print.category')}: {data.category}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">{t('finance.expenses.print.expenseInfo')}</h3>
          <div className="space-y-2">
            <div className="flex justify-end rtl:flex-row-reverse">
              <span className="text-gray-500 w-32 rtl:text-right">{t('finance.expenses.print.date')}:</span>
              <span className="font-bold text-gray-900">{data.date}</span>
            </div>
            <div className="flex justify-end rtl:flex-row-reverse">
              <span className="text-gray-500 w-32 rtl:text-right">{t('finance.expenses.print.category')}:</span>
              <span className="font-medium text-gray-900">{data.category}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Amount Section */}
      <div className="mb-12 bg-indigo-50 border border-indigo-100 p-6 rounded-lg text-center">
        <p className="text-indigo-600 text-xs font-bold uppercase tracking-wider mb-2">{t('finance.expenses.print.totalAmount')}</p>
        <p className="text-4xl font-bold text-indigo-900">
          {settings.currency} {data.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </div>

      {/* Description */}
      <div className="mb-12 rtl:text-right">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">{t('finance.expenses.print.description')}</h3>
        <div className="border border-gray-200 rounded-lg p-4 h-24 text-gray-600 italic">
          {data.description || t('finance.expenses.print.noDescription')}
        </div>
      </div>

      {/* Signatures */}
      <div className="flex justify-between items-end mt-auto pt-12 border-t border-gray-200 rtl:flex-row-reverse">
        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('finance.expenses.print.requestedBy')}</p>
        </div>
        
        <div className="w-1/3 text-center px-8">
            <div className="h-20 border-b border-gray-300 mb-2"></div>
            <p className="font-bold text-gray-900 text-xs uppercase">{t('finance.expenses.print.approvedBy')}</p>
        </div>

        <div className="w-1/3 text-center">
          <div className="h-20 border-b border-gray-300 mb-2"></div>
          <p className="font-bold text-gray-900 text-xs uppercase">{t('finance.expenses.print.receivedBy')}</p>
          <p className="text-gray-500 text-[10px] mt-1">{t('finance.expenses.print.date')}</p>
        </div>
      </div>
      
      {/* Footer */}
      <div className="mt-8 text-center text-gray-400 text-[10px]">
        <p>{t('finance.expenses.print.record')}</p>
        <p className="mt-1">{settings.website}</p>
      </div>
    </div>
  );
};
