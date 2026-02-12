import React, { useRef } from 'react';
import { X, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface PrintPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const PrintPreviewModal: React.FC<PrintPreviewModalProps> = ({ isOpen, onClose, title, children }) => {
  const printRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const modalTitle = title || t('common.printPreview');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <>
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 overflow-y-auto print:hidden">
        <div className="relative bg-white rounded-lg shadow-xl w-full max-w-4xl m-4 flex flex-col max-h-[90vh]">
          {/* Modal Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3 className="text-lg font-semibold text-gray-900">{modalTitle}</h3>
            <div className="flex items-center space-x-2 rtl:space-x-reverse">
              <button
                onClick={handlePrint}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-md hover:bg-indigo-700 focus:outline-none"
              >
                <Printer className="h-4 w-4 me-2" />
                {t('common.print')}
              </button>
              <button
                onClick={onClose}
                className="p-2 text-gray-400 hover:text-gray-500 rounded-full hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Modal Body - Scrollable Preview */}
          <div className="flex-1 overflow-y-auto p-8 bg-gray-100">
             <div className="shadow-lg mx-auto bg-white min-h-[29.7cm] w-[21cm]"> {/* A4 Dimensions approx */}
                {children}
             </div>
          </div>
        </div>
      </div>

      {/* Hidden Print Container (Visible only on print) */}
      <div id="print-container" className="hidden">
        {children}
      </div>
    </>
  );
};
