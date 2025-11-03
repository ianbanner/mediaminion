
import { SavedTemplate, PlannedPost } from "../App";
import { GenerationResults } from "./geminiService";

export const LINKEDIN_GENERATION_EVALUATION_SCRIPT = `# LinkedIn Content Creation & Evaluation Script

## Introduction
I am the Social Media Minion's AI core, specializing in creating engaging LinkedIn content. I will help you create potentially viral posts by using the proven template formats stored in your Template Library.

## Target Audience
{target_audience}

## Goals
- Provide additional insight and skills to your audience
- Encourage them to read more of your content
- Ultimately, guide them to attend your training courses

## Process Overview
1. You'll provide an article URL and/or full text.
2. I'll analyze the article to understand key points and messages.
3. I'll create posts using all templates from your Template Library.
4. I'll evaluate each post against our criteria.
5. I'll present the posts in order of effectiveness.
6. You'll have ready-to-use content for Buffer and LinkedIn.

## Step 1: Article Input
The user has provided the following article content. Use the URL if provided, otherwise use the full text.
Article URL: {article_url}
Article Text: """
{article_text}
"""

## Step 2: Content Creation
For each template in the Template Library provided below, I will:
1. Analyze the article's key points, arguments, and data.
2. Craft posts with strong opening lines to stop scrolling.
3. Ensure content is concise, engaging, and professionally tailored.
4. Incorporate relevant keywords for search visibility.
5. End with effective calls-to-action.
6. Add the standard summary text (provided below) with the article link.
7. Follow any special instructions for specific templates.

## Step 3: Post Evaluation
I will evaluate each generated post against these criteria (10 points each, for a total of 100):
1. Hook Strength (Opening Line)
2. Visual Structure & Readability
3. Emotional Resonance
4. Value Proposition & Actionable Insights
5. Storytelling Elements
6. Engagement Potential
7. Keyword Optimization
8. Timing & Relevance
9. Thought Leadership Position
10. Connection to Business Goals

## Step 4: Results Presentation
I will present the results in the specified JSON format containing:
1. A ranked table ('rankedTable') of all posts by score.
2. A detailed assessment ('top7Assessments') of the top 7 posts.

## Standard Summary Text
{standard_summary_text}

## LinkedIn Templates Document
Here are all the templates you must use for this task, sourced from your Template Library:
"""
{templates_document}
"""

Now, begin the process and provide the final output in the required JSON format.
`;

export const GENERATE_LINKEDIN_IDEAS_SCRIPT = `You are a creative LinkedIn content strategist. Based on the following successful LinkedIn posts, generate 30 new, diverse, and engaging post ideas. The new posts should capture the style, tone, and format of the examples but cover new angles or topics.
Examples:
"""
{examples}
"""
Provide the output as a JSON object with a single key "generated_posts" which is an array of strings.`;

export const RANK_LINKEDIN_POSTS_SCRIPT = `You are a LinkedIn marketing expert with a keen eye for viral content. I have a list of draft LinkedIn posts. Your task is to analyze them and select the top 10 best posts.
Your evaluation criteria should be:
- Engagement Potential: Does it encourage likes, comments, and shares?
- Clarity and Conciseness: Is the message clear and easy to understand?
- Professional Tone: Is it appropriate for the LinkedIn platform?
- Strong Hook: Does the first line grab the reader's attention?
- Actionable Insights or Value: Does it provide value to the reader?
Here are the posts to evaluate:
"""
{generated_posts}
"""
Return only the top 10 posts. Provide the output in the requested JSON format, where each post object has a "platform" (which should always be "LinkedIn") and "content".`;

export const RESEARCH_POPULAR_POSTS_SCRIPT = `You are a LinkedIn marketing research expert. Your task is to find 10 recent, highly engaging LinkedIn posts based on the user's research criteria.

User's Research Script:
"""
{script}
"""

Analyze the script, identify the key topics, styles, or user profiles mentioned, and then generate 10 distinct posts that exemplify high engagement (likes, comments, shares) on those topics. The posts should feel authentic.

Provide the output in the requested JSON format.`;

export const SCAN_CONTENT_FOR_TEMPLATES_SCRIPT = `You are an expert in social media marketing and content strategy with a talent for identifying reusable patterns. Your task is to analyze the following text content and extract any potential LinkedIn post templates.

The text could be from a blog post, an article, or a list of examples. Your job is to find the underlying structures that can be generalized.

For each template you identify, you must provide:
1.  A concise "title" for the template.
2.  The "template" structure itself, using placeholders like {{...}} or [...] to mark customizable parts.
3.  A realistic "example" of how the template could be used.
4.  Any "instructions" that would be helpful for someone using the template (this can be an empty string if none are needed).

Text Content to Analyze:
"""
{content}
"""

Return your findings in the requested JSON format, with a list called "foundTemplates". If no templates are found, return an empty list.`;


export const getCoreScriptsForDownload = (generationScript: string): string => {
    const scripts = [
        { title: "LinkedIn Post Generation & Evaluation", content: generationScript },
        { title: "Generate LinkedIn Post Ideas (Step 1)", content: GENERATE_LINKEDIN_IDEAS_SCRIPT },
        { title: "Rank Generated LinkedIn Posts (Step 2)", content: RANK_LINKEDIN_POSTS_SCRIPT },
        { title: "Research Popular Posts", content: RESEARCH_POPULAR_POSTS_SCRIPT },
        { title: "Scan Content for Templates", content: SCAN_CONTENT_FOR_TEMPLATES_SCRIPT },
    ];

    return scripts.map(script => 
        `// ===== SCRIPT: ${script.title} =====\n\n${script.content.trim()}\n\n`
    ).join('// ===================================\n\n');
};

export const getTemplatesForDownload = (templates: SavedTemplate[]): string => {
    if (templates.length === 0) return "// No templates in the library.";
    return templates.map(t => {
      return `
  // ===== TEMPLATE: ${t.title} =====
  // Added: ${t.dateAdded}
  // Last Used: ${t.lastUsed}
  // Usage Count: ${t.usageCount}
  
  // --- Template Structure ---
  ${t.template.trim()}
  
  // --- Example ---
  ${t.example.trim()}
  
  // --- Special Instructions ---
  ${t.instructions.trim() || 'N/A'}
      `.trim();
    }).join('\n\n// ===================================\n\n');
  };
  
export const formatPageDataForDownload = (
    genResults: GenerationResults | null,
    planned: PlannedPost[]
): string => {
    let content = `// ===== Stored Page Data =====\n\n`;

    content += `// --- Stored Generation Results ---\n`;
    content += genResults ? JSON.stringify(genResults, null, 2) : '// No stored generation results.\n';
    content += `\n\n`;
    
    content += `// --- Stored Planned Posts ---\n`;
    content += planned.length > 0 ? JSON.stringify(planned, null, 2) : '// No stored planned posts.\n';
    content += `\n`;

    return content;
};
