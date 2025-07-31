export const mockAuditData = [
  {
    id: 'audit-001',
    action: 'Content Approved',
    action_type: 'approval',
    entity_type: 'submission',
    entity_id: 'sub-001',
    entity_name: 'Keytruda NSCLC Campaign',
    performed_by: 'Sarah Johnson',
    performed_by_email: 'sarah.johnson@3cubed.com',
    performed_by_role: 'SEO Specialist',
    timestamp: new Date(Date.now() - 2*60*60*1000).toISOString(),
    details: {
      stage: 'SEO Review',
      approved_items: ['SEO Title', 'Meta Description', 'Keywords', 'H1/H2 Tags'],
      compliance_score: 95,
      notes: 'All SEO elements meet best practices and character limits'
    },
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 'audit-002',
    action: 'Revision Requested',
    action_type: 'revision',
    entity_type: 'submission',
    entity_id: 'sub-002',
    entity_name: 'Ozempic Weight Management',
    performed_by: 'Dr. James Wilson',
    performed_by_email: 'james.wilson@mlr-committee.com',
    performed_by_role: 'MLR Reviewer',
    timestamp: new Date(Date.now() - 5*60*60*1000).toISOString(),
    details: {
      stage: 'MLR Review',
      rejection_reason: 'Clinical claims need peer-reviewed journal citations',
      specific_issues: [
        'Weight loss percentage needs NEJM 2023 reference',
        'Missing adverse event frequency data',
        'Contraindications section incomplete'
      ]
    },
    ip_address: '10.0.0.122',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'audit-003',
    action: 'Content Submitted',
    action_type: 'submission',
    entity_type: 'submission',
    entity_id: 'sub-003',
    entity_name: 'Humira Biosimilar Launch',
    performed_by: 'Mark Chen',
    performed_by_email: 'mark.chen@abbvie.com',
    performed_by_role: 'Product Manager',
    timestamp: new Date(Date.now() - 24*60*60*1000).toISOString(),
    details: {
      therapeutic_area: 'Immunology',
      indication: 'Rheumatoid Arthritis',
      priority: 'High',
      target_launch: 'Q2 2024',
      markets: ['USA', 'EU', 'Canada']
    },
    ip_address: '74.125.24.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 'audit-004',
    action: 'AI Processing Completed',
    action_type: 'ai_processing',
    entity_type: 'submission',
    entity_id: 'sub-003',
    entity_name: 'Humira Biosimilar Launch',
    performed_by: 'System - Claude AI',
    performed_by_email: 'ai@3cubed.com',
    performed_by_role: 'AI Engine',
    timestamp: new Date(Date.now() - 23*60*60*1000).toISOString(),
    details: {
      processing_time: '45 seconds',
      models_used: ['Claude-3', 'Perplexity-API'],
      seo_elements_generated: 15,
      geo_score: 92,
      compliance_checks_passed: 8
    },
    ip_address: 'Internal',
    user_agent: 'N8N-Automation'
  },
  {
    id: 'audit-005',
    action: 'Client Approval',
    action_type: 'approval',
    entity_type: 'submission',
    entity_id: 'sub-004',
    entity_name: 'Cardiolex Heart Failure',
    performed_by: 'Jennifer Martinez',
    performed_by_email: 'j.martinez@cardiotech.com',
    performed_by_role: 'Marketing Director',
    timestamp: new Date(Date.now() - 48*60*60*1000).toISOString(),
    details: {
      stage: 'Client Review',
      brand_compliance: 'Approved',
      messaging_alignment: 'Approved',
      competitive_positioning: 'Approved',
      final_comments: 'Excellent work on highlighting our key differentiators'
    },
    ip_address: '98.234.123.45',
    user_agent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X)'
  },
  {
    id: 'audit-006',
    action: 'Workflow Stage Change',
    action_type: 'workflow_update',
    entity_type: 'submission',
    entity_id: 'sub-005',
    entity_name: 'Neuroplexin Migraine',
    performed_by: 'System',
    performed_by_email: 'system@3cubed.com',
    performed_by_role: 'Automation',
    timestamp: new Date(Date.now() - 72*60*60*1000).toISOString(),
    details: {
      from_stage: 'AI Processing',
      to_stage: 'SEO Review',
      trigger: 'AI completion webhook',
      processing_duration: '2 minutes 15 seconds'
    },
    ip_address: 'Internal',
    user_agent: 'Supabase-Webhook'
  },
  {
    id: 'audit-007',
    action: 'Export Generated',
    action_type: 'export',
    entity_type: 'report',
    entity_id: 'report-001',
    entity_name: 'Q4 2023 SEO Performance Report',
    performed_by: 'Tom Anderson',
    performed_by_email: 'tom.anderson@3cubed.com',
    performed_by_role: 'SEO Lead',
    timestamp: new Date(Date.now() - 96*60*60*1000).toISOString(),
    details: {
      format: 'PDF',
      pages: 24,
      submissions_included: 15,
      date_range: 'Oct 1 - Dec 31, 2023',
      metrics_exported: ['SEO Score', 'GEO Score', 'Time to Approval', 'Revision Rate']
    },
    ip_address: '192.168.1.78',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'audit-008',
    action: 'User Login',
    action_type: 'authentication',
    entity_type: 'user',
    entity_id: 'user-001',
    entity_name: 'Sarah Johnson',
    performed_by: 'Sarah Johnson',
    performed_by_email: 'sarah.johnson@3cubed.com',
    performed_by_role: 'SEO Specialist',
    timestamp: new Date(Date.now() - 120*60*60*1000).toISOString(),
    details: {
      login_method: 'SSO',
      session_duration: '8 hours',
      location: 'New York, NY',
      device: 'MacBook Pro'
    },
    ip_address: '74.125.24.103',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  },
  {
    id: 'audit-009',
    action: 'Permission Changed',
    action_type: 'permission_update',
    entity_type: 'user',
    entity_id: 'user-002',
    entity_name: 'Michael Chen',
    performed_by: 'Admin User',
    performed_by_email: 'admin@3cubed.com',
    performed_by_role: 'System Administrator',
    timestamp: new Date(Date.now() - 168*60*60*1000).toISOString(),
    details: {
      permission_added: ['MLR Review Access', 'Export Reports'],
      permission_removed: [],
      reason: 'Promoted to Senior SEO Specialist',
      effective_date: new Date(Date.now() - 168*60*60*1000).toISOString()
    },
    ip_address: '10.0.0.1',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
  },
  {
    id: 'audit-010',
    action: 'Bulk Update',
    action_type: 'bulk_operation',
    entity_type: 'submission',
    entity_id: 'bulk-001',
    entity_name: 'Q1 2024 Priority Updates',
    performed_by: 'Lisa Wang',
    performed_by_email: 'lisa.wang@3cubed.com',
    performed_by_role: 'Operations Manager',
    timestamp: new Date(Date.now() - 240*60*60*1000).toISOString(),
    details: {
      submissions_updated: 8,
      changes_made: {
        priority_level: 'Changed from Medium to High',
        target_completion: 'Updated to March 31, 2024'
      },
      affected_clients: ['Merck', 'Pfizer', 'Novartis']
    },
    ip_address: '192.168.1.92',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)'
  }
]