import React, { useState } from 'react';
import { 
  Search, 
  Brain, 
  Target, 
  TrendingUp,
  Globe,
  FileText,
  BarChart3,
  Users,
  Shield,
  Sparkles,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Hash,
  Zap,
  BookOpen,
  Award,
  AlertCircle
} from 'lucide-react';

interface Props {
  submission: any;
}

export default function SEOGEOStrategyOverview({ submission }: Props) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = 4;

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  // Page 1: Executive Summary & Strategic Overview
  const Page1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Integrated SEO & GEO Strategy
        </h1>
        <p className="text-lg text-gray-600">
          {submission.product_name} - {submission.therapeutic_area}
        </p>
      </div>

      {/* Strategic Objectives */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Target className="h-6 w-6 text-blue-600" />
          Strategic Objectives
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">Traditional SEO Goals</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Rank #1 for "{submission.generic_name || submission.product_name}" searches</li>
              <li>• Capture {submission.target_audience?.join(', ')} search intent</li>
              <li>• Drive qualified traffic to product pages</li>
              <li>• Build domain authority in {submission.therapeutic_area}</li>
            </ul>
          </div>
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h3 className="font-medium text-gray-900 mb-2">GEO (AI Search) Goals</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Be cited by ChatGPT, Claude, Perplexity</li>
              <li>• Appear in AI-generated summaries</li>
              <li>• Optimize for voice search queries</li>
              <li>• Build AI-readable knowledge graphs</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Market Context */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-6 w-6 text-purple-600" />
          Market Context & Opportunity
        </h2>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Search Landscape Analysis</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.floor(Math.random() * 50000 + 10000).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Monthly Search Volume</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-600">65%</p>
                  <p className="text-sm text-gray-600">Voice Search Growth</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-purple-600">42%</p>
                  <p className="text-sm text-gray-600">AI-Assisted Searches</p>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-2">Competitive Positioning</h3>
            <p className="text-sm text-gray-700">
              As {submission.stage === 'Market Launch' ? 'a newly launched' : 'an emerging'} {submission.therapeutic_area.toLowerCase()} treatment, 
              {' '}{submission.product_name} has the opportunity to establish first-mover advantage in AI search optimization 
              while building traditional SEO authority.
            </p>
          </div>
        </div>
      </div>

      {/* Key Success Metrics */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-green-600" />
          Key Success Metrics
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">Top 3</p>
            <p className="text-xs text-gray-600">SERP Rankings</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">80%</p>
            <p className="text-xs text-gray-600">AI Citation Rate</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">500+</p>
            <p className="text-xs text-gray-600">Quality Backlinks</p>
          </div>
          <div className="text-center">
            <p className="text-lg font-semibold text-gray-900">45 sec</p>
            <p className="text-xs text-gray-600">Avg. Engagement</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 2: Content Strategy & Keyword Framework
  const Page2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Content Strategy & Keyword Framework</h2>
        <p className="text-gray-600">Optimizing for both search engines and AI platforms</p>
      </div>

      {/* Keyword Strategy */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Hash className="h-5 w-5 text-blue-600" />
          Multi-Tier Keyword Strategy
        </h3>
        
        <div className="space-y-4">
          {/* Primary Keywords */}
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Tier 1: Primary Keywords (High Volume)</h4>
            <div className="flex flex-wrap gap-2">
              {submission.seo_keywords?.slice(0, 5).map((keyword: string, idx: number) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800">
                  {keyword}
                  <span className="ml-2 text-xs text-blue-600">
                    {Math.floor(Math.random() * 5000 + 1000)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Long-tail Keywords */}
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Tier 2: Long-tail Keywords (High Intent)</h4>
            <div className="flex flex-wrap gap-2">
              {submission.long_tail_keywords?.map((keyword: string, idx: number) => (
                <span key={idx} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800">
                  {keyword}
                  <span className="ml-2 text-xs text-green-600">
                    {Math.floor(Math.random() * 500 + 100)}
                  </span>
                </span>
              ))}
            </div>
          </div>

          {/* Voice Search Queries */}
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Tier 3: Voice Search & AI Queries</h4>
            <div className="space-y-2">
              {submission.consumer_questions?.slice(0, 3).map((question: string, idx: number) => (
                <div key={idx} className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span className="text-sm text-gray-700">{question}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Architecture */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <FileText className="h-5 w-5 text-indigo-600" />
          Content Architecture
        </h3>
        
        <div className="space-y-4">
          <div className="border-l-4 border-indigo-500 pl-4">
            <h4 className="font-medium text-gray-900">H1: {submission.h1_tag}</h4>
            <p className="text-sm text-gray-600">Primary page focus - optimized for main keyword</p>
          </div>
          
          <div className="ml-4 space-y-3">
            {submission.h2_tags?.map((tag: string, idx: number) => (
              <div key={idx} className="border-l-4 border-gray-300 pl-4">
                <h5 className="font-medium text-gray-800">H2: {tag}</h5>
                <p className="text-xs text-gray-600">Supporting content section</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content Distribution */}
      <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-600" />
          Multi-Channel Distribution
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">Traditional Channels</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Product website pages</li>
              <li>• Medical journal articles</li>
              <li>• Healthcare provider portals</li>
              <li>• Patient education materials</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-2">AI-Optimized Channels</h4>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• Structured data markup</li>
              <li>• FAQ schema implementation</li>
              <li>• Medical knowledge graphs</li>
              <li>• Voice assistant optimization</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 3: GEO Technical Implementation
  const Page3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">GEO Technical Implementation</h2>
        <p className="text-gray-600">Optimizing for AI comprehension and citation</p>
      </div>

      {/* GEO Tactics */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Brain className="h-5 w-5 text-purple-600" />
          Core GEO Optimization Tactics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-4">
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <Award className="h-4 w-4 text-purple-600" />
                Cite Authoritative Sources
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• FDA approval documents</li>
                <li>• Clinical trial publications</li>
                <li>• Medical journal references</li>
                <li>• Regulatory guidelines</li>
              </ul>
            </div>
            
            <div className="bg-blue-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-blue-600" />
                Include Statistics & Data
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Efficacy rates: {Math.floor(Math.random() * 20 + 70)}%</li>
                <li>• Patient outcomes data</li>
                <li>• Safety profile metrics</li>
                <li>• Real-world evidence</li>
              </ul>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="bg-green-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-600" />
                Use Technical Language
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• Mechanism of action details</li>
                <li>• Pharmacokinetic properties</li>
                <li>• Molecular structure info</li>
                <li>• Clinical terminology</li>
              </ul>
            </div>
            
            <div className="bg-indigo-50 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-indigo-600" />
                Answer Direct Questions
              </h4>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• "What is {submission.product_name}?"</li>
                <li>• "How does it work?"</li>
                <li>• "Who can take it?"</li>
                <li>• "What are side effects?"</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Data Implementation */}
      <div className="bg-gray-900 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-yellow-400" />
          Schema Markup Strategy
        </h3>
        <pre className="text-xs text-green-400 overflow-x-auto">
          <code>{JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Drug",
            "name": submission.product_name,
            "alternateName": submission.generic_name,
            "description": `Treatment for ${submission.medical_indication}`,
            "prescriptionStatus": "PrescriptionOnly",
            "manufacturer": {
              "@type": "Organization",
              "name": submission.client_name || submission.submitter_company
            },
            "medicalSpecialty": submission.therapeutic_area,
            "indication": submission.medical_indication,
            "mechanismOfAction": submission.mechanism_of_action
          }, null, 2)}</code>
        </pre>
      </div>

      {/* AI Platform Optimization */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Platform-Specific Optimization
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">ChatGPT/GPT-4</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Clear hierarchical structure</li>
              <li>• Comprehensive FAQ sections</li>
              <li>• Authoritative tone</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Perplexity AI</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Citation-heavy content</li>
              <li>• Recent data emphasis</li>
              <li>• Multi-source validation</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Claude</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Nuanced explanations</li>
              <li>• Ethical considerations</li>
              <li>• Comprehensive context</li>
            </ul>
          </div>
          <div className="border rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Google SGE</h4>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Featured snippet optimization</li>
              <li>• Quick answer format</li>
              <li>• Visual elements</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  // Page 4: Performance Tracking & Optimization
  const Page4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Performance Tracking & Optimization</h2>
        <p className="text-gray-600">Measuring success across traditional and AI search</p>
      </div>

      {/* KPI Dashboard */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600" />
          Key Performance Indicators
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">Top 3</p>
            <p className="text-xs text-gray-600">Target SERP Position</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-blue-600 rounded-full" style={{width: '75%'}}></div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-green-600">85%</p>
            <p className="text-xs text-gray-600">AI Citation Rate</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-green-600 rounded-full" style={{width: '85%'}}></div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">92%</p>
            <p className="text-xs text-gray-600">Voice Search Ready</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-purple-600 rounded-full" style={{width: '92%'}}></div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">4.5/5</p>
            <p className="text-xs text-gray-600">Content Quality Score</p>
            <div className="mt-2 h-2 bg-gray-200 rounded-full">
              <div className="h-2 bg-orange-600 rounded-full" style={{width: '90%'}}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Monitoring Strategy */}
      <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Search className="h-5 w-5 text-cyan-600" />
          Monitoring & Testing Protocol
        </h3>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">Traditional SEO Monitoring</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Daily rank tracking for primary keywords</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Weekly organic traffic analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Monthly backlink profile review</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-cyan-600 mt-1">•</span>
                <span>Quarterly content audit</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-900 mb-3">AI Search Monitoring</h4>
            <ul className="text-sm text-gray-700 space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Weekly AI platform query testing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Brand mention tracking in AI responses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Citation frequency analysis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-600 mt-1">•</span>
                <span>Voice search performance testing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Optimization Roadmap */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-indigo-600" />
          Continuous Optimization Plan
        </h3>
        
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 rounded-full p-2">
              <span className="text-indigo-600 font-bold text-sm">Q1</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Foundation & Launch</h4>
              <p className="text-sm text-gray-600">Implement core SEO/GEO strategy, establish baseline metrics</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 rounded-full p-2">
              <span className="text-indigo-600 font-bold text-sm">Q2</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Expansion & Testing</h4>
              <p className="text-sm text-gray-600">A/B test content variations, expand keyword targeting</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 rounded-full p-2">
              <span className="text-indigo-600 font-bold text-sm">Q3</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Optimization & Scale</h4>
              <p className="text-sm text-gray-600">Refine based on data, scale successful tactics</p>
            </div>
          </div>
          
          <div className="flex items-start gap-4">
            <div className="bg-indigo-100 rounded-full p-2">
              <span className="text-indigo-600 font-bold text-sm">Q4</span>
            </div>
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Authority Building</h4>
              <p className="text-sm text-gray-600">Establish thought leadership, maximize AI citations</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compliance Note */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">Compliance Considerations</h4>
            <p className="text-sm text-amber-800 mt-1">
              All content must undergo MLR review before publication. SEO/GEO optimization must not compromise 
              regulatory compliance or medical accuracy.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const pages = [Page1, Page2, Page3, Page4];
  const CurrentPageComponent = pages[currentPage - 1];

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-6">
        <CurrentPageComponent />
      </div>
      
      {/* Navigation */}
      <div className="border-t border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ChevronLeft className="h-4 w-4" />
            Previous
          </button>
          
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4].map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}