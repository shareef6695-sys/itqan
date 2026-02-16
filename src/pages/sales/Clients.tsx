import React, { useState } from 'react';
import { Users, Search, Filter, MoreVertical, Mail, Phone, Plus, X, MapPin, Globe, Printer } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganization, GCC_COUNTRIES } from '../../context/OrganizationContext';
import { PrintPreviewModal } from '../../components/PrintPreviewModal';
import { ReportPrintTemplate, type ReportColumn } from '../../components/ReportPrintTemplate';
import { ClientPrintTemplate } from '../../components/ClientPrintTemplate';

interface Client {
  id: string;
  customerId: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  crNumber: string;
  vatNumber: string;
  vatRate: number;
  status: 'active' | 'inactive';
  balance: number;
}

const MOCK_CLIENTS: Client[] = [];

const VAT_RATES: Record<string, number> = {
  ...Object.keys(GCC_COUNTRIES).reduce((acc, country) => ({
    ...acc,
    [country]: GCC_COUNTRIES[country].vatRate
  }), {}),
  'United Kingdom': 20,
  'United States': 0,
  'India': 18,
};

export const Clients: React.FC = () => {
  const { t } = useTranslation();
  const { settings } = useOrganization();
  const [clients, setClients] = useState<Client[]>(MOCK_CLIENTS);

  const formatStatus = (status: string) => {
    return t(`sales.clients.status.${status}`);
  };

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  
  // Form State
  const [formData, setFormData] = useState<Partial<Client>>({
    status: 'active',
    country: settings.country, // Default to organization country
    vatRate: settings.vatRate
  });

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const country = e.target.value;
    const rate = VAT_RATES[country] !== undefined ? VAT_RATES[country] : 0;
    setFormData(prev => ({ ...prev, country, vatRate: rate }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newClient: Client = {
      id: Date.now().toString(),
      customerId: formData.customerId || `CUST-${Date.now().toString().slice(-4)}`,
      companyName: formData.companyName || '',
      contactPerson: formData.contactPerson || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      country: formData.country || '',
      crNumber: formData.crNumber || '',
      vatNumber: formData.vatNumber || '',
      vatRate: formData.vatRate || 0,
      status: 'active',
      balance: 0
    };

    setClients([...clients, newClient]);
    setIsModalOpen(false);
    setFormData({ status: 'active', country: settings.country, vatRate: settings.vatRate });
  };

  const filteredClients = clients.filter(client => 
    client.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.customerId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const reportColumns: ReportColumn[] = [
    { header: t('sales.clients.form.customerId'), accessor: 'customerId', width: '100px' },
    { header: t('sales.clients.form.companyName'), accessor: 'companyName' },
    { header: t('sales.clients.form.contactPerson'), accessor: 'contactPerson' },
    { header: t('sales.clients.form.email'), accessor: 'email' },
    { header: t('sales.clients.form.phone'), accessor: 'phone' },
    { header: t('sales.clients.form.country'), accessor: 'country' },
    { 
      header: t('sales.clients.table.balance'), 
      accessor: (row) => `${settings.currency} ${row.balance.toFixed(2)}`,
      align: 'right'
    },
    { 
      header: t('sales.clients.table.status'), 
      accessor: (row) => (
        <span className={row.status === 'active' ? 'text-green-600' : 'text-gray-600'}>
          {formatStatus(row.status)}
        </span>
      ),
      align: 'center'
    }
  ];

  const handlePrintList = () => {
    setSelectedClient(null);
    setIsPrintModalOpen(true);
  };

  const handlePrintClient = (client: Client) => {
    setSelectedClient(client);
    setIsPrintModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('sales.clients.title')}</h1>
          <p className="text-sm text-gray-500 mt-1">{t('sales.clients.subtitle')}</p>
        </div>
        <div className="flex space-x-2 rtl:space-x-reverse">
            <button 
                onClick={handlePrintList}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
                <Printer className="h-5 w-5 me-2" />
                {t('sales.clients.printList')}
            </button>
            <button 
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
            <Plus className="h-5 w-5 me-2" />
            {t('sales.clients.addNew')}
            </button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-4 border-b border-gray-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 rtl:pl-3 rtl:pr-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder={t('sales.clients.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Filter className="h-4 w-4 me-2" />
            {t('common.filter')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.clients.table.clientDetails')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.clients.table.contactInfo')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.clients.table.location')}
                </th>
                <th scope="col" className="px-6 py-3 text-left rtl:text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.clients.table.status')}
                </th>
                <th scope="col" className="px-6 py-3 text-right rtl:text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t('sales.clients.table.balance')}
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">{t('common.actions')}</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                          {client.companyName.charAt(0)}
                        </div>
                      </div>
                      <div className="ms-4">
                        <div className="text-sm font-medium text-gray-900">{client.companyName}</div>
                        <div className="text-xs text-gray-500">ID: {client.customerId}</div>
                        <div className="text-xs text-gray-500">CR: {client.crNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Users className="h-4 w-4 me-2 text-gray-400" />
                      {client.contactPerson}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Mail className="h-4 w-4 me-2 text-gray-400" />
                      {client.email}
                    </div>
                    <div className="text-sm text-gray-500 flex items-center mt-1">
                      <Phone className="h-4 w-4 me-2 text-gray-400" />
                      {client.phone}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 flex items-center">
                      <Globe className="h-4 w-4 me-2 text-gray-400" />
                      {client.country}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      VAT: {client.vatRate}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      client.status === 'active' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {formatStatus(client.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium text-gray-900">
                    {settings.currency} {client.balance.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2 rtl:space-x-reverse">
                        <button 
                            onClick={() => handlePrintClient(client)}
                            className="text-gray-400 hover:text-indigo-600"
                            title={t('sales.clients.printProfile')}
                        >
                            <Printer className="h-5 w-5" />
                        </button>
                        <button className="text-gray-400 hover:text-gray-600">
                            <MoreVertical className="h-5 w-5" />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print Modal */}
      <PrintPreviewModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        title={selectedClient ? t('sales.clients.print.clientTitle', { name: selectedClient.companyName }) : t('sales.clients.print.listTitle')}
      >
        {selectedClient ? (
            <ClientPrintTemplate client={selectedClient} />
        ) : (
            <ReportPrintTemplate
              title={t('sales.clients.print.reportTitle')}
              columns={reportColumns}
              data={filteredClients}
            />
        )}
      </PrintPreviewModal>

      {/* Add Client Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setIsModalOpen(false)}></div>
            </div>

            {/* Modal panel */}
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left rtl:text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-5 border-b pb-3">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">{t('sales.clients.addNew')}</h3>
                  <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-500">
                    <X className="h-6 w-6" />
                  </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Basic Info */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.customerId')}</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        placeholder={t('sales.clients.form.customerIdPlaceholder')}
                        value={formData.customerId || ''}
                        onChange={(e) => setFormData({...formData, customerId: e.target.value})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.companyName')} *</label>
                      <input
                        type="text"
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.companyName || ''}
                        onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.contactPerson')} *</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                          <Users className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          required
                          className="block w-full pl-10 rtl:pl-3 rtl:pr-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.contactPerson || ''}
                          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.email')} *</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          required
                          className="block w-full pl-10 rtl:pl-3 rtl:pr-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.email || ''}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.phone')} *</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                          <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="tel"
                          required
                          className="block w-full pl-10 rtl:pl-3 rtl:pr-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.phone || ''}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.address')}</label>
                      <div className="mt-1 relative rounded-md shadow-sm">
                        <div className="absolute inset-y-0 left-0 rtl:left-auto rtl:right-0 pl-3 rtl:pl-0 rtl:pr-3 flex items-center pointer-events-none">
                          <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          className="block w-full pl-10 rtl:pl-3 rtl:pr-10 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          value={formData.address || ''}
                          onChange={(e) => setFormData({...formData, address: e.target.value})}
                        />
                      </div>
                    </div>

                    {/* Business Details */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.crNumber')}</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.crNumber || ''}
                        onChange={(e) => setFormData({...formData, crNumber: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.vatNumber')}</label>
                      <input
                        type="text"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.vatNumber || ''}
                        onChange={(e) => setFormData({...formData, vatNumber: e.target.value})}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.country')} *</label>
                      <select
                        required
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                        value={formData.country || ''}
                        onChange={handleCountryChange}
                      >
                        <option value="">{t('sales.clients.form.selectCountry')}</option>
                        {Object.keys(GCC_COUNTRIES).map(country => (
                            <option key={country} value={country}>{country}</option>
                        ))}
                        <option value="India">India</option>
                        <option value="United Kingdom">United Kingdom</option>
                        <option value="United States">United States</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t('sales.clients.form.vatRate')}</label>
                      <input
                        type="number"
                        readOnly
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 text-gray-500 focus:outline-none sm:text-sm"
                        value={formData.vatRate || 0}
                      />
                      <p className="mt-1 text-xs text-gray-500">{t('sales.clients.form.autoCalculated')}</p>
                    </div>
                  </div>

                  <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                    <button
                      type="submit"
                      className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                    >
                      {t('common.save')}
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
    </div>
  );
};
