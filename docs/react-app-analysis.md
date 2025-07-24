# 3Cubed SEO React App - Detailed Analysis

## Overview
- **URL**: https://3cubed-seo.netlify.app
- **Repository**: https://github.com/InnovareAI/3cubed-seo
- **Type**: Pharmaceutical SEO Content Management System
- **Purpose**: Multi-stage content review workflow for pharma marketing

## Technical Stack
```json
{
  "framework": "React 18.2.0",
  "language": "TypeScript 5.8.3",
  "buildTool": "Vite 5.0.8",
  "styling": "Tailwind CSS 3.3.0",
  "stateManagement": "TanStack Query v5.17.0",
  "database": "Supabase JS 2.39.0",
  "routing": "React Router v6.20.0",
  "ui": {
    "components": "Headless UI 1.7.19",
    "icons": "Lucide React 0.294.0",
    "charts": "Recharts 2.10.0"
  },
  "utilities": {
    "dates": "date-fns 3.0.0",
    "classNames": "clsx 2.0.0 + tailwind-merge 2.2.0"
  }
}
```

## Deployment Configuration
- **Platform**: Netlify
- **Build Command**: `npm run build`
- **Publish Directory**: `dist`
- **Node Version**: 18
- **Auto-deploy**: Enabled from main branch
- **SPA Routing**: Configured (all routes → index.html)

## Environment Variables Required
```
VITE_SUPABASE_URL=https://ktchrfgkbpaixbiwbieg.supabase.co
VITE_SUPABASE_ANON_KEY=[anon key required]
```

## Application Structure

### Entry Points
- `index.html` - Root HTML
- `src/main.tsx` - React app initialization with error handling
- `src/App.tsx` - Main router and layout

### Component Library (18 components)
1. **Forms**
   - `SubmissionForm.tsx` - Main content submission (36KB)
   - `SubmissionModal.tsx` - Submission wrapper modal

2. **Review Modals**
   - `SEOReviewModal.tsx` - SEO team review interface (27KB)
   - `ClientReviewModal.tsx` - Client feedback interface
   - `ClientApprovalModal.tsx` - Client approval workflow
   - `MLRReviewModal.tsx` - Medical/Legal/Regulatory review
   - `UnifiedReviewModal.tsx` - Combined review interface

3. **Layout Components**
   - `DashboardLayout.tsx` - Main app layout with navigation
   - `Tabs.tsx` - Tab navigation component
   - `FilterBar.tsx` - List filtering controls

4. **Display Components**
   - `ReviewCard.tsx` - Content card for review items
   - `MetricCard.tsx` - Dashboard metrics display
   - `StatusDistributionChart.tsx` - Status visualization
   - `ProcessingQueue.tsx` - AI processing status
   - `EmptyState.tsx` - Empty list states
   - `RoleInfoBanner.tsx` - Role-based information

5. **Utility Components**
   - `ErrorBoundary.tsx` - Error handling wrapper
   - `CTAButton.tsx` - Call-to-action button
   - `ReviewPageHeader.tsx` - Page header component

### Page Components (28 pages)

#### Dashboard Pages
- `Overview.tsx` - Main dashboard
- `ClientDashboard.tsx` - Client-specific view (25KB)
- `RevisionDashboard.tsx` - Revision tracking (22KB)

#### Review Workflows
- `SEOReview.tsx` - SEO review queue
- `SEOReviewDetail.tsx` - Individual SEO review (27KB)
- `SEOReviewPageDetail.tsx` - Detailed SEO page review (34KB)
- `ClientReview.tsx` - Client review queue
- `ClientReviewDetail.tsx` - Individual client review (33KB)
- `ClientReviewLive.tsx` - Live client review session
- `MLRReview.tsx` - MLR review queue
- `MLRReviewDetail.tsx` - Individual MLR review (28KB)
- `HITLReview.tsx` - Human-in-the-loop review

#### Content Management
- `ContentRequests.tsx` - Content request management
- `ContentGeneration.tsx` - AI content generation (15KB)
- `ContentLibrary.tsx` - Content repository
- `Submissions.tsx` - Submission management
- `SubmissionDetail.tsx` - Individual submission view
- `SubmissionForm.tsx` - Submission form page (10KB)

#### Administration
- `Administration.tsx` - Admin panel (54KB - largest file)
- `ClientManagement.tsx` - Client CRUD operations (32KB)
- `ProjectsOverview.tsx` - Project management
- `CurrentProjects.tsx` - Active projects view
- `Analytics.tsx` - Analytics dashboard
- `AuditTrail.tsx` - Audit logging view (20KB)
- `Compliance.tsx` - Compliance tracking
- `Settings.tsx` - App settings

#### Other Pages
- `SEORequests.tsx` - SEO request queue
- `RevisionRequests.tsx` - Revision queue

## Database Integration

### Supabase Configuration
- **URL**: https://ktchrfgkbpaixbiwbieg.supabase.co
- **Tables Used**:
  - `pharma_seo_submissions` (main submissions table)
  - `clients` - Client management
  - `projects` - Project tracking
  - `audit_logs` - Activity logging
  - `content_pieces` - Content library
  - `seo_reviews` - SEO review records

### Key Database Fields (ai_* naming)
```typescript
{
  ai_processing_status: string,
  ai_generated_content: any,
  ai_provider: string,
  ai_model: string,
  ai_processing_error: string,
  ai_vector_id: string
}
```

## Workflow Architecture

### Content Submission Flow
1. **Form Submission** → `submissions` table
2. **Webhook Trigger** → n8n workflow
3. **AI Processing** → Perplexity API (currently broken)
4. **QA Review** → Claude API
5. **Database Update** → Status changes

### Review Stages
```
draft → seo_review → client_review → mlr_review → approved
         ↓             ↓              ↓
    revision_requested (can loop back)
```

### User Roles
- **Admin**: Full access to all features
- **SEO Team**: SEO review interface
- **Client**: Client review & approval
- **MLR Team**: Medical/Legal/Regulatory review

## Key Features

### 1. Multi-stage Review System
- Sequential workflow stages
- Role-based access control
- Revision management
- Audit trail for all actions

### 2. AI Integration
- Content generation via Perplexity
- QA review via Claude
- Webhook-based processing
- Real-time status updates

### 3. Client Management
- Multi-client support
- Project-based organization
- Client-specific dashboards
- Branded review interfaces

### 4. Analytics & Reporting
- Processing metrics
- Status distribution
- Time-to-completion tracking
- Export capabilities

## Known Issues & Status

### Working ✅
- Form submissions
- Database connections
- Webhook triggers
- UI/UX functionality
- Client review interfaces
- Audit logging

### Issues ⚠️
- **Perplexity API**: 401 Unauthorized (hardcoded key invalid)
- **20 pending submissions**: Waiting for AI processing

### Recent Fixes
- Form now inserts to `submissions` table (not view)
- Webhook response mode fixed
- All Supabase update nodes configured correctly

## Development Commands
```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to Netlify
npm run deploy
```

## File Size Analysis
- **Largest Components**: Administration.tsx (54KB), SubmissionForm.tsx (36KB)
- **Largest Pages**: Administration, ClientManagement, ClientReviewDetail
- **Total Pages**: 28
- **Total Components**: 18

## Next Steps for Development
1. Fix Perplexity API credential in n8n
2. Process 20 pending submissions
3. Monitor performance with current load
4. Consider code splitting for large components
5. Add error recovery for failed AI processing