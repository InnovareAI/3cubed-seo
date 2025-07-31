import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Shield, 
  Sparkles,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';

interface ApprovalField {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  complianceChecked: boolean;
}

interface KeywordApproval extends ApprovalField {
  keyword: string;
  searchVolume?: number;
  difficulty?: string;
}

interface ContentSection {
  title: string;
  content: string;
  approval: ApprovalField;
}

export default function ApprovalForm({ submission }: { submission: any }) {
  const [expandedSections, setExpandedSections] = useState({
    strategy: true,
    seo: true,
    geo: true
  });

  // Initialize approval states for all fields
  const [approvals, setApprovals] = useState<Record<string, ApprovalField>>({
    // Strategy Section
    overall_strategy: { id: 'overall_strategy', status: 'pending', comments: '', complianceChecked: false },
    
    // SEO Section
    title_tag: { id: 'title_tag', status: 'pending', comments: '', complianceChecked: false },
    meta_description: { id: 'meta_description', status: 'pending', comments: '', complianceChecked: false },
    h1_tag: { id: 'h1_tag', status: 'pending', comments: '', complianceChecked: false },
    h2_tags: { id: 'h2_tags', status: 'pending', comments: '', complianceChecked: false },
    body_content: { id: 'body_content', status: 'pending', comments: '', complianceChecked: false },
    schema_markup: { id: 'schema_markup', status: 'pending', comments: '', complianceChecked: false },
    
    // Long-tail Keywords
    longtail_keywords: { id: 'longtail_keywords', status: 'pending', comments: '', complianceChecked: false },
    consumer_questions: { id: 'consumer_questions', status: 'pending', comments: '', complianceChecked: false },
    
    // GEO Section
    ai_summary: { id: 'ai_summary', status: 'pending', comments: '', complianceChecked: false },
    medical_facts: { id: 'medical_facts', status: 'pending', comments: '', complianceChecked: false },
    evidence_stats: { id: 'evidence_stats', status: 'pending', comments: '', complianceChecked: false },
    citations: { id: 'citations', status: 'pending', comments: '', complianceChecked: false },
    voice_search: { id: 'voice_search', status: 'pending', comments: '', complianceChecked: false },
  });

  // Individual keyword approvals
  const [keywordApprovals, setKeywordApprovals] = useState<KeywordApproval[]>(
    submission.seo_keywords?.map((keyword: string, idx: number) => ({
      id: `keyword_${idx}`,
      keyword,
      status: 'pending',
      comments: '',
      complianceChecked: false,
      searchVolume: Math.floor(Math.random() * 10000), // Demo data
      difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)]
    })) || []
  );

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const updateApproval = (fieldId: string, updates: Partial<ApprovalField>) => {
    setApprovals(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], ...updates }
    }));
  };

  const updateKeywordApproval = (keywordId: string, updates: Partial<KeywordApproval>) => {
    setKeywordApprovals(prev => 
      prev.map(k => k.id === keywordId ? { ...k, ...updates } : k)
    );
  };

  const askAI = async (fieldId: string, content: string) => {
    // Placeholder for AI consultation
    console.log(`Asking AI about ${fieldId}: ${content}`);
    // Would call AI endpoint here
  };

  const ApprovalControls = ({ 
    fieldId, 
    approval,
    onUpdate,
    content 
  }: { 
    fieldId: string;
    approval: ApprovalField;
    onUpdate: (updates: Partial<ApprovalField>) => void;
    content: string;
  }) => (
    <div className="bg-gray-50 rounded-lg p-4 mt-3">
      <div className="flex items-center gap-3 mb-3">
        {/* Approve/Reject Buttons */}
        <button
          onClick={() => onUpdate({ status: 'approved' })}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
            approval.status === 'approved' 
              ? 'bg-green-600 text-white' 
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="h-4 w-4" />
          Approve
        </button>
        
        <button
          onClick={() => onUpdate({ status: 'rejected' })}
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
        <label className="flex items-center gap-2 ml-auto">
          <input
            type="checkbox"
            checked={approval.complianceChecked}
            onChange={(e) => onUpdate({ complianceChecked: e.target.checked })}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-sm text-gray-700 flex items-center gap-1">
            <Shield className="h-4 w-4" />
            Compliance
          </span>
        </label>

        {/* Ask AI */}
        <button
          onClick={() => askAI(fieldId, content)}
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
          onChange={(e) => onUpdate({ comments: e.target.value })}
          placeholder="Add comments..."
          className="flex-1 text-sm rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          rows={2}
        />
      </div>
    </div>
  );

  const KeywordBox = ({ keyword }: { keyword: KeywordApproval }) => (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="font-medium text-gray-900">{keyword.keyword}</h4>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>Volume: {keyword.searchVolume?.toLocaleString()}</span>
            <span className={`px-2 py-0.5 rounded-full ${
              keyword.difficulty === 'Low' ? 'bg-green-100 text-green-700' :
              keyword.difficulty === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {keyword.difficulty}
            </span>
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
        fieldId={keyword.id}
        approval={keyword}
        onUpdate={(updates) => updateKeywordApproval(keyword.id, updates)}
        content={keyword.keyword}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Strategy Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('strategy')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="text-lg font-semibold text-gray-900">Strategy</h2>
          {expandedSections.strategy ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.strategy && (
          <div className="px-6 pb-6">
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Overall SEO Strategy</h3>
              <p className="text-sm text-gray-700">
                {submission.seo_strategy_outline || 'SEO strategy based on 4 core inputs: product positioning, target audience, competitive landscape, and search intent.'}
              </p>
            </div>
            <ApprovalControls
              fieldId="overall_strategy"
              approval={approvals.overall_strategy}
              onUpdate={(updates) => updateApproval('overall_strategy', updates)}
              content={submission.seo_strategy_outline || ''}
            />
          </div>
        )}
      </div>

      {/* SEO Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('seo')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="text-lg font-semibold text-gray-900">SEO Content</h2>
          {expandedSections.seo ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.seo && (
          <div className="px-6 pb-6 space-y-6">
            {/* Title Tag */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Title Tag 
                <span className="ml-2 text-sm font-normal text-gray-500">({submission.seo_title?.length || 0}/60 chars)</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm font-medium">{submission.seo_title}</p>
              </div>
              <ApprovalControls
                fieldId="title_tag"
                approval={approvals.title_tag}
                onUpdate={(updates) => updateApproval('title_tag', updates)}
                content={submission.seo_title || ''}
              />
            </div>

            {/* Meta Description */}
            <div>
              <h3 className="font-medium text-gray-900 mb-2">
                Meta Description
                <span className="ml-2 text-sm font-normal text-gray-500">({submission.meta_description?.length || 0}/155 chars)</span>
              </h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm">{submission.meta_description}</p>
              </div>
              <ApprovalControls
                fieldId="meta_description"
                approval={approvals.meta_description}
                onUpdate={(updates) => updateApproval('meta_description', updates)}
                content={submission.meta_description || ''}
              />
            </div>

            {/* SEO Keywords Grid */}
            <div>
              <h3 className="font-medium text-gray-900 mb-4">SEO Keywords (10)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {keywordApprovals.map((keyword) => (
                  <KeywordBox key={keyword.id} keyword={keyword} />
                ))}
              </div>
            </div>

            {/* Other SEO fields would follow similar pattern */}
          </div>
        )}
      </div>

      {/* GEO Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <button
          onClick={() => toggleSection('geo')}
          className="w-full p-6 flex items-center justify-between hover:bg-gray-50"
        >
          <h2 className="text-lg font-semibold text-gray-900">GEO (Generative Engine Optimization)</h2>
          {expandedSections.geo ? <ChevronUp /> : <ChevronDown />}
        </button>
        
        {expandedSections.geo && (
          <div className="px-6 pb-6 space-y-6">
            {/* GEO fields with approval controls */}
          </div>
        )}
      </div>

      {/* Submit All Button */}
      <div className="flex justify-end">
        <button className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700">
          Submit All Approvals
        </button>
      </div>
    </div>
  );
}