import { useEffect, useMemo, useState, useCallback } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import StoryChunkEditor from '../components/StoryChunkEditor'
import { useConfig } from '../context/ConfigContext'
import { useTreeData } from '../context/TreeDataContext'
import { useWallet } from '../context/WalletContext'
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
  const { signer, address } = useWallet()

  const prefetched = (location.state as PrefetchedState | undefined)?.prefetchedStory

  // Ensure window starts at top when entering the editor page
  useEffect(() => { try { window.scrollTo({ top: 0, behavior: 'instant' as any }) } catch { window.scrollTo(0, 0) } }, [])

  const [meta, setMeta] = useState<StoryMetadata | undefined>(prefetched?.storyMetadata)
  const [chunks, setChunks] = useState<StoryChunk[] | undefined>(prefetched?.storyChunks)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [dirty, setDirty] = useState<boolean>(false)

  const validTokenId = useMemo(() => tokenId && /^\d+$/.test(tokenId) ? tokenId : undefined, [tokenId])

  const parseContractError = useCallback((error: any): string => {
    console.error('[StoryEditor] Contract error:', error)

    // Check for custom errors in the error data
    if (error?.data && typeof error.data === 'string') {
      // Common custom error selectors
      const customErrors: Record<string, string> = {
        '0xdaffd8a5': 'MustBeNFTHolder', // You must own this NFT to edit its story
        '0x82b42900': 'Unauthorized', // Not authorized to perform this action
        '0x3ee5aeb5': 'OnlyOwner', // Only owner can perform this action
        '0x579b9c8a': 'StorySealed', // Story is already sealed and cannot be modified
        '0x6512e97e': 'ChunkIndexExists', // Chunk at this index already exists
        '0x766e8709': 'InvalidChunkIndex', // Invalid chunk index
        '0x7b51ba7e': 'ContentTooLong', // Content exceeds maximum length
        '0x9b9623c8': 'ExpectedHashMismatch', // Expected hash does not match actual hash
        '0x5b00bc40': 'ChunkHashMismatch', // Chunk hash validation failed
        '0x7df0b861': 'ChunkIndexOutOfRange', // Chunk index is out of valid range
      }

      const errorSelector = error.data.slice(0, 10)
      const customError = customErrors[errorSelector]

      if (customError) {
        switch (customError) {
          case 'MustBeNFTHolder':
            return t('storyChunkEditor.errors.mustBeNFTHolder', 'You must own this NFT to edit its story')
          case 'Unauthorized':
            return t('storyChunkEditor.errors.unauthorized', 'Not authorized to perform this action')
          case 'OnlyOwner':
            return t('storyChunkEditor.errors.onlyOwner', 'Only the owner can perform this action')
          case 'StorySealed':
            return t('storyChunkEditor.errors.storySealed', 'Story is sealed and cannot be modified')
          case 'ChunkIndexExists':
            return t('storyChunkEditor.errors.chunkIndexExists', 'Chunk at this index already exists')
          case 'InvalidChunkIndex':
            return t('storyChunkEditor.errors.invalidChunkIndex', 'Invalid chunk index')
          case 'ContentTooLong':
            return t('storyChunkEditor.errors.contentTooLong', 'Content exceeds maximum length')
          case 'ExpectedHashMismatch':
            return t('storyChunkEditor.errors.expectedHashMismatch', 'Expected hash does not match')
          case 'ChunkHashMismatch':
            return t('storyChunkEditor.errors.chunkHashMismatch', 'Chunk content does not match expected hash')
          case 'ChunkIndexOutOfRange':
            return t('storyChunkEditor.errors.chunkIndexOutOfRange', 'Chunk index is out of valid range')
          default:
            return t('storyChunkEditor.errors.customError', 'Contract error: {{error}}', { error: customError })
        }
      }
    }

    // Check for standard error messages
    if (error?.message) {
      if (error.message.includes('execution reverted')) {
        // Try to extract custom error from message
        const customErrorMatch = error.message.match(/custom error '(\w+)'/);
        if (customErrorMatch) {
          const customError = customErrorMatch[1]
          switch (customError) {
            case 'MustBeNFTHolder':
              return t('storyChunkEditor.errors.mustBeNFTHolder', 'You must own this NFT to edit its story')
            case 'Unauthorized':
              return t('storyChunkEditor.errors.unauthorized', 'Not authorized to perform this action')
            case 'OnlyOwner':
              return t('storyChunkEditor.errors.onlyOwner', 'Only the owner can perform this action')
            case 'StorySealed':
              return t('storyChunkEditor.errors.storySealed', 'Story is sealed and cannot be modified')
            case 'ChunkHashMismatch':
              return t('storyChunkEditor.errors.chunkHashMismatch', 'Chunk content does not match expected hash')
            case 'ChunkIndexOutOfRange':
              return t('storyChunkEditor.errors.chunkIndexOutOfRange', 'Chunk index is out of valid range')
            default:
              return t('storyChunkEditor.errors.customError', 'Contract error: {{error}}', { error: customError })
          }
        }
        return t('storyChunkEditor.errors.transactionReverted', 'Transaction failed: execution reverted')
      }

      if (error.message.includes('user rejected')) {
        return t('storyChunkEditor.errors.userRejected', 'Transaction was rejected by user')
      }

      if (error.message.includes('insufficient funds')) {
        return t('storyChunkEditor.errors.insufficientFunds', 'Insufficient funds for gas')
      }
    }

    // Fallback to original error message or generic error
    return error?.message || t('storyChunkEditor.errors.unknown', 'An unknown error occurred')
  }, [t])

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
    try {
      if (!contractAddress) throw new Error('Missing contract')
      if (!signer) throw new Error('No wallet connected')
      if (!address) throw new Error('No wallet address')
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, signer)
      const tx = await contract.addStoryChunk(data.tokenId, data.chunkIndex, data.content, data.expectedHash || ethers.ZeroHash)
      await tx.wait()
      await refetch()
    } catch (err) {
      throw new Error(parseContractError(err))
    }
  }, [contractAddress, signer, address, refetch, parseContractError])

  const onUpdateChunk = useCallback(async (data: StoryChunkUpdateData) => {
    try {
      if (!contractAddress) throw new Error('Missing contract')
      if (!signer) throw new Error('No wallet connected')
      if (!address) throw new Error('No wallet address')
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, signer)
      const tx = await contract.updateStoryChunk(data.tokenId, data.chunkIndex, data.newContent, data.expectedHash || ethers.ZeroHash)
      await tx.wait()
      await refetch()
    } catch (err) {
      throw new Error(parseContractError(err))
    }
  }, [contractAddress, signer, address, refetch, parseContractError])

  const onSealStory = useCallback(async (tid: string) => {
    try {
      if (!contractAddress) throw new Error('Missing contract')
      if (!signer) throw new Error('No wallet connected')
      if (!address) throw new Error('No wallet address')
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, signer)
      const tx = await contract.sealStory(tid)
      await tx.wait()
      await refetch()
    } catch (err) {
      throw new Error(parseContractError(err))
    }
  }, [contractAddress, signer, address, refetch, parseContractError])

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
