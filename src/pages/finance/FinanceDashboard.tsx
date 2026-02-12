import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { FinanceHeader } from '../../components/FinanceHeader';
import { useTranslation } from 'react-i18next';
import { useOrganization } from '../../context/OrganizationContext';

export const FinanceDashboard: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { settings } = useOrganization();
  const isRtl = i18n.language === 'ar';

  const data = [
    { name: t('common.months.jan'), income: 4000, expense: 2400 },
    { name: t('common.months.feb'), income: 3000, expense: 1398 },
    { name: t('common.months.mar'), income: 2000, expense: 9800 },
    { name: t('common.months.apr'), income: 2780, expense: 3908 },
    { name: t('common.months.may'), income: 1890, expense: 4800 },
    { name: t('common.months.jun'), income: 2390, expense: 3800 },
    { name: t('common.months.jul'), income: 3490, expense: 4300 },
  ];

  const stats = [
    { title: t('finance.dashboard.stats.totalBalance'), amount: `${settings.currency} 24,562.00`, change: '+12.5%', icon: Wallet, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: t('finance.dashboard.stats.totalIncome'), amount: `${settings.currency} 45,231.89`, change: '+8.2%', icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-100' },
    { title: t('finance.dashboard.stats.totalExpenses'), amount: `${settings.currency} 20,669.89`, change: '-3.1%', icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-100' },
    { title: t('finance.dashboard.stats.netProfit'), amount: `${settings.currency} 24,562.00`, change: '+15.3%', icon: DollarSign, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  ];

  return (
    <div className="space-y-6">
      <FinanceHeader />
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">{t('finance.dashboard.title')}</h1>
        <div className="flex space-x-3 rtl:space-x-reverse">
            <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm border p-2 rtl:text-right">
                <option>{t('finance.dashboard.filters.thisYear')}</option>
                <option>{t('finance.dashboard.filters.lastYear')}</option>
            </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.title} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-md ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} />
                </div>
                <div className="ml-5 w-0 flex-1 rtl:mr-5 rtl:ml-0">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">{item.title}</dt>
                    <dd className="flex items-baseline">
                      <div className="text-2xl font-semibold text-gray-900">{item.amount}</div>
                      <div className={`ml-2 flex items-baseline text-sm font-semibold rtl:mr-2 rtl:ml-0 ${item.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {item.change}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('finance.dashboard.charts.incomeVsExpenses')}</h3>
          <div className="h-80" dir={isRtl ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" />
                <YAxis />
                <CartesianGrid strokeDasharray="3 3" />
                <Tooltip />
                <Area type="monotone" name={t('common.income')} dataKey="income" stroke="#4F46E5" fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" name={t('common.expense')} dataKey="expense" stroke="#EF4444" fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('finance.dashboard.charts.monthlyBreakdown')}</h3>
          <div className="h-80" dir={isRtl ? "rtl" : "ltr"}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar name={t('common.income')} dataKey="income" fill="#4F46E5" />
                <Bar name={t('common.expense')} dataKey="expense" fill="#EF4444" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
