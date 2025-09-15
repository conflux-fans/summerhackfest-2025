import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import StoryChunkEditor from '../components/StoryChunkEditor'
import { useConfig } from '../context/ConfigContext'
import { useTreeData } from '../context/TreeDataContext'
import DeepFamily from '../abi/DeepFamily.json'
import type { StoryChunk, StoryChunkCreateData, StoryChunkUpdateData, StoryMetadata } from '../types/graph'

interface PrefetchedState {
  prefetchedStory?: {
    tokenId: string
    storyMetadata?: StoryMetadata
    storyChunks?: StoryChunk[]
  }
}

export default function StoryEditorPage() {
  const { tokenId } = useParams<{ tokenId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const { t } = useTranslation()
  const { contractAddress, strictCacheOnly } = useConfig()
  const { getStoryData, setNodesData } = useTreeData()

  const prefetched = (location.state as PrefetchedState | undefined)?.prefetchedStory

  // Ensure window starts at top when entering the editor page
  useEffect(() => { try { window.scrollTo({ top: 0, behavior: 'instant' as any }) } catch { window.scrollTo(0, 0) } }, [])

  const [meta, setMeta] = useState<StoryMetadata | undefined>(prefetched?.storyMetadata)
  const [chunks, setChunks] = useState<StoryChunk[] | undefined>(prefetched?.storyChunks)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState<boolean>(false)

  const validTokenId = useMemo(() => tokenId && /^\d+$/.test(tokenId) ? tokenId : undefined, [tokenId])

  const loadIfNeeded = useCallback(async () => {
    if (!validTokenId) { setError(t('person.invalidTokenId', 'Invalid token ID')); return }
    if (meta && chunks) return
    setLoading(true)
    setError(null)
    try {
      const data = await getStoryData(validTokenId)
      if (!data) {
        setMeta(undefined)
        setChunks(undefined)
        setError(strictCacheOnly ? t('storyChunkEditor.offlineNoData', 'Offline mode: story not cached locally') : t('storyChunkEditor.loading', 'Loading...'))
        return
      }
      setMeta(data.metadata as StoryMetadata)
      setChunks(data.chunks as StoryChunk[])
    } catch (e: any) {
      setError(e?.message || t('storyChunkEditor.loading', 'Loading...'))
    } finally {
      setLoading(false)
    }
  }, [validTokenId, getStoryData, meta, chunks, t])

  useEffect(() => { loadIfNeeded() }, [loadIfNeeded])

  // Warn before unload if there are unsaved changes
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (!dirty) return
      e.preventDefault()
      e.returnValue = ''
    }
    if (dirty) window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  const refetch = useCallback(async () => {
    if (!validTokenId) return
    // Invalidate NodeData story cache for this token to force fresh fetch
    if (setNodesData) {
      setNodesData(prev => {
        let foundId: string | undefined
        for (const [id, nd] of Object.entries(prev)) {
          if (nd.tokenId && String(nd.tokenId) === String(validTokenId)) { foundId = id; break }
        }
        if (!foundId) return prev
        const cur = prev[foundId]
        return {
          ...prev,
          [foundId]: { ...cur, storyFetchedAt: 0, storyMetadata: undefined, storyChunks: undefined }
        }
      })
    }
    try {
      const data = await getStoryData(validTokenId)
      if (!data) {
        if (strictCacheOnly) setError(t('storyChunkEditor.offlineNoData', 'Offline mode: story not cached locally'))
        return
      }
      setMeta(data.metadata as StoryMetadata)
      setChunks(data.chunks as StoryChunk[])
    } catch {}
  }, [validTokenId, getStoryData, setNodesData, strictCacheOnly, t])

  const onAddChunk = useCallback(async (data: StoryChunkCreateData) => {
    if (!contractAddress) throw new Error('Missing contract')
    const eth = (window as any).ethereum
    if (!eth) throw new Error('No wallet')
    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, signer)
    const tx = await contract.addStoryChunk(data.tokenId, data.chunkIndex, data.content, data.expectedHash || ethers.ZeroHash)
    await tx.wait()
    await refetch()
  }, [contractAddress, refetch])

  const onUpdateChunk = useCallback(async (data: StoryChunkUpdateData) => {
    if (!contractAddress) throw new Error('Missing contract')
    const eth = (window as any).ethereum
    if (!eth) throw new Error('No wallet')
    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, signer)
    const tx = await contract.updateStoryChunk(data.tokenId, data.chunkIndex, data.newContent, data.expectedHash || ethers.ZeroHash)
    await tx.wait()
    await refetch()
  }, [contractAddress, refetch])

  const onSealStory = useCallback(async (tid: string) => {
    if (!contractAddress) throw new Error('Missing contract')
    const eth = (window as any).ethereum
    if (!eth) throw new Error('No wallet')
    const provider = new ethers.BrowserProvider(eth)
    const signer = await provider.getSigner()
    const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, signer)
    const tx = await contract.sealStory(tid)
    await tx.wait()
    await refetch()
  }, [contractAddress, refetch])

  const handleClose = useCallback(() => {
    if (dirty) {
      const ok = window.confirm(t('storyChunkEditor.leaveConfirm', 'Unsaved changes will be lost. Leave editor?'))
      if (!ok) return
    }
    // If the tab has history, go back; otherwise try to close the tab.
    if (window.history.length > 1) {
      navigate(-1)
      return
    }
    try {
      window.close()
    } catch {}
    // Fallback: navigate to person page or home if the tab couldn't be closed
    if (validTokenId) {
      navigate(`/person/${validTokenId}`, { replace: true })
    } else {
      navigate('/', { replace: true })
    }
  }, [dirty, navigate, t, validTokenId])

  return (
    <StoryChunkEditor
      layout="page"
      open={true}
      onClose={handleClose}
      tokenId={validTokenId}
      storyMetadata={meta}
      storyChunks={chunks}
      loading={loading}
      error={error || undefined}
      onDirtyChange={setDirty}
      onAddChunk={onAddChunk}
      onUpdateChunk={onUpdateChunk}
      onSealStory={onSealStory}
    />
  )
}
