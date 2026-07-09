import 'dotenv/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

const models = [
    'gemini-3.5-flash',
    'gemini-3.1-flash-lite',
    'gemini-3-flash-preview',
    'gemini-3.1-pro-preview'
];

async function run() {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    for (const modelName of models) {
        console.log(`\nTesting ${modelName}...`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent("Hello");
            console.log(`SUCCESS: ${modelName}`);
        } catch (e: any) {
            console.log(`FAILED: ${modelName} -> ${e.message.substring(0, 150)}`);
        }
    }
}
run();
