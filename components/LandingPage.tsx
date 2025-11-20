
import React, { useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer.tsx';
import SavingsCalculator from './SavingsCalculator.tsx';
import Header from './Header.tsx';
import Footer from './Footer.tsx';

const LANDING_CONTENT = `
As an expert coach or consultant, your time is your most valuable asset. You know you need to build your personal brand on platforms like LinkedIn, but the endless cycle of content creation is a drain on the very energy you need to serve your clients.

You're stuck between:
-   **Spending hours** every week brainstorming, writing, and editing posts.
-   **Hiring expensive agencies** that don't truly capture your unique voice.
-   **Posting generic content** that fails to connect with your high-value audience.

This is more than just a time-suck. It's an authenticity gap. The content you're putting out doesn't reflect the depth of your expertise, and it's not attracting the clients you're best equipped to help.

---

## You've got something to say. We make it easy to say it.

Your mind is filled with frameworks, client stories, and hard-won insights. You see the common mistakes in your industry and know exactly how to fix them. But translating that deep expertise into a steady stream of compelling content feels like a second job. Ideas get trapped in note apps, brilliant insights become half-finished drafts, and the sheer effort of writing, editing, and formatting for different platforms is overwhelming.

This isn't just writer's block; it's an impact bottleneck. Every unpublished idea is a missed opportunity to connect with a potential client, shape a conversation in your industry, or build your reputation as the go-to expert. Your authority remains locked away, while others with less substance but better content systems dominate the conversation.

Social Media Minion is your personal content-publishing system. We bridge the gap between your expertise and your audience. Our workflow is designed to take your core ideas—whether from a quick voice note, a client call, or a detailed article—and transform them into a library of powerful posts and articles. We handle the structure, the formatting, and the evaluation, so you can focus on what you do best: sharing your wisdom. Stop letting the process get in the way of your message.

---

## Your AI Thought Partner, Trained On You.

Social Media Minion isn't just another AI writer. It's a content marketing engine designed specifically for thought leaders. We don't generate generic fluff. We partner with you to scale your unique voice and expertise.

We won't think for you, but we will eliminate the boring bits and speed everything up. You stay in control of your messages and voice.

Our system is built on a simple principle: **The AI should work for you, not the other way around.** You provide the core knowledge, the strategic thinking, and the unique style. The Minion handles the heavy lifting of drafting, formatting, and adapting that brilliance for social media.

---

## A Workflow Built for Experts

We've designed a suite of tools that mirrors the workflow of a professional content team, giving you complete control at a fraction of the cost.

### 1. Define Your Core Identity
Our **Persona Panel** is the heart of the Minion. You'll define your professional role, your target audience, and—most importantly—provide your core knowledge. Paste in your book chapters, foundational frameworks, and articles to create a "Reference World" the AI uses as its source of truth.

### 2. Generate Posts, Not Just Words
Stop staring at a blank page. Provide a source article (yours or someone else's), and the Minion will use your custom **Template Library** to generate a dozen unique, high-quality posts. It then scores each one, so you can immediately see which posts are most likely to resonate.

### 3. A Professional Article Workflow
Go from a fleeting idea to a polished, 2000-word thought leadership piece without the friction.
-   **Generate Ideas:** The AI analyzes a source to brainstorm new, relevant article ideas tailored to your audience.
-   **Craft Headlines:** Get 10 powerful, evaluated headline options to ensure your article gets clicked.
-   **Iterative Enhancement:** The AI drafts your article, then evaluates its own work and provides a checklist of suggestions. You choose which to apply, and the AI rewrites, getting closer to perfection with each loop.

### 4. Schedule and Automate
Connect your Ayrshare account to load your approved posts into a queue and schedule them to go out at the optimal times. The entire process, from idea to published post, is streamlined and under your control.

---

## From Content Funnel to Client Conversion

Your content isn't just about visibility; it's about business results. Whether your goal is to fill a coaching program, sell a digital course, or book high-ticket consulting gigs, Social Media Minion is designed to power your entire funnel.

The system doesn't just create posts—it builds the trust and authority needed to move followers to clients. We can even help you take the final step by generating a compelling sign-up page for your flagship product or service, turning your audience into paying customers.

---

## Who Is This For?

Social Media Minion is for you if:
-   You're a business coach, consultant, or executive with deep domain expertise.
-   Your primary marketing goal is to build authority and trust, not just get likes.
-   You value authenticity and want your content to reflect your unique voice.
-   You want to scale your content creation without sacrificing quality or hiring a large team.

If you're ready to transform your content process from a chore into a strategic asset, you're in the right place.
`;

interface LandingPageProps {
  onLoginClick: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

const LandingPage: React.FC<LandingPageProps> = ({ onLoginClick, onNavigate, currentPage }) => {
  const calculatorRef = useRef<HTMLElement>(null);

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
              <div className="prose prose-invert lg:prose-xl max-w-none">
                <MarkdownRenderer content={LANDING_CONTENT} />
              </div>
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
