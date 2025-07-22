import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SEOAutomationRequest {
  submissionId: string
  action: 'generate_content' | 'analyze_competitors' | 'optimize_geo' | 'full_automation'
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    const { submissionId, action } = await req.json() as SEOAutomationRequest

    // Get submission details
    const { data: submission, error: fetchError } = await supabase
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError) throw fetchError

    let result = {}

    switch (action) {
      case 'generate_content':
        result = await generateSEOContent(submission, supabase)
        break
      case 'analyze_competitors':
        result = await analyzeCompetitors(submission, supabase)
        break
      case 'optimize_geo':
        result = await optimizeForGEO(submission, supabase)
        break
      case 'full_automation':
      default:
        result = await runFullAutomation(submission, supabase)
        break
    }

    return new Response(
      JSON.stringify({ success: true, result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('SEO Automation Error:', error)
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})

async function generateSEOContent(submission: any, supabase: any) {
  // Generate SEO-optimized content based on submission data
  const seoContent = {
    title: generateSEOTitle(submission),
    metaDescription: generateMetaDescription(submission),
    h1Tag: submission.product_name + ' - ' + submission.therapeutic_area,
    h2Tags: generateH2Tags(submission),
    keywords: generateKeywords(submission),
    longTailKeywords: generateLongTailKeywords(submission),
    content: generateOptimizedContent(submission)
  }

  // Update submission with generated content
  const { error } = await supabase
    .from('submissions')
    .update({
      seo_title: seoContent.title,
      meta_title: seoContent.title,
      meta_description: seoContent.metaDescription,
      h1_tag: seoContent.h1Tag,
      h2_tags: seoContent.h2Tags,
      seo_keywords: seoContent.keywords,
      long_tail_keywords: seoContent.longTailKeywords,
      seo_strategy_outline: seoContent.content,
      updated_at: new Date().toISOString()
    })
    .eq('id', submission.id)

  if (error) throw error

  // Log the automation
  await logAutomation(supabase, submission.id, 'generate_content', 'completed', seoContent)

  return seoContent
}

async function analyzeCompetitors(submission: any, supabase: any) {
  // Simulate competitor analysis
  const competitorData = {
    topCompetitors: [
      { name: 'Competitor A', domainAuthority: 85, keywordOverlap: 65 },
      { name: 'Competitor B', domainAuthority: 78, keywordOverlap: 45 },
      { name: 'Competitor C', domainAuthority: 72, keywordOverlap: 55 }
    ],
    keywordGaps: [
      submission.product_name + ' reviews',
      submission.product_name + ' vs competitors',
      submission.therapeutic_area + ' treatment comparison'
    ],
    contentGaps: [
      'Patient testimonials',
      'Clinical trial detailed results',
      'Side effects comparison chart'
    ],
    recommendations: [
      'Create comparison content with top competitors',
      'Target long-tail keywords with lower competition',
      'Develop patient-focused content sections'
    ]
  }

  // Store competitive analysis
  const { error } = await supabase
    .from('submissions')
    .update({
      competitive_analysis: competitorData,
      updated_at: new Date().toISOString()
    })
    .eq('id', submission.id)

  if (error) throw error

  await logAutomation(supabase, submission.id, 'analyze_competitors', 'completed', competitorData)

  return competitorData
}

async function optimizeForGEO(submission: any, supabase: any) {
  // Generate GEO optimization data
  const geoOptimization = {
    ai_friendly_summary: generateAISummary(submission),
    structured_data: generateStructuredData(submission),
    key_facts: generateKeyFacts(submission),
    featured_snippet_potential: true,
    readability_score: 85 + Math.floor(Math.random() * 15)
  }

  // Calculate GEO score
  const geoScore = calculateGEOScore(geoOptimization)

  // Update submission
  const { error } = await supabase
    .from('submissions')
    .update({
      geo_optimization: geoOptimization,
      geo_optimization_score: geoScore,
      geo_readability_score: geoOptimization.readability_score,
      geo_featured_snippet_potential: geoOptimization.featured_snippet_potential,
      updated_at: new Date().toISOString()
    })
    .eq('id', submission.id)

  if (error) throw error

  await logAutomation(supabase, submission.id, 'optimize_geo', 'completed', geoOptimization)

  return { geoOptimization, geoScore }
}

async function runFullAutomation(submission: any, supabase: any) {
  // Run all automation tasks
  const results = {
    content: await generateSEOContent(submission, supabase),
    competitors: await analyzeCompetitors(submission, supabase),
    geo: await optimizeForGEO(submission, supabase)
  }

  // Update workflow stage
  const { error } = await supabase
    .from('submissions')
    .update({
      workflow_stage: 'seo_review',
      langchain_status: 'seo_review',
      updated_at: new Date().toISOString()
    })
    .eq('id', submission.id)

  if (error) throw error

  await logAutomation(supabase, submission.id, 'full_automation', 'completed', results)

  return results
}

// Helper functions
function generateSEOTitle(submission: any): string {
  const title = `${submission.product_name} - ${submission.therapeutic_area} Treatment | ${new Date().getFullYear()}`
  return title.substring(0, 60)
}

function generateMetaDescription(submission: any): string {
  const description = `Learn about ${submission.product_name} for ${submission.therapeutic_area}. ${submission.medical_indication || 'Innovative treatment solution'}. Expert insights and patient information.`
  return description.substring(0, 160)
}

function generateH2Tags(submission: any): string[] {
  return [
    `What is ${submission.product_name}?`,
    `How ${submission.product_name} Works`,
    `Benefits of ${submission.product_name}`,
    `${submission.product_name} Clinical Studies`,
    `Who Should Consider ${submission.product_name}?`,
    `${submission.product_name} Safety Information`
  ]
}

function generateKeywords(submission: any): string[] {
  return [
    submission.product_name.toLowerCase(),
    submission.therapeutic_area.toLowerCase(),
    `${submission.product_name} ${submission.therapeutic_area}`.toLowerCase(),
    `${submission.therapeutic_area} treatment`.toLowerCase(),
    `${submission.therapeutic_area} medication`.toLowerCase()
  ]
}

function generateLongTailKeywords(submission: any): string[] {
  return [
    `what is ${submission.product_name}`.toLowerCase(),
    `${submission.product_name} side effects`.toLowerCase(),
    `${submission.product_name} dosage`.toLowerCase(),
    `${submission.product_name} clinical trials`.toLowerCase(),
    `${submission.product_name} patient reviews`.toLowerCase(),
    `is ${submission.product_name} right for me`.toLowerCase()
  ]
}

function generateOptimizedContent(submission: any): string {
  return `
# SEO Strategy for ${submission.product_name}

## Target Audience
${submission.target_audience?.join(', ') || 'Healthcare Professionals'}

## Content Pillars
1. Educational content about ${submission.therapeutic_area}
2. ${submission.product_name} mechanism of action
3. Clinical evidence and studies
4. Patient success stories
5. Comparison with alternatives

## Key Messages
- ${submission.key_differentiators?.join('\n- ') || 'Innovative treatment solution'}

## Content Calendar
- Monthly blog posts on ${submission.therapeutic_area} topics
- Quarterly webinars for healthcare professionals
- Patient testimonial series
- Clinical data updates
  `
}

function generateAISummary(submission: any): string {
  return `${submission.product_name} is a ${submission.therapeutic_area} treatment that ${submission.mechanism_of_action || 'provides innovative therapy'}. Key benefits include ${submission.key_differentiators?.join(', ') || 'improved patient outcomes'}.`
}

function generateStructuredData(submission: any): any {
  return {
    "@context": "https://schema.org",
    "@type": "Drug",
    "name": submission.product_name,
    "alternateName": submission.product_name.toLowerCase(),
    "description": submission.medical_indication,
    "mechanismOfAction": submission.mechanism_of_action,
    "medicineSystem": "WesternConventional",
    "prescriptionStatus": "PrescriptionOnly"
  }
}

function generateKeyFacts(submission: any): string[] {
  return [
    `${submission.product_name} treats ${submission.therapeutic_area}`,
    `Mechanism: ${submission.mechanism_of_action || 'Targeted therapy'}`,
    `Key benefit: ${submission.key_differentiators?.[0] || 'Improved efficacy'}`,
    `Administration: ${submission.dosage_form || 'As prescribed by physician'}`
  ]
}

function calculateGEOScore(geoOptimization: any): number {
  let score = 70 // Base score
  if (geoOptimization.ai_friendly_summary) score += 10
  if (geoOptimization.structured_data) score += 10
  if (geoOptimization.key_facts?.length > 3) score += 5
  if (geoOptimization.featured_snippet_potential) score += 5
  return Math.min(score, 100)
}

async function logAutomation(supabase: any, submissionId: string, type: string, status: string, details: any) {
  await supabase
    .from('seo_automation_logs')
    .insert({
      submission_id: submissionId,
      automation_type: type,
      status: status,
      details: details,
      completed_at: new Date().toISOString()
    })
}
