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

export const INITIAL_ACCOUNTS: GLAccount[] = [];
