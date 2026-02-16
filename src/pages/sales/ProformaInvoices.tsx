import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Search, Filter, MoreVertical, Calendar, User, Download, Send, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useOrganization } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { ProformaInvoicePrintTemplate } from '../../components/ProformaInvoicePrintTemplate';

interface PrintItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  amount: number;
}

interface ProformaInvoice {
  id: string;
  number: string;
  client: string;
  date: string;
  expiryDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'accepted' | 'expired' | 'converted';
  items: PrintItem[];
  subtotal: number;
  tax: number;
}

const MOCK_PROFORMAS: ProformaInvoice[] = [];

export const ProformaInvoices: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [proformas] = useState<ProformaInvoice[]>(MOCK_PROFORMAS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedProforma, setSelectedProforma] = useState<ProformaInvoice | null>(null);

  const filteredProformas = proformas.filter(proforma => 
    proforma.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
    proforma.number.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (proforma: ProformaInvoice) => {
    setSelectedProforma(proforma);
    setIsPrintModalOpen(true);
  };

  const getStatusColor = (status: ProformaInvoice['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'expired': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return t(`sales.proformaInvoices.status.${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales.proformaInvoices.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('sales.proformaInvoices.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/sales/proforma-invoices/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <FileText className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('sales.proformaInvoices.create')}
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
              placeholder={t('sales.proformaInvoices.searchPlaceholder')}
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
                  {t('sales.proformaInvoices.table.number')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.proformaInvoices.table.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.proformaInvoices.table.client')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.proformaInvoices.table.expiryDate')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.proformaInvoices.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.proformaInvoices.table.amount')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProformas.map((proforma) => (
                <tr key={proforma.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {proforma.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {proforma.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {proforma.client}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {proforma.expiryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(proforma.status)}`}>
                      {formatStatus(proforma.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium text-gray-900">
                    {settings.currency} {proforma.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => handlePrint(proforma)}
                        className="text-gray-400 hover:text-indigo-600"
                        title={t('common.print')}
                      >
                        <Printer className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" title={t('common.download')}>
                        <Download className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" title={t('common.send')}>
                        <Send className="h-5 w-5" />
                      </button>
                      <button className="text-gray-400 hover:text-gray-600" title={t('common.actions')}>
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

      {selectedProforma && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('sales.proformaInvoices.printTitle', { number: selectedProforma.number })}
        >
          <ProformaInvoicePrintTemplate data={selectedProforma} />
        </PrintPreviewModal>
      )}
    </div>
  );
};
