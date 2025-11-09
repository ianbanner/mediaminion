import React, { useState, useMemo } from 'react';

interface LoginScreenProps {
  onSignIn: (email: string, password?: string) => void;
  error: React.ReactNode | null;
  adminEmail: string;
}

const LoginScreen: React.FC<LoginScreenProps> = ({ onSignIn, error, adminEmail }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const isStandardUser = useMemo(() => {
    return email.trim() !== '' && email.toLowerCase() !== adminEmail.toLowerCase();
  }, [email, adminEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSignIn(email, password);
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-slate-800/50 border border-slate-700 rounded-2xl shadow-xl text-center">
        <div>
          <h2 className="text-3xl font-bold text-white flex items-center justify-center">
            <svg className="w-10 h-10 mr-3 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
            <span>Social Media Minion</span>
          </h2>
          <p className="mt-4 text-gray-400">Your AI-powered assistant for social media content.</p>
        </div>

        {error && (
          <div className="bg-red-900/50 p-4 rounded-lg border border-red-700 text-sm text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
            <label htmlFor="email-input" className="sr-only">Email Address</label>
            <input
                id="email-input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full px-4 py-3 bg-gray-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
            />

            {isStandardUser && (
              <div className="animate-fade-in-fast">
                <label htmlFor="password-input" className="sr-only">Secret Password</label>
                <input
                    id="password-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter the secret password"
                    required
                    className="w-full px-4 py-3 bg-gray-900 border border-slate-600 rounded-lg focus:ring-2 focus:ring-teal-400 focus:outline-none"
                />
              </div>
            )}
            
            <button
                type="submit"
                className="w-full inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white transition-all duration-200 bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 disabled:opacity-50"
                disabled={!email || (isStandardUser && !password)}
            >
                Sign In / Continue
            </button>
        </form>
      </div>
    </div>
  );
};

export default LoginScreen;