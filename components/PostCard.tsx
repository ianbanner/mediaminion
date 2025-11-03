import React, { useState, useCallback } from 'react';

interface PostCardProps {
  platform: string;
  content: string;
  rank?: number;
}

const PlatformIcon: React.FC<{ platform: string }> = ({ platform }) => {
  const commonClasses = "w-6 h-6 mr-3";
  switch (platform.toLowerCase()) {
    case 'linkedin':
      return <svg className={commonClasses} fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>;
    case 'x':
      return <svg className={commonClasses} fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.617l-5.21-6.817-6.044 6.817h-3.308l7.73-8.805-7.96-10.69h6.761l4.634 6.257 5.49-6.257z"/></svg>;
    case 'facebook':
      return <svg className={commonClasses} fill="currentColor" viewBox="0 0 24 24"><path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v2.385z"/></svg>;
    default:
      return null;
  }
};

const PostCard: React.FC<PostCardProps> = ({ platform, content, rank }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [content]);

  return (
    <div className="w-full bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg transition-all duration-300 ease-in-out transform hover:-translate-y-1 animate-fade-in relative group">
       {rank && (
          <div className="absolute top-0 left-0 bg-teal-500 text-white text-xs font-bold w-8 h-8 flex items-center justify-center rounded-br-lg rounded-tl-xl z-10">
            #{rank}
          </div>
        )}
      <div className={`p-6 ${rank ? 'pt-12' : ''}`}>
        <div className="flex items-center mb-4">
            <PlatformIcon platform={platform} />
            <h3 className="text-xl font-bold tracking-wide text-cyan-300">{platform} Post</h3>
        </div>
        <p className="text-gray-300 whitespace-pre-wrap font-mono text-sm leading-relaxed">
            {content}
        </p>
      </div>
      <button 
        onClick={handleCopy} 
        className="absolute top-4 right-4 p-2 rounded-full bg-slate-700 text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-slate-600 hover:text-white focus:outline-none focus:ring-2 focus:ring-cyan-400 z-10"
        aria-label={`Copy ${platform} post to clipboard`}
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        )}
      </button>
       <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default PostCard;
