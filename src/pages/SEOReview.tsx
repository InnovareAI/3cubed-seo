import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from '../lib/api'
import CTAButton from '../components/CTAButton'
import { THERAPEUTIC_AREAS } from '../constants/therapeuticAreas'
import GEOScoreBreakdownComponent from '../components/GEOScoreBreakdown'
import { calculateGEOScore } from '../utils/geoScoring'
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
  ArrowRight,
  Brain,
  MessageSquare,
  Grid3X3,
  List,
  CalendarDays
} from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from 'date-fns'

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
  geo_optimization?: {
    ai_summary?: string
    voice_search_answers?: any
    medical_facts?: any
    evidence_statistics?: string[]
    citations?: any
  }
}

type ViewMode = 'grid' | 'list' | 'calendar'

export default function SEOReview() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showGEOModal, setShowGEOModal] = useState(false)
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null)

  // Track viewed submissions
  const [viewedSubmissions, setViewedSubmissions] = useState<Set<string>>(
    new Set(JSON.parse(localStorage.getItem('viewedSubmissions') || '[]'))
  )

  const { data: dbSubmissions, isLoading } = useQuery({
    queryKey: ['seo-review-queue'],
    queryFn: async () => {
      try {
        const data = await api.getSubmissions()
        // If no data from API or error, use mock data
        if (!data || data.length === 0) {
          const mockData = await import('../data/mock-submissions.json')
          return mockData.submissions.filter(s => s.workflow_stage === 'seo_review') as Submission[]
        }
        return data as Submission[]
      } catch (error) {
        // Fallback to mock data on error
        const mockData = await import('../data/mock-submissions.json')
        return mockData.submissions.filter(s => s.workflow_stage === 'seo_review') as Submission[]
      }
    },
    enabled: true
  })

  // No real-time updates - using mock data

  // Calculate GEO scores for submissions
  const submissionsWithScores = (dbSubmissions || []).map(submission => {
    if (submission.geo_optimization_score === 0 || submission.geo_optimization_score === undefined) {
      const scoreData = calculateGEOScore(submission);
      return {
        ...submission,
        geo_optimization_score: scoreData.percentage
      };
    }
    return submission;
  });

  const submissions = submissionsWithScores

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
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Grid View"
            >
              <Grid3X3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`p-2 rounded transition-colors ${
                viewMode === 'calendar' 
                  ? 'bg-blue-100 text-blue-600' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              title="Calendar View"
            >
              <CalendarDays className="h-4 w-4" />
            </button>
          </div>
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

      {/* Content Display based on View Mode */}
      {viewMode === 'grid' && (
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

              {/* GEO Information Section */}
              {(submission.geo_optimization || submission.geo_event_tags) && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="h-4 w-4 text-purple-600" />
                    <span className="text-xs font-semibold text-gray-700">GEO Optimization</span>
                  </div>
                  
                  {/* GEO Score if available */}
                  {submission.geo_optimization_score !== undefined && (
                    <div 
                      className="flex items-center gap-2 mb-2 cursor-pointer hover:opacity-80 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedSubmission(submission);
                        setShowGEOModal(true);
                      }}
                      title="Click to see GEO score breakdown"
                    >
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            submission.geo_optimization_score >= 80 ? 'bg-green-500' :
                            submission.geo_optimization_score >= 60 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${submission.geo_optimization_score}%` }}
                        />
                      </div>
                      <span className="text-xs font-medium text-gray-600">{submission.geo_optimization_score}%</span>
                    </div>
                  )}
                  
                  {/* AI Summary Preview */}
                  {submission.geo_optimization?.ai_summary && (
                    <div className="text-xs text-gray-600 mb-2 line-clamp-2">
                      <span className="font-medium">AI Summary:</span> {submission.geo_optimization.ai_summary}
                    </div>
                  )}
                  
                  {/* Voice Search Readiness */}
                  {submission.geo_optimization?.voice_search_answers && (
                    <div className="flex items-center gap-2 text-xs text-gray-600">
                      <MessageSquare className="h-3 w-3 text-purple-600" />
                      <span>Voice search optimized</span>
                    </div>
                  )}
                  
                  {/* GEO Event Tags */}
                  {submission.geo_event_tags && submission.geo_event_tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {submission.geo_event_tags.slice(0, 3).map((tag: string, idx: number) => (
                        <span key={idx} className="text-xs px-2 py-0.5 bg-purple-100 text-purple-700 rounded-full">
                          {tag}
                        </span>
                      ))}
                      {submission.geo_event_tags.length > 3 && (
                        <span className="text-xs text-gray-500">+{submission.geo_event_tags.length - 3} more</span>
                      )}
                    </div>
                  )}
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
              <div className="flex items-center gap-3 text-xs">
                {/* Quick Stats */}
                {submission.seo_keywords && (
                  <span className="text-gray-600">
                    <Hash className="h-3 w-3 inline mr-1" />
                    {submission.seo_keywords.length} keywords
                  </span>
                )}
                {submission.geo_optimization && (
                  <span className="text-purple-600">
                    <Brain className="h-3 w-3 inline mr-1" />
                    GEO ready
                  </span>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </div>
          ))}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SEO/GEO</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredSubmissions?.map((submission) => (
                <tr
                  key={submission.id}
                  onClick={() => handleCardClick(submission.id)}
                  className="hover:bg-gray-50 cursor-pointer"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{submission.product_name}</div>
                      <div className="text-xs text-gray-500">{submission.therapeutic_area}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {submission.client_name || submission.submitter_company || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(submission.priority_level || 'medium')}`}>
                      {submission.priority_level || 'Medium'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex items-center gap-2">
                      {submission.seo_keywords && (
                        <span className="text-green-600">
                          <Hash className="h-4 w-4 inline" /> {submission.seo_keywords.length}
                        </span>
                      )}
                      {submission.geo_optimization && (
                        <span className="text-purple-600">
                          <Brain className="h-4 w-4 inline" />
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(submission.created_at), 'MMM d')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {!viewedSubmissions.has(submission.id) && (
                      <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <CalendarView 
          submissions={filteredSubmissions} 
          selectedDate={selectedDate}
          onDateSelect={setSelectedDate}
          onSubmissionClick={handleCardClick}
          viewedSubmissions={viewedSubmissions}
          getPriorityColor={getPriorityColor}
        />
      )}

      {filteredSubmissions?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">No content found for SEO review</p>
        </div>
      )}

      {/* GEO Score Modal */}
      {showGEOModal && selectedSubmission && (
        <GEOScoreBreakdownComponent
          submission={selectedSubmission}
          showAsModal={true}
          onClose={() => {
            setShowGEOModal(false);
            setSelectedSubmission(null);
          }}
        />
      )}
    </div>
  )
}

// Calendar View Component
function CalendarView({ 
  submissions, 
  selectedDate, 
  onDateSelect, 
  onSubmissionClick,
  viewedSubmissions,
  getPriorityColor
}: { 
  submissions: Submission[]
  selectedDate: Date
  onDateSelect: (date: Date) => void
  onSubmissionClick: (id: string) => void
  viewedSubmissions: Set<string>
  getPriorityColor: (priority: string) => string
}) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  
  // Group submissions by date
  const submissionsByDate = submissions.reduce((acc, submission) => {
    const dateKey = format(new Date(submission.created_at), 'yyyy-MM-dd')
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(submission)
    return acc
  }, {} as Record<string, Submission[]>)
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  
  // Pad the calendar to start on Sunday
  const firstDayOfWeek = monthStart.getDay()
  const paddingDays = Array(firstDayOfWeek).fill(null)
  
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">
          {format(selectedDate, 'MMMM yyyy')}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => onDateSelect(new Date(selectedDate.getFullYear(), selectedDate.getMonth() - 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            ←
          </button>
          <button
            onClick={() => onDateSelect(new Date())}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-600 rounded hover:bg-blue-200"
          >
            Today
          </button>
          <button
            onClick={() => onDateSelect(new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1))}
            className="p-2 hover:bg-gray-100 rounded"
          >
            →
          </button>
        </div>
      </div>
      
      {/* Week Days */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Padding days */}
        {paddingDays.map((_, idx) => (
          <div key={`pad-${idx}`} className="h-24" />
        ))}
        
        {/* Calendar days */}
        {days.map(day => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const daySubmissions = submissionsByDate[dateKey] || []
          const isToday = isSameDay(day, new Date())
          
          return (
            <div
              key={dateKey}
              className={`h-24 border rounded-lg p-2 ${
                isToday ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              } ${daySubmissions.length > 0 ? 'cursor-pointer hover:shadow-md' : ''}`}
            >
              <div className="text-sm font-medium text-gray-900">{format(day, 'd')}</div>
              {daySubmissions.length > 0 && (
                <div className="mt-1 space-y-1">
                  {daySubmissions.slice(0, 2).map((submission) => (
                    <div
                      key={submission.id}
                      onClick={(e) => {
                        e.stopPropagation()
                        onSubmissionClick(submission.id)
                      }}
                      className="flex items-center gap-1 mb-1"
                    >
                      <span className={`inline-block px-1.5 py-0.5 text-xs font-medium rounded ${getPriorityColor(submission.priority_level || 'medium')}`}>
                        {submission.priority_level?.[0]?.toUpperCase() || 'M'}
                      </span>
                      <span className="text-xs truncate hover:text-blue-600 cursor-pointer" title={submission.product_name}>
                        {submission.product_name}
                        {!viewedSubmissions.has(submission.id) && (
                          <span className="ml-1 text-blue-600 font-bold">•</span>
                        )}
                      </span>
                    </div>
                  ))}
                  {daySubmissions.length > 2 && (
                    <div className="text-xs text-gray-500">+{daySubmissions.length - 2} more</div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}