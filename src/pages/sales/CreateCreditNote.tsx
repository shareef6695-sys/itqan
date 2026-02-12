import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { MOCK_INVOICES } from './Invoices';

interface CreditNoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export const CreateCreditNote: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useOrganization();
  
  const [formData, setFormData] = useState({
    invoiceId: '',
    warehouseId: '',
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  React.useEffect(() => {
    const defaultWarehouse = settings.warehouses?.find(w => w.isDefault) || settings.warehouses?.[0];
    if (defaultWarehouse && !formData.warehouseId) {
      setFormData(prev => ({ ...prev, warehouseId: defaultWarehouse.id }));
    }
  }, [settings.warehouses]);

  const [items, setItems] = useState<CreditNoteItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 },
  ]);

  const handleInvoiceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const invoiceId = e.target.value;
    const selectedInvoice = MOCK_INVOICES.find(inv => inv.id === invoiceId);
    
    if (selectedInvoice) {
      setFormData(prev => ({
        ...prev,
        invoiceId,
        clientName: selectedInvoice.client
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        invoiceId: '',
        clientName: ''
      }));
    }
  };

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item) => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof CreditNoteItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (settings.vatRate / 100);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Credit Note Data:', { formData, items, subtotal, total });
    alert(t('sales.success.creditNoteCreated'));
    navigate('/sales/credit-notes');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button 
                onClick={() => navigate('/sales/credit-notes')}
                className="p-2 hover:bg-gray-100 rounded-full"
            >
                <ArrowLeft className="h-6 w-6 text-gray-500 rtl:rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('sales.creditNotes.createTitle')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Invoice Selection */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.creditNotes.creditAgainstInvoice')}</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.invoiceId}
              onChange={handleInvoiceChange}
            >
              <option value="">{t('sales.creditNotes.selectInvoice')}</option>
              {MOCK_INVOICES.map(invoice => (
                <option key={invoice.id} value={invoice.id}>
                  {invoice.number} - {invoice.client} ({settings.currency} {invoice.amount})
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-gray-500">{t('sales.creditNotes.autoFillHelp')}</p>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.creditNotes.date') || 'Date'}</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.clientName')}</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-gray-50 rtl:text-right"
              value={formData.clientName}
              readOnly
              placeholder={t('sales.creditNotes.autoFillHelp')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.creditNotes.returnToWarehouse')}</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.warehouseId}
              onChange={(e) => setFormData({...formData, warehouseId: e.target.value})}
              required
            >
              <option value="">{t('sales.selectWarehouse')}</option>
              {settings.warehouses?.map(w => (
                <option key={w.id} value={w.id}>{w.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.creditNotes.reason')}</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.creditNotes.reasonPlaceholder')}
              value={formData.reason}
              onChange={(e) => setFormData({...formData, reason: e.target.value})}
            />
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('sales.creditNotes.itemsToCredit')}</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse">
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
                <div className="w-32">
                  <input
                    type="number"
                    placeholder={t('sales.rate')}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', Number(e.target.value))}
                    min="0"
                    step="0.01"
                  />
                </div>
                <div className="w-32 text-right rtl:text-left font-medium text-gray-700">
                  {settings.currency} {(item.quantity * item.rate).toFixed(2)}
                </div>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-red-500 hover:text-red-700"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={addItem}
            className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('sales.addItem')}
          </button>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-8 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('sales.subtotal')}</span>
              <span>{settings.currency} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('sales.vat')} ({settings.vatRate}%)</span>
              <span>{settings.currency} {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>{t('sales.total')}</span>
              <span>{settings.currency} {total.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('sales.creditNotes.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
