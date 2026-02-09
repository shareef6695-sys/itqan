import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
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
  name: string;
  to?: string;
  icon: React.ElementType;
  children?: { name: string; to: string; icon?: React.ElementType }[];
}

const navItems: NavItem[] = [
  { name: 'Dashboard', to: '/', icon: LayoutDashboard },
  { 
    name: 'Sales', 
    icon: DollarSign,
    children: [
      { name: 'Clients & Prospects', to: '/sales/clients', icon: Users },
      { name: 'Quotations & Estimates', to: '/sales/quotations', icon: FileText },
      { name: 'Proforma Invoices', to: '/sales/proforma-invoices', icon: FileText },
      { name: 'Invoices', to: '/sales/invoices', icon: FileText },
      { name: 'Payment Receipts', to: '/sales/payment-receipts', icon: Receipt },
      { name: 'Sales Orders', to: '/sales/sales-orders', icon: ShoppingCart },
      { name: 'Delivery Challans', to: '/sales/delivery-challans', icon: Truck },
      { name: 'Credit Notes', to: '/sales/credit-notes', icon: RotateCcw },
    ]
  },
  { 
    name: 'Purchase', 
    icon: ShoppingBag,
    children: [
      { name: 'Vendors', to: '/purchase/vendors', icon: Users },
      { name: 'Purchase Orders', to: '/purchase/orders', icon: ShoppingCart },
      { name: 'Bills', to: '/purchase/bills', icon: FileText },
      { name: 'Debit Notes', to: '/purchase/debit-notes', icon: RotateCcw },
      { name: 'Payments Made', to: '/purchase/payments-made', icon: CreditCard },
    ]
  },
  { name: 'Finance', to: '/finance', icon: Receipt },
  { name: 'Inventory', to: '/inventory', icon: Package },
  { name: 'Settings', to: '/settings', icon: Settings },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['Sales']);

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => 
      prev.includes(name) 
        ? prev.filter(item => item !== name)
        : [...prev, name]
    );
  };

  const isChildActive = (children: { to: string }[]) => {
    return children.some(child => location.pathname.startsWith(child.to));
  };

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col overflow-y-auto">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-indigo-600">RefrensClone</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <div key={item.name}>
            {item.children ? (
              <>
                <button
                  onClick={() => toggleMenu(item.name)}
                  className={clsx(
                    'w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                    isChildActive(item.children) || expandedMenus.includes(item.name)
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  )}
                >
                  <div className="flex items-center">
                    <item.icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                  {expandedMenus.includes(item.name) ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </button>
                {expandedMenus.includes(item.name) && (
                  <div className="ml-4 mt-1 space-y-1 pl-4 border-l border-indigo-200">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.name}
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
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </NavLink>
            )}
          </div>
        ))}
      </nav>
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
            U
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">User Name</p>
            <p className="text-xs text-gray-500">user@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
