import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { 
  Send,
  Bot, 
  User,
  AlertTriangle,
  CheckCircle,
  FileText,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react'

interface QAMessage {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  complianceLevel?: 'safe' | 'warning' | 'high-risk'
  sources?: string[]
  confidence?: number
}

interface ComplianceCategory {
  id: string
  name: string
  description: string
  questions: string[]
}

const categories: ComplianceCategory[] = [
  {
    id: 'fda-claims',
    name: 'FDA Claims & Labeling',
    description: 'Questions about FDA-approved claims and off-label discussions',
    questions: [
      'Is this claim FDA-approved for our product?',
      'Can we mention off-label uses in this context?',
      'What disclaimers are required for this statement?'
    ]
  },
  {
    id: 'promotional',
    name: 'Promotional Guidelines',
    description: 'Rules for promotional materials and fair balance',
    questions: [
      'Does this content meet fair balance requirements?',
      'Are we required to include ISI with this material?',
      'Is this considered promotional or educational?'
    ]
  },
  {
    id: 'hcp-communication',
    name: 'HCP Communications',
    description: 'Guidelines for healthcare provider communications',
    questions: [
      'Can we share this clinical data with HCPs?',
      'What restrictions apply to speaker programs?',
      'How should we handle unsolicited requests?'
    ]
  },
  {
    id: 'patient-materials',
    name: 'Patient Materials',
    description: 'Rules for direct-to-patient communications',
    questions: [
      'Is this language appropriate for patient audiences?',
      'Do we need to include medication guides?',
      'What patient assistance information can we provide?'
    ]
  },
  {
    id: 'digital-social',
    name: 'Digital & Social Media',
    description: 'Compliance for digital channels and social media',
    questions: [
      'What are the requirements for social media posts?',
      'How do we handle adverse event reporting online?',
      'Can we use patient testimonials on our website?'
    ]
  }
]

const mockMessages: QAMessage[] = [
  {
    id: '1',
    role: 'system',
    content: 'Welcome to the Pharma Compliance Q&A Agent. I can help answer questions about FDA regulations, promotional guidelines, and compliance requirements. How can I assist you today?',
    timestamp: new Date().toISOString()
  }
]

export default function Compliance() {
  const [messages, setMessages] = useState<QAMessage[]>(mockMessages)
  const [input, setInput] = useState('')
  // const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  const [isTyping, setIsTyping] = useState(false)

  // Simulate AI response
  const sendMessageMutation = useMutation({
    mutationFn: async (message: string) => {
      // Add user message
      const userMessage: QAMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: message,
        timestamp: new Date().toISOString()
      }
      
      setMessages(prev => [...prev, userMessage])
      setIsTyping(true)
      
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Generate mock response
      const response = generateComplianceResponse(message)
      
      setMessages(prev => [...prev, response])
      setIsTyping(false)
    }
  })

  const generateComplianceResponse = (query: string): QAMessage => {
    const lowerQuery = query.toLowerCase()
    
    let content = ''
    let complianceLevel: 'safe' | 'warning' | 'high-risk' = 'safe'
    let sources: string[] = []
    let confidence = 0.95
    
    if (lowerQuery.includes('off-label')) {
      content = `Regarding off-label use discussions:

**Key Requirements:**
- Off-label information can be shared in response to unsolicited requests
- Must be separate from promotional materials
- Requires clear disclaimers about FDA approval status

**Recommended Approach:**
1. Clearly state the FDA-approved indications first
2. Use disclaimer: "The following use is not FDA-approved"
3. Provide balanced scientific information
4. Document the unsolicited nature of the request

**Warning:** Proactive promotion of off-label uses is prohibited and can result in FDA warning letters.`
      
      complianceLevel = 'warning'
      sources = ['FDA Guidance on Off-Label Communications', '21 CFR 99.103']
      confidence = 0.92
    } else if (lowerQuery.includes('fair balance')) {
      content = `Fair balance requirements for promotional materials:

**Core Principle:** Risk information must be presented with comparable prominence to benefit claims.

**Requirements:**
- Same font size and style for risks and benefits
- Similar placement and visibility
- Equal time/space in broadcast materials
- Clear, consumer-friendly language

**Best Practices:**
1. Place major risks adjacent to major claims
2. Use headers like "Important Safety Information"
3. Avoid minimizing risk presentation
4. Test materials with target audience

**Note:** Fair balance applies to all promotional pieces, including digital and social media.`
      
      complianceLevel = 'safe'
      sources = ['FDA Fair Balance Guidance', 'PhRMA Code']
      confidence = 0.98
    } else if (lowerQuery.includes('social media')) {
      content = `Social media compliance requirements:

**Platform Considerations:**
- Character limits don't exempt from regulations
- Each post must stand alone compliantly
- Links to full prescribing information required

**Key Requirements:**
1. Include proprietary and generic names
2. Major risk disclosure or link to it
3. Report adverse events within 24 hours
4. Monitor and moderate comments

**High Risk Areas:**
- User-generated content
- Influencer partnerships
- Employee personal accounts
- Retweeting/sharing content

Always pre-approve social content through MLR review.`
      
      complianceLevel = 'warning'
      sources = ['FDA Social Media Guidance 2014', 'FDA Internet/Social Media Q&A']
      confidence = 0.90
    } else {
      content = `I understand you're asking about "${query}". 

To provide the most accurate compliance guidance, I need more specific information. Here are some areas I can help with:

1. **FDA Claims & Labeling** - Approved vs. off-label uses
2. **Promotional Materials** - Fair balance and ISI requirements
3. **HCP Communications** - Scientific exchange guidelines
4. **Patient Materials** - DTC regulations and health literacy
5. **Digital Compliance** - Website, email, and social media rules

Please select a category or ask a more specific question. You can also reference specific content for review.

Remember: When in doubt, always consult with your Legal/Regulatory team for final approval.`
      
      complianceLevel = 'safe'
      confidence = 0.85
    }
    
    return {
      id: `msg-${Date.now()}-response`,
      role: 'assistant',
      content,
      timestamp: new Date().toISOString(),
      complianceLevel,
      sources,
      confidence
    }
  }

  const handleSend = () => {
    if (input.trim()) {
      sendMessageMutation.mutate(input)
      setInput('')
    }
  }

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const getComplianceBadge = (level?: string) => {
    switch (level) {
      case 'safe':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
            <CheckCircle className="h-3 w-3" />
            Low Risk
          </span>
        )
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Caution Advised
          </span>
        )
      case 'high-risk':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700">
            <AlertTriangle className="h-3 w-3" />
            High Risk
          </span>
        )
      default:
        return null
    }
  }

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      {/* Categories Sidebar */}
      <div className="w-80 bg-white rounded-lg shadow overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Compliance Topics</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg">
              <button
                onClick={() => toggleCategory(category.id)}
                className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50"
              >
                <div className="text-left">
                  <h3 className="font-medium text-gray-900">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.description}</p>
                </div>
                {expandedCategories.has(category.id) ? (
                  <ChevronUp className="h-5 w-5 text-gray-400" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                )}
              </button>
              {expandedCategories.has(category.id) && (
                <div className="px-4 pb-3 space-y-2">
                  {category.questions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      className="w-full text-left text-sm text-gray-600 hover:text-primary-600 py-1"
                    >
                      • {question}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Interface */}
      <div className="flex-1 bg-white rounded-lg shadow flex flex-col">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <Bot className="h-5 w-5 text-primary-600" />
            </div>
            <div>
              <h1 className="text-lg font-medium text-gray-900">Compliance Q&A Agent</h1>
              <p className="text-sm text-gray-500">FDA & Pharma Regulatory Guidance</p>
            </div>
          </div>
          <button className="p-2 hover:bg-gray-100 rounded-lg">
            <RefreshCw className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {message.role !== 'user' && (
                <div className="flex-shrink-0">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <Bot className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              )}
              
              <div className={`max-w-2xl ${message.role === 'user' ? 'order-1' : ''}`}>
                <div className={`rounded-lg px-4 py-3 ${
                  message.role === 'user' 
                    ? 'bg-primary-600 text-white' 
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <div className="prose prose-sm max-w-none">
                    <div dangerouslySetInnerHTML={{ 
                      __html: message.content.replace(/\n/g, '<br />').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') 
                    }} />
                  </div>
                </div>
                
                {message.role === 'assistant' && (
                  <div className="mt-2 space-y-2">
                    {message.complianceLevel && (
                      <div className="flex items-center gap-2">
                        {getComplianceBadge(message.complianceLevel)}
                        {message.confidence && (
                          <span className="text-xs text-gray-500">
                            {Math.round(message.confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                    )}
                    {message.sources && message.sources.length > 0 && (
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <FileText className="h-3 w-3" />
                        Sources: {message.sources.join(', ')}
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              {message.role === 'user' && (
                <div className="flex-shrink-0 order-2">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <User className="h-5 w-5 text-gray-600" />
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="flex gap-3">
              <div className="p-2 bg-gray-100 rounded-lg">
                <Bot className="h-5 w-5 text-gray-600" />
              </div>
              <div className="bg-gray-100 rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                  <div className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-6 py-4 border-t border-gray-200">
          <form onSubmit={(e) => { e.preventDefault(); handleSend() }} className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a compliance question..."
              className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              disabled={sendMessageMutation.isPending}
            />
            <button
              type="submit"
              disabled={!input.trim() || sendMessageMutation.isPending}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="h-4 w-4" />
              Send
            </button>
          </form>
          <p className="mt-2 text-xs text-gray-500">
            This AI assistant provides general compliance guidance. Always verify with Legal/Regulatory for final approval.
          </p>
        </div>
      </div>
    </div>
  )
}
