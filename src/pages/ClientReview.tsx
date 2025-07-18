import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase, type Submission } from '../lib/supabase'
import { 
  ChevronDown, 
  ChevronUp, 
  Building2,
  Clock,
  Target,
  TrendingUp,
  Users,
  FileText,
  ArrowRight,
  Info,
  Settings
} from 'lucide-react'
import { format } from 'date-fns'
import ClientApprovalModal from '../components/ClientApprovalModal'

// Dummy data for demonstration
const DUMMY_SUBMISSIONS: Submission[] = [
  {
    id: 'dummy-1',
    compliance_id: 'COMP-2024-001',
    submitter_name: 'Sarah Johnson',
    submitter_email: 'sarah.johnson@pharmatech.com',
    submitter_company: 'PharmaTech Solutions',
    product_name: 'Nexafib',
    therapeutic_area: 'Cardiology',
    stage: 'Launch',
    priority_level: 'High',
    raw_input_content: 'Nexafib is a novel fibrate therapy...',
    ai_output: 'SEO Strategy: Focus on long-tail keywords targeting cardiologists and primary care physicians. Content pillars include mechanism of action, clinical trial data, and patient selection criteria. Estimated organic traffic increase: 150-200% within 6 months.',
    langchain_status: 'seo_approved',
    workflow_stage: 'Client_Review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date().toISOString(),
    seo_keywords: ['nexafib cardiology', 'novel fibrate therapy', 'lipid management innovation'],
    target_audience: ['Cardiologists', 'Primary Care Physicians', 'Endocrinologists'],
    medical_indication: 'Hyperlipidemia and cardiovascular risk reduction',
    dosage_form: 'Oral tablet, 100mg once daily',
    competitors: ['Fenofibrate', 'Gemfibrozil', 'Statins'],
    positioning: 'Next-generation fibrate with superior efficacy'
  },
  {
    id: 'dummy-2',
    compliance_id: 'COMP-2024-002',
    submitter_name: 'Michael Chen',
    submitter_email: 'mchen@biogeninnovations.com',
    submitter_company: 'BioGen Innovations',
    product_name: 'OncoShield Plus',
    therapeutic_area: 'Oncology',
    stage: 'Pre-Launch',
    priority_level: 'High',
    raw_input_content: 'OncoShield Plus is an immunotherapy combination...',
    ai_output: 'SEO Strategy: Target oncology specialists and cancer centers. Focus on clinical efficacy data, safety profile, and patient access programs. Projected ROI: 3.5x within first year.',
    langchain_status: 'seo_approved',
    workflow_stage: 'Client_Review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-18').toISOString(),
    updated_at: new Date().toISOString(),
    seo_keywords: ['oncoshield immunotherapy', 'cancer treatment innovation', 'PD-1 inhibitor combination'],
    target_audience: ['Oncologists', 'Cancer Centers', 'Patients'],
    medical_indication: 'Advanced non-small cell lung cancer',
    dosage_form: 'IV infusion, 200mg every 3 weeks',
    competitors: ['Keytruda', 'Opdivo', 'Tecentriq'],
    positioning: 'Best-in-class combination immunotherapy'
  },
  {
    id: 'dummy-3',
    compliance_id: 'COMP-2024-003',
    submitter_name: 'Emily Rodriguez',
    submitter_email: 'erodriguez@neurotherapeutics.com',
    submitter_company: 'NeuroTherapeutics Inc',
    product_name: 'CogniMax',
    therapeutic_area: 'Neurology',
    stage: 'Phase III',
    priority_level: 'Medium',
    raw_input_content: 'CogniMax is a breakthrough treatment for Alzheimer\'s...',
    ai_output: 'SEO Strategy: Build authority in Alzheimer\'s treatment space. Target neurologists, geriatricians, and caregivers. Content focus on mechanism of action, clinical trial results, and patient quality of life.',
    langchain_status: 'seo_approved',
    workflow_stage: 'Client_Review',
    langchain_retry_count: 0,
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date().toISOString(),
    seo_keywords: ['cognimax alzheimers', 'cognitive enhancement therapy', 'dementia treatment'],
    target_audience: ['Neurologists', 'Geriatricians', 'Caregivers', 'Patients'],
    medical_indication: 'Mild to moderate Alzheimer\'s disease',
    dosage_form: 'Oral solution, 10mg/5mL twice daily',
    competitors: ['Aricept', 'Namenda', 'Exelon'],
    positioning: 'First disease-modifying therapy with cognitive benefits'
  }
]

export default function ClientReview() {
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [useDummyData, setUseDummyData] = useState(true) // Default to dummy data
  const queryClient = useQueryClient()

  const { data: liveSubmissions, isLoading } = useQuery({
    queryKey: ['client-review-submissions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .eq('workflow_stage', 'Client_Review')
        .order('created_at', { ascending: false })
      
      if (error) throw error
      return data as Submission[]
    },
    enabled: !useDummyData
  })

  // Use dummy data or live data based on toggle
  const submissions = useDummyData ? DUMMY_SUBMISSIONS : liveSubmissions

  // Get SEO review data for selected submission
  const { data: seoReviewData } = useQuery({
    queryKey: ['seo-review-data', selectedSubmission?.id],
    queryFn: async () => {
      if (!selectedSubmission?.id) return null
      
      // Return dummy SEO review data
      return {
        keywords: selectedSubmission.seo_keywords || [],
        strategy: selectedSubmission.ai_output,
        projections: {
          traffic: '+150-200%',
          conversions: '+80-120 inquiries/month',
          roi: '3.5x'
        }
      }
    },
    enabled: !!selectedSubmission?.id
  })

  if (!useDummyData && isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900">No submissions pending client review</h3>
        <p className="mt-2 text-sm text-gray-500">
          Submissions will appear here after SEO team approval.
        </p>
        <button
          onClick={() => setUseDummyData(!useDummyData)}
          className="mt-4 inline-flex items-center px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Settings className="h-4 w-4 mr-2" />
          {useDummyData ? 'Switch to Live Data' : 'Show Demo Data'}
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white shadow rounded-lg px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
              <Building2 className="h-5 w-5 text-blue-600" />
              Client Review Queue
              {useDummyData && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  Demo Data
                </span>
              )}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Review SEO content for brand alignment before MLR submission
            </p>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setUseDummyData(!useDummyData)}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Settings className="h-3.5 w-3.5 mr-1.5" />
              {useDummyData ? 'Live Data' : 'Demo Data'}
            </button>
            <div className="flex items-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-600">SEO Approved</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-600">Awaiting Your Review</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-gray-600">Next: MLR Review</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="text-sm text-blue-900">
            <p className="font-medium mb-1">Your Role in the Review Process</p>
            <p>As the client reviewer, you'll validate:</p>
            <ul className="list-disc list-inside mt-1 text-blue-800">
              <li>Brand voice and messaging consistency</li>
              <li>Business and commercial alignment</li>
              <li>Target audience appropriateness</li>
              <li>Strategic positioning (MLR handles medical/legal compliance)</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Submissions Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {submissions.map((submission) => (
          <div key={submission.id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
            <div className="p-6">
              {/* Product Header */}
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {submission.product_name}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {submission.therapeutic_area}
                  </p>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Client Review
                </span>
              </div>

              {/* Key Info */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <Target className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Stage:</span>
                  <span className="font-medium text-gray-900">{submission.stage}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Audience:</span>
                  <span className="font-medium text-gray-900">
                    {submission.target_audience?.join(', ') || 'Not specified'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="h-4 w-4 text-gray-400" />
                  <span className="text-gray-600">Submitted:</span>
                  <span className="font-medium text-gray-900">
                    {format(new Date(submission.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>

              {/* SEO Performance Preview */}
              <div className="bg-gray-50 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2 flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                  SEO Projections
                </h4>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-gray-600">Traffic</p>
                    <p className="font-semibold text-gray-900">+150-200%</p>
                  </div>
                  <div>
                    <p className="text-gray-600">ROI</p>
                    <p className="font-semibold text-gray-900">3.5x</p>
                  </div>
                </div>
              </div>

              {/* Expand/Collapse for Details */}
              <button
                onClick={() => setExpandedCard(expandedCard === submission.id ? null : submission.id)}
                className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center justify-center gap-1 mb-4"
              >
                {expandedCard === submission.id ? (
                  <>
                    <ChevronUp className="h-4 w-4" />
                    Hide Details
                  </>
                ) : (
                  <>
                    <ChevronDown className="h-4 w-4" />
                    View Details
                  </>
                )}
              </button>

              {expandedCard === submission.id && (
                <div className="border-t pt-4 space-y-4">
                  {/* Submission Details */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Product Details</h4>
                    <div className="text-sm space-y-1">
                      <p><span className="text-gray-600">Indication:</span> <span className="text-gray-900">{submission.medical_indication}</span></p>
                      <p><span className="text-gray-600">Dosage:</span> <span className="text-gray-900">{submission.dosage_form}</span></p>
                      <p><span className="text-gray-600">Competitors:</span> <span className="text-gray-900">{submission.competitors?.join(', ')}</span></p>
                    </div>
                  </div>

                  {/* SEO Strategy Summary */}
                  {submission.ai_output && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-900 mb-2">SEO Strategy Summary</h4>
                      <div className="text-sm text-gray-600 bg-gray-50 rounded p-3 max-h-32 overflow-y-auto">
                        {typeof submission.ai_output === 'string' 
                          ? submission.ai_output.substring(0, 200) + '...'
                          : 'SEO strategy has been developed and approved by the internal team.'}
                      </div>
                    </div>
                  )}

                  {/* Submitter Info */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Submitted By</h4>
                    <div className="text-sm">
                      <p className="text-gray-900">{submission.submitter_name}</p>
                      <p className="text-gray-600">{submission.submitter_email}</p>
                      {submission.submitter_company && (
                        <p className="text-gray-600">{submission.submitter_company}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <button
                onClick={() => setSelectedSubmission(submission)}
                className="w-full mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <FileText className="h-4 w-4" />
                Begin Review
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Client Approval Modal */}
      {selectedSubmission && (
        <ClientApprovalModal
          isOpen={!!selectedSubmission}
          onClose={() => {
            setSelectedSubmission(null)
            queryClient.invalidateQueries({ queryKey: ['client-review-submissions'] })
          }}
          submission={selectedSubmission}
          seoReviewData={seoReviewData}
        />
      )}
    </div>
  )
}
