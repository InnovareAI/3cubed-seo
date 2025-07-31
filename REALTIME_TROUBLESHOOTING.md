# Real-Time Sync Troubleshooting Guide

## 🔍 Quick Diagnosis

### Test Real-Time Locally
```bash
node test-realtime-detailed.js
```

## ✅ Real-Time SHOULD Work If:

1. **Supabase Project Settings**
   - Project created after 2021 (real-time enabled by default)
   - Using Supabase v2 client (`@supabase/supabase-js` v2.x)
   - Anon key has proper permissions

2. **Database Configuration**
   - Table has RLS policies allowing SELECT
   - No blocking firewall rules
   - WebSocket connections allowed (port 443)

## 🚨 Common Issues & Fixes

### Issue 1: Real-Time Not Enabled in Supabase

**Fix:**
1. Go to Supabase Dashboard
2. Navigate to **Database → Replication**
3. Find `submissions` table
4. Toggle **"Realtime"** to ON
5. Click **"Apply"**

### Issue 2: RLS Policies Blocking Real-Time

**Fix - Add SELECT policy:**
```sql
-- Allow anyone to read submissions (for real-time)
CREATE POLICY "Enable read access for all users"
  ON submissions
  FOR SELECT
  USING (true);
```

### Issue 3: WebSocket Connection Blocked

**Symptoms:**
- Works locally but not in production
- Console shows WebSocket errors

**Fix:**
- Check if corporate firewall blocks WebSockets
- Try on different network
- Netlify should work (supports WebSockets)

### Issue 4: Browser Extensions Blocking

**Fix:**
- Disable ad blockers temporarily
- Try in incognito mode
- Check browser console for errors

## 🧪 Testing in Production (Netlify)

### 1. Quick Browser Test
```javascript
// Open browser console on your Netlify site
// Paste this code:

const testRealtime = async () => {
  const { createClient } = await import('https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm')
  
  const supabase = createClient(
    'https://ktchrfgkbpaixbiwbieg.supabase.co',
    'your-anon-key-here'
  )
  
  const channel = supabase
    .channel('browser-test')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'submissions'
    }, (payload) => {
      console.log('🎉 Real-time working!', payload)
    })
    .subscribe((status) => {
      console.log('Status:', status)
    })
    
  console.log('Listening for changes... Update a submission to test!')
}

testRealtime()
```

### 2. Check Network Tab
1. Open Chrome DevTools → Network tab
2. Filter by "WS" (WebSocket)
3. Look for connection to `wss://ktchrfgkbpaixbiwbieg.supabase.co/realtime/v1/websocket`
4. Status should be "101 Switching Protocols"

## 📊 Real-Time Status Indicators

### In EditableSEODashboard Component

Add this connection indicator:

```tsx
const [realtimeStatus, setRealtimeStatus] = useState<'connecting' | 'connected' | 'error'>('connecting')

useEffect(() => {
  const channel = supabase
    .channel('status-check')
    .on('system', { event: '*' }, () => {
      setRealtimeStatus('connected')
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setRealtimeStatus('connected')
      } else if (status === 'CHANNEL_ERROR') {
        setRealtimeStatus('error')
      }
    })
    
  return () => {
    supabase.removeChannel(channel)
  }
}, [])

// In your JSX:
<div className="flex items-center gap-2 text-sm">
  <div className={`w-2 h-2 rounded-full ${
    realtimeStatus === 'connected' ? 'bg-green-500' : 
    realtimeStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
  }`} />
  <span>Real-time: {realtimeStatus}</span>
</div>
```

## 🔄 Fallback Options

If real-time doesn't work, the dashboard still functions with:

### 1. Manual Refresh Button
```tsx
<button onClick={() => queryClient.invalidateQueries(['submissions'])}>
  Refresh
</button>
```

### 2. Polling (Already Implemented)
```tsx
// In SEOReview.tsx
refetchInterval: 30000 // Polls every 30 seconds
```

### 3. Refresh on Focus
```tsx
refetchOnWindowFocus: true // Refetch when user returns to tab
```

## ✅ Verification Steps

1. **Check Supabase Dashboard**
   - Database → Replication → Ensure table is enabled
   - API → Check if real-time is in allowed features

2. **Test with Simple Update**
   ```sql
   -- In Supabase SQL Editor
   UPDATE submissions 
   SET seo_internal_notes = 'Test ' || NOW()
   WHERE id = (SELECT id FROM submissions LIMIT 1);
   ```

3. **Monitor Browser Console**
   - Should see WebSocket frames
   - No CORS errors
   - No 401/403 authentication errors

## 🎯 Expected Behavior

When real-time is working:
- ✅ Changes appear instantly (within 1-2 seconds)
- ✅ No need to refresh the page
- ✅ Multiple users see updates simultaneously
- ✅ Green connection indicator
- ✅ WebSocket shows active in Network tab

When real-time is NOT working:
- ⚠️ Changes require manual refresh
- ⚠️ 30-second polling still works
- ⚠️ Red connection indicator
- ⚠️ WebSocket errors in console

## 💡 Production Tips

1. **Netlify supports WebSockets** - Should work out of the box
2. **CloudFlare** may need WebSocket support enabled
3. **Corporate networks** often block WebSockets
4. **Mobile networks** generally support WebSockets

## 🚀 Still Not Working?

The dashboard is designed to work without real-time:
- Auto-save still works
- Manual refresh available
- 30-second polling as backup
- All editing features functional

Real-time is a enhancement, not a requirement!