// Supabase Edge Function for FDA API integration and webhook processing
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    const { submissionId, fdaQuery } = await req.json()

    // Fetch FDA data from multiple endpoints
    const fdaEndpoints = [
      'https://api.fda.gov/drug/label.json',
      'https://api.fda.gov/drug/event.json',
      'https://api.fda.gov/drug/enforcement.json',
      'https://api.fda.gov/drug/ndc.json'
    ]

    const fdaResults = {}
    
    for (const endpoint of fdaEndpoints) {
      try {
        const response = await fetch(`${endpoint}?search=${encodeURIComponent(fdaQuery)}&limit=10`)
        if (response.ok) {
          const data = await response.json()
          const endpointName = endpoint.split('/').pop()?.replace('.json', '')
          fdaResults[endpointName] = data.results || []
        }
      } catch (error) {
        console.error(`Error fetching from ${endpoint}:`, error)
      }
    }

    // Calculate FDA data quality score
    const dataQualityScore = calculateFdaDataQuality(fdaResults)

    // Update submission with FDA data
    const { error } = await supabaseClient
      .from('submissions')
      .update({
        fda_comprehensive_data: fdaResults,
        fda_data_quality_score: dataQualityScore,
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    if (error) {
      throw error
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        fdaData: fdaResults,
        qualityScore: dataQualityScore
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})

function calculateFdaDataQuality(fdaResults: any): number {
  let score = 0
  let maxScore = 0

  // Score based on data availability across endpoints
  const endpoints = ['label', 'event', 'enforcement', 'ndc']
  
  endpoints.forEach(endpoint => {
    maxScore += 25
    if (fdaResults[endpoint] && fdaResults[endpoint].length > 0) {
      score += 25
      // Bonus for rich data
      if (fdaResults[endpoint].length > 5) score += 5
    }
  })

  return Math.min(100, Math.round((score / maxScore) * 100))
}