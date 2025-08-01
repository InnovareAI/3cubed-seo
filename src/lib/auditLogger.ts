import { supabase } from '../lib/database-types';

interface AuditLogEntry {
  entityType: string;
  entityId: string;
  action: string;
  changes?: Record<string, any>;
  status?: 'success' | 'error' | 'warning';
  errorMessage?: string;
}

export class AuditLogger {
  static async log(entry: AuditLogEntry): Promise<void> {
    try {
      // Get current user
      const { data: { user } } = await mockApi.auth.getUser();
      
      // Get client IP (in production, this would come from request headers)
      const ipAddress = 'Client IP'; // TODO: Get from request headers in production
      const userAgent = navigator.userAgent;
      
      const { error } = await supabase
        .from('audit_logs')
        .insert({
          entity_type: entry.entityType,
          entity_id: entry.entityId,
          action: entry.action,
          changes: entry.changes || null,
          user_id: user?.id || null,
          user_email: user?.email || 'system',
          ip_address: ipAddress,
          user_agent: userAgent,
          status: entry.status || 'success',
          error_message: entry.errorMessage || null
        });
        
      if (error) {
        console.error('Failed to create audit log:', error);
      }
    } catch (err) {
      console.error('Audit logging error:', err);
      // Don't throw - audit logging should not break the app
    }
  }

  // Convenience methods for common actions
  static async logSubmissionCreated(submissionId: string, details: any) {
    return this.log({
      entityType: 'submission',
      entityId: submissionId,
      action: 'submission_created',
      changes: details
    });
  }

  static async logSubmissionUpdated(submissionId: string, changes: any) {
    return this.log({
      entityType: 'submission',
      entityId: submissionId,
      action: 'submission_updated',
      changes: changes
    });
  }

  static async logApproval(entityType: string, entityId: string, approvalType: string, notes?: string) {
    return this.log({
      entityType: entityType,
      entityId: entityId,
      action: `${approvalType}_approved`,
      changes: { notes, approved_at: new Date().toISOString() }
    });
  }

  static async logRejection(entityType: string, entityId: string, rejectionType: string, reason: string) {
    return this.log({
      entityType: entityType,
      entityId: entityId,
      action: `${rejectionType}_rejected`,
      changes: { reason, rejected_at: new Date().toISOString() }
    });
  }

  static async logDataExport(exportType: string, filters: any) {
    return this.log({
      entityType: 'system',
      entityId: `export_${Date.now()}`,
      action: 'data_exported',
      changes: { export_type: exportType, filters }
    });
  }

  static async logUserAction(action: string, details?: any) {
    return this.log({
      entityType: 'user',
      entityId: 'current_user',
      action: action,
      changes: details
    });
  }

  static async logLogin(email: string) {
    return this.log({
      entityType: 'auth',
      entityId: email,
      action: 'user_login',
      changes: { timestamp: new Date().toISOString() }
    });
  }

  static async logLogout(email: string) {
    return this.log({
      entityType: 'auth',
      entityId: email,
      action: 'user_logout',
      changes: { timestamp: new Date().toISOString() }
    });
  }

  static async logSEOReview(submissionId: string, action: string, details: any) {
    return this.log({
      entityType: 'submission',
      entityId: submissionId,
      action: `seo_${action}`,
      changes: details
    });
  }

  static async logClientReview(submissionId: string, action: string, details: any) {
    return this.log({
      entityType: 'submission',
      entityId: submissionId,
      action: `client_${action}`,
      changes: details
    });
  }

  static async logError(entityType: string, entityId: string, action: string, error: any) {
    return this.log({
      entityType: entityType,
      entityId: entityId,
      action: action,
      status: 'error',
      errorMessage: error.message || 'Unknown error',
      changes: { error: error.toString(), stack: error.stack }
    });
  }
}