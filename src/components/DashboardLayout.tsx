import { useState } from 'react'
import { Outlet, NavLink, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { 
  FileText, 
  Library, 
  CheckSquare,
  Building2,
  Menu,
  X,
  Bell,
  User,
  Settings,
  Activity,
  Users,
  FileCheck,
  ChevronDown,
  ChevronRight,
  LayoutDashboard
} from 'lucide-react'

const navigation = [
  { name: 'Current Projects', href: '/', icon: Building2 },
  { name: 'SEO Requests', href: '/seo-requests', icon: FileText },
  { name: 'SEO Review', href: '/seo-review', icon: CheckSquare, showBadge: true },
  { name: 'Client Review', href: '/client-review', icon: Users },
  { name: 'MLR Review', href: '/mlr-review', icon: FileCheck },
  { name: 'Revisions', href: '/revisions', icon: LayoutDashboard },
  { name: 'Content Hub', href: '/content-hub', icon: Library },
  { name: 'Audit Trail', href: '/audit', icon: Activity },
  { 
    name: 'Administration', 
    href: '/admin', 
    icon: Settings,
    subItems: [
      { name: 'General Settings', href: '/admin' },
      { name: 'Client Management', href: '/admin/clients' }
    ]
  },
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminExpanded, setAdminExpanded] = useState(false)
  const location = useLocation()

  // Fetch pending review count with error handling
  const { data: pendingCount } = useQuery({
    queryKey: ['pending-reviews-count'],
    queryFn: async () => {
      try {
        const { count, error } = await supabase
          .from('submissions')
          .select('*', { count: 'exact', head: true })
          .eq('langchain_status', 'needs_review')
        
        if (error) {
          console.error('Error fetching pending reviews:', error)
          return 0
        }
        
        return count || 0
      } catch (err) {
        console.error('Error in pending reviews query:', err)
        return 0
      }
    },
    refetchInterval: 30000,
    retry: false
  })

  const renderNavItem = (item: any, isMobile = false) => {
    const hasSubItems = item.subItems && item.subItems.length > 0
    const isAdminActive = location.pathname.startsWith('/admin')

    if (hasSubItems) {
      return (
        <div key={item.name}>
          <button
            onClick={() => setAdminExpanded(!adminExpanded)}
            className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1 ${
              isAdminActive
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <item.icon className="h-5 w-5" />
            <span className="flex-1 text-left">{item.name}</span>
            {adminExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
          {adminExpanded && (
            <div className="ml-8 mt-1 space-y-1">
              {item.subItems.map((subItem: any) => (
                <NavLink
                  key={subItem.href}
                  to={subItem.href}
                  className={({ isActive }) =>
                    `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`
                  }
                  onClick={() => isMobile && setSidebarOpen(false)}
                >
                  {subItem.name}
                </NavLink>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <NavLink
        key={item.name}
        to={item.href}
        className={({ isActive }) =>
          `flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors mb-1 ${
            isActive
              ? 'bg-blue-50 text-blue-700'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`
        }
        onClick={() => isMobile && setSidebarOpen(false)}
      >
        <item.icon className="h-5 w-5" />
        <span className="flex-1">{item.name}</span>
        {item.showBadge && (pendingCount || 0) > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full">
            {pendingCount}
          </span>
        )}
      </NavLink>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      <div className={`lg:hidden fixed inset-0 z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`absolute inset-0 bg-gray-900/50 transition-opacity ${
            sidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`absolute left-0 top-0 h-full w-72 bg-white shadow-xl transition-transform ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex h-16 items-center justify-between px-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">3Cubed SEO</h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="rounded-md p-2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-5 px-3">
            {navigation.map((item) => renderNavItem(item, true))}
          </nav>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex flex-1 flex-col bg-white border-r border-gray-200">
          <div className="flex h-16 items-center px-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">3Cubed SEO</h2>
          </div>
          <nav className="flex-1 space-y-1 px-3 py-5">
            {navigation.map((item) => renderNavItem(item))}
          </nav>
          <div className="border-t border-gray-200 p-4">
            <div className="flex items-center">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">Admin User</p>
                <p className="text-xs text-gray-500">admin@3cubed.com</p>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600">
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
          {/* Version indicator - temporary for debugging */}
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400">v2.1 - Complete Workflow</p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top bar */}
        <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center gap-4 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden rounded-md p-2 text-gray-400 hover:text-gray-600"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            <div className="flex-1" />
            
            <button className="relative rounded-md p-2 text-gray-400 hover:text-gray-600">
              <Bell className="h-5 w-5" />
              {(pendingCount || 0) > 0 && (
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-blue-600" />
              )}
            </button>
            
            <button className="rounded-md p-2 text-gray-400 hover:text-gray-600">
              <User className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* Page content */}
        <main className="p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
