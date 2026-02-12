import React, { useState } from 'react';
import { Plus, Search, Filter, Trash2, Edit2, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../components/FinanceHeader';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { ExpenseVoucherPrintTemplate } from '../../components/ExpenseVoucherPrintTemplate';
import { useOrganization } from '../../context/OrganizationContext';

export interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
  status: 'Paid' | 'Pending';
  vendor: string;
}

const initialExpenses: Expense[] = [
  { id: '1', date: '2024-03-10', category: 'software', description: 'AWS Subscription', amount: 120.00, status: 'Paid', vendor: 'Amazon Web Services' },
  { id: '2', date: '2024-03-12', category: 'officeSupplies', description: 'Printer Paper', amount: 45.50, status: 'Paid', vendor: 'Staples' },
  { id: '3', date: '2024-03-15', category: 'travel', description: 'Flight to NY', amount: 450.00, status: 'Pending', vendor: 'Delta Airlines' },
];

export const Expenses: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);
  const [showModal, setShowModal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [newExpense, setNewExpense] = useState<Partial<Expense>>({
    date: new Date().toISOString().split('T')[0],
    status: 'Paid'
  });

  const handlePrint = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsPrintModalOpen(true);
  };

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || !newExpense.category) return;
    
    const expense: Expense = {
      id: Date.now().toString(),
      date: newExpense.date!,
      category: newExpense.category!,
      description: newExpense.description || '',
      amount: Number(newExpense.amount),
      status: newExpense.status as 'Paid' | 'Pending',
      vendor: newExpense.vendor || ''
    };
    
    setExpenses([...expenses, expense]);
    setShowModal(false);
    setNewExpense({ date: new Date().toISOString().split('T')[0], status: 'Paid' });
  };

  return (
    <div className="space-y-6">
      <FinanceHeader />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('finance.expenses.title')}</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
          {t('finance.expenses.addExpense')}
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
            className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
            placeholder={t('finance.expenses.searchPlaceholder')}
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
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.expenses.table.date')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.expenses.table.vendor')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.expenses.table.category')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.expenses.table.description')}</th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.expenses.table.status')}</th>
              <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.expenses.table.amount')}</th>
              <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('common.actions')}</span></th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {expenses.map((expense) => (
              <tr key={expense.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left rtl:text-right">{expense.date}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left rtl:text-right">{expense.vendor}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">
                  {t(`finance.expenses.categories.${expense.category}`)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">{expense.description}</td>
                <td className="px-6 py-4 whitespace-nowrap text-left rtl:text-right">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    expense.status === 'Paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.status === 'Paid' ? t('common.paid') : t('common.pending')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left font-medium">
                  {settings.currency} {expense.amount.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => handlePrint(expense)}
                      className="text-gray-400 hover:text-indigo-600 mr-4 rtl:ml-4 rtl:mr-0"
                      title={t('common.print')}
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button className="text-indigo-600 hover:text-indigo-900 mr-4 rtl:ml-4 rtl:mr-0"><Edit2 className="h-4 w-4" /></button>
                    <button className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedExpense && (
        <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('finance.expenses.printTitle', { id: selectedExpense.id })}
        >
          <ExpenseVoucherPrintTemplate data={selectedExpense} />
        </PrintPreviewModal>
      )}

      {/* Add Expense Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{t('finance.expenses.form.title')}</h2>
            <form onSubmit={handleAddExpense} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.expenses.form.vendor')}</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newExpense.vendor || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, vendor: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.expenses.form.category')}</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newExpense.category || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                  required
                >
                    <option value="">{t('finance.expenses.form.selectCategory')}</option>
                    <option value="officeSupplies">{t('finance.expenses.categories.officeSupplies')}</option>
                    <option value="travel">{t('finance.expenses.categories.travel')}</option>
                    <option value="software">{t('finance.expenses.categories.software')}</option>
                    <option value="utilities">{t('finance.expenses.categories.utilities')}</option>
                    <option value="marketing">{t('finance.expenses.categories.marketing')}</option>
                    <option value="other">{t('finance.expenses.categories.other')}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.expenses.form.amount')}</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newExpense.amount || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, amount: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.expenses.form.date')}</label>
                <input
                  type="date"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newExpense.date || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.expenses.form.description')}</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newExpense.description || ''}
                  onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('finance.expenses.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('finance.expenses.form.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
