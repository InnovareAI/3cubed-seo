import { ReactNode, useState } from 'react'

interface TabProps {
  label: string
  icon?: ReactNode
  children: ReactNode
}

export function Tab({ children }: TabProps) {
  return <>{children}</>
}

interface TabsProps {
  children: ReactNode
}

export function Tabs({ children }: TabsProps) {
  const [activeTab, setActiveTab] = useState(0)
  
  const tabs = Array.isArray(children) ? children : [children]
  const validTabs = tabs.filter(tab => tab && tab.props)
  
  return (
    <div>
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
          {validTabs.map((tab, index) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`
                flex items-center gap-2 whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium
                ${activeTab === index
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                }
              `}
            >
              {tab.props.icon}
              {tab.props.label}
            </button>
          ))}
        </nav>
      </div>
      <div>
        {validTabs[activeTab]}
      </div>
    </div>
  )
}
