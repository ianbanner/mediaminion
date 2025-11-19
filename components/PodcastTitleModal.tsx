
import React, { useState } from 'react';
import Button from './Button.tsx';

interface PodcastTitleModalProps {
  isOpen: boolean;
  onClose: () => void;
  titles: string[];
  onSelectTitle: (title: string) => void;
  isLoading: boolean;
}

const PodcastTitleModal: React.FC<PodcastTitleModalProps> = ({ isOpen, onClose, titles, onSelectTitle, isLoading }) => {
  const [selectedTitle, setSelectedTitle] = useState<string>('');

  const handleFinalize = () => {
    if (selectedTitle) {
      onSelectTitle(selectedTitle);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-200">Choose a Podcast Title</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-2xl">&times;</button>
        </div>
        <p className="text-gray-300 text-sm">
          Your Minion has generated some alternative titles. Select your favorite to proceed with generating the full podcast plan.
        </p>

        <div className="space-y-3 py-2">
            {titles.map((title, index) => (
                <label 
                    key={index}
                    className={`block w-full text-left p-4 bg-slate-900/50 border rounded-lg cursor-pointer transition-all ${selectedTitle === title ? 'border-teal-500 ring-2 ring-teal-500/50' : 'border-slate-700 hover:bg-slate-700/50'}`}
                >
                    <input
                        type="radio"
                        name="podcast-title-suggestion"
                        value={title}
                        checked={selectedTitle === title}
                        onChange={(e) => setSelectedTitle(e.target.value)}
                        className="hidden"
                    />
                    <span className="font-semibold text-gray-200">{title}</span>
                </label>
            ))}
        </div>
        
        <div className="pt-4 border-t border-slate-700 flex justify-end">
            <Button 
                onClick={handleFinalize} 
                disabled={!selectedTitle || isLoading}
                isLoading={isLoading}
            >
                {isLoading ? 'Your Minion is generating...' : 'Finalize and Generate Plan'}
            </Button>
        </div>
      </div>
    </div>
  );
};

export default PodcastTitleModal;
