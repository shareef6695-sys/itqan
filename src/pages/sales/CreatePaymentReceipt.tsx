import React, { useState } from 'react';
import { Save, Calendar, CreditCard } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';

export const CreatePaymentReceipt: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { settings } = useOrganization();
  const [formData, setFormData] = useState({
    clientName: '',
    paymentDate: new Date().toISOString().split('T')[0],
    paymentMode: 'Bank Transfer',
    reference: '',
    amount: '',
    remarks: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Payment Receipt Data:', formData);
    alert(t('sales.success.paymentCreated'));
    navigate('/sales/payment-receipts');
  };

  const paymentModes = [
    { value: 'Bank Transfer', label: t('sales.paymentReceipts.modes.bankTransfer') },
    { value: 'Cash', label: t('sales.paymentReceipts.modes.cash') },
    { value: 'Check', label: t('sales.paymentReceipts.modes.check') },
    { value: 'Credit Card', label: t('sales.paymentReceipts.modes.creditCard') },
    { value: 'Online Payment', label: t('sales.paymentReceipts.modes.onlinePayment') },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('sales.paymentReceipts.createTitle')}</h1>
      </div>

      <form onSubmit={handleSubmit} className="bg-white shadow rounded-lg p-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          {/* Client Name */}
          <div className="sm:col-span-2">
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

          {/* Payment Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.paymentReceipts.paymentDate')}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="date"
                name="paymentDate"
                className="block w-full pl-10 rtl:pl-3 rtl:pr-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                value={formData.paymentDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.paymentReceipts.amountReceived')} ({settings.currency})</label>
            <input
              type="number"
              name="amount"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder="0.00"
              min="0"
              step="0.01"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.paymentReceipts.paymentMode')}</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                <CreditCard className="h-5 w-5 text-gray-400" />
              </div>
              <select
                name="paymentMode"
                className="block w-full pl-10 rtl:pl-3 rtl:pr-10 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
                value={formData.paymentMode}
                onChange={handleChange}
              >
                {paymentModes.map((mode) => (
                  <option key={mode.value} value={mode.value}>
                    {mode.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Reference Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700">{t('sales.paymentReceipts.referenceNumber')}</label>
            <input
              type="text"
              name="reference"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.paymentReceipts.referencePlaceholder')}
              value={formData.reference}
              onChange={handleChange}
              required
            />
          </div>

          {/* Remarks */}
          <div className="sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700">{t('sales.paymentReceipts.remarks')}</label>
            <textarea
              name="remarks"
              rows={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right"
              placeholder={t('sales.paymentReceipts.remarksPlaceholder')}
              value={formData.remarks}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="flex justify-end pt-5">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('sales.paymentReceipts.save')}
          </button>
        </div>
      </form>
    </div>
  );
};
