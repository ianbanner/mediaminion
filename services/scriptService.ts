import { ArticleDestination } from '../types.ts';

const UNIVERSAL_GUIDELINES = `
### Universal Best Practices
- **Scannability:** Content should work for skimmers and deep readers. Use subheadings every 200-300 words.
- **Mobile Optimization:** Use shorter sentences and frequent paragraph breaks (1-3 sentences per paragraph). Use visual breaks like bullet points. Describe where optimized images should be placed.
- **Engagement:** Start with a compelling hook. Ensure every sentence provides value. Use specific numbers and examples. Ensure smooth transitions between paragraphs. End with a clear call to action.
- **Authority:** Include client examples, data points, unique insights, and personal experience.
`;

export const LINKEDIN_DESTINATION_GUIDELINES = `
${UNIVERSAL_GUIDELINES}
---
### Platform-Specific Guidelines for LinkedIn
- **Optimal Length**: 1,500-2,000 words (sweet spot: 1,900-2,000).
- **Algorithm Focus**: The platform favors longer, well-researched content. The first few hours are critical for engagement.
- **Structure**: Headlines should be under 50 characters for maximum impact. Aim to describe where exactly 8 images (1200x644px) should be placed.
- **Content Style**: Maintain a professional, corporate-friendly, but conversational tone. Focus on industry expertise, data-driven insights, and actionable business value. Reference industry trends and position the content as thought leadership.
- **Publishing Strategy**: The best time to post is Tuesday-Thursday mornings (8-10 AM).
`;

export const MEDIUM_DESTINATION_GUIDELINES = `
${UNIVERSAL_GUIDELINES}
---
### Platform-Specific Guidelines for Medium
- **Optimal Length**: 1,600 words (a 7-minute read).
- **Algorithm Focus**: The platform prioritizes reader "attention time." Quality signals include comments, highlights, and saves.
- **Structure**: Break content into digestible sections to keep readers engaged. Describe where high-quality images (1200x800 px) with alt text and keyworded filenames should be placed.
- **Content Style**: Emphasize storytelling, narrative depth, and personal anecdotes. Maintain a conversational but authoritative tone. Every paragraph must be value-dense to hold reader attention.
- **SEO**: Integrate keywords in the title and naturally throughout the text.
`;

export const SUBSTACK_DESTINATION_GUIDELINES = `
${UNIVERSAL_GUIDELINES}
---
### Platform-Specific Guidelines for Substack
- **Optimal Length**: 800-1,200 words (top newsletters average 871).
- **Audience Focus**: This is for a newsletter community, not a public blog post. Adopt a personal, intimate, and direct tone.
- **Structure**: The main title (subject line) must be under 50 characters for mobile visibility. The sub-headline/first few sentences are critical as they appear as preview text in email clients. Use multiple short sections.
- **Content Style**: Reference past newsletters to build a narrative. Include community-building elements like direct questions to encourage replies.
- **Technical Notes**: 70% of readers are on mobile, so use very short paragraphs and lots of white space.
`;

export const FACEBOOK_DESTINATION_GUIDELINES = `
${UNIVERSAL_GUIDELINES}
---
### Platform-Specific Guidelines for Facebook (Long-Form Post)
- **Context**: This is for a long-form article (like a Facebook Note or an extended post). The primary challenge is retaining attention in a fast-scrolling feed.
- **Structure**: The first 1-2 sentences are the absolutely critical hook to stop the scroll. Keep paragraphs exceptionally short, often just 1-2 sentences. Use lots of white space. Describe where compelling images or videos should be placed frequently to break up text.
- **Content Style**: Use a highly conversational, informal, and direct tone. Use emojis where appropriate to add personality.
- **Goal**: The primary purpose is to drive engagement (comments, shares) and traffic to other resources, not just to be read in-platform.
`;

export const NON_FICTION_BOOK_GUIDELINES = `
${UNIVERSAL_GUIDELINES}
---
### Platform-Specific Guidelines for a Non-Fiction Book Chapter
- **Context**: This should be written as a chapter of a larger, coherent work.
- **Content Style**: Focus on deep, well-structured content with a logical flow, clear arguments, and evidence-based claims. Maintain a consistent tone that would be appropriate for a full-length book.
- **Structure**: Ensure the chapter can stand on its own while also connecting to a larger narrative or argument.
`;

export const FICTION_BOOK_GUIDELINES = `
${UNIVERSAL_GUIDELINES}
---
### Platform-Specific Guidelines for a Fiction Book Chapter
- **Context**: This should be written as a chapter of a larger, coherent work of fiction.
- **Content Style**: Focus on narrative, character development, setting, dialogue, and plot progression.
- **Structure**: The chapter should advance the story, develop characters, and end in a way that makes the reader want to continue to the next chapter.
`;

export const DESTINATION_GUIDELINES_MAP: Record<ArticleDestination, string> = {
    'LinkedIn': LINKEDIN_DESTINATION_GUIDELINES,
    'Medium': MEDIUM_DESTINATION_GUIDELINES,
    'Substack': SUBSTACK_DESTINATION_GUIDELINES,
    'Facebook': FACEBOOK_DESTINATION_GUIDELINES,
    'Non Fiction Book': NON_FICTION_BOOK_GUIDELINES,
    'Fiction Book': FICTION_BOOK_GUIDELINES,
};

export const DEFAULT_ARTICLE_EVAL_CRITERIA = `As an expert article evaluator, your task is to score an article on a scale of 0-100 based on the following criteria. Internally, you will assess each category and sum the points to arrive at a final score.

### Evaluation Criteria & Scoring

1.  **Hook & Introduction (15 points):**
    - Does the first paragraph immediately grab the reader's attention?
    - Is the article's core promise or problem stated clearly upfront?

2.  **Structure & Flow (20 points):**
    - Is the article well-organized with clear sections and subheadings?
    - Do the ideas transition logically from one to the next?
    - Is it easy for a reader to scan and get the gist?

3.  **Value & Insight (25 points):**
    - Does the article provide actionable, non-obvious, and valuable information?
    - Does it demonstrate deep expertise and offer a unique perspective?
    - Is the content well-supported with examples, data, or stories?

4.  **Voice & Tone (15 points):**
    - Is the writing style consistent with the author's defined persona?
    - Is the tone appropriate for the target audience?
    - Does the article have a strong, confident, and authentic voice?

5.  **Clarity & Readability (15 points):**
    - Is the language clear, concise, and free of jargon?
    - Are sentences and paragraphs generally short and easy to read?
    - Is the formatting (bolding, lists) used effectively to improve readability?

6.  **Conclusion & CTA (10 points):**
    - Does the conclusion effectively summarize the key takeaways?
    - Is there a clear and compelling call-to-action that guides the reader on what to do next?
`;

// FIX: Added missing exported constants for various scripts and criteria.
export const DEFAULT_HEADLINE_EVAL_CRITERIA = `As an expert headline evaluator, score a headline on a scale of 0-100 based on the following criteria.

### Evaluation Criteria & Scoring

1.  **Hook & Attention (30 points):**
    - Does it immediately grab attention and create intrigue?
    - Is it provocative, surprising, or counter-intuitive?

2.  **Clarity & Specificity (25 points):**
    - Is it clear what the article is about?
    - Does it use specific numbers, names, or concepts instead of vague generalities?

3.  **Benefit & Value (25 points):**
    - Does it clearly promise a specific benefit or value to the reader?
    - Does it answer the reader's question: "What's in it for me?"

4.  **Voice & Tone (10 points):**
    - Does it match the author's professional, no-nonsense persona?
    - Is the tone appropriate for the target audience (e.g., executive leaders)?

5.  **Conciseness (10 points):**
    - Is it punchy and free of unnecessary words?
    - Is it optimized for platform character limits (e.g., LinkedIn)?
`;

export const GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT = `# AI Headline Generation Protocol

You are an expert copywriter specializing in creating compelling, high-engagement headlines for a world-class business coach.

## Core Content
- **Article Content:**
  """
  {article_content}
  """

## Your Task
1.  **Analyze:** Read and understand the core message, arguments, and target audience of the provided article.
2.  **Generate Headlines:** Create a diverse list of 5-7 potential headlines and sub-headlines for the article. They should be punchy, intriguing, and benefit-driven.
3.  **Evaluate:** Critically evaluate each generated headline based on the following criteria.
    - **Evaluation Criteria:**
      """
      {eval_criteria}
      """
4.  **Provide Output:** Return a single JSON object with a key "headlines", which is an array. Each object in the array should contain: "headline" (string), "subheadline" (optional string), "score" (number 0-100), and "reasoning" (a brief explanation for the score).
`;

export const GENERATE_ARTICLE_IDEAS_SCRIPT = `# AI Article Idea Generation Protocol

You are a brilliant content strategist for a world-class business coach. Your task is to brainstorm new article ideas based on a source piece of content, tailored to a specific persona and audience.

## Core Inputs
- **My Professional Role:** {user_role}
- **My Target Audience:** {target_audience}
- **Source Content (for inspiration):**
  """
  {source_article}
  """

## Your Task
1.  **Analyze:** Deeply analyze the source content to identify core themes, interesting tangents, and unanswered questions.
2.  **Brainstorm:** Generate 3-5 distinct and compelling new article ideas that are related to but different from the source content.
3.  **Develop Ideas:** For each idea, provide the following:
    - **Title:** A strong, working title.
    - **Summary:** A one-paragraph summary explaining the core premise and why it's valuable to the target audience.
    - **Key Points:** A bulleted list of 3-5 key points or arguments that would be developed in the article.
4.  **Provide Output:** Return a single JSON object with a key "articleIdeas", which is an array of objects. Each object should contain "title", "summary", and "keyPoints" (an array of strings).
`;

export const SCAN_CONTENT_FOR_TEMPLATES_SCRIPT = `# AI Template Scanner

You are an expert in identifying content structures. Analyze the provided text and extract any recurring patterns that could be turned into reusable post templates.

## Content to Analyze
"""
{content}
"""

## Your Task
1.  Read the content and identify distinct, repeated structural patterns for social media posts.
2.  For each pattern, create a generic template using placeholders like {{Hook}}, {{Main Point}}, etc.
3.  For each template, provide a concise title, the template structure, a concrete example from the text, and simple instructions for the AI on how to use it.
4.  Return a JSON object with a key "foundTemplates", which is an array of objects. Each object should have "title", "template", "example", and "instructions".
`;

export const CREATE_TEMPLATES_FROM_POSTS_SCRIPT = `# AI Template Creator from Popular Posts

You are an expert content analyst. You have been given a list of high-performing social media posts. Your task is to reverse-engineer them into reusable templates.

## High-Performing Posts (JSON format)
"""
{posts_json}
"""

## Your Task
1.  Analyze each post in the provided JSON data.
2.  Identify the underlying structure, hook, and call-to-action for each post.
3.  Create a generic, reusable template for each distinct pattern you find. Use placeholders like {{Hook}}, {{KeyInsight}}, etc.
4.  For each template created, provide a concise title, the template structure, a concrete example (one of the original posts), and simple instructions for the AI.
5.  Return a JSON object with a key "createdTemplates", which is an array of objects. Each object should have "title", "template", "example", and "instructions".
`;

export const PARSE_SCHEDULE_SCRIPT = `You are a scheduling assistant. Parse the following natural language text and extract the specific post times in HH:mm format (24-hour clock).

## Schedule Text
"{schedule_text}"

## Your Task
1. Read the text and identify all specified posting times.
2. Convert all times to a 24-hour HH:mm format. For example, "8am" is "08:00", "5pm" is "17:00".
3. Ignore days of the week or other instructions, just extract the times.
4. Return a JSON object with a single key "times", which is an array of strings (e.g., ["08:00", "17:00"]).
`;

export const CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT = `# AI Article Template Distiller

You are an expert in analyzing content structure. Your task is to read a full article and distill its underlying structure into a reusable template for a ghostwriter.

## Article to Analyze
"""
{article_text}
"""

## Existing Template Titles (for reference, avoid duplication)
- {existing_templates}

## Your Task
1.  **Analyze Structure:** Read the entire article and identify its core components (e.g., Hook, Problem Definition, Solution, Case Study, Conclusion).
2.  **Create Template:**
    -   **Title:** Give the template a descriptive name (e.g., "The 'Problem-Agitation-Solution' Framework"). The title should be unique from the existing templates.
    -   **Description:** Briefly explain what this template is best for and its target platforms.
    -   **Structure:** Create a detailed, step-by-step outline of the article's structure. Include recommended word counts for each section and transition phrases to guide the writer.
    -   **Special Instructions:** Add one key instruction for the AI to ensure it uses the template effectively (e.g., "Focus on vivid storytelling in the 'Case Study' section.").
3.  **Provide Output:** Return a single JSON object with the keys: "title", "description", "structure", and "specialInstructions".
`;

export const GENERATE_ARTICLE_SCRIPT = `# AI Article Generation Protocol

You are an expert ghostwriter for a world-class business coach and consultant. Your mission is to create a high-quality, long-form article based on the provided inputs.

## Core Inputs

### 1. Persona & Audience
- **My Professional Role:** {user_role}
- **My Target Audience:** {target_audience}
- **My Writing Style References:**
  """
  {style_references}
  """
- **My Core Knowledge Base (Reference World):**
  """
  {reference_world}
  """

### 2. Article Specifics
- **Working Title:** {title}
- **Approximate Word Count:** {word_count}
- **Source Content (for ideas and core concepts):**
  """
  {source_content}
  """
- **Final Destination & Guidelines:**
  """
  {final_destination_guidelines}
  """

### 3. Structural Components
- **Article Starter Text (prepend this to the article body):**
  """
  {article_starter_text}
  """
- **End of Article Summary (append this template, replacing placeholder question):**
  """
  {end_of_article_summary}
  """

### 4. Article Templates
- **User's Template Selection:** {selected_template_instruction}
- **Full Template Library (for AI selection if none is provided by user):**
  """
  {all_templates_library}
  """

## Your Task
1.  **Synthesize:** Deeply analyze all provided inputs: persona, audience, writing style, knowledge base, source content, and templates.
2.  **Select Structure:**
    - If a template is pre-selected, you MUST follow its structure precisely.
    - If no template is selected, you must analyze the source content and choose the MOST appropriate template from the library to structure the article. Announce which template you chose in your evaluation.
3.  **Draft the Article:**
    - Write a compelling, in-depth article of approximately {word_count} words.
    - Strictly adhere to the writing style found in the style references.
    - Ground all concepts in the "Reference World" knowledge base.
    - Use the "Source Content" as the primary inspiration and basis for the article's core message.
    - Generate a powerful title if one is not provided.
    - Prepend the "Article Starter Text" to the beginning of the article body (after the title).
    - Append the "End of Article Summary" to the very end, ensuring you replace the placeholder question with a relevant one.
    - Follow all platform-specific guidelines.
4.  **Evaluate Your Work:** After drafting, critically evaluate your own work based on the following criteria.
    - **Evaluation Criteria:**
      """
      {eval_criteria}
      """
5.  **Provide Output:** Return a single JSON object with the following keys: "title", "content" (the full article markdown), "evaluation" (your detailed assessment), "suggestions" (an array of actionable suggestions for improvement), and "score" (a final score out of 100).
`;

export const ENHANCE_ARTICLE_SCRIPT = `# AI Article Enhancement Protocol

You are an expert ghostwriter and editor. Your task is to enhance an existing article by thoughtfully incorporating a specific list of suggestions.

## Original Article
- **Title:** {original_title}
- **Content:**
  """
  {original_content}
  """

## Suggestions for Enhancement
The user has selected the following suggestions. You must apply them to the article.
"""
{suggestions_list}
"""

## Your Task
1.  **Rewrite and Enhance:** Rewrite the original article, skillfully integrating the provided suggestions. Do NOT just tack them on. Weave them into the narrative naturally. Improve the flow, clarity, and impact of the entire piece. The title may also be improved if a suggestion warrants it.
2.  **Maintain Voice:** The enhanced article must maintain the original's core message and voice.
3.  **Evaluate:** After rewriting, critically evaluate your new version based on the criteria below.
    - **Evaluation Criteria:**
      """
      {eval_criteria}
      """
4.  **Provide Output:** Return a single JSON object with the following keys: "title", "content" (the full enhanced article markdown), "evaluation" (your new detailed assessment), "suggestions" (a new array of actionable suggestions for further improvement), and "score" (a new final score out of 100).
`;

export const POLISH_ARTICLE_SCRIPT = `# AI Final Polish Protocol

You are an expert copy-editor with a specialization in the "no-nonsense, direct, practitioner's guide" style. Your task is to perform a final, aggressive stylistic polish on the following article.

## Article to Polish
- **Title:** {original_title}
- **Content:**
  """
  {original_content}
  """

## Style Guide
- **Reference:** The author's writing style is defined here. You must match this tone.
  """
  {style_references}
  """

## CRITICAL INSTRUCTION
- **Preserve the End Summary:** The article contains a final summary section that starts with "Thanks for reading.". You MUST identify this section and preserve it completely without making ANY changes. Your polish should only apply to the main body of the article BEFORE this final summary section.

## Your Task
1.  **Rewrite for Style:** Aggressively rewrite the main body of the article to inject more personality, clarity, and punch.
    - Shorten sentences.
    - Use stronger verbs and the active voice.
    - Add high-contrast analogies.
    - Ensure a direct, confident, and opinionated tone, consistent with the style guide.
    - Do NOT change the core arguments or structure. This is a stylistic polish, not a content rewrite.
2.  **Preserve Summary:** Append the original, unchanged "End of Article Summary" section to your polished version.
3.  **Evaluate:** After polishing, critically evaluate the new version.
    - **Evaluation Criteria:**
      """
      {eval_criteria}
      """
4.  **Provide Output:** Return a single JSON object with the following keys: "title", "content" (the full polished article markdown), "evaluation" (your new detailed assessment), "suggestions" (a new array of actionable suggestions for further improvement), and "score" (a new final score out of 100).
`;

export const LINKEDIN_GENERATION_EVALUATION_SCRIPT = `# LinkedIn Post Generation & Evaluation Protocol

You are an expert LinkedIn ghostwriter for a world-class business coach. Your client's persona is defined below. Your task is to generate one post for each of the provided templates and then evaluate all of them.

## 1. Persona & Audience
- **My Role:** {user_role}
- **My Target Audience:** {target_audience}

## 2. Source Content
The following text is the source of inspiration for the posts.
- **Source URL:** {article_url}
- **Source Text:**
  """
  {article_text}
  """

## 3. Post Templates
You MUST generate exactly one post for each template provided below.
"""
{templates_document}
"""

## 4. Standard Components
- **Standard Summary Text (append to posts if relevant):** "{standard_summary_text}"

## 5. Your Task

### Part A: Generation
For each template in the 'Post Templates' section, generate a compelling, high-quality LinkedIn post.
- Adhere strictly to the persona and target audience.
- Use the source content for ideas, facts, and themes.
- Follow the structure and instructions of each template.

### Part B: Evaluation
After generating all posts, you must evaluate and score each one from 0-100 based on these criteria:
- **Hook (30 pts):** Does the first line grab attention and stop the scroll?
- **Value (30 pts):** Does the post offer a clear, valuable insight for the target audience?
- **Authenticity (20 pts):** Does it sound like it was written by the defined persona?
- **Clarity (10 pts):** Is the message easy to understand?
- **Call to Action (10 pts):** Does it encourage meaningful engagement (comment, share, click)?

### Part C: Output
Return a single JSON object containing two keys: "rankedTable" and "top7Assessments".
- **rankedTable:** An array of ALL generated posts, including their template title, final score, and the full post content. This table MUST be sorted from highest score to lowest.
- **top7Assessments:** A detailed analysis of the top 7 posts. For each, provide the template title, score, full post content, and a detailed 'assessment' explaining *why* it's effective based on the evaluation criteria.
`;

export const LINKEDIN_ANALYSIS_SCRIPT = `# LinkedIn Post Analysis Protocol using Google Search

You are an expert LinkedIn content analyst. Your task is to find and analyze 3-5 recent, high-performing posts on LinkedIn related to the topic of "agile coaching" and "digital transformation for executives".

## Your Task
1.  **Search:** Use Google Search to find relevant, recent (within the last 6 months), and high-engagement (high likes, comments, shares) LinkedIn posts. Your search queries should be specific, like "site:linkedin.com agile coaching for executives" or "site:linkedin.com 'digital transformation' high engagement post".
2.  **Analyze:** For each of the top 3-5 posts you find, provide a detailed analysis.
    -   **Post Content:** The full text of the post.
    -   **Engagement Metrics:** A summary of the likes, comments, and shares.
    -   **Post URL:** The direct link to the post.
    -   **Analysis:** A paragraph explaining *why* the post was successful. Consider the hook, the structure, the value provided, the call to action, and the author's persona.
3.  **Provide Output:** Return a single JSON object with a key "topPosts", which is an array of objects. Each object should contain "postContent", "engagementMetrics", "postUrl", and "analysis".
`;
