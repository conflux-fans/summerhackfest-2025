
export interface GraphNode {
  personHash: string
  versionIndex: number
  tag?: string
  children?: GraphNode[]
}

export interface StoryChunk {
  chunkIndex: number
  chunkHash: string
  content: string
  timestamp: number
  lastEditor: string
}

export interface StoryMetadata {
  totalChunks: number
  fullStoryHash: string
  lastUpdateTime: number
  isSealed: boolean
  totalLength: number
}

export interface StoryChunkCreateData {
  tokenId: string
  chunkIndex: number
  content: string
  expectedHash?: string
}

export interface StoryChunkUpdateData {
  tokenId: string
  chunkIndex: number
  newContent: string
  expectedHash?: string
}

export interface NodeData {
  personHash: string
  versionIndex: number
  id: string // = makeNodeId
  tag?: string
  fatherHash?: string
  motherHash?: string
  fatherVersionIndex?: number
  motherVersionIndex?: number
  addedBy?: string
  timestamp?: number
  metadataCID?: string
  endorsementCount?: number
  tokenId?: string
  owner?: string
  fullName?: string // coreInfo.fullName
  gender?: number
  birthYear?: number
  birthMonth?: number
  birthDay?: number
  birthPlace?: string
  isBirthBC?: boolean
  deathYear?: number
  deathMonth?: number
  deathDay?: number
  deathPlace?: string
  isDeathBC?: boolean
  story?: string
  nftTokenURI?: string
  storyMetadata?: StoryMetadata
  storyChunks?: StoryChunk[]
  storyFetchedAt?: number
}

export type NodeDataPatch = Partial<Omit<NodeData,'personHash'|'versionIndex'|'id'>>

export type NodeId = string

export function makeNodeId(personHash: string, versionIndex: number): NodeId {
  return `${personHash}-v-${versionIndex}`
}

export function parseNodeId(id: NodeId): { personHash: string; versionIndex: number } {
  const idx = id.lastIndexOf('-v-')
  if (idx <= 0) return { personHash: id, versionIndex: 0 }
  const hash = id.slice(0, idx)
  const v = Number(id.slice(idx + 3))
  return { personHash: hash, versionIndex: Number.isFinite(v) ? v : 0 }
}

export function shortHash(hash: string, shown = 4): string {
  if (!hash) return ''
  const start = hash.startsWith('0x') ? 2 : 0
  return `0x${hash.slice(start, start + shown)}…`
}

export function nodeLabel(node: Pick<GraphNode, 'personHash' | 'versionIndex' | 'tag'>): string {
  return `${node.personHash}  v${node.versionIndex}`
}

// Derived helpers
export function hasDetailedStory(nd: Partial<NodeData> | undefined | null): boolean {
  if (!nd) return false
  if (nd.story && nd.story.trim() !== '') return true
  if (Array.isArray(nd.storyChunks) && nd.storyChunks.length > 0) return true
  if (nd.storyMetadata && typeof nd.storyMetadata.totalChunks === 'number' && nd.storyMetadata.totalChunks > 0) return true
  return false
}

export function isMinted(nd: Partial<NodeData> | undefined | null): boolean {
  if (!nd) return false
  return !!(nd.tokenId && String(nd.tokenId) !== '0')
}

export function formatYMD(year?: number, month?: number, day?: number, isBC?: boolean): string {
  if (!year) return ''
  let s = isBC ? `BC ${year}` : String(year)
  if (month && month > 0) {
    s += `-${String(month).padStart(2, '0')}`
    if (day && day > 0) s += `-${String(day).padStart(2, '0')}`
  }
  return s
}

export function birthDateString(nd: Partial<NodeData> | undefined | null): string {
  if (!nd) return ''
  return formatYMD(nd.birthYear, nd.birthMonth, nd.birthDay, nd.isBirthBC)
}

export function deathDateString(nd: Partial<NodeData> | undefined | null): string {
  if (!nd) return ''
  return formatYMD(nd.deathYear, nd.deathMonth, nd.deathDay, nd.isDeathBC)
}

export function genderText(gender: number | undefined, t: (key: string, def?: string) => string): string {
  switch (gender) {
    case 1: return t('familyTree.nodeDetail.genders.male', 'Male')
    case 2: return t('familyTree.nodeDetail.genders.female', 'Female')
    case 3: return t('familyTree.nodeDetail.genders.other', 'Other')
    default: return ''
  }
}

// Timestamp helpers (unix seconds -> localized string)
export function formatUnixSeconds(sec?: number | string | bigint): string {
  if (sec === undefined || sec === null) return '-'
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return '-'
  try { return new Date(n * 1000).toLocaleString() } catch { return '-' }
}

export function formatUnixDate(sec?: number | string | bigint): string {
  if (sec === undefined || sec === null) return ''
  const n = Number(sec)
  if (!Number.isFinite(n) || n <= 0) return ''
  try { return new Date(n * 1000).toLocaleDateString() } catch { return '' }
}

// Address/Hash display helpers
export function formatHashMiddle(val?: string, prefix = 10, suffix = 8): string {
  if (!val) return ''
  const isHexLike = /^0x[0-9a-fA-F]+$/.test(val)
  if (isHexLike || val.length > prefix + suffix + 4) {
    return `${val.slice(0, prefix)}...${val.slice(-suffix)}`
  }
  return val
}

export function shortAddress(addr?: string, prefix = 8, suffix = 6): string {
  if (!addr) return ''
  const s = addr
  if (s.length <= prefix + suffix + 2) return s
  return `${s.slice(0, prefix)}...${s.slice(-suffix)}`
}
