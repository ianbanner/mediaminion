import React, { useState } from 'react';

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
  onSignOut: () => void;
  userEmail: string;
  isAdmin: boolean;
  templateCount: number;
  articleTemplateCount: number;
  showMobileMenu: boolean;
  onToggleMobileMenu: () => void;
  setShowMobileMenu: (show: boolean) => void;
}

const NavItem: React.FC<{
  label: string;
  viewName: string;
  currentView: string;
  onClick: () => void;
  children: React.ReactNode;
  badge?: React.ReactNode;
}> = ({ label, viewName, currentView, onClick, children, badge }) => {
  const isActive = currentView === viewName;
  
  return (
    <li>
      <button
        onClick={onClick}
        className={`w-full flex items-center rounded-md transition-colors duration-200 p-2 text-sm ${
          isActive
            ? 'bg-teal-500/20 text-teal-300'
            : `text-gray-400 hover:bg-slate-700/50 hover:text-white`
        }`}
        aria-current={isActive ? 'page' : undefined}
      >
        {children}
        <span className={`ml-3 font-medium flex-grow text-left`}>{label}</span>
        {badge && <span className="ml-auto text-xs font-semibold px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full">{badge}</span>}
      </button>
    </li>
  );
};

const AccordionItem: React.FC<{
    title: string;
    icon: React.ReactNode;
    children: React.ReactNode;
    isOpen: boolean;
    onToggle: () => void;
}> = ({ title, icon, children, isOpen, onToggle }) => (
    <div>
        <button 
            onClick={onToggle}
            className="w-full flex items-center p-3 text-left text-gray-200 hover:bg-slate-700/50 rounded-md transition-colors"
        >
            {icon}
            <span className="ml-3 font-semibold">{title}</span>
            <svg className={`ml-auto h-5 w-5 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
        </button>
        {isOpen && (
            <ul className="pl-6 py-2 space-y-1 border-l-2 border-slate-700 ml-4">
                {children}
            </ul>
        )}
    </div>
);


const Sidebar: React.FC<SidebarProps> = ({ 
    view, setView, onSignOut, userEmail, isAdmin, templateCount, 
    articleTemplateCount, showMobileMenu, onToggleMobileMenu, setShowMobileMenu 
}) => {
    const [openMenu, setOpenMenu] = useState('posts');
    const handleMenuToggle = (menu: string) => {
        setOpenMenu(prev => prev === menu ? '' : menu);
    };

  return (
    <div className="relative w-72 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col flex-shrink-0">
      <div className="mb-8">
         <h2 
            className="text-xl font-bold text-white flex items-start cursor-pointer group"
            onClick={onToggleMobileMenu}
            title="Open Quick Actions Menu"
          >
            <svg className="w-8 h-8 mr-3 text-teal-400 flex-shrink-0 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            <div>
              Social Media Minion
              <span className="block text-sm font-normal text-gray-400 truncate" title={userEmail}>{userEmail}</span>
            </div>
         </h2>
      </div>
      
      <nav className="flex-1 space-y-2">
            <AccordionItem title="Work on Posts" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>} isOpen={openMenu === 'posts'} onToggle={() => handleMenuToggle('posts')}>
                <NavItem label="Generate Posts" viewName="generate-posts" currentView={view} onClick={() => setView('generate-posts')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Quick Post" viewName="quick-post" currentView={view} onClick={() => setView('quick-post')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Posts Queue" viewName="ayrshare-queue" currentView={view} onClick={() => setView('ayrshare-queue')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Posts Log" viewName="ayrshare-log" currentView={view} onClick={() => setView('ayrshare-log')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Post Scheduler" viewName="scheduler" currentView={view} onClick={() => setView('scheduler')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Template Library" viewName="template-library" currentView={view} onClick={() => setView('template-library')} badge={templateCount}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Post Researcher" viewName="researcher" currentView={view} onClick={() => setView('researcher')}><div className="w-5 h-5"/></NavItem>
            </AccordionItem>

            <AccordionItem title="Work on Articles" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} isOpen={openMenu === 'articles'} onToggle={() => handleMenuToggle('articles')}>
                <NavItem label="Generate Headlines" viewName="generate-headlines" currentView={view} onClick={() => setView('generate-headlines')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Generate Articles" viewName="generate-articles" currentView={view} onClick={() => setView('generate-articles')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Quick Article" viewName="quick-article" currentView={view} onClick={() => setView('quick-article')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Article Templates" viewName="article-template-library" currentView={view} onClick={() => setView('article-template-library')} badge={articleTemplateCount}><div className="w-5 h-5"/></NavItem>
            </AccordionItem>

            <AccordionItem title="Admin" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>} isOpen={openMenu === 'admin'} onToggle={() => handleMenuToggle('admin')}>
                <NavItem label="Persona" viewName="persona" currentView={view} onClick={() => setView('persona')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Backup / Restore" viewName="backup-restore" currentView={view} onClick={() => setView('backup-restore')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="Settings" viewName="settings" currentView={view} onClick={() => setView('settings')}><div className="w-5 h-5"/></NavItem>
                {isAdmin && <NavItem label="Admin Panel" viewName="admin" currentView={view} onClick={() => setView('admin')}><div className="w-5 h-5"/></NavItem>}
            </AccordionItem>
            
            <AccordionItem title="Reference" icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>} isOpen={openMenu === 'reference'} onToggle={() => handleMenuToggle('reference')}>
                <NavItem label="Posting Guides" viewName="posting-guides" currentView={view} onClick={() => setView('posting-guides')}><div className="w-5 h-5"/></NavItem>
                <NavItem label="New User Guide" viewName="new-user-guide" currentView={view} onClick={() => setView('new-user-guide')}><div className="w-5 h-5"/></NavItem>
            </AccordionItem>
      </nav>
      
      <div className="mt-auto">
        <NavItem label="Sign Out" viewName="signout" currentView={view} onClick={onSignOut}>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
        </NavItem>
      </div>
    </div>
  );
};

export default Sidebar;
