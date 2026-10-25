import React, { useState, useRef, useEffect } from 'react';
import { Languages, Check, ChevronDown } from 'lucide-react';
import { useLanguage } from './LanguageContext';
import { SupportedLanguage } from './types';

interface LanguageSelectorProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  variant = 'compact',
  className = '',
}) => {
  const { language, setLanguage, currentLanguageOption, supportedLanguages } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSelect = (code: SupportedLanguage) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        title="Select Language / भाषा बदला"
        className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold glass-panel border border-sunset-border hover:border-sunset-accent hover:bg-sunset-bg/80 text-sunset-text transition-all duration-200 shadow-sm"
      >
        <Languages className="w-4 h-4 text-sunset-accent stroke-[2.2]" />
        <span className="flex items-center gap-1.5">
          <span className="text-sm leading-none">{currentLanguageOption.flag}</span>
          <span className="font-medium tracking-wide">{currentLanguageOption.nativeName}</span>
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-sunset-muted transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 rounded-2xl glass-panel border border-sunset-border p-1.5 shadow-2xl z-50 bg-sunset-surface/95 backdrop-blur-xl animate-fade-in origin-top-right">
          <div className="px-3 py-2 border-b border-sunset-border/60 mb-1">
            <p className="text-[11px] font-bold uppercase tracking-wider text-sunset-accent">
              Choose Language / भाषा
            </p>
            <p className="text-[10px] text-sunset-muted">
              Select your preferred browsing language
            </p>
          </div>

          <div className="space-y-1">
            {supportedLanguages.map(item => {
              const isActive = item.code === language;
              return (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelect(item.code)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-sunset-accent/15 text-sunset-accent font-semibold border border-sunset-accent/30 shadow-sm'
                      : 'text-sunset-text hover:bg-sunset-bg/80 hover:text-sunset-accent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className="text-base leading-none">{item.flag}</span>
                    <div className="flex flex-col">
                      <span className="leading-tight text-xs font-semibold">{item.nativeName}</span>
                      <span className="text-[10px] text-sunset-muted font-normal">
                        {item.name} • {item.sublabel}
                      </span>
                    </div>
                  </div>

                  {isActive && <Check className="w-4 h-4 text-sunset-accent stroke-[2.5]" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
