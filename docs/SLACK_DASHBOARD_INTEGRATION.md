# Slack Error Notifications & Dashboard Mapping

## Overview
Add operational monitoring with Slack error notifications and comprehensive dashboard mapping for the FDA-enhanced pharmaceutical SEO content generation system.

---

## 🚨 **SLACK ERROR NOTIFICATION MODULE**

### **Slack Integration Strategy**
Add Slack notification nodes to critical failure points in the n8n workflow to ensure immediate awareness of system issues.

### **Key Error Points to Monitor**
1. **FDA API Failures** - When all FDA database calls fail
2. **Perplexity Generation Errors** - Content generation failures
3. **Claude QA Failures** - Quality assurance processing errors
4. **Database Update Failures** - Supabase write errors
5. **Webhook Timeout Issues** - System performance problems

### **Slack Webhook Setup**
```javascript
// Slack Webhook URL (to be configured)
const SLACK_WEBHOOK_URL = "https://hooks.slack.com/services/YOUR/SLACK/WEBHOOK";

// Error notification template
const slackErrorPayload = {
  channel: "#pharma-seo-alerts",
  username: "3cubed-SEO-Bot",
  icon_emoji: ":warning:",
  attachments: [{
    color: "danger",
    title: "🚨 Pharmaceutical SEO System Error",
    fields: [
      {
        title: "Error Type",
        value: errorType,
        short: true
      },
      {
        title: "Submission ID", 
        value: submissionId,
        short: true
      },
      {
        title: "Product Name",
        value: productName,
        short: true
      },
      {
        title: "Timestamp",
        value: new Date().toISOString(),
        short: true
      },
      {
        title: "Error Details",
        value: errorMessage,
        short: false
      },
      {
        title: "N8N Execution",
        value: `https://innovareai.app.n8n.cloud/executions/${executionId}`,
        short: false
      }
    ]
  }]
};
```

### **N8N Slack Error Nodes**

#### **1. FDA API Error Handler**
```javascript
// Node: FDA Error Alert
const submission = $node['FDA Data Enrichment'].json;
const error = $input.all()[0].json;

const slackPayload = {
  text: "🚨 FDA API Integration Error",
  attachments: [{
    color: "danger",
    fields: [
      {
        title: "Product",
        value: submission.record?.product_name || "Unknown",
        short: true
      },
      {
        title: "Submission ID",
        value: submission.submission_id,
        short: true
      },
      {
        title: "FDA APIs Failed",
        value: "All 6 FDA databases unreachable",
        short: false
      },
      {
        title: "Action Required",
        value: "Check FDA API status and rate limits",
        short: false
      },
      {
        title: "Workflow",
        value: "Continuing with standard content generation",
        short: false
      }
    ]
  }]
};

return { json: slackPayload };
```

#### **2. Content Generation Error Handler**
```javascript
// Node: Perplexity Error Alert
const submission = $node['FDA Data Enrichment'].json;
const error = $input.all()[0].json;

const slackPayload = {
  text: "🚨 Content Generation Failed",
  attachments: [{
    color: "danger",
    fields: [
      {
        title: "Product",
        value: submission.record?.product_name || "Unknown",
        short: true
      },
      {
        title: "Error Type",
        value: "Perplexity API Failure",
        short: true
      },
      {
        title: "Possible Causes",
        value: "• API credits exhausted\\n• Rate limit exceeded\\n• Model unavailable",
        short: false
      },
      {
        title: "Action Required",
        value: "Check Perplexity API status and credits",
        short: false
      }
    ]
  }]
};

return { json: slackPayload };
```

#### **3. QA Review Error Handler**
```javascript
// Node: QA Error Alert
const submission = $node['Parse Perplexity Response'].json;
const error = $input.all()[0].json;

const slackPayload = {
  text: "🚨 QA Review System Error",
  attachments: [{
    color: "warning",
    fields: [
      {
        title: "Product",
        value: submission.record?.product_name || "Unknown",
        short: true
      },
      {
        title: "Error Type", 
        value: "Claude QA Processing Failed",
        short: true
      },
      {
        title: "Content Status",
        value: "Generated but not QA validated",
        short: false
      },
      {
        title: "Action Required",
        value: "Manual QA review required",
        short: false
      }
    ]
  }]
};

return { json: slackPayload };
```

#### **4. Database Error Handler**
```javascript
// Node: Database Error Alert  
const submission = $node['Parse QA Response'].json;
const error = $input.all()[0].json;

const slackPayload = {
  text: "🚨 Database Update Failed",
  attachments: [{
    color: "danger",
    fields: [
      {
        title: "Product",
        value: submission.record?.product_name || "Unknown",
        short: true
      },
      {
        title: "Error Type",
        value: "Supabase Write Failure",
        short: true
      },
      {
        title: "Data Status",
        value: "Content generated but not saved",
        short: false
      },
      {
        title: "Action Required",
        value: "Check Supabase connectivity and permissions",
        short: false
      }
    ]
  }]
};

return { json: slackPayload };
```

---

## 📊 **DASHBOARD OUTPUT MAPPING**

### **Database Schema for Dashboard**
```sql
-- Add dashboard-specific fields to submissions table
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS dashboard_data JSONB;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS content_status VARCHAR(50);
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS qa_completion_date TIMESTAMP;
ALTER TABLE submissions ADD COLUMN IF NOT EXISTS fda_data_quality_score INTEGER;

-- Create dashboard view for optimized queries
CREATE OR REPLACE VIEW dashboard_submissions AS
SELECT 
  id,
  product_name,
  generic_name,
  therapeutic_area,
  indication,
  submitter_name,
  submitter_email,
  created_at,
  
  -- Content Status
  ai_processing_status,
  workflow_stage,
  content_status,
  qa_status,
  qa_score,
  qa_completion_date,
  
  -- SEO Content
  meta_title,
  meta_description,
  seo_keywords,
  
  -- AI Generated Content  
  ai_generated_content,
  
  -- FDA Enrichment Data
  fda_comprehensive_data,
  fda_data_sources,
  fda_enrichment_timestamp,
  fda_data_quality_score,
  
  -- Dashboard Metrics
  dashboard_data,
  last_updated
FROM submissions
ORDER BY created_at DESC;
```

### **Dashboard Data Structure**
```javascript
// Node: Prepare Dashboard Data
const submission = $node['Parse QA Response'].json;
const fdaData = submission.record?.fda_comprehensive_data || {};
const aiContent = submission.ai_content || '';
const qaResults = submission;

// Parse structured content sections
const structuredContent = submission.structured_sections || {};

// Calculate FDA data quality score
const fdaDataScore = calculateFDAQualityScore(fdaData);

// Prepare comprehensive dashboard data
const dashboardData = {
  // Content Metrics
  content_metrics: {
    word_count: aiContent.split(' ').length,
    title_length: structuredContent.title_tag?.length || 0,
    meta_description_length: structuredContent.meta_description?.length || 0,
    keyword_count: structuredContent.keywords?.length || 0,
    has_schema_markup: !!structuredContent.schema_markup
  },
  
  // FDA Integration Status
  fda_integration: {
    databases_queried: fdaData ? Object.keys(fdaData).filter(key => fdaData[key] !== null).length : 0,
    clinical_trial_found: !!fdaData?.clinical_trial_data,
    approval_data_found: !!fdaData?.drug_approval_data,
    labeling_data_found: !!fdaData?.drug_labeling_data,
    safety_data_found: !!fdaData?.adverse_events_data || !!fdaData?.recall_data,
    nct_verified: !!fdaData?.clinical_trial_data?.nct_id,
    quality_score: fdaDataScore
  },
  
  // QA Assessment
  qa_assessment: {
    overall_score: qaResults.qa_score || 0,
    compliance_score: qaResults.compliance_score || 0,
    medical_accuracy: qaResults.medical_accuracy || 0,
    seo_effectiveness: qaResults.seo_effectiveness || 0,
    critical_issues_count: qaResults.critical_issues?.length || 0,
    required_changes_count: qaResults.required_changes?.length || 0,
    recommendation: qaResults.recommendation || 'PENDING'
  },
  
  // Processing Timeline
  processing_timeline: {
    submission_time: submission.record?.created_at,
    fda_enrichment_time: submission.record?.fda_enrichment_timestamp,
    content_generation_time: new Date().toISOString(),
    qa_completion_time: qaResults.processing_metadata?.qa_timestamp,
    total_processing_seconds: calculateProcessingTime(submission.record?.created_at)
  },
  
  // Content Structure Analysis
  content_structure: {
    sections_count: countContentSections(aiContent),
    question_headings_count: countQuestionHeadings(aiContent),
    bullet_points_count: countBulletPoints(aiContent),
    clinical_references_count: countClinicalReferences(aiContent),
    fda_references_count: countFDAReferences(aiContent)
  }
};

// Helper functions
function calculateFDAQualityScore(fdaData) {
  if (!fdaData) return 0;
  
  let score = 0;
  if (fdaData.clinical_trial_data) score += 40;
  if (fdaData.drug_approval_data) score += 30;
  if (fdaData.drug_labeling_data) score += 20;
  if (fdaData.adverse_events_data || fdaData.recall_data) score += 10;
  
  return score;
}

function calculateProcessingTime(startTime) {
  if (!startTime) return null;
  const start = new Date(startTime);
  const now = new Date();
  return Math.round((now - start) / 1000);
}

function countContentSections(content) {
  return (content.match(/###\s/g) || []).length;
}

function countQuestionHeadings(content) {
  return (content.match(/\?\s*$/gm) || []).length;
}

function countBulletPoints(content) {
  return (content.match(/^\s*[-•]\s/gm) || []).length;
}

function countClinicalReferences(content) {
  return (content.match(/NCT\d{8}/g) || []).length;
}

function countFDAReferences(content) {
  return (content.match(/FDA|BLA|NDA|IND/g) || []).length;
}

return {
  ...submission,
  dashboard_data: dashboardData,
  content_status: qaResults.recommendation === 'PASS' ? 'approved' : 'requires_review',
  qa_completion_date: new Date().toISOString(),
  fda_data_quality_score: fdaDataScore
};
```

### **Dashboard UI Components**

#### **1. Content Status Card**
```javascript
// Dashboard component data structure
const ContentStatusCard = {
  title: "Content Generation Status",
  data: {
    processing_status: submission.ai_processing_status,
    workflow_stage: submission.workflow_stage,
    qa_recommendation: submission.dashboard_data?.qa_assessment?.recommendation,
    overall_score: submission.dashboard_data?.qa_assessment?.overall_score,
    processing_time: submission.dashboard_data?.processing_timeline?.total_processing_seconds
  }
};
```

#### **2. FDA Integration Status**
```javascript
const FDAIntegrationCard = {
  title: "FDA Database Integration",
  data: {
    databases_found: submission.dashboard_data?.fda_integration?.databases_queried,
    clinical_trial: submission.dashboard_data?.fda_integration?.clinical_trial_found,
    approval_data: submission.dashboard_data?.fda_integration?.approval_data_found,
    labeling_data: submission.dashboard_data?.fda_integration?.labeling_data_found,
    nct_verified: submission.dashboard_data?.fda_integration?.nct_verified,
    quality_score: submission.dashboard_data?.fda_integration?.quality_score
  }
};
```

#### **3. SEO Content Metrics**
```javascript
const SEOMetricsCard = {
  title: "SEO Content Quality",
  data: {
    title_tag: submission.meta_title,
    title_length: submission.dashboard_data?.content_metrics?.title_length,
    meta_description: submission.meta_description,
    meta_length: submission.dashboard_data?.content_metrics?.meta_description_length,
    keywords: submission.seo_keywords,
    keyword_count: submission.dashboard_data?.content_metrics?.keyword_count,
    word_count: submission.dashboard_data?.content_metrics?.word_count
  }
};
```

#### **4. QA Assessment Details**
```javascript
const QAAssessmentCard = {
  title: "Quality Assurance Results",
  data: {
    overall_score: submission.qa_score,
    compliance_score: submission.dashboard_data?.qa_assessment?.compliance_score,
    medical_accuracy: submission.dashboard_data?.qa_assessment?.medical_accuracy,
    seo_effectiveness: submission.dashboard_data?.qa_assessment?.seo_effectiveness,
    critical_issues: submission.dashboard_data?.qa_assessment?.critical_issues_count,
    required_changes: submission.dashboard_data?.qa_assessment?.required_changes_count
  }
};
```

### **Real-time Dashboard Updates**
```javascript
// Supabase real-time subscription for dashboard
const subscription = supabase
  .channel('dashboard-updates')
  .on('postgres_changes', 
    { 
      event: 'UPDATE', 
      schema: 'public', 
      table: 'submissions',
      filter: 'workflow_stage=neq.draft'
    }, 
    (payload) => {
      updateDashboardCard(payload.new);
    }
  )
  .subscribe();

function updateDashboardCard(updatedSubmission) {
  // Update UI components with new data
  updateContentStatus(updatedSubmission);
  updateFDAIntegration(updatedSubmission);
  updateSEOMetrics(updatedSubmission);
  updateQAAssessment(updatedSubmission);
}
```

---

## 🔄 **ENHANCED N8N WORKFLOW WITH SLACK & DASHBOARD**

### **Updated Workflow Flow**
```
Webhook → Extract ID → Fetch Data → Validate Phase → 
FDA Enrichment → [FDA Error Handler → Slack Alert] →
Generate Content → [Content Error Handler → Slack Alert] →
Parse Response → Update DB with AI Content →
QA Review → [QA Error Handler → Slack Alert] →
Parse QA → Check Results → 
Update DB with QA Results → Prepare Dashboard Data → 
[DB Error Handler → Slack Alert] → Final Response
```

### **Error Handler Positioning**
- **FDA Error Handler**: After FDA Data Enrichment (if all APIs fail)
- **Content Error Handler**: After Generate Content - Perplexity
- **QA Error Handler**: After QA Review - Claude  
- **DB Error Handler**: After any database update operation

### **Dashboard Data Update Node**
Position: After "Update DB with QA Results", before "Prepare Webhook Response"

This ensures comprehensive operational monitoring and rich dashboard data for the pharmaceutical SEO content generation system.