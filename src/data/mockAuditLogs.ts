import { subDays, subHours, subMinutes } from 'date-fns'

// Helper to generate realistic timestamps
const generateTimestamp = (daysAgo: number, hoursAgo: number = 0, minutesAgo: number = 0) => {
  const date = subMinutes(subHours(subDays(new Date(), daysAgo), hoursAgo), minutesAgo)
  return date.toISOString()
}

// Mock audit log entries with pharmaceutical industry relevant activities
export const mockAuditLogs = [
  // Today's activities
  {
    id: 'audit-001',
    created_at: generateTimestamp(0, 0, 5),
    user_id: 'user-123',
    user_email: 'sarah.chen@3cubed.com',
    action: 'content_approved',
    entity_type: 'submission',
    entity_id: 'CONT-2024-789',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      status: { from: 'pending_mlr', to: 'approved' },
      mlr_score: { from: null, to: 98 },
      approved_by: 'sarah.chen@3cubed.com'
    }
  },
  {
    id: 'audit-002',
    created_at: generateTimestamp(0, 0, 15),
    user_id: 'user-456',
    user_email: 'michael.rodriguez@3cubed.com',
    action: 'login',
    entity_type: 'auth',
    entity_id: 'session-abc123',
    ip_address: '192.168.1.67',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    changes: {}
  },
  {
    id: 'audit-003',
    created_at: generateTimestamp(0, 1, 30),
    user_id: 'user-789',
    user_email: 'jennifer.wang@3cubed.com',
    action: 'content_submitted',
    entity_type: 'submission',
    entity_id: 'CONT-2024-790',
    ip_address: '192.168.1.89',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      product_name: 'Nexora',
      therapeutic_area: 'Oncology',
      target_audience: 'Healthcare Professionals',
      priority: 'high'
    }
  },
  {
    id: 'audit-004',
    created_at: generateTimestamp(0, 2, 45),
    user_id: 'user-321',
    user_email: 'david.thompson@3cubed.com',
    action: 'compliance_flag_added',
    entity_type: 'submission',
    entity_id: 'CONT-2024-785',
    ip_address: '192.168.1.23',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'warning',
    changes: {
      compliance_issue: 'Off-label indication detected',
      flagged_text: 'Can be used for pediatric patients',
      severity: 'high'
    }
  },
  {
    id: 'audit-005',
    created_at: generateTimestamp(0, 3, 0),
    user_id: 'user-654',
    user_email: 'lisa.johnson@3cubed.com',
    action: 'data_export',
    entity_type: 'system',
    entity_id: 'export-20240117-001',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      export_type: 'mlr_approved_content',
      format: 'csv',
      record_count: 156,
      date_range: 'last_30_days'
    }
  },

  // Yesterday's activities
  {
    id: 'audit-006',
    created_at: generateTimestamp(1, 2, 15),
    user_id: 'user-123',
    user_email: 'sarah.chen@3cubed.com',
    action: 'client_review_requested',
    entity_type: 'submission',
    entity_id: 'CONT-2024-784',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      status: { from: 'seo_approved', to: 'pending_client' },
      assigned_to: 'client.reviewer@pharmacompany.com'
    }
  },
  {
    id: 'audit-007',
    created_at: generateTimestamp(1, 5, 30),
    user_id: 'user-987',
    user_email: 'admin@3cubed.com',
    action: 'user_created',
    entity_type: 'user',
    entity_id: 'user-new-001',
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      email: 'new.reviewer@3cubed.com',
      role: 'mlr_reviewer',
      permissions: ['view_content', 'approve_mlr', 'export_data']
    }
  },
  {
    id: 'audit-008',
    created_at: generateTimestamp(1, 8, 0),
    user_id: 'user-456',
    user_email: 'michael.rodriguez@3cubed.com',
    action: 'content_rejected',
    entity_type: 'submission',
    entity_id: 'CONT-2024-783',
    ip_address: '192.168.1.67',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'warning',
    changes: {
      status: { from: 'pending_client', to: 'rejected' },
      rejection_reason: 'Brand guidelines not followed',
      feedback: 'Logo placement incorrect, tone not aligned with brand voice'
    }
  },
  {
    id: 'audit-009',
    created_at: generateTimestamp(1, 10, 45),
    user_id: 'system',
    user_email: 'system@3cubed.com',
    action: 'automated_backup',
    entity_type: 'system',
    entity_id: 'backup-20240116-daily',
    ip_address: '10.0.0.1',
    user_agent: 'System/BackupService',
    status: 'success',
    changes: {
      backup_type: 'daily',
      database_size: '2.4GB',
      duration_seconds: 145,
      tables_backed_up: 42
    }
  },

  // Last 7 days activities
  {
    id: 'audit-010',
    created_at: generateTimestamp(3, 4, 20),
    user_id: 'user-789',
    user_email: 'jennifer.wang@3cubed.com',
    action: 'project_created',
    entity_type: 'project',
    entity_id: 'PROJ-2024-045',
    ip_address: '192.168.1.89',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      project_name: 'Cardizem Q1 Campaign',
      client: 'CardioHealth Pharma',
      therapeutic_area: 'Cardiovascular',
      target_launch: '2024-03-01'
    }
  },
  {
    id: 'audit-011',
    created_at: generateTimestamp(4, 6, 0),
    user_id: 'user-321',
    user_email: 'david.thompson@3cubed.com',
    action: 'seo_keywords_updated',
    entity_type: 'submission',
    entity_id: 'CONT-2024-780',
    ip_address: '192.168.1.23',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'success',
    changes: {
      keywords_added: ['atrial fibrillation treatment', 'blood thinner alternatives'],
      keywords_removed: ['heart medicine'],
      long_tail_count: { from: 3, to: 5 }
    }
  },
  {
    id: 'audit-012',
    created_at: generateTimestamp(5, 3, 15),
    user_id: 'user-654',
    user_email: 'lisa.johnson@3cubed.com',
    action: 'mlr_checklist_completed',
    entity_type: 'submission',
    entity_id: 'CONT-2024-778',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      medical_accuracy: true,
      fair_balance: true,
      safety_information: true,
      fda_guidelines: true,
      off_label_promotion: false,
      disclaimers: true
    }
  },
  {
    id: 'audit-013',
    created_at: generateTimestamp(6, 1, 30),
    user_id: 'user-123',
    user_email: 'sarah.chen@3cubed.com',
    action: 'client_assigned',
    entity_type: 'client',
    entity_id: 'CLIENT-789',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      client_name: 'NeuroPharma Inc',
      account_manager: 'jennifer.wang@3cubed.com',
      industry: 'Pharmaceutical',
      tier: 'enterprise'
    }
  },

  // Failed/Error activities for realistic data
  {
    id: 'audit-014',
    created_at: generateTimestamp(2, 7, 45),
    user_id: 'user-999',
    user_email: 'external.user@client.com',
    action: 'login_failed',
    entity_type: 'auth',
    entity_id: 'session-failed-xyz',
    ip_address: '203.45.67.89',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'error',
    error_message: 'Invalid credentials - account locked after 3 failed attempts',
    changes: {
      attempt_count: 3,
      account_locked: true
    }
  },
  {
    id: 'audit-015',
    created_at: generateTimestamp(3, 9, 0),
    user_id: 'user-456',
    user_email: 'michael.rodriguez@3cubed.com',
    action: 'content_upload_failed',
    entity_type: 'submission',
    entity_id: 'CONT-2024-failed',
    ip_address: '192.168.1.67',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'error',
    error_message: 'File size exceeds maximum limit of 10MB',
    changes: {
      file_name: 'large_presentation.pptx',
      file_size: '15.4MB',
      max_allowed: '10MB'
    }
  },

  // Regulatory compliance specific activities
  {
    id: 'audit-016',
    created_at: generateTimestamp(7, 5, 20),
    user_id: 'user-321',
    user_email: 'david.thompson@3cubed.com',
    action: 'fda_warning_letter_check',
    entity_type: 'submission',
    entity_id: 'CONT-2024-776',
    ip_address: '192.168.1.23',
    user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    status: 'warning',
    changes: {
      check_type: 'automated_screening',
      similar_violations_found: 2,
      risk_score: 'medium',
      flagged_phrases: ['breakthrough treatment', 'guaranteed results']
    }
  },
  {
    id: 'audit-017',
    created_at: generateTimestamp(8, 2, 10),
    user_id: 'user-789',
    user_email: 'jennifer.wang@3cubed.com',
    action: 'adverse_event_language_added',
    entity_type: 'submission',
    entity_id: 'CONT-2024-775',
    ip_address: '192.168.1.89',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      section_added: 'Important Safety Information',
      ae_categories: ['common', 'serious', 'warnings'],
      black_box_warning: false
    }
  },

  // Workflow activities
  {
    id: 'audit-018',
    created_at: generateTimestamp(10, 6, 30),
    user_id: 'user-654',
    user_email: 'lisa.johnson@3cubed.com',
    action: 'workflow_stage_advanced',
    entity_type: 'submission',
    entity_id: 'CONT-2024-773',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      workflow_stage: { from: 'draft', to: 'seo_review' },
      auto_assigned_to: 'seo-team@3cubed.com',
      sla_deadline: '2024-01-20T17:00:00Z'
    }
  },
  {
    id: 'audit-019',
    created_at: generateTimestamp(12, 4, 15),
    user_id: 'user-123',
    user_email: 'sarah.chen@3cubed.com',
    action: 'bulk_status_update',
    entity_type: 'system',
    entity_id: 'bulk-op-20240105',
    ip_address: '192.168.1.45',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      operation: 'archive_old_drafts',
      affected_count: 23,
      criteria: 'older_than_90_days',
      new_status: 'archived'
    }
  },

  // Permission and access control activities
  {
    id: 'audit-020',
    created_at: generateTimestamp(14, 8, 0),
    user_id: 'user-987',
    user_email: 'admin@3cubed.com',
    action: 'role_permissions_updated',
    entity_type: 'user',
    entity_id: 'role-mlr-reviewer',
    ip_address: '192.168.1.10',
    user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    status: 'success',
    changes: {
      permissions_added: ['delete_content', 'manage_workflows'],
      permissions_removed: ['manage_users'],
      affected_users: 5
    }
  }
]

// Mock audit statistics
export const mockAuditStats = {
  totalActivities: mockAuditLogs.length,
  successRate: Math.round((mockAuditLogs.filter(log => log.status === 'success').length / mockAuditLogs.length) * 100),
  activeUsers: 7,
  complianceScore: 94 // High score for pharma compliance
}
