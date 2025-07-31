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

**Definition**: Content optimized for AI-powered search engines using Backlinko's proven tactics

#### A. Authoritative Summary with Citations
"According to [FDA/ClinicalTrials.gov], [Product] is a [drug class with technical term] [approved/in development] for [exact FDA indication]. In the pivotal [trial name] (NCT#), it demonstrated [key statistical outcome]. [Mechanism of action with medical terminology]."

#### B. Technical Medical Facts (Structured for AI)
- **Classification**: [Technical drug class, e.g., "humanized IgG1 monoclonal antibody"]
- **Mechanism**: [Precise MOA, e.g., "selectively binds to PD-1 receptor"]
- **Indication**: [Exact FDA language]
- **Efficacy**: [Primary endpoint with statistics and p-value]
- **Administration**: [Technical details, e.g., "2 mg/kg IV q3w"]
- **Biomarkers**: [If applicable, e.g., "PD-L1 TPS ≥50%"]

#### C. Statistical Evidence Points
• Clinical Trial: [Name] (NCT#) with N=[patients]
• Primary Outcome: [Specific result with HR/OR and CI]
• Response Rate: [ORR % with comparator]
• Survival Data: [mPFS/OS with months]
• Safety Profile: [% Grade 3+ AEs]
• FDA Approval: [Date and application number]
• Published: [Journal, DOI]

#### D. Expert Quotations & Guidelines
- FDA Review: "[Quote from FDA review document]"
- Lead Investigator: "[Quote from trial PI]"
- Clinical Guidelines: "Per [NCCN/ASCO] guidelines..."
- Prescribing Information: "[Direct quote on dosing/warnings]"

#### E. Unique Medical Vocabulary
Include disease-specific and drug-specific terms:
- [Unique biomarkers]
- [Specific patient populations]
- [Technical administration terms]
- [Resistance mechanisms]
- [Companion diagnostics]

#### F. Voice Search Optimization with Authority
- "According to FDA approval [#], [product] is indicated for..."
- "Clinical trial [name] demonstrated that [product]..."
- "The prescribing information states that [product]..."
- "In [%] of patients, [product] showed..."

#### G. Source Documentation for AI
- Primary Source: [FDA Label/Drugs@FDA]
- Clinical Trial: [ClinicalTrials.gov NCT#]
- Publication: [Journal, Year, DOI]
- Guidelines: [Organization, Year]
- Last Updated: [Date]
- Evidence Level: [Phase 3 RCT/Real-world/Meta-analysis]

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