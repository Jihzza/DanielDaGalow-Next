      // components/common/LanguageSwitcher.jsx
      // (Assuming this is the correct path in your new project)
      "use client"; // Directive is essential for hooks and localStorage

      import React, { useState, useRef, useEffect } from 'react';
      import { useTranslation } from 'react-i18next'; // Ensure i18n is configured globally

      const LanguageSwitcher = () => {
        const { i18n } = useTranslation();
        const [dropdownOpen, setDropdownOpen] = useState(false);
        const dropdownRef = useRef(null);

        // Define available languages (ensure codes match your i18n setup)
        const languages = [
          { code: 'en', name: 'English', flag: '🇺🇸' },
          { code: 'es', name: 'Español', flag: '🇪🇸' },
          { code: 'pt', name: 'Português', flag: '🇵🇹' },
          { code: 'pt-br', name: 'Português (BR)', flag: '��' },
          // Add 'pt-BR' if you have specific translations for it
          // { code: 'pt-BR', name: 'Português (BR)', flag: '🇧🇷' },
        ];

        // Find the currently active language object
        const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

        // Click outside handler (remains the same)
        useEffect(() => {
          const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
              setDropdownOpen(false);
            }
          };
          if (dropdownOpen) { // Only add listener when dropdown is open
            document.addEventListener('mousedown', handleClickOutside);
          }
          return () => {
            document.removeEventListener('mousedown', handleClickOutside);
          };
        }, [dropdownOpen]); // Re-run when dropdownOpen changes

        // Change language handler (remains the same)
        const changeLanguage = (code) => {
          i18n.changeLanguage(code);
          setDropdownOpen(false);
          // localStorage usage is fine in a Client Component
          localStorage.setItem('preferredLanguage', code);
        };

        return (
          <div className="relative" ref={dropdownRef}>
            {/* Button to toggle dropdown */}
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-1 bg-oxfordBlue text-white px-3 py-1 rounded-lg hover:bg-opacity-90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-darkGold focus:ring-offset-black" // Added focus style
              aria-haspopup="listbox" // Accessibility
              aria-expanded={dropdownOpen} // Accessibility
            >
              <span className="text-lg" aria-hidden="true">{currentLanguage.flag}</span>
              {/* Hide text on smaller screens if needed via Tailwind classes */}
              <span className="hidden sm:inline text-sm">{currentLanguage.name}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Dropdown List */}
            {dropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg z-50 overflow-hidden animate-fade-in border border-gray-200" // Added border
                role="listbox" // Accessibility
              >
                {languages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => changeLanguage(language.code)}
                    className={`flex items-center w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none focus:bg-gray-100 ${ // Added focus style
                      i18n.language === language.code ? 'bg-gray-100 font-semibold' : '' // Highlight current language
                    }`}
                    role="option" // Accessibility
                    aria-selected={i18n.language === language.code} // Accessibility
                  >
                    <span aria-hidden="true" className="mr-2">{language.flag}</span>
                    <span>{language.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      };

      export default LanguageSwitcher;
      