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
  RefreshCw
} from 'lucide-react'

type TabType = 'users' | 'api' | 'integrations' | 'settings'

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
