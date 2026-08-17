'use client'

import type { HTMLInputTypeAttribute } from 'react'
import { useState } from 'react'
import { AlertCircle, CheckCircle2, Eye, EyeOff } from 'lucide-react'
import type { SettingsFeedbackState } from '@/features/settings/model/types'

type SettingsFieldProps = {
  autoComplete?: string
  disabled?: boolean
  id: string
  label: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  type?: HTMLInputTypeAttribute
  value: string
}

export function SettingsField({
  autoComplete,
  disabled = false,
  id,
  label,
  onChange,
  placeholder,
  required = true,
  type = 'text',
  value
}: SettingsFieldProps) {
  const isPassword = type === 'password'
  const [passwordVisible, setPasswordVisible] = useState(false)

  return (
    <label htmlFor={id} className='block'>
      <span className='text-xs font-semibold uppercase tracking-[0.08em] text-[#45474c]'>{label}</span>
      <span className='mt-2 flex h-11 items-center rounded-brand border border-[#c5c6cd] bg-[#fbf8fa] px-3 transition focus-within:border-[#091426] focus-within:bg-white focus-within:ring-1 focus-within:ring-[#091426]'>
        <input
          id={id}
          name={id}
          type={isPassword && passwordVisible ? 'text' : type}
          required={required}
          disabled={disabled}
          value={value}
          autoComplete={autoComplete}
          placeholder={placeholder}
          onChange={event => onChange(event.target.value)}
          className='min-w-0 flex-1 bg-transparent px-1 text-sm text-[#091426] outline-none placeholder:text-[#9a9ca1] disabled:cursor-not-allowed disabled:opacity-60'
        />
        {isPassword ? (
          <button
            type='button'
            onClick={() => setPasswordVisible(current => !current)}
            className='flex size-8 shrink-0 items-center justify-center text-[#75777d] transition-colors hover:text-[#091426]'
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
      </span>
    </label>
  )
}

export function SettingsFeedback({ feedback }: { feedback: SettingsFeedbackState }) {
  if (!feedback) return null

  const Icon = feedback.type === 'success' ? CheckCircle2 : AlertCircle

  return (
    <div
      role={feedback.type === 'error' ? 'alert' : 'status'}
      className={[
        'flex items-start gap-2 rounded-brand border px-3 py-2 text-sm leading-5',
        feedback.type === 'success'
          ? 'border-[#8fb99c] bg-[#eef7f1] text-[#1f6f4a]'
          : 'border-[#e2a6a6] bg-[#fff1f1] text-[#8f1d2c]'
      ].join(' ')}
    >
      <Icon className='mt-0.5 size-4 shrink-0' strokeWidth={1.8} aria-hidden='true' />
      <span>{feedback.message}</span>
    </div>
  )
}
