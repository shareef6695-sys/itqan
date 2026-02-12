import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';

export interface FinancialSection {
  title: string;
  items: { label: string; value: number; code?: string }[];
  total: { label: string; value: number };
}

interface FinancialStatementPrintTemplateProps {
  title: string;
  subtitle?: string;
  dateRange: string;
  sections: FinancialSection[];
  footer?: React.ReactNode;
}

export const FinancialStatementPrintTemplate: React.FC<FinancialStatementPrintTemplateProps> = ({
  title,
  subtitle,
  dateRange,
  sections,
  footer
}) => {
  const { settings } = useOrganization();
  const { t, i18n } = useTranslation();

  return (
    <div className="p-8 bg-white min-h-screen text-gray-900 font-sans" id="print-content" dir={document.dir}>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 border-b border-gray-200 pb-6 rtl:flex-row-reverse">
        <div className="rtl:text-right">
          <h1 className="text-2xl font-bold text-gray-900">{settings.companyName}</h1>
          <div className="text-sm text-gray-600 mt-1 space-y-0.5">
            <p>{settings.address}</p>
            <p>{settings.city}, {settings.country}</p>
            <p>{t('reports.print.vatNo')}: {settings.vatNumber}</p>
          </div>
        </div>
        <div className="text-right rtl:text-left">
          <h2 className="text-xl font-bold text-indigo-600 uppercase tracking-wide">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1 font-medium">{subtitle}</p>}
          <p className="text-sm text-gray-500 mt-1">{t('reports.print.period')}: {dateRange}</p>
        </div>
      </div>

      {/* Sections */}
      <div className="space-y-8">
        {sections.map((section, index) => (
          <div key={index} className="break-inside-avoid">
            <h3 className="text-lg font-bold text-gray-800 border-b-2 border-gray-200 pb-2 mb-4 uppercase tracking-wider rtl:text-right">
              {section.title}
            </h3>
            <table className="w-full">
              <tbody>
                {section.items.map((item, itemIndex) => (
                  <tr key={itemIndex} className="border-b border-gray-50 text-sm hover:bg-gray-50">
                    <td className="py-2 pl-2 text-gray-700 rtl:text-right rtl:pr-2">
                      {item.code && <span className="text-gray-500 mr-2 rtl:ml-2 rtl:mr-0">{item.code}</span>}
                      {item.label}
                    </td>
                    <td className="py-2 pr-2 text-right rtl:text-left rtl:pl-2 font-medium text-gray-900">
                      {settings.currency} {item.value.toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-gray-100 font-bold">
                  <td className="py-3 pl-2 text-gray-900 rtl:text-right rtl:pr-2">{section.total.label}</td>
                  <td className="py-3 pr-2 text-right rtl:text-left rtl:pl-2 text-gray-900">
                    {settings.currency} {section.total.value.toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ))}
      </div>

      {/* Footer */}
      {footer && (
        <div className="mt-8 pt-8 border-t border-gray-200">
          {footer}
        </div>
      )}
      
      <div className="mt-12 text-center text-xs text-gray-400 border-t border-gray-100 pt-4">
        <p>{t('reports.print.generatedBy', { 
            company: settings.companyName, 
            date: new Date().toLocaleString(i18n.language === 'ar' ? 'ar-SA' : 'en-US') 
        })}</p>
      </div>
    </div>
  );
};
