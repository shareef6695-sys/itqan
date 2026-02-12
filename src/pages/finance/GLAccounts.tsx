import React, { useState } from 'react';
import { Plus, Search, Filter, FolderTree, Printer, Edit2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../components/FinanceHeader';
import { INITIAL_ACCOUNTS } from '../../data/financeData';
import type { GLAccount, AccountType } from '../../data/financeData';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { GLAccountPrintTemplate } from '../../components/GLAccountPrintTemplate';
import { useOrganization } from '../../context/OrganizationContext';

export const GLAccounts: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [accounts, setAccounts] = useState<GLAccount[]>(INITIAL_ACCOUNTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [newAccount, setNewAccount] = useState<Partial<GLAccount>>({
    type: 'Asset',
    isActive: true
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.code || !newAccount.name || !newAccount.type) return;

    const account: GLAccount = {
      id: Date.now().toString(),
      code: newAccount.code,
      name: newAccount.name,
      type: newAccount.type,
      description: newAccount.description || '',
      balance: 0,
      isActive: true,
    };

    setAccounts([...accounts, account].sort((a, b) => a.code.localeCompare(b.code)));
    setShowModal(false);
    setNewAccount({ type: 'Asset', isActive: true });
  };

  const filteredAccounts = accounts.filter(acc => 
    acc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.code.includes(searchTerm)
  );

  const groupedAccounts = filteredAccounts.reduce((acc, curr) => {
    (acc[curr.type] = acc[curr.type] || []).push(curr);
    return acc;
  }, {} as Record<AccountType, GLAccount[]>);

  const accountTypes: AccountType[] = ['Asset', 'Liability', 'Equity', 'Revenue', 'Expense'];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('finance.glAccounts.title')}</h1>
        <div className="flex space-x-2 rtl:space-x-reverse">
            <button 
                onClick={() => setIsPrintModalOpen(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                <Printer className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('finance.glAccounts.printList')}
            </button>
            <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('finance.glAccounts.addAccount')}
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={t('finance.glAccounts.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
          {t('common.filter')}
        </button>
      </div>

      {/* Grouped Table */}
      <div className="space-y-6">
        {accountTypes.map((type) => (
          groupedAccounts[type] && groupedAccounts[type].length > 0 && (
            <div key={type} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
                <FolderTree className="h-5 w-5 text-gray-500 mr-2 rtl:ml-2 rtl:mr-0" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{t(`finance.glAccounts.print.types.${type}`)}</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{t('finance.glAccounts.table.code')}</th>
                    <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.glAccounts.table.accountName')}</th>
                    <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.glAccounts.table.balance')}</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">{t('finance.glAccounts.table.status')}</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">{t('common.actions')}</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedAccounts[type].map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900 text-left rtl:text-right">{account.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 text-left rtl:text-right">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left font-medium">
                        {settings.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {account.isActive ? t('common.active') : t('common.inactive')}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4 rtl:ml-4 rtl:mr-0"><Edit2 className="h-4 w-4" /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ))}
      </div>

      {/* Add Account Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h2 className="text-xl font-bold mb-4">{t('finance.glAccounts.form.title')}</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.glAccounts.form.accountType')}</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as AccountType })}
                  required
                >
                  {accountTypes.map(type => <option key={type} value={type}>{t(`finance.glAccounts.print.types.${type}`)}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.glAccounts.form.accountCode')}</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newAccount.code || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                  placeholder={t('finance.glAccounts.form.codePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.glAccounts.form.accountName')}</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newAccount.name || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder={t('finance.glAccounts.form.namePlaceholder')}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">{t('finance.glAccounts.form.description')}</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rtl:text-right"
                  value={newAccount.description || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 rtl:space-x-reverse pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('finance.glAccounts.form.cancel')}
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {t('finance.glAccounts.form.save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <PrintPreviewModal
          isOpen={isPrintModalOpen}
          onClose={() => setIsPrintModalOpen(false)}
          title={t('finance.glAccounts.printTitle')}
        >
          <GLAccountPrintTemplate accounts={filteredAccounts} />
        </PrintPreviewModal>
    </div>
  );
};
