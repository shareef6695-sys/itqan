import React, { useState } from 'react';
import { Plus, Search, Filter, MoreVertical, Calendar, User, Download, Send, Eye, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { QRCodeCanvas } from 'qrcode.react';
import { useOrganization } from '../../context/OrganizationContext';
import { generateZatcaTLV } from '../../utils/zatca';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { InvoicePrintTemplate } from '../../components/InvoicePrintTemplate';

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue' | 'draft';
  items?: InvoiceItem[];
}

export const MOCK_INVOICES: Invoice[] = [
  {
    id: '1',
    number: 'INV-2024-001',
    client: 'Acme Corp',
    date: '2024-03-01',
    dueDate: '2024-03-15',
    amount: 1250.00,
    status: 'paid',
    items: [
        { id: '1', description: 'Consulting Services', quantity: 10, rate: 100 },
        { id: '2', description: 'Software License', quantity: 1, rate: 250 }
    ]
  },
  {
    id: '2',
    number: 'INV-2024-002',
    client: 'TechStart Inc',
    date: '2024-03-05',
    dueDate: '2024-03-20',
    amount: 3400.00,
    status: 'pending',
    items: [
        { id: '1', description: 'Web Development', quantity: 40, rate: 85 }
    ]
  },
  {
    id: '3',
    number: 'INV-2024-003',
    client: 'Global Trading',
    date: '2024-02-28',
    dueDate: '2024-03-14',
    amount: 850.00,
    status: 'overdue',
    items: [
        { id: '1', description: 'Maintenance', quantity: 5, rate: 170 }
    ]
  }
];

export const Invoices: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [invoices] = useState<Invoice[]>(MOCK_INVOICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const getStatusColor = (status: Invoice['status']) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrintPreview = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales.invoices.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('sales.invoices.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/sales/invoices/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('sales.invoices.create')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 rtl:right-0 rtl:left-auto pl-3 rtl:pr-3 rtl:pl-0 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 rtl:pr-10 rtl:pl-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
              placeholder={t('sales.invoices.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Filter className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('common.filter')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.invoices.table.invoiceNumber')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.invoices.table.client')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.invoices.table.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.invoices.table.dueDate')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.invoices.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.invoices.table.amount')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {invoice.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {invoice.client}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {invoice.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {invoice.dueDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status)}`}>
                      {t(`common.${invoice.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium text-gray-900">
                    {settings.currency} {invoice.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                    <div className="flex items-center justify-end rtl:justify-start space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => setSelectedInvoice(invoice)}
                        className="text-gray-400 hover:text-indigo-600"
                        title={t('common.viewDetails')}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handlePrintPreview(invoice)}
                        className="text-gray-400 hover:text-gray-600"
                        title={t('common.download')}
                      >
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" title={t('common.send')}>
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

      {selectedInvoice && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedInvoice(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left rtl:text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start justify-between">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 rtl:sm:mr-4 rtl:sm:ml-0 sm:text-left rtl:sm:text-right w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {t('sales.invoices.detailsTitle', { number: selectedInvoice.number })}
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('sales.clientName')}:</span>
                        <span className="font-medium">{selectedInvoice.client}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('common.date')}:</span>
                        <span>{selectedInvoice.date}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('sales.amount')}:</span>
                        <span className="font-bold text-lg">{settings.currency} {selectedInvoice.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('common.status')}:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedInvoice.status)}`}>
                          {t(`common.${selectedInvoice.status}`)}
                        </span>
                      </div>
                      
                      {settings.zatca?.enabled && (
                        <div className="mt-6 flex flex-col items-center p-4 bg-gray-50 rounded-lg border border-gray-200">
                          <h4 className="text-sm font-medium text-gray-700 mb-3">{t('sales.invoices.zatcaQr')}</h4>
                          <div className="bg-white p-2 rounded shadow-sm">
                            <QRCodeCanvas
                              value={generateZatcaTLV({
                                sellerName: settings.companyName,
                                vatRegistrationNumber: settings.vatNumber,
                                timestamp: `${selectedInvoice.date}T12:00:00Z`,
                                invoiceTotal: selectedInvoice.amount.toString(),
                                vatTotal: (selectedInvoice.amount - (selectedInvoice.amount / (1 + settings.vatRate / 100))).toFixed(2)
                              })}
                              size={180}
                              level={"M"}
                            />
                          </div>
                          <p className="mt-2 text-xs text-gray-500 text-center max-w-xs">
                            {t('sales.invoices.zatcaDescription')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="absolute top-4 right-12 rtl:right-auto rtl:left-12 text-gray-400 hover:text-indigo-600 mr-2 rtl:ml-2 rtl:mr-0"
                    title={t('common.print')}
                  >
                    <Download className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedInvoice(null)}
                    className="absolute top-4 right-4 rtl:right-auto rtl:left-4 text-gray-400 hover:text-gray-500"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rtl:sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 rtl:sm:mr-3 rtl:sm:ml-0 sm:w-auto sm:text-sm"
                  onClick={() => setIsPrintModalOpen(true)}
                >
                  {t('common.printPreview')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 rtl:sm:mr-3 rtl:sm:ml-0 sm:w-auto sm:text-sm"
                  onClick={() => setSelectedInvoice(null)}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedInvoice && (
        <PrintPreviewModal 
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            title={t('sales.invoices.printTitle', { number: selectedInvoice.number })}
        >
            <InvoicePrintTemplate data={selectedInvoice} />
        </PrintPreviewModal>
      )}
    </div>
  );
};
