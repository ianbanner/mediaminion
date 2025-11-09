import React from 'react';
import { SavedTemplate } from '../types.ts';
import TemplateCard from './TemplateCard.tsx';
import Button from './Button.tsx';

interface PostsTemplateLibraryProps {
  templates: (SavedTemplate & { isNew?: boolean })[];
  onSave: (id: string, updates: Partial<Omit<SavedTemplate, 'id'>>) => void;
  onDelete: (id: string) => void;
  onAddNew: () => void;
}

const PostsTemplateLibrary: React.FC<PostsTemplateLibraryProps> = ({ templates, onSave, onDelete, onAddNew }) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Posts Template Library</h1>
        <Button onClick={onAddNew}>Add New Template</Button>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {templates.map(template => (
          <TemplateCard
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

export default PostsTemplateLibrary;