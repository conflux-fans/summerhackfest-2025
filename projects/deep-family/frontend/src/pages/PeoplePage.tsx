import { useState, useMemo, useEffect, useLayoutEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Search, Users, Book, Grid, List as ListIcon, User, Hash, X } from 'lucide-react'
import { NodeData, isMinted } from '../types/graph'
import { useTreeData } from '../context/TreeDataContext'
import PersonStoryCard from '../components/PersonStoryCard'
import StoryChunksModal from '../components/StoryChunksModal'
import PageContainer from '../components/PageContainer'
import SortButton from '../components/SortButton'

type ViewMode = 'grid' | 'list'
type FilterType = 'all' | 'by_create_time' | 'by_name' | 'by_endorsement' | 'by_birth_year'
type SortOrder = 'asc' | 'desc'

export default function PeoplePage() {
  const { t } = useTranslation()
  const { nodesData, loading, getNodeByTokenId } = useTreeData()
  const location = useLocation()
  const navigate = useNavigate()
  // Track whether modal was opened by clicking inside this page
  const openedViaClickRef = useRef(false)
  
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [filterType, setFilterType] = useState<FilterType>('all')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [selectedPerson, setSelectedPerson] = useState<NodeData | null>(null)
  const [selectedAddresses, setSelectedAddresses] = useState<string[]>([])
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [addressInput, setAddressInput] = useState('')
  const [tagInput, setTagInput] = useState('')

  // Handle adding addresses
  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = addressInput.trim()
      if (trimmed && !selectedAddresses.includes(trimmed)) {
        setSelectedAddresses(prev => [...prev, trimmed])
        setAddressInput('')
      }
    }
  }

  const removeAddress = (address: string) => {
    setSelectedAddresses(prev => prev.filter(a => a !== address))
  }

  // Handle adding tags
  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = tagInput.trim()
      if (trimmed && !selectedTags.includes(trimmed)) {
        setSelectedTags(prev => [...prev, trimmed])
        setTagInput('')
      }
    }
  }

  const removeTag = (tag: string) => {
    setSelectedTags(prev => prev.filter(t => t !== tag))
  }

  // Get person data from TreeDataContext, only show people with NFTs (people with stories)
  const people = useMemo(() => {
    const peopleWithNFTs = Object.values(nodesData)
      .filter(person => isMinted(person))

    // Group by personHash to get unique people (since one person can have multiple NFT versions)
    const uniquePeopleMap = new Map<string, NodeData>()
    
    peopleWithNFTs.forEach(person => {
      const personHash = person.personHash
      // If we haven't seen this personHash before, or if this version has more story chunks, use this version
      const existing = uniquePeopleMap.get(personHash)
      if (!existing || 
          (person.storyMetadata?.totalChunks || 0) > (existing.storyMetadata?.totalChunks || 0)) {
        uniquePeopleMap.set(personHash, person)
      }
    })

    return Array.from(uniquePeopleMap.values())
  }, [nodesData])

  const data = useMemo(() => {
    // Calculate total NFT count (all records with NFTs)
    const totalNFTs = Object.values(nodesData).filter(person => isMinted(person)).length

    return {
      people,
      totalCount: people.length, // Unique people count (by personHash)
      totalNFTs, // Total NFT count (can be more than people count)
      loading
    }
  }, [people, loading, nodesData])

  // Sync selectedPerson with URL query param (?person=tokenId|personHash|id)
  useLayoutEffect(() => {
    const sp = new URLSearchParams(location.search)
    const q = sp.get('person')
    if (!q) {
      if (selectedPerson) setSelectedPerson(null)
      return
    }
    // Prefer exact tokenId match from full nodesData (covers non-representative versions)
    const byToken = Object.values(nodesData).find((x) => x.tokenId && String(x.tokenId) === q)
    const p = byToken || people.find(
      (x) => (x.tokenId && String(x.tokenId) === q) || x.personHash === q || String(x.id) === q
    )
    // Always sync to the latest data object for the same person
    if (p) {
      setSelectedPerson(p)
    } else {
      // Cold start for tokenId deep link: fetch minimal details
      const isHexHash = /^0x[a-fA-F0-9]{64}$/.test(q)
      if (!isHexHash) {
        ;(async () => {
          const fetched = await getNodeByTokenId(q)
          if (fetched) setSelectedPerson(fetched)
        })()
      }
    }
  }, [location.search, people, nodesData])

  // Open person: push state with ?person=...
  const openPerson = (person: NodeData) => {
    openedViaClickRef.current = true
    const sp = new URLSearchParams(location.search)
    sp.set('person', String(person.tokenId || person.personHash || person.id))
    navigate({ pathname: location.pathname, search: sp.toString() })
    // Optimistic local state for immediate render
    setSelectedPerson(person)
  }

  // Close person: back if opened via click, else replace to clear query
  const closePerson = () => {
    const sp = new URLSearchParams(location.search)
    sp.delete('person')
    if (openedViaClickRef.current) {
      openedViaClickRef.current = false
      navigate(-1)
    } else {
      navigate({ pathname: location.pathname, search: sp.toString() }, { replace: true })
    }
    setSelectedPerson(null)
  }

  // Search and filter logic
  const filteredPeople = useMemo(() => {
    let filtered = data.people

    // Search filter
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase()
      filtered = filtered.filter(person => 
        person.fullName?.toLowerCase().includes(term) ||
        person.personHash.toLowerCase().includes(term) ||
        person.birthPlace?.toLowerCase().includes(term) ||
        person.deathPlace?.toLowerCase().includes(term) ||
        person.story?.toLowerCase().includes(term) ||
        person.addedBy?.toLowerCase().includes(term) ||
        person.tag?.toLowerCase().includes(term)
      )
    }

    // Address filter - match if person's address is in selected addresses
    if (selectedAddresses.length > 0) {
      filtered = filtered.filter(person => 
        selectedAddresses.some(address => 
          person.addedBy?.toLowerCase().includes(address.toLowerCase())
        )
      )
    }

    // Tag filter - match if person's tag is in selected tags
    if (selectedTags.length > 0) {
      filtered = filtered.filter(person => 
        selectedTags.some(tag => 
          person.tag?.toLowerCase().includes(tag.toLowerCase())
        )
      )
    }

    // Sort and filter
    switch (filterType) {
      case 'all':
        // Sort by tokenId with sort order
        filtered = filtered.sort((a, b) => {
          const aTokenId = parseInt(a.tokenId || '0')
          const bTokenId = parseInt(b.tokenId || '0')
          return sortOrder === 'desc' ? bTokenId - aTokenId : aTokenId - bTokenId
        })
        break
      case 'by_create_time':
        filtered = filtered.sort((a, b) => {
          const timeA = a.timestamp || 0
          const timeB = b.timestamp || 0
          return sortOrder === 'desc' ? timeB - timeA : timeA - timeB
        })
        break
      case 'by_name':
        filtered = filtered.sort((a, b) => {
          const nameA = a.fullName || ''
          const nameB = b.fullName || ''
          const result = nameA.localeCompare(nameB)
          return sortOrder === 'desc' ? -result : result
        })
        break
      case 'by_endorsement':
        filtered = filtered.sort((a, b) => {
          const countA = a.endorsementCount || 0
          const countB = b.endorsementCount || 0
          return sortOrder === 'desc' ? countB - countA : countA - countB
        })
        break
      case 'by_birth_year':
        filtered = filtered.sort((a, b) => {
          const aYear = a.birthYear || 0
          const bYear = b.birthYear || 0
          if (aYear === 0 && bYear === 0) return 0
          if (aYear === 0) return sortOrder === 'desc' ? -1 : 1
          if (bYear === 0) return sortOrder === 'desc' ? 1 : -1
          return sortOrder === 'desc' ? bYear - aYear : aYear - bYear
        })
        break
    }

    return filtered
  }, [data.people, searchTerm, filterType, sortOrder, selectedAddresses, selectedTags])


  // No longer full-page loading overlay; changed to light hint in top-right, page always interactive

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-white dark:from-gray-950 dark:to-gray-900">
      {/* Hero Header */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-indigo-500/10 dark:from-blue-600/20 dark:via-purple-600/15 dark:to-indigo-600/20 py-16 mb-8">
        {/* Background decorations */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-20 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-cyan-400/15 rounded-full blur-2xl animate-float"></div>
          <div className="absolute top-20 right-16 w-40 h-40 bg-gradient-to-br from-purple-400/15 to-pink-400/12 rounded-full blur-2xl animate-pulse-soft"></div>
          <div className="absolute bottom-10 left-1/3 w-24 h-24 bg-gradient-to-br from-indigo-400/25 to-blue-400/20 rounded-full blur-xl animate-bounce-gentle"></div>
        </div>

        <PageContainer className="relative text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 border border-blue-200/50 dark:border-blue-600/30 mb-6 backdrop-blur-sm">
            <Book className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-700 dark:text-blue-300">{t('people.badge', 'Family Stories')}</span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 dark:from-blue-400 dark:via-purple-400 dark:to-indigo-400 bg-clip-text text-transparent">
              {t('people.title', 'Family Stories Encyclopedia')}
            </span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-400 max-w-4xl mx-auto mb-8 leading-relaxed">
            {t('people.subtitle', 'Discover the rich narratives and biographical details of family members preserved on the blockchain')}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto">
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/20">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{data.totalCount}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('people.totalPeople', 'Total People')}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/20">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                {data.people.filter(p => p.storyMetadata && p.storyMetadata.totalChunks > 0).length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">{t('people.withStories', 'With Detailed Stories')}</div>
            </div>
            <div className="bg-white/40 dark:bg-gray-800/40 backdrop-blur-sm rounded-2xl p-4 border border-white/20 dark:border-gray-700/20">
              <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400 mb-1">{data.totalNFTs}</div>
              <div className="text-sm text-gray-600 dark:text-gray-400">{t('people.withNFTs', 'With NFTs')}</div>
            </div>
          </div>
        </PageContainer>
      </section>

      {/* Search and Filter Controls */}
      {/* Removed inner PageContainer to allow full width inside outer layout container */}
      <div className="w-full mb-8">
        <div className="bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-lg border border-gray-200/50 dark:border-gray-700/50 p-6 backdrop-blur-xl">
          <div className="flex flex-col gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t('people.searchPlaceholder', 'Search by name, location, or story content...')}
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              />
            </div>

            {/* Advanced Filters */}
            <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              {t('people.filterRules', 'Filter Rules')}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Creator Address Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={addressInput}
                    onChange={(e) => setAddressInput(e.target.value)}
                    onKeyDown={handleAddressKeyDown}
                    placeholder={t('people.filterByAddress', 'Add creator address (Enter or comma to add)...')}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                {selectedAddresses.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedAddresses.map((address) => (
                      <div
                        key={address}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                      >
                        <span className="font-mono text-xs truncate max-w-20">{address}</span>
                        <button
                          onClick={() => removeAddress(address)}
                          className="p-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tag Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder={t('people.filterByTag', 'Add tag (Enter or comma to add)...')}
                    className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  />
                </div>
                {selectedTags.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTags.map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 rounded-full text-sm"
                      >
                        <span>{tag}</span>
                        <button
                          onClick={() => removeTag(tag)}
                          className="p-0.5 rounded-full hover:bg-purple-200 dark:hover:bg-purple-800/50 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedAddresses.length > 0 || selectedTags.length > 0 || searchTerm) && (
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setSelectedAddresses([])
                    setSelectedTags([])
                    setAddressInput('')
                    setTagInput('')
                    setSearchTerm('')
                    setFilterType('all')
                    setSortOrder('desc')
                  }}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
                >
                  {t('people.clearFilters', 'Clear all filters')}
                </button>
              </div>
            )}

            <div className="flex flex-col gap-4">
              {/* Filters */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <div className="sm:flex-none">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t('people.sortRules', 'Sort Rules')}
                </div>
                <div className="inline-flex flex-wrap items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-3 py-2 w-fit">
                <SortButton
                  label={t('people.filterAll', 'Token ID')}
                  isActive={filterType === 'all'}
                  sortOrder={sortOrder}
                  onClick={() => setFilterType('all')}
                  onSortOrderChange={setSortOrder}
                  showSortArrows={true}
                />
                <SortButton
                  label={t('people.filterByCreateTime', 'Creation Time')}
                  isActive={filterType === 'by_create_time'}
                  sortOrder={sortOrder}
                  onClick={() => setFilterType('by_create_time')}
                  onSortOrderChange={setSortOrder}
                  showSortArrows={true}
                />
                <SortButton
                  label={t('people.filterByName', 'Name')}
                  isActive={filterType === 'by_name'}
                  sortOrder={sortOrder}
                  onClick={() => setFilterType('by_name')}
                  onSortOrderChange={setSortOrder}
                  showSortArrows={true}
                />
                <SortButton
                  label={t('people.filterByEndorsement', 'Endorsements')}
                  isActive={filterType === 'by_endorsement'}
                  sortOrder={sortOrder}
                  onClick={() => setFilterType('by_endorsement')}
                  onSortOrderChange={setSortOrder}
                  showSortArrows={true}
                />
                <SortButton
                  label={t('people.filterByBirthYear', 'Birth Year')}
                  isActive={filterType === 'by_birth_year'}
                  sortOrder={sortOrder}
                  onClick={() => setFilterType('by_birth_year')}
                  onSortOrderChange={setSortOrder}
                  showSortArrows={true}
                />
              </div>
              </div>

              {/* View Mode Toggle */}
              <div className="flex-shrink-0">
                <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                  {t('people.viewMode', 'View Mode')}
                </div>
                <div className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-xl px-2 py-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`px-2 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                  title={t('people.gridView', 'Grid View')}
                >
                  <Grid className="w-4 h-4" />
                  <span className="text-xs">{t('people.gridView', 'Grid View')}</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 py-1.5 rounded-lg transition-colors inline-flex items-center gap-1.5 ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white dark:hover:bg-gray-700'
                  }`}
                  title={t('people.listView', 'List View')}
                >
                  <ListIcon className="w-4 h-4" />
                  <span className="text-xs">{t('people.listView', 'List View')}</span>
                </button>
              </div>
              </div>
            </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2" aria-live="polite">
              {data.loading && (
                <>
                  <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <span>{t('people.syncing', 'Syncing...')}</span>
                  <span className="text-gray-300 dark:text-gray-600">·</span>
                </>
              )}
              <span>
                {selectedAddresses.length > 0 || selectedTags.length > 0 ? 
                  t('people.filteredResults', '{{count}} filtered results', { count: filteredPeople.length }) :
                  t('people.allResults', '{{count}} total results', { count: filteredPeople.length })
                }
              </span>
            </div>
          </div>

        </div>
      </div>

      {/* Main Content */}
      <div className="w-full pb-12">
        {filteredPeople.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-xl text-gray-500 dark:text-gray-400 mb-2">
              {t('people.noResults', 'No stories found')}
            </p>
            <p className="text-gray-400 dark:text-gray-500">
              {t('people.noResultsDesc', 'Try adjusting your search terms or filters')}
            </p>
          </div>
        ) : (
          <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1 max-w-4xl mx-auto'}`}>
            {filteredPeople.map((person) => (
              <PersonStoryCard
                key={person.id}
                person={person}
                viewMode={viewMode}
                onClick={() => openPerson(person)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Story Chunks Viewer Modal */}
      {selectedPerson && (
        <StoryChunksModal
          person={selectedPerson}
          isOpen={!!selectedPerson}
          onClose={closePerson}
        />
      )}
    </div>
  )
}
