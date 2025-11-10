import React from 'react';
import { SavedArticleTemplate } from '../types.ts';
import Button from './Button.tsx';

interface SelectArticleTemplateModalProps {
  templates: SavedArticleTemplate[];
  onSelect: (template: SavedArticleTemplate | null) => void;
  onClose: () => void;
}

const SelectArticleTemplateModal: React.FC<SelectArticleTemplateModalProps> = ({ templates, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-3xl p-6 space-y-4 animate-fade-in-fast flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center flex-shrink-0">
            <h3 className="text-xl font-bold text-gray-200">Guide Generation with a Template?</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-2xl">&times;</button>
        </div>
        <p className="text-gray-300 text-sm flex-shrink-0">
          You can select one of your saved article templates to give the AI a specific structure to follow, or let the AI choose the best one for your source content.
        </p>
        
        <div className="overflow-y-auto space-y-3 pr-2 -mr-2">
            {templates.map(template => (
                <button 
                    key={template.id} 
                    onClick={() => onSelect(template)}
                    className="w-full text-left p-4 bg-slate-900/50 hover:bg-slate-700/50 border border-slate-700 rounded-lg transition-all hover:border-teal-500"
                >
                    <h4 className="font-semibold text-teal-300">{template.title}</h4>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{template.description}</p>
                </button>
            ))}
        </div>
        
        <div className="pt-4 border-t border-slate-700 flex-shrink-0 text-center">
            <Button onClick={() => onSelect(null)} className="w-full">
                Continue Without a Template (Let AI Choose)
            </Button>
        </div>
      </div>
    </div>
  );
};

export default SelectArticleTemplateModal;
