# 3Cubed SEO Dashboard

A modern pharmaceutical SEO content management dashboard built with React, TypeScript, and Tailwind CSS.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ installed
- npm or yarn package manager
- Supabase account (optional for full functionality)

### Local Development

1. Clone the repository:
   ```bash
   git clone https://github.com/InnovareAI/3cubed-seo.git
   cd 3cubed-seo
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your Supabase credentials
   # VITE_SUPABASE_URL=your_supabase_url
   # VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser

## 🌐 Deployment to Netlify

### Method 1: One-Click Deploy
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/InnovareAI/3cubed-seo)

### Method 2: Manual Deploy

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy using Netlify CLI:
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod --dir=dist
   ```

### Method 3: Git Integration
1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Add environment variables in Netlify dashboard

## 🔧 Environment Variables

Add these in Netlify Dashboard → Site Settings → Environment Variables:

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📁 Project Structure

```
src/
├── components/     # Reusable components
├── pages/         # Page components
├── lib/           # Utilities and configurations
├── App.tsx        # Main app component
├── main.tsx       # Entry point
└── index.css      # Global styles
```

## 🎨 Features

- **Projects Overview** - Manage client projects and campaigns
- **Submissions** - Track content submissions and their status
- **HITL Review** - Human-in-the-loop content review system
- **Content Requests** - Manage SEO content requests
- **Analytics** - Performance metrics and insights
- **Content Library** - Repository of approved content
- **Compliance** - FDA compliance tracking
- **Audit Trail** - Complete activity history
- **Administration** - System settings and user management

## 🐛 Troubleshooting

### White Screen Issues
1. Check browser console for errors
2. Verify environment variables are set
3. Clear browser cache
4. Check if build completed successfully

### Build Errors
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Ensure Node.js version is 18+

### Supabase Connection Issues
1. Verify your Supabase URL and anon key
2. Check if Supabase project is active
3. Review CORS settings in Supabase dashboard

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check Netlify deployment logs
- Verify environment variables are correctly set

## 📄 License

This project is proprietary software. All rights reserved.
