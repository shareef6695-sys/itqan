import React, { useState } from 'react';
import { ShoppingCart, Search, Filter, MoreVertical, Calendar, User, Eye, Download, X, Printer } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { PurchaseOrderPrintTemplate } from '../../components/PurchaseOrderPrintTemplate';

export interface PurchaseOrderItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

interface PurchaseOrder {
  id: string;
  number: string;
  vendor: string;
  date: string;
  deliveryDate: string;
  amount: number;
  status: 'draft' | 'sent' | 'received' | 'cancelled';
  items?: PurchaseOrderItem[];
}

const MOCK_PURCHASE_ORDERS: PurchaseOrder[] = [];

export const PurchaseOrders: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useOrganization();
  const [orders] = useState<PurchaseOrder[]>(MOCK_PURCHASE_ORDERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  const getStatusColor = (status: PurchaseOrder['status']) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'received': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handlePrintPreview = (order: PurchaseOrder) => {
    setSelectedOrder(order);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('purchase.purchaseOrders.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('purchase.purchaseOrders.subtitle')}</p>
        </div>
        <button
          onClick={() => navigate('/purchase/orders/new')}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <ShoppingCart className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('purchase.purchaseOrders.create')}
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none rtl:right-0 rtl:left-auto rtl:pr-3 rtl:pl-0">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:pl-3 rtl:pr-10"
              placeholder={t('purchase.purchaseOrders.searchPlaceholder')}
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
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">
                  {t('purchase.purchaseOrders.table.number')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">
                  {t('purchase.purchaseOrders.table.vendor')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">
                  {t('purchase.purchaseOrders.table.date')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">
                  {t('purchase.purchaseOrders.table.deliveryDate')}
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-right">
                  {t('purchase.purchaseOrders.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider rtl:text-left">
                  {t('purchase.purchaseOrders.table.amount')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {order.number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center text-sm text-gray-900">
                      <User className="h-4 w-4 mr-2 text-gray-400 rtl:ml-0 rtl:mr-0 rtl:ml-2" />
                      {order.vendor}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-gray-400 rtl:ml-0 rtl:mr-0 rtl:ml-2" />
                      {order.date}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {order.deliveryDate}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                      {t(`common.${order.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900 rtl:text-left">
                    {settings.currency} {order.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-gray-400 hover:text-indigo-600"
                        title={t('common.viewDetails')}
                      >
                        <Eye className="h-5 w-5" />
                      </button>
                      <button 
                        onClick={() => handlePrintPreview(order)}
                        className="text-gray-400 hover:text-gray-600"
                        title={t('common.print')}
                      >
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
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setSelectedOrder(null)}></div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full rtl:text-right">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start justify-between">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full rtl:text-right rtl:mr-4 rtl:ml-0">
                    <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-title">
                      {t('purchase.purchaseOrders.details.title', { number: selectedOrder.number })}
                    </h3>
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('purchase.purchaseOrders.table.vendor')}:</span>
                        <span className="font-medium">{selectedOrder.vendor}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('purchase.purchaseOrders.table.date')}:</span>
                        <span>{selectedOrder.date}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('purchase.purchaseOrders.table.deliveryDate')}:</span>
                        <span>{selectedOrder.deliveryDate}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('purchase.purchaseOrders.table.amount')}:</span>
                        <span className="font-bold text-lg">{settings.currency} {selectedOrder.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-gray-500">{t('purchase.purchaseOrders.table.status')}:</span>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(selectedOrder.status)}`}>
                          {t(`common.${selectedOrder.status}`)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPrintModalOpen(true)}
                    className="absolute top-4 right-12 text-gray-400 hover:text-indigo-600 mr-2 rtl:right-auto rtl:left-12 rtl:ml-2 rtl:mr-0"
                    title={t('common.print')}
                  >
                    <Printer className="h-6 w-6" />
                  </button>
                  <button
                    onClick={() => setSelectedOrder(null)}
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 rtl:right-auto rtl:left-4"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse rtl:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm rtl:mr-3 rtl:ml-0"
                  onClick={() => setIsPrintModalOpen(true)}
                >
                  {t('common.printPreview')}
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm rtl:mr-3 rtl:ml-0"
                  onClick={() => setSelectedOrder(null)}
                >
                  {t('common.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {selectedOrder && (
        <PrintPreviewModal 
            isOpen={isPrintModalOpen}
            onClose={() => setIsPrintModalOpen(false)}
            title={t('purchase.purchaseOrders.printTitle', { number: selectedOrder.number })}
        >
            <PurchaseOrderPrintTemplate data={selectedOrder} />
        </PrintPreviewModal>
      )}
    </div>
  );
};
