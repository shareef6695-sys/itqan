import React, { useState } from 'react';
import { FileText, Search, Filter, MoreVertical, Calendar, Download, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { BillPrintTemplate } from '../../components/BillPrintTemplate';

export interface BillItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface Bill {
  id: string;
  number: string;
  vendor: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
  items?: BillItem[];
}

export const MOCK_BILLS: Bill[] = [
  {
    id: '1',
    number: 'BILL-2024-001',
    vendor: 'Steel Suppliers Co.',
    date: '2024-03-01',
    dueDate: '2024-03-31',
    amount: 5000.00,
    status: 'pending',
    items: [
      { id: '1', description: 'Raw Steel Sheets', quantity: 50, rate: 100, amount: 5000 }
    ]
  },
  {
    id: '2',
    number: 'BILL-2024-002',
    vendor: 'Office Depot',
    date: '2024-03-05',
    dueDate: '2024-03-15',
    amount: 262.50,
    status: 'paid',
    items: [
      { id: '1', description: 'Office Paper', quantity: 10, rate: 5, amount: 50 },
      { id: '2', description: 'Printer Ink', quantity: 4, rate: 50, amount: 200 }
    ]
  },
  {
    id: '3',
    number: 'BILL-2024-003',
    vendor: 'Power Utility Corp',
    date: '2024-02-15',
    dueDate: '2024-03-01',
    amount: 1500.00,
    status: 'overdue',
    items: [
      { id: '1', description: 'Electricity Bill - Feb', quantity: 1, rate: 1500, amount: 1500 }
    ]
  }
];

export const Bills: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useOrganization();
  const [bills] = useState<Bill[]>(MOCK_BILLS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const getStatusColor = (status: Bill['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filteredBills = bills.filter(bill => 
    bill.vendor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (bill: Bill) => {
    setSelectedBill(bill);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('purchase.bills.title')}</h1>
        <button 
          onClick={() => navigate('/purchase/bills/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FileText className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('purchase.bills.create')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
              placeholder={t('purchase.bills.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Filter className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('common.filter')}
            </button>
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('common.date')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purchase.bills.table.billDetails')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purchase.bills.table.vendor')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purchase.bills.table.date')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purchase.bills.table.amount')}</th>
                <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('purchase.bills.table.status')}</th>
                <th className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBills.map((bill) => (
                <tr key={bill.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-gray-400 mr-3 rtl:mr-0 rtl:ml-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{bill.number}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold mr-3 rtl:mr-0 rtl:ml-3">
                        {bill.vendor.charAt(0)}
                      </div>
                      <div className="text-sm font-medium text-gray-900">{bill.vendor}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{bill.date}</div>
                    <div className="text-xs text-gray-500">{t('common.due')}: {bill.dueDate}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {settings.currency} {bill.amount.toFixed(2)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(bill.status)}`}>
                      {t(`common.${bill.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                    <div className="flex items-center justify-end rtl:justify-start space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => handlePrint(bill)}
                        className="text-gray-400 hover:text-indigo-600"
                        title={t('common.print')}
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" title={t('common.download')}>
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedBill && (
          <PrintPreviewModal
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            title={t('purchase.bills.printTitle', { number: selectedBill.number })}
          >
            <BillPrintTemplate data={selectedBill} />
          </PrintPreviewModal>
        )}
      </div>
    </div>
  );
};
