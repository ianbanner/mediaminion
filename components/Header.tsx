
import React, { useState, useRef, useEffect } from 'react';
import ThemeToggle from './ThemeToggle.tsx';

interface HeaderProps {
  onLoginClick: () => void;
  onQuickLogin: (email: string) => void;
  onNavigate: (page: string) => void;
  currentPage: string;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
}

const NavLink: React.FC<{ page: string; currentPage: string; onNavigate: (page: string) => void; children: React.ReactNode }> = ({ page, currentPage, onNavigate, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`transition-colors ${isActive ? 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
        >
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ onLoginClick, onQuickLogin, onNavigate, currentPage, theme, toggleTheme }) => {
  const [showQuickMenu, setShowQuickMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowQuickMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-200 dark:border-slate-800/50 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 transition-colors duration-200">
      <div className="flex items-center relative" ref={menuRef}>
        <div 
          className="flex items-center cursor-pointer group" 
          onClick={() => setShowQuickMenu(!showQuickMenu)}
          title="Quick Access Menu"
        >
          <svg className="w-8 h-8 mr-2 text-teal-500 dark:text-teal-400 group-hover:text-teal-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
          <div className="flex flex-col" onClick={(e) => { e.stopPropagation(); onNavigate('home'); }}>
              <span className="text-xl font-bold leading-none text-gray-900 dark:text-white">Social Media Minion</span>
              <span className="text-[10px] text-gray-500 font-mono mt-1">vImagine 04.11</span>
          </div>
        </div>

        {/* Quick Login Dropdown */}
        {showQuickMenu && (
          <div className="absolute top-full left-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl shadow-2xl z-[60] animate-fade-in-fast py-2">
            <div className="px-4 py-2 border-b border-gray-100 dark:border-slate-700 mb-1">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Quick Access</p>
            </div>
            <button 
              onClick={() => onQuickLogin('dave@bigagility.com')}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Access as Dave
            </button>
            <button 
              onClick={() => onQuickLogin('richard@bigagility.com')}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-teal-50 dark:hover:bg-teal-900/30 hover:text-teal-600 dark:hover:text-teal-400 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
              Access as Richard
            </button>
          </div>
        )}
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        <div className="flex items-center space-x-6 mr-6">
            <NavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>Features</NavLink>
            <NavLink page="pricing" currentPage={currentPage} onNavigate={onNavigate}>Pricing</NavLink>
            <NavLink page="questions" currentPage={currentPage} onNavigate={onNavigate}>Questions</NavLink>
        </div>
        <div className="flex items-center gap-4">
            <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            <button onClick={onLoginClick} className="px-5 py-2 font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg transition-colors cursor-pointer">
                Log In
            </button>
        </div>
      </nav>
      {/* Mobile Login Button (Visible on small screens) */}
      <div className="md:hidden flex items-center gap-3">
          <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
          <button onClick={onLoginClick} className="px-4 py-2 font-semibold bg-gray-200 hover:bg-gray-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-900 dark:text-white rounded-lg transition-colors cursor-pointer text-sm">
            Log In
          </button>
      </div>
    </header>
  );
};

export default Header;
