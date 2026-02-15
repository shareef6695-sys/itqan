import React, { useState } from 'react';
import { Plus, Search, Filter, Package, Edit2, Trash2, X, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { ReportPrintTemplate, type ReportColumn } from '../../components/ReportPrintTemplate';
import { ProductPrintTemplate } from '../../components/ProductPrintTemplate';

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  unit_price: number;
  cost_price: number;
  stock_quantity: number;
  unit: string;
  category: string;
  status: 'active' | 'inactive';
  reorder_point: number;
}

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Steel Pipe 2"',
    sku: 'SP-002',
    description: '2 inch diameter steel pipe, standard grade',
    unit_price: 45.00,
    cost_price: 30.00,
    stock_quantity: 150,
    unit: 'pcs',
    category: 'Raw Materials',
    status: 'active',
    reorder_point: 50
  },
  {
    id: '2',
    name: 'Iron Rod 10mm',
    sku: 'IR-010',
    description: '10mm reinforced iron rod for construction',
    unit_price: 12.50,
    cost_price: 8.50,
    stock_quantity: 500,
    unit: 'pcs',
    category: 'Raw Materials',
    status: 'active',
    reorder_point: 100
  },
  {
    id: '3',
    name: 'Welding Kit',
    sku: 'WK-PRO',
    description: 'Professional grade welding kit with accessories',
    unit_price: 250.00,
    cost_price: 180.00,
    stock_quantity: 15,
    unit: 'set',
    category: 'Equipment',
    status: 'active',
    reorder_point: 10
  }
];

export const Products: React.FC = () => {
  const { t } = useTranslation();
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const { settings } = useOrganization();

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      status: 'active',
      stock_quantity: 0,
      reorder_point: 10,
      unit_price: 0,
      cost_price: 0,
      unit: 'pcs'
    });
    setIsModalOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingId(product.id);
    setFormData(product);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm(t('common.confirmDelete'))) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      setProducts(products.map(p => p.id === editingId ? { ...p, ...formData } as Product : p));
    } else {
      const newProduct: Product = {
        ...formData as Product,
        id: Date.now().toString(),
      };
      setProducts([...products, newProduct]);
    }
    setIsModalOpen(false);
  };

  const reportColumns: ReportColumn[] = [
    { header: t('inventory.products.table.details'), accessor: 'name' },
    { header: 'SKU', accessor: 'sku' },
    { header: t('inventory.products.table.category'), accessor: 'category' },
    { 
      header: t('inventory.products.table.stock'), 
      accessor: (row) => `${row.stock_quantity} ${row.unit}`,
      align: 'right'
    },
    { 
      header: t('inventory.products.table.unitPrice'), 
      accessor: (row) => `${settings.currency} ${row.unit_price.toFixed(2)}`,
      align: 'right'
    },
    { 
      header: t('inventory.products.table.status'), 
      accessor: (row) => (
        <span className={row.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
          {row.status === 'active' ? t('common.active') : t('common.inactive')}
        </span>
      ),
      align: 'center'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('inventory.products.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('inventory.products.subtitle')}</p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
            <button 
                onClick={() => {
                    setSelectedProduct(null);
                    setIsPrintModalOpen(true);
                }}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                <Printer className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
                {t('inventory.products.printList')}
            </button>
            <button 
            onClick={handleAdd}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
            <Plus className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0" />
            {t('inventory.products.add')}
            </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 rtl:pl-0 rtl:right-0 rtl:pr-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            className="block w-full pl-10 pr-3 rtl:pl-3 rtl:pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder={t('inventory.products.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
          <Filter className="h-5 w-5 mr-2 rtl:ml-2 rtl:mr-0 text-gray-400" />
          {t('common.filter')}
        </button>
      </div>

      {/* Table */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.products.table.details')}
              </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.products.table.category')}
              </th>
              <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.products.table.stock')}
              </th>
              <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.products.table.unitPrice')}
              </th>
              <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('inventory.products.table.status')}
              </th>
              <th scope="col" className="relative px-6 py-3">
                <span className="sr-only">{t('common.actions')}</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-indigo-600" />
                    </div>
                    <div className="ml-4 rtl:mr-4 rtl:ml-0">
                      <div className="text-sm font-medium text-gray-900">{product.name}</div>
                      <div className="text-sm text-gray-500">SKU: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {product.category}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${product.stock_quantity < 20 ? 'text-red-600' : 'text-gray-900'}`}>
                    {product.stock_quantity} {product.unit}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right rtl:text-left">
                  {settings.currency} {product.unit_price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    product.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.status === 'active' ? t('common.active') : t('common.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right rtl:text-left text-sm font-medium">
                  <div className="flex justify-end space-x-2 rtl:space-x-reverse">
                    <button 
                      onClick={() => {
                        setSelectedProduct(product);
                        setIsPrintModalOpen(true);
                      }}
                      className="text-gray-400 hover:text-indigo-600"
                      title={t('common.print')}
                    >
                      <Printer className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleEdit(product)}
                      className="text-indigo-600 hover:text-indigo-900"
                      title={t('common.edit')}
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(product.id)}
                      className="text-red-600 hover:text-red-900"
                      title={t('common.delete')}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Product Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left rtl:text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {editingId ? t('inventory.products.form.editTitle') : t('inventory.products.form.addTitle')}
                  </h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.name')} *</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.name || ''}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.sku')} *</label>
                    <input
                      type="text"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.sku || ''}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.category')} *</label>
                    <select
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.category || ''}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    >
                      <option value="">{t('inventory.products.form.selectCategory')}</option>
                      <option value="Raw Materials">{t('inventory.products.categories.rawMaterials')}</option>
                      <option value="Finished Goods">{t('inventory.products.categories.finishedGoods')}</option>
                      <option value="Equipment">{t('inventory.products.categories.equipment')}</option>
                      <option value="Consumables">{t('inventory.products.categories.consumables')}</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.unitPrice')} *</label>
                      <input
                        type="number"
                        required
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.unit_price || ''}
                        onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.costPrice')}</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.cost_price || ''}
                        onChange={(e) => setFormData({...formData, cost_price: parseFloat(e.target.value)})}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.currentStock')}</label>
                      <input
                        type="number"
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.stock_quantity || ''}
                        onChange={(e) => setFormData({...formData, stock_quantity: parseInt(e.target.value)})}
                      />
                    </div>
                    <div>
                       <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.reorderPoint')}</label>
                       <input
                         type="number"
                         min="0"
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                         value={formData.reorder_point || ''}
                         onChange={(e) => setFormData({...formData, reorder_point: parseInt(e.target.value)})}
                       />
                     </div>
                     <div>
                       <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.unit')}</label>
                       <input
                         type="text"
                         className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                         value={formData.unit || ''}
                         onChange={(e) => setFormData({...formData, unit: e.target.value})}
                         placeholder={t('inventory.products.form.unitPlaceholder')}
                       />
                     </div>
                   </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.description')}</label>
                    <textarea
                      rows={3}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.description || ''}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t('inventory.products.form.status')}</label>
                    <select
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      value={formData.status || 'active'}
                      onChange={(e) => setFormData({...formData, status: e.target.value as 'active' | 'inactive'})}
                    >
                      <option value="active">{t('common.active')}</option>
                      <option value="inactive">{t('common.inactive')}</option>
                    </select>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      {editingId ? t('inventory.products.form.update') : t('inventory.products.form.save')}
                    </button>
                    <button
                      type="button"
                      className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                      onClick={() => setIsModalOpen(false)}
                    >
                      {t('common.cancel')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}

      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={selectedProduct ? t('inventory.products.print.productTitle', { name: selectedProduct.name }) : t('inventory.products.print.listTitle')}
      >
        {selectedProduct ? (
            <ProductPrintTemplate product={selectedProduct} />
        ) : (
            <ReportPrintTemplate
              title={t('inventory.products.print.listTitle')}
              columns={reportColumns}
              data={filteredProducts}
            />
        )}
      </PrintPreviewModal>
    </div>
  );
};
