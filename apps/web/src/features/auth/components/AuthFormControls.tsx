'use client'

import type { HTMLInputTypeAttribute } from 'react'
import { useState } from 'react'
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, ShieldCheck, type LucideIcon } from 'lucide-react'

type AuthFieldProps = {
  autoComplete: string
  icon: LucideIcon
  id: string
  label: string
  onChange: (value: string) => void
  placeholder: string
  type?: HTMLInputTypeAttribute
  value: string
}

export function AuthField({
  autoComplete,
  icon: Icon,
  id,
  label,
  onChange,
  placeholder,
  type = 'text',
  value
}: AuthFieldProps) {
  const isPassword = type === 'password'
  const [passwordVisible, setPasswordVisible] = useState(false)
  const inputType = isPassword && passwordVisible ? 'text' : type

  return (
    <div className='w-full'>
      <label htmlFor={id} className='text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]'>
        {label}
      </label>
      <div className='mt-2 flex h-12 items-center rounded-brand border border-[#c5c6cd] bg-[#fbf8fa] px-4 transition-colors focus-within:border-[#091426] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#091426]'>
        <Icon className='size-4 shrink-0 text-[#75777d]' strokeWidth={1.8} aria-hidden='true' />
        <input
          id={id}
          name={id}
          type={inputType}
          required
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={event => onChange(event.target.value)}
          className='min-w-0 flex-1 bg-transparent px-3 text-[15px] text-[#091426] outline-none placeholder:text-[#9a9ca1]'
        />
        {isPassword ? (
          <button
            type='button'
            onClick={() => setPasswordVisible(current => !current)}
            className='flex size-8 shrink-0 items-center justify-center text-[#75777d] transition-colors hover:text-[#091426] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#091426]'
            aria-label={passwordVisible ? 'Ocultar senha' : 'Mostrar senha'}
            aria-pressed={passwordVisible}
          >
            {passwordVisible ? (
              <EyeOff className='size-4' strokeWidth={1.8} aria-hidden='true' />
            ) : (
              <Eye className='size-4' strokeWidth={1.8} aria-hidden='true' />
            )}
          </button>
        ) : null}
      </div>
    </div>
  )
}

export function AuthError({ message }: { message: string }) {
  if (!message) return null

  return (
    <div
      role='alert'
      className='flex w-full items-start gap-3 rounded-brand border border-[#e2a6a6] bg-[#fff1f1] px-4 py-3 text-sm leading-5 text-[#8f1d2c]'
    >
      <AlertCircle className='mt-0.5 size-4 shrink-0' strokeWidth={1.8} aria-hidden='true' />
      <span>{message}</span>
    </div>
  )
}

export function AuthSubmitButton({
  loading,
  loadingLabel,
  label
}: {
  loading: boolean
  loadingLabel: string
  label: string
}) {
  return (
    <button
      type='submit'
      disabled={loading}
      className='flex h-12 w-full items-center justify-center gap-2 bg-[#091426] px-6 text-sm font-medium text-white transition-colors hover:bg-[#17243a] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#091426] disabled:cursor-not-allowed disabled:opacity-60'
    >
      {loading ? (
        <>
          <LoaderCircle className='size-4 animate-spin' strokeWidth={1.8} aria-hidden='true' />
          {loadingLabel}
        </>
      ) : (
        <>
          {label}
          <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
        </>
      )}
    </button>
  )
}

export function AuthSecurityNote() {
  return (
    <div className='mt-6 flex items-start gap-3 border-t border-[#e4e2e3] pt-5 text-xs leading-5 text-[#5a5f62]'>
      <ShieldCheck className='mt-0.5 size-4 shrink-0 text-[#091426]' strokeWidth={1.8} aria-hidden='true' />
      <p>Seus dados são usados apenas para proteger sua conta e manter suas leituras sincronizadas.</p>
    </div>
  )
}
