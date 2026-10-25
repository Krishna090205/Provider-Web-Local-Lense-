import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { SupportedLanguage, LanguageOption, SUPPORTED_LANGUAGES, TranslationDictionary } from './types';
import { en } from './translations/en';
import { mr } from './translations/mr';
import { hi } from './translations/hi';
import { gu } from './translations/gu';

const LANGUAGE_STORAGE_KEY = 'locallens_language_v1';

const translations: Record<SupportedLanguage, TranslationDictionary> = {
  en,
  mr,
  hi,
  gu,
};

interface LanguageContextType {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (path: string, fallbackOrParams?: string | Record<string, string | number>, maybeParams?: Record<string, string | number>) => string;
  currentLanguageOption: LanguageOption;
  supportedLanguages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const stored = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (stored && (stored === 'en' || stored === 'mr' || stored === 'hi' || stored === 'gu')) {
        return stored as SupportedLanguage;
      }
      // Check browser language
      if (typeof navigator !== 'undefined' && navigator.language) {
        const navLang = navigator.language.toLowerCase();
        if (navLang.startsWith('mr')) return 'mr';
        if (navLang.startsWith('hi')) return 'hi';
        if (navLang.startsWith('gu')) return 'gu';
      }
    } catch {}
    return 'en';
  });

  const setLanguage = useCallback((newLang: SupportedLanguage) => {
    setLanguageState(newLang);
    try {
      localStorage.setItem(LANGUAGE_STORAGE_KEY, newLang);
    } catch (e) {
      console.warn('Failed to persist language preference', e);
    }
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  // Nested translation resolver with parameter interpolation (e.g. {count})
  const t = useCallback((
    path: string,
    fallbackOrParams?: string | Record<string, string | number>,
    maybeParams?: Record<string, string | number>
  ): string => {
    const activeDict = translations[language] || translations.en;
    const fallbackDict = translations.en;

    let fallback: string | undefined;
    let params: Record<string, string | number> | undefined;

    if (typeof fallbackOrParams === 'string') {
      fallback = fallbackOrParams;
      params = maybeParams;
    } else if (typeof fallbackOrParams === 'object' && fallbackOrParams !== null) {
      params = fallbackOrParams;
    }

    const resolve = (obj: any, keys: string[]) => {
      let current = obj;
      for (const key of keys) {
        if (!current || typeof current !== 'object') return undefined;
        current = current[key];
      }
      return typeof current === 'string' ? current : undefined;
    };

    const keys = path.split('.');
    let result = resolve(activeDict, keys);
    if (result === undefined) {
      result = resolve(fallbackDict, keys);
    }

    let finalStr = result !== undefined ? result : (fallback ?? path);

    if (params) {
      for (const [paramKey, paramVal] of Object.entries(params)) {
        finalStr = finalStr.split(`{${paramKey}}`).join(String(paramVal));
      }
    }

    return finalStr;
  }, [language]);

  const currentLanguageOption =
    SUPPORTED_LANGUAGES.find(l => l.code === language) || SUPPORTED_LANGUAGES[0];

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
        currentLanguageOption,
        supportedLanguages: SUPPORTED_LANGUAGES,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
};
