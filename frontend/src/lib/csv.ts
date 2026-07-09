import Papa from 'papaparse';

export const parseCSVClientSide = (file: File): Promise<Record<string, string>[]> => {
    return new Promise((resolve, reject) => {
        Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            transformHeader: (header) => header.trim(),
            complete: (results) => {
                if (results.errors.length > 0 && results.data.length === 0) {
                    reject(new Error(`Failed to parse CSV: ${results.errors[0].message}`));
                } else if (results.data.length === 0) {
                    reject(new Error('CSV file is empty or contains no data rows'));
                } else {
                    resolve(results.data as Record<string, string>[]);
                }
            },
            error: (error) => {
                reject(error);
            }
        });
    });
};
