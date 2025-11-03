import React from 'react';
import { GenerationResults, TopPostAssessment } from '../services/geminiService';
import PostCard from './PostCard';
import Button from './Button';

interface Props {
  results: GenerationResults;
  articleUrl: string;
  selectedPosts: TopPostAssessment[];
  onSelectionChange: (posts: TopPostAssessment[]) => void;
  onMoveToPlanned: () => void;
}

function GenerationResultDisplay({ results, articleUrl, selectedPosts, onSelectionChange, onMoveToPlanned }: Props) {

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

  const handlePostSelection = (post: TopPostAssessment) => {
    onSelectionChange(
      selectedPosts.some(p => p.title === post.title)
        ? selectedPosts.filter(p => p.title !== post.title)
        : [...selectedPosts, post]
    );
  };

  const handleSelectAll = () => {
    if (selectedPosts.length === results.top7Assessments.length) {
        onSelectionChange([]);
    } else {
        onSelectionChange(results.top7Assessments);
    }
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
                <label className="flex items-center space-x-3 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={results.top7Assessments.length > 0 && selectedPosts.length === results.top7Assessments.length}
                        onChange={handleSelectAll}
                        className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-teal-500 focus:ring-teal-500"
                    />
                    <span className="text-gray-300 font-semibold">Select All</span>
                </label>
            </div>
            <div className="space-y-6">
                {results.top7Assessments.map((item, index) => (
                    <div key={index} className="pt-4 border-t border-slate-700/50 first:border-t-0 first:pt-0">
                        <label className="flex items-start space-x-4 cursor-pointer">
                             <input
                                type="checkbox"
                                checked={selectedPosts.some(p => p.title === item.title)}
                                onChange={() => handlePostSelection(item)}
                                className="h-5 w-5 rounded border-gray-500 bg-gray-700 text-teal-500 focus:ring-teal-500 mt-1 flex-shrink-0"
                            />
                            <div className="flex-grow space-y-3">
                                <h4 className="text-lg font-semibold text-teal-300">{index + 1}. {item.title}</h4>
                                <p className="text-sm text-gray-400 italic">"{item.assessment}"</p>
                                <pre className="mt-1 p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300">{item.content}</pre>
                            </div>
                        </label>
                    </div>
                ))}
            </div>
            {selectedPosts.length > 0 && (
                <div className="flex justify-end pt-4 border-t border-slate-700/50">
                    <Button onClick={onMoveToPlanned}>
                        Move {selectedPosts.length} Selected to Planned Posts
                    </Button>
                </div>
            )}
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
