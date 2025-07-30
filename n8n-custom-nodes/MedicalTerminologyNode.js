// Custom N8N Node: Medical Terminology Validator
// Validates and standardizes medical terminology using SNOMED CT, ICD-10, MeSH

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

export class MedicalTerminologyNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Medical Terminology',
    name: 'medicalTerminology',
    icon: 'file:medical.svg',
    group: ['pharmaceutical'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["terminology"]}}',
    description: 'Validate and standardize medical terminology',
    defaults: {
      name: 'Medical Terminology',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Validate Terminology',
            value: 'validate',
            action: 'Validate medical terminology',
          },
          {
            name: 'Standardize Terms',
            value: 'standardize',
            action: 'Standardize medical terms',
          },
          {
            name: 'Find Synonyms',
            value: 'synonyms',
            action: 'Find term synonyms',
          },
          {
            name: 'Check Drug Interactions',
            value: 'interactions',
            action: 'Check drug interactions',
          },
          {
            name: 'ICD-10 Lookup',
            value: 'icd10',
            action: 'Lookup ICD-10 codes',
          },
        ],
        default: 'validate',
      },
      {
        displayName: 'Terminology System',
        name: 'terminology',
        type: 'options',
        options: [
          {
            name: 'SNOMED CT',
            value: 'snomed',
          },
          {
            name: 'ICD-10',
            value: 'icd10',
          },
          {
            name: 'MeSH',
            value: 'mesh',
          },
          {
            name: 'RxNorm',
            value: 'rxnorm',
          },
          {
            name: 'LOINC',
            value: 'loinc',
          },
        ],
        default: 'snomed',
      },
      {
        displayName: 'Medical Term',
        name: 'medicalTerm',
        type: 'string',
        default: '',
        placeholder: 'e.g., pembrolizumab, lung cancer, hypertension',
        description: 'Medical term to validate or standardize',
        required: true,
      },
      {
        displayName: 'Indication/Condition',
        name: 'indication',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['interactions'],
          },
        },
        default: '',
        description: 'Medical condition for drug interaction check',
      },
      {
        displayName: 'Validation Options',
        name: 'validationOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Strict Validation',
            name: 'strictValidation',
            type: 'boolean',
            default: true,
            description: 'Require exact terminology matches',
          },
          {
            displayName: 'Include Deprecated',
            name: 'includeDeprecated',
            type: 'boolean',
            default: false,
            description: 'Include deprecated terminology in results',
          },
          {
            displayName: 'Return Hierarchy',
            name: 'returnHierarchy',
            type: 'boolean',
            default: false,
            description: 'Return full terminology hierarchy',
          },
          {
            displayName: 'Max Results',
            name: 'maxResults',
            type: 'number',
            default: 10,
            description: 'Maximum number of results to return',
          },
        ],
      },
    ],
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i++) {
      try {
        const operation = this.getNodeParameter('operation', i) as string;
        const terminology = this.getNodeParameter('terminology', i) as string;
        const medicalTerm = this.getNodeParameter('medicalTerm', i) as string;
        const indication = this.getNodeParameter('indication', i, '') as string;
        const validationOptions = this.getNodeParameter('validationOptions', i, {}) as any;

        let result;

        switch (operation) {
          case 'validate':
            result = await this.validateTerminology(medicalTerm, terminology, validationOptions);
            break;
          case 'standardize':
            result = await this.standardizeTerms(medicalTerm, terminology, validationOptions);
            break;
          case 'synonyms':
            result = await this.findSynonyms(medicalTerm, terminology, validationOptions);
            break;
          case 'interactions':
            result = await this.checkDrugInteractions(medicalTerm, indication, validationOptions);
            break;
          case 'icd10':
            result = await this.lookupICD10(medicalTerm, validationOptions);
            break;
          default:
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
        }

        returnData.push({
          json: result,
          pairedItem: { item: i },
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
              operation: this.getNodeParameter('operation', i),
              term: this.getNodeParameter('medicalTerm', i),
            },
            pairedItem: { item: i },
          });
        } else {
          throw error;
        }
      }
    }

    return [returnData];
  }

  private async validateTerminology(term: string, terminology: string, options: any) {
    // Simulated medical terminology validation
    // In production, this would connect to UMLS, SNOMED CT APIs, etc.
    
    const termDatabase = {
      snomed: {
        'pembrolizumab': {
          code: '703974001',
          display: 'pembrolizumab (substance)',
          status: 'active',
          hierarchy: ['Pharmaceutical / biologic product', 'Immunologic product', 'Monoclonal antibody'],
        },
        'lung cancer': {
          code: '363358000',
          display: 'malignant tumor of lung (disorder)',
          status: 'active',
          hierarchy: ['Clinical finding', 'Disease', 'Neoplasm', 'Malignant neoplasm'],
        },
        'hypertension': {
          code: '38341003',
          display: 'hypertensive disorder, systemic arterial (disorder)',
          status: 'active',
          hierarchy: ['Clinical finding', 'Disease', 'Vascular disorder'],
        },
      },
      icd10: {
        'lung cancer': {
          code: 'C78.9',
          display: 'Secondary malignant neoplasm of unspecified respiratory organ',
          category: 'Neoplasms',
        },
        'hypertension': {
          code: 'I10',
          display: 'Essential (primary) hypertension',
          category: 'Diseases of the circulatory system',
        },
      },
      rxnorm: {
        'pembrolizumab': {
          code: '1374353',
          display: 'pembrolizumab',
          term_type: 'IN',
          sources: ['DRUGBANK', 'FDA'],
        },
      },
    };

    const normalizedTerm = term.toLowerCase();
    const termData = termDatabase[terminology]?.[normalizedTerm];

    const validation = {
      original_term: term,
      terminology_system: terminology,
      is_valid: !!termData,
      validation_timestamp: new Date().toISOString(),
      validation_options: options,
    };

    if (termData) {
      validation.validated_term = {
        ...termData,
        synonyms: this.generateSynonyms(normalizedTerm),
        confidence_score: this.calculateConfidenceScore(term, termData),
        clinical_significance: this.assessClinicalSignificance(normalizedTerm, terminology),
      };

      if (options.returnHierarchy && termData.hierarchy) {
        validation.validated_term.hierarchy_path = termData.hierarchy;
      }
    } else {
      validation.suggestions = this.generateSuggestions(term, terminology);
      validation.validation_errors = [
        `Term '${term}' not found in ${terminology} terminology`,
        'Consider checking spelling or using alternative terms',
      ];
    }

    return validation;
  }

  private async standardizeTerms(term: string, terminology: string, options: any) {
    const validation = await this.validateTerminology(term, terminology, options);
    
    return {
      original_term: term,
      standardized_term: validation.validated_term?.display || term,
      standard_code: validation.validated_term?.code || null,
      terminology_system: terminology,
      standardization_confidence: validation.validated_term?.confidence_score || 0,
      alternative_standards: this.generateAlternativeStandards(term, terminology),
      standardization_timestamp: new Date().toISOString(),
    };
  }

  private async findSynonyms(term: string, terminology: string, options: any) {
    const synonyms = this.generateSynonyms(term.toLowerCase());
    
    return {
      original_term: term,
      terminology_system: terminology,
      synonyms: synonyms,
      synonym_count: synonyms.length,
      preferred_term: synonyms[0] || term,
      search_timestamp: new Date().toISOString(),
    };
  }

  private async checkDrugInteractions(drug: string, indication: string, options: any) {
    // Simulated drug interaction database
    const interactionDatabase = {
      'pembrolizumab': {
        contraindications: ['live vaccines', 'immunosuppressants'],
        warnings: ['immune-mediated adverse reactions', 'infusion-related reactions'],
        major_interactions: [
          {
            drug: 'warfarin',
            severity: 'major',
            mechanism: 'immune system effects may alter coagulation',
            management: 'monitor INR closely',
          },
        ],
        moderate_interactions: [
          {
            drug: 'metformin',
            severity: 'moderate', 
            mechanism: 'potential for immune-mediated diabetes',
            management: 'monitor blood glucose',
          },
        ],
        condition_interactions: {
          'autoimmune disease': 'contraindicated - may exacerbate condition',
          'organ transplant': 'contraindicated - risk of rejection',
        },
      },
    };

    const drugData = interactionDatabase[drug.toLowerCase()];
    
    return {
      drug_name: drug,
      indication: indication,
      interaction_check_date: new Date().toISOString(),
      has_interactions: !!drugData,
      interaction_summary: drugData ? {
        contraindications: drugData.contraindications || [],
        warnings: drugData.warnings || [],
        major_interactions: drugData.major_interactions || [],
        moderate_interactions: drugData.moderate_interactions || [],
        condition_specific: drugData.condition_interactions?.[indication.toLowerCase()] || null,
      } : null,
      clinical_significance: drugData ? 'high' : 'unknown',
      recommendation: drugData ? 
        'Review all interactions with prescribing physician' : 
        'No known interactions in database - consult current literature',
    };
  }

  private async lookupICD10(condition: string, options: any) {
    const icd10Database = {
      'lung cancer': [
        { code: 'C78.9', description: 'Secondary malignant neoplasm of unspecified respiratory organ' },
        { code: 'C34.1', description: 'Malignant neoplasm of upper lobe, unspecified bronchus or lung' },
        { code: 'C34.9', description: 'Malignant neoplasm of unspecified part of unspecified bronchus or lung' },
      ],
      'hypertension': [
        { code: 'I10', description: 'Essential (primary) hypertension' },
        { code: 'I11.9', description: 'Hypertensive heart disease without heart failure' },
        { code: 'I12.9', description: 'Hypertensive chronic kidney disease with stage 1 through stage 4 chronic kidney disease' },
      ],
    };

    const codes = icd10Database[condition.toLowerCase()] || [];
    
    return {
      condition: condition,
      icd10_codes: codes,
      code_count: codes.length,
      primary_code: codes[0] || null,
      lookup_timestamp: new Date().toISOString(),
      billing_ready: codes.length > 0,
      clinical_documentation_support: codes.map(code => ({
        code: code.code,
        description: code.description,
        documentation_requirements: this.getDocumentationRequirements(code.code),
      })),
    };
  }

  private generateSynonyms(term: string): string[] {
    const synonymDatabase = {
      'pembrolizumab': ['Keytruda', 'anti-PD-1 antibody', 'immune checkpoint inhibitor'],
      'lung cancer': ['pulmonary carcinoma', 'bronchogenic carcinoma', 'lung malignancy'],
      'hypertension': ['high blood pressure', 'arterial hypertension', 'elevated blood pressure'],
    };

    return synonymDatabase[term] || [];
  }

  private calculateConfidenceScore(originalTerm: string, termData: any): number {
    // Simple confidence scoring algorithm
    let score = 0.8; // Base score
    
    if (termData.status === 'active') score += 0.1;
    if (termData.hierarchy) score += 0.05;
    if (originalTerm.toLowerCase() === termData.display.toLowerCase()) score += 0.05;
    
    return Math.min(score, 1.0);
  }

  private assessClinicalSignificance(term: string, terminology: string): string {
    const highSignificanceTerms = ['pembrolizumab', 'lung cancer', 'hypertension'];
    
    if (highSignificanceTerms.includes(term)) {
      return 'high';
    } else if (terminology === 'snomed' || terminology === 'icd10') {
      return 'medium';
    } else {
      return 'low';
    }
  }

  private generateSuggestions(term: string, terminology: string): string[] {
    // Simple fuzzy matching suggestions
    const suggestions = [];
    const commonTerms = {
      snomed: ['pembrolizumab', 'lung cancer', 'hypertension', 'diabetes mellitus', 'myocardial infarction'],
      icd10: ['lung cancer', 'hypertension', 'diabetes', 'pneumonia', 'heart failure'],
    };

    const terms = commonTerms[terminology] || [];
    
    terms.forEach(availableTerm => {
      if (this.levenshteinDistance(term.toLowerCase(), availableTerm.toLowerCase()) <= 3) {
        suggestions.push(availableTerm);
      }
    });

    return suggestions.slice(0, 5);
  }

  private generateAlternativeStandards(term: string, terminology: string): any[] {
    return [
      {
        system: 'SNOMED CT',
        term: term,
        confidence: 0.85,
      },
      {
        system: 'ICD-10',
        term: term,
        confidence: 0.75,
      },
    ];
  }

  private getDocumentationRequirements(icd10Code: string): string[] {
    const requirements = {
      'C78.9': ['Histological confirmation', 'Staging documentation', 'Primary site identification'],
      'I10': ['Blood pressure readings', 'Cardiovascular risk assessment', 'End organ damage evaluation'],
    };

    return requirements[icd10Code] || ['Standard clinical documentation required'];
  }

  private levenshteinDistance(str1: string, str2: string): number {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }
}