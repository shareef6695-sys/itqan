import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

export const FinanceHeader: React.FC = () => {
  const { t } = useTranslation();

  const tabs = [
    { name: t('nav.dashboard'), to: '/finance', end: true },
    { name: t('nav.glAccounts'), to: '/finance/gl-accounts', end: false },
    { name: t('nav.expenses'), to: '/finance/expenses', end: false },
    { name: t('nav.transactions'), to: '/finance/transactions', end: false },
  ];

  return (
    <div className="mb-8 border-b border-gray-200">
      <nav className="-mb-px flex space-x-8 rtl:space-x-reverse" aria-label="Tabs">
        {tabs.map((tab) => (
          <NavLink
            key={tab.name}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              clsx(
                isActive
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
                'whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm'
              )
            }
          >
            {tab.name}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
