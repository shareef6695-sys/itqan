import React, { useState } from 'react';
import { Plus, Trash2, Save, Truck, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MOCK_SALES_ORDERS } from './SalesOrders';
import { MOCK_PRODUCTS } from '../inventory/Products';
import { useOrganization } from '../../context/OrganizationContext';

interface ChallanItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unit: string;
}

export const CreateDeliveryChallan: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [items, setItems] = useState<ChallanItem[]>([
    { id: '1', description: '', quantity: 1, unit: 'pcs' },
  ]);
  const [formData, setFormData] = useState({
    salesOrderId: '',
    clientName: '',
    warehouseId: '',
    challanDate: new Date().toISOString().split('T')[0],
    reference: '',
    vehicleNumber: '',
    driverName: '',
    notes: '',
  });

  React.useEffect(() => {
    const defaultWarehouse = settings.warehouses?.find(w => w.isDefault) || settings.warehouses?.[0];
    if (defaultWarehouse && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: defaultWarehouse.id }));
    }
  }, [settings.warehouses]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'salesOrderId') {
      const selectedOrder = MOCK_SALES_ORDERS.find(order => order.id === value);
      if (selectedOrder) {
        setFormData(prev => ({
          ...prev,
          salesOrderId: value,
          clientName: selectedOrder.client,
          reference: selectedOrder.number // Use Sales Order Number as reference
        }));
        setItems(selectedOrder.items.map(item => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unit: item.unit
        })));
      } else {
        // Reset if no order selected
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, unit: 'pcs' }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ChallanItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Delivery Challan Data:', { ...formData, items });
    alert(t('sales.success.challanCreated'));
    navigate('/sales/delivery-challans');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/sales/delivery-challans')}
            className="mr-4 rtl:ml-4 rtl:mr-0 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6 rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales.deliveryChallans.createTitle')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Challan Details Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('sales.deliveryChallans.selectSalesOrder')}</label>
            <select
              name="salesOrderId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.salesOrderId}
              onChange={handleChange}
            >
              <option value="">{t('sales.deliveryChallans.selectSalesOrderPlaceholder')}</option>
              {MOCK_SALES_ORDERS.map(order => (
                <option key={order.id} value={order.id}>
                  {order.number} - {order.client} ({order.date})
                </option>
              ))}
            </select>
            <div className="mt-1 text-xs text-gray-500">{t('sales.deliveryChallans.salesOrderHelpText')}</div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.sourceWarehouse')}</label>
            <select
              name="warehouseId"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.warehouseId}
              onChange={handleChange}
              required
            >
              <option value="">{t('sales.selectWarehouse')}</option>
              {settings.warehouses?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.clientName')}</label>
            <input
              type="text"
              name="clientName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.enterClientName')}
              value={formData.clientName}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.deliveryChallans.challanDate')}</label>
            <input
              type="date"
              name="challanDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.challanDate}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.deliveryChallans.reference')}</label>
            <input
              type="text"
              name="reference"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.deliveryChallans.referencePlaceholder')}
              value={formData.reference}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.deliveryChallans.vehicleNumber')}</label>
            <input
              type="text"
              name="vehicleNumber"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.deliveryChallans.vehicleNumberPlaceholder')}
              value={formData.vehicleNumber}
              onChange={handleChange}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.deliveryChallans.driverName')}</label>
            <input
              type="text"
              name="driverName"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.deliveryChallans.driverNamePlaceholder')}
              value={formData.driverName}
              onChange={handleChange}
            />
          </div>
        </div>

        {/* Challan Items */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('sales.items')}</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="w-48">
                  <select
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.productId || ''}
                    onChange={(e) => {
                      const product = MOCK_PRODUCTS.find(p => p.id === e.target.value);
                      if (product) {
                        setItems(items.map(i => 
                          i.id === item.id 
                            ? { ...i, productId: product.id, description: product.name, unit: product.unit || 'pcs' } 
                            : i
                        ));
                      } else {
                        updateItem(item.id, 'productId', e.target.value);
                      }
                    }}
                  >
                    <option value="">{t('sales.selectProduct')}</option>
                    {MOCK_PRODUCTS.map(p => (
                      <option key={p.id} value={p.id}>{p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('sales.description')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder={t('sales.quantity')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', Number(e.target.value))}
                    min="1"
                  />
                </div>
                <div className="w-24">
                  <input
                    type="text"
                    placeholder={t('sales.unit')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.unit}
                    onChange={(e) => updateItem(item.id, 'unit', e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <div className="mt-4">
            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('sales.addItem')}
            </button>
          </div>
        </div>

        {/* Notes */}
        <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700">{t('sales.notes')}</label>
            <textarea
              name="notes"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.notesPlaceholder')}
              value={formData.notes}
              onChange={handleChange}
            />
        </div>

        <div className="flex justify-end pt-8">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('sales.deliveryChallans.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
