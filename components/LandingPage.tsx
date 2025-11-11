
import React, { useState, useEffect, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import SavingsCalculator from './SavingsCalculator.tsx';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

interface LandingPageProps {
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onNavigate, currentPage }) => {
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const calculatorRef = useRef<HTMLElement>(null);

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

  const scrollToCalculator = () => {
    calculatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header onLoginClick={onLoginClick} onNavigate={onNavigate} currentPage={currentPage} />

      <main>
        {/* Hero Section */}
        <section className="text-center py-20 px-6 bg-slate-900/50">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
            Stop Churning Content.<br />Start Building Authority.
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
            Social Media Minion is your AI-powered content partner, designed for coaches and experts to create high-quality, authentic social media content in a fraction of the time.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-6">
            <div className="text-center">
                <button onClick={() => onNavigate('pricing')} className="px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500">
                    Sign Up For Free
                </button>
                <p className="text-xs text-gray-500 mt-2">(Currently in Beta)</p>
            </div>
            <div className="text-center">
                <button onClick={scrollToCalculator} className="px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-blue-600 rounded-lg shadow-lg hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500">
                    What can you save?
                </button>
                <p className="text-xs text-gray-500 mt-2">Calculate your ROI</p>
            </div>
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

        {/* ROI Calculator Section */}
        <section ref={calculatorRef} id="roi-calculator" className="py-16 px-6 md:px-12 bg-slate-900/50 scroll-mt-20">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
                Calculate Your ROI
              </h2>
              <p className="mt-4 text-lg text-gray-300 max-w-3xl mx-auto">
                What took an hour now takes 10 minutes. Use the calculator below to see how much time and money you can save.
              </p>
            </div>
            <div className="max-w-4xl mx-auto mt-12">
              <SavingsCalculator />
            </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default LandingPage;