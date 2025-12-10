
import React, { useState, useEffect } from 'react';
import ThemeToggle from './ThemeToggle.tsx';
import { UserPermissions } from '../types.ts';

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
  hasGeneratedArticle: boolean;
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  permissions?: UserPermissions;
  personaName?: string;
}

const NavItem: React.FC<{ label: string; active: boolean; onClick: () => void; icon?: React.ReactNode; indent?: boolean; badge?: number | string; }> = ({ label, active, onClick, icon, indent = false, badge }) => (
  <button onClick={onClick} className={`w-full text-left px-4 py-2 rounded-lg transition-all duration-200 flex items-center justify-between group ${active ? 'bg-teal-600 text-white shadow-md' : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-900 dark:hover:text-gray-200'} ${indent ? 'ml-8 w-[calc(100%-2rem)] text-sm' : ''}`}>
    <div className="flex items-center">{icon && <span className={`mr-3 ${active ? 'text-white' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>{icon}</span>}<span>{label}</span></div>
    {badge !== undefined && (<span className={`text-xs font-bold px-2 py-0.5 rounded-full ${active ? 'bg-teal-800 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>{badge}</span>)}
  </button>
);

const SidebarSection: React.FC<{ title: string; isOpen: boolean; onToggle: () => void; children: React.ReactNode; }> = ({ title, isOpen, onToggle, children }) => (
  <div className="mb-1">
    <button onClick={onToggle} type="button" className={`w-full flex items-center justify-between px-4 py-3 text-xs font-bold uppercase tracking-wider transition-colors rounded-lg ${isOpen ? 'text-gray-900 dark:text-white bg-gray-100 dark:bg-slate-800' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-800/50'}`}>
      <span>{title}</span>
      <svg className={`w-4 h-4 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'}`}><div className="space-y-1 pl-2 pb-2">{children}</div></div>
  </div>
);

const Sidebar: React.FC<SidebarProps> = ({ view, setView, onSignOut, userEmail, isAdmin, templateCount, articleTemplateCount, showMobileMenu, setShowMobileMenu, hasGeneratedArticle, theme, toggleTheme, permissions, personaName }) => {
  const [openSection, setOpenSection] = useState<string | null>('posts');

  useEffect(() => {
    if (['generation', 'queue', 'scheduler', 'templates', 'researcher'].includes(view)) setOpenSection('posts');
    else if (['headline-generator', 'generate-articles-panel', 'refine-article', 'article-templates', 'recycle-article'].includes(view)) setOpenSection('articles');
    else if (['audio-script', 'audio-script-archive', 'podcast-plan', 'podcast-plan-archive'].includes(view)) setOpenSection('audio');
    else if (['biblical-check', 'niche-finder', 'media-summary', 'chapter-rewrite'].includes(view)) setOpenSection('tools');
    else if (['posting-guides', 'checklist', 'new-user-guide'].includes(view)) setOpenSection('guides');
    else if (['persona', 'settings', 'backup-restore', 'firestore-migration', 'admin'].includes(view)) setOpenSection('admin');
  }, [view]);

  const toggleSection = (section: string) => setOpenSection(prev => prev === section ? null : section);
  const handleNav = (newView: string) => { setView(newView); setShowMobileMenu(false); };

  const perms = permissions || { canViewPosts: true, canViewArticles: true, canViewAudio: true, canViewBiblicalCheck: false, canViewNicheFinder: false, canViewMediaSummary: false, canViewChapterRewrite: false };
  const showToolsSection = perms.canViewBiblicalCheck || perms.canViewNicheFinder || perms.canViewMediaSummary || perms.canViewChapterRewrite;

  return (
    <>
      {showMobileMenu && (<div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden backdrop-blur-sm" onClick={() => setShowMobileMenu(false)} />)}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-slate-800 transform transition-transform duration-300 ease-in-out flex flex-col md:relative md:translate-x-0 ${showMobileMenu ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="p-6 border-b border-gray-200 dark:border-slate-800 flex-shrink-0">
            <div className="flex justify-between items-start">
                <div className="flex items-center font-bold text-xl text-gray-900 dark:text-white">
                    <svg className="w-8 h-8 mr-3 text-teal-500 dark:text-teal-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
                    <div className="flex flex-col"><span>Social Media Minion</span><span className="text-[10px] text-gray-500 font-mono font-normal mt-0.5">vImagine 04.11</span></div>
                </div>
                <button onClick={() => setShowMobileMenu(false)} className="md:hidden text-gray-400 hover:text-gray-900 dark:hover:text-white mt-1"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
            </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-2 custom-scrollbar">
            {perms.canViewPosts && (
                <SidebarSection title="Work on Posts" isOpen={openSection === 'posts'} onToggle={() => toggleSection('posts')}>
                    <NavItem label="Generate Posts" active={view === 'generation'} onClick={() => handleNav('generation')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} />
                    <NavItem label="Posts Queue" active={view === 'queue'} onClick={() => handleNav('queue')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} />
                    <NavItem label="Post Scheduler" active={view === 'scheduler'} onClick={() => handleNav('scheduler')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>} />
                    <NavItem label="Template Library" active={view === 'templates'} onClick={() => handleNav('templates')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>} badge={templateCount} />
                    <NavItem label="Post Researcher" active={view === 'researcher'} onClick={() => handleNav('researcher')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />
                </SidebarSection>
            )}
            {perms.canViewArticles && (
                <SidebarSection title="Work on Articles" isOpen={openSection === 'articles'} onToggle={() => toggleSection('articles')}>
                    <NavItem label="Generate Ideas" active={view === 'headline-generator'} onClick={() => handleNav('headline-generator')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>} />
                    <NavItem label="Generate Articles" active={view === 'generate-articles-panel'} onClick={() => handleNav('generate-articles-panel')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>} />
                    {hasGeneratedArticle && <NavItem label="Refine Article" active={view === 'refine-article'} onClick={() => handleNav('refine-article')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>} indent />}
                    <NavItem label="Article Templates" active={view === 'article-templates'} onClick={() => handleNav('article-templates')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 14v3m4-3v3m4-3v3M3 21h18M3 10h18M3 7l9-4 9 4M4 10h16v11H4V10z" /></svg>} badge={articleTemplateCount} />
                    <NavItem label="Recycle Article" active={view === 'recycle-article'} onClick={() => handleNav('recycle-article')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} />
                </SidebarSection>
            )}
            {perms.canViewAudio && (
                <SidebarSection title="Work on Audio" isOpen={openSection === 'audio'} onToggle={() => toggleSection('audio')}>
                    <NavItem label="Audio Script Creation" active={view === 'audio-script'} onClick={() => handleNav('audio-script')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>} />
                    <NavItem label="Audio Script Archive" active={view === 'audio-script-archive'} onClick={() => handleNav('audio-script-archive')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} indent />
                    <NavItem label="Podcast Plan Creation" active={view === 'podcast-plan'} onClick={() => handleNav('podcast-plan')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" /></svg>} />
                    <NavItem label="Podcast Plan Archive" active={view === 'podcast-plan-archive'} onClick={() => handleNav('podcast-plan-archive')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>} indent />
                </SidebarSection>
            )}
            {showToolsSection && (
                <SidebarSection title="Tools" isOpen={openSection === 'tools'} onToggle={() => toggleSection('tools')}>
                    {perms.canViewBiblicalCheck && <NavItem label="Biblical Soundness Check" active={view === 'biblical-check'} onClick={() => handleNav('biblical-check')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />}
                    {perms.canViewNicheFinder && <NavItem label="Find My Niche" active={view === 'niche-finder'} onClick={() => handleNav('niche-finder')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>} />}
                    {perms.canViewMediaSummary && <NavItem label="Media Summary" active={view === 'media-summary'} onClick={() => handleNav('media-summary')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>} />}
                    {perms.canViewChapterRewrite && <NavItem label="Chapter Rewrite" active={view === 'chapter-rewrite'} onClick={() => handleNav('chapter-rewrite')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>} />}
                </SidebarSection>
            )}
            <SidebarSection title="Guides" isOpen={openSection === 'guides'} onToggle={() => toggleSection('guides')}>
                <NavItem label="New User Guide" active={view === 'new-user-guide'} onClick={() => handleNav('new-user-guide')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>} />
                <NavItem label="Set Up Actions" active={view === 'checklist'} onClick={() => handleNav('checklist')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>} />
                <NavItem label="Posting Guides" active={view === 'posting-guides'} onClick={() => handleNav('posting-guides')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>} />
            </SidebarSection>
            <SidebarSection title="Admin" isOpen={openSection === 'admin'} onToggle={() => toggleSection('admin')}>
                <NavItem label="Persona" active={view === 'persona'} onClick={() => handleNav('persona')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>} />
                <NavItem label="Settings" active={view === 'settings'} onClick={() => handleNav('settings')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>} />
                <NavItem label="Backup / Restore" active={view === 'backup-restore'} onClick={() => handleNav('backup-restore')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>} />
                <NavItem label="Cloud Sync" active={view === 'firestore-migration'} onClick={() => handleNav('firestore-migration')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3 3m0 0l-3 3m3-3v12" /></svg>} />
                {isAdmin && <NavItem label="Admin Panel" active={view === 'admin'} onClick={() => handleNav('admin')} icon={<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>} />}
            </SidebarSection>
        </nav>

        <div className="p-6 border-t border-gray-200 dark:border-slate-800 flex-shrink-0">
            {theme && toggleTheme && (<div className="mb-4 flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">Appearance</span><ThemeToggle theme={theme} toggleTheme={toggleTheme} className="bg-gray-100 dark:bg-slate-800" /></div>)}
            <div className="flex items-center mb-4">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-400 to-teal-400 flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-teal-500/30">
                    {userEmail.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 overflow-hidden w-full">
                    <p className="text-sm font-bold text-gray-900 dark:text-white truncate">
                        {personaName || 'No Persona'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate" title={userEmail}>
                        {userEmail}
                    </p>
                    {isAdmin && <p className="text-[10px] text-teal-600 dark:text-teal-400 font-bold mt-1 uppercase tracking-wide">Admin Access</p>}
                </div>
            </div>
            <button onClick={onSignOut} className="w-full px-4 py-2 text-sm font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 rounded-lg hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/50 dark:hover:text-red-200 transition-colors border border-gray-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-900">Sign Out</button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
