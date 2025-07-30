// Custom N8N Node: FDA API Integration
// Provides direct access to FDA databases for pharmaceutical data

import {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
  NodeConnectionType,
  NodeOperationError,
} from 'n8n-workflow';

export class FdaApiNode implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'FDA API',
    name: 'fdaApi',
    icon: 'file:fda.svg',
    group: ['pharmaceutical'],
    version: 1,
    subtitle: '={{$parameter["operation"] + ": " + $parameter["database"]}}',
    description: 'Interact with FDA databases for pharmaceutical data',
    defaults: {
      name: 'FDA API',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    credentials: [
      {
        name: 'fdaApi',
        required: false,
      },
    ],
    properties: [
      {
        displayName: 'Operation',
        name: 'operation',
        type: 'options',
        noDataExpression: true,
        options: [
          {
            name: 'Search Drug Labels',
            value: 'searchDrugLabels',
            action: 'Search drug labels',
          },
          {
            name: 'Search Adverse Events',
            value: 'searchAdverseEvents',
            action: 'Search adverse events',
          },
          {
            name: 'Search Drug Approvals',
            value: 'searchApprovals',
            action: 'Search drug approvals',
          },
          {
            name: 'Search Clinical Trials',
            value: 'searchTrials',
            action: 'Search clinical trials',
          },
          {
            name: 'Regulatory Status Check',
            value: 'regulatoryStatus',
            action: 'Check regulatory status',
          },
        ],
        default: 'searchDrugLabels',
      },
      {
        displayName: 'Database',
        name: 'database',
        type: 'options',
        displayOptions: {
          show: {
            operation: ['searchDrugLabels', 'searchAdverseEvents', 'searchApprovals'],
          },
        },
        options: [
          {
            name: 'Drug Labels',
            value: 'drug/label',
          },
          {
            name: 'Adverse Events (FAERS)',
            value: 'drug/event',
          },
          {
            name: 'Drug Approvals (Orange Book)',
            value: 'drug/ndc',
          },
          {
            name: 'Drug Recalls',
            value: 'drug/enforcement',
          },
          {
            name: 'Device Events',
            value: 'device/event',
          },
          {
            name: 'Food Recalls', 
            value: 'food/enforcement',
          },
        ],
        default: 'drug/label',
      },
      {
        displayName: 'Search Query',
        name: 'searchQuery',
        type: 'string',
        default: '',
        placeholder: 'e.g., brand_name:\"Keytruda\" OR generic_name:\"pembrolizumab\"',
        description: 'FDA API search query using their syntax',
        required: true,
      },
      {
        displayName: 'Product Name',
        name: 'productName',
        type: 'string',
        displayOptions: {
          show: {
            operation: ['regulatoryStatus'],
          },
        },
        default: '',
        description: 'Product name to check regulatory status',
        required: true,
      },
      {
        displayName: 'Limit',
        name: 'limit',
        type: 'number',
        default: 10,
        description: 'Number of results to return (max 1000)',
        typeOptions: {
          minValue: 1,
          maxValue: 1000,
        },
      },
      {
        displayName: 'Skip',
        name: 'skip',
        type: 'number',
        default: 0,
        description: 'Number of results to skip for pagination',
      },
      {
        displayName: 'Additional Options',
        name: 'additionalOptions',
        type: 'collection',
        placeholder: 'Add Option',
        default: {},
        options: [
          {
            displayName: 'Sort',
            name: 'sort',
            type: 'string',
            default: '',
            description: 'Sort results by field, e.g., \"effective_time:desc\"',
          },
          {
            displayName: 'Count',
            name: 'count',
            type: 'string',
            default: '',
            description: 'Count unique field values, e.g., \"adverse_reactions\"',
          },
          {
            displayName: 'Include Metadata',
            name: 'includeMetadata',
            type: 'boolean',
            default: true,
            description: 'Include FDA API metadata in response',
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
        const database = this.getNodeParameter('database', i, '') as string;
        const searchQuery = this.getNodeParameter('searchQuery', i, '') as string;
        const productName = this.getNodeParameter('productName', i, '') as string;
        const limit = this.getNodeParameter('limit', i, 10) as number;
        const skip = this.getNodeParameter('skip', i, 0) as number;
        const additionalOptions = this.getNodeParameter('additionalOptions', i, {}) as any;

        let url = 'https://api.fda.gov/';
        let queryParams: any = {
          limit: limit.toString(),
          skip: skip.toString(),
        };

        switch (operation) {
          case 'searchDrugLabels':
          case 'searchAdverseEvents': 
          case 'searchApprovals':
            url += `${database}.json`;
            if (searchQuery) {
              queryParams.search = searchQuery;
            }
            break;

          case 'searchTrials':
            // ClinicalTrials.gov integration
            url = 'https://clinicaltrials.gov/api/query/study_fields';
            queryParams = {
              expr: searchQuery || productName,
              fields: 'NCTId,BriefTitle,OverallStatus,Phase,Condition,InterventionName',
              fmt: 'json',
              max_rnk: limit,
            };
            break;

          case 'regulatoryStatus':
            // Multi-database regulatory status check
            url += 'drug/label.json';
            queryParams.search = `brand_name:\"${productName}\" OR generic_name:\"${productName}\"`;
            break;

          default:
            throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`);
        }

        // Add additional options
        if (additionalOptions.sort) {
          queryParams.sort = additionalOptions.sort;
        }
        if (additionalOptions.count) {
          queryParams.count = additionalOptions.count;
        }

        // Build query string
        const queryString = new URLSearchParams(queryParams).toString();
        const fullUrl = `${url}?${queryString}`;

        // Make FDA API request
        const response = await this.helpers.httpRequest({
          method: 'GET',
          url: fullUrl,
          headers: {
            'User-Agent': 'N8N-FDA-Node/1.0',
          },
          timeout: 30000,
        });

        // Process response based on operation
        let processedData;
        
        if (operation === 'searchTrials') {
          processedData = this.processTrialsData(response);
        } else if (operation === 'regulatoryStatus') {
          processedData = this.processRegulatoryStatus(response, productName);
        } else {
          processedData = this.processFdaResponse(response, database, additionalOptions.includeMetadata);
        }

        returnData.push({
          json: processedData,
          pairedItem: { item: i },
        });

      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: {
              error: error.message,
              operation: this.getNodeParameter('operation', i),
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

  private processFdaResponse(response: any, database: string, includeMetadata: boolean = true) {
    const result: any = {
      database: database,
      total_results: response.meta?.results?.total || 0,
      results: response.results || [],
      query_time: new Date().toISOString(),
    };

    if (includeMetadata && response.meta) {
      result.metadata = response.meta;
    }

    // Add pharmaceutical-specific processing
    if (database === 'drug/label' && result.results.length > 0) {
      result.results = result.results.map((item: any) => ({
        ...item,
        processed_fields: {
          brand_name: item.openfda?.brand_name?.[0] || null,
          generic_name: item.openfda?.generic_name?.[0] || null,
          manufacturer_name: item.openfda?.manufacturer_name?.[0] || null,
          ndc: item.openfda?.ndc?.[0] || null,
          indication_and_usage: item.indications_and_usage?.[0] || null,
          contraindications: item.contraindications?.[0] || null,
          warnings: item.warnings?.[0] || null,
          adverse_reactions: item.adverse_reactions?.[0] || null,
          dosage_and_administration: item.dosage_and_administration?.[0] || null,
          mechanism_of_action: item.mechanism_of_action?.[0] || null,
        },
      }));
    }

    return result;
  }

  private processTrialsData(response: any) {
    return {
      source: 'ClinicalTrials.gov',
      total_studies: response.StudyFieldsResponse?.NStudiesReturned || 0,
      studies: response.StudyFieldsResponse?.StudyFields?.map((study: any) => ({
        nct_id: study.NCTId?.[0],
        title: study.BriefTitle?.[0],
        status: study.OverallStatus?.[0],
        phase: study.Phase?.[0],
        condition: study.Condition?.join(', '),
        intervention: study.InterventionName?.join(', '),
      })) || [],
      query_time: new Date().toISOString(),
    };
  }

  private processRegulatoryStatus(response: any, productName: string) {
    const results = response.results || [];
    
    return {
      product_name: productName,
      regulatory_status: {
        fda_approved: results.length > 0,
        approval_count: results.length,
        brand_names: [...new Set(results.flatMap((r: any) => r.openfda?.brand_name || []))],
        generic_names: [...new Set(results.flatMap((r: any) => r.openfda?.generic_name || []))],
        manufacturers: [...new Set(results.flatMap((r: any) => r.openfda?.manufacturer_name || []))],
        approval_dates: results.map((r: any) => r.effective_time || null).filter(Boolean),
        indication_summary: results.map((r: any) => r.indications_and_usage?.[0] || null).filter(Boolean),
      },
      compliance_flags: {
        has_warnings: results.some((r: any) => r.warnings),
        has_contraindications: results.some((r: any) => r.contraindications), 
        has_adverse_reactions: results.some((r: any) => r.adverse_reactions),
        has_dosage_info: results.some((r: any) => r.dosage_and_administration),
      },
      last_checked: new Date().toISOString(),
    };
  }
}