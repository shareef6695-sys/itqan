import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, Trash2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { MOCK_PRODUCTS } from './Products';

interface TransferItem {
  productId: string;
  productName: string;
  quantity: number;
  currentStock: number;
}

export const CreateStockTransfer: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useOrganization();
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: `TRF-${Date.now().toString().slice(-6)}`,
    fromWarehouseId: '',
    toWarehouseId: '',
    status: 'draft',
    notes: ''
  });

  const [items, setItems] = useState<TransferItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantity, setQuantity] = useState<number>(0);

  const handleAddItem = () => {
    if (!selectedProductId || quantity <= 0) return;

    const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
    if (!product) return;

    const newItem: TransferItem = {
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      currentStock: product.stock_quantity
    };

    setItems([...items, newItem]);
    setSelectedProductId('');
    setQuantity(0);
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      alert(t('inventory.stockTransfers.form.errors.noItems'));
      return;
    }
    if (formData.fromWarehouseId === formData.toWarehouseId) {
      alert(t('inventory.stockTransfers.form.errors.sameWarehouse'));
      return;
    }
    
    // In a real app, we would save the transfer here
    console.log('Saving transfer:', { ...formData, items });
    navigate('/inventory/transfers');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/inventory/transfers')}
            className="mr-4 rtl:ml-4 rtl:mr-0 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6 rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory.stockTransfers.form.title')}</h1>
        </div>
      </div>

      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">{t('inventory.stockTransfers.form.reference')}</label>
              <input
                type="text"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                value={formData.reference}
                onChange={(e) => setFormData({...formData, reference: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('inventory.stockTransfers.form.date')}</label>
              <input
                type="date"
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('inventory.stockTransfers.form.fromWarehouse')}</label>
              <select
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                value={formData.fromWarehouseId}
                onChange={(e) => setFormData({...formData, fromWarehouseId: e.target.value})}
              >
                <option value="">{t('inventory.stockTransfers.form.selectSource')}</option>
                {settings.warehouses?.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">{t('inventory.stockTransfers.form.toWarehouse')}</label>
              <select
                required
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                value={formData.toWarehouseId}
                onChange={(e) => setFormData({...formData, toWarehouseId: e.target.value})}
              >
                <option value="">{t('inventory.stockTransfers.form.selectDestination')}</option>
                {settings.warehouses?.map(w => (
                  <option key={w.id} value={w.id}>{w.name}</option>
                ))}
              </select>
            </div>
            
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('inventory.stockTransfers.form.status')}</label>
              <select
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value})}
              >
                <option value="draft">{t('inventory.stockTransfers.status.draft')}</option>
                <option value="in_transit">{t('inventory.stockTransfers.status.in_transit')}</option>
                <option value="completed">{t('inventory.stockTransfers.status.completed')}</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">{t('inventory.stockTransfers.form.notes')}</label>
              <textarea
                rows={3}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                value={formData.notes}
                onChange={(e) => setFormData({...formData, notes: e.target.value})}
              />
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">{t('inventory.stockTransfers.form.items')}</h3>
            
            <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-md mb-4">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('inventory.stockTransfers.form.product')}</label>
                <select
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm rtl:text-right"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                >
                  <option value="">{t('inventory.stockTransfers.form.selectProduct')}</option>
                  {MOCK_PRODUCTS.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({t('inventory.stockTransfers.form.available')}: {p.stock_quantity})</option>
                  ))}
                </select>
              </div>
              <div className="w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">{t('inventory.stockTransfers.form.quantity')}</label>
                <input
                  type="number"
                  min="1"
                  className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 sm:text-sm rtl:text-right"
                  placeholder={t('inventory.stockTransfers.form.quantity')}
                  value={quantity || ''}
                  onChange={(e) => setQuantity(parseInt(e.target.value))}
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('inventory.stockTransfers.form.add')}
              </button>
            </div>

            {items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.stockTransfers.form.product')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.stockTransfers.form.available')}</th>
                      <th className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('inventory.stockTransfers.form.quantity')}</th>
                      <th className="relative px-6 py-3"><span className="sr-only">{t('common.actions')}</span></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.productName}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.currentStock}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{item.quantity}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(index)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">{t('inventory.stockTransfers.form.errors.noItems')}</p>
            )}
          </div>

          <div className="flex justify-end pt-6 space-x-3 rtl:space-x-reverse">
            <button
              type="button"
              onClick={() => navigate('/inventory/transfers')}
              className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {t('inventory.stockTransfers.form.cancel')}
            </button>
            <button
              type="submit"
              className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <Save className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
              {t('inventory.stockTransfers.form.save')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
