# 🚀 Enable Real-Time in Your Supabase Project

## Quick Steps to Enable Real-Time

Since you have access to your Supabase dashboard at:
`https://supabase.com/dashboard/project/ktchrfgkbpaixbiwbieg`

### 1️⃣ Navigate to Replication Settings
1. Click on **Database** in the left sidebar
2. Click on **Replication**

### 2️⃣ Enable Real-Time for Submissions Table
1. Find the **submissions** table in the list
2. Look for the **Realtime** toggle
3. **Toggle it ON** (it should turn green/blue)
4. Click **Apply** or **Save** button

### 3️⃣ That's It! 
Real-time is now enabled. Your dashboard will instantly update when:
- New submissions are created
- AI processing completes
- Any field is edited and saved

## 🔍 How to Verify It's Working

### In Supabase Dashboard:
1. The **Realtime** toggle should be ON (green/blue) for `submissions` table
2. You might see a "Realtime enabled" indicator

### In Your Live App:
1. Open your dashboard: `https://3cubed-seo.netlify.app/seo-review-editable`
2. Open Chrome DevTools → Network tab
3. Filter by "WS" (WebSocket)
4. You should see an active WebSocket connection

### Quick Test:
1. Open dashboard in two browser tabs
2. Edit something in one tab
3. See it update in the other tab within 1-2 seconds!

## 📊 Current Status Check

While you're in the Supabase dashboard, check:

1. **Database → Replication**
   - Is `submissions` table listed?
   - Is the Realtime toggle ON or OFF?

2. **Settings → API**
   - Confirm your anon key matches what's in your .env file
   - Check if Realtime is in the list of enabled features

## 🎯 What Happens When Enabled

### With Real-Time ON:
- ✅ Instant updates (1-2 seconds)
- ✅ No refresh needed
- ✅ Live collaboration
- ✅ See AI results immediately

### With Real-Time OFF:
- ⏱️ 30-second auto-refresh
- 🔄 Manual refresh button
- 📝 Editing still works perfectly
- 💾 Auto-save still functions

## 💡 Troubleshooting

If the Realtime toggle is already ON but not working:

1. **Check RLS Policies**
   - Go to Authentication → Policies
   - Ensure there's a SELECT policy for `submissions` table
   - Should allow `public` or `authenticated` users to read

2. **Check API Settings**
   - Go to Settings → API
   - Verify Realtime is enabled at project level

3. **Test with SQL**
   ```sql
   -- Run this in SQL Editor
   SELECT * FROM submissions LIMIT 1;
   -- If this works, database connection is good
   ```

## 🚨 Important Note

The current `.env` file has:
```
VITE_SUPABASE_URL=https://ktchrfgkbpaixbiwbieg.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

But CLAUDE.md mentions a different project. Make sure you're using the right credentials for your current project!