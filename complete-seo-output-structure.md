# Complete SEO & GEO Output Structure

## Required Output Fields (Based on 4 Mandatory Questions + FDA Data)

### 1. SEO Keywords (10 terms)
Primary keywords for traditional search optimization:
- 2-3 from product name (generic/brand based on stage)
- 2-3 from indication
- 2-3 from therapeutic area
- 2-3 stage-specific terms (e.g., "clinical trial", "FDA approved")
- Include NCT numbers when available

### 2. Long-tail Keywords (5 terms)
Specific phrase-based searches:
- "[Product] for [indication] treatment"
- "[Product] [dosage form] how to use"
- "[Generic] vs [competitor] for [indication]"
- "[Product] side effects [patient population]"
- "[Product] cost with insurance"

### 3. Consumer Questions (10 questions)
Common patient/caregiver searches:
1. "What is [product] used for?"
2. "How does [product] work?"
3. "What are [product] side effects?"
4. "How much does [product] cost?"
5. "Is [product] FDA approved?"
6. "How is [product] administered?"
7. "Who should not take [product]?"
8. "Can [product] be used with other medications?"
9. "How long does [product] take to work?"
10. "Where can I get [product]?"

### 4. H1 Tag
Main page heading incorporating all 4 inputs:
- Format: [Product Name]® ([Generic]) for [Indication] | [Therapeutic Area] [Stage Status]

### 5. H2 Tags (5-6 subheadings)
Section headers that structure the content:
1. "What is [Product Name]?"
2. "How Does [Product] Work for [Indication]?"
3. "[Product] Clinical Trial Information" (Phase III) / "Benefits of [Product]" (Market Launch)
4. "Who Can Use [Product]?"
5. "Important Safety Information"
6. "Getting Started with [Product]"

### 6. Title Tag (50-60 characters)
SERP title optimized for clicks:
- Phase III: "[Generic] [Indication] Clinical Trial | [Sponsor]"
- Market Shaping: "[Generic] for [Indication] - Coming Soon"
- Market Launch: "[Brand]® ([Generic]) | Official [Indication] Treatment"

### 7. Meta Description (140-155 characters)
SERP description for CTR:
- Include product name, indication, stage-specific CTA
- Add "Learn more" or "See if you qualify" based on stage

### 8. Body Content (500-800 words)
Structured content with FDA data integration:
- Opening paragraph: Answer all 4 questions
- Indication overview with FDA-approved language
- Mechanism of action (simplified)
- Clinical evidence (NCT numbers, outcomes)
- Safety profile (from FDA labeling)
- Patient eligibility
- Next steps (stage-appropriate CTA)

### 9. Schema Markup (JSON-LD)
Structured data for rich snippets:
```json
{
  "@context": "https://schema.org",
  "@type": "[Drug/ClinicalTrial based on stage]",
  "name": "[Product Name]",
  "alternateName": "[Generic Name]",
  "indication": "[Medical Indication]",
  "clinicalTrialId": "[NCT Number]",
  "fdaApplicationNumber": "[NDA/BLA if approved]",
  "manufacturer": {
    "@type": "Organization",
    "name": "[Sponsor]"
  }
}
```

### 10. GEO Content (Generative Engine Optimization)

**Definition**: Content optimized for AI-powered search engines (ChatGPT, Claude, Perplexity, Gemini)

#### A. AI-Friendly Summary (2-3 sentences)
Concise definition that AI can extract:
"[Product] is a [therapeutic area] medication [in development for/approved for] [indication]. It works by [simple mechanism]. [Availability statement based on stage]."

#### B. Structured Q&A Format
For AI to extract and present:
- **What**: [Product] is a [drug class] that [primary action]
- **Why**: Used to treat [indication] in [patient population]
- **How**: Administered as [dosage form] [frequency]
- **When**: [Stage-specific availability]
- **Where**: [Trial sites/Pharmacy availability]

#### C. Key Facts List (5-7 bullet points)
Easily extractable by AI:
• Drug name: [Brand (Generic)]
• Indication: [FDA-approved/investigational indication]
• Mechanism: [One-line explanation]
• Administration: [Route and frequency]
• Key benefit: [Primary efficacy point]
• Safety note: [Most important warning]
• Status: [Development stage/Approval date]

#### D. Voice Search Optimization
Natural language answers:
- "According to FDA records, [product] is..."
- "Clinical trials show that [product]..."
- "[Product] was approved by the FDA in [date] for..."

#### E. AI Citation Format
Help AI cite sources:
- Source: [FDA/ClinicalTrials.gov]
- Reference: [NCT#/NDA#]
- Last Updated: [Date]

## Output Format Structure

The complete output should include all 10 sections in this order:
1. SEO Keywords
2. Long-tail Keywords  
3. Consumer Questions
4. H1 Tag
5. H2 Tags
6. Title Tag
7. Meta Description
8. Body Content
9. Schema Markup
10. GEO Content (with all 5 subsections)