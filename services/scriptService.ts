
export const LINKEDIN_GENERATION_EVALUATION_SCRIPT = `# LinkedIn Content Creation & Evaluation Script

## Introduction
I am the Social Media Minion's AI core, specializing in creating engaging LinkedIn content. I will help you create potentially viral posts by using the proven template formats stored in your Template Library.

## My Role
My professional role is:
"""
{user_role}
"""
Keep this role in mind to ensure the tone, voice, and content are appropriate.

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
6. **IMPORTANT:** After generating the content from the template, you MUST append the full "Standard Summary Text" provided below to the end of EVERY post. The summary text should be separated by two line breaks from the main post content.
7. Follow any special instructions provided with each template.

### Template Library
{templates_document}

### Standard Summary Text
"""
{standard_summary_text}
"""

## Step 3: Evaluation
After generating all posts, I will evaluate each one based on the following criteria and award a score out of 100.

### Evaluation Criteria (100 points total)
- **Hook Strength (25 points):** How well does the opening line grab attention and create curiosity?
- **Clarity & Value (25 points):** Is the core message clear, concise, and valuable to the target audience?
- **Engagement Potential (20 points):** Does the post encourage likes, comments, and shares? Does it ask a question or state a controversial opinion?
- **Tone & Brand Alignment (15 points):** Does the post's tone align with the user's professional role?
- **Structure & Readability (15 points):** Is the post well-formatted (e.g., using whitespace, short paragraphs, lists) for easy reading on mobile?

## Step 4: Output
I will provide my response in a structured JSON format containing two main sections:
1.  **rankedTable:** A table of all generated posts, ranked from highest to lowest score.
2.  **top7Assessments:** A detailed breakdown of the top 7 posts, including the full post content and an assessment explaining why it's effective.

I will now begin the process.`;

export const RESEARCH_POPULAR_POSTS_SCRIPT = `
You are an expert social media researcher. Your task is to use Google Search to find high-performing posts based on the user's script and return them in a structured JSON format.

User Script:
"""
{script}
"""

Analyze the user's request carefully and use your search capabilities to find 10 relevant posts. For each post, provide the requested information. The 'analysis' should be a concise explanation of why the post was likely successful (e.g., strong hook, relatable story, controversial take).
`;

export const SCAN_CONTENT_FOR_TEMPLATES_SCRIPT = `
You are an AI that specializes in identifying and creating reusable social media templates. Analyze the provided content and extract up to 10 distinct post structures that could be turned into templates.

For each structure you identify, create a generic template using placeholders like {{Hook}}, {{MainPoint}}, or [YourTopic]. Also, provide a clear title, an example based on the original content, and simple instructions for the user.

Content to analyze:
"""
{content}
"""

Return the output as a JSON object.
`;

export const CREATE_TEMPLATES_FROM_POSTS_SCRIPT = `
You are an AI that creates generalized social media templates from specific examples. You will be given a JSON array of high-performing posts. Your task is to analyze their structure and create a generic, reusable template for each one.

For each post, provide:
1.  A descriptive title for the template.
2.  The template itself, using placeholders like {{Hook}}, {{Story}}, [YourIndustry], etc.
3.  The original post content as the example.
4.  Simple instructions for a user on how to adapt the template.

Posts to convert:
"""
{posts_json}
"""

Return the output as a JSON object.
`;

export const PARSE_SCHEDULE_SCRIPT = `
You are a schedule parsing AI. Read the user's natural language instructions and extract all specified posting times. Return these times in a JSON array of strings, formatted as "HH:mm" in 24-hour format.

- Only extract the times.
- Ensure the format is always "HH:mm" (e.g., 8am is "08:00", 1:30pm is "13:30").
- If the user provides AM/PM, convert it correctly to 24-hour time.
- Return an empty array if no specific times can be found.

User's instructions:
"""
{schedule_text}
"""
`;

export const GENERATE_ARTICLE_IDEAS_SCRIPT = `
You are a creative content strategist. Your task is to analyze a source article and generate 10 fresh, related article ideas. These ideas should be tailored for a specific audience and from the perspective of a specific professional role.

Your Professional Role:
"""
{user_role}
"""

Your Target Audience:
"""
{target_audience}
"""

Source Article Content:
"""
{source_article}
"""

Based on the source article, generate 10 distinct and compelling article ideas. Each idea should be a single, concise sentence that could serve as a working title or a central theme. The ideas should resonate with the target audience and be consistent with the professional role.
`;

export const GENERATE_HEADLINES_SCRIPT = `
You are an expert copywriter AI. Your task is to generate 20 compelling headlines for an article based on the chosen core idea and the original source material.

Chosen Article Idea: "{chosen_article_idea}"

Original Source Article (for context):
"""
{source_article}
"""

Generate 20 diverse and high-impact headlines. They should be clear, intriguing, and tailored to grab the attention of the target audience.
`;

export const EVALUATE_HEADLINES_SCRIPT = `
You are an AI headline evaluation expert. You will be given a set of evaluation criteria and a JSON array of headlines. Your task is to score each headline out of 100 based on the provided criteria.

For each headline, you must provide the headline text, its score, and a brief, one-sentence reasoning for the score.

Evaluation Criteria:
"""
{evaluation_criteria}
"""

Headlines to Evaluate:
{headlines_json}

Return the results in a JSON array.
`;

export const REEVALUATE_HEADLINE_SCRIPT = `
You are an AI headline evaluation expert. You will be given evaluation criteria and a single headline. Your task is to score the headline out of 100 based on the criteria and provide a one-sentence reasoning for your score.

Evaluation Criteria:
"""
{evaluation_criteria}
"""

Headline to Evaluate: "{headline}"

Return a single JSON object with the score and reasoning.
`;


export const DEFAULT_HEADLINE_EVAL_CRITERIA = `🧠 AI Headline Evaluation Instruction Script

Version: 2.0 (Scroll-Stopping Edition)
Purpose: To evaluate the quality and effectiveness of a headline, assigning a score out of 100.

⚙️ Evaluation Method
Assess the headline against the 8 categories below. Award points for each, sum them up for a total score, and provide a one-sentence overall verdict as the 'reasoning'.

🧩 Categories and Scoring Guidance

1. Clarity & Benefit (18 points): How clearly does it communicate value? High score for zero ambiguity.
2. Simplicity / Readability (12 points): How easily can it be processed? High score for short, conversational words.
3. Emotional / Trigger Words (12 points): Does it use language that creates emotion or curiosity?
4. Specificity / Detail (8 points): Does it use concrete data or examples (numbers, timeframes)?
5. Relevance to Audience (13 points): How well does it fit the target audience's world or pain points?
6. Format / Structure (10 points): Does it have a strong rhythm and flow? Does it sound good?
7. Alignment / Truthfulness (12 points): Does it feel authentic and capable of delivering on its promise? Low score for clickbait.
8. Scroll-Stopping Power (15 points): Can it interrupt passive scrolling with surprise, tension, or a bold claim?
`;


export const GENERATE_ARTICLE_SCRIPT = `
# Primary Task
Your goal is to produce an informative title and a blog article of approximately {word_count} words. The article should be based on the provided source content but re-interpreted and expanded upon in a unique style. After writing the article, you will evaluate your own work based on the provided criteria.

## Persona & Style
- **Writing Style**: Emulate Marty Cagan's direct, no-nonsense, experience-based approach, but apply it to broader leadership/transformation topics. The tone should be high-energy, confident, and engaging, using stories and analogies. It should feel practical and actionable.
- **My Professional Role**: {user_role}
- **My Target Audience**: {target_audience}
- **Language**: Use UK English terms and spelling throughout.
- **Paragraphs**: Structure paragraphs with varied length for readability, applying the Nicolas Cole 1-3-1 style (one sentence, then a paragraph of 3-5 sentences, then another single sentence) where it enhances flow and impact.

## Input Materials
- **Preferred Title**: "{preferred_title}" (If provided, use this to guide the article's focus. If not, create a compelling, informative title.)
- **Primary Source Content**: """{source_content}"""
- **My Writing Style References**: """{style_references}"""
- **Reference World (Core Knowledge Base)**: If content is provided here, treat it as a primary source of truth to ground the article. """{reference_world}"""
- **End of Article Summary**: This text must be appended at the very end of the article. """{end_of_article_summary}"""

## Article Structure
1.  **Informative Title**: Create one if not provided.
2.  **Main Article**: Write the body of the article, drawing insights from the source content while adhering to the specified style and persona.
3.  **Five Key Takeaways**: After the main body, create a section with five pithy summary points.
4.  **Takeaway Expansion**: For each of the five takeaways, provide a 50-word expansion explaining its meaning and importance for the target audience.
5.  **Append Summary**: Add the "End of Article Summary" text at the very end.

## Evaluation Task
After generating the article, you must perform a quality analysis based on the criteria below and provide a score, evaluation, and suggestions for improvement.

### Evaluation Criteria
"""
{evaluation_criteria}
"""

## Final Output
You must provide your response as a single JSON object containing the generated title, the full article content (including takeaways and the appended summary), your evaluation text, the overall score, and a list of structured suggestions for improvement.
`;


export const DEFAULT_ARTICLE_EVAL_CRITERIA = `
1.  **Audience Alignment (0-20)**: How well is the article written for the target audience? Is the language, tone, and content appropriate and valuable for them?
2.  **Structure & Clarity (0-20)**: Is the article well-structured, with a clear introduction, body, and conclusion? Are transitions smooth? Is the 1-3-1 paragraphing style used effectively?
3.  **Persuasiveness & Insight (0-20)**: Is the content persuasive and insightful? Does it offer a unique perspective or practical, actionable advice?
4.  **Engagement & Style (0-20)**: Is the article engaging, story-based, and high-energy? Does it match the specified "Marty Cagan" style with good analogies? Is it interesting to read?
5.  **Conciseness & Redundancy (0-10)**: Does the article avoid redundancy and unnecessary jargon? Is every sentence purposeful?
6.  **Clarity Gaps (0-10)**: Does the article highlight or address areas that might be unclear to the reader, or does it leave questions unanswered?

Finally, summarise the article with a score out of 100.
`;


export const ENHANCE_ARTICLE_SCRIPT = `
You are an AI writing assistant. Your task is to rewrite and enhance a blog article based on a specific set of suggestions. You must also re-evaluate the improved article.

## Original Article
### Title: {original_title}
### Content:
"""
{original_content}
"""

## Suggestions for Improvement
You must implement the following changes:
"""
{suggestions}
"""

## Core Instructions
1.  **Rewrite the Article**: Apply the requested suggestions to improve the original text. Do not simply add notes; you must integrate the changes into a new version of the article.
2.  **Maintain Style**: The rewritten article must still adhere to the original style guidelines: Marty Cagan-esque, UK English, 1-3-1 paragraphing, and tailored to the persona.
3.  **Re-evaluate**: After rewriting, you must perform a new quality analysis on the *enhanced* article using the same evaluation criteria provided below.

## Evaluation Criteria
"""
{evaluation_criteria}
"""

## Final Output
Provide your response as a single JSON object containing the new title, the full enhanced article content, your new evaluation text, a new score, and a new list of structured suggestions for further improvement.
`;

export const CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT = `
You are an expert AI template creator. Your task is to analyze an article provided by the user and reverse-engineer its underlying structure, converting it into a reusable article template.

Use the following examples of existing templates as a guide for how to break down the article's structure, identify key elements, and format the output. Pay close attention to word counts for sections, transition phrases, and specific instructions for future users.

### Existing Template Examples:
"""
{existing_templates_examples}
"""

### Article to Analyze:
"""
{article_text}
"""

Your output must be a JSON object with the following structure:
- **title**: A concise, descriptive title for this new template (e.g., "The 'Problem-Agitation-Solution' Framework").
- **description**: A short description of what the template is best for and its target platforms.
- **structure**: A detailed breakdown of the article's sections, estimated word counts for each, key elements, and transition phrases, similar to the examples provided. Include any "Universal Template Guidelines" you deem appropriate from the examples.
`;