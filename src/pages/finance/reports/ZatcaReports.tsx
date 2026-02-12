import React, { useState } from 'react';
import { Download, Printer, Calendar, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { FinanceHeader } from '../../../components/FinanceHeader';
import { PrintPreviewModal } from '../../../components/PrintPreviewModal';
import { ReportPrintTemplate, type ReportColumn } from '../../../components/ReportPrintTemplate';
import { MOCK_INVOICES } from '../../sales/Invoices';
import { useOrganization } from '../../../context/OrganizationContext';
import type { Invoice } from '../../sales/Invoices';

export const ZatcaReports: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Process invoices for ZATCA report
  // Filter by date range if needed, for now just use all mock invoices
  const reportData = MOCK_INVOICES.map(inv => {
      // Assuming amount is total (inclusive of VAT). 
      // Standard KSA VAT is 15%. 
      // Taxable = Total / 1.15
      // VAT = Total - Taxable
      const totalAmount = inv.amount;
      const taxableAmount = totalAmount / 1.15;
      const vatAmount = totalAmount - taxableAmount;
      
      // Mock ZATCA status based on invoice status
      let zatcaStatus = t('finance.zatcaReports.pending');
      let zatcaStatusColor = 'text-yellow-600';
      
      if (inv.status === 'paid' || inv.status === 'overdue') {
          zatcaStatus = t('finance.zatcaReports.reported');
          zatcaStatusColor = 'text-green-600';
      }

      return {
          ...inv,
          taxableAmount,
          vatAmount,
          zatcaStatus,
          zatcaStatusColor
      };
  });

  const totalTaxable = reportData.reduce((sum, item) => sum + item.taxableAmount, 0);
  const totalVat = reportData.reduce((sum, item) => sum + item.vatAmount, 0);
  const totalAmount = reportData.reduce((sum, item) => sum + item.amount, 0);

  const handlePrint = () => {
    setIsPrintModalOpen(true);
  };

  const columns: ReportColumn[] = [
      { header: t('finance.zatcaReports.invoiceNumber'), accessor: 'number', width: '15%' },
      { header: t('finance.zatcaReports.date'), accessor: 'date', width: '12%' },
      { header: t('finance.zatcaReports.customer'), accessor: 'client' },
      { 
          header: t('finance.zatcaReports.taxableAmount'), 
          accessor: (row: any) => `${settings.currency} ${row.taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
          align: 'right',
          width: '15%'
      },
      { 
          header: t('finance.zatcaReports.vatAmount'), 
          accessor: (row: any) => `${settings.currency} ${row.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
          align: 'right',
          width: '12%'
      },
      { 
          header: t('finance.zatcaReports.totalAmount'), 
          accessor: (row: any) => `${settings.currency} ${row.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, 
          align: 'right',
          width: '15%'
      },
      { 
          header: t('finance.zatcaReports.status'), 
          accessor: (row: any) => (
              <span className={`font-medium ${row.zatcaStatusColor}`}>
                  {row.zatcaStatus}
              </span>
          ),
          align: 'center',
          width: '15%'
      },
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('finance.zatcaReports.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('finance.zatcaReports.subtitle')}</p>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 bg-white p-1 rounded border border-gray-300">
             <Calendar className="h-4 w-4 text-gray-400 ml-2 rtl:mr-2 rtl:ml-0" />
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="border-none text-sm focus:ring-0 p-1 rtl:text-right"
            />
            <span className="text-gray-400">-</span>
            <input 
              type="date" 
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="border-none text-sm focus:ring-0 p-1 rtl:text-right"
            />
          </div>
          <button 
            onClick={handlePrint}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <Printer className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('common.print')}
          </button>
          <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
            <Download className="h-4 w-4 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('common.export')}
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FileText className="h-6 w-6 text-gray-400" />
              </div>
              <div className="ml-5 w-0 flex-1 rtl:mr-5 rtl:ml-0">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.zatcaReports.totalInvoices')}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">{reportData.length}</div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-green-400" />
              </div>
              <div className="ml-5 w-0 flex-1 rtl:mr-5 rtl:ml-0">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.zatcaReports.reported')}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                        {reportData.filter(i => i.zatcaStatus === t('finance.zatcaReports.reported')).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-yellow-400" />
              </div>
              <div className="ml-5 w-0 flex-1 rtl:mr-5 rtl:ml-0">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">{t('finance.zatcaReports.pending')}</dt>
                  <dd>
                    <div className="text-lg font-medium text-gray-900">
                        {reportData.filter(i => i.zatcaStatus === t('finance.zatcaReports.pending')).length}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.invoiceNumber')}</th>
                        <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.date')}</th>
                        <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.customer')}</th>
                        <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.taxableAmount')}</th>
                        <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.vatAmount')}</th>
                        <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.totalAmount')}</th>
                        <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">{t('finance.zatcaReports.status')}</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {reportData.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600 text-left rtl:text-right">{item.number}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-left rtl:text-right">{item.date}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-left rtl:text-right">{item.client}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left">
                                {settings.currency} {item.taxableAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left">
                                {settings.currency} {item.vatAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900 text-right rtl:text-left">
                                {settings.currency} {item.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    item.zatcaStatus === t('finance.zatcaReports.reported') ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {item.zatcaStatus}
                                </span>
                            </td>
                        </tr>
                    ))}
                    {/* Totals Row */}
                    <tr className="bg-gray-50 font-bold">
                        <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left uppercase">{t('common.printTemplate.total')}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left border-t-2 border-gray-300">
                            {settings.currency} {totalTaxable.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left border-t-2 border-gray-300">
                            {settings.currency} {totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left border-t-2 border-gray-300">
                            {settings.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td></td>
                    </tr>
                </tbody>
            </table>
        </div>
      </div>

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={t('finance.zatcaReports.printTitle')}
      >
        <ReportPrintTemplate
          title={t('finance.zatcaReports.title')}
          subtitle={t('finance.profitLoss.dateRange', { startDate, endDate })}
          columns={columns}
          data={reportData}
          footer={
              <tr className="font-bold border-t-2 border-gray-800">
                  <td colSpan={3} className="py-2 px-2 text-right rtl:text-left">{t('common.printTemplate.total')}</td>
                  <td className="py-2 px-2 text-right rtl:text-left">{settings.currency} {totalTaxable.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-2 text-right rtl:text-left">{settings.currency} {totalVat.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td className="py-2 px-2 text-right rtl:text-left">{settings.currency} {totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                  <td></td>
              </tr>
          }
        />
      </PrintPreviewModal>
    </div>
  );
};
