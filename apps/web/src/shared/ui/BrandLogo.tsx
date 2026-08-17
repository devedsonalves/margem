/* eslint-disable @next/next/no-img-element */

type BrandLogoProps = {
  className?: string
}

export function BrandLogo({ className = '' }: BrandLogoProps) {
  return <img src='/logo.png' alt='Margem' className={['block h-auto w-full object-contain', className].join(' ')} />
}
