import { useState } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { 
  ArrowLeft,
  FileText,
  Mail,
  Share2,
  DollarSign,
  Newspaper,
  BookOpen,
  Megaphone,
  FileEdit,
  HelpCircle,
  Video,
  Loader2,
  Download,
  Copy,
  Check,
  Sparkles
} from 'lucide-react'

interface ContentTypeConfig {
  id: string
  name: string
  icon: React.ReactNode
  description: string
  estimatedWords: string
  templates: string[]
}

const contentTypes: ContentTypeConfig[] = [
  {
    id: 'landing_page',
    name: 'Landing Page',
    icon: <FileText className="h-5 w-5" />,
    description: 'SEO-optimized landing page with product benefits and CTAs',
    estimatedWords: '800-1200',
    templates: ['Product Overview', 'Benefits-Focused', 'Clinical Data']
  },
  {
    id: 'email_campaign',
    name: 'Email Campaign',
    icon: <Mail className="h-5 w-5" />,
    description: 'Targeted email series for HCP engagement',
    estimatedWords: '150-300',
    templates: ['Product Launch', 'Clinical Updates', 'Educational Series']
  },
  {
    id: 'social_media_post',
    name: 'Social Media Posts',
    icon: <Share2 className="h-5 w-5" />,
    description: 'LinkedIn and Twitter posts for professional audiences',
    estimatedWords: '50-280',
    templates: ['Announcement', 'Educational', 'Clinical Study Results']
  },
  {
    id: 'paid_ad_copy',
    name: 'Paid Ad Copy',
    icon: <DollarSign className="h-5 w-5" />,
    description: 'Google Ads and display ad copy with compliance',
    estimatedWords: '25-150',
    templates: ['Search Ads', 'Display Ads', 'Retargeting']
  },
  {
    id: 'newsletter_article',
    name: 'Newsletter Article',
    icon: <Newspaper className="h-5 w-5" />,
    description: 'In-depth articles for email newsletters',
    estimatedWords: '600-1000',
    templates: ['Clinical Focus', 'Patient Stories', 'Research Updates']
  },
  {
    id: 'blog_post',
    name: 'Blog Post',
    icon: <BookOpen className="h-5 w-5" />,
    description: 'Educational blog content for SEO',
    estimatedWords: '1000-1500',
    templates: ['How-To Guide', 'Disease Education', 'Treatment Options']
  },
  {
    id: 'press_release',
    name: 'Press Release',
    icon: <Megaphone className="h-5 w-5" />,
    description: 'News announcements and milestone communications',
    estimatedWords: '400-600',
    templates: ['Product Launch', 'Clinical Trial Results', 'Partnership']
  },
  {
    id: 'product_description',
    name: 'Product Description',
    icon: <FileEdit className="h-5 w-5" />,
    description: 'Detailed product information for various channels',
    estimatedWords: '200-400',
    templates: ['Technical', 'Patient-Friendly', 'HCP-Focused']
  },
  {
    id: 'faq_section',
    name: 'FAQ Section',
    icon: <HelpCircle className="h-5 w-5" />,
    description: 'Common questions and answers about the product',
    estimatedWords: '500-800',
    templates: ['Patient FAQs', 'HCP FAQs', 'Insurance/Access']
  },
  {
    id: 'video_script',
    name: 'Video Script',
    icon: <Video className="h-5 w-5" />,
    description: 'Scripts for educational or promotional videos',
    estimatedWords: '300-500',
    templates: ['Patient Education', 'MOA Animation', 'Testimonial']
  }
]

interface GeneratedContent {
  id: string
  type: string
  title: string
  content: string
  keywords: string[]
  wordCount: number
  status: 'generating' | 'complete' | 'error'
}

export default function ContentGeneration() {
  const { clientName } = useParams<{ clientName: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  // const queryClient = useQueryClient()
  
  const decodedClientName = decodeURIComponent(clientName || '')
  const { selectedKeywords = [] } = location.state || {}
  
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent[]>([])
  const [isGenerating, setIsGenerating] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Generate content mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true)
      
      // Simulate AI content generation
      const newContent: GeneratedContent[] = []
      
      for (const typeId of selectedTypes) {
        const contentType = contentTypes.find(ct => ct.id === typeId)
        if (!contentType) continue
        
        // Create placeholder content
        const content: GeneratedContent = {
          id: `${typeId}-${Date.now()}`,
          type: typeId,
          title: `${contentType.name} for ${decodedClientName}`,
          content: 'Generating content...',
          keywords: selectedKeywords.slice(0, 5),
          wordCount: 0,
          status: 'generating'
        }
        
        newContent.push(content)
        setGeneratedContent(prev => [...prev, content])
        
        // Simulate generation delay
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // Update with generated content
        const generatedText = generateMockContent(typeId, selectedKeywords, decodedClientName)
        setGeneratedContent(prev => 
          prev.map(c => 
            c.id === content.id 
              ? {
                  ...c,
                  content: generatedText,
                  wordCount: generatedText.split(' ').length,
                  status: 'complete'
                }
              : c
          )
        )
      }
      
      setIsGenerating(false)
    }
  })

  const generateMockContent = (type: string, keywords: string[], clientName: string): string => {
    const templates: Record<string, string> = {
      landing_page: `# ${clientName} - Revolutionary Treatment for Better Outcomes\n\n## Overview\n${keywords[0]} represents a breakthrough in modern medicine...\n\n## Key Benefits\n- Improved patient outcomes\n- Reduced side effects\n- Convenient dosing\n\n## Clinical Evidence\nIn clinical trials, ${keywords[0]} demonstrated...\n\n## Get Started Today\nContact your healthcare provider to learn more.`,
      
      email_campaign: `Subject: Introducing ${keywords[0]} - A New Option for Your Patients\n\nDear Healthcare Provider,\n\nWe're excited to introduce ${keywords[0]}, a new treatment option that addresses ${keywords[1]}.\n\nKey highlights:\n• Proven efficacy in clinical trials\n• Well-tolerated safety profile\n• Simple administration\n\nLearn more at [website]\n\nBest regards,\n${clientName} Medical Team`,
      
      social_media_post: `🔬 New research shows ${keywords[0]} can significantly improve patient outcomes in ${keywords[1]}. Learn how this innovative treatment is changing lives. #MedicalInnovation #PatientCare\n\n👉 Read more: [link]`,
      
      blog_post: `# Understanding ${keywords[0]}: A Comprehensive Guide\n\n## Introduction\n${keywords[0]} has emerged as an important treatment option for patients with ${keywords[1]}...\n\n## How It Works\nThe mechanism of action involves...\n\n## What Patients Should Know\n- Dosing information\n- Potential benefits\n- Important safety information\n\n## Conclusion\nTalk to your healthcare provider to see if ${keywords[0]} is right for you.`
    }
    
    return templates[type] || `Generated content for ${type} using keywords: ${keywords.join(', ')}`
  }

  const handleCopy = async (content: string, id: string) => {
    await navigator.clipboard.writeText(content)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleSaveToLibrary = async (content: GeneratedContent) => {
    // In real app, save to content library
    console.log('Saving to content library:', content)
    alert('Content saved to library!')
  }

  const toggleContentType = (typeId: string) => {
    const newSelected = new Set(selectedTypes)
    if (newSelected.has(typeId)) {
      newSelected.delete(typeId)
    } else {
      newSelected.add(typeId)
    }
    setSelectedTypes(newSelected)
  }

  if (!selectedKeywords.length) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-gray-500 mb-4">No keywords selected for content generation</p>
          <button
            onClick={() => navigate(-1)}
            className="text-primary-600 hover:text-primary-700"
          >
            Go back to select keywords
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Content Generation</h1>
            <p className="text-sm text-gray-500">
              {decodedClientName} • {selectedKeywords.length} keywords selected
            </p>
          </div>
        </div>
        
        <button
          onClick={() => generateMutation.mutate()}
          disabled={selectedTypes.size === 0 || isGenerating}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Content ({selectedTypes.size})
            </>
          )}
        </button>
      </div>

      {/* Selected Keywords */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Keywords</h3>
        <div className="flex flex-wrap gap-2">
          {selectedKeywords.map((keyword: string, index: number) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-700"
            >
              {keyword}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Content Type Selection */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Select Content Types</h2>
          <div className="space-y-3">
            {contentTypes.map((contentType) => (
              <div
                key={contentType.id}
                className={`bg-white rounded-lg shadow p-4 cursor-pointer transition-all ${
                  selectedTypes.has(contentType.id) 
                    ? 'ring-2 ring-primary-500 bg-primary-50' 
                    : 'hover:shadow-md'
                }`}
                onClick={() => toggleContentType(contentType.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg ${
                    selectedTypes.has(contentType.id)
                      ? 'bg-primary-100 text-primary-600'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {contentType.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{contentType.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">{contentType.description}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                      <span>~{contentType.estimatedWords} words</span>
                      <span>•</span>
                      <span>{contentType.templates.join(', ')}</span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={selectedTypes.has(contentType.id)}
                    onChange={() => {}}
                    className="mt-1"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Generated Content */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900">Generated Content</h2>
          {generatedContent.length === 0 ? (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">Select content types and click generate to create content</p>
            </div>
          ) : (
            <div className="space-y-4">
              {generatedContent.map((content) => (
                <div key={content.id} className="bg-white rounded-lg shadow">
                  <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {contentTypes.find(ct => ct.id === content.type)?.icon}
                      <h3 className="font-medium text-gray-900">{content.title}</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      {content.status === 'generating' ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <>
                          <span className="text-xs text-gray-500">{content.wordCount} words</span>
                          <button
                            onClick={() => handleCopy(content.content, content.id)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Copy to clipboard"
                          >
                            {copiedId === content.id ? (
                              <Check className="h-4 w-4 text-green-600" />
                            ) : (
                              <Copy className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                          <button
                            onClick={() => handleSaveToLibrary(content)}
                            className="p-1 hover:bg-gray-100 rounded"
                            title="Save to library"
                          >
                            <Download className="h-4 w-4 text-gray-400" />
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="p-4">
                    {content.status === 'generating' ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
                      </div>
                    ) : (
                      <div className="prose prose-sm max-w-none">
                        <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">
                          {content.content}
                        </pre>
                      </div>
                    )}
                    {content.keywords.length > 0 && content.status === 'complete' && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Keywords used: {content.keywords.join(', ')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
