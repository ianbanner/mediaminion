
import React, { useState } from 'react';
import Button from './Button.tsx';
import { QueuedPost } from '../types.ts';
import { v4 as uuidv4 } from 'uuid';

interface AddPostModalProps {
  onClose: () => void;
  onAddPost: (post: QueuedPost) => void;
}

const AddPostModal: React.FC<AddPostModalProps> = ({ onClose, onAddPost }) => {
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(['linkedin']);

  const platforms = ['linkedin', 'facebook', 'twitter', 'instagram'];

  const handleSubmit = () => {
    if (!content.trim()) return;

    const newPost: QueuedPost = {
      id: uuidv4(),
      title: title.trim() || 'Manual Post',
      content: content,
      assessment: 'Manually created post.',
      score: 100, // Manual posts get full score
      platforms: selectedPlatforms,
      status: 'scheduled' // Default to scheduled so it gets picked up by scheduler
    };

    onAddPost(newPost);
    onClose();
  };

  const togglePlatform = (platform: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platform) ? prev.filter(p => p !== platform) : [...prev, platform]
    );
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50 p-4 animate-fade-in-fast">
      <div className="bg-slate-800 border border-slate-700 rounded-xl shadow-2xl w-full max-w-lg p-6 space-y-4">
        <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-200">Add Manual Post</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white font-bold text-2xl">&times;</button>
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Post Title (Internal)</label>
            <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                placeholder="e.g., Tuesday Motivation" 
                className="w-full p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Content</label>
            <textarea 
                value={content} 
                onChange={(e) => setContent(e.target.value)} 
                rows={6}
                placeholder="Type your post here..."
                className="w-full p-3 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
            />
        </div>

        <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Platforms</label>
            <div className="flex flex-wrap gap-3">
                {platforms.map(platform => (
                    <button
                        key={platform}
                        onClick={() => togglePlatform(platform)}
                        className={`px-3 py-1.5 text-xs font-bold rounded-full border transition-all ${
                            selectedPlatforms.includes(platform) 
                            ? 'bg-teal-600 border-teal-500 text-white' 
                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-gray-500'
                        }`}
                    >
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </button>
                ))}
            </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-slate-700">
            <Button onClick={onClose} className="bg-gray-700 hover:bg-gray-600 text-sm py-2">Cancel</Button>
            <Button onClick={handleSubmit} disabled={!content.trim()} className="bg-blue-600 hover:bg-blue-500 text-sm py-2">Add to Queue</Button>
        </div>
      </div>
    </div>
  );
};

export default AddPostModal;
