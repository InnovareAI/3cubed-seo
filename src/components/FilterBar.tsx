import { Search, Filter } from 'lucide-react'

interface FilterBarProps {
  searchTerm: string
  onSearchChange: (value: string) => void
  priorityFilter: string
  onPriorityChange: (value: string) => void
  therapeuticAreaFilter: string
  onTherapeuticAreaChange: (value: string) => void
  therapeuticAreas: string[]
  additionalFilters?: React.ReactNode
}

export default function FilterBar({
  searchTerm,
  onSearchChange,
  priorityFilter,
  onPriorityChange,
  therapeuticAreaFilter,
  onTherapeuticAreaChange,
  therapeuticAreas,
  additionalFilters
}: FilterBarProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search submissions..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10 pr-3 py-2 border border-gray-300 rounded-md w-full text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        
        {/* Priority Filter */}
        <div className="flex items-center gap-2">
          <Filter className="h-5 w-5 text-gray-400" />
          <select
            value={priorityFilter}
            onChange={(e) => onPriorityChange(e.target.value)}
            className="border border-gray-300 rounded-md text-sm flex-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
          >
            <option value="all">All Priorities</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium Priority</option>
            <option value="low">Low Priority</option>
          </select>
        </div>
        
        {/* Therapeutic Area Filter */}
        <div>
          <select
            value={therapeuticAreaFilter}
            onChange={(e) => onTherapeuticAreaChange(e.target.value)}
            className="border border-gray-300 rounded-md text-sm w-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 px-3 py-2"
          >
            <option value="all">All Therapeutic Areas</option>
            {therapeuticAreas.map(area => (
              <option key={area} value={area}>{area}</option>
            ))}
          </select>
        </div>
        
        {/* Additional Filters Slot */}
        {additionalFilters}
      </div>
    </div>
  )
}
