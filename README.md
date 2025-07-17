# Pharma SEO Dashboard - Netlify Deployment

## Quick Start

1. Open Terminal and navigate to this directory:
   ```bash
   cd ~/pharma-dashboard
   ```

2. Deploy to Netlify (choose one method):

   **Method A - Drag & Drop:**
   - Open https://app.netlify.com
   - Drag this entire folder to the deployment area
   - Your site will be live immediately!

   **Method B - Netlify CLI:**
   ```bash
   # Install Netlify CLI (if not already installed)
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod
   ```

## Files Included

- `index.html` - Main dashboard with HITL Review, Compliance, Content Library, and KPIs
- `login.html` - Authentication page
- `submit.html` - SEO content request form with all required fields
- `success.html` - Form submission success page
- `compliance-check.html` - Standalone compliance checking tool
- `status.html` - Check request status by compliance ID
- `404.html` - Custom error page
- `netlify.toml` - Netlify configuration with security headers
- `_redirects` - URL routing rules

## Features

1. **HITL Review Dashboard** - Primary screen for content review
2. **Compliance Tracking** - With integrated AI chatbot
3. **Content Library** - Placeholder for future content repository
4. **KPI Dashboard** - Performance metrics and analytics
5. **Netlify Forms** - Automatic form handling for submissions

## Post-Deployment Steps

1. **Configure Form Notifications:**
   - Go to Netlify Dashboard → Forms
   - Set up webhook to your Supabase Edge Function
   - Configure email notifications

2. **Set Environment Variables:**
   - In Netlify Dashboard → Site settings → Environment variables
   - Add your Supabase credentials

3. **Connect Custom Domain (if needed):**
   - Go to Domain settings in Netlify
   - Add your custom domain

## Form Field Mapping

The `submit.html` form includes all required fields that map to your Supabase schema:
- Mandatory fields match exactly with database columns
- Geography field allows up to 3 selections
- Automatic compliance ID generation on success

## Security

- CORS headers configured for API calls
- XSS protection enabled
- Content Security Policy implemented
- Authentication flow ready for Supabase integration

## Support

For issues or questions:
- Check Netlify deployment logs
- Verify form field names match Supabase schema
- Ensure webhook URL is correctly configured