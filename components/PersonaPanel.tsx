
import React, { useCallback, useState, useEffect } from 'react';
import Button from './Button.tsx';

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
      // Commit all local changes to the parent state
      onPersonaNameChange(localPersonaName);
      onUserRoleChange(localUserRole);
      onTargetAudienceChange(localTargetAudience);
      onWhatIWriteAboutChange(localWhatIWriteAbout);
      onReferenceWorldContentChange(localReferenceWorldContent);
      onThisIsHowIWriteArticlesChange(localThisIsHowIWriteArticles);
      
      // Simulate a brief delay for visual feedback
      setTimeout(() => {
          setIsSaving(false);
          setHasUnsavedChanges(false);
      }, 800);
  };
  
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<string>>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        setter(prev => `${prev}\n\n--- From ${file.name} ---\n${text}`);
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  }, []);

  const downloadSnapshot = () => {
    // Use local state for snapshot so it captures unsaved edits
    const text = `[[NAME]]
${localPersonaName}
[[ROLE]]
${localUserRole}
[[AUDIENCE]]
${localTargetAudience}
[[TOPICS]]
${localWhatIWriteAbout}
[[KNOWLEDGE]]
${localReferenceWorldContent}
[[STYLE]]
${localThisIsHowIWriteArticles}`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    
    const safeUser = (userEmail || 'user').replace(/[^a-z0-9]/gi, '_');
    const safePersona = (localPersonaName || 'persona').replace(/[^a-z0-9]/gi, '_');
    const date = new Date().toISOString().replace(/[:.]/g, '-');
    
    a.download = `socialmediaminion-${safeUser}-${safePersona}-${date}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const loadSnapshot = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
          const importText = e.target?.result as string;
          if (!importText) return;

          const extractSection = (tag: string) => {
              const parts = importText.split(tag);
              if (parts.length > 1) {
                  const content = parts[1].split('[[')[0];
                  return content.trim();
              }
              return '';
          };

          const name = extractSection('[[NAME]]');
          const role = extractSection('[[ROLE]]');
          const audience = extractSection('[[AUDIENCE]]');
          const topics = extractSection('[[TOPICS]]');
          const knowledge = extractSection('[[KNOWLEDGE]]');
          const style = extractSection('[[STYLE]]');

          if (name) setLocalPersonaName(name);
          if (role) setLocalUserRole(role);
          if (audience) setLocalTargetAudience(audience);
          if (topics) setLocalWhatIWriteAbout(topics);
          if (knowledge) setLocalReferenceWorldContent(knowledge);
          if (style) setLocalThisIsHowIWriteArticles(style);

          alert(`Loaded snapshot data for: ${name || 'Unknown'}. Please review and click 'Save Changes' to apply.`);
      };
      reader.readAsText(file);
      event.target.value = ''; 
  };

  return (
    <div className="space-y-8 animate-fade-in pb-16">
      <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Persona & Knowledge</h1>
            <p className="text-gray-400">Define your persona and provide the AI with core knowledge.</p>
          </div>
          <div className="flex gap-2">
              <Button onClick={downloadSnapshot} className="bg-slate-700 hover:bg-slate-600 px-3 py-2 text-xs">
                  Save Persona Snapshot
              </Button>
              <label className="bg-teal-700 hover:bg-teal-600 px-4 py-2 text-xs text-white font-bold rounded-md shadow-lg cursor-pointer flex items-center justify-center transition-all duration-200">
                  Load Persona Snapshot
                  <input type="file" className="hidden" accept=".txt" onChange={loadSnapshot} />
              </label>
          </div>
      </div>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        
        {/* Persona Identity Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="persona-name" className="block text-sm font-medium text-gray-300 mb-1">
                    Persona Name
                </label>
                <p className="text-xs text-gray-500 mb-2">A label for this specific persona (e.g., "Dave the Coach").</p>
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
                <input
                    id="user-role"
                    type="text"
                    value={localUserRole}
                    onChange={(e) => setLocalUserRole(e.target.value)}
                    className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
                    placeholder="e.g. Agile Coach for Fortune 500s"
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
            rows={2}
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
            rows={3}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
            placeholder="e.g. Leadership principles, Agile frameworks, Organizational culture change."
          />
        </div>
        
        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="reference-world" className="block text-sm font-medium text-gray-300 mb-1">
            Reference World (Core Knowledge Base)
          </label>
          <p className="text-xs text-gray-500 mb-2">Paste core knowledge, principles, book excerpts, or foundational concepts here. This acts as the AI's primary source of truth.</p>
           <div className="mb-2">
            <label className="text-xs text-gray-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md cursor-pointer">
              Upload File Content
              <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={(e) => handleFileChange(e, setLocalReferenceWorldContent)} />
            </label>
            <span className="ml-3 text-xs text-gray-500">Supported: .txt, .md, .json, .csv</span>
          </div>
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
            className="bg-teal-600 hover:bg-teal-500 shadow-xl border border-teal-400"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
      </div>
      
      {/* Static Save Button for accessibility/fallback if floating bar is annoying */}
      <div className="flex justify-end pt-4">
         <Button 
            onClick={handleSaveChanges} 
            isLoading={isSaving}
            disabled={!hasUnsavedChanges && !isSaving}
            className={`${hasUnsavedChanges ? 'bg-teal-600 hover:bg-teal-500' : 'bg-gray-700 text-gray-400'}`}
          >
            {isSaving ? 'Saving...' : hasUnsavedChanges ? 'Save Changes' : 'All Changes Saved'}
          </Button>
      </div>

    </div>
  );
};

export default PersonaPanel;
