import React, { useState } from 'react';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';

interface ProformaItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export const CreateProformaInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [items, setItems] = useState<ProformaItem[]>([
    { id: '1', description: '', quantity: 1, rate: 0 },
  ]);
  const [formData, setFormData] = useState({
    clientName: '',
    date: new Date().toISOString().split('T')[0],
    expiryDate: '',
    terms: ''
  });

  const addItem = () => {
    setItems([...items, { id: Date.now().toString(), description: '', quantity: 1, rate: 0 }]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof ProformaItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * (settings.vatRate / 100);
  const total = subtotal + tax;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Proforma Invoice Data:', { ...formData, items, subtotal, total });
    alert(t('sales.success.proformaCreated'));
    navigate('/sales/proforma-invoices');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <button 
            onClick={() => navigate('/sales/proforma-invoices')}
            className="mr-4 rtl:ml-4 rtl:mr-0 text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-6 w-6 rtl:rotate-180" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales.proformaInvoices.createTitle')}</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        {/* Client Details Section */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
            <label className="block text-sm font-medium text-gray-700">{t('sales.proformaInvoices.date')}</label>
            <input
              type="date"
              name="date"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.proformaInvoices.expiryDate')}</label>
            <input
              type="date"
              name="expiryDate"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              value={formData.expiryDate}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Items */}
        <div className="mt-8">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('sales.items')}</h3>
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
                <div className="w-32 text-right rtl:text-left font-medium text-gray-900">
                  {settings.currency} {(item.quantity * item.rate).toFixed(2)}
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

        {/* Footer Section: Terms & Totals */}
        <div className="mt-8 border-t border-gray-200 pt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Terms and Conditions */}
          <div>
            <label htmlFor="terms" className="block text-sm font-medium text-gray-700">
              {t('sales.termsConditions')}
            </label>
            <textarea
              id="terms"
              name="terms"
              rows={4}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.enterTerms')}
              value={formData.terms}
              onChange={handleChange}
            />
          </div>

          {/* Totals */}
          <div className="flex justify-end items-start">
            <div className="w-64 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('sales.subtotal')}</span>
                <span>{settings.currency} {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>{t('sales.vat')} ({settings.vatRate}%)</span>
                <span>{settings.currency} {tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-medium text-gray-900">
                <span>{t('sales.total')}</span>
                <span>{settings.currency} {total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-8">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('sales.proformaInvoices.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
