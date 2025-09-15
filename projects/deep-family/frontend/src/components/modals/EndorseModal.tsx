import React, { useState, useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { X, Star, Coins, AlertCircle, Users, Check, AlertTriangle } from 'lucide-react'
import { useContract } from '../../hooks/useContract'
import { useWallet } from '../../context/WalletContext'
import { ethers } from 'ethers'
import { useSearchParams } from 'react-router-dom'

interface EndorseModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (result: any) => void
  personHash?: string
  versionIndex?: number
  onPersonHashChange?: (hash: string) => void
  onVersionIndexChange?: (index: number) => void
  versionData?: {
    fullName?: string
    gender?: number
    birthYear?: number
    endorsementCount?: number
    isNFTMinted?: boolean
    nftHolder?: string
    versionCreator?: string
  }
}

export default function EndorseModal({
  isOpen,
  onClose,
  onSuccess,
  personHash,
  versionIndex,
  onPersonHashChange,
  onVersionIndexChange,
  versionData
}: EndorseModalProps) {
  const { t } = useTranslation()
  const { address, signer } = useWallet()
  const { endorseVersion, getVersionDetails, contract } = useContract()
  const [searchParams] = useSearchParams()
  // Track history push/pop to close on mobile back like NodeDetailModal
  const pushedRef = useRef(false)
  const closedBySelfRef = useRef(false)
  const closedByPopRef = useRef(false)
  const historyMarkerRef = useRef<{ __dfModal: string; id: string } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [deepTokenFee, setDeepTokenFee] = useState<string>('0')
  const [deepTokenFeeRaw, setDeepTokenFeeRaw] = useState<bigint>(0n)
  const [currentEndorsementCount, setCurrentEndorsementCount] = useState(versionData?.endorsementCount || 0)
  const [hasEndorsed, setHasEndorsed] = useState(false)
  const [feeRecipient, setFeeRecipient] = useState<string>('')
  const [userDeepBalance, setUserDeepBalance] = useState<string>('0')
  const [deepTokenAddress, setDeepTokenAddress] = useState<string>('')
  const [deepTokenDecimals, setDeepTokenDecimals] = useState<number>(18)
  const [deepTokenSymbol, setDeepTokenSymbol] = useState<string>('DEEP')
  const [isApproving, setIsApproving] = useState(false)
  const [approveUnlimited, setApproveUnlimited] = useState(false)
  const [entered, setEntered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startYRef = useRef<number | null>(null)
  const [isTargetValidOnChain, setIsTargetValidOnChain] = useState<boolean>(false)
  const isBytes32 = (v: string | undefined | null) => !!v && /^0x[0-9a-fA-F]{64}$/.test(v.trim())
  // Local fallback state when parent does not control inputs
  const [localPersonHash, setLocalPersonHash] = useState<string>('')
  // Default to 1 so typing only the hash enables the action
  const [localVersionIndex, setLocalVersionIndex] = useState<number>(1)
  const [successResult, setSuccessResult] = useState<{
    personHash: string
    versionIndex: number
    endorsementFee: string
    feeRecipient: string
    transactionHash: string
    blockNumber: number
    events: {
      PersonVersionEndorsed: any
    }
  } | null>(null)
  const [errorResult, setErrorResult] = useState<{
    type: string
    message: string
    details: string
  } | null>(null)

  // Unified target values: prefer props if provided, otherwise local state
  const targetPersonHash = (personHash ?? localPersonHash)?.trim()
  const targetVersionIndex = (versionIndex ?? localVersionIndex)  
  const isPersonHashFormatValid = isBytes32(targetPersonHash)
  
  // Determine modes and validity
  const hasValidTarget = Boolean(targetPersonHash && targetPersonHash !== '' && targetVersionIndex !== undefined && targetVersionIndex > 0)
  // View mode only when target provided via parent props (navigation/use elsewhere)
  const isViewMode = Boolean(personHash && personHash.trim() !== '' && versionIndex !== undefined && versionIndex > 0)

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

  // Load endorsement details when modal opens (when target is valid)
  useEffect(() => {
    const loadEndorsementData = async () => {
      if (!isOpen || !address || !contract) return
      // Always attempt to load token basics (fee + balance), even if target not set yet
      // Then load target-specific details if hash/index are ready
      try {
        // Get current DEEP token fee (recentReward)
        const deepTokenContract = await contract.DEEP_FAMILY_TOKEN_CONTRACT()
        setDeepTokenAddress(deepTokenContract)
        const tokenContract = new ethers.Contract(
          deepTokenContract,
          [
            'function recentReward() view returns (uint256)',
            'function balanceOf(address) view returns (uint256)',
            'function decimals() view returns (uint8)',
            'function allowance(address,address) view returns (uint256)',
            'function symbol() view returns (string)'
          ],
          contract.runner
        )
        
        const fee = await tokenContract.recentReward()
        const decimals = await tokenContract.decimals()
        try {
          const sym = await tokenContract.symbol()
          if (sym) setDeepTokenSymbol(sym)
        } catch {}
        setDeepTokenDecimals(Number(decimals))
        const balance = await tokenContract.balanceOf(address)
        setDeepTokenFee(ethers.formatUnits(fee, decimals))
        setDeepTokenFeeRaw(fee)
        setUserDeepBalance(ethers.formatUnits(balance, decimals))

        // Target-specific loads
        if (hasValidTarget && getVersionDetails && targetPersonHash && targetVersionIndex !== undefined) {
          try {
            const details = await getVersionDetails(targetPersonHash, targetVersionIndex)
            if (details) {
              setCurrentEndorsementCount(Number(details.endorsementCount))
              // Determine fee recipient
              const tokenId = Number(details.tokenId)
              if (tokenId > 0) {
                // NFT exists, fee goes to NFT holder
                const nftHolder = await contract.ownerOf(tokenId)
                setFeeRecipient(nftHolder)
              } else {
                // No NFT, fee goes to version creator
                const versionDetail = details.version
                setFeeRecipient(versionDetail.addedBy)
              }
              setIsTargetValidOnChain(true)
            } else {
              setIsTargetValidOnChain(false)
            }
          } catch (e) {
            setIsTargetValidOnChain(false)
          }
          // Check if current user has already endorsed this version (placeholder)
          try {
            const endorsedIdx = await contract.endorsedVersionIndex(targetPersonHash, address)
            setHasEndorsed(Number(endorsedIdx) === Number(targetVersionIndex))
          } catch {
            setHasEndorsed(false)
          }
        }
      } catch (error) {
        console.error('Failed to load endorsement data:', error)
      }
    }
    loadEndorsementData()
  }, [isOpen, address, getVersionDetails, contract, hasValidTarget, targetPersonHash, targetVersionIndex])

  // Initialize from URL parameters on open if parent didn't pass values
  useEffect(() => {
    if (!isOpen) return
    // Only set local state if props are not provided/controlled
    const hasPropHash = typeof personHash === 'string' && personHash.trim() !== ''
    const hasPropIndex = typeof versionIndex === 'number' && versionIndex > 0
    if (hasPropHash && hasPropIndex) return
    try {
      const qHash = searchParams.get('hash') || searchParams.get('personHash') || ''
      const qIndexStr = searchParams.get('vi') || searchParams.get('version') || searchParams.get('versionIndex') || ''
      const qIndex = qIndexStr ? parseInt(qIndexStr, 10) : NaN
      if (!hasPropHash && qHash) setLocalPersonHash(qHash)
      if (!hasPropIndex && Number.isFinite(qIndex) && qIndex > 0) setLocalVersionIndex(qIndex)
    } catch {}
  }, [isOpen, personHash, versionIndex, searchParams])

  const handleClose = () => {
    closedBySelfRef.current = true
    setIsSubmitting(false)
    setSuccessResult(null)
    setErrorResult(null)
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
    const marker = { __dfModal: 'EndorseModal', id: Math.random().toString(36).slice(2) }
    historyMarkerRef.current = marker
    try {
      window.history.pushState(marker, '')
      pushedRef.current = true
    } catch {}
    const onPop = () => {
      // Only close if our pushed entry was popped (i.e., new state is not our marker)
      const st: any = window.history.state
      if (!st || st.id !== historyMarkerRef.current?.id) {
        closedByPopRef.current = true
        onClose()
      }
    }
    window.addEventListener('popstate', onPop)
    return () => {
      window.removeEventListener('popstate', onPop)
      // If closed by self and we pushed a state, consume the extra history entry
      if (pushedRef.current && closedBySelfRef.current && !closedByPopRef.current) {
        try { window.history.back() } catch {}
      }
      pushedRef.current = false
      closedBySelfRef.current = false
      closedByPopRef.current = false
      historyMarkerRef.current = null
    }
  }, [isOpen, onClose])

  const handleContinueEndorsing = () => {
    // Reset form and states for new endorsement
    setIsSubmitting(false)
    setIsApproving(false)
    setSuccessResult(null)
    setErrorResult(null)
    setHasEndorsed(false)
    setCurrentEndorsementCount(0)
    setIsTargetValidOnChain(false)
    
    // Reset inputs
    if (onPersonHashChange) onPersonHashChange('')
    if (onVersionIndexChange) onVersionIndexChange(1)
    // Also reset local state for uncontrolled usage
    setLocalPersonHash('')
    setLocalVersionIndex(1)
    
    // Reset other states that might affect the UI
    setFeeRecipient('')
    setDeepTokenFee('0')
    setDeepTokenFeeRaw(0n)
    setUserDeepBalance('0')
    
    // Keep modal open for continued use
    console.log('🔄 Ready for next endorsement')
  }

  const handleEndorse = async () => {
    if (!address) {
      alert(t('wallet.notConnected', 'Please connect your wallet'))
      return
    }

    if (!hasValidTarget) {
      alert(t('endorse.personHashRequired', 'Please provide valid person hash and version index'))
      return
    }

    if (parseFloat(userDeepBalance) < parseFloat(deepTokenFee)) {
      alert(t('endorse.insufficientDeepTokens', 'Insufficient DEEP tokens for endorsement'))
      return
    }

    // Clear old results
    setSuccessResult(null)
    setErrorResult(null)
    setIsSubmitting(true)

    try {
      console.log('🔄 Starting endorsement process for:', targetPersonHash, 'version:', targetVersionIndex)
      
      // Early success if already endorsed the same version; skip approvals entirely
      try {
        if (contract && address && targetPersonHash) {
          const endorsedIdx = await contract.endorsedVersionIndex(targetPersonHash, address)
          if (Number(endorsedIdx) === Number(targetVersionIndex)) {
            setHasEndorsed(true)
            onSuccess?.({ alreadyEndorsed: true })
            setIsSubmitting(false)
            return
          }
        }
      } catch {}

      // Ensure ERC20 allowance for endorsement fee
      if (!contract || !deepTokenAddress || !signer) {
        console.error('❌ Contract not ready:', { contract: !!contract, deepTokenAddress, signer: !!signer })
        throw new Error('Contract not ready')
      }
      const spender = await contract.getAddress()
      console.log('📝 Spender address:', spender)
      const tokenContract = new ethers.Contract(
        deepTokenAddress,
        [
          'function allowance(address,address) view returns (uint256)',
          'function approve(address,uint256) returns (bool)',
          'function recentReward() view returns (uint256)',
          'function increaseAllowance(address,uint256) returns (bool)'
        ],
        signer
      )
      // Re-fetch latest fee (it may change dynamically)
      const latestFee: bigint = await tokenContract.recentReward()
      const required: bigint = latestFee > 0n ? latestFee : deepTokenFeeRaw
      console.log('💰 Fee details:', { latestFee: latestFee.toString(), required: required.toString(), deepTokenFeeRaw: deepTokenFeeRaw.toString() })
      
      const currentAllowance: bigint = await tokenContract.allowance(address, spender)
      console.log('🔐 Allowance check:', { currentAllowance: currentAllowance.toString(), required: required.toString(), needsApproval: currentAllowance < required })
      if (currentAllowance < required) {
        setIsApproving(true)
        let tx
        try {
          if (approveUnlimited) {
            // Preflight simulate approve for unlimited
            try {
              const fn: any = (tokenContract as any)?.approve?.staticCall
              if (typeof fn === 'function') {
                await fn(spender, ethers.MaxUint256)
              }
            } catch (preErr) {
              console.warn('approve(unlimited) preflight failed, will fallback to minimal approval:', preErr)
            }
            tx = await tokenContract.approve(spender, ethers.MaxUint256)
          } else {
            // Prefer increasing by delta to avoid resetting allowance downwards
            const delta = required - currentAllowance
            try {
              tx = await tokenContract.increaseAllowance(spender, delta)
            } catch {
              tx = await tokenContract.approve(spender, required)
            }
          }
        } catch (approveError: any) {
          setIsApproving(false)
          if (approveError.code === 'ACTION_REJECTED' || approveError.message?.includes('user rejected')) {
            throw new Error('User rejected token approval')
          }
          throw approveError
        }
        try {
          await tx.wait()
        } catch (waitError: any) {
          setIsApproving(false)
          throw waitError
        }
        // Small delay + recheck to avoid race where allowance is not yet visible
        try {
          await new Promise(resolve => setTimeout(resolve, 500))
        } catch {}
        let postAllowance: bigint = currentAllowance
        try {
          postAllowance = await tokenContract.allowance(address, spender)
        } catch {}
        if (postAllowance < required && !approveUnlimited) {
          // Try a couple of quick retries before proceeding
          for (let i = 0; i < 3 && postAllowance < required; i++) {
            try { await new Promise(r => setTimeout(r, 300)) } catch {}
            try { postAllowance = await tokenContract.allowance(address, spender) } catch {}
          }
        }
        setIsApproving(false)
      }

      // Preflight: staticCall to catch reverts before wallet pops (ethers v6)
      console.log('🔍 Running preflight check...')
      try {
        const fn: any = (contract as any)?.endorseVersion?.staticCall
        if (typeof fn === 'function') {
          await fn(targetPersonHash!, targetVersionIndex!)
          console.log('✅ Preflight check passed')
        } else {
          console.warn('⚠️ staticCall not available, skipping preflight check')
        }
      } catch (simErr: any) {
        console.error('❌ Preflight check failed:', simErr)
        // Handle preflight errors through our error display system instead of alert
        throw simErr
      }

      // Gas estimate with safety margin to avoid wallet estimation quirks
      let overrides: any = {}
      try {
        const estFn: any = (contract as any)?.endorseVersion?.estimateGas
        if (typeof estFn === 'function') {
          const est: bigint = await estFn(targetPersonHash!, targetVersionIndex!)
          if (typeof est === 'bigint') {
            const padded = (est * 12n) / 10n + 30000n
            overrides.gasLimit = padded
          }
        }
      } catch {}

      // Helper to apply success state from a mined receipt
      const applySuccessFromReceipt = (result: any) => {
        if (!result) return
        try {
          // Clear any pending/pseudo-error state
          setErrorResult(null)
          console.log('📋 endorseVersion result:', result)
          // Extract event data from receipt
          let endorsedEvent: any = null
          try {
            const endorsedEvents = result.logs?.filter((log: any) => {
              try {
                const parsedLog = contract?.interface.parseLog(log)
                return parsedLog?.name === 'PersonVersionEndorsed'
              } catch {
                return false
              }
            }) || []
            if (endorsedEvents.length > 0) {
              endorsedEvent = contract?.interface.parseLog(endorsedEvents[0])
            }
          } catch (e) {
            console.warn('Failed to parse endorsement event:', e)
            endorsedEvent = {
              args: {
                personHash: targetPersonHash!,
                endorser: address,
                versionIndex: targetVersionIndex!,
                endorsementFee: deepTokenFeeRaw.toString(),
                timestamp: Math.floor(Date.now() / 1000)
              }
            }
          }

          setCurrentEndorsementCount(prev => prev + 1)
          setHasEndorsed(true)
          // Update user balance (best effort UI hint)
          const newBalance = parseFloat(userDeepBalance) - parseFloat(deepTokenFee)
          if (!Number.isNaN(newBalance)) setUserDeepBalance(newBalance.toString())

          setSuccessResult(prev => prev ?? ({
            personHash: targetPersonHash!,
            versionIndex: targetVersionIndex!,
            endorsementFee: deepTokenFee,
            feeRecipient: feeRecipient,
            transactionHash: result.hash || result.transactionHash || '',
            blockNumber: result.blockNumber || 0,
            events: {
              PersonVersionEndorsed: endorsedEvent ? {
                personHash: endorsedEvent.args?.personHash || targetPersonHash!,
                endorser: endorsedEvent.args?.endorser || address,
                versionIndex: endorsedEvent.args?.versionIndex || targetVersionIndex!,
                endorsementFee: endorsedEvent.args?.endorsementFee || deepTokenFeeRaw.toString(),
                timestamp: endorsedEvent.args?.timestamp || Math.floor(Date.now() / 1000)
              } : null
            }
          }))
        } catch (e) {
          console.warn('Failed to apply endorsement success from receipt:', e)
        }
      }

      console.log('🚀 Calling endorseVersion with overrides:', overrides)
      const endorsePromise = endorseVersion(targetPersonHash!, targetVersionIndex!, overrides)

      // Prevent indefinite spinner if wallet/provider never resolves. Fallback after 40s.
      let timedOut = false
      const timeoutMs = 40_000
      const timeout = setTimeout(() => {
        timedOut = true
        console.warn('⏳ Endorse transaction still pending after timeout; keeping UI responsive')
        setIsSubmitting(false)
        // Provide a gentle hint in the UI without marking as an error
        setErrorResult(prev => prev ?? ({
          type: 'PENDING_CONFIRMATION',
          message: t('transaction.pending', 'Transaction pending confirmation...'),
          details: t('transaction.pendingDetails', 'The transaction is submitted or awaiting wallet confirmation. You can keep using the app; we will update once it confirms.')
        }))
      }, timeoutMs)

      let result: any = null
      try {
        result = await endorsePromise
      } finally {
        clearTimeout(timeout)
      }

      if (timedOut) {
        // Receipt arrived later; apply success now without re-enabling spinner
        if (result) applySuccessFromReceipt(result)
        return
      }

      console.log('📋 endorseVersion result:', result)

      if (result) {
        console.log('🎉 Endorsement successful:', result)
        applySuccessFromReceipt(result)
        
        // Don't call onSuccess automatically to prevent modal from closing
        // onSuccess?.(result)
      } else {
        // endorseVersion returned null, meaning the transaction failed
        // The error was already handled by executeTransaction and shown via toast
        // We should show our error UI as well
        setErrorResult({
          type: 'TRANSACTION_FAILED',
          message: t('endorse.transactionFailed', 'Transaction failed. Please check the error message and try again.'),
          details: t('endorse.transactionFailedDetails', 'The transaction was submitted but failed to complete successfully.')
        })
      }
    } catch (error: any) {
      console.error('❌ Endorse failed:', error)
      
      // Parse error for better user feedback
      let errorType = 'UNKNOWN_ERROR'
      let errorMessage = error.message || 'An unexpected error occurred'
      let errorDetails = error.message || 'Unknown error'

      // Check for specific contract errors
      if (/InvalidVersionIndex|InvalidPersonHash/i.test(errorMessage)) {
        errorType = 'INVALID_TARGET'
        errorMessage = t('endorse.errors.invalidTarget', 'Invalid person hash or version index')
      } else if (/insufficient allowance|ERC20InsufficientAllowance/i.test(errorMessage)) {
        errorType = 'INSUFFICIENT_ALLOWANCE'
        errorMessage = t('endorse.errors.needApprove', 'Allowance too low, please approve DEEP tokens again')
      } else if (/insufficient funds|ERC20InsufficientBalance/i.test(errorMessage)) {
        errorType = 'INSUFFICIENT_BALANCE'
        errorMessage = t('endorse.errors.insufficientDeepTokens', 'Insufficient DEEP tokens for endorsement')
      } else if (/EndorsementFeeTransferFailed/i.test(errorMessage)) {
        errorType = 'FEE_TRANSFER_FAILED'
        errorMessage = t('endorse.errors.feeTransferFailed', 'Failed to transfer endorsement fee')
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        errorType = 'INSUFFICIENT_FUNDS'
        errorMessage = t('endorse.errors.insufficientFunds', 'Insufficient funds for transaction')
      } else if (error.code === 'USER_REJECTED') {
        errorType = 'USER_REJECTED'
        errorMessage = t('endorse.errors.userRejected', 'Transaction was rejected by user')
      }

      setErrorResult({
        type: errorType,
        message: errorMessage,
        details: errorDetails
      })
    } finally {
      setIsApproving(false)
      setIsSubmitting(false)
    }
  }

  const formatAddress = (addr: string) => {
    if (!addr) return ''
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const canAffordEndorsement = parseFloat(userDeepBalance) >= parseFloat(deepTokenFee)

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
          className="sticky top-0 bg-gradient-to-br from-green-500/10 via-blue-500/8 to-indigo-500/10 dark:from-green-600/20 dark:via-blue-600/15 dark:to-indigo-600/20 p-4 pt-7 sm:pt-6 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 relative touch-none cursor-grab active:cursor-grabbing select-none"
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
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center shadow-lg flex-shrink-0">
                <Star className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {t('endorse.title', 'Endorse Version')}
            </h2>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="whitespace-nowrap">{t('endorse.description', 'Support quality data by endorsing versions')}</span>
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
          <div className="flex-1 p-4 sm:p-6 space-y-6">
          
          {/* Person Hash and Version Input (when not in view mode) */}
          {!isViewMode && (
            <div className="space-y-4">
              <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                {t('endorse.targetVersion', 'Target Version')}
              </h3>
              
              <div className="p-4 bg-amber-50/50 dark:bg-amber-900/20 rounded-xl border border-amber-200/50 dark:border-amber-700/50">
                <div className="flex items-start gap-3 mb-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <h4 className="text-sm font-medium text-amber-900 dark:text-amber-100">
                      {t('endorse.specifyVersion', 'Specify Version to Endorse')}
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-200 mt-1">
                      {t('endorse.specifyVersionDesc', 'Enter the person hash and version index of the version you want to endorse.')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-0 sm:flex sm:items-start sm:gap-4">
                  <div className="sm:flex-1">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('endorse.personHash', 'Person Hash')} <span className="text-red-500">*</span>
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
                      {t('endorse.versionIndex', 'Version Index')} <span className="text-red-500">*</span>
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
                      className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                      placeholder="1"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Version Info (when in view mode) */}
          {isViewMode && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                  {t('endorse.versionInfo', 'Version Information')}
                </h3>
                <div className="mt-2 space-y-1 text-sm text-blue-700 dark:text-blue-200">
                  {versionData?.fullName && (
                    <div>
                      <span className="font-medium">{t('endorse.fullName', 'Full Name')}:</span> {versionData.fullName}
                    </div>
                  )}
                  <div>
                      <span className="font-medium">{t('endorse.personHash', 'Person Hash')}:</span> {formatAddress(targetPersonHash || '')}
                  </div>
                  <div>
                    <span className="font-medium">{t('endorse.versionIndex', 'Version')}:</span> {targetVersionIndex}
                  </div>
                  <div>
                    <span className="font-medium">{t('endorse.currentEndorsements', 'Current Endorsements')}:</span> {currentEndorsementCount}
                  </div>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* DEEP Token Fee Info */}
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-3">
              <Coins className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span className="text-sm font-medium text-purple-800 dark:text-purple-200">
                {t('endorse.deepTokenFee', 'DEEP Token Fee')}: {deepTokenFee} DEEP
              </span>
            </div>
            <div className="text-xs text-purple-700 dark:text-purple-300 space-y-2">
              <div className="flex justify-between">
                <span>{t('endorse.yourBalance', 'Your DEEP Balance')}:</span>
                <span className={`font-mono ${canAffordEndorsement ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {userDeepBalance} DEEP
                </span>
              </div>
              <div className="flex justify-between">
                <span>{t('endorse.feeRecipient', 'Fee Recipient')}:</span>
                <span className="font-mono">{formatAddress(feeRecipient)}</span>
              </div>
              <div className="flex items-center gap-2 pt-2 border-t border-purple-200/50 dark:border-purple-800/50">
                <input
                  id="approve-unlimited"
                  type="checkbox"
                  className="w-4 h-4 rounded border-purple-300 dark:border-purple-700 text-purple-600 focus:ring-purple-500"
                  checked={approveUnlimited}
                  onChange={(e) => setApproveUnlimited(e.target.checked)}
                />
                <label htmlFor="approve-unlimited" className="text-xs select-none cursor-pointer">
                  {t('endorse.approveUnlimited', 'Approve unlimited DEEP allowance to avoid future approvals')}
                </label>
              </div>
            </div>
          </div>

          {/* Fee Distribution Explanation */}
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 mb-2">
              {t('endorse.feeDistribution', 'Fee Distribution')}
            </h3>
            <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
              {versionData?.isNFTMinted ? (
                <div>
                  <strong>{t('endorse.nftMinted', 'NFT Minted')}:</strong> {t('endorse.feeToNFTHolder', '100% of fee goes to current NFT holder')}
                </div>
              ) : (
                <div>
                  <strong>{t('endorse.noNFT', 'No NFT Yet')}:</strong> {t('endorse.feeToCreator', '100% of fee goes to version creator')}
                </div>
              )}
              <p className="text-xs opacity-75">
                {t('endorse.feeNote', 'DEEP token fee is dynamic based on current mining rewards')}
              </p>
            </div>
          </div>

          {/* Insufficient Balance Warning */}
          {!canAffordEndorsement && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('endorse.insufficientBalance', 'Insufficient DEEP Token Balance')}
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {t('endorse.needMoreTokens', 'You need more DEEP tokens to endorse this version')}
              </p>
            </div>
          )}

          {/* Invalid target warning */}
          {hasValidTarget && isPersonHashFormatValid && !isTargetValidOnChain && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('endorse.invalidTarget', 'Invalid person hash or version index')}
                </span>
              </div>
              <p className="text-xs text-red-700 dark:text-red-300 mt-1">
                {t('endorse.invalidTargetDesc', 'Please verify the hash and index refer to an existing version')}
              </p>
            </div>
          )}

          {/* Invalid hash format warning */}
          {targetPersonHash && !isPersonHashFormatValid && (
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  {t('search.validation.hashInvalid', 'Please enter a valid 64-character hexadecimal hash')}
                </span>
              </div>
            </div>
          )}

          {/* Endorsement Benefits */}
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
              {t('endorse.benefits', 'Benefits of Endorsing')}
            </h3>
            <ul className="text-xs text-green-700 dark:text-green-200 space-y-1 list-disc list-inside">
              <li>{t('endorse.benefitQuality', 'Help verify and improve data quality')}</li>
              <li>{t('endorse.benefitPriority', 'Endorsed versions get higher priority in searches')}</li>
              <li>{t('endorse.benefitNFT', 'Required step before minting NFTs')}</li>
              <li>{t('endorse.benefitEconomy', 'Support version creators and NFT holders')}</li>
            </ul>
          </div>

          {/* Progress Indicator */}
          {(isSubmitting || isApproving) && !successResult && !errorResult && (
            <div className="mx-4 sm:mx-6 mb-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100 mb-1">
                    {isApproving ? 
                      t('endorse.approving', 'Approving DEEP tokens...') : 
                      t('endorse.endorsing', 'Endorsing version...')
                    }
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    {isApproving ? 
                      t('endorse.approvingDesc', 'Please confirm the token approval in your wallet') :
                      t('endorse.endorsingDesc', 'Processing endorsement on the blockchain...')
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {successResult && (
            <div className="mx-4 sm:mx-6 mb-4 space-y-3">
              {/* Main Success Message */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <div className="flex items-center gap-3 mb-3">
                  <Check className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-green-900 dark:text-green-100">
                      {t('endorse.endorsedSuccessfully', 'Version endorsed successfully!')}
                    </p>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      {t('endorse.canContinueEndorsing', 'You can now continue to endorse other versions or close this dialog.')}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs text-green-700 dark:text-green-300">
                  {/* Person Hash */}
                  <div>
                    <span className="font-medium">{t('endorse.personHash', 'Person Hash')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.personHash}
                    </code>
                  </div>
                  
                  {/* Version Index */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('endorse.versionIndex', 'Version Index')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.versionIndex}
                    </code>
                  </div>
                  
                  {/* Endorsement Fee */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('endorse.feePaid', 'Fee Paid')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.endorsementFee} DEEP
                    </code>
                  </div>
                  
                  {/* Fee Recipient */}
                  <div>
                    <span className="font-medium">{t('endorse.feeRecipient', 'Fee Recipient')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.feeRecipient}
                    </code>
                  </div>
                  
                  {/* Transaction Hash */}
                  <div>
                    <span className="font-medium">{t('endorse.transactionHash', 'Transaction Hash')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.transactionHash}
                    </code>
                  </div>
                  
                  {/* Block Number */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('endorse.blockNumber', 'Block Number')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.blockNumber}
                    </code>
                  </div>
                </div>
              </div>

              {/* Event Information */}
              {successResult.events.PersonVersionEndorsed && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {t('endorse.eventDetails', 'Event Details')}:
                  </h4>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-xs font-medium text-green-900 dark:text-green-100">
                        {t('endorse.versionEndorsedEvent', 'PersonVersionEndorsed Event')}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                      {t('endorse.versionEndorsedEventDesc', 'Endorsement was successfully recorded on-chain')}
                    </p>
                    
                    {/* Complete Event Details */}
                    <div className="space-y-2 text-xs">
                      {/* Endorser */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('endorse.endorser', 'Endorser')}:
                        </span>
                        <code className="col-span-2 bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.PersonVersionEndorsed.endorser}
                        </code>
                      </div>
                      
                      {/* Fee Amount */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('endorse.feeAmount', 'Fee Amount')}:
                        </span>
                        <span className="col-span-2 text-green-700 dark:text-green-300 font-mono">
                          {(Number(successResult.events.PersonVersionEndorsed.endorsementFee) / Math.pow(10, deepTokenDecimals)).toLocaleString()} {deepTokenSymbol}
                        </span>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('endorse.timestamp', 'Timestamp')}:
                        </span>
                        <span className="col-span-2 text-green-700 dark:text-green-300">
                          {new Date(Number(successResult.events.PersonVersionEndorsed.timestamp) * 1000).toLocaleString()}
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
                    {t('endorse.endorseFailed', 'Endorsement Failed')}
                  </p>
                  <div className="space-y-2 text-xs text-red-700 dark:text-red-300">
                    <div>
                      <span className="font-medium">{t('endorse.errorType', 'Error Type')}:</span>
                      <code className="ml-2 bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded">
                        {errorResult.type}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">{t('endorse.errorMessage', 'Message')}:</span>
                      <p className="mt-1 bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                        {errorResult.message}
                      </p>
                    </div>
                    {errorResult.details !== errorResult.message && (
                      <div>
                        <span className="font-medium">{t('endorse.errorDetails', 'Details')}:</span>
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

          {/* Legacy Success Message (for backwards compatibility) */}
          {hasEndorsed && !successResult && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  {t('endorse.successMessage', 'You have successfully endorsed this version!')}
                </span>
              </div>
            </div>
          )}

          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 p-4 sm:p-6 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700" style={{ paddingBottom: 'calc(4rem + env(safe-area-inset-bottom))' }}>
            {successResult ? (
              // Success state: Show Continue Endorsing and Close buttons
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
                  onClick={handleContinueEndorsing}
                  className="flex-1 px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium flex items-center justify-center gap-2"
                >
                  <Star className="w-4 h-4" />
                  {t('endorse.continueEndorsing', 'Continue Endorsing')}
                </button>
              </>
            ) : (
              // Normal state: Show Cancel and Endorse buttons
              <>
                <button
                  type="button"
                  onClick={handleClose}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  {t('common.cancel', 'Cancel')}
                </button>
                <button
                  onClick={handleEndorse}
                  disabled={isSubmitting || isApproving || !canAffordEndorsement || hasEndorsed || !hasValidTarget || !isTargetValidOnChain || !isPersonHashFormatValid}
                  className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                >
                  {isApproving ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('endorse.approving', 'Approving...')}
                    </div>
                  ) : isSubmitting ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      {t('endorse.endorsing', 'Endorsing...')}
                    </div>
                  ) : hasEndorsed ? (
                    t('endorse.endorsed', 'Endorsed!')
                  ) : (
                    <div className="flex items-center justify-center gap-2">
                      <Star className="w-4 h-4" />
                      {t('endorse.endorse', 'Endorse')}
                    </div>
                  )}
                </button>
              </>
            )}
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
