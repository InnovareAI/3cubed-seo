import { useState } from 'react'
import { Outlet, NavLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  FileText, 
  BarChart3, 
  Library, 
  Shield,
  CheckSquare,
  Building2,
  Menu,
  X,
  Bell,
  User,
  Settings,
  Activity
} from 'lucide-react'

const navigation = [
  { name: 'Projects', href: '/', icon: Building2, color: 'text-purple-600', bgColor: 'bg-purple-50' },
  { name: 'Submissions', href: '/submissions', icon: FileText, color: 'text-blue-600', bgColor: 'bg-blue-50' },
  { name: 'HITL Review', href: '/review', icon: CheckSquare, showBadge: true, color: 'text-orange-600', bgColor: 'bg-orange-50' },
  { name: 'Content Requests', href: '/requests', icon: FileText, color: 'text-teal-600', bgColor: 'bg-teal-50' },
  { name: 'Analytics', href: '/analytics', icon: BarChart3, color: 'text-green-600', bgColor: 'bg-green-50' },
  { name: 'Content Library', href: '/content', icon: Library, color: 'text-indigo-600', bgColor: 'bg-indigo-50' },
  { name: 'Compliance', href: '/compliance', icon: Shield, color: 'text-red-600', bgColor: 'bg-red-50' },
  { name: 'Audit Trail', href: '/audit', icon: Activity, color: 'text-yellow-600', bgColor: 'bg-yellow-50' },
  { name: 'Administration', href: '/admin', icon: Settings, color: 'text-gray-600', bgColor: 'bg-gray-50' },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  // Fetch pending review count
  const { data: pendingCount } = useQuery({
    queryKey: ['pending-reviews-count'],
    queryFn: async () => {
      const { count } = await supabase
        .from('submissions')
        .select('*', { count: 'exact', head: true })
        .eq('langchain_status', 'needs_review')
      
      return count || 0
    },
    refetchInterval: 30000 // Refresh every 30 seconds
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-gray-900/50 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`absolute left-0 top-0 h-full w-64 bg-white shadow-xl transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-16 items-center justify-between px-4 bg-gradient-to-r from-purple-600 to-blue-600">
            <h2 className="text-lg font-bold text-white">Pharma SEO</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-white hover:bg-white/20"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-4 px-2">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${item.bgColor} ${item.color}`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
                onClick={() => setSidebarOpen(false)}
              >
                {({ isActive }) => (
                  <>
                    <item.icon className={`h-5 w-5 ${isActive ? item.color : ''}`} />
                    <span className="flex-1">{item.name}</span>
                    {item.showBadge && (pendingCount || 0) > 0 && (
                      <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {pendingCount}
                      </span>
                    )}
                  </>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-1 flex-col bg-white border-r border-gray-200 shadow-lg">
          <div className="flex h-16 items-center px-6 bg-gradient-to-r from-purple-600 to-blue-600">
            <h2 className="text-xl font-bold text-white">Pharma SEO</h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-4">
            {navigation.map((item) => (
              <NavLink
                key={item.name}
                to={item.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all ${
                    isActive
                      ? `${item.bgColor} ${item.color} shadow-sm`
                      : 'text-gray-700 hover:bg-gray-100'
                  }`
                }
              >
                <item.icon className={`h-5 w-5`} />
                <span className="flex-1">{item.name}</span>
                {item.showBadge && (pendingCount || 0) > 0 && (
                  <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                    {pendingCount}
                  </span>
                )}
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-md p-2 text-gray-400 hover:bg-gray-100"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex-1" />
            
            <button className="rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-purple-600 relative transition-colors">
              <Bell className="h-5 w-5" />
              {(pendingCount || 0) > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500 animate-pulse" />
              )}
            </button>
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-700">John Doe</span>
              <button className="rounded-full bg-gradient-to-r from-purple-500 to-blue-500 p-2">
                <User className="h-5 w-5 text-white" />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
