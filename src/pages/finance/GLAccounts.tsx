import React, { useState } from 'react';
import { Plus, Search, Filter, Edit2, FolderTree } from 'lucide-react';
import { FinanceHeader } from '../../components/FinanceHeader';

type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  balance: number;
  isActive: boolean;
}

const initialAccounts: GLAccount[] = [
  // Assets
  { id: '1', code: '1000', name: 'Cash on Hand', type: 'Asset', balance: 5000.00, isActive: true },
  { id: '2', code: '1010', name: 'Bank Account - Checking', type: 'Asset', balance: 25000.00, isActive: true },
  { id: '3', code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 12500.00, isActive: true },
  
  // Liabilities
  { id: '4', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 4500.00, isActive: true },
  { id: '5', code: '2100', name: 'Credit Card Payable', type: 'Liability', balance: 1200.00, isActive: true },
  
  // Equity
  { id: '6', code: '3000', name: 'Owner\'s Capital', type: 'Equity', balance: 50000.00, isActive: true },
  { id: '7', code: '3100', name: 'Retained Earnings', type: 'Equity', balance: 15000.00, isActive: true },
  
  // Revenue
  { id: '8', code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 150000.00, isActive: true },
  { id: '9', code: '4100', name: 'Service Income', type: 'Revenue', balance: 75000.00, isActive: true },
  
  // Expenses
  { id: '10', code: '5000', name: 'Rent Expense', type: 'Expense', balance: 24000.00, isActive: true },
  { id: '11', code: '5100', name: 'Utilities Expense', type: 'Expense', balance: 3600.00, isActive: true },
  { id: '12', code: '5200', name: 'Salaries Expense', type: 'Expense', balance: 60000.00, isActive: true },
];

export const GLAccounts: React.FC = () => {
  const [accounts, setAccounts] = useState<GLAccount[]>(initialAccounts);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
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
        <h1 className="text-2xl font-bold text-gray-900">Chart of Accounts</h1>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Account
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Search by account name or code..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2 text-gray-400" />
          Filter
        </button>
      </div>

      {/* Grouped Table */}
      <div className="space-y-6">
        {accountTypes.map((type) => (
          groupedAccounts[type] && groupedAccounts[type].length > 0 && (
            <div key={type} className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center">
                <FolderTree className="h-5 w-5 text-gray-500 mr-2" />
                <h3 className="text-lg leading-6 font-medium text-gray-900">{type}s</h3>
              </div>
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Code</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Account Name</th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Balance</th>
                    <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {groupedAccounts[type].map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{account.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{account.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          account.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {account.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit2 className="h-4 w-4" /></button>
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
            <h2 className="text-xl font-bold mb-4">Add GL Account</h2>
            <form onSubmit={handleAddAccount} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Type</label>
                <select
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newAccount.type}
                  onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as AccountType })}
                  required
                >
                  {accountTypes.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Code</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newAccount.code || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, code: e.target.value })}
                  placeholder="e.g. 1000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Name</label>
                <input
                  type="text"
                  required
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newAccount.name || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                  placeholder="e.g. Petty Cash"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  value={newAccount.description || ''}
                  onChange={(e) => setNewAccount({ ...newAccount, description: e.target.value })}
                />
              </div>
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Save Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
