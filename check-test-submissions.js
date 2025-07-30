#!/usr/bin/env node

// Script to check for test submissions in the Supabase database
import { createClient } from '@supabase/supabase-js'

// Use the same credentials from .env.local
const supabaseUrl = 'https://ktchrfgkbpaixbiwbieg.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0Y2hyZmdrYnBhaXhiaXdiaWVnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk1MzU2NDIsImV4cCI6MjA0NTExMTY0Mn0.lBCTlkcrxHxFqR2BCnjutXH3WNhT8lKFGBt7LKJV7_E'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function checkTestSubmissions() {
  console.log('🔍 Checking for test submissions in Supabase database...\n')
  
  try {
    // First, try to get the total count of submissions
    console.log('📊 Getting total submission count...')
    const { count: totalCount, error: countError } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
    
    if (countError) {
      console.error('❌ Error getting total count:', countError)
    } else {
      console.log(`✅ Total submissions in database: ${totalCount}\n`)
    }

    // Get recent submissions (last 50)
    console.log('📋 Fetching recent submissions...')
    const { data: recentSubmissions, error: recentError } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, submitter_email, created_at, workflow_stage, priority_level')
      .order('created_at', { ascending: false })
      .limit(50)

    if (recentError) {
      console.error('❌ Error fetching recent submissions:', recentError)
    } else {
      console.log(`✅ Retrieved ${recentSubmissions.length} recent submissions\n`)
      
      if (recentSubmissions.length > 0) {
        console.log('🗂️  Recent submissions:')
        recentSubmissions.forEach((submission, index) => {
          console.log(`${index + 1}. ${submission.product_name} | ${submission.submitter_name} | ${new Date(submission.created_at).toLocaleString()}`)
        })
        console.log('')
      }
    }

    // Look for submissions with "test" in product_name (case insensitive)
    console.log('🔎 Searching for test submissions (product_name contains "test")...')
    const { data: testProducts, error: testProductError } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, submitter_email, created_at, workflow_stage, priority_level')
      .ilike('product_name', '%test%')
      .order('created_at', { ascending: false })

    if (testProductError) {
      console.error('❌ Error searching for test product names:', testProductError)
    } else {
      console.log(`✅ Found ${testProducts.length} submissions with "test" in product_name`)
      if (testProducts.length > 0) {
        console.log('🧪 Test product submissions:')
        testProducts.forEach((submission, index) => {
          console.log(`${index + 1}. "${submission.product_name}" | ${submission.submitter_name} | ${new Date(submission.created_at).toLocaleString()}`)
        })
        console.log('')
      }
    }

    // Look for submissions with "test" in submitter_name (case insensitive)
    console.log('🔎 Searching for test submissions (submitter_name contains "test")...')
    const { data: testSubmitters, error: testSubmitterError } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, submitter_email, created_at, workflow_stage, priority_level')
      .ilike('submitter_name', '%test%')
      .order('created_at', { ascending: false })

    if (testSubmitterError) {
      console.error('❌ Error searching for test submitter names:', testSubmitterError)
    } else {
      console.log(`✅ Found ${testSubmitters.length} submissions with "test" in submitter_name`)
      if (testSubmitters.length > 0) {
        console.log('👤 Test submitter submissions:')
        testSubmitters.forEach((submission, index) => {
          console.log(`${index + 1}. ${submission.submitter_name} | "${submission.product_name}" | ${new Date(submission.created_at).toLocaleString()}`)
        })
        console.log('')
      }
    }

    // Look for submissions with "test" in submitter_email (case insensitive)
    console.log('🔎 Searching for test submissions (submitter_email contains "test")...')
    const { data: testEmails, error: testEmailError } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, submitter_email, created_at, workflow_stage, priority_level')
      .ilike('submitter_email', '%test%')
      .order('created_at', { ascending: false })

    if (testEmailError) {
      console.error('❌ Error searching for test emails:', testEmailError)
    } else {
      console.log(`✅ Found ${testEmails.length} submissions with "test" in submitter_email`)
      if (testEmails.length > 0) {
        console.log('📧 Test email submissions:')
        testEmails.forEach((submission, index) => {
          console.log(`${index + 1}. ${submission.submitter_email} | "${submission.product_name}" | ${new Date(submission.created_at).toLocaleString()}`)
        })
        console.log('')
      }
    }

    // Get submissions from the last 24 hours
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    
    console.log(`🕐 Checking for submissions from the last 24 hours (since ${yesterday.toLocaleString()})...`)
    const { data: recentData, error: recentDataError } = await supabase
      .from('submissions')
      .select('id, product_name, submitter_name, submitter_email, created_at, workflow_stage, priority_level')
      .gte('created_at', yesterday.toISOString())
      .order('created_at', { ascending: false })

    if (recentDataError) {
      console.error('❌ Error fetching recent submissions:', recentDataError)
    } else {
      console.log(`✅ Found ${recentData.length} submissions in the last 24 hours`)
      if (recentData.length > 0) {
        console.log('🕐 Recent submissions:')
        recentData.forEach((submission, index) => {
          console.log(`${index + 1}. "${submission.product_name}" | ${submission.submitter_name} | ${new Date(submission.created_at).toLocaleString()}`)
        })
        console.log('')
      }
    }

    // Check table schema by getting one record
    console.log('📋 Checking table structure...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('submissions')
      .select('*')
      .limit(1)

    if (sampleError) {
      console.error('❌ Error checking table structure:', sampleError)
    } else if (sampleData && sampleData.length > 0) {
      console.log('✅ Table columns available:')
      const columns = Object.keys(sampleData[0]).sort()
      columns.forEach(col => console.log(`  - ${col}`))
      console.log('')
    } else {
      console.log('⚠️  Table exists but has no data to show structure')
    }

  } catch (error) {
    console.error('🔥 Unexpected error:', error)
  }
}

// Run the check
checkTestSubmissions()