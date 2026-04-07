"use client";

import { useLanguage } from '@/contexts/LanguageContext';
import { Languages } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-surface border-2 border-lime/30 rounded-full px-4 py-2 flex items-center gap-2 hover:bg-surface-elevated transition-colors"
        type="button"
      >
        <Languages className="w-4 h-4 text-lime" />
        <span className="text-foreground text-sm font-semibold uppercase">
          {language}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full right-0 mt-2 bg-surface border-2 border-lime/30 rounded-lg shadow-lg overflow-hidden min-w-[120px]"
          >
            <button
              onClick={() => {
                setLanguage('kz');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                language === 'kz'
                  ? 'bg-lime text-background font-bold'
                  : 'text-foreground hover:bg-surface-elevated'
              }`}
              type="button"
            >
              🇰🇿 Қазақша
            </button>
            <button
              onClick={() => {
                setLanguage('en');
                setIsOpen(false);
              }}
              className={`w-full px-4 py-3 text-left text-sm transition-colors ${
                language === 'en'
                  ? 'bg-lime text-background font-bold'
                  : 'text-foreground hover:bg-surface-elevated'
              }`}
              type="button"
            >
              🇬🇧 English
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
