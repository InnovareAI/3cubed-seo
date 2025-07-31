import React, { useState, useMemo } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Shield, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle,
  Hash,
  Search,
  Target,
  Brain,
  FileText,
  Zap,
  RefreshCw,
  BookOpen
} from 'lucide-react';
import { ApprovalField, KeywordApproval, ContentApproval, ApprovalFormSections } from '@/types/approval.types';
import SEOGEOStrategyOverview from './SEOGEOStrategyOverview';

interface Props {
  submission: any;
  onSubmit: (approvals: ApprovalFormSections) => void;
}

export default function ComprehensiveApprovalForm({ submission, onSubmit }: Props) {
  const [expandedSections, setExpandedSections] = useState({
    seoGeoStrategy: true,
    strategy: true,
    seo: true,
    geo: true
  });

  // Initialize all approval states
  const initializeApprovals = (): ApprovalFormSections => {
    // SEO Keywords - Each keyword gets its own approval box
    const seoKeywords = submission.seo_keywords?.map((keyword: string, idx: number) => ({
      id: `seo_keyword_${idx}`,
      keyword,
      status: 'pending' as const,
      comments: '',
      complianceChecked: false,
      searchVolume: Math.floor(Math.random() * 50000), // Would come from SEO tool
      difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High',
      competitionScore: Math.random() * 100,
    })) || [];

    // Long-tail Keywords
    const longTailKeywords = submission.long_tail_keywords?.map((keyword: string, idx: number) => ({
      id: `longtail_${idx}`,
      keyword,
      status: 'pending' as const,
      comments: '',
      complianceChecked: false,
      searchVolume: Math.floor(Math.random() * 5000),
      difficulty: 'Low' as const,
    })) || [];

    return {
      strategy: {
        overall_strategy: {
          id: 'overall_strategy',
          fieldName: 'Overall SEO Strategy',
          content: submission.seo_strategy_outline || '',
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        target_audience_strategy: {
          id: 'target_audience',
          fieldName: 'Target Audience Strategy',
          content: `Targeting ${submission.target_audience?.join(', ') || 'HCPs and Patients'}`,
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        competitive_positioning: {
          id: 'competitive_positioning',
          fieldName: 'Competitive Positioning',
          content: 'Non-comparative positioning focused on unique MOA and clinical benefits',
          status: 'pending',
          comments: '',
          complianceChecked: false
        }
      },
      seo: {
        title_tag: {
          id: 'title_tag',
          fieldName: 'Title Tag',
          content: submission.seo_title || '',
          characterCount: submission.seo_title?.length || 0,
          characterLimit: 60,
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        meta_description: {
          id: 'meta_description',
          fieldName: 'Meta Description',
          content: submission.meta_description || '',
          characterCount: submission.meta_description?.length || 0,
          characterLimit: 155,
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        h1_tag: {
          id: 'h1_tag',
          fieldName: 'H1 Tag',
          content: submission.h1_tag || '',
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        h2_tags: {
          id: 'h2_tags',
          fieldName: 'H2 Tags',
          content: submission.h2_tags?.join('\n') || '',
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        body_content: {
          id: 'body_content',
          fieldName: 'Body Content',
          content: submission.ai_generated_content?.body_content || '',
          characterCount: submission.ai_generated_content?.body_content?.length || 0,
          characterLimit: 800,
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        schema_markup: {
          id: 'schema_markup',
          fieldName: 'Schema Markup',
          content: JSON.stringify(submission.ai_generated_content?.schema_markup || {}, null, 2),
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        seo_keywords: seoKeywords,
        long_tail_keywords: longTailKeywords,
        consumer_questions: {
          id: 'consumer_questions',
          fieldName: 'Consumer Questions',
          content: submission.consumer_questions?.join('\n') || '',
          status: 'pending',
          comments: '',
          complianceChecked: false
        }
      },
      geo: {
        ai_summary: {
          id: 'ai_summary',
          fieldName: 'AI-Optimized Summary',
          content: submission.geo_optimization?.ai_summary || '',
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        medical_facts: {
          id: 'medical_facts',
          fieldName: 'Structured Medical Facts',
          content: JSON.stringify(submission.geo_optimization?.medical_facts || {}, null, 2),
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        evidence_statistics: {
          id: 'evidence_statistics',
          fieldName: 'Evidence-Based Statistics',
          content: submission.geo_optimization?.evidence_statistics?.join('\n') || '',
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        citations: {
          id: 'citations',
          fieldName: 'Authoritative Citations',
          content: JSON.stringify(submission.geo_optimization?.citations || {}, null, 2),
          status: 'pending',
          comments: '',
          complianceChecked: false
        },
        voice_search_answers: {
          id: 'voice_search_answers',
          fieldName: 'Voice Search Answers',
          content: JSON.stringify(submission.geo_optimization?.voice_search_answers || {}, null, 2),
          status: 'pending',
          comments: '',
          complianceChecked: false
        }
      }
    };
  };

  const [approvals, setApprovals] = useState<ApprovalFormSections>(initializeApprovals());

  // Calculate approval summary
  const approvalSummary = useMemo(() => {
    let totalFields = 0;
    let approvedCount = 0;
    let rejectedCount = 0;
    let pendingCount = 0;
    let complianceCheckedCount = 0;

    // Count all fields
    Object.values(approvals).forEach(section => {
      Object.values(section).forEach(field => {
        if (Array.isArray(field)) {
          field.forEach(item => {
            totalFields++;
            if (item.status === 'approved') approvedCount++;
            if (item.status === 'rejected') rejectedCount++;
            if (item.status === 'pending') pendingCount++;
            if (item.complianceChecked) complianceCheckedCount++;
          });
        } else {
          totalFields++;
          if (field.status === 'approved') approvedCount++;
          if (field.status === 'rejected') rejectedCount++;
          if (field.status === 'pending') pendingCount++;
          if (field.complianceChecked) complianceCheckedCount++;
        }
      });
    });

    return {
      totalFields,
      approvedCount,
      rejectedCount,
      pendingCount,
      complianceCheckedCount,
      readyForSubmission: rejectedCount === 0 && pendingCount === 0
    };
  }, [approvals]);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateContentApproval = (
    section: keyof ApprovalFormSections,
    field: string,
    updates: Partial<ContentApproval>
  ) => {
    setApprovals(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: { ...prev[section][field], ...updates }
      }
    }));
  };

  const updateKeywordApproval = (
    section: 'seo',
    field: 'seo_keywords' | 'long_tail_keywords',
    keywordId: string,
    updates: Partial<KeywordApproval>
  ) => {
    setApprovals(prev => ({
      ...prev,
      seo: {
        ...prev.seo,
        [field]: prev.seo[field].map((k: KeywordApproval) => 
          k.id === keywordId ? { ...k, ...updates } : k
        )
      }
    }));
  };

  const askAI = async (content: string, context: string) => {
    console.log(`AI Consultation Request:\nContext: ${context}\nContent: ${content}`);
    // Would implement actual AI call here
  };

  // Approval Controls Component
  const ApprovalControls = ({ 
    section,
    field,
    approval,
    content,
    isKeyword = false,
    keywordId = ''
  }: { 
    section: keyof ApprovalFormSections;
    field: string;
    approval: ApprovalField;
    content: string;
    isKeyword?: boolean;
    keywordId?: string;
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 mt-3">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        {/* Approve Button */}
        <button
          onClick={() => {
            if (isKeyword) {
              updateKeywordApproval(section as 'seo', field as any, keywordId, { status: 'approved' });
            } else {
              updateContentApproval(section, field, { status: 'approved' });
            }
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            approval.status === 'approved' 
              ? 'bg-green-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </button>
        
        {/* Reject Button */}
        <button
          onClick={() => {
            if (isKeyword) {
              updateKeywordApproval(section as 'seo', field as any, keywordId, { status: 'rejected' });
            } else {
              updateContentApproval(section, field, { status: 'rejected' });
            }
          }}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            approval.status === 'rejected' 
              ? 'bg-red-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <XCircle className="h-4 w-4" />
          Reject
        </button>

        {/* Compliance Check */}
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={approval.complianceChecked}
            onChange={(e) => {
              if (isKeyword) {
                updateKeywordApproval(section as 'seo', field as any, keywordId, { complianceChecked: e.target.checked });
              } else {
                updateContentApproval(section, field, { complianceChecked: e.target.checked });
              }
            }}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Compliance
          </span>
        </label>

        {/* Ask AI */}
        <button
          onClick={() => askAI(content, `${section}.${field}`)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200"
        >
          <Sparkles className="h-4 w-4" />
          Ask AI
        </button>
      </div>

      {/* Comments */}
      <div className="flex items-start gap-2">
        <MessageSquare className="h-4 w-4 text-gray-400 mt-1" />
        <textarea
          value={approval.comments}
          onChange={(e) => {
            if (isKeyword) {
              updateKeywordApproval(section as 'seo', field as any, keywordId, { comments: e.target.value });
            } else {
              updateContentApproval(section, field, { comments: e.target.value });
            }
          }}
          placeholder="Add comments..."
          className="flex-1 text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          rows={2}
        />
      </div>
    </div>
  );

  // Individual Keyword Box Component
  const KeywordBox = ({ 
    keyword, 
    type 
  }: { 
    keyword: KeywordApproval; 
    type: 'seo_keywords' | 'long_tail_keywords' 
  }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            <Hash className="h-4 w-4 text-gray-400" />
            {keyword.keyword}
          </h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Search className="h-3 w-3" />
              Volume: {keyword.searchVolume?.toLocaleString()}
            </span>
            {keyword.difficulty && (
              <span className={`px-2 py-0.5 rounded-full ${
                keyword.difficulty === 'Low' ? 'bg-green-100 text-green-700' :
                keyword.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                {keyword.difficulty}
              </span>
            )}
            {keyword.competitionScore && (
              <span className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                Competition: {Math.round(keyword.competitionScore)}%
              </span>
            )}
          </div>
        </div>
        <span className={`text-xs px-2 py-1 rounded-full ${
          keyword.status === 'approved' ? 'bg-green-100 text-green-700' :
          keyword.status === 'rejected' ? 'bg-red-100 text-red-700' :
          'bg-gray-100 text-gray-700'
        }`}>
          {keyword.status}
        </span>
      </div>

      <ApprovalControls
        section="seo"
        field={type}
        approval={keyword}
        content={keyword.keyword}
        isKeyword={true}
        keywordId={keyword.id}
      />
    </div>
  );

  // Content Field Component
  const ContentField = ({
    section,
    fieldKey,
    field,
    icon: Icon
  }: {
    section: keyof ApprovalFormSections;
    fieldKey: string;
    field: ContentApproval;
    icon?: any;
  }) => (
    <div>
      <h3 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        {Icon && <Icon className="h-5 w-5 text-gray-500" />}
        {field.fieldName}
        {field.characterLimit && (
          <span className={`ml-2 text-sm font-normal ${
            (field.characterCount || 0) > field.characterLimit ? 'text-red-600' : 'text-gray-500'
          }`}>
            ({field.characterCount || 0}/{field.characterLimit} chars)
          </span>
        )}
      </h3>
      <div className="bg-gray-50 rounded-lg p-4">
        <pre className="text-sm text-gray-700 whitespace-pre-wrap font-sans">{field.content || 'No content generated'}</pre>
      </div>
      <ApprovalControls
        section={section}
        field={fieldKey}
        approval={field}
        content={field.content}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Summary Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6 text-sm">
            <span className="text-gray-600">
              Total Fields: <strong>{approvalSummary.totalFields}</strong>
            </span>
            <span className="text-green-600">
              Approved: <strong>{approvalSummary.approvedCount}</strong>
            </span>
            <span className="text-red-600">
              Rejected: <strong>{approvalSummary.rejectedCount}</strong>
            </span>
            <span className="text-yellow-600">
              Pending: <strong>{approvalSummary.pendingCount}</strong>
            </span>
            <span className="text-blue-600">
              Compliance: <strong>{approvalSummary.complianceCheckedCount}</strong>
            </span>
          </div>
          {approvalSummary.readyForSubmission ? (
            <span className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              Ready for submission
            </span>
          ) : (
            <span className="flex items-center gap-2 text-yellow-600">
              <AlertCircle className="h-5 w-5" />
              Review required
            </span>
          )}
        </div>
      </div>

      {/* SEO/GEO Strategy Overview - 4 Page Document */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('seoGeoStrategy')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-indigo-500" />
            SEO/GEO Strategy Overview
            <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full ml-2">
              4-Page Strategic Document
            </span>
          </h2>
          {expandedSections.seoGeoStrategy ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.seoGeoStrategy && (
          <div className="px-6 pb-6">
            <SEOGEOStrategyOverview submission={submission} />
          </div>
        )}
      </div>

      {/* Strategy Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('strategy')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Zap className="h-5 w-5 text-yellow-500" />
            Strategy
          </h2>
          {expandedSections.strategy ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.strategy && (
          <div className="px-6 pb-6 space-y-6">
            {Object.entries(approvals.strategy).map(([key, field]) => (
              <ContentField
                key={key}
                section="strategy"
                fieldKey={key}
                field={field}
              />
            ))}
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('seo')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Search className="h-5 w-5 text-blue-500" />
            SEO Content
          </h2>
          {expandedSections.seo ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.seo && (
          <div className="px-6 pb-6 space-y-6">
            {/* Regular SEO Fields */}
            <ContentField section="seo" fieldKey="title_tag" field={approvals.seo.title_tag} icon={FileText} />
            <ContentField section="seo" fieldKey="meta_description" field={approvals.seo.meta_description} icon={FileText} />
            <ContentField section="seo" fieldKey="h1_tag" field={approvals.seo.h1_tag} icon={FileText} />
            <ContentField section="seo" fieldKey="h2_tags" field={approvals.seo.h2_tags} icon={FileText} />
            
            {/* SEO Keywords Grid */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">SEO Keywords ({approvals.seo.seo_keywords.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {approvals.seo.seo_keywords.map((keyword) => (
                  <KeywordBox key={keyword.id} keyword={keyword} type="seo_keywords" />
                ))}
              </div>
            </div>

            {/* Long-tail Keywords */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">Long-tail Keywords ({approvals.seo.long_tail_keywords.length})</h3>
              <div className="grid grid-cols-1 gap-4">
                {approvals.seo.long_tail_keywords.map((keyword) => (
                  <KeywordBox key={keyword.id} keyword={keyword} type="long_tail_keywords" />
                ))}
              </div>
            </div>

            {/* Other SEO Fields */}
            <ContentField section="seo" fieldKey="consumer_questions" field={approvals.seo.consumer_questions} icon={MessageSquare} />
            <ContentField section="seo" fieldKey="body_content" field={approvals.seo.body_content} icon={FileText} />
            <ContentField section="seo" fieldKey="schema_markup" field={approvals.seo.schema_markup} icon={FileText} />
          </div>
        )}
      </div>

      {/* GEO Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('geo')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50 transition-colors"
        >
          <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-500" />
            GEO (Generative Engine Optimization)
          </h2>
          {expandedSections.geo ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.geo && (
          <div className="px-6 pb-6 space-y-6">
            {Object.entries(approvals.geo).map(([key, field]) => (
              <ContentField
                key={key}
                section="geo"
                fieldKey={key}
                field={field as ContentApproval}
                icon={Brain}
              />
            ))}
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <button
            className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            onClick={() => setApprovals(initializeApprovals())}
          >
            <RefreshCw className="h-4 w-4" />
            Reset All
          </button>
          
          <div className="flex gap-3">
            <button
              className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={() => console.log('Save draft:', approvals)}
            >
              Save Draft
            </button>
            <button
              className={`px-6 py-2 rounded-md flex items-center gap-2 ${
                approvalSummary.readyForSubmission
                  ? 'bg-blue-600 text-white hover:bg-blue-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              onClick={() => approvalSummary.readyForSubmission && onSubmit(approvals)}
              disabled={!approvalSummary.readyForSubmission}
            >
              <CheckCircle className="h-4 w-4" />
              Submit All Approvals
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}