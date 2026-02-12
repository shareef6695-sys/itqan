import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, ArrowDownLeft, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../components/FinanceHeader';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { ReportPrintTemplate, type ReportColumn } from '../../components/ReportPrintTemplate';
import { useOrganization } from '../../context/OrganizationContext';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'Credit' | 'Debit';
  category: string;
  reference: string;
}

const initialTransactions: Transaction[] = [
  { id: '1', date: '2024-03-15', description: 'Invoice #INV-001 Payment', amount: 1250.00, type: 'Credit', category: 'sales', reference: 'INV-001' },
  { id: '2', date: '2024-03-14', description: 'Office Rent March', amount: 2000.00, type: 'Debit', category: 'rent', reference: 'EXP-042' },
  { id: '3', date: '2024-03-12', description: 'Client Payment - ACME Corp', amount: 4500.50, type: 'Credit', category: 'sales', reference: 'INV-002' },
  { id: '4', date: '2024-03-10', description: 'AWS Subscription', amount: 120.00, type: 'Debit', category: 'software', reference: 'EXP-041' },
];

export const Transactions: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions] = useState<Transaction[]>(initialTransactions);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filteredTransactions = transactions.filter(t => 
    t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.reference.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reportColumns: ReportColumn[] = [
    { header: t('finance.transactions.table.date'), accessor: 'date' },
    { header: t('finance.transactions.table.description'), accessor: 'description' },
    { header: t('finance.transactions.table.reference'), accessor: 'reference' },
    { 
      header: t('finance.transactions.table.category'), 
      accessor: (row) => t(`finance.transactions.categories.${row.category}`)
    },
    { 
      header: t('common.status'), 
      accessor: (row) => (
        <span className={row.type === 'Credit' ? 'text-green-600' : 'text-red-600'}>
          {row.type === 'Credit' ? t('common.income') : t('common.expense')}
        </span>
      )
    },
    { 
      header: t('finance.transactions.table.amount'), 
      accessor: (row) => `${settings.currency} ${row.amount.toFixed(2)}`,
      align: 'right'
    }
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('finance.transactions.title')}</h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
            <button 
              onClick={() => setIsPrintModalOpen(true)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                <Printer className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('finance.transactions.print')}
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                {t('finance.transactions.exportCsv')}
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
            placeholder={t('finance.transactions.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
          {t('common.filter')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.transactions.table.date')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.transactions.table.description')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.transactions.table.reference')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.transactions.table.category')}</th>
              <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.transactions.table.amount')}</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransactions.map((transaction) => (
              <tr key={transaction.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">{transaction.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left rtl:text-right">
                    <div className="flex items-center">
                        {transaction.type === 'Credit' ? (
                            <ArrowDownLeft className="h-4 w-4 text-green-500 mr-2 rtl:ml-2 rtl:mr-0" />
                        ) : (
                            <ArrowUpRight className="h-4 w-4 text-red-500 mr-2 rtl:ml-2 rtl:mr-0" />
                        )}
                        {transaction.description}
                    </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-left rtl:text-right">{transaction.reference}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">{t(`finance.transactions.categories.${transaction.category}`)}</td>
                <td className={`px-6 py-4 whitespace-nowrap text-sm font-bold text-right rtl:text-left ${
                    transaction.type === 'Credit' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {transaction.type === 'Credit' ? '+' : '-'}{settings.currency} {transaction.amount.toFixed(2)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.transactions.printTitle')}
      >
        <ReportPrintTemplate
          title={t('finance.transactions.title')}
          columns={reportColumns}
          data={filteredTransactions}
        />
      </PrintPreviewModal>
    </div>
  );
};
