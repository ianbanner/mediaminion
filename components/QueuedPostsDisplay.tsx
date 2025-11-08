import React, { useState, useEffect } from 'react';
import { QueuedPost } from '../types.ts';

interface QueuedPostsDisplayProps {
  queuedPosts: QueuedPost[];
  onDeletePost?: (id: string) => void;
  onUpdatePost?: (id: string, updates: Partial<QueuedPost>) => void;
  readOnly?: boolean;
  title?: string;
  emptyMessage?: string;
}

const PostItem: React.FC<{
  post: QueuedPost;
  onDelete?: (id: string) => void;
  onUpdate?: (id: string, updates: Partial<QueuedPost>) => void;
  readOnly?: boolean;
}> = ({ post, onDelete, onUpdate, readOnly }) => {
    const [content, setContent] = useState(post.content);

    useEffect(() => {
        setContent(post.content);
    }, [post.content]);
    
    const handleUpdate = () => {
        if(onUpdate && content !== post.content) {
            onUpdate(post.id, { content });
        }
    };

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
            <div className="flex justify-between items-center text-xs text-gray-400">
                {post.sentAt ? (
                    <span>Sent: {new Date(post.sentAt).toLocaleString()}</span>
                ) : (
                    <span>Score: <span className="font-bold text-teal-400">{post.score}/100</span></span>
                )}
                {!readOnly && onDelete && (
                    <button onClick={() => onDelete(post.id)} className="px-3 py-1 text-xs text-red-400 hover:bg-red-900/30 rounded-md">
                        Delete
                    </button>
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
  title = "Ayrshare Queue",
  emptyMessage = "No posts in the queue. Generate some posts to get started!"
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
            <h2 className="text-2xl font-bold text-gray-200">{title}</h2>
            {queuedPosts.length > 0 ? (
                <div className="space-y-4">
                    {queuedPosts.map(post => (
                        <PostItem 
                            key={post.id}
                            post={post}
                            onDelete={onDeletePost}
                            onUpdate={onUpdatePost}
                            readOnly={readOnly}
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
