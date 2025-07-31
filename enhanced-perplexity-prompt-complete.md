# Complete Perplexity Prompt for 10-Section Output

## System Prompt
You are an expert pharmaceutical SEO strategist specializing in both traditional SEO and Generative Engine Optimization (GEO). Create comprehensive content based on 4 core inputs, enriched with FDA data when available.

## User Prompt

Generate comprehensive SEO and GEO-optimized content based on these 4 mandatory inputs:

**1. DEVELOPMENT STAGE**: ${development_stage}
**2. PRODUCT NAME**: ${product_name OR generic_name}  
**3. MEDICAL INDICATION**: ${indication}
**4. THERAPEUTIC AREA**: ${therapeutic_area}

**IMPORTANT**: Based on the development stage, select appropriate GEO fields:
- Phase III: Include Trial Enrollment Information (6 total GEO fields)
- Market Launch: Include Prescribing Highlights (6-7 total GEO fields)
- Add Biomarker Information for targeted therapies
- Never include competitive comparisons

[FDA DATA SECTION - Include when available]

### REQUIRED OUTPUT STRUCTURE:

#### 1. SEO Keywords (EXACTLY 10):
Generate 10 primary keywords:
- 2-3 from product name(s)
- 2-3 from indication  
- 2-3 from therapeutic area
- 2-3 stage-specific terms
Format as comma-separated list

#### 2. Long-tail Keywords (EXACTLY 5):
Generate 5 specific phrase searches targeting user intent:
- Treatment-focused phrases
- Question-based searches
- Comparison queries
- Cost/access queries
- Side effect searches
Format as comma-separated list

#### 3. Consumer Questions (EXACTLY 10):
List 10 common questions patients/caregivers ask:
1. What is [product] used for?
2. How does [product] work?
3. What are the side effects?
4. How much does it cost?
5. Is it FDA approved?
6. How is it administered?
7. Who should not take it?
8. Drug interactions?
9. How long to see results?
10. Where to get it?

#### 4. H1 Tag:
Create main heading using all 4 inputs
Format: [Name] for [Indication] | [Therapeutic Area] [Stage]

#### 5. H2 Tags (5-6 subheadings):
List section headers as bullet points:
• What is [Product]?
• How Does [Product] Work?
• [Stage-specific section]
• Who Can Use [Product]?
• Important Safety Information
• Next Steps

#### 6. Title Tag (50-60 characters exactly):
Create SERP title based on stage

#### 7. Meta Description (140-155 characters exactly):
Create SERP description with CTA

#### 8. Body Content (500-800 words):
Write comprehensive content with these sections:
- Opening paragraph answering all 4 inputs
- Indication overview
- How it works
- Clinical evidence (use FDA data)
- Safety profile
- Patient eligibility
- Call to action

#### 9. Schema Markup:
Generate complete JSON-LD code:
```json
{
  "@context": "https://schema.org",
  "@type": "[Drug or ClinicalTrial]",
  "name": "[Product]",
  "alternateName": "[Generic]",
  "indication": "[Indication]",
  "clinicalTrialId": "[NCT# if available]",
  "manufacturer": {
    "@type": "Organization",
    "name": "[Sponsor]"
  }
}
```

#### 10. GEO Content (Generative Engine Optimization - 5-7 fields):

**ALWAYS INCLUDE THESE 5 CORE FIELDS:**

**1. AI-Optimized Summary:**
Write 2-3 sentences with citations that AI can extract. Start with "According to [source]..."

**2. Structured Medical Facts:**
• Drug Class: [Technical classification]
• Mechanism: [MOA with scientific terms]
• Administration: [Route, dosing, frequency]
• Key Efficacy: [Primary endpoint with statistics]

**3. Evidence-Based Statistics:**
List 3-5 key data points:
• Trial: [Name] (NCT#) with N=[number]
• Primary Outcome: [Result with CI]
• Response Rate: [% with criteria]
• Safety: [% common AEs]

**4. Authoritative Citations:**
• FDA: [Approval date, NDA/BLA#]
• Clinical Trial: [NCT#, phase]
• Publication: [Journal, DOI]

**5. Voice Search Answers:**
Natural responses to:
• "What is [product] used for?"
• "How does [product] work?"
• "Is [product] FDA approved?"

**ADD 1-2 DYNAMIC FIELDS BASED ON STAGE:**

**For Phase III - Add:**
**6. Trial Enrollment Information:**
• Eligibility: [Key criteria]
• Locations: [Sites/countries]
• Contact: [ClinicalTrials.gov]
• Timeline: [Completion date]

**For Market Launch - Add:**
**6. Prescribing Highlights:**
• Dosing: [Regimen]
• Contraindications: [List]
• Warnings: [Key warnings]
• Interactions: [Major]

**For Targeted Therapies - Also Add:**
**7. Biomarker Information:**
• Required Testing: [Test name]
• Cutoff: [Values]
• Method: [FDA-approved test]

**NEVER INCLUDE:**
- Comparisons to other products
- Competitive positioning
- Off-label information

### CRITICAL REQUIREMENTS:
1. Use FDA data to enhance accuracy when available
2. Maintain stage-appropriate compliance language
3. Include NCT numbers and FDA references
4. Optimize for both human readers and AI extraction
5. Ensure all character limits are met exactly
6. Format each section with clear headers as shown

### OUTPUT FORMAT:
Provide complete output with all 10 sections clearly labeled using the exact headers shown above.