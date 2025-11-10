import { v4 as uuidv4 } from 'uuid';
import { SavedArticleTemplate } from '../types.ts';

const universalGuidelines = `
---
### Universal Template Guidelines:
#### Transition Mastery:
- Every paragraph should end with a hook to the next section
- Use transition phrases that create curiosity
- Reference what's coming next to maintain momentum
- Create logical narrative flow throughout

#### Engagement Boosters:
- Ask rhetorical questions every 300-400 words
- Include "you" language throughout
- Use specific numbers and timeframes
- Add personal anecdotes and client stories
- Include contrarian statements to challenge assumptions

#### Structure Elements:
- Subheading every 200-300 words for scannability
- Bullet points for lists and action items
- Bold text for key concepts (sparingly)
- Clear section transitions
- Compelling conclusion that reinforces your expertise

#### Platform Optimization:
- LinkedIn: Focus on professional insights, industry trends
- Medium: Emphasize storytelling and depth
- Substack: Include personal perspective and newsletter-style formatting
- Blog: Optimize for SEO with keyword integration
`;

export const initialArticleTemplates: SavedArticleTemplate[] = [
  {
    id: uuidv4(),
    title: 'The "Problem-Agitation-Solution" Framework',
    description: `Target Platforms: LinkedIn Articles, Medium, Substack
Best For: Addressing common business challenges, introducing new frameworks`,
    structure: `Structure (2000 words):

Hook Opening (200 words): Start with a relatable scenario your coaching clients face
Transition phrase: "If this sounds familiar, you're not alone..."

Problem Definition (350 words): Define the exact problem and why it matters now
Transition phrase: "But here's what makes this problem even more dangerous..."

Cost of Inaction (450 words): Agitate by showing what happens if they don't solve this
Transition phrase: "Fortunately, there's a way out of this spiral..."

The Solution Framework (800 words): Your 3-5 step solution with examples
Transition phrase: "Now that you understand the framework, let's talk implementation..."

Implementation Guide (150 words): Specific next steps
Transition phrase: "Ready to get started?"

Call to Action (50 words): Clear invitation to work with you

Key Elements:
- Include specific client examples in each section
- Use data points to support your agitation
- End each section with a bridge to the next
- Include "What does this mean for you?" moments
${universalGuidelines}`,
    specialInstructions: "Focus on vividly describing the reader's pain points in the 'Agitation' section. Use emotional language to make the problem feel urgent before presenting your solution."
  },
  {
    id: uuidv4(),
    title: 'The "Contrarian Take" Structure',
    description: `Target Platforms: LinkedIn Articles, Medium (ideal for thought leadership)
Best For: Challenging industry standards, positioning yourself as a disruptor`,
    structure: `Structure (2000 words):

Provocative Opening (250 words): Challenge conventional wisdom with a bold statement
Transition phrase: "I know what you're thinking, but hear me out..."

Why Everyone Gets This Wrong (450 words): Common misconceptions and their origins
Transition phrase: "So what's really happening here?"

The Hidden Truth (700 words): Your contrarian perspective with supporting evidence
Transition phrase: "Don't just take my word for it. Here's the proof..."

Case Study/Examples (450 words): 2-3 real examples proving your point
Transition phrase: "So how do you apply this counterintuitive approach?"

How to Apply This (100 words): Practical implementation
Transition phrase: "The bottom line is this..."

Conclusion (50 words): Reinforce your unique position

Key Elements:
- Lead with shocking statistics or industry myths
- Use authoritative sources to back contrarian claims
- Include personal anecdotes of discovering this truth
- Address potential objections in each section
${universalGuidelines}`,
    specialInstructions: "Be bold and unapologetic in your opening statement. The goal is to immediately challenge a deeply held belief. Back up your contrarian view with strong, surprising data or a compelling personal story."
  },
  {
    id: uuidv4(),
    title: 'The "Complete Breakdown" Analysis',
    description: `Target Platforms: Medium, LinkedIn Articles, Substack deep dives
Best For: Industry analysis, trend breakdowns, complex topic explanations`,
    structure: `Structure (2000 words):

Context Setting (200 words): Why this topic matters now
Transition phrase: "To understand where we're headed, we need to examine the current landscape..."

The Landscape (300 words): Current state of the industry/topic
Transition phrase: "But the real story lies in the details..."

Deep Dive Analysis (1200 words): Break down into 4-5 key components (240 words each)
Component 1: Transition: "First, let's examine..."
Component 2: Transition: "This leads us to the second critical factor..."
Component 3: Transition: "Building on this, we see..."
Component 4: Transition: "Perhaps most importantly..."
Component 5: Transition: "Finally, we must consider..."

Implications for Business (200 words): What this means for your readers
Transition phrase: "So what should you do with this information?"

Action Plan (75 words): How to adapt/respond
Expert Perspective (25 words): Your unique insight

Key Elements:
- Use subheadings for each component
- Include relevant statistics for each section
- Reference industry experts and studies
- End with a forward-looking statement
${universalGuidelines}`,
    specialInstructions: "This template is for establishing authority. Use data, charts (described in text), and quotes from other experts. Ensure each 'component' section is a mini-article in itself with a clear point."
  },
  {
    id: uuidv4(),
    title: 'The "Journey Transformation" Story',
    description: `Target Platforms: All platforms (powerful for credibility)
Best For: Case studies, demonstrating coaching effectiveness, building trust`,
    structure: `Structure (2000 words):

Before State (350 words): Paint the picture of where your client started
Transition phrase: "This is when Sarah (or client) reached out to me..."

The Challenge (400 words): What obstacles they faced
Transition phrase: "But the real challenges were just beginning to surface..."

The Intervention (700 words): Your coaching process and frameworks used
Transition phrase: "The breakthrough came when we implemented..."

Implementation Challenges (300 words): Real struggles during the process
Transition phrase: "Then something shifted..."

The Breakthrough (200 words): The turning point
Transition phrase: "Fast forward six months..."

After State & Results (50 words): Where they are now

Key Elements:
- Use real names (with permission) or detailed composites
- Include specific metrics and timelines
- Show your methodology in action
- Address setbacks and how you handled them
- Include direct quotes from the client
${universalGuidelines}`,
    specialInstructions: "Authenticity is key. Use direct quotes from the client (real or composite). Don't shy away from the struggles in the 'Implementation Challenges' section; it makes the final success more credible."
  },
  {
    id: uuidv4(),
    title: 'The "Step-by-Step System" Guide',
    description: `Target Platforms: Medium, Substack, LinkedIn Articles
Best For: Teaching methodologies, how-to content, establishing expertise`,
    structure: `Structure (2000 words):

System Overview (200 words): What you'll teach and why it works
Transition phrase: "Before we dive in, here's what you need..."

Prerequisites (150 words): What they need before starting
Transition phrase: "Now, let's start with step one..."

Step 1 + Implementation (400 words): First step with detailed how-to
Transition phrase: "Once you've mastered step one, you're ready for..."

Step 2 + Implementation (400 words): Second step with examples
Transition phrase: "This foundation sets you up perfectly for..."

Step 3 + Implementation (400 words): Third step with case studies
Transition phrase: "The final piece of the puzzle is..."

Step 4 + Implementation (400 words): Final step with troubleshooting
Transition phrase: "So what can you expect?"

Results & Timeline (50 words): Outcomes and realistic expectations

Key Elements:
- Number each step clearly
- Include common mistakes for each step
- Provide templates or checklists
- Use bullet points for action items
- Include "Pro Tips" throughout
${universalGuidelines}`,
    specialInstructions: "Make this incredibly practical. Use numbered lists, bolded action words, and consider adding 'Pro-Tip' callouts in each step to provide extra value."
  },
  {
    id: uuidv4(),
    title: 'The "Myth-Busting" Exposé',
    description: `Target Platforms: LinkedIn Articles, Medium (great for viral potential)
Best For: Challenging industry beliefs, thought leadership, differentiating your approach`,
    structure: `Structure (2000 words):

The Common Belief (250 words): What most people think is true
Transition phrase: "But where did this belief come from?"

Why This Myth Persists (350 words): Historical and cultural reasons
Transition phrase: "Here's what the data actually shows..."

The Reality Check (500 words): What the evidence reveals
Transition phrase: "Don't believe me? Let me show you..."

Real-World Examples (600 words): 3-4 examples of the myth in action
Example 1: Transition: "Take Company X, for instance..."
Example 2: Transition: "This pattern shows up again in..."
Example 3: Transition: "Even more striking is the case of..."

The Better Approach (250 words): Your alternative method
Transition phrase: "So how do you make this mental shift?"

Mindset Shift Guide (50 words): Practical steps to change thinking

Key Elements:
- Lead with the myth as a question
- Use authoritative research to debunk
- Include personal stories of believing the myth
- Provide immediate actionable alternatives
${universalGuidelines}`,
    specialInstructions: "Clearly state the myth upfront. Use strong, verifiable evidence (studies, statistics) to debunk it. The power of this template comes from irrefutable proof, not just opinion."
  },
  {
    id: uuidv4(),
    title: 'The "Behind-the-Scenes" Revelation',
    description: `Target Platforms: Substack, Medium, LinkedIn (builds intimacy)
Best For: Building trust, showcasing expertise, demystifying your process`,
    structure: `Structure (2000 words):

The Promise (150 words): What you're going to reveal
Transition phrase: "Let me take you inside my recent work with..."

Setting the Scene (300 words): Context about your business/client work
Transition phrase: "Here's exactly how it unfolded..."

The Process Unveiled (800 words): Step-by-step behind-the-scenes look
Phase 1: Transition: "In the first session, I always..."
Phase 2: Transition: "This is where things get interesting..."
Phase 3: Transition: "The breakthrough moment came when..."

What Most People Miss (400 words): Hidden elements others overlook
Transition phrase: "Now, here's where most coaches go wrong..."

Mistakes to Avoid (250 words): Common pitfalls you've observed
Transition phrase: "What really makes the difference is..."

The Real Success Factors (75 words): What actually matters
Transition phrase: "Here's how you can apply this..."

Takeaways (25 words): Action items for readers

Key Elements:
- Use specific timestamps and details
- Include your internal thought process
- Share moments of uncertainty or failure
- Reveal tools and frameworks you use
${universalGuidelines}`,
    specialInstructions: "This is about building trust through transparency. Share your internal thought process, including moments of doubt or mistakes you made. Make the reader feel like an insider."
  },
  {
    id: uuidv4(),
    title: 'The "Comparison Matrix" Analysis',
    description: `Target Platforms: Medium, LinkedIn Articles (great for decision-making content)
Best For: Comparing strategies, tools, approaches, or methodologies`,
    structure: `Structure (2000 words):

The Dilemma (200 words): Why choosing between options is difficult
Transition phrase: "Let me break down each option systematically..."

Option 1 Deep Dive (525 words): Pros, cons, best use cases, examples
Transition phrase: "Now let's examine the alternative..."

Option 2 Deep Dive (525 words): Pros, cons, best use cases, examples
Transition phrase: "But there's a third option many overlook..."

Option 3 Deep Dive (525 words): Pros, cons, best use cases, examples
Transition phrase: "So which should you choose?"

The Verdict (175 words): Your recommendation based on scenarios
Transition phrase: "Here's a simple framework to help you decide..."

Decision Framework (50 words): How to choose for themselves

Key Elements:
- Create a comparison table
- Include real companies using each approach
- Address budget and resource considerations
- Provide a decision tree or flowchart
${universalGuidelines}`,
    specialInstructions: "Remain as objective as possible when describing each option. The 'Verdict' section is where your expert opinion comes in, guiding the reader based on their specific situation (e.g., 'If you're a startup, choose Option A...')."
  },
  {
    id: uuidv4(),
    title: 'The "Trend Prediction" Forecast',
    description: `Target Platforms: LinkedIn Articles, Medium (positions you as a thought leader)
Best For: Industry expertise, forward-thinking content, conference speaking material`,
    structure: `Structure (2000 words):

Current State Analysis (300 words): Where things stand today
Transition phrase: "But several forces are converging to change this..."

Driving Forces (400 words): What's causing change in the industry
Transition phrase: "These forces point to three major shifts ahead..."

Prediction 1 (400 words): First major trend with evidence
Transition phrase: "This leads to an even bigger transformation..."

Prediction 2 (400 words): Second major trend with implications
Transition phrase: "Perhaps most significantly..."

Prediction 3 (400 words): Third trend and its impact
Transition phrase: "So when will all this happen?"

Timeline and Probability (75 words): When these will occur
Transition phrase: "Here's how to prepare..."

Preparation Guide (25 words): Action steps for readers

Key Elements:
- Reference industry reports and expert opinions
- Include your track record of past predictions
- Assign confidence levels to each prediction
- Connect trends to immediate business impact
${universalGuidelines}`,
    specialInstructions: "Ground your predictions in current data ('Driving Forces'). Assign a confidence level to each prediction to manage reader expectations. The goal is to be a credible futurist, not a psychic."
  },
  {
    id: uuidv4(),
    title: 'The "Results Framework" Blueprint',
    description: `Target Platforms: All platforms (excellent for lead generation)
Best For: Teaching comprehensive systems, establishing methodologies, generating coaching leads`,
    structure: `Structure (2000 words):

The Promise (150 words): What results this framework delivers
Transition phrase: "This framework is built on four foundation principles..."

Foundation Principles (250 words): Core beliefs that make it work
Transition phrase: "Now let me walk you through each component..."

The 4-Part Framework (1400 words): 350 words each for four components
Component 1: Strategy + example
Transition: "This strategic foundation enables..."

Component 2: Implementation + case study
Transition: "Once implementation is solid, you can focus on..."

Component 3: Optimization + metrics
Transition: "With optimization in place, you're ready to..."

Component 4: Scaling + advanced tactics
Transition: "Even with a perfect system, watch out for..."

Common Implementation Mistakes (150 words): What goes wrong
Transition phrase: "Here's how you'll know it's working..."

Success Metrics (25 words): How to measure progress
Transition phrase: "Ready to get started?"

Next Steps (25 words): First action to take

Key Elements:
- Include worksheets or assessments
- Provide specific metrics for each component
- Share client transformation stories
- End with a clear pathway to work with you
${universalGuidelines}`,
    specialInstructions: "Structure this as a mini-course. Each 'Component' should teach a specific part of your system. Use strong, benefit-driven subheadings for each part."
  },
];