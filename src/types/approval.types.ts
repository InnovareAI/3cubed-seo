export interface ApprovalField {
  id: string;
  status: 'pending' | 'approved' | 'rejected';
  comments: string;
  complianceChecked: boolean;
  lastReviewedBy?: string;
  lastReviewedAt?: string;
  aiConsultationLog?: AIConsultation[];
}

export interface AIConsultation {
  timestamp: string;
  query: string;
  response: string;
  actionTaken?: string;
}

export interface KeywordApproval extends ApprovalField {
  keyword: string;
  searchVolume?: number;
  difficulty?: 'Low' | 'Medium' | 'High';
  competitionScore?: number;
  currentRanking?: number;
  suggestedAlternatives?: string[];
}

export interface ContentApproval extends ApprovalField {
  fieldName: string;
  content: string;
  characterCount?: number;
  characterLimit?: number;
  complianceIssues?: string[];
  aiSuggestions?: string[];
}

export interface ApprovalFormSections {
  strategy: {
    overall_strategy: ContentApproval;
    target_audience_strategy: ContentApproval;
    competitive_positioning: ContentApproval;
  };
  seo: {
    title_tag: ContentApproval;
    meta_description: ContentApproval;
    h1_tag: ContentApproval;
    h2_tags: ContentApproval;
    body_content: ContentApproval;
    schema_markup: ContentApproval;
    seo_keywords: KeywordApproval[];
    long_tail_keywords: KeywordApproval[];
    consumer_questions: ContentApproval;
  };
  geo: {
    ai_summary: ContentApproval;
    medical_facts: ContentApproval;
    evidence_statistics: ContentApproval;
    citations: ContentApproval;
    voice_search_answers: ContentApproval;
    trial_enrollment?: ContentApproval; // Phase III only
    prescribing_highlights?: ContentApproval; // Market Launch only
    biomarker_info?: ContentApproval; // Targeted therapies
  };
}

export interface ApprovalSummary {
  totalFields: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  complianceCheckedCount: number;
  readyForSubmission: boolean;
  blockers: string[];
}