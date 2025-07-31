import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

// Create Supabase client with real-time options
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  },
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
})

// Helper function to test real-time connection
export const testRealtimeConnection = async () => {
  console.log('Testing real-time connection...')
  
  const channel = supabase.channel('connection-test')
  
  return new Promise((resolve) => {
    channel
      .on('system', { event: '*' }, (payload) => {
        console.log('System event:', payload)
      })
      .subscribe((status) => {
        console.log('Real-time connection status:', status)
        if (status === 'SUBSCRIBED') {
          resolve(true)
          supabase.removeChannel(channel)
        } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          resolve(false)
          supabase.removeChannel(channel)
        }
      })
    
    // Timeout after 5 seconds
    setTimeout(() => {
      resolve(false)
      supabase.removeChannel(channel)
    }, 5000)
  })
}

// Export the same interfaces as the original file
export * from './supabase'