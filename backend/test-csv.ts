import { parseCSV } from "./src/services/csv.service";

const runTest = async () => {
  console.log("===== VALID CSV =====");
  const validCsv = Buffer.from(`
Name,Email,Phone
John,john@gmail.com,9876543210
Jane,jane@gmail.com,9999999999
`);
  try {
    const data = await parseCSV(validCsv);
    console.log(data);
  } catch (err: any) {
    console.error(err.message);
  }
};

runTest();
