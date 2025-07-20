import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase, ContentPiece } from '@/lib/supabase'
import ReviewCard from '../components/ReviewCard'
import ReviewPageHeader from '../components/ReviewPageHeader'
import FilterBar from '../components/FilterBar'
import EmptyState from '../components/EmptyState'
import RoleInfoBanner from '../components/RoleInfoBanner'
import { 
  Search,
  FileText,
  TrendingUp,
  Target,
  BarChart3,
  Filter,
  Calendar,
  Tag,
  AlertCircle
} from 'lucide-react'

export default function SEOReview() {
  const navigate = useNavigate()
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [clientFilter, setClientFilter] = useState<string>('all')
  const [projectFilter, setProjectFilter] = useState<string>('all')

  // Fetch content pending SEO review with all new fields
  const { data: contentPieces, isLoading } = useQuery({
    queryKey: ['seo-review-content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('content_pieces')
        .select(`
          *,
          project:projects(
            *,
            client:clients(name)
          ),
          assigned_user:users!assigned_to(email, full_name)
        `)
        .eq('status', 'pending_seo_review')
        .order('created_at', { ascending: true })
      
      if (error) {
        console.error('Supabase error:', error)
        throw error
      }
      
      return data as ContentPiece[]
    },
    refetchInterval: 30000
  })

  // Get unique filter values
  const filterOptions = useMemo(() => {
    if (!contentPieces) return { priorities: [], therapeuticAreas: [], clients: [], projects: [] }
    
    const priorities = [...new Set(contentPieces.map(c => c.priority_level || 'Medium'))]
    const therapeuticAreas = [...new Set(contentPieces.map(c => c.project?.therapeutic_area).filter(Boolean))] as string[]
    const clients = [...new Set(contentPieces.map(c => c.project?.client?.name).filter(Boolean))] as string[]
    const projects = [...new Set(contentPieces.map(c => c.project?.name).filter(Boolean))] as string[]
    
    return { priorities, therapeuticAreas, clients, projects }
  }, [contentPieces])

  // Filter content based on search and filters
  const filteredContent = useMemo(() => {
    if (!contentPieces) return []
    
    return contentPieces.filter(content => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase()
        const matchesSearch = 
          content.title.toLowerCase().includes(searchLower) ||
          content.target_keyword?.toLowerCase().includes(searchLower) ||
          content.project?.therapeutic_area?.toLowerCase().includes(searchLower) ||
          content.project?.product_name?.toLowerCase().includes(searchLower) ||
          content.seo_keywords?.some((k: string) => k.toLowerCase().includes(searchLower))
        
        if (!matchesSearch) return false
      }

      // Priority filter
      if (priorityFilter !== 'all' && content.priority_level !== priorityFilter) {
        return false
      }

      // Therapeutic area filter
      if (therapeuticAreaFilter !== 'all' && content.project?.therapeutic_area !== therapeuticAreaFilter) {
        return false
      }

      // Client filter
      if (clientFilter !== 'all' && content.project?.client?.name !== clientFilter) {
        return false
      }

      // Project filter
      if (projectFilter !== 'all' && content.project?.name !== projectFilter) {
        return false
      }

      return true
    })
  }, [contentPieces, searchTerm, priorityFilter, therapeuticAreaFilter, clientFilter, projectFilter])

  const handleCardClick = (content: ContentPiece) => {
    // Navigate to detail page instead of opening modal
    navigate(`/seo-review/${content.id}`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <ReviewPageHeader
        title="SEO Review Queue"
        description="Review and optimize content for search performance and AI discoverability"
        icon={<Search className="h-6 w-6 text-green-600" />}
        queueCount={filteredContent.length}
        statusIndicators={[
          { color: 'bg-yellow-500', label: 'Pending SEO Review' },
          { color: 'bg-green-500', label: 'SEO Optimized' },
          { color: 'bg-blue-500', label: 'Next: Client Review' }
        ]}
      />

      <RoleInfoBanner
        title="SEO Review"
        description="Search optimization, keyword strategy, and AI search optimization (GEO)"
        bulletPoints={[
          'Review 10 SEO keywords and 10 long-tail keywords',
          'Optimize H1, H2, H3 tags and meta descriptions',
          'Enhance content for AI search engines (GEO)',
          'Validate 10 consumer questions for FAQ schema',
          'Ensure proper keyword density and placement'
        ]}
        variant="green"
      />

      {/* Enhanced Filter Bar */}
      <div className="bg-white shadow rounded-lg p-4 mb-6">
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by product, keyword, therapeutic area..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
          </div>

          {/* Filter Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {/* Priority Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Priorities</option>
                {filterOptions.priorities.map(priority => (
                  <option key={priority} value={priority}>{priority}</option>
                ))}
              </select>
            </div>

            {/* Therapeutic Area Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Therapeutic Area</label>
              <select
                value={therapeuticAreaFilter}
                onChange={(e) => setTherapeuticAreaFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Areas</option>
                {filterOptions.therapeuticAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            {/* Client Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select
                value={clientFilter}
                onChange={(e) => setClientFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Clients</option>
                {filterOptions.clients.map(client => (
                  <option key={client} value={client}>{client}</option>
                ))}
              </select>
            </div>

            {/* Project Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
              <select
                value={projectFilter}
                onChange={(e) => setProjectFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500"
              >
                <option value="all">All Projects</option>
                {filterOptions.projects.map(project => (
                  <option key={project} value={project}>{project}</option>
                ))}
              </select>
            </div>

            {/* Results Count */}
            <div className="flex items-end">
              <div className="text-sm text-gray-500">
                {filteredContent.length} {filteredContent.length === 1 ? 'result' : 'results'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Queue */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredContent.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <EmptyState
              icon={<FileText className="h-12 w-12" />}
              title="No content pending SEO review"
              description="Content will appear here after AI generation."
            />
          </div>
        ) : (
          filteredContent.map((content) => {
            // Get priority color
            const priorityColor = content.priority_level === 'High' ? 'red' : 
                               content.priority_level === 'Medium' ? 'yellow' : 'gray'
            
            return (
              <ReviewCard
                key={content.id}
                submission={{
                  id: content.id,
                  product_name: content.project?.product_name || content.title,
                  therapeutic_area: content.project?.therapeutic_area || 'N/A',
                  stage: content.project?.status || 'active',
                  workflow_stage: 'SEO_Review',
                  target_audience: content.target_audience || [],
                  created_at: content.created_at,
                  submitter_name: content.assigned_user?.full_name || 'System',
                  submitter_email: content.assigned_user?.email || 'system@3cubed.com',
                  priority_level: content.priority_level || 'Medium',
                  client_name: content.project?.client?.name
                }}
                onClick={() => handleCardClick(content)}
                statusBadge={
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    SEO Review
                  </span>
                }
                priorityLevel={content.priority_level || 'Medium'}
                highlights={
                  content.seo_keywords && content.seo_keywords.length > 0 ? [{
                    label: 'Keywords',
                    items: (content.seo_keywords as string[]).slice(0, 3),
                    icon: <Target className="h-3 w-3" />,
                    colorClass: 'bg-green-100 text-green-800'
                  }] : undefined
                }
                metrics={[
                  {
                    label: 'SEO Keywords',
                    value: content.seo_keywords?.length || 0,
                    icon: <Target className="h-3 w-3 text-gray-400" />
                  },
                  {
                    label: 'Questions',
                    value: content.consumer_questions?.length || 0,
                    icon: <BarChart3 className="h-3 w-3 text-gray-400" />
                  },
                  {
                    label: 'Priority',
                    value: content.priority_level || 'Medium',
                    icon: <AlertCircle className={`h-3 w-3 text-${priorityColor}-500`} />
                  }
                ]}
                roleSpecificContent={
                  <div className="mb-4 p-3 bg-green-50 rounded-lg">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Target Keyword:</span> {content.target_keyword || 'Not set'}
                    </p>
                    {content.geo_optimization && (
                      <p className="text-sm text-gray-700 mt-1">
                        <span className="font-semibold">GEO:</span> AI search optimized
                      </p>
                    )}
                  </div>
                }
              />
            )
          })
        )}
      </div>
    </div>
  )
}