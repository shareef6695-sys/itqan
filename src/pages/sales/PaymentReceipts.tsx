import React from 'react';
import { Receipt } from 'lucide-react';

export const PaymentReceipts: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Payment Receipts</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <Receipt className="h-5 w-5 mr-2" />
          Record Payment
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No payment receipts found.
      </div>
    </div>
  );
};
