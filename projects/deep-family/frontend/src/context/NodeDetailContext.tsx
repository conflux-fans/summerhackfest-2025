import React, { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { useTreeData } from './TreeDataContext'
import NodeDetailModal from '../components/NodeDetailModal'
import { NodeData, makeNodeId } from '../types/graph'
import { useVizOptions } from './VizOptionsContext'
import { ethers } from 'ethers'
import DeepFamily from '../abi/DeepFamily.json'
import { useConfig } from './ConfigContext'
import { makeProvider } from '../utils/provider'

export interface NodeKeyMinimal { personHash: string; versionIndex: number }

interface NodeDetailState {
  open: boolean
  selected: NodeKeyMinimal | null
  selectedNodeData: NodeData | null
  loading: boolean
  error: string | null
  openNode: (k: NodeKeyMinimal) => void
  close: () => void
}

const Ctx = createContext<NodeDetailState | undefined>(undefined)

export function NodeDetailProvider({ children }: { children: React.ReactNode }) {
  const [selected, setSelected] = useState<NodeKeyMinimal | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { nodesData, setNodesData } = useTreeData() as any
  const { includeVersionDetails } = useVizOptions()
  const { rpcUrl, contractAddress } = useConfig()

  const openNode = useCallback((k: NodeKeyMinimal) => { setSelected(k) }, [])
  const close = useCallback(() => { setSelected(null) }, [])
  
  const selectedNodeData = selected ? nodesData?.[makeNodeId(selected.personHash, selected.versionIndex)] || null : null

  useEffect(() => {
    if (!selected) { setError(null); setLoading(false); return }
  }, [selected, selectedNodeData, includeVersionDetails])

  useEffect(() => {
    if (!selected) return
    if (!rpcUrl || !contractAddress || !setNodesData) return
    let cancelled = false
    const run = async () => {
      const id = makeNodeId(selected.personHash, selected.versionIndex)
      const nd = nodesData?.[id]
      const needVersion = !nd || nd.addedBy === undefined || nd.fatherHash === undefined || nd.metadataCID === undefined
      const provider = makeProvider(rpcUrl)
      const contract = new ethers.Contract(contractAddress, (DeepFamily as any).abi, provider)
      try {
        setLoading(true)
        setError(null)
        let tokenId: string | undefined = nd?.tokenId
        if (needVersion) {
          const ret = await contract.getVersionDetails(selected.personHash, selected.versionIndex)
          const versionStruct = ret[0]
          const endorsementCountBN = ret[1]
            tokenId = ret[2]?.toString()
          const fatherHash = versionStruct.fatherHash || versionStruct[1]
          const motherHash = versionStruct.motherHash || versionStruct[2]
          const fatherVersionIndex = Number(versionStruct.fatherVersionIndex !== undefined ? versionStruct.fatherVersionIndex : versionStruct[4]) || 0
          const motherVersionIndex = Number(versionStruct.motherVersionIndex !== undefined ? versionStruct.motherVersionIndex : versionStruct[5]) || 0
          const addedBy = versionStruct.addedBy || versionStruct[6]
          const timestampRaw = versionStruct.timestamp !== undefined ? versionStruct.timestamp : versionStruct[7]
          const timestamp = Number(timestampRaw)
          const tag = versionStruct.tag || versionStruct[8]
          const metadataCID = versionStruct.metadataCID || versionStruct[9]
          if (!cancelled) setNodesData((prev: any) => prev[id] ? ({ ...prev, [id]: { ...prev[id], fatherHash, motherHash, fatherVersionIndex, motherVersionIndex, addedBy, timestamp, tag: tag || prev[id].tag, metadataCID, endorsementCount: Number(endorsementCountBN), tokenId } }) : prev)
        }
        const ndAfter = () => (nodesData?.[id])
        await Promise.resolve()
        const ndCur = ndAfter()
        const effectiveTokenId = tokenId || ndCur?.tokenId
        const needNFT = effectiveTokenId && effectiveTokenId !== '0' && (!ndCur || ndCur.fullName === undefined || ndCur.nftTokenURI === undefined || ndCur.story === undefined)
        if (needNFT) {
          const nftRet = await contract.getNFTDetails(effectiveTokenId)
          const versionStruct2 = nftRet[2]
          const coreInfo = nftRet[3]
          const endorsementCountBN2 = nftRet[4]
          const nftTokenURI = nftRet[5]
          const fatherHash = versionStruct2.fatherHash || versionStruct2[1]
          const motherHash = versionStruct2.motherHash || versionStruct2[2]
          const fatherVersionIndex = Number(versionStruct2.fatherVersionIndex !== undefined ? versionStruct2.fatherVersionIndex : versionStruct2[4]) || 0
          const motherVersionIndex = Number(versionStruct2.motherVersionIndex !== undefined ? versionStruct2.motherVersionIndex : versionStruct2[5]) || 0
          const addedBy = versionStruct2.addedBy || versionStruct2[6]
          const timestampRaw = versionStruct2.timestamp !== undefined ? versionStruct2.timestamp : versionStruct2[7]
          const timestamp = Number(timestampRaw)
          const tag = versionStruct2.tag || versionStruct2[8]
          const metadataCID = versionStruct2.metadataCID || versionStruct2[9]
          const fullName = coreInfo.supplementInfo.fullName
          const gender = Number(coreInfo.basicInfo.gender)
          const birthYear = Number(coreInfo.basicInfo.birthYear)
          const birthMonth = Number(coreInfo.basicInfo.birthMonth)
          const birthDay = Number(coreInfo.basicInfo.birthDay)
          const birthPlace = coreInfo.supplementInfo.birthPlace
          const isBirthBC = Boolean(coreInfo.basicInfo.isBirthBC)
          const deathYear = Number(coreInfo.supplementInfo.deathYear)
          const deathMonth = Number(coreInfo.supplementInfo.deathMonth)
          const deathDay = Number(coreInfo.supplementInfo.deathDay)
          const deathPlace = coreInfo.supplementInfo.deathPlace
          const isDeathBC = Boolean(coreInfo.supplementInfo.isDeathBC)
          const story = coreInfo.supplementInfo.story
          
          let storyMetadata = null
          let storyChunks = null
          try {
            const metadata = await contract.getStoryMetadata(effectiveTokenId)
            storyMetadata = {
              totalChunks: Number(metadata.totalChunks),
              totalLength: Number(metadata.totalLength),
              isSealed: Boolean(metadata.isSealed),
              lastUpdateTime: Number(metadata.lastUpdateTime),
              fullStoryHash: metadata.fullStoryHash
            }
            
            if (storyMetadata.totalChunks > 0) {
              storyChunks = []
              for (let i = 0; i < storyMetadata.totalChunks; i++) {
                const chunk = await contract.getStoryChunk(effectiveTokenId, i)
                storyChunks.push({
                  chunkIndex: Number(chunk.chunkIndex),
                  chunkHash: chunk.chunkHash,
                  content: chunk.content,
                  timestamp: Number(chunk.timestamp),
                  lastEditor: chunk.lastEditor
                })
              }
            }
          } catch (e) {
            console.warn('Failed to fetch story chunks:', e)
          }
          
          if (!cancelled) setNodesData((prev: any) => prev[id] ? ({
            ...prev,
            [id]: {
              ...prev[id],
              fatherHash, motherHash, fatherVersionIndex, motherVersionIndex, addedBy, timestamp, tag: tag || prev[id].tag, metadataCID,
              endorsementCount: Number(endorsementCountBN2), tokenId: effectiveTokenId,
              fullName, gender, birthYear, birthMonth, birthDay, birthPlace, isBirthBC, deathYear, deathMonth, deathDay, deathPlace, isDeathBC, story, nftTokenURI,
              storyMetadata, storyChunks
            }
          }) : prev)
        }
      } catch (e: any) {
        if (!cancelled) setError(e.message || 'error')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    run()
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, rpcUrl, contractAddress])
  return (
    <Ctx.Provider value={{ open: !!selected, selected, selectedNodeData, loading, error, openNode, close }}>
      {children}
      <NodeDetailModal
        open={!!selected}
        onClose={close}
        nodeData={selectedNodeData}
        fallback={{ hash: selected?.personHash || '', versionIndex: selected?.versionIndex }}
        loading={loading}
        error={error}
      />
    </Ctx.Provider>
  )
}

export function useNodeDetail() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useNodeDetail must be used within NodeDetailProvider')
  return ctx
}
