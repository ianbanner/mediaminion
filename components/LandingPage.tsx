
import React, { useState, useEffect } from 'react';
import MarkdownRenderer from './MarkdownRenderer.tsx';

interface LandingPageProps {
  onLoginClick: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/landing_page_content.md')
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.text();
      })
      .then(text => {
        setContent(text);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching landing page content:', error);
        setContent('# Error\n\nCould not load landing page content. Please try again later.');
        setIsLoading(false);
      });
  }, []);

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      {/* Header */}
      <header className="py-4 px-6 md:px-12 flex justify-between items-center border-b border-slate-800/50 sticky top-0 bg-gray-900/80 backdrop-blur-sm z-10">
        <div className="text-xl font-bold flex items-center">
          <svg className="w-8 h-8 mr-2 text-teal-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>
          <span>Social Media Minion</span>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a>
          <a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a>
        </nav>
        <button onClick={onLoginClick} className="px-5 py-2 font-semibold bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors">
          Log In
        </button>
      </header>

      <main>
        {/* Hero Section */}
        <section className="text-center py-20 px-6 bg-slate-900/50">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
            Automate Your Thought Leadership.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
            Social Media Minion is your AI-powered content partner, designed for coaches and experts to create high-quality, authentic social media content in a fraction of the time.
          </p>
          <div className="mt-8">
            <button onClick={() => {}} className="px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-indigo-600 rounded-lg shadow-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500">
              Sign Up For Free
            </button>
            <p className="mt-3 text-sm text-gray-500">(Currently in private beta)</p>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-16 px-6 md:px-12">
          <div className="max-w-4xl mx-auto">
            {isLoading ? (
              <div className="text-center text-gray-400">Loading content...</div>
            ) : (
              <div className="prose prose-invert lg:prose-xl max-w-none">
                <MarkdownRenderer content={content} />
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 md:px-12 bg-slate-900/50 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
                <h3 className="font-semibold text-gray-200">Product</h3>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">Features</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Pricing</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Updates</a></li>
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200">Company</h3>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">About Us</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Contact</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Blog</a></li>
                </ul>
            </div>
            <div>
                <h3 className="font-semibold text-gray-200">Legal</h3>
                <ul className="mt-4 space-y-2">
                    <li><a href="#" className="text-gray-400 hover:text-white">Privacy Policy</a></li>
                    <li><a href="#" className="text-gray-400 hover:text-white">Terms of Service</a></li>
                </ul>
            </div>
             <div>
                <h3 className="font-semibold text-gray-200">Follow Us</h3>
                {/* Placeholder for social links */}
                 <div className="mt-4 text-gray-400">Links coming soon.</div>
            </div>
        </div>
        <div className="mt-12 pt-8 border-t border-slate-800 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Social Media Minion. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
