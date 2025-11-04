import { GoogleGenAI, Type } from "@google/genai";
import { 
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  GENERATE_LINKEDIN_IDEAS_SCRIPT,
  RANK_LINKEDIN_POSTS_SCRIPT,
  RESEARCH_POPULAR_POSTS_SCRIPT,
  SCAN_CONTENT_FOR_TEMPLATES_SCRIPT
} from './scriptService';
import { SavedTemplate, TopPostAssessment } from "../types";

export interface SocialPost {
  platform: string;
  content: string;
}

export interface ResearchedPost {
  hook: string;
  platform: string;
  engagement: string;
  analysis: string;
  url: string;
}

export interface PostEvaluation {
  title: string;
  score: number;
  content: string;
}

export interface GenerationResults {
    rankedTable: PostEvaluation[];
    top7Assessments: TopPostAssessment[];
}

export interface GenerationParams {
    articleUrl: string;
    articleText: string;
    templates: SavedTemplate[];
    script: string;
    targetAudience: string;
    standardSummaryText: string;
}


// Helper function to get AI instance and handle API key
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateAndEvaluatePosts({ articleUrl, articleText, templates, script, targetAudience, standardSummaryText }: GenerationParams): Promise<GenerationResults> {
  try {
    const ai = getAI();

    const templatesString = templates.map(t => 
      `### Template: ${t.title}\nStructure:\n\`\`\`\n${t.template}\n\`\`\`\nExample:\n\`\`\`\n${t.example}\n\`\`\`\nInstructions: ${t.instructions || 'None'}`
    ).join('\n\n---\n\n');

    const finalSummaryText = standardSummaryText.replace(/\[ARTICLE_URL\]/g, articleUrl || 'Source link not provided.');

    const prompt = script
      .replace('{article_url}', articleUrl)
      .replace('{article_text}', articleText)
      .replace('{templates_document}', templatesString)
      .replace('{target_audience}', targetAudience)
      .replace('{standard_summary_text}', finalSummaryText);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro', // Using pro for this complex task
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            rankedTable: {
              type: Type.ARRAY,
              description: "A table of all generated posts, ranked by score.",
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "The title of the template used." },
                  score: { type: Type.NUMBER, description: "The total evaluation score (0-100)." },
                  content: { type: Type.STRING, description: "The full text of the generated post." },
                },
                required: ['title', 'score', 'content'],
              },
            },
            top7Assessments: {
                type: Type.ARRAY,
                description: "A detailed assessment of the top 7 posts.",
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: "The title of the template used for the post." },
                    content: { type: Type.STRING, description: "The full text of the generated post." },
                    assessment: { type: Type.STRING, description: "A detailed breakdown of why this post is effective based on the evaluation criteria." },
                  },
                  required: ['title', 'content', 'assessment'],
                },
            }
          },
          required: ['rankedTable', 'top7Assessments'],
        },
        temperature: 0.5,
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse;

  } catch (error) {
    console.error("Error generating and evaluating posts:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate and evaluate posts. Error: ${error.message}`);
    }
    throw new Error("Failed to generate and evaluate posts. An unknown error occurred.");
  }
}

export async function generateAndRankLinkedinPosts(examples: string): Promise<SocialPost[]> {
  try {
    const ai = getAI();

    const generationPrompt = GENERATE_LINKEDIN_IDEAS_SCRIPT.replace('{examples}', examples);

    const generationResponse = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: generationPrompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    generated_posts: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                },
                required: ['generated_posts'],
            },
        },
    });

    const { generated_posts } = JSON.parse(generationResponse.text);
    if (!generated_posts || generated_posts.length === 0) {
        throw new Error("Initial post generation failed to produce results.");
    }

    const rankingPrompt = RANK_LINKEDIN_POSTS_SCRIPT.replace('{generated_posts}', JSON.stringify(generated_posts));

    const rankingResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: [{ parts: [{ text: rankingPrompt }] }],
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    posts: {
                        type: Type.ARRAY,
                        items: {
                            type: Type.OBJECT,
                            properties: {
                                platform: { type: Type.STRING },
                                content: { type: Type.STRING },
                            },
                            required: ['platform', 'content'],
                        },
                    },
                },
                required: ['posts'],
            },
            temperature: 0.3,
        },
    });
    
    const { posts } = JSON.parse(rankingResponse.text);
    return posts.slice(0, 10) || [];

  } catch (error) {
    console.error("Error generating and ranking posts:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to process LinkedIn posts. Error: ${error.message}`);
    }
    throw new Error("Failed to process LinkedIn posts. An unknown error occurred.");
  }
}

export async function researchPopularPosts(script: string): Promise<ResearchedPost[]> {
    try {
      const ai = getAI();
  
      const prompt = RESEARCH_POPULAR_POSTS_SCRIPT.replace('{script}', script);
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using pro for better research capabilities
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              posts: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    hook: { type: Type.STRING, description: "The hook text of the post." },
                    platform: { type: Type.STRING, description: "The platform (e.g., LinkedIn, X)." },
                    engagement: { type: Type.STRING, description: "Engagement metrics (e.g., 15K views, 200 comments)." },
                    analysis: { type: Type.STRING, description: "A brief analysis of why the hook worked." },
                    url: { type: Type.STRING, description: "The direct URL to the post. Must be a valid URL string starting with 'https://'. Do not use markdown format." },
                  },
                  required: ['hook', 'platform', 'engagement', 'analysis', 'url'],
                },
              },
            },
            required: ['posts'],
          },
          temperature: 0.5,
        },
      });
      
      const { posts } = JSON.parse(response.text);
      return posts.slice(0, 10) || [];
  
    } catch (error) {
      console.error("Error researching popular posts:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to research posts. Error: ${error.message}`);
      }
      throw new Error("Failed to research posts. An unknown error occurred.");
    }
}

export async function scanContentForTemplates(content: string): Promise<Omit<SavedTemplate, 'id' | 'dateAdded' | 'usageCount' | 'lastUsed'>[]> {
  try {
    const ai = getAI();

    const prompt = SCAN_CONTENT_FOR_TEMPLATES_SCRIPT.replace('{content}', content);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            foundTemplates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING, description: "A concise title for the template." },
                  template: { type: Type.STRING, description: "The core template structure with placeholders like {{...}} or [...]." },
                  example: { type: Type.STRING, description: "A concrete example of the template in use." },
                  instructions: { type: Type.STRING, description: "Optional special instructions for using the template." },
                },
                required: ['title', 'template', 'example', 'instructions'],
              },
            },
          },
          required: ['foundTemplates'],
        },
        temperature: 0.5,
      },
    });
    
    const { foundTemplates } = JSON.parse(response.text);
    return foundTemplates || [];

  } catch (error) {
    console.error("Error scanning content for templates:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to scan content. Error: ${error.message}`);
    }
    throw new Error("Failed to scan content. An unknown error occurred.");
  }
}