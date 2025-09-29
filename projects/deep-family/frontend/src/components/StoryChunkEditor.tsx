import React from 'react'
import { createPortal } from 'react-dom'
import { X, Plus, Edit2, Save, Trash2, Lock, Clipboard, ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { StoryChunk, StoryMetadata, StoryChunkCreateData, StoryChunkUpdateData, formatUnixSeconds, formatHashMiddle } from '../types/graph'

interface StoryChunkEditorProps {
  open: boolean
  onClose: () => void
  tokenId?: string
  storyMetadata?: StoryMetadata
  storyChunks?: StoryChunk[]
  loading?: boolean
  error?: string | null
  onAddChunk?: (data: StoryChunkCreateData) => Promise<void>
  onUpdateChunk?: (data: StoryChunkUpdateData) => Promise<void>
  onSealStory?: (tokenId: string) => Promise<void>
  layout?: 'modal' | 'page'
  onDirtyChange?: (dirty: boolean) => void
}

interface ChunkFormData {
  content: string
  expectedHash?: string
}

export default function StoryChunkEditor({
  open,
  onClose,
  tokenId,
  storyMetadata,
  storyChunks = [],
  loading = false,
  error,
  onAddChunk,
  onUpdateChunk,
  onSealStory,
  layout = 'modal',
  onDirtyChange,
}: StoryChunkEditorProps) {
  const { t } = useTranslation()
  const [editingChunkIndex, setEditingChunkIndex] = React.useState<number | null>(null)
  const [formData, setFormData] = React.useState<ChunkFormData>({ content: '' })
  const [submitting, setSubmitting] = React.useState(false)
  const [localError, setLocalError] = React.useState<string | null>(null)
  const [showSealConfirm, setShowSealConfirm] = React.useState(false)
  const [skipSealConfirm, setSkipSealConfirm] = React.useState<boolean>(() => {
    if (typeof window !== 'undefined') return localStorage.getItem('skipSealConfirm') === '1'
    return false
  })
  const [editSessionId, setEditSessionId] = React.useState(0)
  const [initialEditContent, setInitialEditContent] = React.useState<string>('')
  const [copyHint, setCopyHint] = React.useState<string | null>(null)
  const [scrollContainerRef, formRef, textareaRef] = [React.useRef<HTMLDivElement | null>(null), React.useRef<HTMLDivElement | null>(null), React.useRef<HTMLTextAreaElement | null>(null)]
  const scrollToForm = React.useCallback(() => {
    const doScroll = () => {
      if (scrollContainerRef.current) {
        try { scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' }) } catch {}
      }
      if (formRef.current) {
        try { formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' }) } catch {}
      }
      if (textareaRef.current) {
        try { textareaRef.current.focus({ preventScroll: true }) } catch {}
      }
    }
    requestAnimationFrame(() => {
      doScroll()
      requestAnimationFrame(() => {
        doScroll()
        setTimeout(doScroll, 60)
      })
    })
  }, [])
  
  const copyText = React.useCallback(async (text: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text)
        return true
      }
    } catch {}
    try {
      const ta = document.createElement('textarea')
      ta.value = text
      ta.style.position = 'fixed'
      ta.style.left = '-9999px'
      document.body.appendChild(ta)
      ta.focus(); ta.select()
      const ok = document.execCommand('copy')
      document.body.removeChild(ta)
      return ok
    } catch {
      return false
    }
  }, [])
  
  const onCopyHash = async (text: string) => {
    const ok = await copyText(text)
    setCopyHint(ok ? t('search.copied', 'Copied') : t('search.copyFailed', 'Copy failed'))
    window.setTimeout(() => setCopyHint(null), 1200)
  }
  
  const computeContentHash = (content: string): string => {
    // Use encodePacked to match the contract's _hashString function
    return ethers.keccak256(ethers.toUtf8Bytes(content))
  }

  // Format hash (middle ellipsis)
  const formatHash = React.useCallback((hash?: string) => formatHashMiddle(hash), [])
  
  // Dirty detection: changed content vs initial
  const dirty = React.useMemo(() => {
    const trimmed = (formData.content || '').trim()
    if (editingChunkIndex === null) {
      return trimmed.length > 0
    }
    return trimmed !== (initialEditContent || '').trim()
  }, [formData.content, editingChunkIndex, initialEditContent])

  React.useEffect(() => { onDirtyChange?.(dirty) }, [dirty, onDirtyChange])

  const sortedChunks = React.useMemo(() => {
    return [...storyChunks].sort((a, b) => a.chunkIndex - b.chunkIndex)
  }, [storyChunks])
  
  const handleStartEdit = (chunkIndex: number | null, initialContent = '') => {
    setEditingChunkIndex(chunkIndex)
    setFormData({ 
      content: initialContent,
      expectedHash: initialContent ? computeContentHash(initialContent) : undefined
    })
    setInitialEditContent(initialContent)
    setLocalError(null)
    setEditSessionId(id => id + 1)
    scrollToForm()
  }
  
  const handleCancelEdit = () => {
    setEditingChunkIndex(null)
    setFormData({ content: '' })
    setLocalError(null)
  }
  
  const getByteLength = React.useCallback((str: string) => new TextEncoder().encode(str).length, [])
  
  const handleSubmit = async () => {
    if (!tokenId || !onAddChunk || !onUpdateChunk) return
    
    const trimmedContent = formData.content.trim()
    if (!trimmedContent) {
      setLocalError(t('storyChunkEditor.contentRequired', 'Content cannot be empty'))
      return
    }
    const byteLen = getByteLength(trimmedContent)
    if (byteLen > 1000) {
      setLocalError(t('storyChunkEditor.contentTooLongBytes', 'Content cannot exceed 1000 bytes'))
      return
    }
    
    setSubmitting(true)
    setLocalError(null)
    
    try {
      const expectedHash = computeContentHash(trimmedContent)
      
      if (editingChunkIndex === null) {
        const nextIndex = storyMetadata?.totalChunks || 0
        await onAddChunk({
          tokenId,
          chunkIndex: nextIndex,
          content: trimmedContent,
          expectedHash,
        })
      } else {
        await onUpdateChunk({
          tokenId,
          chunkIndex: editingChunkIndex,
          newContent: trimmedContent,
          expectedHash,
        })
      }
      
      handleCancelEdit()
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t('storyChunkEditor.operationFailed', 'Operation failed'))
    } finally {
      setSubmitting(false)
    }
  }
  
  const handleSeal = async () => {
    if (!tokenId || !onSealStory) return
    if (skipSealConfirm) {
      await executeSeal()
    } else {
      setShowSealConfirm(true)
    }
  }
  const executeSeal = async () => {
    if (!tokenId || !onSealStory) return
    setSubmitting(true)
    try {
      await onSealStory(tokenId)
      setShowSealConfirm(false)
    } catch (err) {
      setLocalError(err instanceof Error ? err.message : t('storyChunkEditor.sealFailed', 'Seal failed'))
    } finally {
      setSubmitting(false)
    }
  }
  
  const isSealed = storyMetadata?.isSealed || false
  React.useEffect(() => {
    if (!open) return
    if (editSessionId > 0) {
      scrollToForm()
    }
  }, [editSessionId, open, scrollToForm])

  // Do not auto-focus form on initial open for page layout; keep at top
  
  if (!open) return null

  const Card = (
      <div className={`relative bg-white/95 dark:bg-gray-900/95 rounded-2xl shadow-3xl w-full ${layout === 'page' ? 'max-w-none' : 'max-w-[800px] max-h-[90vh]'} overflow-hidden flex flex-col border border-gray-200/70 dark:border-gray-700/50 backdrop-blur-xl`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200/70 dark:border-gray-700/50 bg-gradient-to-r from-blue-50/50 to-purple-50/30 dark:from-blue-900/20 dark:to-purple-900/15 backdrop-blur-sm">
          <div className="flex items-center gap-3 min-w-0">
            {layout === 'page' && (
              <button
                aria-label={t('common.back', 'Back') as string}
                className="hidden sm:inline-flex p-2 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105"
                onClick={onClose}
              >
                <ArrowLeft size={20} />
              </button>
            )}
            <div className="text-lg font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent truncate">
              {t('storyChunkEditor.title', 'Story Chunk Editor')}
              {isSealed && <Lock className="inline ml-2 text-gray-500 dark:text-gray-400" size={16} />}
            </div>
          </div>
          {layout === 'modal' ? (
            <button
              aria-label={t('common.close', 'Close') as string}
              className="p-2 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          ) : (
            // In page layout, show a mobile-only Close (X) on the right
            <button
              aria-label={t('common.close', 'Close') as string}
              className="sm:hidden p-2 rounded-xl hover:bg-white/30 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300 transition-all duration-200 hover:scale-105"
              onClick={onClose}
            >
              <X size={20} />
            </button>
          )}
        </div>
        
        {storyMetadata && (
          <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/60 border-b border-gray-200 dark:border-gray-700 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex justify-between items-center">
              <span>
                {t('storyChunkEditor.stats', 'Chunks: {{count}}, Total length: {{length}}', {
                  count: storyMetadata.totalChunks,
                  length: storyMetadata.totalLength
                })}
              </span>
              <div className="flex gap-2">
                {isSealed && (
                  <span className="px-2 py-1 bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-300 rounded text-xs">
                    {t('storyChunkEditor.sealed', 'Sealed')}
                  </span>
                )}
                {!isSealed && storyMetadata.totalChunks > 0 && (
                  <button
                    onClick={handleSeal}
                    disabled={submitting}
                    className="px-2 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                  >
                    {t('storyChunkEditor.seal', 'Seal')}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
        
        {copyHint && (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-30">
            <div className="rounded bg-black/80 dark:bg-black/70 text-white px-3 py-1.5 text-xs animate-fade-in">{copyHint}</div>
          </div>
        )}
        
        <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-white/60 via-blue-50/20 to-purple-50/10 dark:from-transparent dark:via-blue-900/5 dark:to-purple-900/5">
          {(error || localError) && (
            <div className="bg-red-50/80 dark:bg-red-500/10 border border-red-200/50 dark:border-red-500/40 rounded-xl p-4 text-red-700 dark:text-red-300 text-sm backdrop-blur-sm">
              {error || localError}
            </div>
          )}
          
          {editingChunkIndex !== null || (editingChunkIndex === null && !isSealed) ? (
            <div ref={formRef} className="bg-white/90 dark:bg-gray-800/80 rounded-2xl p-6 space-y-4 border border-gray-200/50 dark:border-gray-700/50 backdrop-blur-xl shadow-lg">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                {editingChunkIndex !== null
                  ? t('storyChunkEditor.editChunk', 'Edit Chunk #{{index}}', { index: editingChunkIndex })
                  : t('storyChunkEditor.addChunk', 'Add New Chunk')
                }
              </h3>
              
              <textarea
                ref={textareaRef}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  content: e.target.value,
                  expectedHash: e.target.value ? computeContentHash(e.target.value) : undefined
                }))}
                placeholder={t('storyChunkEditor.contentPlaceholderBytes', 'Enter chunk content (max 1000 bytes, approximately 1000 English characters or ~333 Chinese characters)')}
                className="w-full h-32 p-4 border border-gray-300/50 dark:border-gray-600/50 rounded-xl resize-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 bg-white/90 dark:bg-gray-900/90 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 backdrop-blur-sm transition-all duration-200"
                disabled={submitting}
              />
              
              <div className="flex flex-wrap items-center w-full gap-x-3 gap-y-1 -mt-2 text-xs text-gray-500 dark:text-gray-400">
                <span className="whitespace-nowrap">{getByteLength(formData.content)}/1000 bytes</span>
                <span className="flex-1" />
                {formData.expectedHash && (
                  <div className="flex items-center gap-1.5 whitespace-nowrap">
                    <span className="text-gray-400 dark:text-gray-500">{t('storyChunkEditor.hashLabel','Hash')}:</span>
                    <code className="font-mono text-[11px] px-1 py-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {formatHash(formData.expectedHash)}
                    </code>
                    <button
                      type="button"
                      onClick={() => onCopyHash(formData.expectedHash || '')}
                      className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors -mt-[2px]"
                      aria-label={t('search.copy', 'Copy') as string}
                    >
                      <Clipboard size={14} />
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !formData.content.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Save size={16} />
                  {submitting ? t('storyChunkEditor.saving', 'Saving...') : t('storyChunkEditor.save', 'Save')}
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={submitting}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded hover:bg-gray-400 dark:hover:bg-gray-600 disabled:opacity-50"
                >
                  {t('storyChunkEditor.cancel', 'Cancel')}
                </button>
              </div>
            </div>
          ) : null}
          
          {!isSealed && editingChunkIndex === null && (
            <button
              onClick={() => handleStartEdit(null)}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 dark:text-gray-300 hover:border-blue-400 hover:text-blue-600 dark:hover:border-blue-400 dark:hover:text-blue-400 flex items-center justify-center gap-2"
            >
              <Plus size={20} />
              {t('storyChunkEditor.addNewChunk', 'Add New Chunk')}
            </button>
          )}
          
          {sortedChunks.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900 dark:text-gray-100 bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">
                {t('storyChunkEditor.chunks', 'Existing Chunks')}
              </h3>
              
              {sortedChunks.map((chunk) => (
                <div key={chunk.chunkIndex} className="border border-gray-200/50 dark:border-gray-700/50 rounded-xl p-4 space-y-3 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:shadow-md transition-all duration-200">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      #{chunk.chunkIndex}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatUnixSeconds(chunk.timestamp)}
                      </span>
                      {!isSealed && (
                        <button
                          onClick={() => handleStartEdit(chunk.chunkIndex, chunk.content)}
                          className="p-1 text-gray-400 dark:text-gray-500 hover:text-blue-600 dark:hover:text-blue-400"
                          disabled={submitting}
                        >
                          <Edit2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {t('storyChunkEditor.hashLabel','Hash')}: {formatHash(chunk.chunkHash)}
                  </div>
                  
                  <div className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap max-h-24 overflow-y-auto">
                    {chunk.content}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {loading && (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              {t('storyChunkEditor.loading', 'Loading...')}
            </div>
          )}
        </div>
        
        {showSealConfirm && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm p-5 space-y-4 border border-gray-200 dark:border-gray-600">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">{t('storyChunkEditor.sealDialog.title', 'Seal Story')}</h4>
              <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">{t('storyChunkEditor.sealDialog.description', 'Are you sure you want to seal the story? Once sealed, it cannot be modified.')}</p>
              <label className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300 select-none cursor-pointer">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  checked={skipSealConfirm}
                  onChange={(e) => {
                    const v = e.target.checked
                    setSkipSealConfirm(v)
                    try { localStorage.setItem('skipSealConfirm', v ? '1' : '0') } catch {}
                  }}
                />
                {t('storyChunkEditor.sealDialog.dontAskAgain', "Don't ask again")}
              </label>
              <div className="flex justify-end gap-3 pt-1 text-xs">
                <button
                  onClick={() => setShowSealConfirm(false)}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded border border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  {t('storyChunkEditor.sealDialog.cancel', 'Cancel')}
                </button>
                <button
                  onClick={executeSeal}
                  disabled={submitting}
                  className="px-3 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? t('storyChunkEditor.saving', 'Saving...') : t('storyChunkEditor.sealDialog.confirm', 'Confirm Seal')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
  )

  if (layout === 'page') {
    return (
      <div className="w-full" data-story-editor-page>
        <div className="mx-auto flex justify-center">
          {Card}
        </div>
      </div>
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[1001] flex items-center justify-center p-2 sm:p-4" data-story-editor>
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      {Card}
    </div>,
    document.body
  )
}
