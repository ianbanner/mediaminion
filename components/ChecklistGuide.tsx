
import React from 'react';
import { ChecklistItem } from '../types.ts';

interface ChecklistGuideProps {
  items: ChecklistItem[];
  onToggleItem: (id: string) => void;
}

const ChecklistGuide: React.FC<ChecklistGuideProps> = ({ items, onToggleItem }) => {
  const completedCount = items.filter(i => i.isCompleted).length;
  const progress = items.length > 0 ? Math.round((completedCount / items.length) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Set Up Actions</h1>
      <p className="text-gray-400">A step-by-step guide to your content creation routine. Follow these items to maintain consistency.</p>

      {/* Progress Bar */}
      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
        <div className="flex justify-between items-end mb-2">
            <span className="text-teal-400 font-bold">{progress}% Completed</span>
            <span className="text-gray-400 text-sm">{completedCount} of {items.length} tasks</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-4">
            <div 
                className="bg-teal-500 h-4 rounded-full transition-all duration-500 ease-out" 
                style={{ width: `${progress}%` }}
            ></div>
        </div>
      </div>

      <div className="space-y-4">
        {items.length === 0 ? (
            <div className="p-8 text-center border border-slate-700 border-dashed rounded-xl text-gray-500">
                No items defined. An admin can add items in the Admin Panel.
            </div>
        ) : (
            items.map(item => (
                <div 
                    key={item.id} 
                    className={`p-4 rounded-xl border transition-all duration-200 flex flex-col sm:flex-row sm:items-center gap-4 ${
                        item.isCompleted 
                        ? 'bg-slate-900/30 border-slate-800 opacity-75' 
                        : 'bg-slate-800/50 border-slate-700 shadow-lg'
                    }`}
                >
                    <div className="flex items-start gap-4 flex-grow">
                        <div className="flex-shrink-0 pt-1">
                            <button
                                onClick={() => onToggleItem(item.id)}
                                className={`w-6 h-6 rounded border flex items-center justify-center transition-colors ${
                                    item.isCompleted
                                    ? 'bg-teal-600 border-teal-600 text-white'
                                    : 'bg-gray-900 border-gray-500 hover:border-teal-400'
                                }`}
                            >
                                {item.isCompleted && (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                )}
                            </button>
                        </div>
                        <div className="flex-grow">
                            <p className={`text-lg ${item.isCompleted ? 'text-gray-500 line-through' : 'text-gray-200'}`}>
                                {item.text}
                            </p>
                        </div>
                    </div>
                    
                    {item.url && (
                         <div className="flex-shrink-0 pl-10 sm:pl-0">
                            <a 
                                href={item.url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-300 bg-blue-900/30 border border-blue-800 rounded-lg hover:bg-blue-900/50 hover:text-blue-200 transition-colors"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
                                Watch Training
                            </a>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default ChecklistGuide;
