import React from 'react';

export type View = 'transcript' | 'inspirations' | 'templates';

interface SidebarProps {
  view: View;
  setView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  viewName: View;
  currentView: View;
  setView: (view: View) => void;
  children: React.ReactNode;
}> = ({ label, viewName, currentView, setView, children }) => {
  const isActive = currentView === viewName;
  return (
    <button
      onClick={() => setView(viewName)}
      className={`w-full flex items-center p-3 rounded-lg transition-colors duration-200 ${
        isActive
          ? 'bg-teal-500/20 text-teal-300'
          : 'text-gray-400 hover:bg-slate-700/50 hover:text-gray-200'
      }`}
      aria-current={isActive ? 'page' : undefined}
    >
      {children}
      <span className="ml-4 font-medium">{label}</span>
    </button>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ view, setView }) => {
  return (
    <div className="w-64 bg-slate-900/50 border-r border-slate-800 p-4 flex flex-col">
      <div className="mb-8">
         <h2 className="text-2xl font-bold text-white flex items-center">
            <svg className="w-8 h-8 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            <span>Minion</span>
         </h2>
      </div>
      <nav className="flex flex-col space-y-2">
        <NavItem label="Transcript Processor" viewName="transcript" currentView={view} setView={setView}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
        </NavItem>
        <NavItem label="Inspiration Hub" viewName="inspirations" currentView={view} setView={setView}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
        </NavItem>
         <NavItem label="Template Generator" viewName="templates" currentView={view} setView={setView}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"></path></svg>
        </NavItem>
      </nav>
    </div>
  );
};

export default Sidebar;
