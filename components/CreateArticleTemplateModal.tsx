


import React, { useState, useEffect } from 'react';
import Button from './Button.tsx';

interface CreateArticleTemplateModalProps {
  onCreateTemplate: (articleText: string) => Promise<boolean>;
  onClose: () => void;
  isLoading: boolean;
  error: React.ReactNode | null; // Added to display errors from App.tsx
}

const CreateArticleTemplateModal: React.FC<CreateArticleTemplateModalProps> = ({
  onCreateTemplate,
  onClose,
  isLoading,
  error,
}) => {
  const [articleText, setArticleText] = useState<string>('');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    // Clear local error when external error prop changes or modal is closed
    if (error || !isLoading) {
      setLocalError(null);
    }
  }, [error, isLoading]);

  const handleSubmit = async () => {
    if (!articleText.trim()) {
      setLocalError('Please paste article content to create a template.');
      return;
    }
    setLocalError(null);
    const success = await onCreateTemplate(articleText);
    if (success) {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4 animate-fade-in-fast">
        <h3 className="text-xl font-bold text-gray-200">Create Template from Article</h3>
        <p className="text-gray-300 text-sm">
          Paste the full content of an article below. The AI will analyze its structure and generate a new template for your library.
        </p>

        <div>
          <label htmlFor="article-text-input" className="sr-only">Article Content</label>
          <textarea
            id="article-text-input"
            value={articleText}
            onChange={(e) => setArticleText(e.target.value)}
            rows={15}
            placeholder="Paste article content here..."
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
          />
        </div>

        {(localError || error) && (
          <div className="bg-red-900/50 p-3 rounded-lg border border-red-700 text-sm text-red-300">
            {localError || error}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <Button onClick={onClose} className="bg-gray-700 hover:bg-gray-600">Cancel</Button>
          <Button onClick={handleSubmit} isLoading={isLoading} disabled={!articleText.trim() || isLoading}>
            {isLoading ? 'Your Minion Is Working' : 'Create Template'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateArticleTemplateModal;