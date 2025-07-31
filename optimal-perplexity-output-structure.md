# Optimal Perplexity Output Structure Based on 4 Mandatory Questions

## Mapping the 4 Questions to SEO Output

### Question 1: Development Stage
**Purpose**: Determines content tone, regulatory language, and market positioning
- **Phase III**: Focus on clinical trial data, investigational language
- **Market Shaping**: Pre-launch awareness, disease education
- **Market Launch**: Commercial messaging, patient/HCP benefits

### Question 2: Product Name (Generic or Brand)
**Purpose**: Primary keyword targeting and brand recognition
- **Generic Name**: Scientific/medical SEO focus
- **Brand Name**: Consumer-friendly, brand awareness

### Question 3: Medical Indication
**Purpose**: Core search intent and content focus
- Drives primary keywords
- Shapes user questions
- Determines competitive landscape

### Question 4: Therapeutic Area
**Purpose**: Audience targeting and content depth
- Determines medical complexity
- Shapes technical language level
- Influences schema markup type

## Optimal Output Structure

### 1. Title Tag (60 chars)
**Formula**: [Product Name] for [Indication] | [Stage-Specific Suffix]
- Phase III: "Clinical Trial Info"
- Market Shaping: "Coming Soon"
- Market Launch: "Official Site"

**Example**: "Keytruda for NSCLC Treatment | Official Site"

### 2. Meta Description (155 chars)
**Formula**: Learn about [Product Name] ([Generic]) for [Indication]. [Stage-specific CTA]. [Compliance statement].
- Include both names when available
- Stage-appropriate call-to-action
- Safety/regulatory disclaimer

### 3. H1 Tag
**Formula**: [Product Name]® ([Generic Name]) - [Indication] [Stage Descriptor]
- Clear product identification
- Indication prominence
- Stage-appropriate messaging

### 4. Keywords (10-15 terms)
**Structure**:
- Primary: [product name], [generic name], [indication]
- Secondary: [therapeutic area] + [indication], [product] + "treatment"
- Long-tail: "what is [product] used for", "[product] side effects"
- Voice search: question-based queries
- Geographic: [product] + location terms

### 5. H2 Subheadings (4-5 sections)
Based on the 4 questions:
1. "What is [Product Name]?" (addresses Q2)
2. "How Does [Product] Work for [Indication]?" (addresses Q3)
3. "[Therapeutic Area]: Understanding [Indication]" (addresses Q4)
4. "[Development Stage]-Specific Information" (addresses Q1)
5. "Important Safety Information"

### 6. Body Content Structure (500-800 words)
**Paragraph 1**: Product introduction answering "What is X?"
- Name (brand/generic based on stage)
- Basic indication
- Therapeutic area context

**Paragraph 2-3**: Mechanism and indication details
- How it works (simplified)
- Specific indication details
- Patient population

**Paragraph 4-5**: Stage-specific content
- Phase III: Trial information, enrollment
- Market Shaping: Disease education, unmet need
- Market Launch: Benefits, administration

**Paragraph 6-7**: Therapeutic area context
- Disease background
- Current treatment landscape
- Product positioning

**Paragraph 8**: Safety and next steps
- Key safety points
- CTA based on stage
- Regulatory disclaimers

### 7. Schema Markup
**Base Type**: MedicalWebPage + Drug/ClinicalTrial
```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "about": {
    "@type": "[Drug or ClinicalTrial based on stage]",
    "name": "[Product Name]",
    "alternateName": "[Generic Name]",
    "indication": "[Medical Indication]",
    "medicineSystem": "WesternConventional",
    "prescriptionStatus": "[PrescriptionOnly or Investigational]"
  }
}
```

## GEO Optimization Based on 4 Questions

### Voice Search Queries
1. "What is [product] used for?" → Indication
2. "How does [product] work?" → Mechanism
3. "Is [product] approved?" → Development stage
4. "What type of drug is [product]?" → Therapeutic area

### AI-Friendly Summaries
- First 2 sentences must answer all 4 questions
- Use definition format: "[Product] is a [therapeutic area] medication"
- Stage-specific availability statement
- Clear indication statement

## Compliance Considerations by Stage

### Phase III
- "Investigational" required
- No efficacy claims
- Trial recruitment focus
- NCT number prominent

### Market Shaping
- Disease awareness primary
- "In development" messaging
- No product promotion
- Educational focus

### Market Launch
- Full promotional content
- Benefit/risk balance
- ISI integration
- Commercial CTAs