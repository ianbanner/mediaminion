import React, { useState, useEffect } from 'react';
import { QueuedPost } from '../types.ts';

interface QueuedPostsDisplayProps {
  queuedPosts: QueuedPost[];
  onDeletePost?: (id: string) => void;
  onUpdatePost?: (id: string, updates: Partial<QueuedPost>) => void;
  readOnly?: boolean;
  title?: string;
  emptyMessage?: string;
  onPostNow?: (id: string) => void;
  postingNowId?: string | null;
  error?: React.ReactNode | null;
  onClearError?: () => void;
}

const platforms = ['linkedin', 'facebook', 'twitter'];

const PostItem: React.FC<{
  post: QueuedPost;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<QueuedPost>) => void;
  readOnly?: boolean;
  onPostNow?: (id: string) => void;
  postingNowId?: string | null;
}> = ({ post, onDelete, onUpdate, readOnly, onPostNow, postingNowId }) => {
    const [content, setContent] = useState(post.content);

    useEffect(() => {
        setContent(post.content);
    }, [post.content]);
    
    const handleUpdate = () => {
        if(onUpdate && content !== post.content) {
            onUpdate(post.id, { content });
        }
    };

    const handlePlatformChange = (platform: string) => {
        if (onUpdate && !readOnly) {
            const currentPlatforms = post.platforms || [];
            const newPlatforms = currentPlatforms.includes(platform)
                ? currentPlatforms.filter(p => p !== platform)
                : [...currentPlatforms, platform];
            onUpdate(post.id, { platforms: newPlatforms });
        }
    };

    const targetPlatforms = post.platforms || [];

    return (
        <div className="p-4 bg-slate-900/50 border border-slate-700 rounded-lg space-y-3">
            <h4 className="font-semibold text-teal-300">{post.title}</h4>
            {readOnly ? (
                 <pre className="text-sm text-gray-300 whitespace-pre-wrap font-sans p-2 bg-gray-800/50 rounded-md">{post.content}</pre>
            ) : (
                <textarea 
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onBlur={handleUpdate}
                    rows={6}
                    className="w-full p-3 bg-gray-900 rounded-md text-sm whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                />
            )}
             <div className="flex items-center gap-4 pt-2 border-t border-slate-700/50">
                <span className="text-xs font-semibold text-gray-400">Post to:</span>
                {platforms.map(platform => (
                    <label key={platform} className={`flex items-center gap-1.5 text-sm text-gray-300 ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}>
                        <input
                            type="checkbox"
                            checked={targetPlatforms.includes(platform)}
                            onChange={() => handlePlatformChange(platform)}
                            disabled={readOnly}
                            className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                        />
                        {platform.charAt(0).toUpperCase() + platform.slice(1)}
                    </label>
                ))}
            </div>
            <div className="flex justify-between items-center text-xs text-gray-400">
                {post.sentAt ? (
                    <span>Sent: {new Date(post.sentAt).toLocaleString()}</span>
                ) : (
                    <span>Score: <span className="font-bold text-teal-400">{post.score}/100</span></span>
                )}
                {!readOnly && (
                    <div className="flex items-center gap-2">
                        {onPostNow && (
                            <button 
                                onClick={() => onPostNow(post.id)}
                                disabled={postingNowId === post.id}
                                className="inline-flex items-center justify-center gap-2 px-3 py-1 text-xs font-semibold rounded-md transition-colors bg-teal-600 text-white hover:bg-teal-500 disabled:bg-teal-800/50 disabled:text-teal-400 disabled:cursor-not-allowed min-w-[80px]"
                            >
                                {postingNowId === post.id ? (
                                    <>
                                        <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        <span>Posting...</span>
                                    </>
                                ) : (
                                    <span>Post Now</span>
                                )}
                            </button>
                        )}
                        {onDelete && (
                            <button onClick={() => onDelete(post.id)} className="px-3 py-1 text-xs text-red-400 hover:bg-red-900/30 rounded-md">
                                Delete
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

const QueuedPostsDisplay: React.FC<QueuedPostsDisplayProps> = ({ 
  queuedPosts, 
  onDeletePost, 
  onUpdatePost, 
  readOnly = false,
  title = "Posts Queue",
  emptyMessage = "No posts in the queue. Generate some posts to get started!",
  onPostNow,
  postingNowId,
  error,
  onClearError
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
            {error && !readOnly && (
                <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 text-sm text-red-300 flex justify-between items-center">
                    <span>{error}</span>
                    {onClearError && <button onClick={onClearError} className="font-bold text-lg">&times;</button>}
                </div>
            )}
            {queuedPosts.length > 0 ? (
                <div className="space-y-4">
                    {queuedPosts.map(post => (
                        <PostItem 
                            key={post.id}
                            post={post}
                            onDelete={onDeletePost}
                            onUpdate={onUpdatePost}
                            readOnly={readOnly}
                            onPostNow={onPostNow}
                            postingNowId={postingNowId}
                        />
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">{emptyMessage}</p>
            )}
        </div>
    </div>
  );
};

export default QueuedPostsDisplay;
