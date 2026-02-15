import React, { useState } from 'react';
import { Truck, Search, Filter, MoreVertical, Calendar, User, Download, Send, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { DeliveryChallanPrintTemplate } from '../../components/DeliveryChallanPrintTemplate';

export interface DeliveryItem {
    description: string;
    quantity: number;
}

export interface DeliveryChallan {
  id: string;
  number: string;
  client: string;
  date: string;
  reference: string;
  status: 'delivered' | 'pending' | 'returned';
  itemCount: number;
  items?: DeliveryItem[];
}

const MOCK_CHALLANS: DeliveryChallan[] = [
  {
    id: '1',
    number: 'DC-2024-001',
    client: 'Acme Corp',
    date: '2024-03-01',
    reference: 'PO-12345',
    status: 'delivered',
    itemCount: 5,
    items: [
        { description: 'Industrial Steel Beam', quantity: 2 },
        { description: 'Concrete Mix 50kg', quantity: 3 }
    ]
  },
  {
    id: '2',
    number: 'DC-2024-002',
    client: 'TechStart Inc',
    date: '2024-03-05',
    reference: 'PO-67890',
    status: 'pending',
    itemCount: 12,
    items: [
        { description: 'Server Rack 42U', quantity: 2 },
        { description: 'Cat6 Cable Roll', quantity: 10 }
    ]
  },
  {
    id: '3',
    number: 'DC-2024-003',
    client: 'Global Trading',
    date: '2024-02-28',
    reference: 'PO-11223',
    status: 'returned',
    itemCount: 3,
    items: [
        { description: 'Defective Monitor', quantity: 3 }
    ]
  },
];

export const DeliveryChallans: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [challans] = useState<DeliveryChallan[]>(MOCK_CHALLANS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<DeliveryChallan | null>(null);

  const handlePrint = (challan: DeliveryChallan) => {
    setSelectedChallan(challan);
    setIsPrintModalOpen(true);
  };

  const getStatusColor = (status: DeliveryChallan['status']) => {
    switch (status) {
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'returned': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatStatus = (status: string) => {
    return t(`sales.deliveryChallans.status.${status}`);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales.deliveryChallans.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('sales.deliveryChallans.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/sales/delivery-challans/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Truck className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('sales.deliveryChallans.create')}
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
              className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
              placeholder={t('sales.deliveryChallans.searchPlaceholder')}
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
                  {t('sales.deliveryChallans.table.number')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.deliveryChallans.table.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.deliveryChallans.table.client')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.deliveryChallans.table.reference')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.deliveryChallans.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.deliveryChallans.table.items')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {challans.map((challan) => (
                <tr key={challan.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {challan.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {challan.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
                      {challan.client}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {challan.reference}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(challan.status)}`}>
                      {formatStatus(challan.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium text-gray-900">
                    {challan.itemCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                    <div className="flex items-center justify-end rtl:justify-start space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => handlePrint(challan)}
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

      {selectedChallan && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('sales.deliveryChallans.printTitle', { number: selectedChallan.number })}
        >
          <DeliveryChallanPrintTemplate data={selectedChallan} />
        </PrintPreviewModal>
      )}
    </div>
  );
};
