import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import { LanguageSwitcher } from './LanguageSwitcher';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Receipt, 
  Settings, 
  Package, 
  ChevronDown, 
  ChevronRight, 
  ShoppingCart, 
  Truck, 
  RotateCcw, 
  DollarSign, 
  ShoppingBag, 
  CreditCard
} from 'lucide-react';
import clsx from 'clsx';

interface NavItem {
  id: string;
  name: string;
  to?: string;
  icon: React.ElementType;
  children?: { id: string; name: string; to: string; icon?: React.ElementType }[];
}

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['sales']);

  const navItems: NavItem[] = [
    { id: 'dashboard', name: t('nav.dashboard'), to: '/', icon: LayoutDashboard },
    { 
      id: 'sales',
      name: t('nav.sales'), 
      icon: DollarSign,
      children: [
        { id: 'clients', name: t('nav.clients'), to: '/sales/clients', icon: Users },
        { id: 'quotations', name: t('nav.quotations'), to: '/sales/quotations', icon: FileText },
        { id: 'proformaInvoices', name: t('nav.proformaInvoices'), to: '/sales/proforma-invoices', icon: FileText },
        { id: 'invoices', name: t('nav.invoices'), to: '/sales/invoices', icon: FileText },
        { id: 'paymentReceipts', name: t('nav.paymentReceipts'), to: '/sales/payment-receipts', icon: Receipt },
        { id: 'salesOrders', name: t('nav.salesOrders'), to: '/sales/sales-orders', icon: ShoppingCart },
        { id: 'deliveryChallans', name: t('nav.deliveryChallans'), to: '/sales/delivery-challans', icon: Truck },
        { id: 'creditNotes', name: t('nav.creditNotes'), to: '/sales/credit-notes', icon: RotateCcw },
      ]
    },
    { 
      id: 'purchase',
      name: t('nav.purchase'), 
      icon: ShoppingBag,
      children: [
        { id: 'vendors', name: t('nav.vendors'), to: '/purchase/vendors', icon: Users },
        { id: 'purchaseOrders', name: t('nav.purchaseOrders'), to: '/purchase/orders', icon: ShoppingCart },
        { id: 'bills', name: t('nav.bills'), to: '/purchase/bills', icon: FileText },
        { id: 'debitNotes', name: t('nav.debitNotes'), to: '/purchase/debit-notes', icon: RotateCcw },
        { id: 'paymentsMade', name: t('nav.paymentsMade'), to: '/purchase/payments-made', icon: CreditCard },
      ]
    },
    { 
      id: 'finance',
      name: t('nav.finance'), 
      icon: Receipt,
      children: [
        { id: 'financeDashboard', name: t('nav.dashboard'), to: '/finance', icon: LayoutDashboard },
        { id: 'glAccounts', name: t('nav.glAccounts'), to: '/finance/gl-accounts', icon: FileText },
        { id: 'expenses', name: t('nav.expenses'), to: '/finance/expenses', icon: CreditCard },
        { id: 'transactions', name: t('nav.transactions'), to: '/finance/transactions', icon: DollarSign },
        { id: 'balanceSheet', name: t('nav.balanceSheet'), to: '/finance/reports/balance-sheet', icon: FileText },
        { id: 'profitLoss', name: t('nav.profitLoss'), to: '/finance/reports/profit-loss', icon: FileText },
        { id: 'dayBook', name: t('nav.dayBook'), to: '/finance/reports/day-book', icon: FileText },
        { id: 'cashFlow', name: t('nav.cashFlow'), to: '/finance/reports/cash-flow', icon: RotateCcw },
        { id: 'trialBalance', name: t('nav.trialBalance'), to: '/finance/reports/trial-balance', icon: FileText },
        { id: 'zatcaReports', name: t('nav.zatcaReports'), to: '/finance/reports/zatca', icon: FileText },
      ]
    },
    { 
      id: 'inventory',
      name: t('nav.inventory'), 
      icon: Package,
      children: [
        { id: 'products', name: t('nav.products'), to: '/inventory/products', icon: Package },
        { id: 'stockAdjustments', name: t('nav.stockAdjustments'), to: '/inventory/adjustments', icon: FileText },
        { id: 'stockTransfers', name: t('nav.stockTransfers'), to: '/inventory/transfers', icon: Truck },
      ]
    },
    { id: 'settings', name: t('nav.settings'), to: '/settings', icon: Settings },
    { id: 'users', name: t('nav.users', 'Users and roles'), to: '/admin/users', icon: Users },
  ];

  const toggleMenu = (id: string) => {
    setExpandedMenus(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  const isChildActive = (children: { to: string }[]) => {
    return children.some(child => location.pathname.startsWith(child.to));
  };

  return (
    <aside className="w-64 bg-white border-e border-gray-200 min-h-screen flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">ITQanSales</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.id}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.id)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isChildActive(item.children) || expandedMenus.includes(item.id)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 me-3" />
                    {item.name}
                  </div>
                  {expandedMenus.includes(item.id) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4 rtl:rotate-180" />
                  )}
                </button>
                {expandedMenus.includes(item.id) && (
                  <div className="ms-4 mt-1 space-y-1 ps-4 border-s border-indigo-200">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.id}
                        to={child.to}
                        className={({ isActive }) =>
                          clsx(
                            'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                            isActive
                              ? 'text-indigo-600 font-semibold'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )
                        }
                      >
                        {child.name}
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <NavLink
                to={item.to!}
                className={({ isActive }) =>
                  clsx(
                    'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )
                }
              >
                <item.icon className="w-5 h-5 me-3" />
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200 space-y-4">
        <LanguageSwitcher />
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center min-w-0">
            <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
              {(user?.name && user.name.charAt(0).toUpperCase()) ||
                (user?.email && user.email.charAt(0).toUpperCase()) ||
                'U'}
            </div>
            <div className="ms-3 min-w-0">
              <p className="text-sm font-medium text-gray-700 truncate">
                {user?.name || user?.email || t('common.user', 'User Name')}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={signOut}
            className="text-xs text-red-600 hover:text-red-700 font-medium flex-shrink-0 whitespace-nowrap"
          >
            {t('auth.logout', 'Logout')}
          </button>
        </div>
      </div>
    </aside>
  );
};
