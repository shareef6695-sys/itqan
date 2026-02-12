import React from 'react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../context/OrganizationContext';
import type { Product } from '../pages/inventory/Products';
import { QRCodeCanvas } from 'qrcode.react';

interface ProductPrintTemplateProps {
  product: Product;
}

export const ProductPrintTemplate: React.FC<ProductPrintTemplateProps> = ({ product }) => {
  const { settings } = useOrganization();
  const { t } = useTranslation();

  return (
    <div className="p-8 bg-white text-gray-900 font-sans" id="print-content" dir={document.dir}>
        {/* Header */}
        <div className="flex justify-between items-start mb-8 border-b pb-4 rtl:flex-row-reverse">
            <div className="rtl:text-right">
                <h1 className="text-2xl font-bold text-indigo-600">{settings.companyName}</h1>
                <p className="text-sm text-gray-500 mt-1">{settings.address}</p>
                <p className="text-sm text-gray-500">{settings.email} | {settings.phone}</p>
            </div>
            <div className="text-right rtl:text-left">
                <h2 className="text-3xl font-bold text-gray-800 uppercase">{t('inventory.products.print.detailsTitle')}</h2>
                <p className="text-gray-500 mt-1">{t('inventory.products.print.generatedOn')}: {new Date().toLocaleDateString()}</p>
            </div>
        </div>

        {/* Product Info */}
        <div className="mb-8">
            <div className="flex justify-between rtl:flex-row-reverse">
                <div className="rtl:text-right">
                     <h3 className="text-2xl font-bold text-gray-900">{product.name}</h3>
                     <p className="text-lg text-gray-600 mb-2">{t('inventory.products.print.sku')}: {product.sku}</p>
                     <p className="text-gray-700 italic">{product.description}</p>
                </div>
                <div>
                    <QRCodeCanvas value={product.sku} size={100} />
                </div>
            </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-8 rtl:text-right">
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.category')}</span>
                <span className="font-medium">{product.category}</span>
             </div>
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.unit')}</span>
                <span className="font-medium">{product.unit}</span>
             </div>
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.stockQuantity')}</span>
                <span className={`font-medium ${product.stock_quantity < product.reorder_point ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock_quantity}
                </span>
             </div>
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.reorderPoint')}</span>
                <span className="font-medium">{product.reorder_point}</span>
             </div>
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.unitPrice')}</span>
                <span className="font-medium">{settings.currency} {product.unit_price.toFixed(2)}</span>
             </div>
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.costPrice')}</span>
                <span className="font-medium">{settings.currency} {product.cost_price.toFixed(2)}</span>
             </div>
             <div className="border-b border-gray-200 pb-2">
                <span className="text-gray-500 block text-sm">{t('inventory.products.print.status')}</span>
                <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {product.status.toUpperCase()}
                </span>
             </div>
        </div>
        
        {/* Footer */}
        <div className="mt-12 pt-4 border-t border-gray-200 text-center text-sm text-gray-500">
            <p>{t('inventory.products.print.endOfSheet')}</p>
        </div>
    </div>
  );
};
