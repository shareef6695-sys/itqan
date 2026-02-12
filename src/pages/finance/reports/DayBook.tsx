import React, { useState } from 'react';
import { Download, Printer, Calendar, Filter, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../../components/FinanceHeader';
import { PrintPreviewModal } from '../../../components/PrintPreviewModal';
import { ReportPrintTemplate, type ReportColumn } from '../../../components/ReportPrintTemplate';
import { useOrganization } from '../../../context/OrganizationContext';

interface DayBookEntry {
  id: string;
  date: string;
  voucherType: 'Payment' | 'Receipt' | 'Sales' | 'Purchase' | 'Journal' | 'Contra';
  voucherNo: string;
  description: string;
  accountName: string;
  debit: number;
  credit: number;
}

const MOCK_ENTRIES: DayBookEntry[] = [
  { 
    id: '1', 
    date: '2024-03-20', 
    voucherType: 'Sales', 
    voucherNo: 'INV-001', 
    description: 'Sales to ACME Corp', 
    accountName: 'Sales Account', 
    debit: 0, 
    credit: 1250.00 
  },
  { 
    id: '2', 
    date: '2024-03-20', 
    voucherType: 'Receipt', 
    voucherNo: 'RCT-001', 
    description: 'Payment received from ACME Corp', 
    accountName: 'Cash', 
    debit: 1250.00, 
    credit: 0 
  },
  { 
    id: '3', 
    date: '2024-03-20', 
    voucherType: 'Payment', 
    voucherNo: 'PYM-001', 
    description: 'Office Rent Payment', 
    accountName: 'Bank Transfer', 
    debit: 0, 
    credit: 2000.00 
  },
  { 
    id: '4', 
    date: '2024-03-20', 
    voucherType: 'Journal', 
    voucherNo: 'JNL-001', 
    description: 'Rent Expense Booking', 
    accountName: 'Rent Expense', 
    debit: 2000.00, 
    credit: 0 
  },
  { 
    id: '5', 
    date: '2024-03-20', 
    voucherType: 'Purchase', 
    voucherNo: 'PUR-001', 
    description: 'Purchase of Office Supplies', 
    accountName: 'Office Supplies', 
    debit: 150.00, 
    credit: 0 
  },
  { 
    id: '6', 
    date: '2024-03-20', 
    voucherType: 'Payment', 
    voucherNo: 'PYM-002', 
    description: 'Payment for Supplies', 
    accountName: 'Petty Cash', 
    debit: 0, 
    credit: 150.00 
  }
];

export const DayBook: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [selectedDate, setSelectedDate] = useState<string>('2024-03-20');
  const [searchTerm, setSearchTerm] = useState('');
  const [entries] = useState<DayBookEntry[]>(MOCK_ENTRIES);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const filteredEntries = entries.filter(entry => 
    entry.date === selectedDate &&
    (entry.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     entry.voucherNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
     entry.accountName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const totalDebit = filteredEntries.reduce((sum, entry) => sum + entry.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, entry) => sum + entry.credit, 0);

  const columns: ReportColumn[] = [
    { header: t('finance.dayBook.voucherNo'), accessor: 'voucherNo', width: '15%' },
    { header: t('finance.dayBook.type'), accessor: 'voucherType', width: '10%' },
    { header: t('finance.dayBook.description'), accessor: 'description' },
    { header: t('finance.dayBook.account'), accessor: 'accountName', width: '20%' },
    { 
      header: t('finance.dayBook.debit'), 
      accessor: (row: any) => row.debit > 0 ? `${settings.currency} ${row.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-', 
      align: 'right',
      width: '12%'
    },
    { 
      header: t('finance.dayBook.credit'), 
      accessor: (row: any) => row.credit > 0 ? `${settings.currency} ${row.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-', 
      align: 'right',
      width: '12%'
    },
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.dayBook.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('finance.dayBook.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white p-1 rounded border border-gray-300">
             <Calendar className="h-4 w-4 text-gray-400 ml-2 rtl:ml-0 rtl:mr-2" />
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border-none text-sm focus:ring-0 p-1 rtl:text-right"
            />
          </div>
          <button 
            onClick={() => setIsPrintModalOpen(true)}
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

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
            placeholder={t('finance.dayBook.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
          {t('finance.dayBook.filterType')}
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.dayBook.voucherNo')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.dayBook.type')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.dayBook.description')}</th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.dayBook.account')}</th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.dayBook.debit')}</th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.dayBook.credit')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.length > 0 ? (
                filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 text-left rtl:text-right">
                      {entry.voucherNo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                        ${entry.voucherType === 'Receipt' ? 'bg-green-100 text-green-800' : 
                          entry.voucherType === 'Payment' ? 'bg-red-100 text-red-800' : 
                          'bg-gray-100 text-gray-800'}`}>
                        {t(`finance.dayBook.voucherTypes.${entry.voucherType}`)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 text-left rtl:text-right">
                      {entry.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium text-left rtl:text-right">
                      {entry.accountName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-left">
                      {entry.debit > 0 ? `${settings.currency} ${entry.debit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-right rtl:text-left">
                      {entry.credit > 0 ? `${settings.currency} ${entry.credit.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500 text-sm">
                    {t('finance.dayBook.noTransactions')}
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="bg-gray-50">
              <tr>
                <td colSpan={4} className="px-6 py-3 text-right rtl:text-left text-sm font-medium text-gray-900">{t('common.total')}</td>
                <td className="px-6 py-3 text-right rtl:text-left text-sm font-medium text-gray-900">{settings.currency} {totalDebit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                <td className="px-6 py-3 text-right rtl:text-left text-sm font-medium text-gray-900">{settings.currency} {totalCredit.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.dayBook.title')}
      >
        <ReportPrintTemplate
          title={t('finance.dayBook.title')}
          subtitle={t('finance.trialBalance.asOf', { date: selectedDate })}
          columns={columns}
          data={filteredEntries}
        />
      </PrintPreviewModal>
    </div>
  );
};
