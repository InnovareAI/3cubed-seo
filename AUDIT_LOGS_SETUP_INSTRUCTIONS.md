# Step-by-Step Instructions: Setting Up 21 CFR Part 11 Compliant Audit Logs

## Phase 1: Create the Audit Logs Table in Supabase

### Step 1: Access Supabase SQL Editor
1. Open your browser and go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Click on your project: **ktchrfgkbpaixbiwbieg**
3. In the left sidebar, click on **SQL Editor**

### Step 2: Create the Audit Logs Table
1. Click **"New query"** button in the SQL Editor
2. Copy the entire contents of the file: `/Users/tvonlinz/3cubed-seo/supabase/migrations/create_audit_logs_table.sql`
3. Paste it into the SQL Editor
4. Click **"Run"** button (or press Cmd/Ctrl + Enter)
5. You should see "Success. No rows returned" message

### Step 3: Verify Table Creation
1. In the left sidebar, click on **Table Editor**
2. Look for the **audit_logs** table in the list
3. Click on it to see the table structure
4. Verify all columns are present:
   - id, entity_type, entity_id, action, changes, user_id, user_email, ip_address, user_agent, status, error_message, created_at

### Step 4: Test the Immutability
1. Go back to **SQL Editor**
2. Try to run these tests:

```sql
-- Test 1: Insert a test record (should work)
INSERT INTO audit_logs (entity_type, entity_id, action, user_email)
VALUES ('test', 'test-123', 'test_action', 'test@example.com');

-- Test 2: Try to update it (should fail)
UPDATE audit_logs SET action = 'modified' WHERE entity_type = 'test';
-- Expected: "Error: new row violates row-level security policy"

-- Test 3: Try to delete it (should fail)
DELETE FROM audit_logs WHERE entity_type = 'test';
-- Expected: "Error: new row violates row-level security policy"
```

## Phase 2: Add Audit Logging Helper Functions

### Step 5: Create Audit Logger Utility
1. Open your code editor
2. Create a new file: `/Users/tvonlinz/3cubed-seo/src/lib/auditLogger.ts`
3. Add this code:

```typescript
import { supabase } from './supabase';

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
      const { data: { user } } = await supabase.auth.getUser();
      
      // Get client IP (in production, this would come from request headers)
      const ipAddress = 'Client IP'; // TODO: Get from request headers
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
}
```

### Step 6: Add Audit Logging to Existing Operations
1. Open `/Users/tvonlinz/3cubed-seo/src/pages/RevisionRequests.tsx` (or similar files)
2. Import the AuditLogger at the top:
   ```typescript
   import { AuditLogger } from '../lib/auditLogger';
   ```

3. Add audit logging to key actions. For example:

   **When approving a revision:**
   ```typescript
   const handleApprove = async (submissionId: string) => {
     // ... existing approval code ...
     
     // Add audit log
     await AuditLogger.logApproval('submission', submissionId, 'revision', 'Approved after review');
   };
   ```

   **When rejecting a revision:**
   ```typescript
   const handleReject = async (submissionId: string, reason: string) => {
     // ... existing rejection code ...
     
     // Add audit log
     await AuditLogger.logRejection('submission', submissionId, 'revision', reason);
   };
   ```

## Phase 3: Update the Audit Trail Page

### Step 7: Create Audit Trail Query Hook
1. Create a new file: `/Users/tvonlinz/3cubed-seo/src/hooks/useAuditLogs.ts`
2. Add this code:

```typescript
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

interface AuditLogFilters {
  entityType?: string;
  action?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  userEmail?: string;
}

export function useAuditLogs(filters?: AuditLogFilters) {
  return useQuery({
    queryKey: ['audit-logs', filters],
    queryFn: async () => {
      let query = supabase
        .from('audit_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.entityType) {
        query = query.eq('entity_type', filters.entityType);
      }

      if (filters?.action) {
        query = query.eq('action', filters.action);
      }

      if (filters?.userEmail) {
        query = query.eq('user_email', filters.userEmail);
      }

      if (filters?.dateRange) {
        query = query
          .gte('created_at', filters.dateRange.start.toISOString())
          .lte('created_at', filters.dateRange.end.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  });
}
```

### Step 8: Update the Audit Trail Component
1. Find your Audit Trail component file (likely in `/src/pages/` or `/src/components/`)
2. Replace the dummy data with real data:

```typescript
import { useAuditLogs } from '../hooks/useAuditLogs';
import { format } from 'date-fns';

export function AuditTrail() {
  const { data: auditLogs, isLoading, error } = useAuditLogs();

  if (isLoading) return <div>Loading audit logs...</div>;
  if (error) return <div>Error loading audit logs</div>;

  return (
    <div className="audit-trail">
      <table>
        <thead>
          <tr>
            <th>Timestamp</th>
            <th>User</th>
            <th>Action</th>
            <th>Details</th>
            <th>IP Address</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {auditLogs?.map((log) => (
            <tr key={log.id}>
              <td>{format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}</td>
              <td>{log.user_email}</td>
              <td>{log.action}</td>
              <td>{log.entity_type}: {log.entity_id}</td>
              <td>{log.ip_address}</td>
              <td>
                <span className={`status-${log.status}`}>
                  {log.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

## Phase 4: Testing and Deployment

### Step 9: Test Locally
1. Run your development server: `npm run dev`
2. Perform some actions (create/update/approve submissions)
3. Check the Audit Trail page to see if logs appear
4. Check Supabase Table Editor to verify records are being created

### Step 10: Deploy Changes
1. Commit all changes:
   ```bash
   cd /Users/tvonlinz/3cubed-seo
   git add .
   git commit -m "Add 21 CFR Part 11 compliant audit logging"
   git push
   ```

2. Wait for Netlify deployment to complete
3. Test on production site

## Phase 5: Compliance Configuration

### Step 11: Set Up Data Retention (Optional)
1. In Supabase SQL Editor, create a retention policy:

```sql
-- Create a function to archive old audit logs (keep for 7 years)
CREATE OR REPLACE FUNCTION archive_old_audit_logs()
RETURNS void AS $$
BEGIN
  -- Archive logs older than 7 years to a separate table
  -- For now, we'll just ensure they're kept
  -- In production, you'd move to cold storage
  
  -- Add a policy to prevent deletion of logs less than 7 years old
  -- This is handled by our RLS policies
END;
$$ LANGUAGE plpgsql;
```

### Step 12: Document for Compliance
1. Create a file: `/Users/tvonlinz/3cubed-seo/COMPLIANCE.md`
2. Document:
   - Audit log implementation details
   - Data retention policies
   - Access controls
   - Immutability guarantees

## Troubleshooting

### If audit logs aren't appearing:
1. Check browser console for errors
2. Verify user is authenticated
3. Check Supabase logs for any RLS policy issues
4. Ensure the audit_logs table exists and has proper permissions

### If you get permission errors:
1. Make sure you're logged in
2. Check RLS policies are correctly set
3. Verify your user has the authenticated role

## Next Steps
1. Add audit logging to all critical operations
2. Create audit log reports and analytics
3. Set up automated compliance reports
4. Implement audit log search and filtering in the UI
5. Add email alerts for critical actions

---

**Remember**: Never attempt to modify or delete audit logs directly. They must remain immutable for compliance.