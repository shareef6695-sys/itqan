import React from 'react';
import { useTranslation } from 'react-i18next';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ar' : 'en';
    i18n.changeLanguage(newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  return (
    <button
      onClick={toggleLanguage}
      className="p-2 rounded-md hover:bg-gray-100 text-gray-600 transition-colors flex items-center gap-2 border border-gray-200"
      title={i18n.language === 'en' ? 'Switch to Arabic' : 'Switch to English'}
    >
      <span className="font-bold text-sm">{i18n.language === 'en' ? 'AR' : 'EN'}</span>
      <span className="text-xs text-gray-500 hidden sm:inline">{i18n.language === 'en' ? 'العربية' : 'English'}</span>
    </button>
  );
};
