

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
  CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT
} from './scriptService.ts';
import { SavedTemplate, TopPostAssessment, GeneratedArticle, GeneratedHeadline, Suggestion, SavedArticleTemplate } from "../types.ts";

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

export async function generateArticleIdeas({ sourceArticle, userRole, targetAudience }: { sourceArticle: string; userRole: string; targetAudience: string; }): Promise<string[]> {
    try {
        const ai = getAI();
        const prompt = GENERATE_ARTICLE_IDEAS_SCRIPT
            .replace('{source_article}', sourceArticle)
            .replace('{user_role}', userRole)
            .replace('{target_audience}', targetAudience);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        article_ideas: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                        },
                    },
                    required: ['article_ideas'],
                },
            },
        });
        const { article_ideas } = JSON.parse(response.text);
        return article_ideas;
    } catch (error) {
        console.error("Error generating article ideas:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to generate article ideas. Error: ${error.message}`);
        }
        throw new Error("Failed to generate article ideas. An unknown error occurred.");
    }
}

export async function generateAndEvaluateHeadlines({ chosenArticleIdea, sourceArticle, generationScript, evalScript }: { chosenArticleIdea: string, sourceArticle: string, generationScript: string, evalScript: string }): Promise<Omit<GeneratedHeadline, 'id'>[]> {
    try {
        const ai = getAI();

        // Step 1: Generate Headlines
        const genPrompt = generationScript
            .replace('{chosen_article_idea}', chosenArticleIdea)
            .replace('{source_article}', sourceArticle);
            
        const genResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: genPrompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        headlines: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING }
                        }
                    },
                    required: ['headlines']
                }
            }
        });
        const { headlines } = JSON.parse(genResponse.text);

        if (!headlines || headlines.length === 0) {
            throw new Error("AI failed to generate any headlines.");
        }

        // Step 2: Evaluate Headlines
        const evalPrompt = EVALUATE_HEADLINES_SCRIPT
            .replace('{evaluation_criteria}', evalScript)
            .replace('{headlines_json}', JSON.stringify(headlines));

        const evalResponse = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: evalPrompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        evaluatedHeadlines: {
                            type: Type.ARRAY,
                            items: {
                                type: Type.OBJECT,
                                properties: {
                                    headline: { type: Type.STRING },
                                    score: { type: Type.NUMBER },
                                    reasoning: { type: Type.STRING }
                                },
                                required: ['headline', 'score', 'reasoning']
                            }
                        }
                    },
                    required: ['evaluatedHeadlines']
                }
            }
        });
        const { evaluatedHeadlines } = JSON.parse(evalResponse.text);

        return evaluatedHeadlines;
    } catch (error) {
        console.error("Error generating and evaluating headlines:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to process headlines. Error: ${error.message}`);
        }
        throw new Error("Failed to process headlines. An unknown error occurred.");
    }
}

export async function reevaluateHeadline({ headline, evalScript }: { headline: string, evalScript: string }): Promise<Pick<GeneratedHeadline, 'score' | 'reasoning'>> {
    try {
        const ai = getAI();
        const prompt = REEVALUATE_HEADLINE_SCRIPT
            .replace('{evaluation_criteria}', evalScript)
            .replace('{headline}', headline);

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [{ parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.OBJECT,
                    properties: {
                        score: { type: Type.NUMBER },
                        reasoning: { type: Type.STRING }
                    },
                    required: ['score', 'reasoning']
                }
            }
        });
        return JSON.parse(response.text);
    } catch (error) {
        console.error("Error re-evaluating headline:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to re-evaluate headline. Error: ${error.message}`);
        }
        throw new Error("Failed to re-evaluate headline. An unknown error occurred.");
    }
}

export async function generateArticle(params: ArticleGenerationParams): Promise<GeneratedArticle> {
    try {
        const ai = getAI();
        const prompt = params.script
            .replace('{user_role}', params.userRole)
            .replace('{target_audience}', params.targetAudience)
            .replace('{word_count}', params.wordCount.toString())
            .replace('{preferred_title}', params.title || 'To be generated by AI')
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
                                    area: { type: Type.STRING }
                                },
                                required: ['text', 'area']
                            }
                        }
                    },
                    required: ['title', 'content', 'evaluation', 'score', 'suggestions'],
                },
            },
        });

        const result: GeneratedArticle = JSON.parse(response.text);
        return result;

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
        const suggestionsString = suggestions.map(s => `- [${s.area}] ${s.text}`).join('\n');
        
        const prompt = ENHANCE_ARTICLE_SCRIPT
            .replace('{original_title}', originalTitle)
            .replace('{original_content}', originalContent)
            .replace('{evaluation_criteria}', evalCriteria)
            .replace('{suggestions}', suggestionsString);

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
                                    area: { type: Type.STRING }
                                },
                                required: ['text', 'area']
                            }
                        }
                    },
                    required: ['title', 'content', 'evaluation', 'score', 'suggestions'],
                },
            },
        });

        const result: GeneratedArticle = JSON.parse(response.text);
        return result;

    } catch (error) {
        console.error("Error enhancing article:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to enhance article. Error: ${error.message}`);
        }
        throw new Error("Failed to enhance article. An unknown error occurred.");
    }
}

export async function createArticleTemplateFromText({ articleText, existingTemplates }: { articleText: string, existingTemplates: SavedArticleTemplate[] }): Promise<Omit<SavedArticleTemplate, 'id'>> {
    try {
        const ai = getAI();

        const existingTemplatesString = existingTemplates.map(t => 
            `### Template: ${t.title}\nDescription: ${t.description}\nStructure:\n\`\`\`\n${t.structure}\n\`\`\``
        ).join('\n\n---\n\n');

        const prompt = CREATE_ARTICLE_TEMPLATE_FROM_TEXT_SCRIPT
            .replace('{article_text}', articleText)
            .replace('{existing_templates_examples}', existingTemplatesString);

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
                    },
                    required: ['title', 'description', 'structure'],
                },
            },
        });

        const result: Omit<SavedArticleTemplate, 'id'> = JSON.parse(response.text);
        return result;

    } catch (error) {
        console.error("Error creating article template from text:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to create article template from text. Error: ${error.message}`);
        }
        throw new Error("Failed to create article template from text. An unknown error occurred.");
    }
}
