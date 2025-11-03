import { GoogleGenAI, Type } from "@google/genai";

export interface SocialPost {
  platform: string;
  content: string;
}

export interface TemplateGenerationResponse {
  title: string;
  posts: SocialPost[];
}

// Helper function to get AI instance and handle API key
const getAI = () => {
  if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
  }
  return new GoogleGenAI({ apiKey: process.env.API_KEY });
};

export async function generateSocialPosts(transcript: string, platforms: string[]): Promise<SocialPost[]> {
  try {
    const ai = getAI();

    const prompt = `You are an expert social media manager. Your task is to create engaging social media posts based on the provided podcast transcript.

For each of the following platforms, create a tailored post: ${platforms.join(', ')}.

- For LinkedIn: Write a professional and insightful post. Use professional language and hashtags.
- For X: Write a concise and punchy tweet. Use relevant hashtags and keep it under 280 characters.
- For Facebook: Write an engaging and conversational post. Feel free to use emojis and ask questions to spark discussion.

Podcast Transcript:
"""
${transcript}
"""

Provide the output in the requested JSON format.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
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
                  platform: { type: Type.STRING },
                  content: { type: Type.STRING },
                },
                required: ['platform', 'content'],
              },
            },
          },
          required: ['posts'],
        },
        temperature: 0.7,
        topP: 1,
        topK: 1,
      },
    });
    
    const jsonResponse = JSON.parse(response.text);
    return jsonResponse.posts || [];

  } catch (error) {
    console.error("Error generating social posts:", error);
    if (error instanceof Error) {
      throw new Error(`Failed to generate posts. Error: ${error.message}`);
    }
    throw new Error("Failed to generate posts. An unknown error occurred.");
  }
}

export async function generateAndRankLinkedinPosts(examples: string): Promise<SocialPost[]> {
  try {
    const ai = getAI();

    // Step 1: Generate a diverse set of post ideas based on examples
    const generationPrompt = `You are a creative LinkedIn content strategist. Based on the following successful LinkedIn posts, generate 30 new, diverse, and engaging post ideas. The new posts should capture the style, tone, and format of the examples but cover new angles or topics.

Examples:
"""
${examples}
"""

Provide the output as a JSON object with a single key "generated_posts" which is an array of strings.`;

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

    // Step 2: Rank the generated posts and select the top 10
    const rankingPrompt = `You are a LinkedIn marketing expert with a keen eye for viral content. I have a list of draft LinkedIn posts. Your task is to analyze them and select the top 10 best posts.

Your evaluation criteria should be:
- Engagement Potential: Does it encourage likes, comments, and shares?
- Clarity and Conciseness: Is the message clear and easy to understand?
- Professional Tone: Is it appropriate for the LinkedIn platform?
- Strong Hook: Does the first line grab the reader's attention?
- Actionable Insights or Value: Does it provide value to the reader?

Here are the posts to evaluate:
"""
${JSON.stringify(generated_posts)}
"""

Return only the top 10 posts. Provide the output in the requested JSON format, where each post object has a "platform" (which should always be "LinkedIn") and "content".`;

    const rankingResponse = await ai.models.generateContent({
        model: 'gemini-2.5-pro', // Using a more powerful model for nuanced ranking
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

export async function generatePostsFromTemplates(templates: string, instructions: string): Promise<TemplateGenerationResponse> {
    try {
      const ai = getAI();
  
      const prompt = `You are an expert social media copywriter. Your task is to generate new social media posts and a title for the template you create.

First, analyze the provided templates and instructions. Based on their content and purpose, create a short, descriptive title for this combination (e.g., "Weekly Tech Update," "Casual Friday Thoughts").
  
Second, generate one post for each of these platforms: LinkedIn, X, and Facebook, following the templates and instructions.
  
Here are the templates to use as a base:
"""
${templates}
"""
  
Here are the instructions on how to adapt the templates:
"""
${instructions}
"""
  
Provide the output in the requested JSON format, with a 'title' and a list of 'posts'.`;
  
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: {
                type: Type.STRING,
                description: "A short, descriptive title for the template and instruction combination."
              },
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
            required: ['title', 'posts'],
          },
          temperature: 0.8,
        },
      });
      
      const jsonResponse = JSON.parse(response.text);
      return jsonResponse || { title: 'Untitled', posts: [] };
  
    } catch (error) {
      console.error("Error generating posts from templates:", error);
      if (error instanceof Error) {
        throw new Error(`Failed to generate posts from templates. Error: ${error.message}`);
      }
      throw new Error("Failed to generate posts from templates. An unknown error occurred.");
    }
  }