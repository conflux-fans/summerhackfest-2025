import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { X, Coins, AlertCircle, Image, Check, AlertTriangle, ChevronDown } from 'lucide-react'
import { useContract } from '../../hooks/useContract'
import { useWallet } from '../../context/WalletContext'
import { ethers } from 'ethers'
import { poseidon5 } from 'poseidon-lite'
import { useSearchParams } from 'react-router-dom'
import PersonHashCalculator from '../PersonHashCalculator'
import EndorseModal from './EndorseModal'
import {
  generateNamePoseidonProof,
  verifyNamePoseidonProof,
  formatGroth16ProofForContract,
  toBigIntArray
} from '../../lib/zk'

// Simple themed select component (from PersonHashCalculator)
const ThemedSelect: React.FC<{
  value: number
  onChange: (v: number) => void
  options: { value: number; label: string }[]
  className?: string
}> = ({ value, onChange, options, className = '' }) => {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current) return
      if (!rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    return () => document.removeEventListener('mousedown', onDoc)
  }, [])

  const selectedOption = options.find(o => o.value === value)

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full h-10 px-3 py-2 text-left bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 text-sm text-gray-800 dark:text-gray-100 outline-none transition flex items-center justify-between"
      >
        <span>{selectedOption?.label || 'Select...'}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-lg">
          <ul role="listbox" className="max-h-60 overflow-auto">
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`px-3 py-2 text-sm cursor-pointer select-none transition-colors ${
                  o.value === value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                {o.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

// Helper: accept http/https URLs or ipfs:// URIs (or empty)
const isValidTokenUri = (v: string) => {
  if (v === '') return true
  if (v.startsWith('ipfs://')) return v.length > 'ipfs://'.length
  try {
    const u = new URL(v)
    return u.protocol === 'http:' || u.protocol === 'https:'
  } catch {
    return false
  }
}

const ZERO_BYTES32 = `0x${'00'.repeat(32)}`
const MASK_128 = (1n << 128n) - 1n

type MintProofArgs = {
  a: [bigint, bigint]
  b: [[bigint, bigint], [bigint, bigint]]
  c: [bigint, bigint]
  publicSignals: [bigint, bigint, bigint, bigint]
}

const splitToLimbs = (hex: string) => {
  const value = BigInt(hex)
  return {
    hi: value >> 128n,
    lo: value & MASK_128,
  }
}

const computeNameBinding = (fullName: string, passphrase: string) => {
  const trimmedName = fullName.trim()
  const nameHex = ethers.keccak256(ethers.toUtf8Bytes(trimmedName))
  const saltHex = passphrase && passphrase.length > 0 ? ethers.keccak256(ethers.toUtf8Bytes(passphrase)) : ZERO_BYTES32

  const nameLimbs = splitToLimbs(nameHex)
  const saltLimbs = splitToLimbs(saltHex)

  const digestBig = poseidon5([nameLimbs.hi, nameLimbs.lo, saltLimbs.hi, saltLimbs.lo, 0n])
  const digestHex = `0x${digestBig.toString(16).padStart(64, '0')}`
  const digestLimbs = {
    hi: digestBig >> 128n,
    lo: digestBig & MASK_128,
  }

  return {
    nameHex,
    saltHex,
    nameLimbs,
    saltLimbs,
    digestHex,
    digestLimbs,
  }
}

const createMintNFTSchema = (t: (key: string) => string) => z.object({
  // PersonSupplementInfo
  birthPlace: z.string().max(256, t('mintNFT.validation.birthPlaceTooLong')),
  isDeathBC: z.boolean(),
  deathYear: z.union([z.number().int().min(0).max(9999), z.string()]).transform(val => {
    if (val === '' || val === undefined) return 0;
    return typeof val === 'string' ? (val === '' ? 0 : parseInt(val, 10)) : val;
  }),
  deathMonth: z.union([z.number().int().min(0).max(12), z.string()]).transform(val => {
    if (val === '' || val === undefined) return 0;
    return typeof val === 'string' ? (val === '' ? 0 : parseInt(val, 10)) : val;
  }),
  deathDay: z.union([z.number().int().min(0).max(31), z.string()]).transform(val => {
    if (val === '' || val === undefined) return 0;
    return typeof val === 'string' ? (val === '' ? 0 : parseInt(val, 10)) : val;
  }),
  deathPlace: z.string().max(256, t('mintNFT.validation.deathPlaceTooLong')),
  story: z.string().max(256, t('mintNFT.validation.storyTooLong')),

  // NFT Metadata
  tokenURI: z
    .string()
    .max(256, t('mintNFT.validation.tokenURITooLong'))
    .optional()
    .or(z.literal(''))
    .refine((v) => isValidTokenUri(v ?? ''), t('mintNFT.validation.invalidTokenURI'))
}).refine((data) => {
  // If AD (Anno Domini), the year must not exceed the current year
  if (!data.isDeathBC && data.deathYear > new Date().getFullYear()) {
    return false;
  }
  return true;
}, {
  message: t('mintNFT.validation.yearExceedsCurrent'),
  path: ["deathYear"]
})

type MintNFTForm = z.infer<ReturnType<typeof createMintNFTSchema>>

interface MintNFTModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (tokenId: number) => void
  personHash?: string
  versionIndex?: number
  onPersonHashChange?: (hash: string) => void
  onVersionIndexChange?: (index: number) => void
  versionData?: {
    fullName?: string
    gender?: number
    birthYear?: number
    birthMonth?: number
    birthDay?: number
    isBirthBC?: boolean
    passphrase?: string
  }
}

export default function MintNFTModal({
  isOpen,
  onClose,
  onSuccess,
  personHash,
  versionIndex,
  onPersonHashChange,
  onVersionIndexChange,
  versionData
}: MintNFTModalProps) {
  const { t } = useTranslation()
  const { address } = useWallet()
  const { mintPersonNFT, getVersionDetails, contract, getPersonHash } = useContract()

  // Create schema with translations
  const mintNFTSchema = useMemo(() => createMintNFTSchema(t), [t])
  const [searchParams] = useSearchParams()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isEndorsed, setIsEndorsed] = useState(false)
  const [isAlreadyMinted, setIsAlreadyMinted] = useState(false)
  const [isCheckingStatus, setIsCheckingStatus] = useState(false)
  const [entered, setEntered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startYRef = useRef<number | null>(null)
  const [showEndorseModal, setShowEndorseModal] = useState(false)
  const [showEndorseConfirm, setShowEndorseConfirm] = useState(false)
  const [successResult, setSuccessResult] = useState<{
    tokenId: number
    personHash: string
    versionIndex: number
    tokenURI: string
    transactionHash: string
    blockNumber: number
    events: {
      PersonNFTMinted: any
    }
  } | null>(null)
  const [errorResult, setErrorResult] = useState<{
    type: string
    message: string
    details: string
  } | null>(null)
  const [contractError, setContractError] = useState<any>(null)
  const [proofGenerationStep, setProofGenerationStep] = useState<string>('')
  // Local fallback state when parent does not control inputs
  const [localPersonHash, setLocalPersonHash] = useState<string>('')
  const [localVersionIndex, setLocalVersionIndex] = useState<number>(1)

  // Track history push/pop to close on mobile back like NodeDetailModal
  const pushedRef = useRef(false)
  const closedBySelfRef = useRef(false)
  const closedByPopRef = useRef(false)
  const historyMarkerRef = useRef<{ __dfModal: string; id: string } | null>(null)
  
  // Person basic info from PersonHashCalculator
  const [personInfo, setPersonInfo] = useState<{
    fullName: string
    gender: number
    birthYear: number
    birthMonth: number
    birthDay: number
    isBirthBC: boolean
    passphrase: string
  } | null>(null)
  
  // Unified target values: prefer props if provided, otherwise local state
  const targetPersonHash = (personHash ?? localPersonHash)?.trim()
  const targetVersionIndex = (versionIndex ?? localVersionIndex)
  const isBytes32 = (v: string | undefined | null) => !!v && /^0x[0-9a-fA-F]{64}$/.test(v.trim())
  const isPersonHashFormatValid = isBytes32(targetPersonHash)

  // Determine validity - always show input mode
  const hasValidTarget = Boolean(targetPersonHash && targetPersonHash !== '' && targetVersionIndex !== undefined && targetVersionIndex > 0)
  const canEdit = true

  // Desktop/mobile detection
  const [isDesktop, setIsDesktop] = useState<boolean>(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
    return window.matchMedia('(min-width: 640px)').matches
  })

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return
    const mql = window.matchMedia('(min-width: 640px)')
    const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop((e as MediaQueryListEvent).matches ?? (e as MediaQueryList).matches)
    try {
      mql.addEventListener('change', onChange as any)
    } catch {
      ;(mql as any).addListener(onChange)
    }
    onChange(mql as any)
    return () => {
      try {
        mql.removeEventListener('change', onChange as any)
      } catch {
        ;(mql as any).removeListener(onChange)
      }
    }
  }, [])

  // Enter animation for mobile bottom sheet
  useEffect(() => { 
    if (isOpen) { 
      requestAnimationFrame(() => setEntered(true)) 
    } else { 
      setEntered(false) 
    } 
  }, [isOpen])

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm({
    resolver: zodResolver(mintNFTSchema),
    defaultValues: {
      // PersonSupplementInfo
      birthPlace: '',
      isDeathBC: false,
      deathYear: '' as string | number,
      deathMonth: '' as string | number,
      deathDay: '' as string | number,
      deathPlace: '',
      story: '',
      tokenURI: ''
    }
  })

  // Initialize person info from version data
  useEffect(() => {
    if (versionData && isOpen) {
      setPersonInfo({
        fullName: versionData.fullName || '',
        gender: versionData.gender || 0,
        birthYear: versionData.birthYear || 0,
        birthMonth: versionData.birthMonth || 0,
        birthDay: versionData.birthDay || 0,
        isBirthBC: versionData.isBirthBC || false,
        passphrase: versionData.passphrase || ''
      })
    }
  }, [versionData, isOpen])

  // Initialize from URL parameters and props on open
  useEffect(() => {
    if (!isOpen) return
    try {
      // Get values from URL parameters
      const qHash = searchParams.get('hash') || searchParams.get('personHash') || ''
      const qIndexStr = searchParams.get('vi') || searchParams.get('version') || searchParams.get('versionIndex') || ''
      const qIndex = qIndexStr ? parseInt(qIndexStr, 10) : NaN

      // Prefer props, then URL params, then keep current local state
      if (typeof personHash === 'string' && personHash.trim() !== '') {
        setLocalPersonHash(personHash.trim())
      } else if (qHash) {
        setLocalPersonHash(qHash)
      }

      if (typeof versionIndex === 'number' && versionIndex > 0) {
        setLocalVersionIndex(versionIndex)
      } else if (Number.isFinite(qIndex) && qIndex > 0) {
        setLocalVersionIndex(qIndex)
      }
    } catch {}
  }, [isOpen, personHash, versionIndex, searchParams])

  // Check endorsement and NFT minting status
  useEffect(() => {
    const checkStatus = async () => {
      if (!address || !getVersionDetails || !targetPersonHash || !targetVersionIndex || !contract) return
      
      setIsCheckingStatus(true)
      
      try {
        const details = await getVersionDetails(targetPersonHash!, targetVersionIndex!)

        // Endorsement: check user's endorsed version index for this person
        const endorsedIdx = await contract.endorsedVersionIndex(targetPersonHash!, address)
        setIsEndorsed(Number(endorsedIdx) === Number(targetVersionIndex))

        // Minted: tokenId > 0 in getVersionDetails
        const tokenId = Number(details?.tokenId ?? 0)
        setIsAlreadyMinted(tokenId > 0)
        
      } catch (error) {
        console.error('Failed to check status:', error)
        setIsEndorsed(false)
        setIsAlreadyMinted(false)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    if (isOpen && hasValidTarget) {
      checkStatus()
    }
  }, [isOpen, address, targetPersonHash, targetVersionIndex, getVersionDetails, contract, hasValidTarget])

  const handleClose = () => {
    closedBySelfRef.current = true
    reset()
    setIsSubmitting(false)
    setPersonInfo(null)
    setIsEndorsed(false)
    setIsAlreadyMinted(false)
    setIsCheckingStatus(false)
    setSuccessResult(null)
    setErrorResult(null)
    setContractError(null)
    setProofGenerationStep('')
    setEntered(false)
    setDragging(false)
    setDragOffset(0)
    onClose()
  }

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen])

  // Push history state on open so mobile back closes the modal first
  useEffect(() => {
    if (!isOpen) return
    const marker = { __dfModal: 'MintNFTModal', id: Math.random().toString(36).slice(2) }
    historyMarkerRef.current = marker
    try {
      window.history.pushState(marker, '')
      pushedRef.current = true
    } catch {}
    const onPop = () => {
      const st: any = window.history.state
      if (!st || st.id !== historyMarkerRef.current?.id) {
        closedByPopRef.current = true
        onClose()
      }
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      if (pushedRef.current && closedBySelfRef.current && !closedByPopRef.current) {
        try { window.history.back() } catch {}
      }
      pushedRef.current = false
      closedBySelfRef.current = false
      closedByPopRef.current = false
      historyMarkerRef.current = null
    }
  }, [isOpen, onClose])

  const handleContinueMinting = () => {
    // Reset form and states for new minting
    reset()
    setPersonInfo(null)
    setIsSubmitting(false)
    setSuccessResult(null)
    setErrorResult(null)
    setContractError(null)
    setProofGenerationStep('')
    setIsEndorsed(false)
    setIsAlreadyMinted(false)
    setIsCheckingStatus(false)
    // Keep modal open for continued use
  }

  const onSubmit = async (data: any) => {
    if (!address) {
      alert(t('wallet.notConnected', 'Please connect your wallet'))
      return
    }

    if (!personInfo) {
      alert(t('mintNFT.personInfoRequired', 'Please fill in person information'))
      return
    }

    // Check if user has endorsed and NFT hasn't been minted (when we have valid target)
    if (hasValidTarget) {
      if (!isEndorsed) {
        // Friendly confirm to jump to endorsement
        setShowEndorseConfirm(true)
        return
      }
      if (isAlreadyMinted) {
        alert(t('mintNFT.alreadyMinted', 'NFT has already been minted for this version'))
        return
      }
    }

    // Clear old results
    setSuccessResult(null)
    setErrorResult(null)
    setContractError(null)
    setIsSubmitting(true)

    // Convert form data to proper types
    const processedData = {
      ...data,
      deathYear: data.deathYear === '' || data.deathYear === undefined ? 0 : Number(data.deathYear),
      deathMonth: data.deathMonth === '' || data.deathMonth === undefined ? 0 : Number(data.deathMonth),
      deathDay: data.deathDay === '' || data.deathDay === undefined ? 0 : Number(data.deathDay),
    }

    console.log('🚀 Starting mint NFT process...')

    try {
      setProofGenerationStep(t('mintNFT.preparingProof', 'Preparing proof inputs...'))

      const trimmedFullName = personInfo.fullName.trim()
      const passphrase = personInfo.passphrase || ''

      if (!trimmedFullName) {
        alert(t('mintNFT.fullNameRequired', 'Full name is required to generate proof'))
        setIsSubmitting(false)
        setProofGenerationStep('')
        return
      }

      // Construct PersonCoreInfo object matching the contract structure
      const nameBinding = computeNameBinding(trimmedFullName, passphrase)

      const coreInfo = {
        basicInfo: {
          fullNameCommitment: nameBinding.digestHex,
          isBirthBC: personInfo.isBirthBC,
          birthYear: personInfo.birthYear,
          birthMonth: personInfo.birthMonth,
          birthDay: personInfo.birthDay,
          gender: personInfo.gender
        },
        supplementInfo: {
          fullName: trimmedFullName,
          birthPlace: processedData.birthPlace,
          isDeathBC: processedData.isDeathBC,
          deathYear: processedData.deathYear,
          deathMonth: processedData.deathMonth,
          deathDay: processedData.deathDay,
          deathPlace: processedData.deathPlace,
          story: processedData.story
        }
      }

      console.log('Full name keccak256:', nameBinding.nameHex)
      console.log('Passphrase keccak256:', nameBinding.saltHex)
      console.log('Poseidon digest:', nameBinding.digestHex)

      setProofGenerationStep(t('mintNFT.generatingProof', 'Generating zero-knowledge proof... (this may take 30-60 seconds)'))
      const { proof: generatedProof, publicSignals } = await generateNamePoseidonProof(trimmedFullName, passphrase)
      console.log('🔒 Generated name poseidon proof:', generatedProof)
      console.log('🔒 Generated public signals:', publicSignals)

      setProofGenerationStep(t('mintNFT.verifyingProof', 'Verifying zero-knowledge proof...'))
      const isProofValid = await verifyNamePoseidonProof(generatedProof, publicSignals)
      if (!isProofValid) {
        throw new Error(t('mintNFT.proofVerificationFailed', 'Generated proof verification failed'))
      }

      const formattedProof = formatGroth16ProofForContract(generatedProof)
      const signalValues = toBigIntArray(publicSignals)
      if (signalValues.length < 4) {
        throw new Error('Invalid name poseidon public signals length')
      }

      const proof: MintProofArgs = {
        a: formattedProof.a,
        b: formattedProof.b,
        c: formattedProof.c,
        publicSignals: signalValues.slice(0, 4) as [bigint, bigint, bigint, bigint]
      }

      setProofGenerationStep(t('mintNFT.proofVerified', 'Zero-knowledge proof verified. Submitting transaction...'))

      // Determine personHash/versionIndex
      let finalPersonHash = targetPersonHash as string | undefined
      if (!finalPersonHash && getPersonHash) {
        // Compute on-chain consistent person hash
        finalPersonHash = await getPersonHash(coreInfo.basicInfo as any)
      }
      if (!finalPersonHash) {
        alert(t('mintNFT.personHashRequired', 'Unable to compute person hash'))
        return
      }
      const finalVersionIndex = targetVersionIndex || 1 // Default to version 1 if not provided

      // Preflight: ensure endorsement matches target version
      try {
        if (contract) {
          const endorsedIdx = await contract.endorsedVersionIndex(finalPersonHash, address)
          if (Number(endorsedIdx) !== Number(finalVersionIndex)) {
            setShowEndorseConfirm(true)
            setIsSubmitting(false)
            return
          }
        }
      } catch {}

      console.log('📞 Calling mintPersonNFT with:', {
        personHash: finalPersonHash,
        versionIndex: finalVersionIndex,
        tokenURI: processedData.tokenURI || '',
        coreInfo,
        proof
      })

      const receipt = await mintPersonNFT(
        proof,
        finalPersonHash,
        finalVersionIndex,
        processedData.tokenURI || '',
        coreInfo as any
      )

      console.log('✅ mintPersonNFT returned:', receipt)

      if (receipt) {
        console.log('🎉 NFT minted successfully:', receipt)
        
        // Extract event data from receipt
        let mintedEvent = null
        try {
          // Find PersonNFTMinted event in receipt logs
          const mintedEvents = receipt.logs?.filter((log: any) => 
            log.topics?.[0] && contract?.interface.parseLog(log)?.name === 'PersonNFTMinted'
          ) || []
          
          if (mintedEvents.length > 0) {
            mintedEvent = contract?.interface.parseLog(mintedEvents[0])
          }
        } catch (e) {
          console.warn('Failed to parse mint event:', e)
        }

        // Get tokenId from contract or event
        let tokenId = 0
        try {
          const details = await getVersionDetails?.(finalPersonHash, finalVersionIndex)
          tokenId = Number(details?.tokenId ?? 0)
        } catch {}
        
        if (mintedEvent && tokenId === 0) {
          tokenId = Number(mintedEvent.args?.tokenId ?? 0)
        }

        setSuccessResult({
          tokenId,
          personHash: finalPersonHash,
          versionIndex: finalVersionIndex,
          tokenURI: processedData.tokenURI || '',
          transactionHash: receipt.hash || receipt.transactionHash || '',
          blockNumber: receipt.blockNumber || 0,
          events: {
            PersonNFTMinted: mintedEvent ? {
              personHash: mintedEvent.args?.personHash || finalPersonHash,
              tokenId: mintedEvent.args?.tokenId || tokenId,
              owner: mintedEvent.args?.owner || address,
              versionIndex: mintedEvent.args?.versionIndex || finalVersionIndex,
              tokenURI: mintedEvent.args?.tokenURI || processedData.tokenURI || '',
              timestamp: mintedEvent.args?.timestamp || Math.floor(Date.now() / 1000)
            } : null
          }
        })
        
        if (tokenId > 0) onSuccess?.(tokenId)
      }
    } catch (error: any) {
      console.error('❌ Mint NFT failed:', error)
      console.log('🔍 Error details:', {
        message: error?.message,
        parsedMessage: error?.parsedMessage,
        code: error?.code,
        data: error?.data,
        reason: error?.reason,
        errorName: error?.errorName,
        customError: error?.customError,
        info: error?.info,
        shortMessage: error?.shortMessage,
        toString: error?.toString?.()
      })

      // Parse error for better user feedback
      let errorType = 'UNKNOWN_ERROR'
      // Prefer parsedMessage from useContract.executeTransaction if available
      const baseMsg =
        error?.parsedMessage ||
        error?.shortMessage ||
        error?.reason ||
        error?.data?.message ||
        error?.error?.message ||
        error?.message ||
        'An unexpected error occurred'

      // Extract a custom error name if available
      let customName: string | undefined =
        error?.customError ||
        error?.errorName ||
        error?.data?.errorName ||
        error?.info?.error?.name

      if (!customName && typeof baseMsg === 'string') {
        const m = baseMsg.match(/reverted with custom error '([^']+)'/)
        if (m) customName = m[1].replace('()', '')
      }

      // Map known custom errors to friendly messages
      let errorMessage = baseMsg
      if (customName) {
        if (customName.includes('VersionAlreadyMinted')) {
          errorType = 'VERSION_ALREADY_MINTED'
          errorMessage = t('mintNFT.errors.versionAlreadyMinted', 'This version has already been minted as NFT')
        } else if (customName.includes('MustEndorseVersionFirst')) {
          errorType = 'MUST_ENDORSE_FIRST'
          errorMessage = t('mintNFT.errors.mustEndorseFirst', 'You must endorse this version before minting')
        } else if (customName.includes('BasicInfoMismatch')) {
          errorType = 'BASIC_INFO_MISMATCH'
          errorMessage = t('mintNFT.errors.basicInfoMismatch', 'Person information does not match the version data')
        } else if (customName.includes('InvalidTokenURI')) {
          errorType = 'INVALID_TOKEN_URI'
          errorMessage = t('mintNFT.errors.invalidTokenURI', 'Invalid token URI format')
        } else if (customName.includes('InvalidStory')) {
          errorType = 'INVALID_STORY'
          errorMessage = t('mintNFT.errors.invalidStory', 'Story content is too long')
        } else if (customName.includes('InvalidBirthPlace')) {
          errorType = 'INVALID_BIRTH_PLACE'
          errorMessage = t('mintNFT.errors.invalidBirthPlace', 'Birth place is too long')
        } else if (customName.includes('InvalidDeathPlace')) {
          errorType = 'INVALID_DEATH_PLACE'
          errorMessage = t('mintNFT.errors.invalidDeathPlace', 'Death place is too long')
        } else {
          // If we have a custom error name but no mapping, surface it
          errorType = customName
          errorMessage = customName
        }
      } else if (error?.code === 'INSUFFICIENT_FUNDS') {
        errorType = 'INSUFFICIENT_FUNDS'
        errorMessage = t('mintNFT.errors.insufficientFunds', 'Insufficient funds for transaction')
      } else if (
        error?.code === 'USER_REJECTED' ||
        error?.code === 'ACTION_REJECTED' ||
        (typeof baseMsg === 'string' && baseMsg.toLowerCase().includes('user rejected'))
      ) {
        errorType = 'USER_REJECTED'
        errorMessage = t('mintNFT.errors.userRejected', 'Transaction was rejected by user')
      }

      const errorDetails = [
        customName ? `Custom: ${customName}` : null,
        error?.code ? `Code: ${error.code}` : null,
        typeof baseMsg === 'string' ? `Message: ${baseMsg}` : null
      ]
        .filter(Boolean)
        .join('\n') || 'Unknown error'

      console.log('🚨 Setting error result:', {
        type: errorType,
        message: errorMessage,
        details: errorDetails
      })

      setErrorResult({
        type: errorType,
        message: errorMessage,
        details: errorDetails
      })
    } finally {
      setIsSubmitting(false)
      setProofGenerationStep('')
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[1200] bg-black/50 backdrop-blur-sm overflow-x-hidden" onClick={handleClose} style={{ touchAction: 'pan-y' }}>
      {/* Modal Container (responsive: bottom sheet on mobile, dialog on desktop) */}
      <div className="flex items-end sm:items-center justify-center h-full w-full p-2 sm:p-4">
        <div
          className={`relative flex flex-col w-full max-w-4xl h-[95vh] sm:h-auto sm:max-h-[95vh] bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 overflow-hidden transform transition-transform duration-300 ease-out ${entered ? 'translate-y-0' : 'translate-y-full sm:translate-y-0'} will-change-transform`}
          onClick={(e) => e.stopPropagation()}
          style={{ transform: dragging ? `translateY(${dragOffset}px)` : undefined, transitionDuration: dragging ? '0ms' : undefined }}
        >
        {/* Header */}
        <div 
          className="sticky top-0 bg-gradient-to-br from-purple-500/10 via-blue-500/8 to-indigo-500/10 dark:from-purple-600/20 dark:via-blue-600/15 dark:to-indigo-600/20 p-4 pt-7 sm:pt-6 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 relative touch-none cursor-grab active:cursor-grabbing select-none"
          onPointerDown={(e) => { (e.currentTarget as any).setPointerCapture?.(e.pointerId); startYRef.current = e.clientY; setDragging(true) }}
          onPointerMove={(e) => { if (!dragging || startYRef.current == null) return; const dy = Math.max(0, e.clientY - startYRef.current); setDragOffset(dy) }}
          onPointerUp={() => { if (!dragging) return; const shouldClose = dragOffset > 120; setDragging(false); setDragOffset(0); if (shouldClose) handleClose() }}
          onPointerCancel={() => { setDragging(false); setDragOffset(0) }}
          onTouchStart={(e) => { startYRef.current = e.touches[0].clientY; setDragging(true) }}
          onTouchMove={(e) => { if (!dragging || startYRef.current == null) return; const dy = Math.max(0, e.touches[0].clientY - startYRef.current); setDragOffset(dy) }}
          onTouchEnd={() => { if (!dragging) return; const shouldClose = dragOffset > 120; setDragging(false); setDragOffset(0); if (shouldClose) handleClose() }}
        >
          {/* Drag handle (mobile only) */}
          <div className="sm:hidden absolute top-2 left-1/2 -translate-x-1/2 h-1.5 w-12 rounded-full bg-gray-300/90 dark:bg-gray-700/90" />
          
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Image className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {t('mintNFT.title', 'Mint NFT')}
                </h2>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="whitespace-nowrap">{t('mintNFT.description', 'Create a unique NFT for this person')}</span>
                </div>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                e.preventDefault()
                handleClose()
              }}
              onPointerDown={(e) => e.stopPropagation()}
              onTouchStart={(e) => e.stopPropagation()}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors flex-shrink-0"
              aria-label={t('common.close', 'Close')}
            >
              <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto overscroll-contain overflow-x-hidden min-h-0" style={{ touchAction: 'pan-y' }}>
          <form id="mint-nft-form" onSubmit={handleSubmit(onSubmit)} className="min-h-full flex flex-col">
            <div className="flex-1 p-4 sm:p-6 space-y-6">
          
          {/* Person Hash and Version Input (always shown as editable) */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t('mintNFT.targetVersion', 'Target Version')}
            </h3>

            <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
              <div className="flex items-start gap-3 mb-3">
                <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                <div className="min-w-0">
                  <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                    {t('mintNFT.specifyVersion', 'Specify Version to Mint')}
                  </h4>
                  <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                    {t('mintNFT.specifyVersionDesc', 'Enter the person hash and version index of the version you want to mint as NFT.')}
                  </p>
                </div>
              </div>

              <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:gap-4">
                <div className="sm:flex-1">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('mintNFT.personHash', 'Person Hash')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={targetPersonHash || ''}
                    onChange={(e) => {
                      if (onPersonHashChange) onPersonHashChange(e.target.value)
                      else setLocalPersonHash(e.target.value)
                    }}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition font-mono"
                    placeholder={t('search.versionsQuery.placeholder')}
                  />
                </div>

                <div className="w-32">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('mintNFT.versionIndex', 'Version Index')} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={targetVersionIndex || 1}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1
                      if (onVersionIndexChange) onVersionIndexChange(val)
                      else setLocalVersionIndex(val)
                    }}
                    className="w-20 h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                    placeholder="1"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status indicators for valid targets */}
          {hasValidTarget && (
            <div className="p-4 bg-blue-50/50 dark:bg-blue-900/20 rounded-xl border border-blue-200/50 dark:border-blue-700/50">
              <div className="flex items-center gap-4">
                {isCheckingStatus ? (
                  <div className="text-sm text-blue-600 dark:text-blue-400">
                    {t('mintNFT.checkingStatus', 'Checking status...')}
                  </div>
                ) : (
                  <>
                    <div className={`flex items-center gap-2 text-sm ${isEndorsed ? 'text-green-600 dark:text-green-400' : 'text-orange-600 dark:text-orange-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${isEndorsed ? 'bg-green-500' : 'bg-orange-500'}`} />
                      {isEndorsed ?
                        t('mintNFT.endorsed', 'Endorsed') :
                        t('mintNFT.notEndorsed', 'Not Endorsed')
                      }
                    </div>

                    <div className={`flex items-center gap-2 text-sm ${isAlreadyMinted ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'}`}>
                      <div className={`w-2 h-2 rounded-full ${isAlreadyMinted ? 'bg-red-500' : 'bg-green-500'}`} />
                      {isAlreadyMinted ?
                        t('mintNFT.alreadyMinted', 'Already Minted') :
                        t('mintNFT.canMint', 'Can Mint')
                      }
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Show form content only if NFT hasn't been minted */}
          {!isAlreadyMinted && (
            <>
              
              {/* Basic Information - Using PersonHashCalculator */}
              <div className="space-y-4">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t('mintNFT.basicInfo', 'Basic Information')}
                </h3>
                
                <PersonHashCalculator
                  showTitle={false}
                  collapsible={false}
                  className="border-0 shadow-none"
                  initialValues={personInfo ? {
                    fullName: personInfo.fullName,
                    gender: personInfo.gender,
                    birthYear: personInfo.birthYear,
                    birthMonth: personInfo.birthMonth,
                    birthDay: personInfo.birthDay,
                    isBirthBC: personInfo.isBirthBC,
                    passphrase: personInfo.passphrase
                  } : versionData}
                  onFormChange={canEdit ? (formData) => {
                    setPersonInfo({
                      fullName: formData.fullName,
                      gender: formData.gender,
                      birthYear: formData.birthYear,
                      birthMonth: formData.birthMonth,
                      birthDay: formData.birthDay,
                      isBirthBC: formData.isBirthBC,
                      passphrase: formData.passphrase
                    })
                  } : undefined}
                />
              </div>

          {/* Supplemental Information (from PersonSupplementInfo) */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t('mintNFT.supplementalInfo', 'Supplemental Information')}
            </h3>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('mintNFT.birthPlace', 'Birth Place')}
                  </label>
                  <input
                    {...register('birthPlace')}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                    placeholder={t('mintNFT.birthPlacePlaceholder', 'Enter birth place')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {t('mintNFT.deathPlace', 'Death Place')}
                  </label>
                  <input
                    {...register('deathPlace')}
                    className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                    placeholder={t('mintNFT.deathPlacePlaceholder', 'Enter death place (if applicable)')}
                  />
                </div>

              </div>

              {/* Death Date Information - Using PersonHashCalculator style */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('mintNFT.deathDate', 'Death Date (if applicable)')}
                </h4>

                <div className="flex flex-nowrap items-start gap-1">
                  <div className="flex items-start gap-1">
                    <div className="w-20">
                      <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                        {t('search.hashCalculator.isBirthBC')}
                      </label>
                      <ThemedSelect
                        value={watch('isDeathBC') ? 1 : 0}
                        onChange={(v) => setValue('isDeathBC', v === 1)}
                        options={[
                          { value: 0, label: t('search.hashCalculator.bcOptions.ad') },
                          { value: 1, label: t('search.hashCalculator.bcOptions.bc') },
                        ]}
                      />
                    </div>

                    <div className="w-20 sm:w-[120px]">
                      <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                        {t('mintNFT.deathYear', 'Death Year')}
                      </label>
                      <input
                        type="number"
                        min="0"
                        max={watch('isDeathBC') ? 9999 : new Date().getFullYear()}
                        placeholder={watch('isDeathBC') ? '<10000' : '<=' + new Date().getFullYear()}
                        className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                        {...register('deathYear', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })}
                      />
                    </div>
                  </div>

                  <div className="w-24">
                    <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                      {t('search.hashCalculator.birthMonthLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="12"
                      placeholder={t('search.hashCalculator.birthMonth')}
                      className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                      {...register('deathMonth', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })}
                    />
                  </div>

                  <div className="w-24">
                    <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                      {t('search.hashCalculator.birthDayLabel')}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="31"
                      placeholder={t('search.hashCalculator.birthDay')}
                      className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                      {...register('deathDay', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })}
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t('mintNFT.story', 'Life Story Summary')}
                </label>
                <textarea
                  {...register('story')}
                  rows={4}
                  className="w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition resize-none"
                  placeholder={t('mintNFT.storyPlaceholder', 'Enter a brief life story summary...')}
                />
                {errors.story && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.story.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* NFT Metadata */}
          <div className="space-y-4">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t('mintNFT.metadata', 'NFT Metadata')}
            </h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('mintNFT.tokenURI', 'Token URI')}
              </label>
              <input
                {...register('tokenURI')}
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                placeholder="https://... or ipfs://..."
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {t('mintNFT.tokenURIHint', 'Optional: URL or IPFS hash for NFT metadata')}
              </p>
              {errors.tokenURI && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.tokenURI.message}</p>
              )}
            </div>
          </div>
            </>
          )}
          
          {/* Message when NFT is already minted */}
          {isAlreadyMinted && (
            <div className="p-6 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('mintNFT.nftAlreadyMinted', 'NFT Already Minted')}
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                {t('mintNFT.nftAlreadyMintedDesc', 'This version has already been minted as an NFT. Each version can only be minted once.')}
              </p>
            </div>
          )}

          {/* Progress Indicator */}
          {isSubmitting && !successResult && !errorResult && (
            <div className="mx-4 sm:mx-6 mb-4 p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-700">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-purple-900 dark:text-purple-100 mb-1">
                    {proofGenerationStep
                      ? t('mintNFT.processing', 'Processing...')
                      : t('mintNFT.minting', 'Minting NFT...')}
                  </p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">
                    {proofGenerationStep || t('mintNFT.mintingDesc', 'Creating your unique NFT on the blockchain...')}
                  </p>
                </div>
              </div>
              {proofGenerationStep?.includes('30-60 seconds') && (
                <div className="mt-3 text-xs text-purple-700 dark:text-purple-300">
                  {t('mintNFT.proofGenerationNote', 'ZK proof generation requires heavy cryptography. Please keep this tab active until completion.')}
                </div>
              )}
            </div>
          )}

          {/* Success Message */}
          {successResult && (
            <div className="mx-4 sm:mx-6 mb-4 space-y-3">
              {/* Main Success Message */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    {t('mintNFT.mintedSuccessfully', 'NFT minted successfully!')}
                  </p>
                </div>
                
                <div className="space-y-2 text-xs text-green-700 dark:text-green-300">
                  {/* Token ID */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('mintNFT.tokenId', 'Token ID')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      #{successResult.tokenId}
                    </code>
                  </div>
                  
                  {/* Person Hash */}
                  <div>
                    <span className="font-medium">{t('mintNFT.personHash', 'Person Hash')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.personHash}
                    </code>
                  </div>
                  
                  {/* Version Index */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('mintNFT.versionIndex', 'Version Index')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.versionIndex}
                    </code>
                  </div>
                  
                  {/* Token URI */}
                  {successResult.tokenURI && (
                    <div>
                      <span className="font-medium">{t('mintNFT.tokenURI', 'Token URI')}:</span>
                      <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                        {successResult.tokenURI}
                      </code>
                    </div>
                  )}
                  
                  {/* Transaction Hash */}
                  <div>
                    <span className="font-medium">{t('mintNFT.transactionHash', 'Transaction Hash')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.transactionHash}
                    </code>
                  </div>
                  
                  {/* Block Number */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('mintNFT.blockNumber', 'Block Number')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.blockNumber}
                    </code>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              {successResult.events.PersonNFTMinted && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('mintNFT.eventDetails', 'Event Details')}:
                  </h4>
                  
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded border border-purple-200 dark:border-purple-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                      <span className="text-xs font-medium text-purple-900 dark:text-purple-100">
                        {t('mintNFT.nftMintedEvent', 'PersonNFTMinted Event')}
                      </span>
                    </div>
                    <p className="text-xs text-purple-700 dark:text-purple-300 mb-3">
                      {t('mintNFT.nftMintedEventDesc', 'NFT was successfully minted and recorded on-chain')}
                    </p>
                    
                    {/* Complete Event Details */}
                    <div className="space-y-2 text-xs">
                      {/* Owner */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-purple-800 dark:text-purple-200">
                          {t('mintNFT.owner', 'Owner')}:
                        </span>
                        <code className="col-span-2 bg-purple-100 dark:bg-purple-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.PersonNFTMinted.owner}
                        </code>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-purple-800 dark:text-purple-200">
                          {t('mintNFT.timestamp', 'Timestamp')}:
                        </span>
                        <span className="col-span-2 text-purple-700 dark:text-purple-300">
                          {new Date(Number(successResult.events.PersonNFTMinted.timestamp) * 1000).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {errorResult && (
            <div className="mx-4 sm:mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                    {t('mintNFT.mintFailed', 'NFT Minting Failed')}
                  </p>
                  <div className="space-y-2 text-xs text-red-700 dark:text-red-300">
                    <div>
                      <span className="font-medium">{t('mintNFT.errorType', 'Error Type')}:</span>
                      <code className="ml-2 bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded">
                        {errorResult.type}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">{t('mintNFT.errorMessage', 'Message')}:</span>
                      <p className="mt-1 bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                        {errorResult.message}
                      </p>
                    </div>
                    {errorResult.details !== errorResult.message && (
                      <div>
                        <span className="font-medium">{t('mintNFT.errorDetails', 'Details')}:</span>
                        <p className="mt-1 bg-red-100 dark:bg-red-800 px-2 py-1 rounded text-xs">
                          {errorResult.details}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
            </div>

            {/* Submit Buttons */}
            <div className="flex gap-3 p-4 sm:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
              {successResult ? (
                // Success state: Show Continue Minting and Close buttons
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    {t('common.close', 'Close')}
                  </button>
                  <button
                    type="button"
                    onClick={handleContinueMinting}
                    className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('mintNFT.continueMinting', 'Continue Minting')}
                  </button>
                </>
              ) : (
                // Normal state: Show Cancel and Mint buttons
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  
                  {/* Only show mint button if NFT hasn't been minted */}
                  {!isAlreadyMinted && (
                    <>
                      {hasValidTarget && !isEndorsed ? (
                        <button
                          type="button"
                          onClick={() => setShowEndorseModal(true)}
                          disabled={isCheckingStatus}
                          className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {t('mintNFT.goEndorse', 'Go Endorse')}
                        </button>
                      ) : (
                        <button
                          type="submit"
                          disabled={isSubmitting || isCheckingStatus}
                          className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                        >
                          {isSubmitting ?
                            t('mintNFT.minting', 'Minting...') :
                            t('mintNFT.mint', 'Mint NFT')
                          }
                        </button>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </form>
        </div>
        </div>
        {/* Quick Endorse Modal */}
        {hasValidTarget && (
          <EndorseModal
            isOpen={showEndorseModal}
            onClose={() => setShowEndorseModal(false)}
            onSuccess={() => {
              setIsEndorsed(true)
              setShowEndorseModal(false)
            }}
            personHash={targetPersonHash}
            versionIndex={targetVersionIndex}
            versionData={versionData}
          />
        )}

        {/* Confirm to jump to endorse */}
        {showEndorseConfirm && (
          <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/40 p-4" onClick={() => setShowEndorseConfirm(false)}>
            <div className="w-full max-w-sm rounded-xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-2">
                {t('mintNFT.endorsementRequiredTitle', 'Endorsement Required')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                {t('mintNFT.endorsementRequiredDesc', 'You must endorse this version before minting. Would you like to go endorse now?')}
              </p>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowEndorseConfirm(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowEndorseConfirm(false); setShowEndorseModal(true) }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {t('mintNFT.goEndorse', 'Go Endorse')}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
