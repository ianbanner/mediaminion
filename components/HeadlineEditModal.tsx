
import React, { useState, useEffect } from 'react';
import { GeneratedHeadline } from '../types.ts';
import Button from './Button.tsx';

interface HeadlineEditModalProps {
  isOpen: boolean;
  headline: GeneratedHeadline | null;
  onClose: () => void;
  onSave: (editedHeadline: { headline: string; subheadline?: string }) => void;
}

const HeadlineEditModal: React.FC<HeadlineEditModalProps> = ({ isOpen, headline, onClose, onSave }) => {
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedSubheadline, setEditedSubheadline] = useState('');

  useEffect(() => {
    if (headline) {
      setEditedHeadline(headline.headline);
      setEditedSubheadline(headline.subheadline || '');
    }
  }, [headline]);

  const handleSave = () => {
    onSave({
      headline: editedHeadline,
      subheadline: editedSubheadline,
    });
  };

  if (!isOpen || !headline) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4">
        <h3 className="text-xl font-bold text-gray-200">Finalize Your Headline</h3>
        <p className="text-sm text-gray-400">Make any final adjustments before applying this to your article.</p>
        
        <div>
          <label htmlFor="headline-input" className="block text-sm font-medium text-gray-300 mb-1">Headline</label>
          <input
            id="headline-input"
            type="text"
            value={editedHeadline}
            onChange={(e) => setEditedHeadline(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label htmlFor="subheadline-input" className="block text-sm font-medium text-gray-300 mb-1">Sub-headline</label>
          <input
            id="subheadline-input"
            type="text"
            value={editedSubheadline}
            onChange={(e) => setEditedSubheadline(e.target.value)}
            className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-6 py-2 text-sm font-semibold rounded-md transition-colors bg-gray-700 text-gray-300 hover:bg-gray-600">Cancel</button>
          <Button onClick={handleSave} className="bg-teal-600 hover:bg-teal-500">Apply to Article</Button>
        </div>
      </div>
    </div>
  );
};

export default HeadlineEditModal;
