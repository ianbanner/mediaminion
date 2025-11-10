import React, { useState, useEffect, useMemo } from 'react';
import { SentPost, PostAnalytics } from '../types.ts';

interface AnalyticsPanelProps {
  sentPosts: SentPost[];
}

// Helper to generate simulated data
const generateSimulatedAnalytics = (postId: string): PostAnalytics => {
  const reach = Math.floor(Math.random() * 5000) + 500;
  const likes = Math.floor(reach * (Math.random() * 0.05 + 0.02)); // 2-7% likes
  const comments = Math.floor(likes * (Math.random() * 0.1 + 0.05)); // 5-15% of likes
  const shares = Math.floor(likes * (Math.random() * 0.08 + 0.02)); // 2-10% of likes
  const clicks = Math.floor(reach * (Math.random() * 0.03 + 0.01)); // 1-4% clicks
  const engagement = likes + comments + shares;
  const engagementRate = reach > 0 ? parseFloat(((engagement / reach) * 100).toFixed(2)) : 0;
  
  return { postId, reach, likes, comments, shares, clicks, engagementRate };
};

const StatCard: React.FC<{ title: string; value: string; subtext?: string; small?: boolean }> = ({ title, value, subtext, small = false }) => (
    <div className={`bg-slate-900/50 p-4 rounded-lg border border-slate-700 ${small ? 'text-center' : ''}`}>
        <p className={`text-gray-400 ${small ? 'text-xs' : 'text-sm'}`}>{title}</p>
        <p className={`font-bold text-white ${small ? 'text-2xl' : 'text-3xl'}`}>{value}</p>
        {subtext && <p className="text-xs text-gray-500">{subtext}</p>}
    </div>
);

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ sentPosts }) => {
  const [analyticsData, setAnalyticsData] = useState<Map<string, PostAnalytics>>(new Map());

  useEffect(() => {
    setAnalyticsData(prevAnalytics => {
        const newAnalytics = new Map(prevAnalytics);
        let updated = false;
        sentPosts.forEach(post => {
            if (!newAnalytics.has(post.id)) {
                newAnalytics.set(post.id, generateSimulatedAnalytics(post.id));
                updated = true;
            }
        });
        return updated ? newAnalytics : prevAnalytics;
    });
  }, [sentPosts]);
  
  const combinedData = useMemo(() => {
    return sentPosts.map(post => {
      const analytics = analyticsData.get(post.id);
      return { ...post, analytics };
    }).filter(item => item.analytics).sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }, [sentPosts, analyticsData]);

  const analyticsArray = useMemo(() => Array.from(analyticsData.values()), [analyticsData]);

  const totalReach = useMemo(() => analyticsArray.reduce((sum, a) => sum + a.reach, 0), [analyticsArray]);
  const totalEngagement = useMemo(() => analyticsArray.reduce((sum, a) => sum + a.likes + a.comments + a.shares, 0), [analyticsArray]);
  const avgEngagementRate = useMemo(() => {
    if (analyticsArray.length === 0) return 0;
    const totalRate = analyticsArray.reduce((sum, a) => sum + a.engagementRate, 0);
    return parseFloat((totalRate / analyticsArray.length).toFixed(2));
  }, [analyticsArray]);


  return (
    <div className="space-y-8 animate-fade-in">
        <h1 className="text-3xl font-bold">Post Analytics</h1>
        <p className="text-gray-400">
            Performance data for posts sent via Ayrshare. This data is currently simulated for demonstration purposes.
        </p>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Total Posts Analyzed" value={sentPosts.length.toString()} />
            <StatCard title="Total Reach" value={totalReach.toLocaleString()} subtext="Estimated total impressions" />
            <StatCard title="Total Engagements" value={totalEngagement.toLocaleString()} subtext="Likes + Comments + Shares" />
            <StatCard title="Avg. Engagement Rate" value={`${avgEngagementRate}%`} />
        </div>

        {/* Individual Post Performance */}
        <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-gray-200">Individual Post Performance</h2>
            {combinedData.length > 0 ? (
                <div className="space-y-6">
                    {combinedData.map(item => (
                        <div key={item.id} className="pt-4 border-t border-slate-700/50 first:border-t-0 first:pt-0">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h3 className="font-semibold text-teal-300">{item.title}</h3>
                                    <p className="text-xs text-gray-500">Sent: {new Date(item.sentAt).toLocaleString()}</p>
                                </div>
                                <div className="flex gap-2 flex-shrink-0">
                                    {item.platforms.map(p => (
                                        <span key={p} className="text-xs font-semibold px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full capitalize">{p}</span>
                                    ))}
                                </div>
                            </div>
                            <p className="text-sm text-gray-300 p-3 bg-gray-900/50 rounded-md border border-slate-700 max-h-24 overflow-y-auto font-sans whitespace-pre-wrap">
                                {item.content.substring(0, 300)}{item.content.length > 300 ? '...' : ''}
                            </p>
                            <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                                <StatCard small title="Reach" value={item.analytics!.reach.toLocaleString()} />
                                <StatCard small title="Likes" value={item.analytics!.likes.toLocaleString()} />
                                <StatCard small title="Comments" value={item.analytics!.comments.toLocaleString()} />
                                <StatCard small title="Shares" value={item.analytics!.shares.toLocaleString()} />
                                <StatCard small title="Clicks" value={item.analytics!.clicks.toLocaleString()} />
                                <StatCard small title="Eng. Rate" value={`${item.analytics!.engagementRate}%`} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-center text-gray-500 py-8">No sent posts to analyze yet. Send some posts from the queue!</p>
            )}
        </div>
    </div>
  );
};

export default AnalyticsPanel;
