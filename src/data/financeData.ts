export type AccountType = 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';

export interface GLAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  description?: string;
  balance: number;
  isActive: boolean;
}

export const INITIAL_ACCOUNTS: GLAccount[] = [
  // Assets
  { id: '1', code: '1000', name: 'Cash on Hand', type: 'Asset', balance: 5000.00, isActive: true },
  { id: '2', code: '1010', name: 'Bank Account - Checking', type: 'Asset', balance: 95600.00, isActive: true },
  { id: '3', code: '1200', name: 'Accounts Receivable', type: 'Asset', balance: 12500.00, isActive: true },
  { id: '3b', code: '1500', name: 'Inventory Asset', type: 'Asset', balance: 45000.00, isActive: true },
  
  // Liabilities
  { id: '4', code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 4500.00, isActive: true },
  { id: '5', code: '2100', name: 'Credit Card Payable', type: 'Liability', balance: 1200.00, isActive: true },
  
  // Equity
  { id: '6', code: '3000', name: "Owner's Capital", type: 'Equity', balance: 50000.00, isActive: true },
  { id: '7', code: '3100', name: 'Retained Earnings', type: 'Equity', balance: 15000.00, isActive: true },
  
  // Revenue
  { id: '8', code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 150000.00, isActive: true },
  { id: '9', code: '4100', name: 'Service Income', type: 'Revenue', balance: 75000.00, isActive: true },
  
  // Expenses
  { id: '10', code: '5000', name: 'Rent Expense', type: 'Expense', balance: 24000.00, isActive: true },
  { id: '11', code: '5100', name: 'Utilities Expense', type: 'Expense', balance: 3600.00, isActive: true },
  { id: '12', code: '5200', name: 'Salaries Expense', type: 'Expense', balance: 60000.00, isActive: true },
  { id: '13', code: '5300', name: 'Cost of Goods Sold', type: 'Expense', balance: 45000.00, isActive: true },
  { id: '14', code: '5400', name: 'Marketing Expense', type: 'Expense', balance: 5000.00, isActive: true },
];
