import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import CTAButton from '../components/CTAButton'
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas'
import { 
  Search,
  FileText,
  Hash,
  Calendar,
  AlertCircle,
  Clock,
  Filter,
  Users,
  Building,
  ArrowRight
} from 'lucide-react'
import { format } from 'date-fns'

interface Submission {
  id: string
  product_name: string
  generic_name?: string
  therapeutic_area: string
  stage: string
  workflow_stage: string
  target_audience: string[]
  created_at: string
  submitter_name: string
  submitter_email: string
  submitter_company?: string
  priority_level: string
  medical_indication?: string
  langchain_status?: string
  geography?: string[]
  client_name?: string
  mechanism_of_action?: string
  key_differentiators?: string[]
  seo_keywords?: string[]
  long_tail_keywords?: string[]
  consumer_questions?: string[]
  h1_tag?: string
  meta_title?: string
  meta_description?: string
  // AI-generated fields
  seo_title?: string
  geo_event_tags?: string[]
  h2_tags?: string[]
  seo_strategy_outline?: string
  geo_optimization_score?: number
}

export default function SEOReview() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')

  // Track viewed submissions
  const [viewedSubmissions, setViewedSubmissions] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('viewedSubmissions') || '[]'))
  )

  const { data: dbSubmissions, isLoading } = useQuery({
    queryKey: ['seo-review-queue'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('submissions')
        .select('*')
        .order('created_at', { ascending: false }) // Always newest first
      
      if (error) throw error
      return data as Submission[]
    },
    enabled: true
  })

  // Set up real-time subscription for instant updates
  useEffect(() => {
    const channel = supabase
      .channel('submissions-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'submissions'
        },
        (payload) => {
          // Refetch data when any submission changes
          queryClient.invalidateQueries({ queryKey: ['seo-review-queue'] })
        }
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  // Temporary demo data for design purposes
  const demoData: Submission[] = [
    {
      id: 'demo-1',
      product_name: 'Keytruda',
      generic_name: 'pembrolizumab',
      therapeutic_area: 'Oncology',
      stage: 'launch',
      workflow_stage: 'ai_completed',
      target_audience: ['HCPs', 'Patients'],
      created_at: new Date().toISOString(),
      submitter_name: 'Dr. Sarah Johnson',
      submitter_email: 'sarah.johnson@pharma.com',
      submitter_company: 'PharmaCorp',
      priority_level: 'high',
      medical_indication: 'Non-Small Cell Lung Cancer',
      geography: ['USA', 'EU'],
      client_name: 'Merck',
      mechanism_of_action: 'PD-1 inhibitor',
      key_differentiators: ['First-line therapy', 'Superior OS'],
      seo_keywords: ['pembrolizumab', 'keytruda', 'lung cancer treatment'],
      long_tail_keywords: ['keytruda for nsclc first line', 'pembrolizumab side effects'],
      meta_title: 'Keytruda (Pembrolizumab) for NSCLC | Official Information',
      meta_description: 'Learn about Keytruda, a PD-1 inhibitor for first-line treatment of NSCLC.',
      seo_title: 'Keytruda: Revolutionary NSCLC Treatment',
      geo_event_tags: ['ASCO 2024', 'ESMO 2024'],
      h2_tags: ['How Keytruda Works', 'Clinical Trial Results', 'Patient Eligibility'],
      seo_strategy_outline: 'Focus on first-line positioning and survival benefits',
      geo_optimization_score: 92
    },
    {
      id: 'demo-2',
      product_name: 'Ozempic',
      generic_name: 'semaglutide',
      therapeutic_area: 'Diabetes',
      stage: 'post-launch',
      workflow_stage: 'seo_review',
      target_audience: ['Patients', 'Caregivers'],
      created_at: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      submitter_name: 'Mark Chen',
      submitter_email: 'mark.chen@novonordisk.com',
      priority_level: 'medium',
      medical_indication: 'Type 2 Diabetes',
      geography: ['USA'],
      client_name: 'Novo Nordisk',
      seo_keywords: ['ozempic', 'semaglutide', 'diabetes medication'],
      long_tail_keywords: ['ozempic weight loss results', 'semaglutide injection how to use'],
      meta_title: 'Ozempic (Semaglutide) for Type 2 Diabetes',
      meta_description: 'Discover how Ozempic helps manage blood sugar in adults with type 2 diabetes.'
    },
    {
      id: 'demo-3',
      product_name: 'Humira',
      generic_name: 'adalimumab',
      therapeutic_area: 'Immunology',
      stage: 'pre-launch',
      workflow_stage: 'pending',
      target_audience: ['HCPs', 'Patients', 'Payers'],
      created_at: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      submitter_name: 'Emily Rodriguez',
      submitter_email: 'emily.r@abbvie.com',
      priority_level: 'low',
      medical_indication: 'Rheumatoid Arthritis',
      geography: ['Global'],
      client_name: 'AbbVie',
      seo_keywords: ['humira', 'adalimumab', 'rheumatoid arthritis'],
      meta_title: 'Humira for Rheumatoid Arthritis Treatment',
      seo_title: 'Humira: Leading RA Treatment Option',
      geo_optimization_score: 78
    }
  ]

  const submissions = dbSubmissions || demoData

  const filteredSubmissions = submissions?.filter(submission => {
    if (searchTerm && !submission.product_name.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !submission.therapeutic_area.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false
    }
    if (priorityFilter !== 'all' && submission.priority_level.toLowerCase() !== priorityFilter) {
      return false
    }
    if (therapeuticAreaFilter !== 'all' && submission.therapeutic_area !== therapeuticAreaFilter) {
      return false
    }
    return true
  }) || []

  const handleCardClick = (submissionId: string) => {
    // Mark as viewed
    const newViewedSet = new Set(viewedSubmissions)
    newViewedSet.add(submissionId)
    setViewedSubmissions(newViewedSet)
    localStorage.setItem('viewedSubmissions', JSON.stringify(Array.from(newViewedSet)))
    
    navigate(`/seo-review/${submissionId}`)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'text-red-700 bg-red-50 ring-red-600/20'
      case 'medium':
        return 'text-amber-700 bg-amber-50 ring-amber-600/20'
      case 'low':
        return 'text-green-700 bg-green-50 ring-green-600/20'
      default:
        return 'text-gray-700 bg-gray-50 ring-gray-600/20'
    }
  }

  // Calculate stats for the cards
  const stats = {
    total: filteredSubmissions?.length || 0,
    highPriority: filteredSubmissions?.filter(s => s.priority_level?.toLowerCase() === 'high').length || 0,
    newForReview: filteredSubmissions?.filter(s => !viewedSubmissions.has(s.id)).length || 0,
    todaySubmissions: filteredSubmissions?.filter(s => {
      const today = new Date()
      const submissionDate = new Date(s.created_at)
      return submissionDate.toDateString() === today.toDateString()
    }).length || 0
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SEO Review</h1>
          <p className="text-sm text-gray-600 mt-1">Review and optimize AI-generated content for search performance</p>
        </div>
        <div className="flex items-center gap-3">
          <CTAButton variant="primary" icon={<FileText className="h-4 w-4" />}>
            Export Report
          </CTAButton>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total for Review</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.total}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">High Priority</p>
              <p className="text-2xl font-semibold text-red-600 mt-1">{stats.highPriority}</p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertCircle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">New for Review</p>
              <p className="text-2xl font-semibold text-blue-600 mt-1">{stats.newForReview}</p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <FileText className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Today's Submissions</p>
              <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.todaySubmissions}</p>
            </div>
            <div className="p-3 bg-gray-100 rounded-lg">
              <Clock className="h-6 w-6 text-gray-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search content..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>

          <select
            value={therapeuticAreaFilter}
            onChange={(e) => setTherapeuticAreaFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Therapeutic Areas</option>
            {THERAPEUTIC_AREAS.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>

          <select
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            defaultValue="all"
          >
            <option value="all">All Stages</option>
            <option value="pre-launch">Pre-Launch</option>
            <option value="launch">Launch</option>
            <option value="post-launch">Post-Launch</option>
          </select>

          <CTAButton variant="secondary" icon={<Filter className="h-4 w-4" />}>
            More Filters
          </CTAButton>
        </div>
      </div>

      {/* Content Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSubmissions?.map((submission) => (
          <div
            key={submission.id}
            onClick={() => handleCardClick(submission.id)}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all cursor-pointer group relative"
          >
            {/* NEW Badge */}
            {!viewedSubmissions.has(submission.id) && (
              <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-pulse">
                NEW
              </div>
            )}
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                  {submission.product_name}
                </h3>
                <p className="text-sm text-gray-600 mt-1">{submission.therapeutic_area}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority_level || 'medium')}`}>
                {submission.priority_level || 'Medium'} Priority
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Building className="h-4 w-4" />
                <span>{submission.client_name || submission.submitter_company || 'No client'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="h-4 w-4" />
                <span>{submission.target_audience?.join(', ') || 'No audience specified'}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>Submitted {format(new Date(submission.created_at), 'MMM d, yyyy')}</span>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Hash className="h-4 w-4" />
                <span>{submission.seo_keywords?.length || 0} keywords • {submission.long_tail_keywords?.length || 0} long-tail</span>
              </div>

              {/* Display AI-generated SEO title if available */}
              {submission.seo_title && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <FileText className="h-4 w-4 text-green-600" />
                  <span className="text-xs font-medium">SEO Title: {submission.seo_title}</span>
                </div>
              )}

              {/* Display GEO event tags if available */}
              {submission.geo_event_tags && submission.geo_event_tags.length > 0 && (
                <div className="flex items-start gap-2 text-sm text-gray-600">
                  <Hash className="h-4 w-4 text-blue-600" />
                  <span className="text-xs">Events: {submission.geo_event_tags.join(', ')}</span>
                </div>
              )}

              {submission.medical_indication && (
                <div className="flex items-start gap-2 text-sm text-gray-600 bg-blue-50 p-2 rounded">
                  <AlertCircle className="h-4 w-4 text-blue-600 mt-0.5" />
                  <span className="text-xs">{submission.medical_indication.substring(0, 100)}...</span>
                </div>
              )}
            </div>

            <div className="mt-4 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                Click to review
              </span>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found for SEO review</p>
        </div>
      )}
    </div>
  )
}