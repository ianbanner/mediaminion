import { AppSettings } from '../types';

type AirtableSettings = Pick<AppSettings, 'airtablePersonalAccessToken' | 'airtableBaseId'>;

const API_BASE_URL = 'https://api.airtable.com/v0';

interface AirtableRecord<T> {
    id: string;
    createdTime: string;
    fields: T;
}

interface AirtableListResponse<T> {
    records: AirtableRecord<T>[];
    offset?: string;
}

async function apiRequest(endpoint: string, method: 'GET' | 'POST' | 'PATCH' | 'DELETE', settings: AirtableSettings, body?: any) {
    const url = `${API_BASE_URL}/${settings.airtableBaseId}/${endpoint}`;

    const headers = {
        'Authorization': `Bearer ${settings.airtablePersonalAccessToken}`,
        'Content-Type': 'application/json'
    };

    const response = await fetch(url, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || `Airtable API error: ${response.statusText}`);
    }

    // DELETE returns an empty body on success
    if (response.status === 204 || method === 'DELETE') {
        return;
    }
    
    return response.json();
}

const mapFromAirtable = <T extends {}>(record: AirtableRecord<T>): T & { id: string } => {
    return {
        id: record.id,
        ...record.fields
    };
};

export async function fetchRecords<T extends {}>(tableName: string, settings: AppSettings): Promise<(T & { id: string })[]> {
    const response = await apiRequest(tableName, 'GET', settings) as AirtableListResponse<T>;
    return response.records.map(mapFromAirtable);
}

export async function createRecord<T extends {}>(tableName: string, data: T, settings: AppSettings): Promise<T & { id: string }> {
    const payload = {
        records: [{ fields: data }],
        typecast: true,
    };
    const response = await apiRequest(tableName, 'POST', settings, payload) as AirtableListResponse<T>;
    return mapFromAirtable(response.records[0]);
}

export async function createRecords<T extends {}>(tableName: string, data: T[], settings: AppSettings) {
    const payload = {
        records: data.map(fields => ({ fields })),
        typecast: true,
    };
    return apiRequest(tableName, 'POST', settings, payload);
}

export async function updateRecord<T extends {}>(tableName: string, recordId: string, data: Partial<T>, settings: AppSettings) {
    const payload = {
        records: [{ id: recordId, fields: data }],
        typecast: true,
    };
    return apiRequest(tableName, 'PATCH', settings, payload);
}

export async function updateRecords<T extends {}>(tableName: string, records: {id: string; fields: Partial<T>}[], settings: AppSettings) {
    const payload = {
        records: records,
        typecast: true,
    };
    return apiRequest(tableName, 'PATCH', settings, payload);
}

export async function deleteRecord(tableName: string, recordId: string, settings: AppSettings) {
    const endpoint = `${tableName}?records[]=${recordId}`;
    return apiRequest(endpoint, 'DELETE', settings);
}

export async function deleteRecords(tableName: string, recordIds: string[], settings: AppSettings) {
    const recordsQuery = recordIds.map(id => `records[]=${id}`).join('&');
    const endpoint = `${tableName}?${recordsQuery}`;
    return apiRequest(endpoint, 'DELETE', settings);
}

export async function testAirtableConnection(settings: AppSettings): Promise<{ success: boolean; message: string; }> {
    if (!settings.airtablePersonalAccessToken || !settings.airtableBaseId || !settings.airtableTemplatesTable) {
        return { success: false, message: 'Personal Access Token, Base ID, and Templates Table Name are required.' };
    }

    try {
        // Try to fetch just one record to test the connection
        await apiRequest(`${settings.airtableTemplatesTable}?maxRecords=1`, 'GET', settings);
        return { success: true, message: 'Connection successful!' };
    } catch (error) {
        console.error("Error in testAirtableConnection:", error);
        const message = error instanceof Error ? error.message : "An unknown error occurred.";
        return { success: false, message: `Connection failed: ${message}` };
    }
}