import { useState } from 'react'
import { 
  Users, 
  Key, 
  Link, 
  Settings, 
  Plus, 
  Edit2, 
  Trash2,
  Shield,
  CheckCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  GitBranch,
  Bell,
  Clock,
  UserCheck,
  AlertTriangle,
  Mail,
  MessageSquare,
  Zap
} from 'lucide-react'

type TabType = 'users' | 'api' | 'integrations' | 'settings' | 'workflow' | 'notifications'

interface User {
  id: string
  name: string
  email: string
  role: 'Admin' | 'Medical Reviewer' | 'Content Manager' | 'Legal Reviewer' | 'Content Editor'
  department: string
  status: 'active' | 'inactive'
  lastLogin: Date
}

interface ApiKey {
  id: string
  name: string
  key: string
  created: Date
  lastUsed: Date
  status: 'active' | 'revoked'
  permissions: string[]
}

interface Integration {
  id: string
  name: string
  type: string
  status: 'connected' | 'disconnected' | 'error'
  lastSync: Date
  config: Record<string, any>
}

const mockUsers: User[] = [
  {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@pharmacompany.com',
    role: 'Admin',
    department: 'Marketing',
    status: 'active',
    lastLogin: new Date('2024-01-15 14:32:18')
  },
  {
    id: '2',
    name: 'Dr. Michael Chen',
    email: 'michael.chen@pharmacompany.com',
    role: 'Medical Reviewer',
    department: 'Medical Affairs',
    status: 'active',
    lastLogin: new Date('2024-01-15 13:45:22')
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@pharmacompany.com',
    role: 'Content Manager',
    department: 'Marketing',
    status: 'active',
    lastLogin: new Date('2024-01-15 11:22:09')
  },
  {
    id: '4',
    name: 'James Wilson',
    email: 'james.wilson@pharmacompany.com',
    role: 'Legal Reviewer',
    department: 'Legal',
    status: 'active',
    lastLogin: new Date('2024-01-14 16:20:45')
  },
  {
    id: '5',
    name: 'Amanda Foster',
    email: 'amanda.foster@pharmacompany.com',
    role: 'Content Editor',
    department: 'Marketing',
    status: 'inactive',
    lastLogin: new Date('2024-01-10 09:15:33')
  }
]

const rolePermissions: Record<string, string[]> = {
  'Admin': ['All permissions', 'User management', 'System configuration'],
  'Medical Reviewer': ['MLR review', 'Content viewing', 'Compliance reports'],
  'Content Manager': ['Content creation', 'Publishing', 'Analytics access'],
  'Legal Reviewer': ['Legal review', 'Compliance checking', 'Content approval'],
  'Content Editor': ['Content editing', 'Draft creation', 'Basic analytics']
}

export default function Administration() {
  const [activeTab, setActiveTab] = useState<TabType>('users')
  const [users] = useState<User[]>(mockUsers)
  const [showAddUser, setShowAddUser] = useState(false)
  const [showApiKey, setShowApiKey] = useState<string | null>(null)
  const [copiedKey, setCopiedKey] = useState<string | null>(null)

  const tabs = [
    { id: 'users' as TabType, label: 'Users & Permissions', icon: Users },
    { id: 'workflow' as TabType, label: 'Workflow Configuration', icon: GitBranch },
    { id: 'notifications' as TabType, label: 'Notifications', icon: Bell },
    { id: 'api' as TabType, label: 'API Keys', icon: Key },
    { id: 'integrations' as TabType, label: 'Integrations', icon: Link },
    { id: 'settings' as TabType, label: 'System Settings', icon: Settings },
  ]

  const handleCopyApiKey = (key: string) => {
    navigator.clipboard.writeText(key)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey(null), 2000)
  }

  const mockApiKeys: ApiKey[] = [
    {
      id: '1',
      name: 'PubMed Integration',
      key: 'pk_live_51234567890abcdef',
      created: new Date('2024-01-01'),
      lastUsed: new Date('2024-01-15'),
      status: 'active',
      permissions: ['read:literature', 'search:pubmed']
    },
    {
      id: '2',
      name: 'Clinical Trials API',
      key: 'pk_live_fedcba0987654321',
      created: new Date('2023-12-15'),
      lastUsed: new Date('2024-01-14'),
      status: 'active',
      permissions: ['read:trials', 'search:clinicaltrials']
    }
  ]

  const mockIntegrations: Integration[] = [
    {
      id: '1',
      name: 'Airtable',
      type: 'Database',
      status: 'connected',
      lastSync: new Date('2024-01-15 14:00:00'),
      config: { baseId: 'appXXXXXX', apiKey: '***' }
    },
    {
      id: '2',
      name: 'Slack',
      type: 'Communication',
      status: 'connected',
      lastSync: new Date('2024-01-15 13:30:00'),
      config: { workspace: 'pharmacompany', channel: '#content-updates' }
    },
    {
      id: '3',
      name: 'Google Analytics',
      type: 'Analytics',
      status: 'error',
      lastSync: new Date('2024-01-14 10:00:00'),
      config: { propertyId: 'GA-XXXXXX' }
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Administration</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage users, permissions, integrations, and system settings
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Workflow Configuration Tab */}
      {activeTab === 'workflow' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Workflow Configuration</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100">
              <RefreshCw className="h-4 w-4" />
              Reset to Defaults
            </button>
          </div>

          {/* SLA Configuration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              SLA Timers
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Review SLA
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue="24"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select className="block w-32 border-gray-300 rounded-md shadow-sm">
                      <option>Hours</option>
                      <option>Days</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Time allowed for SEO optimization</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Client Review SLA
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue="48"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select className="block w-32 border-gray-300 rounded-md shadow-sm">
                      <option>Hours</option>
                      <option>Days</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Time allowed for client approval</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    MLR Review SLA
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      defaultValue="72"
                      className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                    />
                    <select className="block w-32 border-gray-300 rounded-md shadow-sm">
                      <option>Hours</option>
                      <option>Days</option>
                    </select>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Time allowed for medical-legal review</p>
                </div>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Send reminder when 50% of SLA time has elapsed</span>
                </label>
                <label className="flex items-center gap-3 mt-2">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Auto-escalate when SLA is breached</span>
                </label>
              </div>
            </div>
          </div>

          {/* Auto-Assignment Rules */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-gray-600" />
              Auto-Assignment Rules
            </h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">SEO Review Assignment</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Method</label>
                    <select className="block w-full border-gray-300 rounded-md shadow-sm">
                      <option>Round-robin</option>
                      <option>Load balanced</option>
                      <option>By therapeutic area</option>
                      <option>Manual assignment</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Assignees</label>
                    <select multiple className="block w-full border-gray-300 rounded-md shadow-sm h-20">
                      <option selected>SEO Team Lead</option>
                      <option selected>Content Optimizer 1</option>
                      <option>Content Optimizer 2</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">Client Review Assignment</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Method</label>
                    <select className="block w-full border-gray-300 rounded-md shadow-sm">
                      <option>By client account</option>
                      <option>By product line</option>
                      <option>Round-robin</option>
                      <option>Manual assignment</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Auto-notify client contact via email</span>
                  </label>
                </div>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-3">MLR Review Assignment</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Method</label>
                    <select className="block w-full border-gray-300 rounded-md shadow-sm">
                      <option>By therapeutic area expertise</option>
                      <option>By risk level</option>
                      <option>Sequential review</option>
                      <option>Committee review</option>
                    </select>
                  </div>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Require minimum 2 reviewers for high-risk content</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Escalation Paths */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              Escalation Paths
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">SLA Breach Escalation</label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option>Notify Team Lead</option>
                    <option>Notify Department Manager</option>
                    <option>Notify VP of Marketing</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Compliance Flag Escalation</label>
                  <select className="block w-full border-gray-300 rounded-md shadow-sm">
                    <option>Notify Legal Team</option>
                    <option>Notify Compliance Officer</option>
                    <option>Notify Medical Affairs Director</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">High Priority Content Escalation</label>
                <div className="space-y-2">
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Auto-escalate high priority items after 24 hours</span>
                  </label>
                  <label className="flex items-center gap-3">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Send daily digest of overdue items to management</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Workflow Triggers */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Zap className="h-5 w-5 text-gray-600" />
              Workflow Triggers
            </h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Auto-advance to next stage</h4>
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">Automatically move content to the next review stage when approved</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Skip stages for low-risk content</h4>
                  <input type="checkbox" className="rounded text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">Allow direct submission to MLR for pre-approved content types</p>
              </div>
              
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Parallel review mode</h4>
                  <input type="checkbox" className="rounded text-primary-600" />
                </div>
                <p className="text-sm text-gray-600">Allow SEO and Client reviews to happen simultaneously</p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Save Workflow Settings
            </button>
          </div>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === 'notifications' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Notification Settings</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-md hover:bg-primary-100">
              <Bell className="h-4 w-4" />
              Test All Notifications
            </button>
          </div>

          {/* Email Notification Templates */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5 text-gray-600" />
              Email Notification Templates
            </h3>
            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">New Content Submission</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Recipients</label>
                    <select multiple className="block w-full border-gray-300 rounded-md shadow-sm h-16 text-sm">
                      <option selected>SEO Team</option>
                      <option>Content Managers</option>
                      <option>Submitter</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Subject Line</label>
                    <input
                      type="text"
                      defaultValue="[New Submission] {product_name} - {therapeutic_area}"
                      className="block w-full border-gray-300 rounded-md shadow-sm text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Review Stage Completion</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Trigger Events</label>
                    <div className="space-y-1 mt-1">
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                        <span className="text-sm text-gray-700">SEO Review Completed</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                        <span className="text-sm text-gray-700">Client Review Completed</span>
                      </label>
                      <label className="flex items-center gap-2">
                        <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                        <span className="text-sm text-gray-700">MLR Review Completed</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">SLA Warnings</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">First Warning</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="number" defaultValue="50" className="block w-20 border-gray-300 rounded-md shadow-sm text-sm" />
                        <span className="text-sm text-gray-600">% of SLA</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Second Warning</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="number" defaultValue="75" className="block w-20 border-gray-300 rounded-md shadow-sm text-sm" />
                        <span className="text-sm text-gray-600">% of SLA</span>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Final Warning</label>
                      <div className="flex items-center gap-2 mt-1">
                        <input type="number" defaultValue="90" className="block w-20 border-gray-300 rounded-md shadow-sm text-sm" />
                        <span className="text-sm text-gray-600">% of SLA</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-900">Compliance Alerts</h4>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Enabled</span>
                  </label>
                </div>
                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">High-risk content flagged</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Off-label promotion detected</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                    <span className="text-sm text-gray-700">Missing safety information</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Slack Integration */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-gray-600" />
              Slack Integration
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900">Connected to Workspace</p>
                    <p className="text-sm text-gray-600">3cubed-pharma.slack.com</p>
                  </div>
                </div>
                <button className="text-sm text-red-600 hover:text-red-700">Disconnect</button>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Channel Notifications</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">New submissions</span>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <select className="text-sm border-gray-300 rounded-md">
                        <option>#content-updates</option>
                        <option>#seo-team</option>
                        <option>#general</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">MLR approvals</span>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <select className="text-sm border-gray-300 rounded-md">
                        <option>#mlr-approvals</option>
                        <option>#content-updates</option>
                        <option>#general</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-700">Compliance flags</span>
                    <div className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <select className="text-sm border-gray-300 rounded-md">
                        <option>#compliance-alerts</option>
                        <option>#mlr-team</option>
                        <option>#urgent</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gray-600" />
              Alert Thresholds
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Queue Size Alert
                  </label>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">SEO Queue:</span>
                      <input type="number" defaultValue="20" className="w-20 border-gray-300 rounded-md shadow-sm text-sm" />
                      <span className="text-sm text-gray-600">items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">Client Queue:</span>
                      <input type="number" defaultValue="15" className="w-20 border-gray-300 rounded-md shadow-sm text-sm" />
                      <span className="text-sm text-gray-600">items</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600 w-24">MLR Queue:</span>
                      <input type="number" defaultValue="10" className="w-20 border-gray-300 rounded-md shadow-sm text-sm" />
                      <span className="text-sm text-gray-600">items</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Overdue Content Alert
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <span className="text-sm text-gray-700">Alert when any item exceeds SLA</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <span className="text-sm text-gray-700">Alert when 5+ items are overdue</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Digest Settings */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-600" />
              Digest Email Configuration
            </h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Daily Digest</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Send Time</label>
                      <input type="time" defaultValue="09:00" className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Recipients</label>
                      <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm">
                        <option>All Team Leads</option>
                        <option>Management Only</option>
                        <option>Custom List</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Weekly Summary</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Send Day</label>
                      <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm">
                        <option>Monday</option>
                        <option>Friday</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-600">
                      Includes: Completion metrics, SLA performance, top performers
                    </div>
                  </div>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Monthly Report</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                      <span className="text-sm text-gray-700">Enabled</span>
                    </label>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Send On</label>
                      <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm text-sm">
                        <option>First day of month</option>
                        <option>Last day of month</option>
                      </select>
                    </div>
                    <div className="text-sm text-gray-600">
                      Includes: Full analytics, compliance metrics, trend analysis
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
              Preview Templates
            </button>
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Save Notification Settings
            </button>
          </div>
        </div>
      )}

      {/* Users & Permissions Tab */}
      {activeTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">User Management</h2>
            <button
              onClick={() => setShowAddUser(true)}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
            >
              <Plus className="h-4 w-4" />
              Add User
            </button>
          </div>

          <div className="bg-white shadow rounded-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Login
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{user.name}</div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.lastLogin.toLocaleDateString()} {user.lastLogin.toLocaleTimeString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-primary-600 hover:text-primary-900 mr-3">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button className="text-red-600 hover:text-red-900">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Role Permissions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Role Permissions</h3>
            <div className="space-y-4">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="border-b border-gray-200 pb-4 last:border-0">
                  <h4 className="font-medium text-gray-900 mb-2">{role}</h4>
                  <div className="flex flex-wrap gap-2">
                    {permissions.map((permission, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700"
                      >
                        <Shield className="h-3 w-3" />
                        {permission}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* API Keys Tab */}
      {activeTab === 'api' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              <Plus className="h-4 w-4" />
              Generate New Key
            </button>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    API Key
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Last Used
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {mockApiKeys.map((apiKey) => (
                  <tr key={apiKey.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{apiKey.name}</div>
                      <div className="text-xs text-gray-500">
                        {apiKey.permissions.join(', ')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <code className="text-sm text-gray-900 font-mono">
                          {showApiKey === apiKey.id ? apiKey.key : '••••••••••••••••'}
                        </code>
                        <button
                          onClick={() => setShowApiKey(showApiKey === apiKey.id ? null : apiKey.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {showApiKey === apiKey.id ? 
                            <EyeOff className="h-4 w-4" /> : 
                            <Eye className="h-4 w-4" />
                          }
                        </button>
                        <button
                          onClick={() => handleCopyApiKey(apiKey.key)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          {copiedKey === apiKey.key ? 
                            <CheckCircle className="h-4 w-4 text-green-600" /> : 
                            <Copy className="h-4 w-4" />
                          }
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apiKey.created.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {apiKey.lastUsed.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        apiKey.status === 'active' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {apiKey.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-red-600 hover:text-red-900">
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Connected Integrations</h2>
            <button className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              <Plus className="h-4 w-4" />
              Add Integration
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {mockIntegrations.map((integration) => (
              <div key={integration.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{integration.name}</h3>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    integration.status === 'connected' ? 'bg-green-100 text-green-800' :
                    integration.status === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {integration.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-4">{integration.type}</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500">Last Sync:</span>
                    <span className="text-gray-900">
                      {integration.lastSync.toLocaleString()}
                    </span>
                  </div>
                  {Object.entries(integration.config).map(([key, value]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-gray-500">{key}:</span>
                      <span className="text-gray-900 font-mono text-xs">{value}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex gap-2">
                  <button className="flex-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    Configure
                  </button>
                  <button className="px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200">
                    <RefreshCw className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* System Settings Tab */}
      {activeTab === 'settings' && (
        <div className="space-y-6">
          <h2 className="text-lg font-medium text-gray-900">System Settings</h2>
          
          <div className="bg-white rounded-lg shadow divide-y divide-gray-200">
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Email Configuration</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">SMTP Server</label>
                  <input
                    type="text"
                    defaultValue="smtp.gmail.com"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Port</label>
                    <input
                      type="text"
                      defaultValue="587"
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Encryption</label>
                    <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                      <option>TLS</option>
                      <option>SSL</option>
                      <option>None</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Security Settings</h3>
              <div className="space-y-4">
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Enforce two-factor authentication</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Session timeout after 30 minutes</span>
                </label>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Log all API access</span>
                </label>
              </div>
            </div>
            
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-900 mb-4">Compliance Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Data Retention Period</label>
                  <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                    <option>7 years (FDA requirement)</option>
                    <option>5 years</option>
                    <option>3 years</option>
                  </select>
                </div>
                <label className="flex items-center gap-3">
                  <input type="checkbox" defaultChecked className="rounded text-primary-600" />
                  <span className="text-sm text-gray-700">Enable 21 CFR Part 11 compliance mode</span>
                </label>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <button className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700">
              Save Settings
            </button>
          </div>
        </div>
      )}

      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Add New User</h3>
            </div>
            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="john.doe@pharmacompany.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <select className="mt-1 block w-full border-gray-300 rounded-md shadow-sm">
                  <option>Content Editor</option>
                  <option>Content Manager</option>
                  <option>Medical Reviewer</option>
                  <option>Legal Reviewer</option>
                  <option>Admin</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Department</label>
                <input
                  type="text"
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
                  placeholder="Marketing"
                />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowAddUser(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Add user logic here
                  setShowAddUser(false)
                }}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-md hover:bg-primary-700"
              >
                Add User
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
