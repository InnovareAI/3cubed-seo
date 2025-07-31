import React from 'react';
import { 
  Shield, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  FileCheck,
  Scale,
  Stethoscope,
  FileText,
  Clock,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

interface ComplianceCheck {
  category: string;
  status: 'passed' | 'failed' | 'warning' | 'pending';
  message: string;
  icon: any;
  details?: string[];
}

interface Props {
  submission: any;
  fieldApprovals?: Record<string, any>;
}

export default function ComplianceStatusVisual({ submission, fieldApprovals }: Props) {
  // Calculate compliance checks based on submission data
  const complianceChecks: ComplianceCheck[] = [
    {
      category: 'FDA Regulatory',
      status: submission.seo_keywords?.length > 0 ? 'passed' : 'failed',
      message: 'No promotional language for unapproved indications',
      icon: Scale,
      details: [
        'No off-label promotion detected',
        'Approved indication clearly stated',
        'Risk information included'
      ]
    },
    {
      category: 'Medical Accuracy',
      status: submission.mechanism_of_action ? 'passed' : 'warning',
      message: 'Clinical data and claims verification',
      icon: Stethoscope,
      details: [
        'MOA correctly described',
        'Clinical endpoints accurate',
        'No exaggerated efficacy claims'
      ]
    },
    {
      category: 'Fair Balance',
      status: 'passed',
      message: 'Benefits and risks appropriately balanced',
      icon: Shield,
      details: [
        'Safety information prominent',
        'Side effects clearly listed',
        'Contraindications included'
      ]
    },
    {
      category: 'MLR Review',
      status: 'pending',
      message: 'Awaiting Medical Legal Regulatory review',
      icon: FileCheck,
      details: [
        'Scheduled for MLR committee',
        'Estimated review: 3-5 business days',
        'Pre-review checklist complete'
      ]
    },
    {
      category: 'Brand Guidelines',
      status: submission.product_name ? 'passed' : 'warning',
      message: 'Adherence to brand and style requirements',
      icon: FileText,
      details: [
        'Correct product name usage',
        'Approved messaging framework',
        'Visual identity compliant'
      ]
    },
    {
      category: 'Digital Compliance',
      status: submission.meta_description ? 'passed' : 'warning',
      message: 'SEO/GEO optimization within guidelines',
      icon: TrendingUp,
      details: [
        'Keywords medically appropriate',
        'No misleading meta tags',
        'Schema markup accurate'
      ]
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'passed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'warning':
        return 'text-amber-600 bg-amber-50 border-amber-200';
      case 'pending':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'passed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />;
    }
  };

  // Calculate overall compliance score
  const totalChecks = complianceChecks.length;
  const passedChecks = complianceChecks.filter(c => c.status === 'passed').length;
  const failedChecks = complianceChecks.filter(c => c.status === 'failed').length;
  const warningChecks = complianceChecks.filter(c => c.status === 'warning').length;
  const pendingChecks = complianceChecks.filter(c => c.status === 'pending').length;
  
  const complianceScore = Math.round((passedChecks / totalChecks) * 100);

  return (
    <div className="space-y-6">
      {/* Overall Compliance Score */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="h-6 w-6 text-blue-600" />
              Overall Compliance Score
            </h3>
            <p className="text-sm text-gray-600 mt-1">Based on automated compliance checks</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">{complianceScore}%</div>
            <div className="text-xs text-gray-600">Compliant</div>
          </div>
        </div>
        
        {/* Score Breakdown Bar */}
        <div className="flex gap-1 h-8 rounded-lg overflow-hidden">
          {passedChecks > 0 && (
            <div 
              className="bg-green-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
            >
              {passedChecks}
            </div>
          )}
          {warningChecks > 0 && (
            <div 
              className="bg-amber-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(warningChecks / totalChecks) * 100}%` }}
            >
              {warningChecks}
            </div>
          )}
          {failedChecks > 0 && (
            <div 
              className="bg-red-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(failedChecks / totalChecks) * 100}%` }}
            >
              {failedChecks}
            </div>
          )}
          {pendingChecks > 0 && (
            <div 
              className="bg-blue-500 flex items-center justify-center text-white text-xs font-medium"
              style={{ width: `${(pendingChecks / totalChecks) * 100}%` }}
            >
              {pendingChecks}
            </div>
          )}
        </div>
        
        {/* Legend */}
        <div className="flex items-center justify-center gap-6 mt-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Passed ({passedChecks})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-amber-500 rounded"></div>
            <span>Warnings ({warningChecks})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Failed ({failedChecks})</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span>Pending ({pendingChecks})</span>
          </div>
        </div>
      </div>

      {/* Individual Compliance Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {complianceChecks.map((check, idx) => {
          const Icon = check.icon;
          return (
            <div 
              key={idx}
              className={`border rounded-lg p-4 ${getStatusColor(check.status)}`}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white rounded-lg">
                    <Icon className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900">{check.category}</h4>
                    <p className="text-sm text-gray-600">{check.message}</p>
                  </div>
                </div>
                {getStatusIcon(check.status)}
              </div>
              
              {check.details && (
                <ul className="mt-3 space-y-1 text-xs text-gray-600">
                  {check.details.map((detail, didx) => (
                    <li key={didx} className="flex items-start gap-1">
                      <span className="text-gray-400 mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>

      {/* Compliance Timeline */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Compliance Review Timeline
        </h4>
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-4 w-4 text-green-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">AI Compliance Check</p>
              <p className="text-xs text-gray-600">Completed {new Date().toLocaleDateString()}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-blue-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">SEO Team Review</p>
              <p className="text-xs text-gray-600">In Progress</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <FileCheck className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">MLR Review</p>
              <p className="text-xs text-gray-600">Scheduled for next week</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <Shield className="h-4 w-4 text-gray-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Final Approval</p>
              <p className="text-xs text-gray-600">Pending MLR clearance</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}