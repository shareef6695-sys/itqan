import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { MOCK_BILLS } from './Bills';

interface DebitNoteItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export const CreateDebitNote: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useOrganization();
  
  const [formData, setFormData] = useState({
    billId: '',
    vendorName: '',
    date: new Date().toISOString().split('T')[0],
    reason: '',
  });

  const [items, setItems] = useState<DebitNoteItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 },
  ]);

  const handleBillChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const billId = e.target.value;
    const selectedBill = MOCK_BILLS.find(bill => bill.id === billId);
    
    if (selectedBill) {
      setFormData(prev => ({
        ...prev,
        billId,
        vendorName: selectedBill.vendor
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        billId: '',
        vendorName: ''
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

  const updateItem = (id: string, field: keyof DebitNoteItem, value: string | number) => {
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
    console.log('Debit Note Data:', { formData, items, subtotal, total });
    alert(t('purchase.success.debitNoteCreated') || 'Debit Note Created Successfully');
    navigate('/purchase/debit-notes');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4 rtl:space-x-reverse">
            <button 
                onClick={() => navigate('/purchase/debit-notes')}
                className="p-2 hover:bg-gray-100 rounded-full"
            >
                <ArrowLeft className="h-6 w-6 text-gray-500 rtl:rotate-180" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">{t('purchase.debitNotes.create')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Bill Selection */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchase.debitNotes.table.ref') || 'Reference Bill'}</label>
            <select
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.billId}
              onChange={handleBillChange}
            >
              <option value="">{t('purchase.debitNotes.selectBill') || 'Select Bill'}</option>
              {MOCK_BILLS.map(bill => (
                <option key={bill.id} value={bill.id}>
                  {bill.number} - {bill.vendor} ({settings.currency} {bill.amount})
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchase.debitNotes.date') || 'Date'}</label>
            <input
              type="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.date}
              onChange={(e) => setFormData({...formData, date: e.target.value})}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchase.debitNotes.table.vendor')}</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 bg-gray-50 rtl:text-right"
              value={formData.vendorName}
              readOnly
              placeholder="Auto-filled from bill"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">{t('purchase.debitNotes.reason') || 'Reason'}</label>
            <input
              type="text"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('purchase.debitNotes.reasonPlaceholder') || 'e.g. Damaged Goods'}
              value={formData.reason}
              onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
            />
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('purchase.debitNotes.itemsToDebit') || 'Items to Debit'}</h3>
          <div className="space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex items-center space-x-4 rtl:space-x-reverse">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder={t('common.description') || "Description"}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    required
                  />
                </div>
                <div className="w-24">
                  <input
                    type="number"
                    placeholder={t('purchase.bills.print.quantity') || 'Qty'}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.quantity}
                    onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                    min="1"
                  />
                </div>
                <div className="w-32">
                  <input
                    type="number"
                    placeholder={t('purchase.bills.print.rate') || 'Rate'}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                    value={item.rate}
                    onChange={(e) => updateItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
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
            {t('purchase.purchaseOrders.form.addItem') || 'Add Item'}
          </button>
        </div>

        {/* Totals */}
        <div className="border-t border-gray-200 pt-8 flex justify-end">
          <div className="w-64 space-y-3">
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('purchase.purchaseOrders.form.subtotal') || 'Subtotal'}</span>
              <span>{settings.currency} {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t('purchase.purchaseOrders.form.vat') || 'VAT'} ({settings.vatRate}%)</span>
              <span>{settings.currency} {tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-lg font-bold text-gray-900 border-t border-gray-200 pt-3">
              <span>{t('purchase.purchaseOrders.form.total') || 'Total'}</span>
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
            {t('common.save') || 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
};
