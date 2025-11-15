import React, { useState, useEffect, useMemo } from 'react';
import { SentPost, PostAnalytics, PlatformAnalytics } from '../types.ts';
import { getPostAnalytics, AnalyticsResult } from '../services/ayrshareService.ts';

interface AnalyticsPanelProps {
  sentPosts: SentPost[];
  ayrshareApiKey: string;
}

interface KpiCardProps {
    title: string;
    value: string;
    description: string;
}

const KpiCard: React.FC<KpiCardProps> = ({ title, value, description }) => (
    <div className="p-4 bg-slate-900/70 border border-slate-700 rounded-lg">
        <h3 className="text-sm font-medium text-gray-400">{title}</h3>
        <p className="mt-1 text-3xl font-bold text-teal-300">{value}</p>
        <p className="mt-1 text-xs text-gray-500">{description}</p>
    </div>
);

const AnalyticsPanel: React.FC<AnalyticsPanelProps> = ({ sentPosts, ayrshareApiKey }) => {
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [analyticsData, setAnalyticsData] = useState<Record<string, PostAnalytics>>({});
    const [debugLog, setDebugLog] = useState<AnalyticsResult[]>([]);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        if (!ayrshareApiKey) {
            setError("Ayrshare API Key is not set. Please add it in the Settings panel.");
            return;
        }
        if (sentPosts.length === 0) {
            setError(null);
            return;
        }

        const fetchData = async () => {
            setIsLoading(true);
            setError(null);
            setDebugLog([]);
            setAnalyticsData({});

            const promises = sentPosts.map(post => getPostAnalytics(post.id, ayrshareApiKey));
            const results = await Promise.allSettled(promises);

            const newDebugLog: AnalyticsResult[] = [];
            const newAnalyticsData: Record<string, PostAnalytics> = {};
            const errors: string[] = [];

            results.forEach((result, index) => {
                const post = sentPosts[index];
                if (result.status === 'fulfilled') {
                    const analyticsResult = result.value;
                    newDebugLog.push(analyticsResult);
                    if (analyticsResult.success && analyticsResult.data) {
                        newAnalyticsData[post.id] = analyticsResult.data;
                    } else if (!analyticsResult.success) {
                        errors.push(`Post ${post.id} (${post.title}): ${analyticsResult.message}`);
                    }
                } else {
                    errors.push(`Post ${post.id} (${post.title}): Failed to fetch - ${result.reason}`);
                }
            });

            setDebugLog(newDebugLog);
            setAnalyticsData(newAnalyticsData);
            if (errors.length > 0) {
                setError(`Encountered ${errors.length} error(s). See debug log for details. Common issues: post is too new for analytics (wait up to 1 hour), or network/CORS problems.`);
            }
            setIsLoading(false);
        };

        fetchData();
    }, [sentPosts, ayrshareApiKey]);
    
    const { kpis, platforms } = useMemo(() => {
        const allMetrics: PlatformAnalytics[] = Object.values(analyticsData).flatMap(post => Object.values(post));
        
        const totalImpressions = allMetrics.reduce((sum, p) => sum + (p.impressions || p.views || p.reach || 0), 0);
        const totalEngagements = allMetrics.reduce((sum, p) => sum + (p.likes || 0) + (p.comments || 0) + (p.shares || 0) + (p.retweets || 0), 0);
        const totalClicks = allMetrics.reduce((sum, p) => sum + (p.clicks || 0), 0);
        
        const uniquePlatforms = [...new Set(Object.values(analyticsData).flatMap(post => Object.keys(post)))];

        return {
            kpis: {
                totalPosts: Object.keys(analyticsData).length,
                totalImpressions: totalImpressions.toLocaleString(),
                totalEngagements: totalEngagements.toLocaleString(),
                totalClicks: totalClicks.toLocaleString(),
            },
            platforms: uniquePlatforms
        };
    }, [analyticsData]);

    const renderTable = (platformFilter?: string) => {
        const postsWithData = sentPosts.filter(p => analyticsData[p.id]);

        return (
             <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Post</th>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Platform</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Impressions</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Likes</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Comments</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Shares</th>
                            <th className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Clicks</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                        {postsWithData.flatMap(post => {
                            const postAnalytics = analyticsData[post.id];
                            const platformEntries = Object.entries(postAnalytics).filter(([platform]) => !platformFilter || platform === platformFilter);

                            if (platformEntries.length === 0 && platformFilter) return [];

                            return platformEntries.map(([platform, metrics], index) => {
                                // FIX: Explicitly cast `metrics` to `PlatformAnalytics` to address type inference issues
                                // with `Object.entries` where it may be inferred as `unknown`.
                                const typedMetrics = metrics as PlatformAnalytics;
                                return (
                                <tr key={`${post.id}-${platform}`}>
                                    {index === 0 && <td rowSpan={platformEntries.length} className="px-4 py-3 align-top whitespace-nowrap text-sm font-medium text-gray-200">{post.title}</td>}
                                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">{platform}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-300">{typedMetrics.impressions ?? typedMetrics.views ?? typedMetrics.reach ?? 'N/A'}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-300">{typedMetrics.likes ?? 'N/A'}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-300">{typedMetrics.comments ?? 'N/A'}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-300">{typedMetrics.shares ?? typedMetrics.retweets ?? 'N/A'}</td>
                                    <td className="px-4 py-3 text-center text-sm text-gray-300">{typedMetrics.clicks ?? 'N/A'}</td>
                                </tr>
                            );
                            });
                        })}
                    </tbody>
                </table>
             </div>
        )
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">Post Analytics</h1>

             <details className="p-4 bg-gray-900/70 border border-slate-700 rounded-lg">
                <summary className="cursor-pointer font-semibold text-yellow-300">
                    View API Debug Log ({debugLog.length} calls)
                </summary>
                <pre className="mt-4 text-xs font-mono text-gray-400 space-y-2 max-h-96 overflow-y-auto p-2 bg-slate-800 rounded">
                    {debugLog.length > 0 ? JSON.stringify(debugLog, null, 2) : "No API calls made yet."}
                </pre>
            </details>

            {error && (
                <div className="p-4 bg-red-900/50 border border-red-700 text-red-300 rounded-lg">{error}</div>
            )}
            
            {isLoading && (
                <p className="text-center text-gray-400 py-8">Fetching analytics from Ayrshare...</p>
            )}

            {!isLoading && sentPosts.length === 0 && (
                 <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg text-center text-gray-500">
                    No posts have been sent yet. Once you send posts, their analytics will appear here.
                 </div>
            )}

            {!isLoading && sentPosts.length > 0 && Object.keys(analyticsData).length > 0 && (
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <KpiCard title="Analyzed Posts" value={kpis.totalPosts.toString()} description="Posts with available data" />
                        <KpiCard title="Total Impressions" value={kpis.totalImpressions} description="Reach, Views, Impressions" />
                        <KpiCard title="Total Engagements" value={kpis.totalEngagements} description="Likes, Comments, Shares" />
                        <KpiCard title="Total Clicks" value={kpis.totalClicks} description="Clicks on links in posts" />
                    </div>

                    <div>
                        <div className="border-b border-slate-700 mb-4">
                            <nav className="-mb-px flex space-x-6">
                                <button onClick={() => setActiveTab('overview')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm ${activeTab === 'overview' ? 'border-teal-400 text-teal-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                                    Overview
                                </button>
                                {platforms.map(platform => (
                                    <button 
                                        key={platform}
                                        onClick={() => setActiveTab(platform)} 
                                        className={`whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm capitalize ${activeTab === platform ? 'border-teal-400 text-teal-300' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>
                                        {platform}
                                    </button>
                                ))}
                            </nav>
                        </div>
                        <div>
                            {activeTab === 'overview' && renderTable()}
                            {platforms.map(platform => activeTab === platform && <div key={platform}>{renderTable(platform)}</div>)}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AnalyticsPanel;