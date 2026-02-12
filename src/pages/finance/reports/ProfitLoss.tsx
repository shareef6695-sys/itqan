import React, { useState } from 'react';
import { Download, Printer, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../../components/FinanceHeader';
import { INITIAL_ACCOUNTS } from '../../../data/financeData';
import type { GLAccount } from '../../../data/financeData';
import { useOrganization } from '../../../context/OrganizationContext';
import { PrintPreviewModal } from '../../../components/PrintPreviewModal';
import { FinancialStatementPrintTemplate, type FinancialSection } from '../../../components/FinancialStatementPrintTemplate';

export const ProfitLoss: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [accounts] = useState<GLAccount[]>(INITIAL_ACCOUNTS);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const revenues = accounts.filter(acc => acc.type === 'Revenue');
  const expenses = accounts.filter(acc => acc.type === 'Expense');

  // Separate COGS from other expenses if possible, otherwise treat all as expenses
  const cogsAccounts = expenses.filter(acc => acc.name.toLowerCase().includes('cost of goods sold'));
  const operatingExpenses = expenses.filter(acc => !acc.name.toLowerCase().includes('cost of goods sold'));

  const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
  const totalCOGS = cogsAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const grossProfit = totalRevenue - totalCOGS;
  const totalOperatingExpenses = operatingExpenses.reduce((sum, acc) => sum + acc.balance, 0);
  const netIncome = grossProfit - totalOperatingExpenses;

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const getPrintSections = (): FinancialSection[] => [
    {
      title: t('finance.profitLoss.revenue'),
      items: revenues.map(acc => ({ label: acc.name, value: acc.balance, code: acc.code })),
      total: { label: t('finance.profitLoss.totalRevenue'), value: totalRevenue }
    },
    {
      title: t('finance.profitLoss.cogs'),
      items: cogsAccounts.map(acc => ({ label: acc.name, value: acc.balance, code: acc.code })),
      total: { label: t('finance.profitLoss.totalCOGS'), value: totalCOGS }
    },
    {
      title: t('finance.profitLoss.operatingExpenses'),
      items: operatingExpenses.map(acc => ({ label: acc.name, value: acc.balance, code: acc.code })),
      total: { label: t('finance.profitLoss.totalOperatingExpenses'), value: totalOperatingExpenses }
    }
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.profitLoss.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('finance.profitLoss.incomeStatement')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white p-1 rounded border border-gray-300">
             <Calendar className="h-4 w-4 text-gray-400 ml-2 rtl:ml-0 rtl:mr-2" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-none text-sm focus:ring-0 p-1 rtl:text-right"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-none text-sm focus:ring-0 p-1 rtl:text-right"
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
          
          {/* Revenue Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.profitLoss.revenue')}</h3>
            <div className="space-y-2">
              {revenues.map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.code} - {account.name}</span>
                  <span className="font-medium text-gray-900">{settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.profitLoss.totalRevenue')}</span>
                <span>{settings.currency} {totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* COGS Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.profitLoss.cogs')}</h3>
            <div className="space-y-2">
              {cogsAccounts.map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.code} - {account.name}</span>
                  <span className="font-medium text-gray-900">{settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
               <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.profitLoss.totalCOGS')}</span>
                <span>{settings.currency} {totalCOGS.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Gross Profit */}
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between text-lg font-bold text-indigo-700">
              <span>{t('finance.profitLoss.grossProfit')}</span>
              <span>{settings.currency} {grossProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

          {/* Operating Expenses Section */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.profitLoss.operatingExpenses')}</h3>
            <div className="space-y-2">
              {operatingExpenses.map(account => (
                <div key={account.id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{account.code} - {account.name}</span>
                  <span className="font-medium text-gray-900">{settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.profitLoss.totalOperatingExpenses')}</span>
                <span>{settings.currency} {totalOperatingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Net Income */}
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100">
            <div className="flex justify-between text-xl font-bold text-indigo-900">
              <span>{t('finance.profitLoss.netIncome')}</span>
              <span>{settings.currency} {netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>

        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.profitLoss.printTitle')}
      >
        <FinancialStatementPrintTemplate 
          title={t('finance.profitLoss.title')}
          dateRange={t('finance.profitLoss.dateRange', { startDate, endDate })}
          sections={getPrintSections()}
          footer={
            <div className="flex justify-between text-xl font-bold text-indigo-900">
              <span>{t('finance.profitLoss.netIncome')}</span>
              <span>{settings.currency} {netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          }
        />
      </PrintPreviewModal>
    </div>
  );
};
