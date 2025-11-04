
import React, { useState, useCallback, useEffect } from 'react';
import { GenerationResults, TopPostAssessment } from '../services/geminiService';
import PostCard from './PostCard';

interface Props {
  results: GenerationResults;
  articleUrl: string;
  onSendToAyrshareQueue: (post: TopPostAssessment) => void;
}

function GenerationResultDisplay({ results, articleUrl, onSendToAyrshareQueue }: Props) {
  const [editableAssessments, setEditableAssessments] = useState<TopPostAssessment[]>(results.top7Assessments);
  const [queuedPostTitles, setQueuedPostTitles] = useState<string[]>([]);
  const [copiedPostTitle, setCopiedPostTitle] = useState<string | null>(null);

  useEffect(() => {
    setEditableAssessments(results.top7Assessments);
    setQueuedPostTitles([]); // Reset queued status when results change
  }, [results]);

  const handleContentChange = (index: number, newContent: string) => {
    const updatedAssessments = [...editableAssessments];
    updatedAssessments[index] = { ...updatedAssessments[index], content: newContent };
    setEditableAssessments(updatedAssessments);
  };

  const handleCopy = useCallback((content: string, title: string) => {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedPostTitle(title);
      setTimeout(() => setCopiedPostTitle(null), 2000);
    });
  }, []);

  const handleSendToQueue = (post: TopPostAssessment) => {
    onSendToAyrshareQueue(post);
    setQueuedPostTitles(prev => [...prev, post.title]);
  };

  const handleDownloadMD = () => {
    const { rankedTable, top7Assessments } = results;

    let mdContent = `# LinkedIn Post Generation Report\n\n`;
    if (articleUrl) {
      mdContent += `**Source Article:** ${articleUrl}\n\n`;
    }

    mdContent += `## Ranked Table of All Posts\n\n`;
    mdContent += `| Rank | Template Title | Score |\n`;
    mdContent += `|:----|:---|:---:|\n`;
    rankedTable.forEach((post, index) => {
      mdContent += `| ${index + 1} | ${post.title} | ${post.score}/100 |\n`;
    });

    mdContent += `\n## Top 7 Post Assessments\n\n`;
    top7Assessments.forEach((item, index) => {
      mdContent += `### ${index + 1}. ${item.title}\n\n`;
      mdContent += `**Assessment:**\n${item.assessment}\n\n`;
      mdContent += `**Post Content:**\n\`\`\`\n${item.content}\n\`\`\`\n\n---\n\n`;
    });

    const blob = new Blob([mdContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const date = new Date().toISOString().split('T')[0];
    const safeTitle = articleUrl.split('/').pop()?.replace(/[^a-zA-Z0-9]/g, '-') || 'report';
    a.download = `${date}-${safeTitle}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
        <div className="flex justify-between items-center">
             <h2 className="text-2xl font-bold text-gray-200">Generation Results</h2>
             <button
                onClick={handleDownloadMD}
                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-green-600 rounded-md hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                Download Results as MD
             </button>
        </div>

      {/* Ranked Table */}
      <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
        <h3 className="text-xl font-bold text-gray-200">Ranked Table of All Posts</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-700">
          <table className="min-w-full divide-y divide-slate-700">
            <thead className="bg-slate-800">
              <tr>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Template Title</th>
                <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
              </tr>
            </thead>
            <tbody className="bg-slate-900/50 divide-y divide-slate-700">
              {results.rankedTable.map((post, index) => (
                <tr key={index} className="hover:bg-slate-800/60">
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-200">{index + 1}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{post.title}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-teal-400 text-center">{post.score}/100</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Top 7 Assessments */}
       <div className="w-full p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
            <div className="flex justify-between items-center pb-4 border-b border-slate-700/50">
                <h3 className="text-xl font-bold text-gray-200">Top 7 Post Assessments</h3>
            </div>
            <div className="space-y-6">
                {editableAssessments.map((item, index) => {
                    const isCopied = copiedPostTitle === item.title;
                    const isQueued = queuedPostTitles.includes(item.title);
                    return (
                        <div key={index} className="pt-4 border-t border-slate-700/50 first:border-t-0 first:pt-0">
                            <div className="flex-grow space-y-3">
                                <h4 className="text-lg font-semibold text-teal-300">{index + 1}. {item.title}</h4>
                                <p className="text-sm text-gray-400 italic">"{item.assessment}"</p>
                                <textarea 
                                    value={item.content}
                                    onChange={(e) => handleContentChange(index, e.target.value)}
                                    rows={8}
                                    className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
                                />
                            </div>
                             <div className="flex items-center justify-end gap-3 mt-3">
                                <button 
                                    onClick={() => handleCopy(item.content, item.title)} 
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white"
                                >
                                    {isCopied ? (
                                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg> Copied!</>
                                    ) : (
                                      <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg> Copy Post</>
                                    )}
                                </button>
                                <button
                                    onClick={() => handleSendToQueue(item)}
                                    disabled={isQueued}
                                    className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-md transition-colors bg-teal-600 text-white hover:bg-teal-500 disabled:bg-teal-800/50 disabled:text-teal-400 disabled:cursor-not-allowed"
                                >
                                     {isQueued ? (
                                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Queued</>
                                     ) : (
                                        <><svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>Send to Ayrshare Queue</>
                                     )}
                                </button>
                            </div>
                        </div>
                    )
                })}
            </div>
       </div>

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

// Expose PostCard through the main component for namespacing in App.tsx
GenerationResultDisplay.PostCard = PostCard;

export default GenerationResultDisplay;
