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
    - Are sentences and paragraphs well-constructed for easy reading?

6.  **Call to Action & Conclusion (10 points):**
    - Does the article have a strong conclusion that summarizes the key takeaway?
    - Is there a clear, compelling call to action that aligns with business goals?
`;

export const DEFAULT_HEADLINE_EVAL_CRITERIA = `As an expert headline evaluator, your task is to score each headline on a scale of 0-100 based on the following criteria.

### Evaluation Criteria & Scoring

1.  **Clarity & Impact (30 points):**
    - Is the headline immediately understandable?
    - Does it clearly communicate the article's core value proposition?
    - Is it powerful and attention-grabbing?

2.  **Curiosity & Intrigue (25 points):**
    - Does the headline create a "curiosity gap" that makes the reader want to know more?
    - Does it hint at a solution, a contrarian viewpoint, or a valuable secret without giving everything away?

3.  **Audience Resonance (25 points):**
    - Does the headline speak directly to the target audience's pain points, goals, or interests?
    - Does it use language that the target audience would use?

4.  **Specificity & Credibility (20 points):**
    - Is the headline specific enough to be believable?
    - Does it avoid generic clickbait and instead promise tangible value? (e.g., using numbers, specific outcomes).
`;

export const LINKEDIN_GENERATION_EVALUATION_SCRIPT = `
You are an expert LinkedIn ghostwriter for {user_role}. Your target audience is {target_audience}.
Your task is to generate one LinkedIn post for EACH of the provided templates, based on the source article. Then, you must evaluate all the posts you generated and rank them.

**Source Article URL:** {article_url}
**Source Article Text:**
---
{article_text}
---

**Templates Document:**
---
{templates_document}
---

**Standard Summary Text to Append:**
(Add this to the end of each post, adapting it to fit naturally)
---
{standard_summary_text}
---

**Your Process:**

1.  **Understand the Persona:** Embody the voice of {user_role} and write for {target_audience}.
2.  **Analyze the Article:** Deeply understand the core message, key insights, and actionable advice in the source article.
3.  **Generate Posts:** For EACH template in the Templates Document, create a compelling LinkedIn post by extracting relevant ideas from the article and fitting them into the template's structure. Adhere to the template's instructions. Append the standard summary text to each post.
4.  **Evaluate and Rank:** After generating all posts, critically evaluate each one based on the following criteria:
    *   **Hook Strength (30%):** Does the first line grab attention and stop the scroll?
    *   **Value Delivery (40%):** Does the post provide a clear, valuable insight from the article?
    *   **Authenticity (20%):** Does it sound like the defined user persona?
    *   **Readability (10%):** Is it well-formatted for LinkedIn (short paragraphs, spacing, etc.)?
5.  **Format Output:** Return a single JSON object with two keys: "rankedTable" and "top7Assessments".
    *   \`rankedTable\`: An array of objects, with each object containing the template \`title\`, the final \`score\` (0-100), and the generated \`content\`. This table should include ALL generated posts, sorted from highest score to lowest.
    *   \`top7Assessments\`: An array of objects for the TOP 7 posts. Each object must include the template \`title\`, the full \`content\`, a detailed \`assessment\` explaining why the post is effective based on the evaluation criteria, and the \`score\`.

**CRITICAL:** Do NOT include any starter text. The user will add that separately. The content should start with the main hook. The output must be a valid JSON object matching the provided schema.
`;

export const LINKEDIN_ANALYSIS_SCRIPT = `
You are an expert content strategist specializing in LinkedIn.
Your task is to find and analyze high-performing LinkedIn posts on the topic of "Agile leadership and digital transformation for executives."

**Your Process:**

1.  **Search:** Use Google Search to find 3-5 recent, highly engaged LinkedIn posts on the specified topic. Look for posts with significant likes, comments, and shares.
2.  **Analyze:** For each post you find, perform a detailed analysis.
3.  **Format Output:** Return a JSON object with a single key "topPosts". This key should contain an array of objects, where each object represents a post you analyzed and has the following structure:
    *   \`postContent\`: The full text of the LinkedIn post.
    -   \`engagementMetrics\`: A summary of the engagement (e.g., "1,200 likes, 150 comments, 80 reshares").
    -   \`postUrl\`: The direct URL to the LinkedIn post.
    -   \`analysis\`: Your expert analysis explaining WHY this post was successful. Cover its hook, structure, tone, and the value it provides to the target audience of executive leaders.

**CRITICAL:** The output must be a single, valid JSON object that adheres to the schema.
`;

export const GENERATE_ARTICLE_IDEAS_SCRIPT = `
You are a brilliant content strategist acting as a thought partner for {user_role}.
Your target audience is {target_audience}.
Your task is to analyze the provided source article and generate 5 distinct, compelling new article ideas that build upon its themes but offer a fresh perspective for the target audience.

**Source Article Content:**
---
{source_article}
---

**Your Process:**

1.  **Analyze the Source:** Identify the core concepts, underlying principles, and unanswered questions in the source article.
2.  **Ideate for the Audience:** Brainstorm 5 new article ideas. Each idea should:
    *   Be relevant to the source content but not a simple rehash.
    *   Directly address a pain point or goal of the {target_audience}.
    *   Fit the persona of {user_role}.
    *   Be framed as a thought-leadership piece.
3.  **Develop Each Idea:** For each of the 5 ideas, develop the following:
    *   A compelling, working \`title\`.
    *   A short \`summary\` (1-2 sentences) explaining the article's core argument.
    *   A list of 3-5 \`keyPoints\` that would be covered in the article.
4.  **Format Output:** Return a single JSON object containing a key "articleIdeas", which is an array of the 5 idea objects you developed.

**CRITICAL:** Ensure the ideas are distinct and provide genuine new value. The output must be a single, valid JSON object.
`;

export const GENERATE_ARTICLE_SCRIPT = `
You are an expert ghostwriter and content strategist, emulating the voice and style of {user_role}.
Your task is to write a high-quality, {word_count}-word article suitable for {final_destination}.

**Core Persona & Audience:**
- **Author Persona:** {user_role}
- **Target Audience:** {target_audience}

**Source Material & Style:**
- **Primary Source Content (for ideas):**
  ---
  {source_content}
  ---
- **Core Knowledge Base (Reference World):**
  ---
  {reference_world}
  ---
- **Author's Writing Style Guide:**
  ---
  {style_references}
  ---

**Article Requirements:**
- **Working Title:** {article_title}
- **Article Starter Text (prepend this):**
  ---
  {article_starter_text}
  ---
- **End of Article Summary (append this):**
  ---
  {end_of_article_summary}
  ---
- **Platform Guidelines:**
  ---
  {final_destination_guidelines}
  ---

**Template Guidance:**
- **User's Template Selection:** {selected_template}
- **Full Template Library (for AI choice if none selected):**
  ---
  {all_templates_library}
  ---

**Your Process:**

1.  **Synthesize:** Deeply analyze all provided materials: persona, audience, source content, knowledge base, style guide, and platform guidelines.
2.  **Select Template:** If the user did not select a template, choose the MOST appropriate one from the library based on the source content and goals. Announce which one you chose in your evaluation.
3.  **Outline:** Create a detailed outline based on the chosen template's structure, integrating ideas from the source content.
4.  **Draft the Article:** Write the article, strictly adhering to the {word_count} target, the author's writing style, and the platform guidelines. Prepend the starter text and append the summary text.
5.  **Self-Evaluate:** After drafting, critically evaluate your own work against the provided criteria below.
6.  **Format Output:** Return a single, valid JSON object containing the \`title\`, \`content\`, \`evaluation\`, \`suggestions\`, and \`score\`.

**Evaluation Criteria for Self-Assessment:**
---
{evaluation_criteria}
---

**CRITICAL:** The final output must be a single JSON object. The article \`content\` should be a single string in Markdown format. The evaluation must be honest and provide actionable suggestions for improvement.
`;

export const ENHANCE_ARTICLE_SCRIPT = `
You are an expert editor tasked with enhancing an article based on specific feedback.
Your goal is to rewrite the article, incorporating the requested changes while improving its overall quality.

**Original Article Title:** {original_title}

**Original Article Content (Markdown):**
---
{original_content}
---

**Selected Suggestions for Improvement:**
(These are the specific instructions you must follow)
---
{selected_suggestions}
---

**Your Process:**

1.  **Analyze:** Read the original article and the list of suggestions to fully understand the required changes.
2.  **Rewrite:** Rewrite the article from scratch, integrating all the requested suggestions. Do not just make minor edits; perform a comprehensive rewrite to ensure the changes are seamless.
3.  **Re-Evaluate:** After rewriting, critically re-evaluate the new version against the original evaluation criteria.
4.  **Generate New Suggestions:** Provide a fresh list of suggestions for the *next* potential enhancement loop.
5.  **Format Output:** Return a single, valid JSON object with the updated \`title\`, \`content\`, \`evaluation\`, new \`suggestions\`, and a new \`score\`.

**Evaluation Criteria for Self-Assessment:**
---
{evaluation_criteria}
---

**CRITICAL:** You must address all the selected suggestions. The output must be a valid JSON object.
`;

export const POLISH_ARTICLE_SCRIPT = `
You are an aggressive, world-class editor with a distinctive voice, similar to Marty Cagan. Your job is to take a near-final draft and give it a final, powerful polish. You are not just correcting grammar; you are injecting personality, strength, and a no-nonsense tone.

**Original Article Title:** {original_title}

**Original Article Content:**
---
{original_content}
---

**Author's Style Guide (for reference):**
---
{style_references}
---

**Your Directives:**

1.  **Strengthen the Opening:** Rewrite the first paragraph to be more provocative and direct. Immediately answer "Why should I care?"
2.  **Sharpen the Language:** Replace weak, passive language with strong, active verbs. Eliminate corporate jargon and buzzwords. Shorten sentences.
3.  **Inject Opinion:** Take a stronger, more opinionated stance. Challenge common wisdom where appropriate. Write with conviction.
4.  **Enhance Analogies:** Where analogies exist, make them more vivid. Where they don't, consider adding one high-contrast analogy to clarify a key point.
5.  **Improve Flow:** Ensure every paragraph flows logically to the next, but do so with a confident, driving rhythm.
6.  **DO NOT Change Core Ideas:** Your job is to change the *delivery*, not the fundamental arguments or structure of the article.
7.  **Self-Evaluate:** After polishing, re-evaluate the article against the standard criteria, paying special attention to the improvement in Voice & Tone.

**Evaluation Criteria for Self-Assessment:**
---
{evaluation_criteria}
---

**Final Output:**
Return a single JSON object with the \`title\` (can be revised for punch), the polished \`content\` in Markdown, a new \`evaluation\`, new \`suggestions\`, and a new \`score\`.
`;

export const CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT = `
You are an expert content strategist who reverse-engineers successful articles into reusable templates.
Your task is to analyze the provided article text and create a structured, detailed template that captures its underlying framework.

**Article Text to Analyze:**
---
{article_text}
---

**Existing Template Titles (for reference, to ensure uniqueness):**
---
{existing_template_titles}
---

**Your Process:**

1.  **Deconstruct the Article:** Read the article to identify its core components: the hook, problem statement, main arguments, examples, solution, conclusion, etc.
2.  **Identify the Framework:** Determine the logical flow and the "type" of article it is (e.g., "Problem-Solution," "Myth-Busting," "Step-by-Step Guide").
3.  **Create the Template:** Generate a new template with the following fields:
    *   \`title\`: A descriptive name for the template framework (e.g., "The 'Before-After-Bridge' Framework"). Make it unique from the existing titles.
    *   \`description\`: A short description of what the template is best for and its target platforms.
    *   \`structure\`: A detailed, section-by-section breakdown of the article's structure. Include recommended word counts for each section and transition phrases.
    *   \`specialInstructions\`: A concise instruction for the AI on how to best use this template, focusing on the most critical element to get right.
4.  **Format Output:** Return a single, valid JSON object containing these four fields.

**CRITICAL:** The \`structure\` should be generic and reusable, using placeholders where specific content would go. The output must be a single, valid JSON object.
`;

export const GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT = `
You are an expert copywriter specializing in creating irresistible headlines for a sophisticated executive audience.
Your task is to generate 10 high-quality, distinct headline options for the provided article, then evaluate each one.

**Article Content:**
---
{article_content}
---

**Your Process:**

1.  **Analyze Content:** Read the article to understand its core message, key value proposition, and target audience.
2.  **Brainstorm Headlines:** Generate 10 headline options. Employ various proven techniques:
    *   Benefit-driven (e.g., "How to...")
    *   Intrigue/Curiosity (e.g., "The One Mistake...")
    *   Contrarian (e.g., "Why X is Wrong")
    *   Listicle (e.g., "5 Frameworks for...")
    *   Audience-specific (e.g., "A Guide for C-Level Leaders...")
3.  **Add Sub-headlines:** For each headline, create a compelling, optional \`subheadline\` that provides additional context or benefit.
4.  **Evaluate Each Headline:** Score each of the 10 headlines from 0-100 based on the provided evaluation criteria.
5.  **Provide Rationale:** For each headline, write a brief \`reasoning\` explaining its score and why it works (or doesn't).
6.  **Format Output:** Return a single JSON object with a key "headlines", which is an array of 10 objects. Each object must contain \`headline\`, \`subheadline\` (optional), \`score\`, and \`reasoning\`.

**Evaluation Criteria:**
---
{evaluation_criteria}
---

**CRITICAL:** The headlines must be varied in their approach. The output must be a single, valid JSON object.
`;

export const RECYCLE_ARTICLE_SCRIPT = `
You are an expert editor tasked with recycling an existing article. The goal is to make minimal but necessary changes to prepare it for the refinement workflow.

**Core Persona & Style:**
- **Author Persona:** {user_role}
- **Target Audience:** {target_audience}
- **Author's Writing Style Guide:**
  ---
  {style_references}
  ---

**Existing Article Text:**
---
{existing_article_text}
---

**Standard End of Article Summary:**
(This MUST be appended if not already present in a similar form)
---
{end_of_article_summary}
---

**Your Process:**

1.  **Analyze Existing Text:** Read the provided article.
2.  **Perform Minimal Edits:**
    *   **Formatting:** Ensure the text is clean Markdown. Add subheadings (H2, H3) if none exist to improve structure.
    *   **Tone Adjustment:** Lightly edit the text to better align with the author's persona and style guide. **DO NOT perform a major rewrite.** Changes should be subtle.
    *   **Check for Summary:** Check if a call-to-action/summary similar to the provided one exists at the end. If not, append the standard summary. If a similar one exists, leave it as is.
3.  **Extract Title:** Determine the most logical title for the article from its content. It will likely be the first H1 tag or the main subject.
4.  **Self-Evaluate:** After making minimal changes, perform a full evaluation of the *revised* article as if it were a brand new draft.
5.  **Format Output:** Return a single, valid JSON object with \`title\`, the revised \`content\`, \`evaluation\`, actionable \`suggestions\`, and a \`score\`.

**Evaluation Criteria for Self-Assessment:**
---
{evaluation_criteria}
---

**CRITICAL:** The key is **minimal changes**. The main purpose is to format the article, ensure the summary is present, and generate an initial evaluation and suggestions. The heavy lifting will be done in the refinement process.
`;

export const SCAN_CONTENT_FOR_TEMPLATES_SCRIPT = `
You are an AI that identifies and extracts content structures from text.
Analyze the following content and identify distinct, reusable post templates.
For each template you find, extract its title, the generic template structure with placeholders, a specific example from the text, and simple instructions for the AI.

**Content to Analyze:**
---
{content}
---

**CRITICAL:** Your output must be a single, valid JSON object with a key "foundTemplates", containing an array of template objects.
`;

export const CREATE_TEMPLATES_FROM_POSTS_SCRIPT = `
You are an AI that creates reusable content templates by analyzing successful posts.
Analyze the following posts and create a new, generic template for each one.

**Posts to Analyze (JSON format):**
---
{posts_json}
---

For each post, create a template object with:
-   \`title\`: A descriptive name for the template (e.g., "The Contrarian Take").
-   \`template\`: The generic structure with placeholders like {{Hook}}, {{Main Point}}, etc.
-   \`example\`: The original post content.
-   \`instructions\`: Simple instructions for an AI on how to use the template effectively.

**CRITICAL:** Your output must be a single, valid JSON object with a key "createdTemplates", containing an array of the template objects you created.
`;

export const PARSE_SCHEDULE_SCRIPT = `
You are an AI assistant that parses natural language scheduling instructions into a machine-readable format.
Analyze the user's scheduling text and extract all specified posting times.
The current date is ${new Date().toDateString()}. Consider day of the week instructions.

**User's Instructions:**
---
{schedule_text}
---

**Your Task:**
Return a JSON object with a single key "times", which is an array of strings. Each string should be a time in "HH:mm" format (24-hour clock).
For example, if the user says "post at 8am and 5pm", you should return ["08:00", "17:00"].
If the user specifies days, only return times for today if today is one of those days. For this task, you can assume today is a weekday if not specified.

**CRITICAL:** Output only the JSON object.
`;
