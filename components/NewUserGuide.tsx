import React from 'react';

const guideItems = [
    {
        title: "1. Define Your Persona",
        description: "This is the most critical step. The AI uses this information in every single request to tailor content to your voice and audience.",
        details: [
            "**My Professional Role:** Define how you want to be perceived (e.g., 'An expert Agile Coach...').",
            "**My Target Audience:** Specify who you're trying to reach (e.g., 'C-level executives...')."
        ],
        location: "Found in 'Admin' > 'Persona'"
    },
    {
        title: "2. Build Your Knowledge Base",
        description: "Provide the AI with your core knowledge and writing style so it can generate authentic content.",
        details: [
            "**Reference World:** Paste foundational concepts, frameworks, or book excerpts. This is the AI's 'source of truth'.",
            "**This is how I write articles:** Paste examples of your long-form writing to teach the AI your style."
        ],
        location: "Found in 'Admin' > 'Persona'"
    },
    {
        title: "3. Review Post Templates",
        description: "These templates are the building blocks for short-form content. Review and customize them to match your preferred formats.",
        details: [
            "Go through the existing templates and edit them to fit your style.",
            "Use the 'Add New Template' button to create your own from scratch."
        ],
        location: "Found in 'Work on Posts' > 'Template Library'"
    },
    {
        title: "4. Review Article Templates",
        description: "These detailed structures are used for generating long-form articles. Familiarize yourself with them and customize as needed.",
        details: [
            "Review the pre-loaded templates for different article types (e.g., 'Problem-Agitation-Solution').",
            "Use the 'Add New Template' button and the 'Create from Article' feature to build your own library."
        ],
        location: "Found in 'Work on Articles' > 'Article Templates'"
    },
    {
        title: "5. Configure Ayrshare for Posting",
        description: "To enable automated posting, you need to connect your Ayrshare account.",
        details: [
            "Get your API Key from the Ayrshare Dashboard.",
            "Enter the key in the settings panel."
        ],
        location: "Found in 'Admin' > 'Settings'"
    },
    {
        title: "6. Customize AI Scripts (Advanced)",
        description: "For full control, you can edit the master prompts the AI uses for generation and evaluation.",
        details: [
            "Each generation panel (Generate Posts, Headlines, Articles) has an 'Advanced' section at the bottom.",
            "**Warning:** Only edit these if you are comfortable with prompt engineering."
        ],
        location: "Found in various generation panels"
    }
];

const NewUserGuide: React.FC = () => {
    return (
        <div className="space-y-8 animate-fade-in">
            <h1 className="text-3xl font-bold">New User Onboarding Guide</h1>
            <p className="text-gray-400">Follow these steps to configure the Social Media Minion for optimal performance. Completing these will ensure the AI generates high-quality, personalized content for you.</p>

            <div className="space-y-6">
                {guideItems.map((item, index) => (
                    <div key={index} className="p-6 bg-slate-800/50 border border-slate-700 rounded-xl shadow-lg">
                        <h2 className="text-xl font-bold text-teal-300">{item.title}</h2>
                        <p className="mt-2 text-gray-300">{item.description}</p>
                        <ul className="mt-4 space-y-2 list-disc list-inside text-gray-400">
                            {item.details.map((detail, i) => (
                                <li key={i} dangerouslySetInnerHTML={{ __html: detail.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }} />
                            ))}
                        </ul>
                        <p className="mt-4 text-xs font-semibold text-gray-500 uppercase">{item.location}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default NewUserGuide;
