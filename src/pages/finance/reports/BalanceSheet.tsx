import React, { useState } from 'react';
import { Download, Printer, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../../components/FinanceHeader';
import { INITIAL_ACCOUNTS } from '../../../data/financeData';
import type { GLAccount } from '../../../data/financeData';
import { useOrganization } from '../../../context/OrganizationContext';
import { PrintPreviewModal } from '../../../components/PrintPreviewModal';
import { FinancialStatementPrintTemplate, type FinancialSection } from '../../../components/FinancialStatementPrintTemplate';

export const BalanceSheet: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  // In a real app, we would fetch accounts based on the selected date range
  const [accounts] = useState<GLAccount[]>(INITIAL_ACCOUNTS);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const assets = accounts.filter(acc => acc.type === 'Asset');
  const liabilities = accounts.filter(acc => acc.type === 'Liability');
  const equity = accounts.filter(acc => acc.type === 'Equity');

  const totalAssets = assets.reduce((sum, acc) => sum + acc.balance, 0);
  const totalLiabilities = liabilities.reduce((sum, acc) => sum + acc.balance, 0);
  const totalEquity = equity.reduce((sum, acc) => sum + acc.balance, 0);

  // Check if it balances (in a real system, this should always match)
  // Assets = Liabilities + Equity
  // Note: Retained Earnings usually includes Net Income from P&L which makes it balance.
  // For this mock, we might show a discrepancy if the mock data isn't perfectly balanced.

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const getPrintSections = (): FinancialSection[] => [
    {
      title: t('finance.balanceSheet.assets'),
      items: assets.map(acc => ({ label: acc.name, value: acc.balance, code: acc.code })),
      total: { label: t('finance.balanceSheet.totalAssets'), value: totalAssets }
    },
    {
      title: t('finance.balanceSheet.liabilities'),
      items: liabilities.map(acc => ({ label: acc.name, value: acc.balance, code: acc.code })),
      total: { label: t('finance.balanceSheet.totalLiabilities'), value: totalLiabilities }
    },
    {
      title: t('finance.balanceSheet.equity'),
      items: equity.map(acc => ({ label: acc.name, value: acc.balance, code: acc.code })),
      total: { label: t('finance.balanceSheet.totalEquity'), value: totalEquity }
    }
  ];

  const totalLiabilitiesEquity = totalLiabilities + totalEquity;

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.balanceSheet.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('finance.balanceSheet.asOf', { date })}</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
             <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
                <Calendar className="h-4 w-4 text-gray-400" />
              </div>
            <input 
              type="date" 
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-10 rtl:pl-3 rtl:pr-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('common.print')}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('common.export')}
          </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 space-y-8">
          
          {/* Assets Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.balanceSheet.assets')}</h3>
            <div className="space-y-2">
              {assets.map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.code} - {account.name}</span>
                  <span className="font-medium text-gray-900">{settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.balanceSheet.totalAssets')}</span>
                <span>{settings.currency} {totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Liabilities Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.balanceSheet.liabilities')}</h3>
            <div className="space-y-2">
              {liabilities.map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.code} - {account.name}</span>
                  <span className="font-medium text-gray-900">{settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.balanceSheet.totalLiabilities')}</span>
                <span>{settings.currency} {totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Equity Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.balanceSheet.equity')}</h3>
            <div className="space-y-2">
              {equity.map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.code} - {account.name}</span>
                  <span className="font-medium text-gray-900">{settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.balanceSheet.totalEquity')}</span>
                <span>{settings.currency} {totalEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Total Liabilities & Equity */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{t('finance.balanceSheet.totalLiabilitiesEquity')}</span>
              <span>{settings.currency} {(totalLiabilities + totalEquity).toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.balanceSheet.printTitle')}
      >
        <FinancialStatementPrintTemplate 
          title={t('finance.balanceSheet.title')}
          dateRange={t('finance.balanceSheet.asOf', { date })}
          sections={getPrintSections()}
          footer={
            <div className="flex justify-between text-lg font-bold text-gray-900">
              <span>{t('finance.balanceSheet.totalLiabilitiesEquity')}</span>
              <span>{settings.currency} {totalLiabilitiesEquity.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          }
        />
      </PrintPreviewModal>
    </div>
  );
};
