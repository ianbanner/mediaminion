
import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';
import { PersonaProfile } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';

interface PersonaPanelProps {
  personaName: string;
  onPersonaNameChange: React.Dispatch<React.SetStateAction<string>>;
  userRole: string;
  onUserRoleChange: React.Dispatch<React.SetStateAction<string>>;
  targetAudience: string;
  onTargetAudienceChange: React.Dispatch<React.SetStateAction<string>>;
  whatIWriteAbout: string;
  onWhatIWriteAboutChange: React.Dispatch<React.SetStateAction<string>>;
  referenceWorldContent: string;
  onReferenceWorldContentChange: React.Dispatch<React.SetStateAction<string>>;
  thisIsHowIWriteArticles: string;
  onThisIsHowIWriteArticlesChange: React.Dispatch<React.SetStateAction<string>>;
  userEmail: string | null;
  
  // New props for Multi-Persona
  savedPersonas: PersonaProfile[];
  activePersonaId: string | null;
  onSavePersonaProfile: (profile: PersonaProfile) => void;
  onLoadPersona: (id: string) => void;
  onDeletePersona: (id: string) => void;
  onCreateNewPersona: () => void;
}

const PersonaPanel: React.FC<PersonaPanelProps> = ({
  personaName,
  onPersonaNameChange,
  userRole,
  onUserRoleChange,
  targetAudience,
  onTargetAudienceChange,
  whatIWriteAbout,
  onWhatIWriteAboutChange,
  referenceWorldContent,
  onReferenceWorldContentChange,
  thisIsHowIWriteArticles,
  onThisIsHowIWriteArticlesChange,
  userEmail,
  savedPersonas,
  activePersonaId,
  onSavePersonaProfile,
  onLoadPersona,
  onDeletePersona,
  onCreateNewPersona,
}) => {
  // Local state for form fields to allow editing without immediate persistence
  const [localPersonaName, setLocalPersonaName] = useState(personaName);
  const [localUserRole, setLocalUserRole] = useState(userRole);
  const [localTargetAudience, setLocalTargetAudience] = useState(targetAudience);
  const [localWhatIWriteAbout, setLocalWhatIWriteAbout] = useState(whatIWriteAbout);
  const [localReferenceWorldContent, setLocalReferenceWorldContent] = useState(referenceWorldContent);
  const [localThisIsHowIWriteArticles, setLocalThisIsHowIWriteArticles] = useState(thisIsHowIWriteArticles);
  
  const [isSaving, setIsSaving] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync local state with props when props change (e.g. from Restore or initial load)
  useEffect(() => { setLocalPersonaName(personaName); }, [personaName]);
  useEffect(() => { setLocalUserRole(userRole); }, [userRole]);
  useEffect(() => { setLocalTargetAudience(targetAudience); }, [targetAudience]);
  useEffect(() => { setLocalWhatIWriteAbout(whatIWriteAbout); }, [whatIWriteAbout]);
  useEffect(() => { setLocalReferenceWorldContent(referenceWorldContent); }, [referenceWorldContent]);
  useEffect(() => { setLocalThisIsHowIWriteArticles(thisIsHowIWriteArticles); }, [thisIsHowIWriteArticles]);

  // Check for unsaved changes
  useEffect(() => {
      const isDirty = 
          localPersonaName !== personaName ||
          localUserRole !== userRole ||
          localTargetAudience !== targetAudience ||
          localWhatIWriteAbout !== whatIWriteAbout ||
          localReferenceWorldContent !== referenceWorldContent ||
          localThisIsHowIWriteArticles !== thisIsHowIWriteArticles;
      setHasUnsavedChanges(isDirty);
  }, [
      localPersonaName, personaName,
      localUserRole, userRole,
      localTargetAudience, targetAudience,
      localWhatIWriteAbout, whatIWriteAbout,
      localReferenceWorldContent, referenceWorldContent,
      localThisIsHowIWriteArticles, thisIsHowIWriteArticles
  ]);

  const handleSaveChanges = () => {
      setIsSaving(true);
      
      const profileToSave: PersonaProfile = {
          id: activePersonaId || uuidv4(),
          name: localPersonaName || 'Untitled Persona',
          role: localUserRole,
          targetAudience: localTargetAudience,
          whatIWriteAbout: localWhatIWriteAbout,
          referenceWorldContent: localReferenceWorldContent,
          thisIsHowIWriteArticles: localThisIsHowIWriteArticles,
          lastModified: new Date().toISOString()
      };

      // Save to library AND update active state
      onSavePersonaProfile(profileToSave);
      
      // Simulate a brief delay for visual feedback
      setTimeout(() => {
          setIsSaving(false);
          setHasUnsavedChanges(false);
      }, 800);
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div>
        <h1 className="text-3xl font-bold">Persona & Knowledge</h1>
        <p className="text-gray-400">Manage your personas and define the core knowledge base. Select a persona below to activate it.</p>
      </div>

      {/* Persona Library Section */}
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
          <div className="flex justify-between items-center border-b border-slate-700 pb-4">
              <h2 className="text-xl font-bold text-gray-200">Your Personas</h2>
              <button 
                  onClick={onCreateNewPersona} 
                  className={`px-4 py-2 text-sm font-bold rounded-lg transition-colors flex items-center gap-2 ${
                      !activePersonaId 
                      ? 'bg-indigo-600 text-white cursor-default opacity-80' 
                      : 'bg-slate-700 text-gray-300 hover:bg-indigo-600 hover:text-white'
                  }`}
                  disabled={!activePersonaId} // Disabled if already in "New" mode
                  title={!activePersonaId ? "You are currently creating a new persona" : "Create a new blank persona"}
              >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  New Persona
              </button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedPersonas.map(persona => (
                  <div 
                      key={persona.id}
                      onClick={() => onLoadPersona(persona.id)}
                      className={`relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 group flex flex-col justify-between min-h-[140px] ${
                          activePersonaId === persona.id 
                          ? 'bg-teal-900/20 border-teal-500 shadow-lg shadow-teal-500/10' 
                          : 'bg-slate-900/50 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                      }`}
                  >
                      <div>
                          <div className="flex justify-between items-start mb-2">
                              <h3 className={`font-bold truncate pr-6 text-lg ${activePersonaId === persona.id ? 'text-teal-300' : 'text-gray-200'}`}>{persona.name}</h3>
                              {activePersonaId === persona.id && (
                                  <span className="absolute top-4 right-4 flex h-3 w-3">
                                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                                      <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
                                  </span>
                              )}
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-2">{persona.role || 'No role defined'}</p>
                      </div>
                      
                      <div className="mt-4 flex justify-between items-end">
                          <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded ${activePersonaId === persona.id ? 'bg-teal-900/50 text-teal-400' : 'bg-slate-800 text-gray-500'}`}>
                              {activePersonaId === persona.id ? 'Active' : 'Inactive'}
                          </span>
                          <button 
                              onClick={(e) => { e.stopPropagation(); onDeletePersona(persona.id); }}
                              className="text-gray-500 hover:text-red-400 p-1.5 rounded hover:bg-slate-700/50 transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                              title="Delete Persona"
                          >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                      </div>
                  </div>
              ))}
              {savedPersonas.length === 0 && (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-700 rounded-lg text-gray-500 bg-slate-800/30">
                      <p className="font-semibold text-lg">No personas yet.</p>
                      <p className="text-sm mt-1">Fill out the details below and click "Save As New Persona" to create your first one.</p>
                  </div>
              )}
          </div>
      </div>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6 relative overflow-hidden">
        
        {/* Status Indicator Bar */}
        <div className={`absolute top-0 left-0 right-0 h-1 transition-colors duration-300 ${activePersonaId ? 'bg-teal-500' : 'bg-indigo-500'}`}></div>
        
        <div className="flex items-center gap-2 mb-2">
            <span className={`px-2 py-1 text-xs font-bold rounded uppercase ${activePersonaId ? 'bg-teal-900/50 text-teal-300' : 'bg-indigo-900/50 text-indigo-300'}`}>
                {activePersonaId ? 'Editing Active Persona' : 'Creating New Persona'}
            </span>
            {hasUnsavedChanges && <span className="text-xs text-yellow-500 font-medium italic animate-pulse">Unsaved changes...</span>}
        </div>

        {/* Persona Identity Section */}
        <div className="space-y-6">
            <div>
                <label htmlFor="persona-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Persona Name
                </label>
                <p className="text-xs text-gray-500 mb-2">A label for this specific persona (e.g., "Prophet").</p>
                <input
                    id="persona-name"
                    type="text"
                    value={localPersonaName}
                    onChange={(e) => setLocalPersonaName(e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Dave the Coach"
                />
            </div>
            <div>
                <label htmlFor="user-role" className="block text-sm font-medium text-gray-300 mb-1">
                    My Professional Role
                </label>
                <p className="text-xs text-gray-500 mb-2">How should the AI represent you?</p>
                <textarea
                    id="user-role"
                    value={localUserRole}
                    onChange={(e) => setLocalUserRole(e.target.value)}
                    rows={12}
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Christian educator and content creator specializing in..."
                />
            </div>
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-1">
            My Target Audience
          </label>
          <p className="text-xs text-gray-500 mb-2">Who are you trying to reach?</p>
          <textarea
            id="target-audience"
            value={localTargetAudience}
            onChange={(e) => setLocalTargetAudience(e.target.value)}
            rows={15}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
            placeholder="e.g. C-level executives struggling with digital transformation."
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="what-i-write-about" className="block text-sm font-medium text-gray-300 mb-1">
            What I Write About (Topics)
          </label>
          <p className="text-xs text-gray-500 mb-2">The core themes and subjects of your content.</p>
          <textarea
            id="what-i-write-about"
            value={localWhatIWriteAbout}
            onChange={(e) => setLocalWhatIWriteAbout(e.target.value)}
            rows={8}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
            placeholder="e.g. Leadership principles, Agile frameworks, Organizational culture change."
          />
        </div>
        
        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="reference-world" className="block text-sm font-medium text-gray-300 mb-1">
            Reference World (Core Knowledge Base)
          </label>
          <p className="text-xs text-gray-500 mb-2">Paste core knowledge, principles, book excerpts, or foundational concepts here. This acts as the AI's primary source of truth.</p>
          <textarea
            id="reference-world"
            value={localReferenceWorldContent}
            onChange={(e) => setLocalReferenceWorldContent(e.target.value)}
            rows={15}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="writing-style-articles" className="block text-sm font-medium text-gray-300 mb-1">
            This is how I write articles
          </label>
          <p className="text-xs text-gray-500 mb-2">Copy and paste some articles here to give the AI a reference for your article writing style.</p>
          <textarea
            id="writing-style-articles"
            value={localThisIsHowIWriteArticles}
            onChange={(e) => setLocalThisIsHowIWriteArticles(e.target.value)}
            rows={15}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
          />
        </div>

      </div>

      {/* Floating Save Bar */}
      <div className={`fixed bottom-6 right-6 md:right-12 z-40 transition-all duration-300 transform ${hasUnsavedChanges ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
          <Button 
            onClick={handleSaveChanges} 
            isLoading={isSaving}
            className="bg-teal-600 hover:bg-teal-500 shadow-xl border border-teal-400 font-bold"
          >
            {isSaving ? 'Saving...' : activePersonaId ? 'Update Active Persona' : 'Save As New Persona'}
          </Button>
      </div>
      
      {/* Static Save Button for accessibility/fallback if floating bar is hidden */}
      <div className="flex justify-end pt-4">
         <Button 
            onClick={handleSaveChanges} 
            isLoading={isSaving}
            disabled={!hasUnsavedChanges && !isSaving}
            className={`${hasUnsavedChanges ? 'bg-teal-600 hover:bg-teal-500' : 'bg-gray-700 text-gray-400'}`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? (activePersonaId ? 'Update Active Persona' : 'Save As New Persona') : 'All Changes Saved'}
          </Button>
      </div>

    </div>
  );
};

export default PersonaPanel;
