import React from 'react';
import { ResearchedPost } from '../services/geminiService.ts';
import Button from './Button.tsx';

interface PostResearcherPanelProps {
  researchScript: string;
  onResearchScriptChange: (script: string) => void;
  onResearchPosts: () => void;
  isLoading: boolean;
  results: ResearchedPost[] | null;
}

const PostResearcherPanel: React.FC<PostResearcherPanelProps> = ({
  researchScript,
  onResearchScriptChange,
  onResearchPosts,
  isLoading,
  results,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Post Researcher</h1>
      <p className="text-gray-400">
        Instruct the AI to use Google Search to find high-performing posts related to your topics. Analyze what makes them work to inspire your own content.
      </p>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <div>
          <label htmlFor="research-script" className="block text-sm font-medium text-gray-300 mb-2">
            AI Research Instructions
          </label>
          <textarea
            id="research-script"
            value={researchScript}
            onChange={(e) => onResearchScriptChange(e.target.value)}
            rows={8}
            className="w-full p-3 bg-gray-900 rounded-md text-sm font-mono whitespace-pre-wrap text-gray-300 border border-slate-600 focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div className="text-center pt-4 border-t border-slate-700/50">
          <Button onClick={onResearchPosts} isLoading={isLoading}>
            {isLoading ? 'Your Minion Is Working' : 'Research Popular Posts'}
          </Button>
        </div>
      </div>

      {results && (
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
          <h2 className="text-2xl font-bold text-gray-200">Research Results</h2>
          {results.length > 0 ? (
            <div className="space-y-6">
              {results.map((post, index) => (
                <div key={index} className="pt-4 border-t border-slate-700/50 first:border-t-0 first:pt-0">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-2">
                      <h3 className="font-semibold text-teal-300">Post Content & Analysis</h3>
                      <pre className="text-sm text-gray-200 p-3 bg-gray-900/70 rounded-lg border border-slate-700 whitespace-pre-wrap font-sans">{post.postContent}</pre>
                      <p className="text-sm text-gray-400"><strong className="text-gray-300">Analysis:</strong> {post.analysis}</p>
                    </div>
                    <div className="space-y-2 text-sm">
                        <p><strong className="text-gray-400">Engagement:</strong> {post.engagementMetrics}</p>
                        <p><strong className="text-gray-400">Source:</strong> <a href={post.postUrl} target="_blank" rel="noopener noreferrer" className="text-teal-400 hover:underline break-all">View Post</a></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-400 py-8">No relevant posts found based on your instructions.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default PostResearcherPanel;
