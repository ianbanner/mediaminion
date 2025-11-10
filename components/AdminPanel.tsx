import React, { useState, useMemo, useCallback } from 'react';
import { AdminSettings, UserActivity } from '../types.ts';
import Button from './Button.tsx';

interface AdminPanelProps {
  settings: AdminSettings;
  onSettingsChange: (newSettings: AdminSettings) => void;
}

interface ActivityStats {
    user: string;
    totalPosts: number;
    postsLastDay: number;
    postsLastWeek: number;
    postsLastMonth: number;
    totalArticles: number;
    articlesLastDay: number;
    articlesLastWeek: number;
    articlesLastMonth: number;
}

const UserActivityTable: React.FC<{ activityData: Record<string, UserActivity> }> = ({ activityData }) => {
    
    const calculatedStats: ActivityStats[] = useMemo(() => {
        const now = Date.now();
        const lastDay = now - 24 * 60 * 60 * 1000;
        const lastWeek = now - 7 * 24 * 60 * 60 * 1000;
        const lastMonth = now - 30 * 24 * 60 * 60 * 1000;

        return Object.entries(activityData).map(([user, activity]) => {
            // Fix: Cast `activity` to `UserActivity` to address TypeScript's weak type inference for `Object.entries`.
            const posts = (activity as UserActivity).posts || [];
            const articles = (activity as UserActivity).articles || [];

            return {
                user,
                totalPosts: posts.length,
                postsLastDay: posts.filter(ts => ts > lastDay).length,
                postsLastWeek: posts.filter(ts => ts > lastWeek).length,
                postsLastMonth: posts.filter(ts => ts > lastMonth).length,
                totalArticles: articles.length,
                articlesLastDay: articles.filter(ts => ts > lastDay).length,
                articlesLastWeek: articles.filter(ts => ts > lastWeek).length,
                articlesLastMonth: articles.filter(ts => ts > lastMonth).length,
            };
        });
    }, [activityData]);

    const handleDownload = useCallback(() => {
        const headers = [
            'User', 'Total Posts', 'Posts (Day)', 'Posts (Week)', 'Posts (Month)',
            'Total Articles', 'Articles (Day)', 'Articles (Week)', 'Articles (Month)'
        ];
        const rows = calculatedStats.map(stats => [
            stats.user, stats.totalPosts, stats.postsLastDay, stats.postsLastWeek, stats.postsLastMonth,
            stats.totalArticles, stats.articlesLastDay, stats.articlesLastWeek, stats.articlesLastMonth
        ].join(','));

        const csvContent = [headers.join(','), ...rows].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement("a");
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            const dateTime = new Date().toISOString().replace('T', '_').replace(/:/g, '-').slice(0, 19);
            link.setAttribute("href", url);
            link.setAttribute("download", `minion-activity-report_${dateTime}.csv`);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }, [calculatedStats]);

    if (calculatedStats.length === 0) {
        return <p className="text-gray-400">No user activity recorded yet.</p>;
    }

    return (
        <div className="space-y-4">
             <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold">User Activity</h3>
                <Button onClick={handleDownload} className="px-4 py-2 text-sm">Download CSV</Button>
            </div>
            <div className="overflow-x-auto rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-800">
                        <tr>
                            <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Total Posts</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Week</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Month</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Total Articles</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Day</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Week</th>
                            <th scope="col" className="px-4 py-3 text-center text-xs font-medium text-gray-300 uppercase tracking-wider">Month</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-900/50 divide-y divide-slate-700">
                        {calculatedStats.map(stats => (
                            <tr key={stats.user}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-200">{stats.user}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300 font-bold">{stats.totalPosts}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.postsLastDay}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.postsLastWeek}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.postsLastMonth}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300 font-bold">{stats.totalArticles}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.articlesLastDay}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.articlesLastWeek}</td>
                                <td className="px-4 py-3 text-center text-sm text-gray-300">{stats.articlesLastMonth}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};


const AdminPanel: React.FC<AdminPanelProps> = ({ settings, onSettingsChange }) => {
  const [password, setPassword] = useState(settings.secretPassword);
  const [emails, setEmails] = useState(settings.authorizedEmails.join('\n'));
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    const emailList = emails.split('\n').map(e => e.trim()).filter(Boolean);
    onSettingsChange({
      ...settings,
      authorizedEmails: emailList,
      secretPassword: password,
    });
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  const buttonText = () => {
      switch (saveStatus) {
          case 'saving': return 'Your Minion Is Working';
          case 'saved': return 'Saved!';
          default: return 'Save Admin Settings';
      }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <h1 className="text-3xl font-bold">Admin Panel</h1>
      
       <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
         <UserActivityTable activityData={settings.userActivity || {}} />
       </div>

      <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg space-y-6">
        <h3 className="text-xl font-bold">Access Management</h3>
        <p className="text-gray-400 text-sm">Manage access for other users of the Social Media Minion.</p>
        <div>
          <label htmlFor="secretPassword" className="block text-sm font-medium text-gray-300">Secret Password</label>
          <p className="text-xs text-gray-500 mb-1">All non-admin users will need this password to sign in.</p>
          <input
            id="secretPassword"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full max-w-sm p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400"
          />
        </div>

        <div>
          <label htmlFor="authorizedEmails" className="block text-sm font-medium text-gray-300">Authorized Email Addresses</label>
          <p className="text-xs text-gray-500 mb-1">Enter one email address per line. Only these users will be able to sign in.</p>
          <textarea
            id="authorizedEmails"
            value={emails}
            onChange={(e) => setEmails(e.target.value)}
            rows={10}
            className="mt-1 w-full p-2 bg-gray-900 border border-slate-600 rounded-md focus:ring-2 focus:ring-teal-400 font-mono text-sm"
            placeholder="user1@example.com&#10;user2@example.com"
          />
        </div>

        <div className="pt-4 border-t border-slate-700/50 text-right">
          <Button onClick={handleSave} isLoading={saveStatus === 'saving'}>
            {buttonText()}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;