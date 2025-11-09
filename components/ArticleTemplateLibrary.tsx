

import React from 'react';
import { SavedArticleTemplate } from '../types.ts';
import ArticleTemplateCard from './ArticleTemplateCard.tsx';
import Button from './Button.tsx';

interface ArticleTemplateLibraryProps {
  templates: (SavedArticleTemplate & { isNew?: boolean })[];
  onSave: (id: string, updates: Partial<Omit<SavedArticleTemplate, 'id'>>) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void; // This callback now triggers the modal
}

const ArticleTemplateLibrary: React.FC<ArticleTemplateLibraryProps> = ({ templates, onSave, onDelete, onAddNew }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Article Template Library</h1>
        <Button onClick={onAddNew}>Add New Template</Button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {templates.map(template => (
          <ArticleTemplateCard 
            key={template.id}
            template={template}
            onSave={(updates) => onSave(template.id, updates)}
            onDelete={() => onDelete(template.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ArticleTemplateLibrary;