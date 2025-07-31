import React, { useState, useEffect } from 'react';
import { 
  Brain,
  TrendingUp,
  Award,
  BarChart3,
  MessageSquare,
  Globe,
  AlertCircle,
  CheckCircle,
  X,
  ChevronRight,
  Info
} from 'lucide-react';
import { calculateGEOScore, GEOScoreBreakdown } from '../utils/geoScoring';

interface Props {
  submission: any;
  showAsModal?: boolean;
  onClose?: () => void;
}

export default function GEOScoreBreakdownComponent({ submission, showAsModal = false, onClose }: Props) {
  const [scoreData, setScoreData] = useState<GEOScoreBreakdown | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const score = calculateGEOScore(submission);
    setScoreData(score);
  }, [submission]);

  if (!scoreData) return null;

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (percentage: number) => {
    if (percentage >= 80) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const categoryIcons: Record<string, any> = {
    contentStructure: FileText,
    authoritySignals: Award,
    technicalOptimization: Code,
    statisticalEvidence: BarChart3,
    voiceSearch: MessageSquare,
    platformOptimization: Globe
  };

  const categoryNames: Record<string, string> = {
    contentStructure: 'Content Structure',
    authoritySignals: 'Authority Signals',
    technicalOptimization: 'Technical SEO',
    statisticalEvidence: 'Statistical Evidence',
    voiceSearch: 'Voice Search',
    platformOptimization: 'Platform Optimization'
  };

  const content = (
    <div className="space-y-6">
      {/* Overall Score */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gray-100 mb-4">
          <div className="text-center">
            <p className={`text-4xl font-bold ${getScoreColor(scoreData.percentage)}`}>
              {scoreData.percentage}%
            </p>
            <p className="text-sm text-gray-600">GEO Score</p>
          </div>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div 
            className={`h-3 rounded-full transition-all ${getScoreBarColor(scoreData.percentage)}`}
            style={{ width: `${scoreData.percentage}%` }}
          />
        </div>
        <p className="text-sm text-gray-600">
          {scoreData.totalScore} out of {scoreData.maxScore} points
        </p>
      </div>

      {/* Category Breakdown */}
      <div className="space-y-3">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Score Breakdown
        </h3>
        
        {Object.entries(scoreData.categories).map(([key, category]) => {
          const Icon = categoryIcons[key] || Brain;
          const percentage = Math.round((category.score / category.max) * 100);
          
          return (
            <div 
              key={key}
              className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
              onClick={() => setSelectedCategory(selectedCategory === key ? null : key)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <Icon className="h-5 w-5 text-gray-600" />
                  <span className="font-medium text-gray-900">{categoryNames[key]}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-600">
                    {category.score}/{category.max}
                  </span>
                  <ChevronRight className={`h-4 w-4 text-gray-400 transition-transform ${
                    selectedCategory === key ? 'rotate-90' : ''
                  }`} />
                </div>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full transition-all ${getScoreBarColor(percentage)}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              
              {selectedCategory === key && category.factors.length > 0 && (
                <div className="mt-3 space-y-1">
                  {category.factors.map((factor, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-sm">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <span className="text-gray-700">{factor}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Recommendations */}
      {scoreData.recommendations.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Recommendations
          </h3>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              {scoreData.recommendations.map((rec, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-sm text-blue-900">{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-gray-50 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Info className="h-5 w-5 text-gray-600 mt-0.5" />
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-1">What is GEO?</p>
            <p>Generative Engine Optimization (GEO) measures how well your content is optimized for AI search engines like ChatGPT, Claude, and Perplexity. A higher score means better visibility in AI-generated responses.</p>
          </div>
        </div>
      </div>
    </div>
  );

  if (showAsModal) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
              <Brain className="h-6 w-6 text-purple-600" />
              GEO Score Analysis
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="p-6">
            {content}
          </div>
        </div>
      </div>
    );
  }

  return content;
}

// Import missing icon
import { Code } from 'lucide-react';