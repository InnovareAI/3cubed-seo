import { Fragment, ReactNode, useState } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { X, ChevronDown, ChevronUp } from 'lucide-react'

interface UnifiedReviewModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  subtitle: string
  icon: ReactNode
  sections: ReviewSection[]
  actions: ReviewAction[]
  headerBadge?: ReactNode
}

interface ReviewSection {
  id: string
  title: string
  icon: ReactNode
  content: ReactNode
  collapsible?: boolean
  defaultExpanded?: boolean
}

interface ReviewAction {
  label: string
  icon: ReactNode
  onClick: () => void
  variant: 'primary' | 'secondary' | 'danger'
  disabled?: boolean
}

export default function UnifiedReviewModal({
  isOpen,
  onClose,
  title,
  subtitle,
  icon,
  sections,
  actions,
  headerBadge
}: UnifiedReviewModalProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultExpanded !== false).map(s => s.id))
  )

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections)
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId)
    } else {
      newExpanded.add(sectionId)
    }
    setExpandedSections(newExpanded)
  }

  const getActionClasses = (variant: ReviewAction['variant']) => {
    switch (variant) {
      case 'primary':
        return 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500'
      case 'secondary':
        return 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500'
      case 'danger':
        return 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
    }
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 z-10">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="text-gray-600">{icon}</div>
                      <div>
                        <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 flex items-center gap-2">
                          {title}
                          {headerBadge}
                        </Dialog.Title>
                        <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
                      onClick={onClose}
                    >
                      <X className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-4 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-4">
                    {sections.map((section) => (
                      <div key={section.id} className="border rounded-lg overflow-hidden">
                        {section.collapsible ? (
                          <>
                            <button
                              onClick={() => toggleSection(section.id)}
                              className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="text-gray-600">{section.icon}</div>
                                <h3 className="font-medium text-gray-900">{section.title}</h3>
                              </div>
                              {expandedSections.has(section.id) ? (
                                <ChevronUp className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-400" />
                              )}
                            </button>
                            {expandedSections.has(section.id) && (
                              <div className="p-4 border-t bg-white">
                                {section.content}
                              </div>
                            )}
                          </>
                        ) : (
                          <div className="p-4">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-gray-600">{section.icon}</div>
                              <h3 className="font-medium text-gray-900">{section.title}</h3>
                            </div>
                            {section.content}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Actions */}
                <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t border-gray-200">
                  <div className="flex justify-end gap-3">
                    {actions.map((action, index) => (
                      <button
                        key={index}
                        onClick={action.onClick}
                        disabled={action.disabled}
                        className={`inline-flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${getActionClasses(action.variant)}`}
                      >
                        {action.icon}
                        <span className="ml-2">{action.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
