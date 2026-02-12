import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';

export interface ReportColumn {
  header: string;
  accessor: string | ((row: any) => React.ReactNode);
  align?: 'left' | 'right' | 'center';
  width?: string;
}

interface ReportPrintTemplateProps {
  title: string;
  subtitle?: string;
  columns: ReportColumn[];
  data: any[];
  footer?: React.ReactNode;
}

export const ReportPrintTemplate: React.FC<ReportPrintTemplateProps> = ({
  title,
  subtitle,
  columns,
  data,
  footer
}) => {
  const { settings } = useOrganization();
  const { t, i18n } = useTranslation();

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900" id="print-content" dir={document.dir}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b pb-4 rtl:flex-row-reverse">
        <div className="rtl:text-right">
          <h1 className="text-2xl font-bold text-gray-900">{settings.companyName}</h1>
          <div className="text-sm text-gray-600 mt-1 space-y-0.5">
            <p>{settings.address}</p>
            <p>{settings.city}, {settings.country}</p>
            <p>{t('reports.print.vatNo')}: {settings.vatNumber}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
          <p className="text-sm text-gray-500 mt-1">{t('reports.print.generatedOn', { date: new Date().toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US') })}</p>
        </div>
      </div>

      {/* Table */}
      <table className="w-full mb-8 rtl:text-right">
        <thead>
          <tr className="border-b-2 border-gray-800">
            {columns.map((col, index) => (
              <th 
                key={index} 
                className={`py-2 px-2 text-xs font-bold uppercase tracking-wider ${
                    col.align === 'right' ? 'text-right rtl:text-left' : 
                    col.align === 'center' ? 'text-center' : 'text-left rtl:text-right'
                }`}
                style={{ width: col.width }}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="border-b border-gray-200 text-sm">
              {columns.map((col, colIndex) => (
                <td 
                  key={colIndex} 
                  className={`py-2 px-2 ${
                    col.align === 'right' ? 'text-right rtl:text-left' : 
                    col.align === 'center' ? 'text-center' : 'text-left rtl:text-right'
                  }`}
                >
                  {typeof col.accessor === 'function' 
                    ? col.accessor(row) 
                    : row[col.accessor]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
            <tfoot>
                {footer}
            </tfoot>
        )}
      </table>
    </div>
  );
};
