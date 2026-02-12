import React, { useState } from 'react';
import { Download, Printer, Calendar } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../../components/FinanceHeader';
import { INITIAL_ACCOUNTS } from '../../../data/financeData';
import type { GLAccount } from '../../../data/financeData';
import { useOrganization } from '../../../context/OrganizationContext';
import { PrintPreviewModal } from '../../../components/PrintPreviewModal';
import { ReportPrintTemplate, type ReportColumn } from '../../../components/ReportPrintTemplate';

export const TrialBalance: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [accounts] = useState<GLAccount[]>(INITIAL_ACCOUNTS);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Helper to determine debit/credit placement
  const getDebitCredit = (account: GLAccount) => {
    // Normal balances:
    // Asset, Expense: Debit
    // Liability, Equity, Revenue: Credit
    
    // However, in our simple model, balance is just a number. 
    // We'll assume positive numbers follow the normal balance rule for simplicity unless we had transaction history.
    
    let debit = 0;
    let credit = 0;

    if (account.type === 'Asset' || account.type === 'Expense') {
        debit = account.balance;
    } else {
        credit = account.balance;
    }
    
    return { debit, credit };
  };

  const trialBalanceData = accounts.map(acc => {
      const { debit, credit } = getDebitCredit(acc);
      return {
          ...acc,
          debit,
          credit
      };
  });

  const totalDebit = trialBalanceData.reduce((sum, acc) => sum + acc.debit, 0);
  const totalCredit = trialBalanceData.reduce((sum, acc) => sum + acc.credit, 0);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const columns: ReportColumn[] = [
      { header: t('finance.trialBalance.code'), accessor: 'code', width: '15%' },
      { header: t('finance.trialBalance.accountName'), accessor: 'name' },
      { header: t('finance.trialBalance.type'), accessor: 'type', width: '15%' },
      { 
          header: t('finance.trialBalance.debit'), 
          accessor: (row: any) => row.debit > 0 ? `${settings.currency} ${row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-', 
          align: 'right',
          width: '15%'
      },
      { 
          header: t('finance.trialBalance.credit'), 
          accessor: (row: any) => row.credit > 0 ? `${settings.currency} ${row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-', 
          align: 'right',
          width: '15%'
      },
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.trialBalance.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('finance.trialBalance.description')}</p>
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
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.trialBalance.code')}</th>
                        <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.trialBalance.accountName')}</th>
                        <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.trialBalance.type')}</th>
                        <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.trialBalance.debit')}</th>
                        <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.trialBalance.credit')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {trialBalanceData.map((account) => (
                        <tr key={account.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-left rtl:text-right">{account.code}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left rtl:text-right">{account.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">{t(`finance.glAccounts.print.types.${account.type}`)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left">
                                {account.debit > 0 ? `${settings.currency} ${account.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left">
                                {account.credit > 0 ? `${settings.currency} ${account.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                            </td>
                        </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-gray-50 font-bold">
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left uppercase">{t('finance.trialBalance.total')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left border-t-2 border-gray-300">
                            {settings.currency} {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left border-t-2 border-gray-300">
                            {settings.currency} {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.trialBalance.printTitle')}
      >
        <ReportPrintTemplate
          title={t('finance.trialBalance.title')}
          subtitle={t('finance.trialBalance.asOf', { date: endDate })}
          columns={columns}
          data={trialBalanceData}
          footer={
              <tr className="font-bold border-t-2 border-gray-800">
                  <td colSpan={3} className="py-2 px-2 text-right">{t('finance.trialBalance.total')}</td>
                  <td className="py-2 px-2 text-right">{settings.currency} {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-2 text-right">{settings.currency} {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
          }
        />
      </PrintPreviewModal>
    </div>
  );
};
