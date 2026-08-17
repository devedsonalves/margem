'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { LockKeyhole, Mail } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { AuthError, AuthField, AuthSecurityNote, AuthSubmitButton } from '@/features/auth/components/AuthFormControls'
import { AuthShell } from '@/features/auth/components/AuthShell'

export default function LoginPage() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await login(email, password)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível entrar na sua conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell variant='login'>
      <header>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Acesso</p>
        <h1 className='mt-3 font-serif text-[36px] font-medium leading-[1.16] text-[#091426] sm:text-[42px]'>
          Entre na sua conta
        </h1>
        <p className='mt-3 max-w-md text-base leading-7 text-[#5a5f62]'>
          Continue suas leituras, anotações e reflexões de onde parou.
        </p>
      </header>

      <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
        <AuthError message={error} />
        <AuthField
          id='login-email'
          label='E-mail'
          type='email'
          value={email}
          placeholder='seu@email.com'
          autoComplete='email'
          icon={Mail}
          onChange={setEmail}
        />
        <AuthField
          id='login-password'
          label='Senha'
          type='password'
          value={password}
          placeholder='Digite sua senha'
          autoComplete='current-password'
          icon={LockKeyhole}
          onChange={setPassword}
        />
        <AuthSubmitButton loading={loading} loadingLabel='Entrando...' label='Entrar na Margem' />
      </form>

      <AuthSecurityNote />

      <p className='mt-8 text-center text-sm leading-6 text-[#5a5f62]'>
        Ainda não tem uma conta?{' '}
        <Link href='/cadastro' className='font-medium text-[#091426] underline underline-offset-4 hover:text-[#17243a]'>
          Crie seu espaço
        </Link>
      </p>
    </AuthShell>
  )
}
