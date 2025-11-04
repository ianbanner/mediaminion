import React, { useState, useEffect } from 'react';
import { SavedTemplate } from '../types';

interface TemplateCardProps {
  template: SavedTemplate & { isNew?: boolean };
  onSave: (updates: Partial<Omit<SavedTemplate, 'id'>>) => void;
  onDelete: () => void;
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(template.isNew || false);
  const [editableTemplate, setEditableTemplate] = useState({
    title: template.title,
    template: template.template,
    example: template.example,
    instructions: template.instructions,
  });

  useEffect(() => {
    // This ensures that if the prop changes from the parent, the local state updates.
    setEditableTemplate({
      title: template.title,
      template: template.template,
      example: template.example,
      instructions: template.instructions,
    });
  }, [template.title, template.template, template.example, template.instructions]);

  const handleInputChange = (field: keyof typeof editableTemplate, value: string) => {
    setEditableTemplate(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveClick = () => {
    onSave(editableTemplate);
    setIsEditing(false);
  };

  const handleCancelClick = () => {
    if (template.isNew) {
      onDelete(); // If it's a new, unsaved template, canceling should remove it.
    } else {
      // Otherwise, revert to original data and exit edit mode.
      setEditableTemplate({
        title: template.title,
        template: template.template,
        example: template.example,
        instructions: template.instructions,
      });
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-4 bg-slate-900/50 border border-teal-500 rounded-lg space-y-3 animate-fade-in-fast ring-2 ring-teal-500/50">
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Title</label>
          <input value={editableTemplate.title} onChange={(e) => handleInputChange('title', e.target.value)} className="w-full p-2 bg-gray-800 rounded-md text-sm" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Template Structure</label>
          <textarea value={editableTemplate.template} onChange={(e) => handleInputChange('template', e.target.value)} rows={5} className="w-full p-2 bg-gray-800 rounded-md font-mono text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Example</label>
          <textarea value={editableTemplate.example} onChange={(e) => handleInputChange('example', e.target.value)} rows={5} className="w-full p-2 bg-gray-800 rounded-md font-mono text-xs" />
        </div>
        <div>
          <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Instructions</label>
          <textarea value={editableTemplate.instructions} onChange={(e) => handleInputChange('instructions', e.target.value)} rows={2} className="w-full p-2 bg-gray-800 rounded-md font-mono text-xs" />
        </div>
        <div className="flex justify-end items-center gap-2 pt-2">
          <button onClick={handleCancelClick} className="px-3 py-1 text-sm text-gray-400 hover:text-white rounded-md">Cancel</button>
          <button onClick={handleSaveClick} className="px-4 py-1.5 text-sm font-semibold rounded-md transition-colors bg-teal-600 text-white hover:bg-teal-500">Save</button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg group space-y-3 transition-shadow hover:shadow-lg hover:shadow-teal-500/10">
      <div className="flex justify-between items-start">
        <h3 className="font-semibold text-teal-300 text-lg flex-1 pr-2">{template.title}</h3>
        <div className="flex-shrink-0 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => setIsEditing(true)} className="p-1.5 text-gray-400 hover:text-white bg-slate-700/50 hover:bg-slate-600 rounded-md" aria-label="Edit template">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L16.732 3.732z" /></svg>
          </button>
          <button onClick={onDelete} className="p-1.5 text-gray-400 hover:text-red-400 bg-slate-700/50 hover:bg-slate-600 rounded-md" aria-label="Delete template">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </div>
      <div className="text-xs text-gray-500 font-mono flex gap-4">
        <span>Used: {template.usageCount}</span>
        <span>Last: {template.lastUsed}</span>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Template</p>
        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono p-2 bg-gray-800/50 rounded-md max-h-24 overflow-y-auto">{template.template}</pre>
      </div>
      <div>
        <p className="text-xs font-semibold uppercase text-gray-500 mb-1">Example</p>
        <pre className="text-xs text-gray-300 whitespace-pre-wrap font-mono p-2 bg-gray-800/50 rounded-md max-h-24 overflow-y-auto">{template.example}</pre>
      </div>
    </div>
  );
};

export default TemplateCard;
