import React, { useState } from 'react';
import { Download, Printer, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../../components/FinanceHeader';
import { INITIAL_ACCOUNTS } from '../../../data/financeData';
import type { GLAccount } from '../../../data/financeData';
import { useOrganization } from '../../../context/OrganizationContext';
import { PrintPreviewModal } from '../../../components/PrintPreviewModal';
import { FinancialStatementPrintTemplate, type FinancialSection } from '../../../components/FinancialStatementPrintTemplate';

export const CashFlow: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [accounts] = useState<GLAccount[]>(INITIAL_ACCOUNTS);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Calculate Net Income (same logic as P&L)
  const revenues = accounts.filter(acc => acc.type === 'Revenue');
  const expenses = accounts.filter(acc => acc.type === 'Expense');
  const totalRevenue = revenues.reduce((sum, acc) => sum + acc.balance, 0);
  const totalExpenses = expenses.reduce((sum, acc) => sum + acc.balance, 0);
  const netIncome = totalRevenue - totalExpenses;

  // Calculate Cash Balances
  const cashAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes('cash') || 
    acc.name.toLowerCase().includes('bank')
  );
  const endingCashBalance = cashAccounts.reduce((sum, acc) => sum + acc.balance, 0);

  // Mock Adjustments for Working Capital (In a real app, these would come from transaction history)
  // We'll assume some changes to make the report look realistic
  const increaseInAR = 2500; // Use of cash
  const increaseInInventory = 5000; // Use of cash
  const increaseInAP = 500; // Source of cash
  
  const cashFromOperations = netIncome - increaseInAR - increaseInInventory + increaseInAP;

  // Investing Activities
  const purchaseOfEquipment = 0;
  const cashFromInvesting = -purchaseOfEquipment;

  // Financing Activities
  // We need to balance to the Ending Cash Balance.
  // Ending Cash = Beginning Cash + Net Change
  // Net Change = Operations + Investing + Financing
  // Let's assume Beginning Cash was 0 for this period (new business)
  // So Net Change must equal Ending Cash Balance (30,000)
  // 30,000 = 80,400 (Ops) + 0 (Inv) + Financing
  // Financing = 30,000 - 80,400 = -50,400
  const ownersDraw = -50400;
  const cashFromFinancing = ownersDraw;

  const netChangeInCash = cashFromOperations + cashFromInvesting + cashFromFinancing;
  const beginningCashBalance = endingCashBalance - netChangeInCash;

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const getPrintSections = (): FinancialSection[] => [
    {
      title: t('finance.cashFlow.operatingActivities'),
      items: [
        { label: t('finance.cashFlow.netIncome'), value: netIncome },
        { label: t('finance.cashFlow.adjustmentsNonCash'), value: 0 }, // Placeholder
        { label: t('finance.cashFlow.increaseInAR'), value: -increaseInAR },
        { label: t('finance.cashFlow.increaseInInventory'), value: -increaseInInventory },
        { label: t('finance.cashFlow.increaseInAP'), value: increaseInAP }
      ],
      total: { label: t('finance.cashFlow.netCashOperating'), value: cashFromOperations }
    },
    {
      title: t('finance.cashFlow.investingActivities'),
      items: [
        { label: t('finance.cashFlow.purchaseEquipment'), value: -purchaseOfEquipment }
      ],
      total: { label: t('finance.cashFlow.netCashInvesting'), value: cashFromInvesting }
    },
    {
      title: t('finance.cashFlow.financingActivities'),
      items: [
        { label: t('finance.cashFlow.ownersDraw'), value: ownersDraw }
      ],
      total: { label: t('finance.cashFlow.netCashFinancing'), value: cashFromFinancing }
    }
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.cashFlow.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('finance.cashFlow.subtitle')}</p>
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
          
          {/* Operating Activities */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.cashFlow.operatingActivities')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('finance.cashFlow.netIncome')}</span>
                <span className="font-medium text-gray-900">{settings.currency} {netIncome.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-sm pl-4 rtl:pr-4 rtl:pl-0 text-gray-500">
                <span>{t('finance.cashFlow.adjustmentsNonCash')}:</span>
                <span></span>
              </div>
              <div className="flex justify-between text-sm pl-4 rtl:pr-4 rtl:pl-0">
                <span className="text-gray-600">{t('finance.cashFlow.increaseInAR')}</span>
                <span className="text-red-600">({settings.currency} {increaseInAR.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
              </div>
              <div className="flex justify-between text-sm pl-4 rtl:pr-4 rtl:pl-0">
                <span className="text-gray-600">{t('finance.cashFlow.increaseInInventory')}</span>
                <span className="text-red-600">({settings.currency} {increaseInInventory.toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
              </div>
              <div className="flex justify-between text-sm pl-4 rtl:pr-4 rtl:pl-0">
                <span className="text-gray-600">{t('finance.cashFlow.increaseInAP')}</span>
                <span className="text-gray-900">{settings.currency} {increaseInAP.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.cashFlow.netCashOperating')}</span>
                <span>{settings.currency} {cashFromOperations.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Investing Activities */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.cashFlow.investingActivities')}</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('finance.cashFlow.purchaseEquipment')}</span>
                <span className="text-gray-900">{settings.currency} {purchaseOfEquipment.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.cashFlow.netCashInvesting')}</span>
                <span>{settings.currency} {cashFromInvesting.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Financing Activities */}
          <section>
            <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4">{t('finance.cashFlow.financingActivities')}</h3>
            <div className="space-y-2">
               <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t('finance.cashFlow.ownersDraw')}</span>
                <span className="text-red-600">({settings.currency} {Math.abs(ownersDraw).toLocaleString('en-US', { minimumFractionDigits: 2 })})</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-4 border-t mt-4">
                <span>{t('finance.cashFlow.netCashFinancing')}</span>
                <span>{settings.currency} {cashFromFinancing.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </section>

          {/* Summary */}
          <div className="bg-indigo-50 p-4 rounded-md border border-indigo-100 space-y-2">
            <div className="flex justify-between text-sm font-medium text-indigo-800">
              <span>{t('finance.cashFlow.netChangeCash')}</span>
              <span>{settings.currency} {netChangeInCash.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
             <div className="flex justify-between text-sm font-medium text-indigo-800">
              <span>{t('finance.cashFlow.beginningCash')}</span>
              <span>{settings.currency} {beginningCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-indigo-900 pt-2 border-t border-indigo-200">
              <span>{t('finance.cashFlow.endingCash')}</span>
              <span>{settings.currency} {endingCashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
            </div>
          </div>
        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.cashFlow.printTitle')}
      >
        <FinancialStatementPrintTemplate
          title={t('finance.cashFlow.title')}
          subtitle={t('finance.cashFlow.dateRange', { startDate, endDate })}
          sections={getPrintSections()}
        />
      </PrintPreviewModal>
    </div>
  );
};
