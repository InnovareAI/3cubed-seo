# Dynamic GEO Output Fields (5-7 Fields Based on Stage & Product)

## Core GEO Fields (Always Include These 5):

### 1. AI-Optimized Summary
**Purpose**: Concise, citable definition for AI extraction
**Format**: 2-3 sentences with authoritative citations
**Example**: "According to FDA approval NDA 214154, [Product] is a [drug class] indicated for [indication]. In pivotal trials (NCT#), it demonstrated [key outcome]."

### 2. Structured Medical Facts
**Purpose**: Technical details AI can parse and present
**Format**: Bullet-point structure with medical terminology
- Drug Class: [Technical classification]
- Mechanism: [MOA with scientific terms]
- Administration: [Route, dosing, frequency]
- Key Efficacy: [Primary endpoint with statistics]

### 3. Evidence-Based Statistics
**Purpose**: Quantifiable data points for AI to cite
**Format**: 3-5 key statistics with sources
- Trial size: N=[number] patients
- Primary outcome: [% or months with CI]
- Response rate: [% with measurement criteria]
- Safety: [% of common AEs]

### 4. Authoritative Citations
**Purpose**: Enable AI to reference credible sources
**Format**: Structured source list
- FDA: [Approval date, NDA/BLA number]
- Clinical Trial: [NCT number, phase]
- Publication: [Journal, DOI if available]

### 5. Voice Search Answers
**Purpose**: Natural language responses for voice AI
**Format**: 2-3 conversational sentences answering:
- "What is [product] used for?"
- "How does [product] work?"
- "Is [product] FDA approved?"

## Dynamic Fields (Add 1-2 Based on Stage/Product):

### 6A. Trial Enrollment Information (Phase III only)
**When to use**: Phase III products
**Format**: 
- Eligibility: [Key inclusion criteria]
- Locations: [Number of sites/countries]
- Contact: [ClinicalTrials.gov link]
- Timeline: [Estimated completion]

### 6B. Prescribing Highlights (Market Launch only)
**When to use**: FDA-approved products
**Format**: Key prescribing information
- Dosing: [Standard dosing regimen]
- Contraindications: [Absolute contraindications]
- Warnings: [Boxed warning if applicable]
- Drug Interactions: [Major interactions]

### 7A. Biomarker Information (Targeted Therapies)
**When to use**: Products with companion diagnostics
**Format**:
- Required Testing: [Biomarker name]
- Cutoff Values: [e.g., PD-L1 ≥50%]
- Testing Method: [FDA-approved test]

### 7B. Patient Population Descriptors (Rare Diseases)
**When to use**: Orphan drugs or niche indications
**Format**:
- Disease Prevalence: [Cases per 100,000]
- Patient Characteristics: [Age, stage, prior treatments]
- Unmet Need: [Current treatment gap]

## Stage-Based GEO Selection Logic:

### Phase III Products (5-6 fields):
1. AI-Optimized Summary ✓
2. Structured Medical Facts ✓
3. Evidence-Based Statistics ✓
4. Authoritative Citations ✓
5. Voice Search Answers ✓
6. Trial Enrollment Information ✓

### Market Shaping (5 fields):
1. AI-Optimized Summary ✓
2. Structured Medical Facts ✓
3. Evidence-Based Statistics ✓
4. Authoritative Citations ✓
5. Voice Search Answers ✓

### Market Launch (6-7 fields):
1. AI-Optimized Summary ✓
2. Structured Medical Facts ✓
3. Evidence-Based Statistics ✓
4. Authoritative Citations ✓
5. Voice Search Answers ✓
6. Prescribing Highlights ✓
7. Biomarker Information (if applicable) OR Patient Population Descriptors (if rare disease)

## Product-Type Modifiers:

### Oncology Products:
- Emphasize biomarkers and patient selection
- Include line of therapy
- Focus on survival endpoints

### Rare Disease Products:
- Include prevalence data
- Emphasize unmet need
- Focus on patient journey

### Chronic Disease Products:
- Emphasize long-term safety
- Include quality of life metrics
- Focus on adherence

### Acute Treatment Products:
- Emphasize speed of onset
- Include duration of effect
- Focus on resolution rates

## Prohibited Content (Never Include):
- Comparative efficacy claims vs competitors
- Head-to-head trial data (unless FDA-approved labeling)
- Cost-effectiveness comparisons
- Market share or competitive positioning
- Off-label uses or benefits

## Example Dynamic Application:

**Keytruda (Pembrolizumab) - Oncology, Market Launch**
Selected GEO fields:
1. AI-Optimized Summary ✓
2. Structured Medical Facts ✓
3. Evidence-Based Statistics ✓
4. Authoritative Citations ✓
5. Voice Search Answers ✓
6. Prescribing Highlights ✓
7. Biomarker Information (PD-L1 testing) ✓

**Investigational Gene Therapy - Rare Disease, Phase III**
Selected GEO fields:
1. AI-Optimized Summary ✓
2. Structured Medical Facts ✓
3. Evidence-Based Statistics ✓
4. Authoritative Citations ✓
5. Voice Search Answers ✓
6. Trial Enrollment Information ✓