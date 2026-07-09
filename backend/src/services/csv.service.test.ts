import { parseCSV } from './csv.service';

describe('CSV Service', () => {
    it('should parse valid CSV data into an array of objects', async () => {
        const csvString = `name,email,phone\nJohn Doe,john@test.com,1234567890\nJane Doe,jane@test.com,0987654321`;
        const buffer = Buffer.from(csvString);

        const result = await parseCSV(buffer);
        
        expect(result).toHaveLength(2);
        expect(result[0].name).toBe('John Doe');
        expect(result[0].email).toBe('john@test.com');
        expect(result[1].phone).toBe('0987654321');
    });

    it('should ignore empty lines', async () => {
        const csvString = `name,email\nJohn Doe,john@test.com\n\nJane Doe,jane@test.com`;
        const buffer = Buffer.from(csvString);

        const result = await parseCSV(buffer);
        
        expect(result).toHaveLength(2);
    });

    it('should trim headers', async () => {
        const csvString = ` name , email \nJohn,john@test.com`;
        const buffer = Buffer.from(csvString);

        const result = await parseCSV(buffer);
        
        expect(result[0]).toHaveProperty('name');
        expect(result[0]).toHaveProperty('email');
    });

    it('should throw an error for empty CSV buffer', async () => {
        const buffer = Buffer.from('');
        
        await expect(parseCSV(buffer)).rejects.toThrow('CSV file is empty');
    });
});
