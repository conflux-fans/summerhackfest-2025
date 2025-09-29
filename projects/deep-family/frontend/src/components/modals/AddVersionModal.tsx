import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { X, Users, ChevronDown, ChevronRight, UserPlus, Check, AlertTriangle } from 'lucide-react'
import { useWallet } from '../../context/WalletContext'
import { submitAddPersonZK, generatePersonProof, verifyProof } from '../../lib/zk'
import { useConfig } from '../../context/ConfigContext'
import PersonHashCalculator from '../PersonHashCalculator'

const addVersionSchema = z.object({
  // Parent version indexes: allow empty string input, transform to 0 for processing
  fatherVersionIndex: z.union([z.number().int().min(0), z.literal('')]).transform(val => val === '' ? 0 : val),
  motherVersionIndex: z.union([z.number().int().min(0), z.literal('')]).transform(val => val === '' ? 0 : val),
  tag: z.string().max(50, 'Tag too long'),
  metadataCID: z.string().optional()
})

// Input type (before transformation)
type AddVersionFormInput = {
  fatherVersionIndex: number | ''
  motherVersionIndex: number | ''
  tag: string
  metadataCID?: string
}

interface AddVersionModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: (result: any) => void
  personHash?: string
  existingPersonData?: {
    fullName?: string
    gender?: number
    birthYear?: number
    birthMonth?: number
    birthDay?: number
    isBirthBC?: boolean
    passphrase?: string
  }
}

export default function AddVersionModal({
  isOpen,
  onClose,
  onSuccess,
  personHash,
  existingPersonData
}: AddVersionModalProps) {
  const { t } = useTranslation()
  const { signer } = useWallet()
  const { contractAddress } = useConfig()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [proofGenerationStep, setProofGenerationStep] = useState<string>('')
  const [successResult, setSuccessResult] = useState<{
    hash: string
    index: number
    rewardAmount: number
    transactionHash: string
    blockNumber: number
    events: {
      PersonHashZKVerified: any
      PersonVersionAdded: any
      TokenRewardDistributed: any
    }
  } | null>(null)
  const [errorResult, setErrorResult] = useState<{
    type: string
    message: string
    details: string
  } | null>(null)
  
  // Person hash and info from PersonHashCalculator
  const [personInfo, setPersonInfo] = useState<{
    fullName: string
    gender: number
    birthYear: number
    birthMonth: number
    birthDay: number
    isBirthBC: boolean
    passphrase: string
  } | null>(null)

  // Father and mother info from PersonHashCalculator components
  const [fatherInfo, setFatherInfo] = useState<{
    fullName: string
    gender: number
    birthYear: number
    birthMonth: number
    birthDay: number
    isBirthBC: boolean
    passphrase: string
  } | null>(null)

  const [motherInfo, setMotherInfo] = useState<{
    fullName: string
    gender: number
    birthYear: number
    birthMonth: number
    birthDay: number
    isBirthBC: boolean
    passphrase: string
  } | null>(null)
  
  const [entered, setEntered] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startYRef = useRef<number | null>(null)
  
  // Parent info collapse states
  const [fatherExpanded, setFatherExpanded] = useState(false)
  const [motherExpanded, setMotherExpanded] = useState(false)
  // Track history push/pop to close on mobile back like NodeDetailModal
  const pushedRef = useRef(false)
  const closedBySelfRef = useRef(false)
  const closedByPopRef = useRef(false)
  const historyMarkerRef = useRef<{ __dfModal: string; id: string } | null>(null)

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
    watch,
    reset
  } = useForm<AddVersionFormInput>({
    resolver: zodResolver(addVersionSchema),
    defaultValues: {
      // Parent version indexes (empty string to show placeholder, will be converted to 0 if empty)
      fatherVersionIndex: '',
      motherVersionIndex: '',
      
      tag: '',
      metadataCID: ''
    }
  })

  // Watch form values for version indexes
  const watchedValues = watch()
  
  // Helper function to check if parent info has content
  const getParentInfoStatus = (parentType: 'father' | 'mother') => {
    const info = parentType === 'father' ? fatherInfo : motherInfo
    const versionIndex = parentType === 'father' ? watchedValues.fatherVersionIndex : watchedValues.motherVersionIndex
    
    if (!info || !info.fullName.trim()) return 'empty'
    if (info.fullName.trim() && typeof versionIndex === 'number' && versionIndex > 0) return 'complete'
    return 'partial'
  }
  
  const fatherStatus = getParentInfoStatus('father')
  const motherStatus = getParentInfoStatus('mother')

  // Initialize states if existing data is provided
  useEffect(() => {
    if (personHash && existingPersonData) {
      setPersonInfo({
        fullName: existingPersonData.fullName || '',
        gender: existingPersonData.gender || 0,
        birthYear: existingPersonData.birthYear || 0,
        birthMonth: existingPersonData.birthMonth || 0,
        birthDay: existingPersonData.birthDay || 0,
        isBirthBC: existingPersonData.isBirthBC || false,
        passphrase: existingPersonData.passphrase || ''
      })
    }
  }, [personHash, existingPersonData])

  const handleClose = () => {
    closedBySelfRef.current = true
    reset()
    setPersonInfo(null)
    setFatherInfo(null)
    setMotherInfo(null)
    setIsSubmitting(false)
    setProofGenerationStep('')
    setSuccessResult(null)
    setErrorResult(null)
    setFatherExpanded(false)
    setMotherExpanded(false)
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
    const marker = { __dfModal: 'AddVersionModal', id: Math.random().toString(36).slice(2) }
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

  const handleContinueAdding = () => {
    // Reset form and states for new addition
    reset()
    setPersonInfo(null)
    setFatherInfo(null)
    setMotherInfo(null)
    setIsSubmitting(false)
    setProofGenerationStep('')
    setSuccessResult(null)
    setErrorResult(null)
    setFatherExpanded(false)
    setMotherExpanded(false)
    // Keep modal open for continued use
  }


  const onSubmit = async (data: AddVersionFormInput) => {
    if (!signer) {
      alert(t('wallet.notConnected', 'Please connect your wallet'))
      return
    }

    if (!contractAddress) {
      alert(t('addVersion.contractNotConfigured', 'Contract not configured'))
      return
    }

    // Transform the input data to the final form
    const processedData = addVersionSchema.parse(data)

    if (!personInfo || !personInfo.fullName.trim()) {
      alert(t('addVersion.personInfoRequired', 'Please fill in person information'))
      return
    }
    // Clear old prompt information
    setSuccessResult(null)
    setErrorResult(null)
    
    setIsSubmitting(true)
    setProofGenerationStep(t('addVersion.preparingData', 'Preparing data...'))

    try {
      console.log('🔄 Starting ZK proof generation for person:', personInfo.fullName)
      
      // Get submitter address
      const submitterAddress = await signer.getAddress()
      console.log('📝 Submitter address:', submitterAddress)
      
      setProofGenerationStep(t('addVersion.generatingProof', 'Generating zero-knowledge proof... (this may take 30-60 seconds)'))
      
      // Generate ZK proof automatically
      console.log('🔍 Person info:', personInfo)
      console.log('🔍 Father info:', fatherInfo)
      console.log('🔍 Mother info:', motherInfo)
      console.log('🔍 Submitter address:', submitterAddress)
      
      const { proof, publicSignals } = await generatePersonProof(
        personInfo,
        fatherInfo && fatherInfo.fullName.trim() ? fatherInfo : null,
        motherInfo && motherInfo.fullName.trim() ? motherInfo : null,
        submitterAddress
      )
      
      console.log('✅ Proof generated successfully')
      console.log('📊 Public signals:', publicSignals)
      
      setProofGenerationStep(t('addVersion.verifyingProof', 'Verifying proof...'))
      
      // Verify the generated proof
      const isValid = await verifyProof(proof, publicSignals)
      if (!isValid) {
        throw new Error(t('addVersion.proofVerificationFailed', 'Generated proof verification failed'))
      }
      
      console.log('🔍 Proof verification: VALID')
      
      setProofGenerationStep(t('addVersion.submittingToBlockchain', 'Submitting to blockchain...'))
      
      const result = await submitAddPersonZK(
        signer,
        contractAddress,
        proof,
        publicSignals,
        processedData.fatherVersionIndex,
        processedData.motherVersionIndex,
        processedData.tag,
        processedData.metadataCID || ''
      )

      if (result) {
        console.log('🎉 Person added successfully:', result)
        setSuccessResult({
          hash: result.hash,
          index: result.index,
          rewardAmount: result.rewardAmount,
          transactionHash: result.transactionHash,
          blockNumber: result.blockNumber,
          events: result.events
        })
        setProofGenerationStep('')
        onSuccess?.(result)
      }
    } catch (error: any) {
      console.error('❌ Add version failed:', error)
      
      // Set error result for display in UI
      setErrorResult({
        type: error.type || 'UNKNOWN_ERROR',
        message: error.message || 'An unexpected error occurred',
        details: error.details || error.message || 'Unknown error'
      })
      setProofGenerationStep('')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Helper component for status indicator
  const StatusIndicator = ({ status }: { status: 'empty' | 'partial' | 'complete' }) => {
    const config = {
      empty: { icon: UserPlus, color: 'text-gray-400', bg: 'bg-gray-100 dark:bg-gray-700' },
      partial: { icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-100 dark:bg-amber-900/30' },
      complete: { icon: Check, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/30' }
    }
    
    const { icon: Icon, color, bg } = config[status]
    
    return (
      <div className={`inline-flex items-center justify-center w-6 h-6 rounded-full ${bg}`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
    )
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
          className="sticky top-0 bg-gradient-to-br from-blue-500/10 via-purple-500/8 to-indigo-500/10 dark:from-blue-600/20 dark:via-purple-600/15 dark:to-indigo-600/20 p-4 pt-7 sm:pt-6 sm:p-6 border-b border-gray-200/50 dark:border-gray-700/50 z-20 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:supports-[backdrop-filter]:bg-gray-900/60 relative touch-none cursor-grab active:cursor-grabbing select-none"
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
                <UserPlus className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100 mb-1">
                  {personHash ? 
                    t('addVersion.addNewVersion', 'Add New Version') : 
                    t('addVersion.addPerson', 'Add Person')
                  }
                </h2>
                <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  <span className="whitespace-nowrap">{t('addVersion.description', 'Add person with zero-knowledge proof')}</span>
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
          <form id="add-version-form" onSubmit={handleSubmit(onSubmit)} className="min-h-full flex flex-col">
            <div className="flex-1 p-4 sm:p-6 space-y-6">
          
          {/* Person Being Added - Using PersonHashCalculator */}
          <PersonHashCalculator
            showTitle={false}
            collapsible={false}
            initialValues={existingPersonData}
            onFormChange={(formData) => {
              setPersonInfo({
                fullName: formData.fullName,
                gender: formData.gender,
                birthYear: formData.birthYear,
                birthMonth: formData.birthMonth,
                birthDay: formData.birthDay,
                isBirthBC: formData.isBirthBC,
                passphrase: formData.passphrase
              })
            }}
          />
          {/* Father Information - Using PersonHashCalculator */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setFatherExpanded(!fatherExpanded)}
              className="w-full flex items-center justify-between py-4 px-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-green-600" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t('addVersion.fatherInfo', 'Father Information')}
                </h3>
                <StatusIndicator status={fatherStatus} />
                {fatherStatus !== 'empty' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                    {fatherStatus === 'partial' ? t('addVersion.partial', 'Partial') : t('addVersion.complete', 'Complete')}
                  </span>
                )}
              </div>
              {fatherExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {fatherExpanded && (
              <div className="py-4 px-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 space-y-3">
                <PersonHashCalculator
                  showTitle={false}
                  collapsible={false}
                  className="border-0 shadow-none"
                  initialValues={{
                    fullName: '',
                    gender: 1, // Default to male
                    birthYear: 0,
                    birthMonth: 0,
                    birthDay: 0,
                    isBirthBC: false,
                    passphrase: ''
                  }}
                  onFormChange={(formData) => {
                    setFatherInfo({
                      fullName: formData.fullName,
                      gender: formData.gender,
                      birthYear: formData.birthYear,
                      birthMonth: formData.birthMonth,
                      birthDay: formData.birthDay,
                      isBirthBC: formData.isBirthBC,
                      passphrase: formData.passphrase
                    })
                  }}
                />
                
                <div className="w-40">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">
                    {t('addVersion.versionIndex', 'Version Index')} ({t('addVersion.versionIndexHint')})
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('fatherVersionIndex', {
                      setValueAs: (v) => v === '' ? '' : parseInt(v, 10)
                    })}
                    className="w-20 h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                    placeholder='0'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Mother Information - Using PersonHashCalculator */}
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => setMotherExpanded(!motherExpanded)}
              className="w-full flex items-center justify-between py-4 px-3 bg-gray-50 dark:bg-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
            >
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-pink-600" />
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  {t('addVersion.motherInfo', 'Mother Information')}
                </h3>
                <StatusIndicator status={motherStatus} />
                {motherStatus !== 'empty' && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-600 px-1.5 py-0.5 rounded">
                    {motherStatus === 'partial' ? t('addVersion.partial', 'Partial') : t('addVersion.complete', 'Complete')}
                  </span>
                )}
              </div>
              {motherExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-400" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-400" />
              )}
            </button>

            {motherExpanded && (
              <div className="py-4 px-3 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-600 space-y-3">
                <PersonHashCalculator
                  showTitle={false}
                  collapsible={false}
                  className="border-0 shadow-none"
                  initialValues={{
                    fullName: '',
                    gender: 2, // Default to female
                    birthYear: 0,
                    birthMonth: 0,
                    birthDay: 0,
                    isBirthBC: false,
                    passphrase: ''
                  }}
                  onFormChange={(formData) => {
                    setMotherInfo({
                      fullName: formData.fullName,
                      gender: formData.gender,
                      birthYear: formData.birthYear,
                      birthMonth: formData.birthMonth,
                      birthDay: formData.birthDay,
                      isBirthBC: formData.isBirthBC,
                      passphrase: formData.passphrase
                    })
                  }}
                />
                
                <div className="w-40">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1 whitespace-nowrap">
                    {t('addVersion.versionIndex', 'Version Index')} ({t('addVersion.versionIndexHint')})
                  </label>
                  <input
                    type="number"
                    min="0"
                    {...register('motherVersionIndex', {
                      setValueAs: (v) => v === '' ? '' : parseInt(v, 10)
                    })}
                    className="w-20 h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                    placeholder='0'
                  />
                </div>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="space-y-3">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
              {t('addVersion.metadata', 'Metadata')}
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('addVersion.tag', 'Tag')}
                </label>
                <input
                  {...register('tag')}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                  placeholder={t('addVersion.tagPlaceholder', 'Optional tag')}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {t('addVersion.metadataCID', 'Metadata CID')}
                </label>
                <input
                  {...register('metadataCID')}
                  className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                  placeholder="QmXXX..."
                />
              </div>
            </div>
          </div>
          
          {/* Progress Indicator */}
          {isSubmitting && proofGenerationStep && !successResult && !errorResult && (
            <div className="mx-4 sm:mx-6 mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0"></div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-1">
                    {t('addVersion.processing', 'Processing...')}
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {proofGenerationStep}
                  </p>
                </div>
              </div>
              {proofGenerationStep.includes('30-60 seconds') && (
                <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
                  {t('addVersion.proofGenerationNote', 'ZK proof generation requires complex cryptographic calculations. Please wait...')}
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
                    {t('addVersion.addedSuccessfully', 'Person added successfully!')}
                  </p>
                </div>
                
                <div className="space-y-2 text-xs text-green-700 dark:text-green-300">
                  {/* Person Hash */}
                  <div>
                    <span className="font-medium">{t('addVersion.personHash', 'Person Hash')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.hash}
                    </code>
                  </div>
                  
                  {/* Version Index */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('addVersion.versionIndex', 'Version Index')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.index}
                    </code>
                  </div>
                  
                  {/* Transaction Hash */}
                  <div>
                    <span className="font-medium">{t('addVersion.transactionHash', 'Transaction Hash')}:</span>
                    <code className="block bg-green-100 dark:bg-green-800 px-2 py-1 rounded mt-1 text-xs font-mono break-all">
                      {successResult.transactionHash}
                    </code>
                  </div>
                  
                  {/* Block Number */}
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{t('addVersion.blockNumber', 'Block Number')}:</span>
                    <code className="bg-green-100 dark:bg-green-800 px-2 py-1 rounded text-xs font-mono">
                      {successResult.blockNumber}
                    </code>
                  </div>
                </div>
              </div>

              {/* Events Information */}
              <div className="space-y-2">
                <h4 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {t('addVersion.eventsTriggered', 'Events Triggered')}:
                </h4>
                
                {/* ZK Proof Verified */}
                {successResult.events.PersonHashZKVerified && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      <span className="text-xs font-medium text-blue-900 dark:text-blue-100">
                        {t('addVersion.zkProofVerified', 'ZK Proof Verified')}
                      </span>
                    </div>
                    <p className="text-xs text-blue-700 dark:text-blue-300 mb-3">
                      {t('addVersion.zkProofVerifiedDesc', 'Zero-knowledge proof was successfully verified on-chain')}
                    </p>
                    
                    {/* Complete Event Details */}
                    <div className="space-y-2 text-xs">
                      {/* Person Hash */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          {t('addVersion.hashPrefix', 'Hash')}:
                        </span>
                        <code className="col-span-2 bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.PersonHashZKVerified.personHash}
                        </code>
                      </div>
                      
                      {/* Prover */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-blue-800 dark:text-blue-200">
                          {t('addVersion.prover', 'Prover')}:
                        </span>
                        <code className="col-span-2 bg-blue-100 dark:bg-blue-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.PersonHashZKVerified.prover}
                        </code>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Version Added */}
                {successResult.events.PersonVersionAdded && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded border border-green-200 dark:border-green-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                      <span className="text-xs font-medium text-green-900 dark:text-green-100">
                        {t('addVersion.versionAdded', 'Person Version Added')}
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mb-3">
                      {t('addVersion.versionAddedDesc', 'Person version was successfully added to the family tree')}
                    </p>
                    
                    {/* Complete Event Details */}
                    <div className="space-y-2 text-xs">
                      {/* Person Hash */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('addVersion.hashPrefix', 'Hash')}:
                        </span>
                        <code className="col-span-2 bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.PersonVersionAdded.personHash}
                        </code>
                      </div>
                      
                      {/* Version Index */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('addVersion.versionIndex', 'Version Index')}:
                        </span>
                        <code className="bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs">
                          {successResult.events.PersonVersionAdded.versionIndex}
                        </code>
                      </div>
                      
                      {/* Added By */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('addVersion.addedBy', 'Added By')}:
                        </span>
                        <code className="col-span-2 bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.PersonVersionAdded.addedBy}
                        </code>
                      </div>
                      
                      {/* Timestamp */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-green-800 dark:text-green-200">
                          {t('addVersion.timestamp', 'Timestamp')}:
                        </span>
                        <span className="col-span-2 text-green-700 dark:text-green-300">
                          {new Date(successResult.events.PersonVersionAdded.timestamp * 1000).toLocaleString()}
                        </span>
                      </div>
                      
                      {/* Father Info */}
                      {successResult.events.PersonVersionAdded.fatherHash && successResult.events.PersonVersionAdded.fatherHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {t('addVersion.fatherHash', 'Father Hash')}:
                            </span>
                            <code className="col-span-2 bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                              {successResult.events.PersonVersionAdded.fatherHash}
                            </code>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {t('addVersion.fatherVersionIndex', 'Father Version')}:
                            </span>
                            <code className="bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs">
                              {successResult.events.PersonVersionAdded.fatherVersionIndex}
                            </code>
                          </div>
                        </>
                      )}
                      
                      {/* Mother Info */}
                      {successResult.events.PersonVersionAdded.motherHash && successResult.events.PersonVersionAdded.motherHash !== '0x0000000000000000000000000000000000000000000000000000000000000000' && (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {t('addVersion.motherHash', 'Mother Hash')}:
                            </span>
                            <code className="col-span-2 bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                              {successResult.events.PersonVersionAdded.motherHash}
                            </code>
                          </div>
                          <div className="grid grid-cols-3 gap-2">
                            <span className="font-medium text-green-800 dark:text-green-200">
                              {t('addVersion.motherVersionIndex', 'Mother Version')}:
                            </span>
                            <code className="bg-green-100 dark:bg-green-800 px-1.5 py-0.5 rounded font-mono text-xs">
                              {successResult.events.PersonVersionAdded.motherVersionIndex}
                            </code>
                          </div>
                        </>
                      )}
                      
                      {/* Tag */}
                      {successResult.events.PersonVersionAdded.tag && (
                        <div className="grid grid-cols-3 gap-2">
                          <span className="font-medium text-green-800 dark:text-green-200">
                            {t('addVersion.tag', 'Tag')}:
                          </span>
                          <span className="col-span-2 text-green-700 dark:text-green-300">
                            "{successResult.events.PersonVersionAdded.tag}"
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Token Reward */}
                {successResult.events.TokenRewardDistributed ? (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded border border-yellow-200 dark:border-yellow-700">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-yellow-600 rounded-full"></div>
                      <span className="text-xs font-medium text-yellow-900 dark:text-yellow-100">
                        {t('addVersion.tokenReward', 'Token Reward Distributed')}
                      </span>
                    </div>
                    <p className="text-xs text-yellow-700 dark:text-yellow-300 mb-3">
                      {t('addVersion.familyComplete', 'Complete family data bonus - both parents exist in the system')}
                    </p>
                    
                    {/* Complete Event Details */}
                    <div className="space-y-2 text-xs">
                      {/* Miner (Recipient) */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          {t('addVersion.miner', 'Miner')}:
                        </span>
                        <code className="col-span-2 bg-yellow-100 dark:bg-yellow-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.TokenRewardDistributed.miner}
                        </code>
                      </div>
                      
                      {/* Person Hash */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          {t('addVersion.hashPrefix', 'Hash')}:
                        </span>
                        <code className="col-span-2 bg-yellow-100 dark:bg-yellow-800 px-1.5 py-0.5 rounded font-mono text-xs break-all">
                          {successResult.events.TokenRewardDistributed.personHash}
                        </code>
                      </div>
                      
                      {/* Version Index */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          {t('addVersion.versionIndex', 'Version Index')}:
                        </span>
                        <code className="bg-yellow-100 dark:bg-yellow-800 px-1.5 py-0.5 rounded font-mono text-xs">
                          {successResult.events.TokenRewardDistributed.versionIndex}
                        </code>
                      </div>
                      
                      {/* Reward Amount */}
                      <div className="grid grid-cols-3 gap-2">
                        <span className="font-medium text-yellow-800 dark:text-yellow-200">
                          {t('addVersion.rewardAmount', 'Reward Amount')}:
                        </span>
                        <span className="col-span-2 text-yellow-700 dark:text-yellow-300 font-mono">
                          {(Number(successResult.events.TokenRewardDistributed.reward) / Math.pow(10, 18)).toLocaleString()} DEEP
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  // Show explanation when no token reward was distributed
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                      <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                        {t('addVersion.noTokenReward', 'No Token Reward')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {t('addVersion.tokenRewardCondition', 'Token rewards are only distributed when both parents already exist in the system')}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      {t('addVersion.tokenRewardTip', 'Add the parents first to earn DEEP token rewards for complete family data')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Error Message */}
          {errorResult && (
            <div className="mx-4 sm:mx-6 mb-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-red-900 dark:text-red-100 mb-2">
                    {t('addVersion.failed', 'Transaction Failed')}
                  </p>
                  <div className="space-y-2 text-xs text-red-700 dark:text-red-300">
                    <div>
                      <span className="font-medium">{t('addVersion.errorType', 'Error Type')}:</span>
                      <code className="ml-2 bg-red-100 dark:bg-red-800 px-1.5 py-0.5 rounded">
                        {errorResult.type}
                      </code>
                    </div>
                    <div>
                      <span className="font-medium">{t('addVersion.errorMessage', 'Message')}:</span>
                      <p className="mt-1 bg-red-100 dark:bg-red-800 px-2 py-1 rounded">
                        {errorResult.message}
                      </p>
                    </div>
                    {errorResult.details !== errorResult.message && (
                      <div>
                        <span className="font-medium">{t('addVersion.errorDetails', 'Details')}:</span>
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
                // Success state: Show Continue Adding and Close buttons
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
                    onClick={handleContinueAdding}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                  >
                    {t('addVersion.continueAdding', 'Continue Adding')}
                  </button>
                </>
              ) : (
                // Normal state: Show Cancel and Submit buttons
                <>
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm font-medium"
                  >
                    {t('common.cancel', 'Cancel')}
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !personInfo?.fullName.trim()}
                    className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
                  >
                    {isSubmitting ? 
                      t('addVersion.processing', 'Processing...') :
                      t('addVersion.submit', 'Add Version')
                    }
                  </button>
                </>
              )}
            </div>
          </form>
        </div>
        </div>
      </div>
    </div>
  )
}
