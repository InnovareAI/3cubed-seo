# Environment Setup Instructions

## Required Environment Variables

Create a `.env` file in the root directory with the following variables:

```bash
# Supabase Configuration
VITE_SUPABASE_URL=https://ktchrfgkbpaixbiwbieg.supabase.co
VITE_SUPABASE_ANON_KEY=[YOUR_ANON_KEY]

# n8n Webhook Configuration  
VITE_N8N_WEBHOOK_URL=https://innovareai.app.n8n.cloud/webhook-test/3cubed-seo-webhook

# Environment
VITE_APP_ENV=development
```

## Getting the Supabase Anon Key

1. Go to Supabase Dashboard
2. Navigate to Settings > API
3. Copy the `anon public` key
4. Replace `[YOUR_ANON_KEY]` with this value

## Local Development

1. Copy `.env.example` to `.env`
2. Update the values as shown above
3. Run `npm install` 
4. Run `npm run dev`

## Production Deployment (Netlify)

Set these environment variables in Netlify:
1. Go to Site Settings > Environment Variables
2. Add each variable with the production values
3. Redeploy the site

## Troubleshooting

If you see "Failed to submit form" error:
1. Check browser console for Supabase connection errors
2. Verify environment variables are loaded (check console logs)
3. Ensure Supabase anon key has proper permissions
