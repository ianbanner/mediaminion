

interface AyrshareResponse {
    status: 'success' | 'error';
    message?: string;
    id?: string;
    postIds?: { platform: string; postId: string; status: string; }[];
}

export async function postToAyrshare(content: string, apiKey: string, platforms: string[] = ['linkedin']): Promise<AyrshareResponse> {
    const API_URL = 'https://app.ayrshare.com/api/post';

    try {
        const response = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                post: content,
                platforms: platforms
            })
        });

        const data: AyrshareResponse = await response.json();
        
        if (!response.ok) {
           throw new Error(data.message || `Ayrshare API request failed with status ${response.status}`);
        }
        
        if (data.status === 'error') {
            throw new Error(data.message || 'Ayrshare returned an error status without a message.');
        }

        return data;

    } catch (error) {
        console.error("Error in postToAyrshare:", error);
        if (error instanceof Error) {
            // Re-throw to be caught by the caller in App.tsx
            throw error;
        }
        throw new Error("An unknown error occurred while posting to Ayrshare.");
    }
}