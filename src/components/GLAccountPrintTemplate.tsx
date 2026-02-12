import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { GLAccount, AccountType } from '../data/financeData';

interface GLAccountPrintTemplateProps {
  accounts: GLAccount[];
}

export const GLAccountPrintTemplate: React.FC<GLAccountPrintTemplateProps> = ({ accounts }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  // Group accounts by type
  const groupedAccounts = accounts.reduce((acc, curr) => {
    (acc[curr.type] = acc[curr.type] || []).push(curr);
    return acc;
  }, {} as Record<AccountType, GLAccount[]>);

  const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <div className="p-8 bg-white text-gray-900 font-sans" id="print-content" dir={document.dir}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-4 rtl:flex-row-reverse">
        <div className="rtl:text-right">
          <h1 className="text-2xl font-bold text-indigo-600">{settings.companyName}</h1>
          <p className="text-sm text-gray-500 mt-1">{settings.address}</p>
          <p className="text-sm text-gray-500">{settings.email} | {settings.phone}</p>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-3xl font-bold text-gray-800 uppercase">{t('finance.glAccounts.print.title')}</h2>
          <p className="text-gray-500 mt-1">{t('finance.glAccounts.print.generatedOn')}: {new Date().toLocaleDateString()}</p>
        </div>
      </div>

      {/* Account Groups */}
      <div className="space-y-8">
        {accountTypes.map(type => {
          const typeAccounts = groupedAccounts[type] || [];
          if (typeAccounts.length === 0) return null;

          // Sort by code
          typeAccounts.sort((a, b) => a.code.localeCompare(b.code));

          return (
            <div key={type} className="break-inside-avoid">
              <h3 className="text-xl font-bold text-gray-800 border-b-2 border-indigo-100 pb-2 mb-4 uppercase tracking-wider rtl:text-right">
                {t(`finance.glAccounts.print.types.${type}`) || type}
              </h3>
              <table className="w-full text-sm text-left rtl:text-right">
                <thead>
                  <tr className="bg-gray-50 text-gray-500 uppercase text-xs">
                    <th className="py-2 px-3 w-24">{t('finance.glAccounts.print.code')}</th>
                    <th className="py-2 px-3">{t('finance.glAccounts.print.accountName')}</th>
                    <th className="py-2 px-3 w-1/3">{t('finance.glAccounts.print.description')}</th>
                    <th className="py-2 px-3 text-right rtl:text-left w-32">{t('finance.glAccounts.print.balance')}</th>
                    <th className="py-2 px-3 text-center w-24">{t('finance.glAccounts.print.status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {typeAccounts.map(account => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="py-2 px-3 font-mono text-gray-600">{account.code}</td>
                      <td className="py-2 px-3 font-medium text-gray-900">{account.name}</td>
                      <td className="py-2 px-3 text-gray-500 truncate max-w-xs">{account.description}</td>
                      <td className="py-2 px-3 text-right rtl:text-left font-medium">
                        {settings.currency} {account.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <span className={`inline-flex px-2 py-0.5 text-xs font-semibold rounded-full ${
                          account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {account.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <p>{t('finance.glAccounts.print.endOfReport')}</p>
      </div>
    </div>
  );
};
