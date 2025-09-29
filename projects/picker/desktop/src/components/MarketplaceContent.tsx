import { useState, useEffect } from 'react'
import PickerCard from './PickerCard'
import type { PickerInfo, Category } from '../types'
import { clientAPI } from '../client/api'
import './MarketplaceContent.css'

const MarketplaceContent = () => {
  const [activeCategory, setActiveCategory] = useState<Category>('All')
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [pickers, setPickers] = useState<PickerInfo[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 从API获取产品数据
  useEffect(() => {
    const fetchPickers = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const pickerListResponse = await clientAPI.getPickerMarketplace()
        // const pickersTotal = pickerListResponse.total
        const pickersData = pickerListResponse.pickers

        if (Array.isArray(pickersData)) {
          setPickers(pickersData as PickerInfo[])
        } else {
          setError('Invalid picker data received. Please try again later.')
        }
      } catch (err) {
        console.error('Failed to fetch pickers:', err)
        setError('Failed to load pickers. Please try again later.')
      } finally {
        setIsLoading(false)
      }
    }

    fetchPickers()
  }, [])

  const categories: Category[] = ['All', 'Popular', 'New']

  // 搜索过滤查找包含关键词的pickers
  const filteredPickers = pickers.filter(picker => {
    const matchesSearch = picker.alias.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         picker.description.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  // // 根据 PickerInfo 中的 download_count 与 created_at 来排序
  // const sortedPickers = filteredPickers.sort((a, b) => {
  //   if (a.download_count !== b.download_count) {
  //     return b.download_count - a.download_count
  //   }
  //   return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  // })

  // 分开实现，先根据下载次数排序
  const sortedPickersByDownloadCount = filteredPickers.sort((a, b) => {
    return b.download_count - a.download_count
  })

  // 再根据创建时间排序
  const sortedPickersByCreatedAt = filteredPickers.sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })


  return (
    <div className="marketplace-content">
      {/* Header */}
      <div className="content-header">
        {/* <h1 className="page-title">Marketplace</h1> */}
        <div className="header-controls">
          <div className="category-tabs">
            {categories.map(category => (
              <button
                key={category}
                className={`category-tab ${activeCategory === category ? 'active' : ''}`}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search picker, tools, extensions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>
        </div>
      </div>

      {/* Picker Grid */}
      {isLoading ? (
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading pickers...</p>
        </div>
      ) : error ? (
        <div className="error-container">
          <p>{error}</p>
          <button className="retry-button" onClick={() => window.location.reload()}>Retry</button>
        </div>
      ) : filteredPickers.length === 0 ? (
        <div className="no-pickers">No pickers found</div>
      ) : (
        <div className="picker-grid">
          {/* 根据activeCategory选择不同的数据源 */}
          {(activeCategory === 'All' ? filteredPickers : 
            activeCategory === 'Popular' ? sortedPickersByDownloadCount : 
            sortedPickersByCreatedAt).map(picker => (
            <PickerCard key={picker.picker_id} picker={picker} />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="pagination">
        <button className="pagination-btn active">1</button>
        <button className="pagination-btn">2</button>
        <button className="pagination-btn">3</button>
        <span className="pagination-ellipsis">...</span>
        <button className="pagination-btn">10</button>
      </div>
    </div>
  )
}

export default MarketplaceContent