"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations, Language, TranslationKey } from '@/lib/translations';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: TranslationKey, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('kz'); // Default to Kazakh

  // Load saved language preference
  useEffect(() => {
    const saved = localStorage.getItem('synaq_language');
    if (saved === 'en' || saved === 'kz') {
      setLanguageState(saved);
    }
  }, []);

  // Save language preference
  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('synaq_language', lang);
  };

  // Translation function
  const t = (key: TranslationKey, params?: Record<string, string>): string => {
    let text = translations[language][key] || key;

    // Replace parameters in text
    if (params) {
      Object.entries(params).forEach(([paramKey, value]) => {
        text = text.replace(`{${paramKey}}`, value);
      });
    }

    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
