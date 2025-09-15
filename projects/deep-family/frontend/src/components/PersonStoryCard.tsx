import { useMemo, useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { useTreeData } from '../context/TreeDataContext'
import { 
  User, 
  MapPin, 
  Calendar, 
  Book, 
  Star, 
  Clock, 
  FileText, 
  Hash, 
  Award,
  ChevronRight,
  Eye
} from 'lucide-react'
import { NodeData, hasDetailedStory as hasDetailedStoryFn, birthDateString, deathDateString, genderText as genderTextFn, formatUnixDate, isMinted } from '../types/graph'
import { shortHash } from '../types/graph'

interface PersonStoryCardProps {
  person: NodeData
  viewMode: 'grid' | 'list'
  onClick: () => void
}

export default function PersonStoryCard({ person, viewMode, onClick }: PersonStoryCardProps) {
  const { t } = useTranslation()
  const { preloadStoryData } = useTreeData()

  const hasDetailedStory = useMemo(() => hasDetailedStoryFn(person), [person])

  // Preload story data on hover
  const handleMouseEnter = useCallback(() => {
    if (person.tokenId && hasDetailedStory) {
      preloadStoryData(person.tokenId)
    }
  }, [person.tokenId, hasDetailedStory, preloadStoryData])

  // Format date
  const formatDate = useMemo(() => ({
    birth: birthDateString(person),
    death: deathDateString(person)
  }), [person])

  // Gender display
  const genderText = useMemo(() => genderTextFn(person.gender, t as any), [person.gender, t])

  // Story preview
  const storyPreview = useMemo(() => {
    if (!person.story) return ''
    return person.story.length > 150 ? person.story.substring(0, 150) + '...' : person.story
  }, [person.story])

  if (viewMode === 'list') {
    return (
      <div 
        onMouseEnter={handleMouseEnter}
        className="group bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden"
      >
        {/* Subtle background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/5 pointer-events-none rounded-2xl"></div>
        
        <div className="relative flex items-start gap-4 sm:gap-6">
          {/* Avatar/Icon */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <User className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                  {person.fullName || `Person #${shortHash(person.personHash)}`}
                </h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs sm:text-sm text-gray-600 dark:text-gray-400 break-normal">
                  {genderText && (
                    <span className="flex items-center gap-1 whitespace-nowrap">
                      <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {genderText}
                    </span>
                  )}
                  {isMinted(person) && (
                    <span className="flex items-center gap-1 font-mono whitespace-nowrap">
                      <Hash className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {person.tokenId}
                      {person.endorsementCount !== undefined && person.endorsementCount > 0 && (
                        <span className="flex items-center gap-1 whitespace-nowrap">
                          <span className="text-gray-300 dark:text-gray-600 hidden sm:inline">•</span>
                          <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-yellow-500" />
                          <span className="text-yellow-600 dark:text-yellow-400">{person.endorsementCount}</span>
                        </span>
                      )}
                    </span>
                  )}
                </div>
              </div>
              
              {/* Badges */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {hasDetailedStory && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-[10px] sm:text-xs font-medium whitespace-nowrap">
                    <Book className="w-3 h-3" />
                    {t('people.hasStory', 'Story')}
                  </span>
                )}
                {isMinted(person) && (
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-[10px] sm:text-xs font-medium whitespace-nowrap">
                    <Award className="w-3 h-3" />
                    {t('people.hasNFT', 'NFT')}
                  </span>
                )}
              </div>
            </div>

            {/* Dates and Locations */}
            {(formatDate.birth || formatDate.death || person.birthPlace || person.deathPlace) && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 sm:gap-3 mb-3 sm:mb-4">
                {(formatDate.birth || person.birthPlace) && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-500 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('people.born', 'Born')}: </span>
                    <span className="font-mono text-[10px] sm:text-xs truncate">
                      {[formatDate.birth, person.birthPlace].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}
                {(formatDate.death || person.deathPlace) && (
                  <div className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-500 flex-shrink-0" />
                    <span className="hidden sm:inline">{t('people.died', 'Died')}: </span>
                    <span className="font-mono text-[10px] sm:text-xs truncate">
                      {[formatDate.death, person.deathPlace].filter(Boolean).join(' · ')}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Story Preview */}
            {storyPreview && (
              <div className="mb-3 sm:mb-4">
                <p className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-3">
                  {storyPreview}
                </p>
              </div>
            )}

            {/* Footer */}
            <div className="flex items-center justify-between pt-3 sm:pt-0">
              <div className="flex items-center gap-3 text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                {person.timestamp && (
                  <span className="flex items-center gap-1 whitespace-nowrap">
                    <Clock className="w-3 h-3" />
                    {formatUnixDate(person.timestamp)}
                  </span>
                )}
                {person.storyMetadata && (
                  <span className="hidden sm:flex items-center gap-1 whitespace-nowrap">
                    <FileText className="w-3 h-3" />
                    {t('people.chunks', '{{count}} chunks', { count: person.storyMetadata.totalChunks })}
                  </span>
                )}
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  onClick()
                }}
                className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:gap-2 transition-all duration-200 p-2 -m-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
              >
                <Eye className="w-3 h-3" />
                {t('people.viewDetails', 'View')}
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Grid view
  return (
    <div 
      onMouseEnter={handleMouseEnter}
      className="group bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50 p-6 backdrop-blur-xl transition-all duration-300 hover:-translate-y-2 relative overflow-hidden h-full flex flex-col"
    >
      {/* Subtle background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 via-transparent to-purple-50/20 dark:from-blue-900/10 dark:via-transparent dark:to-purple-900/5 pointer-events-none rounded-2xl"></div>
      
      <div className="relative flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                {person.fullName || `Person #${shortHash(person.personHash)}`}
              </h3>
              {isMinted(person) && (
                <div className="flex items-center gap-1 text-xs font-mono text-gray-500 dark:text-gray-400">
                  <span>#{person.tokenId}</span>
                  {person.endorsementCount !== undefined && person.endorsementCount > 0 && (
                    <>
                      <span className="text-gray-300 dark:text-gray-600 mx-1">•</span>
                      <Star className="w-3 h-3 text-yellow-500" />
                      <span className="text-yellow-600 dark:text-yellow-400">{person.endorsementCount}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
          
          {/* Status Badges */}
          <div className="flex flex-col gap-1">
            {hasDetailedStory && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-medium">
                <Book className="w-3 h-3" />
              </span>
            )}
            {isMinted(person) && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 text-xs font-medium">
                <Award className="w-3 h-3" />
              </span>
            )}
          </div>
        </div>

        {/* Basic Info */}
        <div className="space-y-2 mb-4 flex-1">
          {genderText && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <User className="w-4 h-4" />
              <span>{genderText}</span>
            </div>
          )}
          
          {(formatDate.birth || person.birthPlace) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <Calendar className="w-4 h-4 text-green-500" />
              <span className="text-xs font-mono truncate">
                {[formatDate.birth, person.birthPlace].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {(formatDate.death || person.deathPlace) && (
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
              <MapPin className="w-4 h-4 text-gray-500" />
              <span className="text-xs font-mono truncate">
                {[formatDate.death, person.deathPlace].filter(Boolean).join(' · ')}
              </span>
            </div>
          )}

          {/* Story Preview */}
          {storyPreview && (
            <div className="mt-3 p-3 bg-gray-50/50 dark:bg-gray-800/30 rounded-lg border border-gray-200/50 dark:border-gray-700/30">
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed line-clamp-4">
                {storyPreview}
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-200/50 dark:border-gray-700/30">
          <div className="flex items-center gap-2">
            {person.timestamp && (
              <span className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <Clock className="w-3 h-3" />
                {formatUnixDate(person.timestamp)}
              </span>
            )}
          </div>
          
          <button 
            onClick={(e) => {
              e.stopPropagation()
              onClick()
            }}
            className="flex items-center gap-1 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium hover:gap-2 transition-all duration-200 p-2 -m-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/30"
          >
            <Eye className="w-3 h-3" />
            {t('people.viewDetails', 'View')}
          </button>
        </div>
      </div>
    </div>
  )
}
