import React, { useCallback } from 'react';

interface PersonaPanelProps {
  userRole: string;
  onUserRoleChange: React.Dispatch<React.SetStateAction<string>>;
  targetAudience: string;
  onTargetAudienceChange: React.Dispatch<React.SetStateAction<string>>;
  referenceWorldContent: string;
  onReferenceWorldContentChange: React.Dispatch<React.SetStateAction<string>>;
  thisIsHowIWriteArticles: string;
  onThisIsHowIWriteArticlesChange: React.Dispatch<React.SetStateAction<string>>;
}

const PersonaPanel: React.FC<PersonaPanelProps> = ({
  userRole,
  onUserRoleChange,
  targetAudience,
  onTargetAudienceChange,
  referenceWorldContent,
  onReferenceWorldContentChange,
  thisIsHowIWriteArticles,
  onThisIsHowIWriteArticlesChange,
}) => {

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

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Persona & Knowledge</h1>
      <p className="text-gray-400">Define your persona and provide the AI with core knowledge. This information is used across all generation features to ensure content is aligned with your voice, audience, and expertise.</p>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <div>
          <label htmlFor="user-role" className="block text-sm font-medium text-gray-300 mb-1">
            My Professional Role
          </label>
          <p className="text-xs text-gray-500 mb-2">How should the AI represent you? (e.g., "An expert Agile Coach specializing in digital transformation for Fortune 500 companies.")</p>
          <input
            id="user-role"
            type="text"
            value={userRole}
            onChange={(e) => onUserRoleChange(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="target-audience" className="block text-sm font-medium text-gray-300 mb-1">
            My Target Audience
          </label>
          <p className="text-xs text-gray-500 mb-2">Who are you trying to reach? (e.g., "C-level executives and senior leaders in non-technical roles who are struggling with digital transformation.")</p>
          <textarea
            id="target-audience"
            value={targetAudience}
            onChange={(e) => onTargetAudienceChange(e.target.value)}
            rows={3}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>
        
        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="reference-world" className="block text-sm font-medium text-gray-300 mb-1">
            Reference World (Core Knowledge Base)
          </label>
          <p className="text-xs text-gray-500 mb-2">Paste core knowledge, principles, book excerpts, or foundational concepts here. This acts as the AI's primary source of truth for your domain.</p>
           <div className="mb-2">
            <label className="text-xs text-gray-400 hover:text-white bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md cursor-pointer">
              Upload File Content
              <input type="file" className="hidden" accept=".txt,.md,.json,.csv" onChange={(e) => handleFileChange(e, onReferenceWorldContentChange)} />
            </label>
            <span className="ml-3 text-xs text-gray-500">Supported: .txt, .md, .json, .csv</span>
          </div>
          <textarea
            id="reference-world"
            value={referenceWorldContent}
            onChange={(e) => onReferenceWorldContentChange(e.target.value)}
            rows={15}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <label htmlFor="writing-style-articles" className="block text-sm font-medium text-gray-300 mb-1">
            This is how I write articles
          </label>
          <p className="text-xs text-gray-500 mb-2">Copy and paste some articles here to give the AI a reference for your article writing style.</p>
          <textarea
            id="writing-style-articles"
            value={thisIsHowIWriteArticles}
            onChange={(e) => onThisIsHowIWriteArticlesChange(e.target.value)}
            rows={15}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

      </div>
    </div>
  );
};

export default PersonaPanel;