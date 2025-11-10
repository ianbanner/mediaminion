import React from 'react';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

interface PricingPageProps {
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const CheckIcon = () => (
    <svg className="h-5 w-5 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
);

const PricingTier: React.FC<{
    name: string;
    icon: React.ReactNode;
    price: string;
    description: string;
    features: string[];
    buttonText: string;
    isFeatured?: boolean;
}> = ({ name, icon, price, description, features, buttonText, isFeatured }) => (
    <div className={`p-8 rounded-2xl border ${isFeatured ? 'border-teal-500 bg-slate-900/50 shadow-lg shadow-teal-500/10' : 'border-slate-700 bg-slate-900'}`}>
        <div className="flex items-center gap-4">
            <div className="text-teal-400">{icon}</div>
            <h3 className="text-2xl font-bold">{name}</h3>
        </div>
        <p className="mt-4 text-gray-400">{description}</p>
        <p className="mt-6 text-4xl font-extrabold">{price}</p>
        <button className={`w-full mt-8 py-3 font-semibold rounded-lg transition-colors ${isFeatured ? 'bg-teal-600 hover:bg-teal-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-gray-300'}`}>
            {buttonText}
        </button>
        <ul className="mt-8 space-y-4 text-gray-300">
            {features.map((feature, index) => (
                <li key={index} className="flex items-start gap-3">
                    <CheckIcon />
                    <span>{feature}</span>
                </li>
            ))}
        </ul>
    </div>
);


const PricingPage: React.FC<PricingPageProps> = ({ onLoginClick, onNavigate, currentPage }) => {
  return (
    <div className="bg-gray-900 text-white min-h-screen font-sans">
      <Header onLoginClick={onLoginClick} onNavigate={onNavigate} currentPage={currentPage} />
      <main className="py-20 px-6">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-teal-300 to-indigo-400">
            Find the Plan That's Right for You
          </h1>
          <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-300">
            Start for free, then scale as you grow. All plans are designed to save you time and amplify your voice.
          </p>
        </div>
        <div className="max-w-5xl mx-auto mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <PricingTier
            name="Free"
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path></svg>}
            price="$0"
            description="Get a feel for the platform and start creating."
            features={[
              "5 Post generations per month",
              "10 Article ideas per month",
              "Access to all Post Templates",
              "Community support"
            ]}
            buttonText="Get Started"
          />
          <PricingTier
            isFeatured
            name="Minion for Solo"
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>}
            price="$49/mo"
            description="The complete toolkit for individual experts."
            features={[
              "Everything in Free, plus:",
              "Unlimited post generations",
              "Unlimited article ideas",
              "Full Article Generation workflow",
              "Ayrshare integration for scheduling",
              "Create custom post & article templates",
              "Email support"
            ]}
            buttonText="Start Free Trial"
          />
          <PricingTier
            name="Minion for Teams"
            icon={<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>}
            price="$99/mo"
            description="Collaborate and scale your content production."
            features={[
              "Everything in Solo, plus:",
              "Up to 3 users",
              "Shared template libraries",
              "Centralized user management",
              "User activity dashboard",
              "Priority support"
            ]}
            buttonText="Contact Sales"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default PricingPage;
