

import React, { useState, useEffect } from 'react';

interface SidebarProps {
  view: string;
  setView: (view: string) => void;
  onDownloadData: () => void;
}

const PlatformSection: React.FC<{
    platform: string;
    icon: React.ReactNode;
    children?: React.ReactNode;
    isExpanded: boolean;
    onToggle: () => void;
    isDisabled?: boolean;
    setView: (view: string) => void;
}> = ({ platform, icon, children, isExpanded, onToggle, isDisabled = false, setView }) => {
    
    const handleClick = () => {
        if (isDisabled) return;
        if (children) {
            onToggle();
        } else {
            setView(platform.toLowerCase());
        }
    }

    return (
        <div>
            <button
                onClick={handleClick}
                className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
                    isDisabled 
                    ? 'text-gray-600 cursor-not-allowed'
                    : 'text-gray-300 hover:bg-slate-700/50 hover:text-white'
                }`}
                aria-expanded={children ? isExpanded : undefined}
                disabled={isDisabled}
            >
                {icon}
                <span className="ml-3 font-semibold">{platform}</span>
                {children && (
                     <svg className={`w-5 h-5 ml-auto transform transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                )}
            </button>
            {isExpanded && children && (
                <div className="pl-4 mt-2 space-y-1 border-l-2 border-slate-700 ml-4">
                    {children}
                </div>
            )}
        </div>
    )
}

const NavItem: React.FC<{
  label: string;
  viewName: string;
  currentView: string;
  setView: (view: string) => void;
  children: React.ReactNode;
  isSubItem?: boolean;
}> = ({ label, viewName, currentView, setView, children, isSubItem = false }) => {
  const isActive = currentView === viewName;
  const paddingClass = isSubItem ? 'p-2' : 'p-3';
  const textClass = isSubItem ? 'text-sm' : 'font-semibold';
  
  return (
    <button
      onClick={() => setView(viewName)}
      className={`w-full flex items-center rounded-md transition-colors duration-200 ${paddingClass} ${
        isActive
          ? 'bg-teal-500/20 text-teal-300'
          : `text-gray-${isSubItem ? '400' : '300'} hover:bg-slate-700/50 hover:text-white`
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span className={`ml-3 ${textClass}`}>{label}</span>
    </button>
  );
};


const Sidebar: React.FC<SidebarProps> = ({ view, setView, onDownloadData }) => {
    const [isLinkedInExpanded, setLinkedInExpanded] = useState(true);

    useEffect(() => {
        if (view.startsWith('linkedin-') && !isLinkedInExpanded) {
            setLinkedInExpanded(true);
        }
    }, [view, isLinkedInExpanded]);


  return (
    <div className="w-72 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col flex-shrink-0">
      <div className="flex-grow">
        <div className="mb-8">
           <h2 className="text-2xl font-bold text-white flex items-center">
              <svg className="w-8 h-8 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              <span>Minion</span>
           </h2>
        </div>
        <nav className="flex flex-col space-y-1">
          <NavItem label="Generate Posts" viewName="generate-posts" currentView={view} setView={setView}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
          </NavItem>
          
          <NavItem label="Collect URLs" viewName="collect-urls" currentView={view} setView={setView}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7v10c0 1.1.9 2 2 2h12a2 2 0 002-2V7M6 10l6 6 6-6"></path></svg>
          </NavItem>

          <NavItem label="Ayrshare Queue" viewName="ayrshare-queue" currentView={view} setView={setView}>
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path></svg>
          </NavItem>
          
          <NavItem label="Ayrshare Log" viewName="ayrshare-log" currentView={view} setView={setView}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </NavItem>

          <NavItem label="Scheduler" viewName="scheduler" currentView={view} setView={setView}>
             <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
          </NavItem>

          <div className="pt-2 border-t border-slate-800 my-2"></div>
          
          <PlatformSection 
              platform="LinkedIn"
              icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>}
              isExpanded={isLinkedInExpanded}
              onToggle={() => setLinkedInExpanded(!isLinkedInExpanded)}
              setView={setView}
          >
              <NavItem label="Post Researcher" viewName="linkedin-researcher" currentView={view} setView={setView} isSubItem={true}>
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
              </NavItem>
              <NavItem label="Inspiration Hub" viewName="linkedin-inspirations" currentView={view} setView={setView} isSubItem={true}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
              </NavItem>
              <NavItem label="Template Library" viewName="linkedin-library" currentView={view} setView={setView} isSubItem={true}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16"></path></svg>
              </NavItem>
          </PlatformSection>

          <PlatformSection 
              platform="X (Twitter)"
              icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.617l-5.21-6.817-6.044 6.817h-3.308l7.73-8.805-7.96-10.69h6.761l4.634 6.257 5.49-6.257z"/></svg>}
              isExpanded={false}
              onToggle={() => {}}
              setView={setView}
              isDisabled={true}
          />
          <PlatformSection 
              platform="Facebook Pages"
              icon={<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>}
              isExpanded={false}
              onToggle={() => {}}
              setView={setView}
              isDisabled={true}
          />
        </nav>
      </div>
      <div className="flex-shrink-0 pt-4 border-t border-slate-800 space-y-1">
        <NavItem label="Settings" viewName="settings" currentView={view} setView={setView}>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </NavItem>
        <button
          onClick={onDownloadData}
          className="w-full flex items-center p-3 rounded-lg transition-colors duration-200 text-gray-400 hover:bg-slate-700/50 hover:text-white"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"></path></svg>
          <span className="ml-3 font-semibold">Download Scripts &amp; Data</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
