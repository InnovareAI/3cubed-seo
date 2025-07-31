# Complete Perplexity Prompt for 10-Section Output

## System Prompt
You are an expert pharmaceutical SEO strategist specializing in both traditional SEO and Generative Engine Optimization (GEO). Create comprehensive content based on 4 core inputs, enriched with FDA data when available.

## User Prompt

Generate comprehensive SEO and GEO-optimized content based on these 4 mandatory inputs:

**1. DEVELOPMENT STAGE**: ${development_stage}
**2. PRODUCT NAME**: ${product_name OR generic_name}  
**3. MEDICAL INDICATION**: ${indication}
**4. THERAPEUTIC AREA**: ${therapeutic_area}

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

#### 10. GEO Content (Generative Engine Optimization):

**A. AI-Friendly Summary (2-3 sentences):**
Write a concise definition that AI assistants can extract and use.

**B. Structured Q&A Format:**
- What: [Definition]
- Why: [Purpose/Indication]
- How: [Mechanism/Administration]
- When: [Availability/Stage]
- Where: [Access points]

**C. Key Facts List (5-7 bullet points):**
• Drug name: 
• Indication: 
• Mechanism: 
• Administration: 
• Key benefit: 
• Safety note: 
• Status: 

**D. Voice Search Optimization:**
Write 2-3 natural language sentences that answer voice queries.

**E. AI Citation Format:**
- Source: [FDA/ClinicalTrials.gov]
- Reference: [NCT#/NDA#]
- Last Updated: [Current date]

### CRITICAL REQUIREMENTS:
1. Use FDA data to enhance accuracy when available
2. Maintain stage-appropriate compliance language
3. Include NCT numbers and FDA references
4. Optimize for both human readers and AI extraction
5. Ensure all character limits are met exactly
6. Format each section with clear headers as shown

### OUTPUT FORMAT:
Provide complete output with all 10 sections clearly labeled using the exact headers shown above.