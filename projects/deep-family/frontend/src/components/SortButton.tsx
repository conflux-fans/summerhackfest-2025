import { ChevronUp, ChevronDown } from 'lucide-react'

type SortOrder = 'asc' | 'desc'

interface SortButtonProps {
  label: string
  isActive: boolean
  sortOrder: SortOrder
  onClick: () => void
  onSortOrderChange: (order: SortOrder) => void
  showSortArrows?: boolean
}

export default function SortButton({ 
  label, 
  isActive, 
  sortOrder, 
  onClick, 
  onSortOrderChange,
  showSortArrows = false 
}: SortButtonProps) {
  return (
    <div className={`flex items-center gap-1 rounded-lg transition-colors px-2 sm:px-4 ${
      isActive
        ? 'bg-blue-600 text-white shadow-sm'
        : 'bg-gray-50 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-600'
    }`}>
      <button
        onClick={onClick}
        className="py-2 text-xs sm:text-sm font-medium transition-colors whitespace-nowrap"
      >
        {label}
      </button>
      {isActive && showSortArrows && (
        <div className="flex flex-col -space-y-1">
          <button
            onClick={() => onSortOrderChange('asc')}
            className={`p-0.5 transition-colors ${
              sortOrder === 'asc' ? 'text-white' : 'text-gray-300 hover:text-gray-100'
            }`}
            aria-label="Sort ascending"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={() => onSortOrderChange('desc')}
            className={`p-0.5 transition-colors ${
              sortOrder === 'desc' ? 'text-white' : 'text-gray-300 hover:text-gray-100'
            }`}
            aria-label="Sort descending"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  )
}