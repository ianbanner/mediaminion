import { PostAnalytics } from '../types.ts';

interface AyrshareResponse {
    status: 'success' | 'error';
    message?: string;
    id?: string;
    postIds?: { platform: string; postId: string; status: string; }[];
}

interface AyrshareUserResponse {
    status: 'success' | 'error';
    message?: string;
    email?: string;
}

export interface ConnectionTestResult {
    success: boolean;
    message: string;
}

export async function postToAyrshare(content: string, apiKey: string, platforms: string[] = ['linkedin'], scheduleDate?: string): Promise<AyrshareResponse> {
    const API_URL = 'https://app.ayrshare.com/api/post';

    try {
        const body: { post: string; platforms: string[]; scheduleDate?: string } = {
            post: content,
            platforms: platforms,
        };

        if (scheduleDate) {
            body.scheduleDate = scheduleDate;
        }

        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify(body)
        });

        const data: AyrshareResponse = await response.json();
        
        if (!response.ok || data.status === 'error') {
           throw new Error(data.message || `Ayrshare API request failed with status ${response.status}`);
        }
        
        return data;

    } catch (error) {
        console.error("Error posting to Ayrshare:", error);
        if (error instanceof Error) {
            throw new Error(`Failed to post to Ayrshare. Error: ${error.message}`);
        }
        throw new Error("An unknown error occurred while posting to Ayrshare.");
    }
}

export async function testAyrshareConnection(apiKey: string): Promise<ConnectionTestResult> {
    const API_URL = 'https://app.ayrshare.com/api/user';
     try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`
            }
        });

        const textResponse = await response.text();
        let data: AyrshareUserResponse;

        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            return { success: false, message: `API returned a non-JSON response (Status: ${response.status}). Response: ${textResponse}` };
        }
        
        if (!response.ok || data.status === 'error') {
           return { success: false, message: data.message || `Ayrshare API Error: Status ${response.status}` };
        }
        
        return { success: true, message: `Connection successful for user: ${data.email || 'Unknown'}` };

    } catch (error) {
        console.error("Error testing Ayrshare connection:", error);
        if (error instanceof TypeError) { 
             return { success: false, message: "A network error occurred. This could be a CORS issue from your local setup or the API might be temporarily unavailable. Check the browser console's Network tab for more details." };
        }
        if (error instanceof Error) {
            return { success: false, message: `An unexpected error occurred: ${error.message}` };
        }
        return { success: false, message: "An unknown error occurred during the connection test." };
    }
}

export interface AnalyticsResult {
    success: boolean;
    data: PostAnalytics | null;
    message: string;
    status: number | null;
    rawResponse: string;
    postId: string;
}

export async function getPostAnalytics(postId: string, apiKey: string): Promise<AnalyticsResult> {
    const API_URL = `https://app.ayrshare.com/api/analytics/post`;

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({ id: postId })
        });

        const rawText = await response.text();
        let data;
        try {
            data = JSON.parse(rawText);
        } catch (e) {
             return {
                success: false,
                data: null,
                message: "Failed to parse JSON response from API.",
                status: response.status,
                rawResponse: rawText,
                postId: postId
            };
        }

        if (!response.ok || (data.status && data.status === 'error')) {
            return {
                success: false,
                data: null,
                message: data.message || `API request failed with status ${response.status}`,
                status: response.status,
                rawResponse: rawText,
                postId: postId
            };
        }
        
        return {
            success: true,
            data: data as PostAnalytics,
            message: "Successfully fetched analytics.",
            status: response.status,
            rawResponse: rawText,
            postId: postId
        };

    } catch (error) {
        console.error(`Error fetching post analytics for ${postId}:`, error);
        let message = `An unknown error occurred while fetching post analytics for post ${postId}.`;
        if (error instanceof TypeError) {
            message = `Network error for post ${postId}. This could be a CORS issue. Check the browser's developer console.`;
        } else if (error instanceof Error) {
            message = `Failed to fetch post analytics for post ${postId}. Error: ${error.message}`;
        }
        
        return {
            success: false,
            data: null,
            message: message,
            status: null,
            rawResponse: "Fetch failed, no response from server.",
            postId: postId
        };
    }
}