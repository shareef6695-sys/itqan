import React from 'react';
import { FileText } from 'lucide-react';

export const ProformaInvoices: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Proforma Invoices</h1>
        <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700">
          <FileText className="h-5 w-5 mr-2" />
          Create Proforma
        </button>
      </div>
      <div className="bg-white shadow rounded-lg p-6 text-center text-gray-500">
        No proforma invoices found.
      </div>
    </div>
  );
};
