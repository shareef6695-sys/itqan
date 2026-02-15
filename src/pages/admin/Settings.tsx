import React, { useState, useEffect } from 'react';
import { Save, Building, Plus, Trash2, Warehouse as WarehouseIcon, QrCode, Link, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useOrganization, GCC_COUNTRIES } from '../../context/OrganizationContext';
import type { Warehouse } from '../../context/OrganizationContext';
import { ZatcaService } from '../../utils/zatca';
import type { ZatcaComplianceStatus } from '../../utils/zatca';

export const Settings: React.FC = () => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useOrganization();
  const [formData, setFormData] = useState(settings);
  const [showSuccess, setShowSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'organization' | 'warehouses' | 'zatca'>('organization');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<ZatcaComplianceStatus | null>(null);

  useEffect(() => {
    setFormData({
        ...settings,
        zatca: settings.zatca || { enabled: false, phase: '1' }
    });
  }, [settings]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
        const newData = { ...prev, [name]: value };
        // If country changes, auto-update VAT and Currency for preview
        if (name === 'country' && GCC_COUNTRIES[value]) {
            newData.currency = GCC_COUNTRIES[value].currency;
            newData.vatRate = GCC_COUNTRIES[value].vatRate;
        }
        return newData;
    });
  };

  const addWarehouse = () => {
    const newWarehouse: Warehouse = {
      id: Date.now().toString(),
      name: '',
      location: '',
      isDefault: false
    };
    setFormData(prev => ({
      ...prev,
      warehouses: [...(prev.warehouses || []), newWarehouse]
    }));
  };

  const removeWarehouse = (id: string) => {
    setFormData(prev => ({
      ...prev,
      warehouses: prev.warehouses.filter(w => w.id !== id)
    }));
  };

  const updateWarehouse = (id: string, field: keyof Warehouse, value: any) => {
    setFormData(prev => ({
      ...prev,
      warehouses: prev.warehouses.map(w => 
        w.id === id ? { ...w, [field]: value } : w
      )
    }));
  };

  const setAsDefaultWarehouse = (id: string) => {
    setFormData(prev => ({
      ...prev,
      warehouses: prev.warehouses.map(w => ({
        ...w,
        isDefault: w.id === id
      }))
    }));
  };

  const handleZatcaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
        ...prev,
        zatca: {
            ...prev.zatca!,
            [name]: type === 'checkbox' ? checked : value
        }
    }));
  };

  const handleConnectZatca = async () => {
    if (!formData.zatca?.enabled) return;
    
    setIsConnecting(true);
    setConnectionStatus(null);
    
    try {
      // 1. Generate CSR
      const csr = await ZatcaService.generateCSR(formData.zatca);
      
      // 2. Request Compliance
      const result = await ZatcaService.requestCompliance(csr);
      
      setConnectionStatus(result);
    } catch (error) {
      setConnectionStatus({
        status: 'error',
        message: 'Failed to connect to ZATCA. Please check your configuration.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
            <h1 className="text-2xl font-bold text-gray-900">{t('settings.title')}</h1>
            <p className="text-sm text-gray-500 mt-1">{t('settings.subtitle')}</p>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('organization')}
              className={`${
                activeTab === 'organization'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <Building className="h-5 w-5 me-2" />
              {t('settings.tabs.organization')}
            </button>
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`${
                activeTab === 'warehouses'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <WarehouseIcon className="h-5 w-5 me-2" />
              {t('settings.tabs.warehouses')}
            </button>
            <button
              onClick={() => setActiveTab('zatca')}
              className={`${
                activeTab === 'zatca'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } w-1/4 py-4 px-1 text-center border-b-2 font-medium text-sm flex items-center justify-center`}
            >
              <QrCode className="h-5 w-5 me-2" />
              {t('settings.tabs.zatca')}
            </button>
          </nav>
        </div>

        <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'organization' && (
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.companyName')}</label>
                        <input
                            type="text"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            required
                        />
                    </div>

                    <div className="sm:col-span-2">
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.address')}</label>
                        <textarea
                            name="address"
                            value={formData.address}
                            onChange={handleChange}
                            rows={3}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.country')}</label>
                        <select
                            name="country"
                            value={formData.country}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                        >
                            {Object.keys(GCC_COUNTRIES).map((country) => (
                                <option key={country} value={country}>
                                    {country}
                                </option>
                            ))}
                        </select>
                        <p className="mt-1 text-xs text-gray-500">
                            Currency and VAT rate are automatically set based on country.
                        </p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.currency')}</label>
                        <input
                            type="text"
                            value={formData.currency}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm border p-2 text-gray-500 cursor-not-allowed"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.commercialRegister')}</label>
                        <input
                            type="text"
                            name="crNumber"
                            value={formData.crNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="Commercial Registration Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.taxId')}</label>
                        <input
                            type="text"
                            name="vatNumber"
                            value={formData.vatNumber}
                            onChange={handleChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                            placeholder="VAT Registration Number"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">{t('settings.fields.vatRate')}</label>
                        <input
                            type="number"
                            value={formData.vatRate}
                            readOnly
                            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm border p-2 text-gray-500 cursor-not-allowed"
                        />
                    </div>
                </div>
                )}

                {activeTab === 'warehouses' && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="text-sm text-gray-500">
                            {t('settings.warehouses.manageText')}
                        </div>
                        <button
                            type="button"
                            onClick={addWarehouse}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                            <Plus className="h-4 w-4 me-1" />
                            {t('settings.warehouses.add')}
                        </button>
                    </div>

                    <div className="space-y-4">
                        {formData.warehouses?.map((warehouse) => (
                            <div key={warehouse.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">{t('settings.warehouses.name')}</label>
                                    <input
                                        type="text"
                                        value={warehouse.name}
                                        onChange={(e) => updateWarehouse(warehouse.id, 'name', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        placeholder="Warehouse Name"
                                        required
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="block text-xs font-medium text-gray-500">{t('settings.warehouses.location')}</label>
                                    <input
                                        type="text"
                                        value={warehouse.location}
                                        onChange={(e) => updateWarehouse(warehouse.id, 'location', e.target.value)}
                                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                        placeholder="Location"
                                    />
                                </div>
                                <div className="pt-5">
                                    <div className="flex items-center">
                                        <input
                                            id={`default-warehouse-${warehouse.id}`}
                                            name="default-warehouse"
                                            type="radio"
                                            checked={warehouse.isDefault}
                                            onChange={() => setAsDefaultWarehouse(warehouse.id)}
                                            className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300"
                                        />
                                        <label htmlFor={`default-warehouse-${warehouse.id}`} className="ml-2 block text-sm text-gray-900">
                                            {t('settings.warehouses.default')}
                                        </label>
                                    </div>
                                </div>
                                <div className="pt-5">
                                    <button
                                        type="button"
                                        onClick={() => removeWarehouse(warehouse.id)}
                                        className="text-red-600 hover:text-red-900 p-2"
                                        disabled={formData.warehouses?.length <= 1}
                                        title={formData.warehouses?.length <= 1 ? t('settings.warehouses.cannotDeleteOnly') : t('settings.warehouses.delete')}
                                    >
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                )}

                {activeTab === 'zatca' && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-medium leading-6 text-gray-900">{t('settings.zatca.title')}</h3>
                        <p className="mt-1 text-sm text-gray-500">
                          {t('settings.zatca.description')}
                        </p>
                      </div>
                      <div className="flex items-center">
                        <input
                          id="zatca-enabled"
                          name="enabled"
                          type="checkbox"
                          checked={formData.zatca?.enabled}
                          onChange={handleZatcaChange}
                          className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        />
                        <label htmlFor="zatca-enabled" className="ms-2 block text-sm text-gray-900">
                          {t('settings.zatca.enable')}
                        </label>
                      </div>
                    </div>

                    {formData.zatca?.enabled && (
                      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                          <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.phase')}</label>
                          <select
                            name="phase"
                            value={formData.zatca?.phase}
                            onChange={handleZatcaChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                          >
                            <option value="1">{t('settings.zatca.phase1')}</option>
                            <option value="2">{t('settings.zatca.phase2')}</option>
                          </select>
                        </div>

                        {formData.zatca?.phase === '2' && (
                          <>
                            <div className="sm:col-span-2">
                              <h4 className="text-sm font-medium text-gray-900 mt-4 mb-2">{t('settings.zatca.csr.title')}</h4>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.csr.commonName')}</label>
                              <input
                                type="text"
                                name="csrCommonName"
                                value={formData.zatca?.csrCommonName || ''}
                                onChange={handleZatcaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                placeholder="e.g., TSZE-0001"
                              />
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.csr.organizationName')}</label>
                              <input
                                type="text"
                                name="csrOrganizationName"
                                value={formData.zatca?.csrOrganizationName || ''}
                                onChange={handleZatcaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.csr.organizationUnit')}</label>
                              <input
                                type="text"
                                name="csrOrganizationUnitName"
                                value={formData.zatca?.csrOrganizationUnitName || ''}
                                onChange={handleZatcaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                placeholder="Branch Name or Unit"
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.csr.country')}</label>
                              <input
                                type="text"
                                name="csrCountryName"
                                value={formData.zatca?.csrCountryName || 'SA'}
                                onChange={handleZatcaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                maxLength={2}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.csr.invoiceType')}</label>
                              <input
                                type="text"
                                name="csrInvoiceType"
                                value={formData.zatca?.csrInvoiceType || '1100'}
                                onChange={handleZatcaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                placeholder={t('settings.zatca.csr.invoiceTypePlaceholder')}
                              />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">{t('settings.zatca.csr.location')}</label>
                              <input
                                type="text"
                                name="csrLocation"
                                value={formData.zatca?.csrLocation || ''}
                                onChange={handleZatcaChange}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2"
                                placeholder="City"
                              />
                            </div>
                            
                            <div className="sm:col-span-2">
                                <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div>
                                            <h4 className="text-base font-medium text-gray-900">{t('settings.zatca.status.title')}</h4>
                                            <p className="text-sm text-gray-500">{t('settings.zatca.status.description')}</p>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={handleConnectZatca}
                                            disabled={isConnecting || connectionStatus?.status === 'connected'}
                                            className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                                                connectionStatus?.status === 'connected' 
                                                ? 'bg-green-600 hover:bg-green-700' 
                                                : 'bg-indigo-600 hover:bg-indigo-700'
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50`}
                                        >
                                            {isConnecting ? (
                                                <>
                                                    <Loader className="animate-spin -ml-1 me-2 h-4 w-4" />
                                                    {t('settings.zatca.status.connecting')}
                                                </>
                                            ) : connectionStatus?.status === 'connected' ? (
                                                <>
                                                    <CheckCircle className="-ml-1 me-2 h-4 w-4" />
                                                    {t('settings.zatca.status.connected')}
                                                </>
                                            ) : (
                                                <>
                                                    <Link className="-ml-1 me-2 h-4 w-4" />
                                                    {t('settings.zatca.status.connect')}
                                                </>
                                            )}
                                        </button>
                                    </div>

                                    {connectionStatus && (
                                        <div className={`rounded-md p-4 ${
                                            connectionStatus.status === 'connected' ? 'bg-green-50' : 'bg-red-50'
                                        }`}>
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    {connectionStatus.status === 'connected' ? (
                                                        <CheckCircle className="h-5 w-5 text-green-400" aria-hidden="true" />
                                                    ) : (
                                                        <AlertCircle className="h-5 w-5 text-red-400" aria-hidden="true" />
                                                    )}
                                                </div>
                                                <div className="ms-3">
                                                    <h3 className={`text-sm font-medium ${
                                                        connectionStatus.status === 'connected' ? 'text-green-800' : 'text-red-800'
                                                    }`}>
                                                        {connectionStatus.status === 'connected' ? t('settings.zatca.status.connectionSuccessful') : t('settings.zatca.status.connectionFailed')}
                                                    </h3>
                                                    <div className={`mt-2 text-sm ${
                                                        connectionStatus.status === 'connected' ? 'text-green-700' : 'text-red-700'
                                                    }`}>
                                                        <p>{connectionStatus.message}</p>
                                                        {connectionStatus.csid && (
                                                            <p className="mt-1 font-mono text-xs">CSID: {connectionStatus.csid}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {!connectionStatus && (
                                        <div className="rounded-md bg-blue-50 p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <QrCode className="h-5 w-5 text-blue-400" aria-hidden="true" />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-blue-800">{t('settings.zatca.status.ready')}</h3>
                                                    <div className="mt-2 text-sm text-blue-700">
                                                        <p>
                                                            {t('settings.zatca.status.readyDescription')}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <div className="flex justify-end pt-4 border-t border-gray-200">
                    <button
                        type="submit"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <Save className="h-5 w-5 me-2" />
                        {t('common.saveSettings')}
                    </button>
                </div>
            </form>
        </div>
      </div>
      
      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg transition-opacity duration-500">
            {t('common.savedSuccessfully')}
        </div>
      )}
    </div>
  );
};
