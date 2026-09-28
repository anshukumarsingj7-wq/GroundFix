import React, { createContext, useContext, useState, useEffect } from 'react';
import { getTranslation, SUPPORTED_LANGUAGES } from '../data/translations';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    return localStorage.getItem('groundfix_lang') || 'en';
  });

  const setLanguage = (langCode) => {
    if (['en', 'hi', 'kn'].includes(langCode)) {
      setLanguageState(langCode);
      localStorage.setItem('groundfix_lang', langCode);
    }
  };

  const t = (path) => {
    return getTranslation(path, language);
  };

  const currentLanguage = SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, supportedLanguages: SUPPORTED_LANGUAGES, currentLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
