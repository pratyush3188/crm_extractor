import { splitIntoBatches } from './ai.service';

describe('AI Service', () => {
    describe('splitIntoBatches', () => {
        it('should split an array into correct chunk sizes', () => {
            const rows = Array.from({ length: 100 }, (_, i) => ({ id: String(i) }));
            
            const batches = splitIntoBatches(rows, 25);
            
            expect(batches).toHaveLength(4);
            expect(batches[0]).toHaveLength(25);
            expect(batches[3]).toHaveLength(25);
        });

        it('should handle uneven array lengths', () => {
            const rows = Array.from({ length: 110 }, (_, i) => ({ id: String(i) }));
            
            const batches = splitIntoBatches(rows, 25);
            
            expect(batches).toHaveLength(5);
            expect(batches[0]).toHaveLength(25);
            expect(batches[4]).toHaveLength(10);
        });

        it('should return empty array when input is empty', () => {
            const batches = splitIntoBatches([], 25);
            expect(batches).toHaveLength(0);
        });
    });

    // Note: extractBatch is not tested here as it requires a live Gemini API key or mocking GoogleGenerativeAI
});
