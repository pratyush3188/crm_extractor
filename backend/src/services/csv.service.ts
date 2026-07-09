import { parse } from 'csv-parse';

/**
 * Parses a CSV buffer into an array of objects.
 * Uses the first row as dynamic headers.
 * Trims whitespace from both headers and values.
 */
export const parseCSV = (buffer: Buffer): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
        // 1. Edge Case: Empty file
        if (!buffer || buffer.length === 0 || buffer.toString('utf8').trim() === '') {
            return reject(new Error('CSV file is empty'));
        }

        const results: Record<string, string>[] = [];

        const parser = parse({
            // 2. Dynamic headers, trimming them
            columns: (headers: string[]) => {
                return headers.map(header => header.trim());
            },
            // Trim whitespace from values
            trim: true,
            skip_empty_lines: true,
            // 3. Strict parsing (don't silently fix broken formatting)
            relax_quotes: false,
            relax_column_count: false
        });

        parser.on('readable', () => {
            let record;
            while ((record = parser.read()) !== null) {
                results.push(record);
            }
        });

        parser.on('error', (err) => {
            // Edge Case: Malformed CSV
            reject(new Error(`Malformed CSV: ${err.message}`));
        });

        parser.on('end', () => {
            // Edge Case: File has headers but no data rows
            if (results.length === 0) {
                return reject(new Error('CSV file contains headers but zero data rows'));
            }
            resolve(results);
        });

        parser.write(buffer);
        parser.end();
    });
};
