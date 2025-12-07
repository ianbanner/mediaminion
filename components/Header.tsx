
import React from 'react';
import ThemeToggle from './ThemeToggle.tsx';

interface HeaderProps {
  onLoginClick: () => void;
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


const Header: React.FC<HeaderProps> = ({ onLoginClick, onNavigate, currentPage, theme, toggleTheme }) => {
  return (
    <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b border-gray-200 dark:border-slate-800/50 sticky top-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50 transition-colors duration-200">
      <div className="flex items-center cursor-pointer" onClick={() => onNavigate('home')}>
        <svg className="w-8 h-8 mr-2 text-teal-500 dark:text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        <div className="flex flex-col">
            <span className="text-xl font-bold leading-none text-gray-900 dark:text-white">Social Media Minion</span>
            <span className="text-[10px] text-gray-500 font-mono mt-1">vImagine 04.11</span>
        </div>
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
