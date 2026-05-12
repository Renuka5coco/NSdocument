import os
import json
from groq import Groq
from pydantic import BaseModel
from typing import Optional

# Initialize Groq Client
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def extract_data(processed_file: dict, doc_type_hint: str) -> dict:
    """
    Routes the processed file content to the appropriate Groq model.
    """
    system_prompt = f"""
    You are an expert document intelligence engine. Your task is to deeply analyze the provided document and extract all meaningful structured information.

    User-provided document type hint: {doc_type_hint}

    ---
    STEP 1 — IDENTIFY DOCUMENT TYPE
    Determine the actual document_type from the content. Use the hint to guide you, but trust the document itself.
    Recognized types: kyc, loan_agreement, bank_statement, recovery_notice, invoice, insurance_policy, legal_contract, other

    ---
    STEP 2 — EXTRACT ALL RELEVANT FIELDS
    Extract every key piece of information based on document type. Include fields listed below as applicable, plus any additional fields uniquely present in the document.

    KYC / Identity Documents:
      full_name, date_of_birth, gender, nationality, id_type, id_number, issue_date, expiry_date, address, phone_number, email

    Loan Agreements:
      borrower_name, co_borrower_name, lender_name, loan_amount, currency, disbursement_date, loan_tenure_months, interest_rate_percent, emi_amount, repayment_start_date, processing_fee, prepayment_penalty, collateral_details, agreement_date, agreement_number, governing_law

    Bank Statements:
      account_holder_name, account_number, account_type, bank_name, branch_name, ifsc_code, statement_period_from, statement_period_to, opening_balance, closing_balance, total_credits, total_debits, currency

    Recovery / Legal Notices:
      borrower_name, outstanding_amount, principal_overdue, interest_overdue, notice_date, due_date, loan_account_number, lender_name, sender_name, legal_section_referenced, consequences_stated

    Invoices:
      invoice_number, invoice_date, seller_name, seller_address, buyer_name, buyer_address, line_items_summary, subtotal, tax_amount, total_amount, payment_due_date, payment_terms

    ---
    STEP 3 — CAPTURE ADDITIONAL FIELDS
    For any important data not covered above, create descriptive snake_case keys (e.g., "arbitration_clause_present": true, "signed_by_witness": false).

    ---
    OUTPUT RULES
    - Output ONLY a flat, valid JSON object.
    - All keys must be snake_case strings.
    - Values must be strings, numbers, or booleans — no nested objects or arrays.
    - For missing or unclear fields, use null — never guess or hallucinate values.
    - Do not include any markdown, code fences, commentary, or explanation.
    - First key must always be "document_type".
    """

    try:
        if processed_file["type"] == "text":
            # Use LLaMA 3 8B for fast text processing
            user_prompt = f"""
Analyze and extract all structured data from the following document text.
Return only a valid flat JSON object. No markdown, no explanation, no preamble.

---BEGIN DOCUMENT---
{processed_file['content']}
---END DOCUMENT---
"""
            messages = [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt.strip()}
            ]
            response = client.chat.completions.create(
                model="llama3-8b-8192",
                messages=messages,
                temperature=0.1,
                response_format={"type": "json_object"}
            )
            return json.loads(response.choices[0].message.content)

        elif processed_file["type"] == "image":
            # Use LLaMA 3.2 11B Vision for images
            vision_instructions = """
Now analyze the document image attached below.

Instructions for vision extraction:
- Read all visible text carefully, including headers, footers, watermarks, stamps, and handwritten annotations if legible.
- If the image contains multiple pages or panels, treat them as one unified document.
- If any field is partially obscured or unclear, use your best confident read — or null if truly unreadable.
- Pay attention to tables, form fields, and structured layouts; map them to appropriate snake_case keys.

Return only a valid flat JSON object. No markdown, no code fences, no explanation.
The first key must always be "document_type".
"""
            content_payload = [{"type": "text", "text": system_prompt.strip() + "\n\n" + vision_instructions.strip()}]
            
            # Add images to payload
            for img_url in processed_file["content"]:
                content_payload.append({
                    "type": "image_url",
                    "image_url": {"url": img_url}
                })

            messages = [
                {
                    "role": "user",
                    "content": content_payload
                }
            ]
            response = client.chat.completions.create(
                model="meta-llama/llama-4-scout-17b-16e-instruct",
                messages=messages,
                temperature=0.1
            )
            
            # Groq Vision sometimes returns markdown json blocks, we need to strip them
            output_text = response.choices[0].message.content.strip()
            
            # Extract JSON block robustly
            start = output_text.find('{')
            end = output_text.rfind('}')
            if start != -1 and end != -1:
                output_text = output_text[start:end+1]
                
            return json.loads(output_text)

    except Exception as e:
        raise Exception(f"AI Extraction failed: {str(e)}")
