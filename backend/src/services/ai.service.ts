import { GoogleGenerativeAI } from '@google/generative-ai';
import { CrmRecord, SkippedRecord } from '../types';
import { getExtractionPrompt } from '../utils/prompts';

const GEMINI_MODEL = 'gemini-2.5-flash';

const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

const ALLOWED_CRM_STATUSES = [
    'GOOD_LEAD_FOLLOW_UP',
    'DID_NOT_CONNECT',
    'BAD_LEAD',
    'SALE_DONE',
];

const ALLOWED_DATA_SOURCES = [
    'leads_on_demand',
    'meridian_tower',
    'eden_park',
    'varah_swamy',
    'sarjapur_plots',
];

export const splitIntoBatches = (
    rows: Record<string, string>[],
    batchSize: number = 25
): Record<string, string>[][] => {
    const batches: Record<string, string>[][] = [];
    for (let i = 0; i < rows.length; i += batchSize) {
        batches.push(rows.slice(i, i + batchSize));
    }
    return batches;
};

const delay = (ms: number): Promise<void> =>
    new Promise((resolve) => setTimeout(resolve, ms));

const sanitizeRecord = (record: any): CrmRecord => {
    const sanitized: CrmRecord = { ...record };

    if (sanitized.crm_status && !ALLOWED_CRM_STATUSES.includes(sanitized.crm_status)) {
        sanitized.crm_status = undefined;
    }
    if (sanitized.data_source && !ALLOWED_DATA_SOURCES.includes(sanitized.data_source)) {
        sanitized.data_source = undefined;
    }
    return sanitized;
};

const stripMarkdownFences = (text: string): string => {
    let cleaned = text.trim();
    if (cleaned.startsWith('```json')) {
        cleaned = cleaned.slice(7);
    } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.slice(3);
    }
    if (cleaned.endsWith('```')) {
        cleaned = cleaned.slice(0, -3);
    }
    return cleaned.trim();
};

export const extractBatch = async (
    rows: Record<string, string>[]
): Promise<{ imported: CrmRecord[]; skipped: SkippedRecord[] }> => {
    const batchJSON = JSON.stringify(rows, null, 2);
    const prompt = getExtractionPrompt(batchJSON);

    let lastError: Error | null = null;

    // Read the key safely (removing accidental newlines or trailing spaces)
    const apiKey = process.env.GEMINI_API_KEY?.trim();
    if (!apiKey) {
        throw new Error("GEMINI_API_KEY is not set in your .env file!");
    }

    // Initialize the official SDK
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: GEMINI_MODEL });

    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
        try {
            if (attempt > 0) {
                console.log(`Retry attempt ${attempt}/${MAX_RETRIES}...`);
                await delay(RETRY_DELAY_MS * attempt);
            }

            const result = await model.generateContent({
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 8192,
                }
            });

            const rawText = result.response.text();
            if (!rawText) {
                throw new Error('Empty response from Gemini API');
            }

            const cleanedText = stripMarkdownFences(rawText);
            const parsed = JSON.parse(cleanedText);

            if (!parsed.imported || !Array.isArray(parsed.imported)) {
                throw new Error('AI response missing "imported" array');
            }
            if (!parsed.skipped) {
                parsed.skipped = [];
            }

            const sanitizedImported: CrmRecord[] = parsed.imported.map(sanitizeRecord);
            const skipped: SkippedRecord[] = parsed.skipped;

            return { imported: sanitizedImported, skipped };
        } catch (err: any) {
            lastError = err;
            console.error(`Batch extraction attempt ${attempt + 1} failed:`, err.message);

            // SDK specific error checking
            if (err.status === 400 || err.status === 403 || err.message.includes('API key not valid')) {
                console.error('Non-retryable API error. Check your API key. Skipping remaining retries.');
                break;
            }
        }
    }

    console.error(`All ${MAX_RETRIES + 1} attempts failed for batch. Marking ${rows.length} rows as skipped.`);

    return {
        imported: [],
        skipped: rows.map((row) => ({
            original_row: row,
            reason: `AI processing failed: ${lastError?.message || 'Unknown error'}`,
        })),
    };
};
