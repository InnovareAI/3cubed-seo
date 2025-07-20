import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { supabase, ContentPiece } from '@/lib/supabase'
import SEOReviewModal from '../components/SEOReviewModal'
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
  BarChart3
} from 'lucide-react'

export default function SEOReview() {
  const [searchTerm, setSearchTerm] = useState('')
  const [priorityFilter, setPriorityFilter] = useState<string>('all')
  const [therapeuticAreaFilter, setTherapeuticAreaFilter] = useState<string>('all')
  const [selectedContent, setSelectedContent] = useState<ContentPiece | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch content pending SEO review
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

  // Filter submissions based on search and filters
  const filteredContent = useMemo(() => {
    if (!contentPieces) return []
    
    return contentPieces.filter(content => {
      if (searchTerm && 
          !content.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.target_keyword.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !content.project?.therapeutic_area?.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false
      }
      if (therapeuticAreaFilter !== 'all' && content.project?.therapeutic_area !== therapeuticAreaFilter) {
        return false
      }
      // Priority filter would go here if we had priority in content_pieces
      return true
    })
  }, [contentPieces, searchTerm, therapeuticAreaFilter])

  const handleCardClick = (content: ContentPiece) => {
    setSelectedContent(content)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedContent(null)
  }

  // Get unique therapeutic areas for filter
  const therapeuticAreas = useMemo(() => {
    if (!contentPieces) return []
    const areas = contentPieces
      .map(c => c.project?.therapeutic_area)
      .filter(Boolean) as string[]
    return [...new Set(areas)]
  }, [contentPieces])

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
        description="Review and optimize content for search performance"
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
        description="Search optimization and keyword strategy"
        bulletPoints={[
          'Optimize content for target keywords',
          'Enhance meta descriptions and title tags',
          'Improve content structure and readability',
          'Ensure proper keyword density and placement'
        ]}
        variant="green"
      />

      <FilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        priorityFilter={priorityFilter}
        onPriorityChange={setPriorityFilter}
        therapeuticAreaFilter={therapeuticAreaFilter}
        onTherapeuticAreaChange={setTherapeuticAreaFilter}
        therapeuticAreas={therapeuticAreas}
        additionalFilters={
          <div className="flex items-center justify-end text-sm text-gray-500">
            <Search className="h-4 w-4 mr-1" />
            SEO Optimization
          </div>
        }
      />

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
          filteredContent.map((content) => (
            <ReviewCard
              key={content.id}
              submission={{
                id: content.id,
                product_name: content.project?.product_name || content.title,
                therapeutic_area: content.project?.therapeutic_area || 'N/A',
                stage: content.project?.status || 'active',
                workflow_stage: 'SEO_Review',
                target_audience: [],
                created_at: content.created_at,
                submitter_name: content.assigned_user?.full_name || 'System',
                submitter_email: content.assigned_user?.email || 'system@3cubed.com',
                priority_level: 'Medium',
                client_name: content.project?.client?.name
              }}
              onClick={() => handleCardClick(content)}
              statusBadge={
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  SEO Review
                </span>
              }
              priorityLevel="Medium"
              highlights={
                content.content.seo_analysis.keywords.length > 0 ? [{
                  label: 'Keywords',
                  items: content.content.seo_analysis.keywords.slice(0, 3),
                  icon: <Target className="h-3 w-3" />,
                  colorClass: 'bg-green-100 text-green-800'
                }] : undefined
              }
              metrics={[
                {
                  label: 'Keywords',
                  value: content.content.seo_analysis.keywords.length,
                  icon: <Target className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Score',
                  value: '85/100',
                  icon: <BarChart3 className="h-3 w-3 text-gray-400" />
                },
                {
                  label: 'Traffic',
                  value: '+120%',
                  icon: <TrendingUp className="h-3 w-3 text-gray-400" />
                }
              ]}
              roleSpecificContent={
                <div className="mb-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <span className="font-semibold">SEO Focus:</span> {content.content.seo_analysis.strategy}
                  </p>
                </div>
              }
            />
          ))
        )}
      </div>

      {/* SEO Review Modal */}
      {selectedContent && (
        <SEOReviewModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          content={selectedContent}
        />
      )}
    </div>
  )
}
