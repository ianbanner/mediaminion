import { GoogleGenAI, Type } from "@google/genai";
import { 
  LINKEDIN_GENERATION_EVALUATION_SCRIPT,
  LINKEDIN_ANALYSIS_SCRIPT,
  SCAN_CONTENT_FOR_TEMPLATES_SCRIPT,
  CREATE_TEMPLATES_FROM_POSTS_SCRIPT,
  PARSE_SCHEDULE_SCRIPT,
  GENERATE_ARTICLE_SCRIPT,
  GENERATE_HEADLINES_SCRIPT,
  EVALUATE_HEADLINES_SCRIPT,
  REEVALUATE_HEADLINE_SCRIPT,
  GENERATE_ARTICLE_IDEAS_SCRIPT,
  ENHANCE_ARTICLE_SCRIPT,
  CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT,
  GENERATE_HEADLINES_FOR_ARTICLE_SCRIPT
} from './scriptService.ts';
import { SavedTemplate, TopPostAssessment, GeneratedArticle, GeneratedHeadline, Suggestion, SavedArticleTemplate, ArticleIdea } from "../types.ts";

export interface SocialPost {
  platform: string;
  content: string;
}

export interface ResearchedPost {
  postContent: string;
  engagementMetrics: string;
  postUrl: string;
  analysis: string;
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
    standardStarterText: string;
    userRole: string;
}

export interface ArticleGenerationParams {
    script: string;
    wordCount: number;
    styleReferences: string;
    sourceContent: string;
    referenceWorld: string;
    userRole: string;
    targetAudience: string;
    title?: string;
    endOfArticleSummary: string;
    evalCriteria: string;
    selectedTemplate: SavedArticleTemplate | null;
    allTemplates: SavedArticleTemplate[];
    finalDestination: string;
    finalDestinationGuidelines: string;
}


// Helper function to get AI instance and handle API key
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateAndEvaluatePosts({ articleUrl, articleText, templates, script, targetAudience, standardSummaryText, standardStarterText, userRole }: GenerationParams): Promise<GenerationResults> {
  try {
    const ai = getAI();

    const templatesString = templates.map(t => 
      `### Template: ${t.title}\nStructure:\n\`\`\`\n${t.template}\n\`\`\`\nExample:\n\`\`\`\n${t.example}\n\`\`\`\nInstructions: ${t.instructions || 'None'}`
    ).join('\n\n---\n\n');

    const finalSummaryText = standardSummaryText.replace(/\[ARTICLE_URL\]/g, articleUrl || 'Source link not provided.');

    // The AI will generate and evaluate posts based on core content. Starter text is prepended *after* this step.
    const prompt = script
      .replace('{user_role}', userRole)
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
                  content: { type: Type.STRING, description: "The full text of the generated post, without any starter text." },
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
                    content: { type: Type.STRING, description: "The full text of the generated post, without any starter text." },
                    assessment: { type: Type.STRING, description: "A detailed breakdown of why this post is effective based on the evaluation criteria." },
                    score: { type: Type.NUMBER, description: "The evaluation score (0-100) for this specific post." },
                  },
                  required: ['title', 'content', 'assessment', 'score'],
                },
            }
          },
          required: ['rankedTable', 'top7Assessments'],
        },
        temperature: 0.5,
      },
    });
    
    const jsonResponse: GenerationResults = JSON.parse(response.text);

    // Programmatically add the starter text to the content of each post after evaluation.
    if (standardStarterText && standardStarterText.trim() !== '') {
        const prefix = `${standardStarterText.trim()}\n\n`;

        if (jsonResponse.rankedTable) {
            jsonResponse.rankedTable = jsonResponse.rankedTable.map(post => ({
                ...post,
                content: prefix + post.content,
            }));
        }

        if (jsonResponse.top7Assessments) {
            jsonResponse.top7Assessments = jsonResponse.top7Assessments.map(assessment => ({
                ...assessment,
                content: prefix + assessment.content,
            }));
        }
    }
    
    return jsonResponse;

  } catch (error) {
    console.error("Error generating and evaluating posts:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate and evaluate posts. Error: ${error.message}`);
    }
    throw new Error("Failed to generate and evaluate posts. An unknown error occurred.");
  }
}

export async function researchPopularPosts(script: string): Promise<ResearchedPost[]> {
  try {
    const ai = getAI();
    const prompt = script; // The script from the state is now the full prompt.

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-pro',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topPosts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  postContent: { type: Type.STRING },
                  engagementMetrics: { type: Type.STRING },
                  postUrl: { type: Type.STRING },
                  analysis: { type: Type.STRING },
                },
                required: ['postContent', 'engagementMetrics', 'postUrl', 'analysis'],
              },
            },
          },
          required: ['topPosts'],
        },
      },
    });

    const { topPosts } = JSON.parse(response.text);
    return topPosts;
  } catch (error) {
    console.error("Error researching posts:", error);
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
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        foundTemplates: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    template: { type: Type.STRING },
                                    example: { type: Type.STRING },
                                    instructions: { type: Type.STRING },
                                },
                                required: ['title', 'template', 'example', 'instructions'],
                            },
                        },
                    },
                    required: ['foundTemplates'],
                },
            },
        });
        const { foundTemplates } = JSON.parse(response.text);
        return foundTemplates;
    } catch (error) {
        console.error("Error scanning content:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to scan content. Error: ${error.message}`);
        }
        throw new Error("Failed to scan content. An unknown error occurred.");
    }
}

export async function createTemplatesFromPosts(posts: ResearchedPost[]): Promise<Omit<SavedTemplate, 'id' | 'dateAdded' | 'usageCount' | 'lastUsed'>[]> {
    try {
        const ai = getAI();
        const prompt = CREATE_TEMPLATES_FROM_POSTS_SCRIPT.replace('{posts_json}', JSON.stringify(posts, null, 2));
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        createdTemplates: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    template: { type: Type.STRING },
                                    example: { type: Type.STRING },
                                    instructions: { type: Type.STRING },
                                },
                                required: ['title', 'template', 'example', 'instructions'],
                            },
                        },
                    },
                    required: ['createdTemplates'],
                },
            },
        });
        const { createdTemplates } = JSON.parse(response.text);
        return createdTemplates;
    } catch (error) {
        console.error("Error creating templates:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to create templates. Error: ${error.message}`);
        }
        throw new Error("Failed to create templates. An unknown error occurred.");
    }
}

export async function parseSchedule(scheduleText: string): Promise<string[]> {
    try {
        const ai = getAI();
        const prompt = PARSE_SCHEDULE_SCRIPT.replace('{schedule_text}', scheduleText);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        times: { type: Type.ARRAY, items: { type: Type.STRING } },
                    },
                    required: ['times'],
                },
            },
        });
        const { times } = JSON.parse(response.text);
        return times;
    } catch (error) {
        console.error("Error parsing schedule:", error);
        throw new Error("AI failed to parse schedule.");
    }
}

export async function generateArticleIdeas({ sourceArticle, userRole, targetAudience, script }: { sourceArticle: string; userRole: string; targetAudience: string; script: string; }): Promise<ArticleIdea[]> {
    try {
        const ai = getAI();
        const prompt = script
            .replace('{source_article}', sourceArticle)
            .replace('{user_role}', userRole)
            .replace('{target_audience}', targetAudience);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        articleIdeas: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    title: { type: Type.STRING },
                                    summary: { type: Type.STRING },
                                    keyPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
                                },
                                required: ['title', 'summary', 'keyPoints'],
                            },
                        },
                    },
                    required: ['articleIdeas'],
                },
            },
        });

        const { articleIdeas } = JSON.parse(response.text);
        return articleIdeas;
    } catch (error) {
        console.error("Error generating article ideas:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate article ideas. Error: ${error.message}`);
        }
        throw new Error("Failed to generate article ideas. An unknown error occurred.");
    }
}


export async function generateArticle(params: ArticleGenerationParams): Promise<GeneratedArticle> {
    try {
        const ai = getAI();

        let templateGuidance = "The user has not selected a specific template. Analyze the source content and choose an appropriate structure yourself from your general knowledge of writing, or by subtly using one of the provided templates as inspiration.";
        if (params.selectedTemplate) {
            const allTemplatesString = params.allTemplates.map(t => 
                `### ${t.title}\nDescription: ${t.description}\nStructure:\n${t.structure}\n`
            ).join('---\n');
            
            templateGuidance = `
The user has selected a specific template to guide the generation. You MUST follow this template's structure closely.

### Selected Template: ${params.selectedTemplate.title}
${params.selectedTemplate.structure}
${params.selectedTemplate.specialInstructions ? `\nSpecial Instructions for this template: ${params.selectedTemplate.specialInstructions}` : ''}

For context, here are all available templates:
${allTemplatesString}
`;
        }

        const prompt = params.script
            .replace('{user_role}', params.userRole)
            .replace('{target_audience}', params.targetAudience)
            .replace('{final_destination}', params.finalDestination)
            .replace('{destination_guidelines}', params.finalDestinationGuidelines)
            .replace('{word_count}', params.wordCount.toString())
            .replace('{preferred_title}', params.title || 'AI to generate a suitable title')
            .replace('{template_guidance}', templateGuidance)
            .replace('{style_references}', params.styleReferences)
            .replace('{source_content}', params.sourceContent)
            .replace('{reference_world}', params.referenceWorld)
            .replace('{end_of_article_summary}', params.endOfArticleSummary)
            .replace('{evaluation_criteria}', params.evalCriteria);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        evaluation: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    area: { type: Type.STRING },
                                },
                                required: ['text', 'area'],
                            },
                        },
                    },
                    required: ['title', 'content', 'evaluation', 'score', 'suggestions'],
                },
                temperature: 0.7,
            },
        });

        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error generating article:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate article. Error: ${error.message}`);
        }
        throw new Error("Failed to generate article. An unknown error occurred.");
    }
}

export async function enhanceArticle({ originalTitle, originalContent, evalCriteria, suggestions }: { originalTitle: string; originalContent: string; evalCriteria: string; suggestions: Suggestion[] }): Promise<GeneratedArticle> {
    try {
        const ai = getAI();
        const suggestionsText = suggestions.map(s => `- [${s.area}] ${s.text}`).join('\n');
        
        const prompt = ENHANCE_ARTICLE_SCRIPT
            .replace('{original_title}', originalTitle)
            .replace('{original_content}', originalContent)
            .replace('{suggestions}', suggestionsText)
            .replace('{evaluation_criteria}', evalCriteria);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        evaluation: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    area: { type: Type.STRING },
                                },
                                required: ['text', 'area'],
                            },
                        },
                    },
                    required: ['title', 'content', 'evaluation', 'score', 'suggestions'],
                },
                temperature: 0.7,
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error enhancing article:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to enhance article. Error: ${error.message}`);
        }
        throw new Error("Failed to enhance article. An unknown error occurred.");
    }
}

export async function polishArticle({ originalTitle, originalContent, evalCriteria, styleReferences, polishScript }: { originalTitle: string; originalContent: string; evalCriteria: string; styleReferences: string; polishScript: string }): Promise<GeneratedArticle> {
    try {
        const ai = getAI();
        
        const prompt = polishScript
            .replace('{original_title}', originalTitle)
            .replace('{original_content}', originalContent)
            .replace('{style_references}', styleReferences)
            .replace('{evaluation_criteria}', evalCriteria);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        content: { type: Type.STRING },
                        evaluation: { type: Type.STRING },
                        score: { type: Type.NUMBER },
                        suggestions: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    text: { type: Type.STRING },
                                    area: { type: Type.STRING },
                                },
                                required: ['text', 'area'],
                            },
                        },
                    },
                    required: ['title', 'content', 'evaluation', 'score', 'suggestions'],
                },
                temperature: 0.8, // Slightly higher for more creative stylistic changes
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error polishing article:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to polish article. Error: ${error.message}`);
        }
        throw new Error("Failed to polish article. An unknown error occurred.");
    }
}


export async function createArticleTemplateFromText({ articleText, existingTemplates }: { articleText: string, existingTemplates: SavedArticleTemplate[] }): Promise<Omit<SavedArticleTemplate, 'id'>> {
    try {
        const ai = getAI();
        const examples = existingTemplates.slice(0, 3).map(t => 
`### ${t.title}
Description: ${t.description}
Structure:
${t.structure}
---`
        ).join('\n');

        const prompt = CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT
            .replace('{existing_templates_examples}', examples)
            .replace('{article_text}', articleText);
            
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        title: { type: Type.STRING },
                        description: { type: Type.STRING },
                        structure: { type: Type.STRING },
                        specialInstructions: { type: Type.STRING },
                    },
                    required: ['title', 'description', 'structure', 'specialInstructions'],
                },
            },
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error creating template from text:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to create template. Error: ${error.message}`);
        }
        throw new Error("Failed to create template from text. An unknown error occurred.");
    }
}

export async function generateHeadlinesForArticle({ articleContent, evalCriteria, script }: { articleContent: string; evalCriteria: string; script: string; }): Promise<Omit<GeneratedHeadline, 'id'>[]> {
    try {
        const ai = getAI();
        const prompt = script
            .replace('{article_content}', articleContent)
            .replace('{evaluation_criteria}', evalCriteria);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headlines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    headline: { type: Type.STRING },
                                    subheadline: { type: Type.STRING },
                                    score: { type: Type.NUMBER },
                                    reasoning: { type: Type.STRING },
                                },
                                required: ['headline', 'subheadline', 'score', 'reasoning'],
                            },
                        },
                    },
                    required: ['headlines'],
                },
            },
        });

        const { headlines } = JSON.parse(response.text);
        return headlines;
    } catch (error) {
        console.error("Error generating headlines for article:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate headlines. Error: ${error.message}`);
        }
        throw new Error("Failed to generate headlines. An unknown error occurred.");
    }
}