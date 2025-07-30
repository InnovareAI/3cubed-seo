// Supabase Edge Function for AI compliance scoring
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

    const { submissionId } = await req.json()

    // Fetch submission data
    const { data: submission, error: fetchError } = await supabaseClient
      .from('submissions')
      .select('*')
      .eq('id', submissionId)
      .single()

    if (fetchError) throw fetchError

    // Perform compliance analysis
    const complianceResults = analyzeCompliance(submission)

    // Update submission with compliance data
    const { error: updateError } = await supabaseClient
      .from('submissions')
      .update({
        qa_score: complianceResults.overallScore,
        qa_feedback: complianceResults.feedback,
        qa_status: complianceResults.status,
        medical_accuracy_score: complianceResults.medicalAccuracy,
        legal_risk_assessment: complianceResults.legalRisk,
        mlr_compliance_checklist: complianceResults.mlrChecklist,
        qa_completion_date: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', submissionId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        success: true,
        compliance: complianceResults
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

function analyzeCompliance(submission: any) {
  const scores = {
    medical: 0,
    legal: 0,
    regulatory: 0,
    claims: 0
  }

  const feedback = []
  const mlrChecklist = {}

  // Medical accuracy assessment
  if (submission.mechanism_of_action) {
    scores.medical += 25
    mlrChecklist['mechanism_described'] = true
  } else {
    feedback.push('Missing mechanism of action description')
    mlrChecklist['mechanism_described'] = false
  }

  if (submission.clinical_benefits) {
    scores.medical += 25
    mlrChecklist['clinical_benefits_documented'] = true
  } else {
    feedback.push('Clinical benefits not documented')
    mlrChecklist['clinical_benefits_documented'] = false
  }

  // Legal compliance check
  if (submission.regulatory_disclaimers) {
    scores.legal += 30
    mlrChecklist['disclaimers_present'] = true
  } else {
    feedback.push('Missing regulatory disclaimers')
    mlrChecklist['disclaimers_present'] = false
  }

  if (submission.black_box_warnings) {
    scores.legal += 20
    mlrChecklist['warnings_documented'] = true
  }

  // Regulatory compliance
  if (submission.fda_ema_approval_status && Object.keys(submission.fda_ema_approval_status).length > 0) {
    scores.regulatory += 25
    mlrChecklist['approval_status_verified'] = true
  } else {
    feedback.push('FDA/EMA approval status needs verification')
    mlrChecklist['approval_status_verified'] = false
  }

  // Claims substantiation
  if (submission.claim_substantiation && submission.claim_substantiation.length > 0) {
    scores.claims += 25
    mlrChecklist['claims_substantiated'] = true
  } else {
    feedback.push('Claims require substantiation')
    mlrChecklist['claims_substantiated'] = false
  }

  const overallScore = Math.round((scores.medical + scores.legal + scores.regulatory + scores.claims) / 4)
  
  let status = 'needs_review'
  if (overallScore >= 90) status = 'approved'
  else if (overallScore >= 70) status = 'conditional_approval'
  else status = 'rejected'

  return {
    overallScore,
    medicalAccuracy: scores.medical,
    legalRisk: 100 - scores.legal, // Higher legal score = lower risk
    status,
    feedback: feedback.join('; '),
    mlrChecklist
  }
}