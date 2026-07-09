import dotenv from 'dotenv';
dotenv.config(); // Load backend/.env BEFORE importing ai.service

import { extractBatch } from "./src/services/ai.service";

async function test() {
  console.log("🔑 API Key loaded:", process.env.GEMINI_API_KEY ? "YES" : "NO");
  console.log("🚀 Sending batch to Gemini...\n");

  const rows: Record<string, string>[] = [
    {
      Customer: "John Doe",
      Contact: "+91 9876543210",
      Notes: "Call tomorrow morning",
    },
    {
      Full_Name: "Sarah Johnson",
      Emails: "sarah@gmail.com, sarah.office@gmail.com",
      Mobile: "9876543211",
    },
    {
      Company: "ABC Pvt Ltd",
      City: "Jaipur",
    },
    {
      Name: "Raj Patel",
      Email_Address: "raj@gmail.com",
      Phone1: "9876543212",
      Phone2: "9999999999",
      Remark: "Interested in demo next week",
    },
  ];

  try {
    const result = await extractBatch(rows);
    console.log("✅ Result:\n");
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error("❌ Error:", err);
  }
}

test();
