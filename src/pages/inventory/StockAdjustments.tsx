import React, { useState } from 'react';
import { Plus, Search, Filter, ArrowUp, ArrowDown, X, Trash2, Printer, Download, Send, MoreVertical } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MOCK_PRODUCTS } from './Products';
import { useOrganization } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { StockAdjustmentPrintTemplate } from '../../components/StockAdjustmentPrintTemplate';

export interface StockAdjustment {
  id: string;
  date: string;
  reference: string;
  warehouseId: string;
  warehouseName: string;
  reason: 'Stocktake' | 'Damaged' | 'Theft' | 'Received' | 'Other';
  status: 'draft' | 'adjusted';
  items: AdjustmentItem[];
}

export interface AdjustmentItem {
  productId: string;
  productName: string;
  quantityChange: number;
  currentStock: number;
}

const MOCK_ADJUSTMENTS: StockAdjustment[] = [];

export const StockAdjustments: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [adjustments, setAdjustments] = useState<StockAdjustment[]>(MOCK_ADJUSTMENTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedAdjustment, setSelectedAdjustment] = useState<StockAdjustment | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<StockAdjustment>>({
    date: new Date().toISOString().split('T')[0],
    reason: 'Stocktake',
    status: 'draft',
    items: []
  });

  // Temporary state for adding items in modal
  const [selectedProductId, setSelectedProductId] = useState('');
  const [quantityChange, setQuantityChange] = useState<number>(0);

  const filteredAdjustments = adjustments.filter(adj =>
    adj.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    adj.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenModal = () => {
    const defaultWarehouse = settings.warehouses?.find(w => w.isDefault) || settings.warehouses?.[0];
    setFormData({
      date: new Date().toISOString().split('T')[0],
      reference: `ADJ-${String(adjustments.length + 1).padStart(3, '0')}`,
      warehouseId: defaultWarehouse?.id || '',
      warehouseName: defaultWarehouse?.name || '',
      reason: 'Stocktake',
      status: 'draft',
      items: []
    });
    setSelectedProductId('');
    setQuantityChange(0);
    setIsModalOpen(true);
  };

  const handleAddItem = () => {
    if (!selectedProductId || quantityChange === 0) return;

    const product = MOCK_PRODUCTS.find(p => p.id === selectedProductId);
    if (!product) return;

    const newItem: AdjustmentItem = {
      productId: product.id,
      productName: product.name,
      quantityChange: quantityChange,
      currentStock: product.stock_quantity // In a real app, fetch latest stock
    };

    setFormData(prev => ({
      ...prev,
      items: [...(prev.items || []), newItem]
    }));

    setSelectedProductId('');
    setQuantityChange(0);
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items?.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.items || formData.items.length === 0) {
      alert(t('inventory.stockAdjustments.form.errors.noItems'));
      return;
    }

    const newAdjustment: StockAdjustment = {
      ...formData as StockAdjustment,
      id: Date.now().toString(),
    };

    setAdjustments([newAdjustment, ...adjustments]);
    setIsModalOpen(false);
  };

  const handlePrint = (adjustment: StockAdjustment) => {
    setSelectedAdjustment(adjustment);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory.stockAdjustments.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('inventory.stockAdjustments.subtitle')}</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('inventory.stockAdjustments.create')}
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
            placeholder={t('inventory.stockAdjustments.searchPlaceholder')}
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
                {t('inventory.stockAdjustments.table.date')}
              </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockAdjustments.table.reference')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('inventory.stockAdjustments.table.warehouse')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('inventory.stockAdjustments.table.reason')}
                </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockAdjustments.table.itemsAffected')}
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.stockAdjustments.table.status')}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredAdjustments.map((adj) => (
              <tr key={adj.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {adj.date}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                  {adj.reference}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {adj.warehouseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {t(`inventory.stockAdjustments.reasons.${adj.reason.toLowerCase()}`).includes('inventory.stockAdjustments.reasons') ? adj.reason : t(`inventory.stockAdjustments.reasons.${adj.reason.toLowerCase()}`)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  <div className="flex flex-col gap-1">
                    {adj.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <span>{item.productName}:</span>
                        <span className={item.quantityChange > 0 ? 'text-green-600 flex items-center' : 'text-red-600 flex items-center'}>
                          {item.quantityChange > 0 ? <ArrowUp className="h-3 w-3 mr-1" /> : <ArrowDown className="h-3 w-3 mr-1" />}
                          {Math.abs(item.quantityChange)}
                        </span>
                      </div>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    adj.status === 'adjusted' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {t(`inventory.stockAdjustments.status.${adj.status}`).toUpperCase()}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                  <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                    <button 
                      onClick={() => handlePrint(adj)}
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

      {selectedAdjustment && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('inventory.stockAdjustments.printTitle', { reference: selectedAdjustment.reference })}
        >
          <StockAdjustmentPrintTemplate data={selectedAdjustment} />
        </PrintPreviewModal>
      )}

      {/* New Adjustment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left rtl:text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{t('inventory.stockAdjustments.form.title')}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('inventory.stockAdjustments.form.reference')}</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                        value={formData.reference || ''}
                        onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('inventory.stockAdjustments.form.date')}</label>
                      <input
                        type="date"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                        value={formData.date || ''}
                        onChange={(e) => setFormData({...formData, date: e.target.value})}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.stockAdjustments.form.warehouse')}</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                      value={formData.warehouseId || ''}
                      onChange={(e) => {
                        const warehouse = settings.warehouses?.find(w => w.id === e.target.value);
                        setFormData({
                          ...formData, 
                          warehouseId: e.target.value,
                          warehouseName: warehouse?.name || ''
                        });
                      }}
                    >
                      <option value="">{t('inventory.stockAdjustments.form.selectWarehouse')}</option>
                      {settings.warehouses?.map(w => (
                        <option key={w.id} value={w.id}>{w.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.stockAdjustments.form.reason')}</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                      value={formData.reason || 'Stocktake'}
                      onChange={(e) => setFormData({...formData, reason: e.target.value as any})}
                    >
                      <option value="Stocktake">{t('inventory.stockAdjustments.reasons.stocktake')}</option>
                      <option value="Damaged">{t('inventory.stockAdjustments.reasons.damaged')}</option>
                      <option value="Theft">{t('inventory.stockAdjustments.reasons.theft')}</option>
                      <option value="Received">{t('inventory.stockAdjustments.reasons.received')}</option>
                      <option value="Other">{t('inventory.stockAdjustments.reasons.other')}</option>
                    </select>
                  </div>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{t('inventory.stockAdjustments.form.items')}</h4>
                    
                    {/* Add Item Form */}
                    <div className="flex gap-3 mb-4 items-end bg-gray-50 p-3 rounded-md">
                      <div className="flex-1">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('inventory.stockAdjustments.form.product')}</label>
                        <select
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm rtl:text-right"
                          value={selectedProductId}
                          onChange={(e) => setSelectedProductId(e.target.value)}
                        >
                          <option value="">{t('inventory.stockAdjustments.form.selectProduct')}</option>
                          {MOCK_PRODUCTS.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (Cur: {p.stock_quantity})</option>
                          ))}
                        </select>
                      </div>
                      <div className="w-32">
                        <label className="block text-xs font-medium text-gray-500 mb-1">{t('inventory.stockAdjustments.form.qtyChange')}</label>
                        <input
                          type="number"
                          className="block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm rtl:text-right"
                          placeholder={t('inventory.stockAdjustments.form.qtyChangePlaceholder') || '+/- Qty'}
                          value={quantityChange}
                          onChange={(e) => setQuantityChange(parseInt(e.target.value))}
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleAddItem}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                      >
                        {t('inventory.stockAdjustments.form.add')}
                      </button>
                    </div>

                    {/* Items List */}
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {formData.items?.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center bg-white border border-gray-200 p-2 rounded-md">
                          <div className="text-sm">
                            <span className="font-medium text-gray-900">{item.productName}</span>
                            <span className="text-gray-500 ml-2 rtl:ml-0 rtl:mr-2 text-xs">{t('inventory.stockAdjustments.form.current')}: {item.currentStock}</span>
                          </div>
                          <div className="flex items-center">
                            <span className={`text-sm font-medium mr-3 rtl:mr-0 rtl:ml-3 ${item.quantityChange > 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {item.quantityChange > 0 ? '+' : ''}{item.quantityChange}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveItem(idx)}
                              className="text-gray-400 hover:text-red-500"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                      {(!formData.items || formData.items.length === 0) && (
                        <p className="text-sm text-gray-500 text-center py-2">{t('inventory.stockAdjustments.form.errors.noItems')}</p>
                      )}
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      {t('inventory.stockAdjustments.form.save')}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      {t('inventory.stockAdjustments.form.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
