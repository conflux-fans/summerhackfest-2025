import React, { useState, useRef, useEffect, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { ChevronDown, Clipboard } from 'lucide-react'
import { useToast } from './ToastProvider'
import { formatHashMiddle } from '../types/graph'

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
        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-left text-sm text-gray-800 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 hover:bg-gray-50 dark:hover:bg-gray-700/60 transition flex items-center justify-between"
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

// Hash form schema and types
const hashFormSchema = z.object({
  fullName: z.string().min(1).refine((val) => getByteLength(val) <= MAX_FULL_NAME_BYTES, 'Name exceeds max bytes'),
  isBirthBC: z.boolean(),
  birthYear: z.union([z.number().int().min(0).max(10000), z.literal('')]).transform(val => val === '' ? 0 : val),
  birthMonth: z.union([z.number().int().min(0).max(12), z.literal('')]).transform(val => val === '' ? 0 : val),
  birthDay: z.union([z.number().int().min(0).max(31), z.literal('')]).transform(val => val === '' ? 0 : val),
  gender: z.number().int().min(0).max(3),
})

export type HashForm = z.infer<typeof hashFormSchema>

// Hash calculation function
export function computePersonHashLocal(input: HashForm): string {
  const { fullName, isBirthBC, birthYear, birthMonth, birthDay, gender } = input
  
  // First compute fullNameHash exactly like the contract
  const nameBytes = new TextEncoder().encode(fullName)
  const fullNameHash = ethers.keccak256(nameBytes)
  
  // Now build PersonBasicInfo hash exactly matching the contract's abi.encodePacked:
  // abi.encodePacked(fullNameHash, uint8(isBirthBC), birthYear, birthMonth, birthDay, gender)
  // Total: 32 + 1 + 2 + 1 + 1 + 1 = 38 bytes
  const buffer = new Uint8Array(38)
  let offset = 0
  
  // fullNameHash (32 bytes)
  const hashBytes = ethers.getBytes(fullNameHash)
  buffer.set(hashBytes, offset)
  offset += 32
  
  // isBirthBC as uint8 (1 byte)
  buffer[offset] = isBirthBC ? 1 : 0
  offset += 1
  
  // birthYear as uint16 big-endian (2 bytes)
  buffer[offset] = (birthYear >> 8) & 0xff
  buffer[offset + 1] = birthYear & 0xff
  offset += 2
  
  // birthMonth as uint8 (1 byte)
  buffer[offset] = birthMonth & 0xff
  offset += 1
  
  // birthDay as uint8 (1 byte)
  buffer[offset] = birthDay & 0xff
  offset += 1
  
  // gender as uint8 (1 byte)
  buffer[offset] = gender & 0xff
  
  return ethers.keccak256(buffer)
}

// Raw form input type (before transformation)
type HashFormInput = {
  fullName: string
  isBirthBC: boolean
  birthYear: number | ''
  birthMonth: number | ''
  birthDay: number | ''
  gender: number
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
    birthYear: z.union([z.number().int().min(0, t('search.validation.yearRange')).max(10000, t('search.validation.yearRange')), z.literal('')]).optional().transform(val => val === '' || val === undefined ? 0 : val),
    birthMonth: z.union([z.number().int().min(0, t('search.validation.monthRange')).max(12, t('search.validation.monthRange')), z.literal('')]).optional().transform(val => val === '' || val === undefined ? 0 : val),
    birthDay: z.union([z.number().int().min(0, t('search.validation.dayRange')).max(31, t('search.validation.dayRange')), z.literal('')]).optional().transform(val => val === '' || val === undefined ? 0 : val),
    gender: z.number().int().min(0).max(3),
  }), [t])

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm({
    resolver: zodResolver(hashFormSchema),
    defaultValues: { 
      fullName: initialValues?.fullName || '', 
      isBirthBC: initialValues?.isBirthBC || false, 
      birthYear: initialValues?.birthYear || '', 
      birthMonth: initialValues?.birthMonth || '', 
      birthDay: initialValues?.birthDay || '', 
      gender: initialValues?.gender || 0 
    },
  })

  // Watch for form changes and notify parent
  const fullName = watch('fullName')
  const isBirthBC = watch('isBirthBC')
  const birthYear = watch('birthYear')
  const birthMonth = watch('birthMonth')
  const birthDay = watch('birthDay')
  const gender = watch('gender')
  
  const computedHash = useMemo(() => {
    const transformedData: HashForm = {
      fullName: fullName || '',
      isBirthBC: isBirthBC || false,
      birthYear: birthYear === '' || birthYear === undefined ? 0 : Number(birthYear),
      birthMonth: birthMonth === '' || birthMonth === undefined ? 0 : Number(birthMonth),
      birthDay: birthDay === '' || birthDay === undefined ? 0 : Number(birthDay),
      gender: Number(gender || 0),
    }
    if (!transformedData.fullName.trim()) return ''
    return computePersonHashLocal(transformedData)
  }, [fullName, isBirthBC, birthYear, birthMonth, birthDay, gender])
  
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
    }
    onFormChangeRef.current(transformedData)
  }, [fullName, isBirthBC, birthYear, birthMonth, birthDay, gender])

  const content = (
    <div className="space-y-2">
      <div className="w-full space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <div className="basis-full sm:basis-[360px] md:basis-[420px] grow-0 shrink-0">
            <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
              {t('search.hashCalculator.name')}
            </label>
            <input 
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
              placeholder={t('search.hashCalculator.nameInputPlaceholder')}
              {...register('fullName')} 
            />
            <FieldError message={errors.fullName?.message} />
          </div>
          
          <div className="w-28">
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
            <div className="w-16 min-w-16">
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                {t('search.hashCalculator.isBirthBC')}
              </label>
              <div className="h-10 flex items-center">
                <label className="inline-flex items-center text-xs font-medium text-gray-700 dark:text-gray-300 cursor-pointer select-none group">
                  <input type="checkbox" className="sr-only" {...register('isBirthBC')} />
                  <span className="relative w-11 h-6 rounded-full bg-gray-300 dark:bg-gray-700 group-has-[:checked]:bg-blue-600 transition-colors duration-200 flex-shrink-0">
                    <span className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 group-has-[:checked]:translate-x-5" />
                  </span>
                </label>
              </div>
              <FieldError />
            </div>
            
            <div className="w-25">
              <label className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-400 mb-1">
                {t('search.hashCalculator.birthYearLabel')}
              </label>
              <input 
                type="number" 
                placeholder={t('search.hashCalculator.birthYear')} 
                className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
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
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
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
              className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-400 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/30 dark:focus:ring-blue-400/30 outline-none transition" 
              {...register('birthDay', { setValueAs: (v) => v === '' ? '' : parseInt(v, 10) })} 
            />
            <FieldError message={errors.birthDay?.message} />
          </div>
        </div>
      </div>
      {computedHash && (
        <div className="space-y-1">
          <div className="flex items-center gap-1 overflow-hidden">
            <span className="shrink-0 text-xs text-gray-600 dark:text-gray-400">
              {t('search.hashCalculator.hashLabel')}
            </span>
            <HashInline value={computedHash} className="font-mono text-sm leading-none text-gray-700 dark:text-gray-300 tracking-tight" />
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
const HashInline: React.FC<{ value: string; className?: string; titleText?: string; prefix?: number; suffix?: number }> = ({ value, className = '', titleText, prefix = 10, suffix = 8 }) => {
  const containerRef = useRef<HTMLSpanElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const [display, setDisplay] = useState<string>(value)

  const recompute = () => {
    const container = containerRef.current
    const meas = measureRef.current
    if (!container || !meas) return
    meas.textContent = value
    const fits = meas.scrollWidth <= container.clientWidth
    setDisplay(fits ? value : formatHashMiddle(value, prefix, suffix))
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
  }, [value, prefix, suffix])

  return (
    <>
      <span ref={containerRef} className={`min-w-0 overflow-hidden whitespace-nowrap ${className}`} title={titleText ?? value}>
        {display}
      </span>
      {/* measurement node mirrors font styles to ensure accurate width */}
      <span ref={measureRef} className={`absolute left-[-99999px] top-0 invisible whitespace-nowrap ${className}`} />
    </>
  )
}
