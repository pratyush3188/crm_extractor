import 'dotenv/config';
import { extractBatch } from './src/services/ai.service';

async function run() {
    console.log('Starting...');
    try {
        const rows = [{ name: 'Test', email: 'test@example.com' }];
        const result = await extractBatch(rows);
        console.log('RESULT:', JSON.stringify(result, null, 2));
    } catch (e) {
        console.error('ERROR:', e);
    }
}
run();
