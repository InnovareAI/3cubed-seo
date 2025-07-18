// Workflow stage constants matching database constraints
export const WORKFLOW_STAGES = {
  FORM_SUBMITTED: 'Form_Submitted',
  AI_PROCESSING: 'AI_Processing',
  SEO_REVIEW: 'SEO_Review',
  CLIENT_REVIEW: 'Client_Review',
  REVISION_REQUESTED: 'Revision_Requested',
  MLR_REVIEW: 'MLR_Review',
  PUBLISHED: 'Published'
} as const;

export type WorkflowStage = typeof WORKFLOW_STAGES[keyof typeof WORKFLOW_STAGES];

// Display labels for workflow stages
export const WORKFLOW_STAGE_LABELS: Record<WorkflowStage, string> = {
  [WORKFLOW_STAGES.FORM_SUBMITTED]: 'Submitted',
  [WORKFLOW_STAGES.AI_PROCESSING]: 'AI Processing',
  [WORKFLOW_STAGES.SEO_REVIEW]: 'SEO Review',
  [WORKFLOW_STAGES.CLIENT_REVIEW]: 'Client Review',
  [WORKFLOW_STAGES.REVISION_REQUESTED]: 'Revision Requested',
  [WORKFLOW_STAGES.MLR_REVIEW]: 'MLR Review',
  [WORKFLOW_STAGES.PUBLISHED]: 'Published'
};

// Status badge configurations
export const WORKFLOW_STAGE_BADGES: Record<WorkflowStage, { class: string; icon: string }> = {
  [WORKFLOW_STAGES.FORM_SUBMITTED]: { class: 'bg-gray-100 text-gray-800', icon: 'Edit2' },
  [WORKFLOW_STAGES.AI_PROCESSING]: { class: 'bg-blue-100 text-blue-800', icon: 'Clock' },
  [WORKFLOW_STAGES.SEO_REVIEW]: { class: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
  [WORKFLOW_STAGES.CLIENT_REVIEW]: { class: 'bg-purple-100 text-purple-800', icon: 'Clock' },
  [WORKFLOW_STAGES.REVISION_REQUESTED]: { class: 'bg-orange-100 text-orange-800', icon: 'AlertCircle' },
  [WORKFLOW_STAGES.MLR_REVIEW]: { class: 'bg-indigo-100 text-indigo-800', icon: 'Clock' },
  [WORKFLOW_STAGES.PUBLISHED]: { class: 'bg-green-100 text-green-800', icon: 'CheckCircle' }
};
