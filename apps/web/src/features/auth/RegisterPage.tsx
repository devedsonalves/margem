'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { LockKeyhole, Mail, UserRound } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthProvider'
import { AuthError, AuthField, AuthSecurityNote, AuthSubmitButton } from '@/features/auth/components/AuthFormControls'
import { AuthShell } from '@/features/auth/components/AuthShell'

export default function RegisterPage() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register(email, name, password)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Não foi possível criar sua conta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell variant='register'>
      <header>
        <p className='text-xs font-semibold uppercase tracking-[0.14em] text-[#75777d]'>Nova conta</p>
        <h1 className='mt-3 font-serif text-[36px] font-medium leading-[1.16] text-[#091426] sm:text-[42px]'>
          Comece sua biblioteca
        </h1>
        <p className='mt-3 max-w-md text-base leading-7 text-[#5a5f62]'>
          Crie seu espaço para ler, destacar e desenvolver ideias com contexto.
        </p>
      </header>

      <form onSubmit={handleSubmit} className='mt-8 space-y-5'>
        <AuthError message={error} />
        <AuthField
          id='register-name'
          label='Nome completo'
          value={name}
          placeholder='Como podemos chamar você?'
          autoComplete='name'
          icon={UserRound}
          onChange={setName}
        />
        <AuthField
          id='register-email'
          label='E-mail'
          type='email'
          value={email}
          placeholder='seu@email.com'
          autoComplete='email'
          icon={Mail}
          onChange={setEmail}
        />
        <AuthField
          id='register-password'
          label='Senha'
          type='password'
          value={password}
          placeholder='Crie uma senha segura'
          autoComplete='new-password'
          icon={LockKeyhole}
          onChange={setPassword}
        />
        <AuthSubmitButton loading={loading} loadingLabel='Criando conta...' label='Criar minha conta' />
      </form>

      <AuthSecurityNote />

      <p className='mt-8 text-center text-sm leading-6 text-[#5a5f62]'>
        Já possui uma conta?{' '}
        <Link href='/login' className='font-medium text-[#091426] underline underline-offset-4 hover:text-[#17243a]'>
          Entre aqui
        </Link>
      </p>
    </AuthShell>
  )
}
