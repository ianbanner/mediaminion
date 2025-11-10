import React from 'react';

interface HeaderProps {
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const NavLink: React.FC<{ page: string; currentPage: string; onNavigate: (page: string) => void; children: React.ReactNode }> = ({ page, currentPage, onNavigate, children }) => {
    const isActive = currentPage === page;
    return (
        <button
            onClick={() => onNavigate(page)}
            className={`transition-colors ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'}`}
        >
            {children}
        </button>
    );
};


const Header: React.FC<HeaderProps> = ({ onLoginClick, onNavigate, currentPage }) => {
  return (
    <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-800/50 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
      <div className="text-xl font-bold flex items-center cursor-pointer">
        <svg className="w-8 h-8 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        <button onClick={() => onNavigate('home')}>Social Media Minion</button>
      </div>
      <nav className="hidden md:flex items-center space-x-6">
        <NavLink page="home" currentPage={currentPage} onNavigate={onNavigate}>Features</NavLink>
        <NavLink page="pricing" currentPage={currentPage} onNavigate={onNavigate}>Pricing</NavLink>
        <NavLink page="questions" currentPage={currentPage} onNavigate={onNavigate}>Questions</NavLink>
      </nav>
      <button onClick={onLoginClick} className="px-5 py-2 font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
        Log In
      </button>
    </header>
  );
};

export default Header;
