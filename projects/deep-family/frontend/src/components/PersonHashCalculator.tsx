import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { ChevronDown, Clipboard, Eye, EyeOff, Info } from 'lucide-react'
import { useToast } from './ToastProvider'
import { formatHashMiddle } from '../types/graph'
import { poseidon3, poseidon5 } from 'poseidon-lite'

// Align with contract convention: blank passphrase -> zero salt limbs
const ZERO_BYTES32 = '0x' + '00'.repeat(32)

const MAX_FULL_NAME_BYTES = 256

const getByteLength = (str: string): number => {
  return new TextEncoder().encode(str).length
}

// Field error component
const FieldError: React.FC<{ message?: string }> = ({ message }) => (
  <div className={`text-xs h-4 leading-4 ${message ? 'text-red-600' : 'text-transparent'}`}>
    {message || 'placeholder'}
  </div>
)

// Simple themed select component
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

  const current = options.find(o => o.value === value)?.label ?? ''

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-xs text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition flex items-center justify-between"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{current}</span>
        <ChevronDown size={16} className="text-gray-500 dark:text-gray-400" />
      </button>
      {open && (
        <div className="absolute z-20 mt-1 w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg overflow-hidden">
          <ul role="listbox" className="max-h-60 overflow-auto">
            {options.map((o) => (
              <li
                key={o.value}
                role="option"
                aria-selected={o.value === value}
                onClick={() => { onChange(o.value); setOpen(false) }}
                className={`px-3 py-2 text-xs cursor-pointer select-none transition-colors ${
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

// Hash form schema and types
const optionalPassphrase = z.union([z.string(), z.undefined(), z.null()]).transform((val) => (typeof val === 'string' ? val : ''))

const hashFormSchema = z.object({
  fullName: z.string().min(1).refine((val) => getByteLength(val) <= MAX_FULL_NAME_BYTES, 'Name exceeds max bytes'),
  isBirthBC: z.boolean(),
  birthYear: z.union([z.number().int().min(0).max(10000), z.literal('')]).transform(val => val === '' ? 0 : val),
  birthMonth: z.union([z.number().int().min(0).max(12), z.literal('')]).transform(val => val === '' ? 0 : val),
  birthDay: z.union([z.number().int().min(0).max(31), z.literal('')]).transform(val => val === '' ? 0 : val),
  gender: z.number().int().min(0).max(3),
  passphrase: optionalPassphrase,
})

export type HashForm = z.infer<typeof hashFormSchema>

// Password strength calculation
const calculatePasswordStrength = (password: string): { level: 'weak' | 'medium' | 'strong'; score: number } => {
  if (!password) return { level: 'weak', score: 0 }

  let score = 0

  // Length scoring
  if (password.length >= 8) score += 2
  else if (password.length >= 6) score += 1

  // Character variety scoring
  if (/[a-z]/.test(password)) score += 1 // lowercase
  if (/[A-Z]/.test(password)) score += 1 // uppercase
  if (/[0-9]/.test(password)) score += 1 // numbers
  if (/[^a-zA-Z0-9]/.test(password)) score += 1 // special characters

  // Additional length bonus
  if (password.length >= 12) score += 1

  if (score <= 2) return { level: 'weak', score }
  if (score <= 4) return { level: 'medium', score }
  return { level: 'strong', score }
}

// Hash calculation function using Poseidon (matches circuit and contract)
export function computePersonHash(input: HashForm): string {
  const { fullName, passphrase, isBirthBC, birthYear, birthMonth, birthDay, gender } = input

  const normalizedFullName = fullName.trim()
  const normalizedPassphrase = typeof passphrase === 'string' ? passphrase : ''

  // Pack small fields into a single field element to match circuit's packedData
  // Format: birthYear * 2^24 + birthMonth * 2^16 + birthDay * 2^8 + gender * 2^1 + isBirthBC
  const packedData = (BigInt(birthYear) << 24n) |
    (BigInt(birthMonth) << 16n) |
    (BigInt(birthDay) << 8n) |
    (BigInt(gender) << 1n) |
    (isBirthBC ? 1n : 0n)

  // Compute fullNameHash exactly like the circuit pre-image
  const fullNameHash = ethers.keccak256(ethers.toUtf8Bytes(normalizedFullName))
  const saltHash = normalizedPassphrase.length > 0
    ? ethers.keccak256(ethers.toUtf8Bytes(normalizedPassphrase))
    : ZERO_BYTES32

  // Convert fullNameHash to two 128-bit limbs (matching circuit's HashToLimbs)
  const fullNameHashBN = BigInt(fullNameHash)
  const limb0 = fullNameHashBN >> 128n // High 128 bits
  const limb1 = fullNameHashBN & ((1n << 128n) - 1n) // Low 128 bits

  const saltHashBN = BigInt(saltHash)
  const saltLimb0 = saltHashBN >> 128n
  const saltLimb1 = saltHashBN & ((1n << 128n) - 1n)

  const saltedNamePoseidon = poseidon5([limb0, limb1, saltLimb0, saltLimb1, 0n])
  const saltedNameBN = BigInt(saltedNamePoseidon)
  const saltedLimb0 = saltedNameBN >> 128n
  const saltedLimb1 = saltedNameBN & ((1n << 128n) - 1n)

  // Poseidon(3) commitment over SNARK-friendly field elements
  const poseidonResult = poseidon3([saltedLimb0, saltedLimb1, packedData])

  // Domain-separate with keccak256 to mirror contract wrapping
  const poseidonHex = '0x' + poseidonResult.toString(16).padStart(64, '0')
  return ethers.keccak256(poseidonHex)
}

// Component props interface
interface PersonHashCalculatorProps {
  className?: string
  onFormChange?: (formData: HashForm) => void
  showTitle?: boolean
  collapsible?: boolean
  isOpen?: boolean
  onToggle?: () => void
  initialValues?: {
    fullName?: string
    gender?: number
    birthYear?: number
    birthMonth?: number
    birthDay?: number
    isBirthBC?: boolean
    passphrase?: string
  }
}

export const PersonHashCalculator: React.FC<PersonHashCalculatorProps> = ({
  className = '',
  onFormChange,
  showTitle = true,
  collapsible = false,
  isOpen = true,
  onToggle,
  initialValues
}) => {
  const { t } = useTranslation()
  const [internalOpen, setInternalOpen] = useState(true)
  const [showPassphrase, setShowPassphrase] = useState(false)
  const [showPassphraseHelp, setShowPassphraseHelp] = useState(false)
  const toast = useToast()


  // Use external state if provided, otherwise use internal state
  const currentOpen = collapsible ? (onToggle ? isOpen : internalOpen) : true
  const handleToggle = () => {
    if (onToggle) {
      onToggle()
    } else {
      setInternalOpen(!internalOpen)
    }
  }

  // Create schema with translations
  const hashFormSchema = useMemo(() => z.object({
    fullName: z.string()
      .min(1, t('search.validation.required'))
      .refine((val) => getByteLength(val) <= MAX_FULL_NAME_BYTES, { message: t('search.validation.nameTooLong') }),
    isBirthBC: z.boolean(),
    birthYear: z.union([z.number().int().min(0, t('search.validation.yearRange')).max(9999, t('search.validation.yearRange')), z.literal('')]).optional().transform(val => val === '' || val === undefined ? 0 : val),
    birthMonth: z.union([z.number().int().min(0, t('search.validation.monthRange')).max(12, t('search.validation.monthRange')), z.literal('')]).optional().transform(val => val === '' || val === undefined ? 0 : val),
    birthDay: z.union([z.number().int().min(0, t('search.validation.dayRange')).max(31, t('search.validation.dayRange')), z.literal('')]).optional().transform(val => val === '' || val === undefined ? 0 : val),
    gender: z.number().int().min(0).max(3),
    passphrase: optionalPassphrase,
  }).refine((data) => {
    // If AD (Anno Domini), the year must not exceed the current year
    if (!data.isBirthBC && data.birthYear > new Date().getFullYear()) {
      return false;
    }
    return true;
  }, {
    message: t('search.validation.yearExceedsCurrent'),
    path: ["birthYear"]
  }), [t])

  const { register, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(hashFormSchema),
    defaultValues: { 
      fullName: initialValues?.fullName || '', 
      isBirthBC: initialValues?.isBirthBC || false, 
      birthYear: initialValues?.birthYear || '', 
      birthMonth: initialValues?.birthMonth || '', 
      birthDay: initialValues?.birthDay || '', 
      gender: initialValues?.gender || 0,
      passphrase: initialValues?.passphrase || '' 
    },
  })

  // Watch for form changes and notify parent
  const fullName = watch('fullName')
  const isBirthBC = watch('isBirthBC')
  const birthYear = watch('birthYear')
  const birthMonth = watch('birthMonth')
  const birthDay = watch('birthDay')
  const gender = watch('gender')
  const passphrase = watch('passphrase')

  // Calculate password strength
  const passwordStrength = useMemo(() => {
    return calculatePasswordStrength(passphrase || '')
  }, [passphrase])

  const computedHash = useMemo(() => {
    const transformedData: HashForm = {
      fullName: fullName || '',
      isBirthBC: isBirthBC || false,
      birthYear: birthYear === '' || birthYear === undefined ? 0 : Number(birthYear),
      birthMonth: birthMonth === '' || birthMonth === undefined ? 0 : Number(birthMonth),
      birthDay: birthDay === '' || birthDay === undefined ? 0 : Number(birthDay),
      gender: Number(gender || 0),
      passphrase: passphrase || '',
    }
    if (!transformedData.fullName.trim()) return ''
    return computePersonHash(transformedData)
  }, [fullName, isBirthBC, birthYear, birthMonth, birthDay, gender, passphrase])

  
  const onFormChangeRef = useRef(onFormChange)
  
  // Update the ref when onFormChange changes
  useEffect(() => {
    onFormChangeRef.current = onFormChange
  }, [onFormChange])
  
  useEffect(() => {
    if (!onFormChangeRef.current) return

    const transformedData: HashForm = {
      fullName: fullName || '',
      isBirthBC: isBirthBC || false,
      birthYear: birthYear === '' || birthYear === undefined ? 0 : Number(birthYear),
      birthMonth: birthMonth === '' || birthMonth === undefined ? 0 : Number(birthMonth),
      birthDay: birthDay === '' || birthDay === undefined ? 0 : Number(birthDay),
      gender: Number(gender || 0),
      passphrase: passphrase || '',
    }
    onFormChangeRef.current(transformedData)
  }, [fullName, isBirthBC, birthYear, birthMonth, birthDay, gender, passphrase])


  const content = (
    <div className="space-y-2">
      <div className="w-full space-y-1">
        <div className="flex items-center gap-2">
          <div className="flex-1 min-w-0">
            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
              {t('search.hashCalculator.name')} <span className="text-red-500">*</span>
            </label>
            <input 
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
              placeholder={t('search.hashCalculator.nameInputPlaceholder')}
              {...register('fullName')} 
            />
            <FieldError message={errors.fullName?.message} />
          </div>
          
          <div className="w-28 sm:w-28 flex-shrink-0">
            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
              {t('search.hashCalculator.gender')}
            </label>
            <ThemedSelect
              value={Number(gender ?? 0)}
              onChange={(v) => setValue('gender', v, { shouldValidate: true, shouldDirty: true })}
              options={[
                { value: 0, label: t('search.hashCalculator.genderOptions.unknown') },
                { value: 1, label: t('search.hashCalculator.genderOptions.male') },
                { value: 2, label: t('search.hashCalculator.genderOptions.female') },
                { value: 3, label: t('search.hashCalculator.genderOptions.other') },
              ]}
            />
            <FieldError message={errors.gender?.message} />
          </div>
        </div>
        
        <div className="flex flex-nowrap items-start gap-1">
          <div className="flex items-start gap-1">
            <div className="w-20">
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                {t('search.hashCalculator.isBirthBC')}
              </label>
              <ThemedSelect
                value={isBirthBC ? 1 : 0}
                onChange={(v) => setValue('isBirthBC', v === 1, { shouldValidate: true, shouldDirty: true })}
                options={[
                  { value: 0, label: t('search.hashCalculator.bcOptions.ad') },
                  { value: 1, label: t('search.hashCalculator.bcOptions.bc') },
                ]}
              />
              <FieldError />
            </div>
            
            <div className="w-20 sm:w-[120px]">
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                {t('search.hashCalculator.birthYearLabel')}
              </label>
              <input
                type="number"
                min="0"
                max={isBirthBC ? 9999 : new Date().getFullYear()}
                placeholder={isBirthBC ? '<10000' : '<=' + new Date().getFullYear()}
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
                {...register('birthYear', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })}
              />
              <FieldError message={errors.birthYear?.message} />
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
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
              {...register('birthMonth', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })} 
            />
            <FieldError message={errors.birthMonth?.message} />
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
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
              {...register('birthDay', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })} 
            />
            <FieldError message={errors.birthDay?.message} />
          </div>
        </div>
        <div className="w-full mt-2">
          <div className="flex items-center gap-2 mb-1">
            <label className="flex flex-wrap items-center gap-1 text-[11px] font-semibold uppercase tracking-normal sm:tracking-wide text-gray-600 dark:text-gray-400 whitespace-normal sm:whitespace-nowrap leading-tight">
              {t('search.hashCalculator.passphrase', 'Passphrase')}
            </label>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowPassphraseHelp(!showPassphraseHelp)}
                className="text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors"
                aria-label="Passphrase help"
              >
                <Info size={14} />
              </button>
              {showPassphraseHelp && (
                <>
                  {/* Backdrop */}
                  <div
                    className="fixed inset-0 z-40 bg-black/20 dark:bg-black/40"
                    onClick={() => setShowPassphraseHelp(false)}
                  />
                  {/* Modal */}
                  <div className="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 max-w-[90vw] p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="font-semibold text-gray-800 dark:text-gray-100">
                          {t('search.hashCalculator.passphraseHelp.title', '口令作用说明')}
                        </div>
                        <button
                          onClick={() => setShowPassphraseHelp(false)}
                          className="w-6 h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-3 text-sm">
                        <div className="text-gray-600 dark:text-gray-300">
                          <div className="mb-1 font-medium text-blue-600 dark:text-blue-400">
                            {t('search.hashCalculator.passphraseHelp.privacy', '🔒 隐私保护')}
                          </div>
                          <div className="text-xs leading-relaxed">
                            {t('search.hashCalculator.passphraseHelp.privacyDesc', '为您的身份哈希添加额外保护层，防止他人通过姓名和生日推测您的身份。')}
                          </div>
                        </div>

                        <div className="text-gray-600 dark:text-gray-300">
                          <div className="mb-1 font-medium text-green-600 dark:text-green-400">
                            {t('search.hashCalculator.passphraseHelp.optional', '✅ 完全可选')}
                          </div>
                          <div className="text-xs leading-relaxed">
                            {t('search.hashCalculator.passphraseHelp.optionalDesc', '可以留空，但建议使用强口令提升安全性。')}
                          </div>
                        </div>

                        <div className="text-gray-600 dark:text-gray-300">
                          <div className="mb-1 font-medium text-orange-600 dark:text-orange-400">
                            {t('search.hashCalculator.passphraseHelp.remember', '⚠️ 请牢记')}
                          </div>
                          <div className="text-xs leading-relaxed">
                            {t('search.hashCalculator.passphraseHelp.rememberDesc', '口令无法找回，忘记后将生成不同的身份哈希。')}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="relative">
            <input
              type={showPassphrase ? "text" : "password"}
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 pr-10 text-xs text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition"
              placeholder={t('search.hashCalculator.passphrasePlaceholder', '可选：输入口令以增强隐私保护')}
              {...register('passphrase')}
            />
            <button
              type="button"
              onClick={() => setShowPassphrase(!showPassphrase)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors focus:outline-none"
              aria-label={showPassphrase ? "Hide passphrase" : "Show passphrase"}
            >
              {showPassphrase ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          {/* Password strength indicator and tips */}
          {passphrase && passphrase.length > 0 && (
            <div className="mt-1 space-y-1">
              <div className="flex items-center gap-2">
                <div className="flex gap-1 flex-1">
                  <div className={`h-1 flex-1 rounded ${
                    passwordStrength.level === 'weak' ? 'bg-red-400' :
                    passwordStrength.level === 'medium' ? 'bg-red-400' : 'bg-green-400'
                  }`} />
                  <div className={`h-1 flex-1 rounded ${
                    passwordStrength.level === 'medium' ? 'bg-yellow-400' :
                    passwordStrength.level === 'strong' ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                  <div className={`h-1 flex-1 rounded ${
                    passwordStrength.level === 'strong' ? 'bg-green-400' : 'bg-gray-200 dark:bg-gray-600'
                  }`} />
                </div>
                <span className={`text-xs font-medium ${
                  passwordStrength.level === 'weak' ? 'text-red-600 dark:text-red-400' :
                  passwordStrength.level === 'medium' ? 'text-yellow-600 dark:text-yellow-400' :
                  'text-green-600 dark:text-green-400'
                }`}>
                  {passwordStrength.level === 'weak' ? t('search.hashCalculator.passwordStrength.weak', '弱') :
                   passwordStrength.level === 'medium' ? t('search.hashCalculator.passwordStrength.medium', '中') :
                   t('search.hashCalculator.passwordStrength.strong', '强')}
                </span>
              </div>
              {passwordStrength.level === 'weak' && (
                <div className="text-xs text-amber-600 dark:text-amber-400">
                  {t('search.hashCalculator.passwordTips.weak', '💡 建议：使用8位以上密码，包含大小写字母、数字或特殊字符')}
                </div>
              )}
            </div>
          )}

          <FieldError message={errors.passphrase?.message} />
        </div>
      </div>
      {computedHash && (
        <div className="space-y-2">
          {/* Local calculation result */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:overflow-hidden">
            <span className="shrink-0 text-xs text-gray-600 dark:text-gray-400">
              {t('search.hashCalculator.calculatedHash')}:
            </span>
            <HashInline
              value={computedHash}
              className="font-mono text-sm leading-none text-gray-700 dark:text-gray-300 tracking-tight"
              wrapOnMobile
            />
            <button
              type="button"
              onClick={async () => {
                try {
                  if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
                    await navigator.clipboard.writeText(computedHash)
                    toast.show(t('search.copied'))
                    return
                  }
                } catch {}
                try {
                  const ta = document.createElement('textarea')
                  ta.value = computedHash
                  ta.style.position = 'fixed'
                  ta.style.left = '-9999px'
                  document.body.appendChild(ta)
                  ta.focus(); ta.select()
                  const ok = document.execCommand('copy')
                  document.body.removeChild(ta)
                  toast.show(ok ? t('search.copied') : t('search.copyFailed'))
                } catch {
                  toast.show(t('search.copyFailed'))
                }
              }}
              aria-label={t('search.copy')}
              className="shrink-0 p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700/70 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
              title={t('search.copy')}
            >
              <Clipboard size={14} />
            </button>
          </div>

        </div>
      )}
    </div>
  )

  if (!collapsible) {
    // If className contains borderless styles, return content directly
    if (className.includes('border-0') || className.includes('shadow-none')) {
      return (
        <div className={className}>
          {content}
        </div>
      )
    }
    
    return (
      <div className={`rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden ${className}`}>
        {showTitle && (
          <div className="bg-teal-50 dark:bg-gray-800/60 px-4 py-2 border-b border-gray-200 dark:border-gray-700/60">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
              {t('search.hashCalculator.title')}
            </h3>
          </div>
        )}
        <div className="py-6 px-3">
          {content}
        </div>
      </div>
    )
  }

  return (
    <div className={`rounded-lg border border-gray-200 dark:border-gray-700/70 bg-white dark:bg-gray-900 shadow-sm overflow-hidden ${className}`}>
      <div 
        className="bg-teal-50 dark:bg-gray-800/60 px-4 py-2 flex items-center justify-between cursor-pointer border-b border-gray-200 dark:border-gray-700/60" 
        onClick={handleToggle}
      >
        {showTitle && (
          <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">
            {t('search.hashCalculator.title')}
          </h3>
        )}
        <button 
          type="button" 
          className="text-sm px-2 py-1 rounded border bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors" 
          onClick={(e) => { e.stopPropagation(); handleToggle() }} 
          aria-expanded={currentOpen}
        >
          {currentOpen ? '-' : '+'}
        </button>
      </div>
      {currentOpen && (
        <div className="py-4 px-3">
          {content}
        </div>
      )}
    </div>
  )
}

export default PersonHashCalculator

// Inline hash renderer: shows full when fits; otherwise 10...8 middle ellipsis
const HashInline: React.FC<{ value: string; className?: string; titleText?: string; prefix?: number; suffix?: number; wrapOnMobile?: boolean }> = ({ value, className = '', titleText, prefix = 10, suffix = 8, wrapOnMobile = false }) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState<string>(value)

  const recompute = () => {
    const container = containerRef.current
    const meas = measureRef.current
    if (!container || !meas) return
    meas.textContent = value
    const fits = meas.scrollWidth <= container.clientWidth
    const shouldWrap = wrapOnMobile && typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches
    setDisplay(shouldWrap || fits ? value : formatHashMiddle(value, prefix, suffix))
  }

  useEffect(() => {
    recompute()
    const ro = new ResizeObserver(() => recompute())
    if (containerRef.current) ro.observe(containerRef.current)
    const onResize = () => recompute()
    window.addEventListener('resize', onResize)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', onResize)
    }
  }, [value, prefix, suffix, wrapOnMobile])

  return (
    <>
      <span
        ref={containerRef}
        className={`min-w-0 ${wrapOnMobile ? 'sm:overflow-hidden' : 'overflow-hidden'} ${wrapOnMobile ? 'w-full sm:w-auto break-all whitespace-normal sm:whitespace-nowrap' : 'whitespace-nowrap'} ${className}`}
        title={titleText ?? value}
      >
        {display}
      </span>
      {/* measurement node mirrors font styles to ensure accurate width */}
      <span ref={measureRef} className={`absolute left-[-99999px] top-0 invisible whitespace-nowrap ${className}`} />
    </>
  )
}
