import React, { useState } from 'react';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  Shield,
  Hash,
  Search,
  Target
} from 'lucide-react';

interface KeywordApprovalProps {
  keyword: string;
  index: number;
  type: 'seo' | 'longtail';
  onApprovalChange: (index: number, approval: KeywordApprovalData) => void;
  initialApproval?: KeywordApprovalData;
}

export interface KeywordApprovalData {
  keyword: string;
  status: 'pending' | 'approved' | 'rejected';
  complianceChecked: boolean;
  comment: string;
  searchVolume?: number;
  difficulty?: 'Low' | 'Medium' | 'High';
}

export default function IndividualKeywordApproval({
  keyword,
  index,
  type,
  onApprovalChange,
  initialApproval
}: KeywordApprovalProps) {
  const [approval, setApproval] = useState<KeywordApprovalData>(
    initialApproval || {
      keyword,
      status: 'pending',
      complianceChecked: false,
      comment: '',
      searchVolume: Math.floor(Math.random() * (type === 'seo' ? 10000 : 1000) + 100),
      difficulty: ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)] as 'Low' | 'Medium' | 'High'
    }
  );
  const [showComment, setShowComment] = useState(false);

  const handleStatusChange = (newStatus: 'approved' | 'rejected' | 'pending') => {
    const updated = { ...approval, status: newStatus };
    setApproval(updated);
    onApprovalChange(index, updated);
    
    if (newStatus === 'rejected' && !showComment) {
      setShowComment(true);
    }
  };

  const handleComplianceChange = (checked: boolean) => {
    const updated = { ...approval, complianceChecked: checked };
    setApproval(updated);
    onApprovalChange(index, updated);
  };

  const handleCommentChange = (comment: string) => {
    const updated = { ...approval, comment };
    setApproval(updated);
    onApprovalChange(index, updated);
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

  const getDifficultyColor = () => {
    switch (approval.difficulty) {
      case 'Low':
        return 'bg-green-100 text-green-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'High':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className={`border rounded-lg p-4 transition-all ${getStatusColor()}`}>
      {/* Keyword Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <Hash className="h-4 w-4 text-gray-400" />
          <span className="font-medium text-gray-900">{keyword}</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          {approval.searchVolume && (
            <span className="flex items-center gap-1 text-gray-600">
              <Search className="h-3 w-3" />
              {approval.searchVolume.toLocaleString()}
            </span>
          )}
          {approval.difficulty && (
            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
              {approval.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-3">
        <button
          onClick={() => handleStatusChange('approved')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            approval.status === 'approved'
              ? 'bg-green-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="h-3 w-3 inline mr-1" />
          Approve
        </button>
        
        <button
          onClick={() => handleStatusChange('rejected')}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            approval.status === 'rejected'
              ? 'bg-red-600 text-white'
              : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
        >
          <XCircle className="h-3 w-3 inline mr-1" />
          Reject
        </button>

        <label className="flex items-center gap-1 ml-auto">
          <input
            type="checkbox"
            checked={approval.complianceChecked}
            onChange={(e) => handleComplianceChange(e.target.checked)}
            className="rounded text-blue-600 focus:ring-blue-500"
          />
          <span className="text-xs text-gray-700 flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Compliance
          </span>
        </label>

        <button
          onClick={() => setShowComment(!showComment)}
          className="px-2 py-1 rounded text-xs font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          <MessageSquare className="h-3 w-3 inline mr-1" />
          Comment
        </button>
      </div>

      {/* Comment Section */}
      {showComment && (
        <div className="mt-3">
          <textarea
            value={approval.comment}
            onChange={(e) => handleCommentChange(e.target.value)}
            placeholder={approval.status === 'rejected' ? 'Reason for rejection (required)...' : 'Add comment...'}
            className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
            rows={2}
          />
          {approval.status === 'rejected' && !approval.comment && (
            <p className="text-xs text-red-600 mt-1">* Comment required for rejected keywords</p>
          )}
        </div>
      )}
    </div>
  );
}