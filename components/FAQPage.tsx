import React, { useState } from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

interface FAQPageProps {
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const faqs = [
    {
        question: "What is Social Media Minion?",
        answer: "It's an AI-powered content marketing engine designed for coaches, consultants, and experts to create high-quality, thought-leadership content for platforms like LinkedIn, Medium, and Substack. It helps you scale your unique voice, not just generate generic text."
    },
    {
        question: "Who is this for?",
        answer: "Social Media Minion is built for business coaches, consultants, executives, and any expert who wants to build their authority and trust online. If you value authenticity and want to scale your content creation without sacrificing quality, it's for you."
    },
    {
        question: "How is my data used and stored?",
        answer: "All your data, including your persona, templates, and generated content, is stored exclusively in your browser's local storage. We do not have a central database, ensuring your information remains private and under your control. You can back up all data to a local file at any time."
    },
    {
        question: "What is Ayrshare and why do I need it?",
        answer: "Ayrshare is a third-party API that allows you to post to multiple social media platforms (like LinkedIn, Facebook, Twitter, etc.) at once. You need an Ayrshare account and API key to use the automated scheduling and posting features within the Minion."
    },
    {
        question: "How does the AI learn my voice?",
        answer: "The AI learns from the information you provide in the 'Persona' panel. The 'My Professional Role', 'Target Audience', 'Reference World' (your core knowledge), and 'This is how I write articles' (your writing samples) are all used in every AI request to tailor the output to your specific style and expertise."
    },
    {
        question: "Can I use this on my phone?",
        answer: "While the application is primarily designed for desktop use to provide the best experience for content creation and editing, it is responsive and can be accessed on mobile devices for quick tasks."
    },
];

const FAQItem: React.FC<{ q: string, a: string }> = ({ q, a }) => {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div className="border-b border-slate-700 py-6">
            <button onClick={() => setIsOpen(!isOpen)} className="w-full flex justify-between items-center text-left">
                <h3 className="text-lg font-semibold text-gray-200">{q}</h3>
                <svg className={`w-6 h-6 transform transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && (
                <div className="mt-4 text-gray-300 prose prose-invert max-w-none animate-fade-in-fast">
                    <p>{a}</p>
                </div>
            )}
        </div>
    );
};

const FAQPage: React.FC<FAQPageProps> = ({ onLoginClick, onNavigate, currentPage }) => {
    return (
        <div className="bg-gray-900 text-white min-h-screen font-sans">
            <Header onLoginClick={onLoginClick} onNavigate={onNavigate} currentPage={currentPage} />
            <main className="py-20 px-6">
                <div className="max-w-3xl mx-auto">
                    <div className="text-center">
                        <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
                            Frequently Asked Questions
                        </h1>
                        <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
                            Have a question? We've got answers. If you can't find what you're looking for, feel free to contact us.
                        </p>
                    </div>
                    <div className="mt-16">
                        {faqs.map((faq, index) => (
                            <FAQItem key={index} q={faq.question} a={faq.answer} />
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default FAQPage;
