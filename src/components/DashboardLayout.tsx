import { useState } from 'react'
import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useReviewCounts } from '../hooks/useReviewCounts'
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
  LayoutDashboard
} from 'lucide-react'

interface NavItem {
  name: string
  href: string
  icon: any
  showBadge?: boolean
  badgeType?: 'seoReview' | 'clientReview' | 'mlrReview'
  isDivider?: boolean
  subItems?: Array<{
    name: string
    href: string
  }>
}

const navigation: NavItem[] = [
  { name: 'Current Projects', href: '/', icon: Building2 },
  { name: 'SEO Requests', href: '/seo-requests', icon: FileText },
  { name: 'SEO Review', href: '/seo-review', icon: CheckSquare, showBadge: true, badgeType: 'seoReview' },
  { name: 'Client Review', href: '/client-review', icon: Users, showBadge: true, badgeType: 'clientReview' },
  { name: 'MLR Review', href: '/mlr-review', icon: FileCheck, showBadge: true, badgeType: 'mlrReview' },
  { name: 'Revisions', href: '/revisions', icon: LayoutDashboard },
  { name: 'Audit Trail', href: '/audit', icon: Activity },
  { name: 'divider', href: '#', icon: null, isDivider: true },
  { name: 'Content Hub', href: '/content-hub', icon: Library },
]

const adminMenuItems = [
  { name: 'General Settings', href: '/admin' },
  { name: 'Client Management', href: '/admin/clients' }
]

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [adminMenuOpen, setAdminMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  // Fetch review counts
  const { data: reviewCounts } = useReviewCounts()

  const getCountForBadgeType = (badgeType?: string) => {
    if (!badgeType || !reviewCounts) return 0
    switch (badgeType) {
      case 'seoReview':
        return reviewCounts.seoReview
      case 'clientReview':
        return reviewCounts.clientReview
      case 'mlrReview':
        return reviewCounts.mlrReview
      default:
        return 0
    }
  }

  const totalPendingCount = reviewCounts 
    ? reviewCounts.seoReview + reviewCounts.clientReview + reviewCounts.mlrReview 
    : 0

  const renderNavItem = (item: NavItem, isMobile = false) => {
    // Handle divider
    if (item.isDivider) {
      return <div key={item.name} className="my-2 border-t border-gray-200" />
    }

    const badgeCount = getCountForBadgeType(item.badgeType)

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
        {item.showBadge && badgeCount > 0 && (
          <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full min-w-[20px] text-center">
            {badgeCount}
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
            <div className="relative">
              <div className="flex items-center">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">Admin User</p>
                  <p className="text-xs text-gray-500">admin@3cubed.com</p>
                </div>
                <button 
                  onClick={() => setAdminMenuOpen(!adminMenuOpen)}
                  className={`p-2 rounded-md transition-colors ${
                    adminMenuOpen ? 'bg-gray-100 text-gray-900' : 'text-gray-400 hover:text-gray-600'
                  }`}
                >
                  <Settings className="h-5 w-5" />
                </button>
              </div>
              
              {/* Admin dropdown menu */}
              {adminMenuOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                  <div className="py-1">
                    {adminMenuItems.map((item) => (
                      <button
                        key={item.href}
                        onClick={() => {
                          navigate(item.href)
                          setAdminMenuOpen(false)
                        }}
                        className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                          location.pathname === item.href
                            ? 'bg-blue-50 text-blue-700'
                            : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Version indicator - temporary for debugging */}
          <div className="px-4 pb-2">
            <p className="text-xs text-gray-400">v2.2 - Review Counts</p>
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
              {totalPendingCount > 0 && (
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