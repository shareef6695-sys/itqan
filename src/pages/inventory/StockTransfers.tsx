import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowRight, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { StockTransferPrintTemplate } from '../../components/StockTransferPrintTemplate';

export interface StockTransferItem {
  productId: string;
  productName: string;
  quantity: number;
}

export interface StockTransfer {
  id: string;
  reference: string;
  date: string;
  fromWarehouseId: string;
  fromWarehouseName: string;
  toWarehouseId: string;
  toWarehouseName: string;
  status: 'draft' | 'completed' | 'in_transit';
  itemsCount: number;
  items?: StockTransferItem[];
}

const MOCK_TRANSFERS: StockTransfer[] = [
  {
    id: '1',
    reference: 'TRF-001',
    date: '2024-03-25',
    fromWarehouseId: '1',
    fromWarehouseName: 'Main Warehouse',
    toWarehouseId: '2',
    toWarehouseName: 'Site A Warehouse',
    status: 'completed',
    itemsCount: 5,
    items: [
        { productId: '1', productName: 'Steel Beam I-200', quantity: 2 },
        { productId: '2', productName: 'Cement Bag 50kg', quantity: 3 }
    ]
  },
  {
    id: '2',
    reference: 'TRF-002',
    date: '2024-03-28',
    fromWarehouseId: '1',
    fromWarehouseName: 'Main Warehouse',
    toWarehouseId: '3',
    toWarehouseName: 'Site B Warehouse',
    status: 'in_transit',
    itemsCount: 12,
    items: [
        { productId: '3', productName: 'Rebar 12mm', quantity: 10 },
        { productId: '4', productName: 'Sand Ton', quantity: 2 }
    ]
  }
];

export const StockTransfers: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [transfers] = useState<StockTransfer[]>(MOCK_TRANSFERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<StockTransfer | null>(null);

  const filteredTransfers = transfers.filter(transfer =>
    transfer.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.fromWarehouseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transfer.toWarehouseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = (transfer: StockTransfer) => {
    setSelectedTransfer(transfer);
    setIsPrintModalOpen(true);
  };

  const getStatusColor = (status: StockTransfer['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'in_transit': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory.stockTransfers.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('inventory.stockTransfers.subtitle')}</p>
        </div>
        <button 
          onClick={() => navigate('/inventory/transfers/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('inventory.stockTransfers.create')}
        </button>
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
            placeholder={t('inventory.stockTransfers.searchPlaceholder')}
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
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockTransfers.table.reference')}
              </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockTransfers.table.date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockTransfers.table.from')}
              </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockTransfers.table.to')}
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockTransfers.table.items')}
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockTransfers.table.status')}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredTransfers.map((transfer) => (
              <tr key={transfer.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                  {transfer.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transfer.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {transfer.fromWarehouseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center rtl:flex-row-reverse">
                    <ArrowRight className="h-4 w-4 text-gray-400 mr-2 rtl:ml-2 rtl:mr-0 rtl:rotate-180" />
                    {transfer.toWarehouseName}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                  {transfer.itemsCount}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(transfer.status)}`}>
                    {t(`inventory.stockTransfers.status.${transfer.status}`).toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                  <button 
                    onClick={() => handlePrint(transfer)}
                    className="text-indigo-600 hover:text-indigo-900 flex items-center justify-end w-full rtl:flex-row-reverse"
                  >
                    <Printer className="h-4 w-4 mr-1 rtl:ml-1 rtl:mr-0" />
                    {t('common.print')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedTransfer && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('inventory.stockTransfers.printTitle', { reference: selectedTransfer.reference })}
        >
          <StockTransferPrintTemplate data={selectedTransfer} />
        </PrintPreviewModal>
      )}
    </div>
  );
};
