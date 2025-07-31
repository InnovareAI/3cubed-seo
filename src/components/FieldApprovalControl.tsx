import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles
} from 'lucide-react';

interface FieldApprovalControlProps {
  fieldName: string;
  fieldValue: string | string[];
  fieldId: string;
  characterLimit?: number;
  onApprovalChange: (fieldId: string, approval: FieldApproval) => void;
  initialApproval?: FieldApproval;
}

export interface FieldApproval {
  status: 'pending' | 'approved' | 'rejected';
  comment: string;
  complianceChecked?: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
}

export default function FieldApprovalControl({
  fieldName,
  fieldValue,
  fieldId,
  characterLimit,
  onApprovalChange,
  initialApproval = { status: 'pending', comment: '' }
}: FieldApprovalControlProps) {
  const [approval, setApproval] = useState<FieldApproval>(initialApproval);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState(initialApproval.comment || '');

  const displayValue = Array.isArray(fieldValue) ? fieldValue.join(', ') : fieldValue;
  const characterCount = displayValue?.length || 0;
  const isWithinLimit = !characterLimit || characterCount <= characterLimit;

  const handleStatusChange = (newStatus: 'approved' | 'rejected' | 'pending') => {
    const updatedApproval = {
      ...approval,
      status: newStatus,
      comment: comment,
      reviewedAt: new Date().toISOString()
    };
    setApproval(updatedApproval);
    onApprovalChange(fieldId, updatedApproval);
    
    // Auto-show comment box if rejecting
    if (newStatus === 'rejected' && !showComment) {
      setShowComment(true);
    }
  };

  const handleCommentSave = () => {
    const updatedApproval = {
      ...approval,
      comment: comment
    };
    setApproval(updatedApproval);
    onApprovalChange(fieldId, updatedApproval);
  };

  const getStatusColor = () => {
    switch (approval.status) {
      case 'approved':
        return 'border-green-500 bg-green-50';
      case 'rejected':
        return 'border-red-500 bg-red-50';
      default:
        return 'border-gray-300 bg-white';
    }
  };

  const getStatusIcon = () => {
    switch (approval.status) {
      case 'approved':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'rejected':
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${getStatusColor()}`}>
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 flex items-center gap-2">
            {fieldName}
            {characterLimit && (
              <span className={`text-xs ${isWithinLimit ? 'text-gray-500' : 'text-red-600'}`}>
                ({characterCount}/{characterLimit} chars)
              </span>
            )}
          </h4>
        </div>
        <div className="flex items-center gap-2">
          {getStatusIcon()}
          <span className={`text-sm font-medium ${
            approval.status === 'approved' ? 'text-green-700' :
            approval.status === 'rejected' ? 'text-red-700' :
            'text-gray-500'
          }`}>
            {approval.status.charAt(0).toUpperCase() + approval.status.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 rounded p-3 mb-3">
        <p className="text-sm text-gray-700 whitespace-pre-wrap">{displayValue || 'No content'}</p>
      </div>

      {/* Action Buttons Row 1 - Approve/Reject with inline comment */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStatusChange('approved')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              approval.status === 'approved'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <span className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4" />
              Approve
            </span>
          </button>
          
          <div className="flex items-center gap-2 flex-1">
            <button
              onClick={() => handleStatusChange('rejected')}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                approval.status === 'rejected'
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                Reject
              </span>
            </button>
            
            {/* Comment field next to reject */}
            {(approval.status === 'rejected' || showComment) && (
              <input
                type="text"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                onBlur={handleCommentSave}
                placeholder={approval.status === 'rejected' ? 'Reason for rejection...' : 'Add comment...'}
                className="flex-1 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            )}
          </div>
        </div>

        {/* Action Buttons Row 2 - Compliance, Ask AI, etc */}
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50">
            <input
              type="checkbox"
              checked={approval.complianceChecked || false}
              onChange={(e) => {
                const updatedApproval = {
                  ...approval,
                  complianceChecked: e.target.checked
                };
                setApproval(updatedApproval);
                onApprovalChange(fieldId, updatedApproval);
              }}
              className="rounded text-blue-600 focus:ring-blue-500"
            />
            <Shield className="h-4 w-4 text-blue-600" />
            <span>Compliance Check</span>
          </label>

          <button
            onClick={() => {
              // AI consultation logic
              const aiPrompt = `Review this ${fieldName}: "${displayValue}". Check for: 1) FDA compliance, 2) Medical accuracy, 3) Brand consistency`;
              console.log('AI Consultation:', aiPrompt);
              // In real implementation, this would call an AI service
              alert('AI review requested. This would typically open a modal with AI suggestions.');
            }}
            className="px-3 py-1.5 rounded-md text-sm font-medium bg-purple-100 text-purple-700 hover:bg-purple-200 flex items-center gap-1"
          >
            <Sparkles className="h-4 w-4" />
            Ask AI
          </button>

          <button
            onClick={() => handleStatusChange('pending')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
              approval.status === 'pending'
                ? 'bg-gray-600 text-white'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            Reset
          </button>

          {!showComment && approval.status !== 'rejected' && (
            <button
              onClick={() => setShowComment(true)}
              className="px-3 py-1.5 rounded-md text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 flex items-center gap-1"
            >
              <MessageSquare className="h-4 w-4" />
              Add Comment
            </button>
          )}
        </div>
      </div>

      {/* Compliance Warning */}
      {approval.status === 'approved' && !approval.complianceChecked && (
        <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="h-3 w-3" />
          <span>Approved without compliance check - Please verify compliance before final submission</span>
        </div>
      )}

      {/* Review Info */}
      {approval.reviewedAt && (
        <div className="text-xs text-gray-500 mt-2">
          Reviewed {new Date(approval.reviewedAt).toLocaleString()}
        </div>
      )}
    </div>
  );
}