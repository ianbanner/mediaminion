

import React from 'react';

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
  onSignOut: () => void;
  userEmail: string;
  isAdmin: boolean;
  templateCount: number;
  articleTemplateCount: number;
}

const NavItem: React.FC<{
  label: string;
  viewName?: string;
  currentView?: string;
  onClick: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}> = ({ label, viewName, currentView, onClick, children, badge }) => {
  const isActive = currentView === viewName;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center rounded-md transition-colors duration-200 p-3 ${
        isActive
          ? 'bg-teal-500/20 text-teal-300'
          : `text-gray-300 hover:bg-slate-700/50 hover:text-white`
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span className={`ml-3 font-semibold flex-grow text-left`}>{label}</span>
      {badge && <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">{badge}</span>}
    </button>
  );
};

const NavHeader: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <h3 className="px-3 pt-4 pb-2 text-xs font-bold uppercase text-slate-500 tracking-wider">
    {children}
  </h3>
);


const Sidebar: React.FC<SidebarProps> = ({ view, setView, onSignOut, userEmail, isAdmin, templateCount, articleTemplateCount }) => {
  return (
    <div className="w-72 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col flex-shrink-0">
      <div className="flex-grow">
        <div className="mb-8">
           <h2 className="text-xl font-bold text-white flex items-start">
              <svg className="w-8 h-8 mr-3 text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              <div>
                Social Media Minion
                <span className="block text-sm font-normal text-gray-400 truncate" title={userEmail}>{userEmail}</span>
              </div>
           </h2>
        </div>
        
        <nav className="flex flex-col space-y-1">
            <NavHeader>Posts</NavHeader>
            <NavItem label="Generate Posts" viewName="generate-posts" currentView={view} onClick={() => setView('generate-posts')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </NavItem>

            <NavItem label="Posts Queue" viewName="ayrshare-queue" currentView={view} onClick={() => setView('ayrshare-queue')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
            </NavItem>
            
            <NavItem label="Posts Log" viewName="ayrshare-log" currentView={view} onClick={() => setView('ayrshare-log')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </NavItem>

            <NavItem label="Post Scheduler" viewName="scheduler" currentView={view} onClick={() => setView('scheduler')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            </NavItem>

             <NavItem label="Posts Template Library" viewName="template-library" currentView={view} onClick={() => setView('template-library')} badge={templateCount}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
            </NavItem>

            <NavItem label="Post Researcher" viewName="researcher" currentView={view} onClick={() => setView('researcher')}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </NavItem>

            <NavHeader>Articles</NavHeader>
            <NavItem label="Generate Headlines" viewName="generate-headlines" currentView={view} onClick={() => setView('generate-headlines')}>
                 <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
            </NavItem>

            <NavItem label="Generate Articles" viewName="generate-articles" currentView={view} onClick={() => setView('generate-articles')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            </NavItem>
            
            <NavItem label="Article Template Library" viewName="article-template-library" currentView={view} onClick={() => setView('article-template-library')} badge={articleTemplateCount}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            </NavItem>

            <NavHeader>Admin</NavHeader>
            <NavItem label="Persona" viewName="persona" currentView={view} onClick={() => setView('persona')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
            </NavItem>
            <NavItem label="Backup / Restore" viewName="backup-restore" currentView={view} onClick={() => setView('backup-restore')}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
            </NavItem>
            <NavItem 
                label="Settings" 
                viewName="settings" 
                currentView={view} 
                onClick={() => setView('settings')}
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c-1.756.426-1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573" /></svg>
            </NavItem>
            {isAdmin && (
                <NavItem 
                    label="Admin Panel" 
                    viewName="admin" 
                    currentView={view} 
                    onClick={() => setView('admin')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573" /></svg>
                </NavItem>
            )}

            <NavHeader>Labs</NavHeader>
            <NavItem label="Mobile Companion" viewName="mobile-companion" currentView={view} onClick={() => setView('mobile-companion')}>
               <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
            </NavItem>

            <div className="pt-4 border-t border-slate-700/50">
                <button onClick={onSignOut} className="w-full flex items-center p-3 text-red-400 hover:bg-red-900/20 hover:text-red-300 rounded-md transition-colors duration-200">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    <span className="ml-3 font-semibold text-left">Sign Out</span>
                </button>
            </div>
        </nav>
      </div>
    </div>
  );
};

export default Sidebar;