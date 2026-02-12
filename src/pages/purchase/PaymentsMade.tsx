import React, { useState } from 'react';
import { CreditCard, Search, Filter, Printer, Download, Send, MoreVertical, Calendar, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { PaymentVoucherPrintTemplate } from '../../components/PaymentVoucherPrintTemplate';

export interface PaymentMade {
  id: string;
  number: string;
  date: string;
  vendor: string;
  amount: number;
  paymentMode: string;
  reference: string;
  status: 'paid' | 'pending' | 'failed';
}

const MOCK_PAYMENTS: PaymentMade[] = [
  {
    id: '1',
    number: 'PV-2024-001',
    date: '2024-03-10',
    vendor: 'Steel Suppliers Co',
    amount: 5000.00,
    paymentMode: 'Bank Transfer',
    reference: 'TRX-998877',
    status: 'paid'
  },
  {
    id: '2',
    number: 'PV-2024-002',
    date: '2024-03-12',
    vendor: 'Industrial Tools Ltd',
    amount: 1200.50,
    paymentMode: 'Cheque',
    reference: 'CHQ-100200',
    status: 'paid'
  }
];

export const PaymentsMade: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [payments] = useState<PaymentMade[]>(MOCK_PAYMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<PaymentMade | null>(null);

  const getStatusColor = (status: PaymentMade['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'failed': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrint = (payment: PaymentMade) => {
    setSelectedPayment(payment);
    setIsPrintModalOpen(true);
  };

  const filteredPayments = payments.filter(payment =>
    payment.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.vendor.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('purchase.paymentsMade.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('purchase.paymentsMade.subtitle')}</p>
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <CreditCard className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('purchase.paymentsMade.create')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-lg">
            <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 rtl:pr-10 rtl:pl-3 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
              placeholder={t('purchase.paymentsMade.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center space-x-2 rtl:space-x-reverse">
            <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Filter className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('common.filter')}
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('purchase.paymentsMade.table.voucher')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('purchase.paymentsMade.table.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('purchase.paymentsMade.table.vendor')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('purchase.paymentsMade.table.mode')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('purchase.paymentsMade.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('purchase.paymentsMade.table.amount')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {payment.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {payment.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {payment.vendor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {t(`common.paymentModes.${payment.paymentMode}`) || payment.paymentMode}
                    </div>
                    <div className="text-xs text-gray-500 ml-6 rtl:mr-6 rtl:ml-0">
                      {t('purchase.paymentsMade.table.ref')}: {payment.reference}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(payment.status)}`}>
                      {t(`common.${payment.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium text-gray-900">
                    {settings.currency} {payment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                    <div className="flex items-center justify-end rtl:justify-start space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => handlePrint(payment)}
                        className="text-gray-400 hover:text-indigo-600"
                        title={t('common.print')}
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600">
                        <Send className="h-5 w-5" />
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
      </div>

      {selectedPayment && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('purchase.paymentsMade.printTitle', { number: selectedPayment.number })}
        >
          <PaymentVoucherPrintTemplate data={selectedPayment} />
        </PrintPreviewModal>
      )}
    </div>
  );
};
