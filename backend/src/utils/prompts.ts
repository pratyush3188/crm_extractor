export const getExtractionPrompt = (batchJSON: string): string => {
    return `You are a highly intelligent AI data extraction assistant for GrowEasy CRM.
Your task is to take a JSON array of messy, unstructured CSV rows and map them into our structured CRM format.

=== REQUIRED CRM FIELDS ===
- created_at (Date string parseable by JS new Date())
- name
- email
- country_code
- mobile_without_country_code
- company
- city
- state
- country
- lead_owner
- crm_status
- crm_note
- data_source
- possession_time
- description

=== STRICT RULES ===
1. 'crm_status' MUST be exactly one of: GOOD_LEAD_FOLLOW_UP, DID_NOT_CONNECT, BAD_LEAD, SALE_DONE. (Leave blank/null if unsure).
2. 'data_source' MUST be exactly one of: leads_on_demand, meridian_tower, eden_park, varah_swamy, sarjapur_plots. (Leave blank/null if unsure).
3. 'created_at' MUST be parseable by JavaScript's new Date(...).
4. 'crm_note' is a catch-all. Use it for remarks, follow-up notes, extra comments, or any useful info that doesn't fit another field.
5. If multiple emails exist, put the first one in 'email' and append the rest into 'crm_note'.
6. If multiple phone numbers exist, put the first one in 'mobile_without_country_code' and append the rest into 'crm_note'.
7. Escape any line breaks in text fields as \\n so nothing breaks the data structure.
8. SKIP INVALID RECORDS: If a row has NEITHER an email NOR a phone number, exclude it from "imported". Instead, add it to the "skipped" list. Provide the original row object and a short string explanation for the "reason".
9. RETURN ONLY VALID JSON. Do NOT wrap the output in markdown fences (e.g., no \`\`\`json). Do NOT provide any conversational text.

=== OUTPUT FORMAT ===
{
  "imported": [
    {
      "created_at": "2026-05-13 14:20:48",
      "name": "John Doe",
      "email": "john.doe@example.com",
      "country_code": "+91",
      "mobile_without_country_code": "9876543210",
      "company": "GrowEasy",
      "city": "Mumbai",
      "state": "Maharashtra",
      "country": "India",
      "lead_owner": "test@gmail.com",
      "crm_status": "GOOD_LEAD_FOLLOW_UP",
      "crm_note": "Client is asking to reschedule demo",
      "data_source": "leads_on_demand",
      "possession_time": "",
      "description": ""
    }
  ],
  "skipped": [
    {
      "original_row": { "Col1": "Val1", "Col2": "Val2" },
      "reason": "Missing both email and phone number"
    }
  ]
}

=== INPUT BATCH DATA ===
${batchJSON}
`;
};
