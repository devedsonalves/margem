import Link from 'next/link'
import { ArrowRight, Menu, X } from 'lucide-react'

export function HeroSection() {
  return (
    <section className='w-full overflow-hidden bg-white pt-16 md:pt-20' aria-labelledby='hero-title'>
      <header className='fixed inset-x-0 top-0 z-30 h-16 border-b border-[#c5c6cd] bg-white/95 font-sans backdrop-blur-md md:h-20'>
        <div className='mx-auto flex h-full w-full max-w-[1280px] items-center px-5 sm:px-8 lg:px-10'>
          <Link href='/' className='flex shrink-0 items-center' aria-label='Margem - página inicial'>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src='/logo.png' alt='Margem' className='h-10 w-auto md:h-14' />
          </Link>

          <nav
            className='ml-auto hidden items-center gap-8 text-sm font-medium text-[#45474c] min-[900px]:flex'
            aria-label='Navegação principal'
          >
            <Link href='#recursos' className='transition-colors hover:text-[#091426]'>
              Recursos
            </Link>
            <Link href='#acervo' className='transition-colors hover:text-[#091426]'>
              Acervo
            </Link>
            <Link href='#planos' className='transition-colors hover:text-[#091426]'>
              Planos
            </Link>
          </nav>

          <div className='ml-8 hidden items-center gap-3 min-[900px]:flex'>
            <Link
              href='/login'
              className='flex h-10 items-center px-4 text-sm font-medium text-[#091426] transition-colors hover:bg-[#f5f3f4]'
            >
              Entrar
            </Link>
            <Link
              href='/cadastro'
              className='flex h-10 items-center gap-2 bg-[#091426] px-5 text-sm font-medium text-white transition-colors hover:bg-[#17243a]'
            >
              Criar conta
              <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
            </Link>
          </div>

          <details className='group relative ml-auto min-[900px]:hidden'>
            <summary className='flex size-10 cursor-pointer list-none items-center justify-center rounded-brand border border-[#c5c6cd] bg-white text-[#091426] transition-colors hover:bg-[#f5f3f4] [&::-webkit-details-marker]:hidden'>
              <Menu className='size-5 group-open:hidden' aria-hidden='true' />
              <X className='hidden size-5 group-open:block' aria-hidden='true' />
              <span className='sr-only'>Abrir menu</span>
            </summary>
            <nav
              className='absolute right-0 top-12 flex w-64 flex-col rounded-brand border border-[#c5c6cd] bg-white p-2 text-sm shadow-[0_16px_40px_rgba(9,20,38,.14)] md:top-14'
              aria-label='Navegação móvel'
            >
              <Link href='#recursos' className='px-4 py-3 text-[#45474c] hover:bg-[#f5f3f4] hover:text-[#091426]'>
                Recursos
              </Link>
              <Link href='#acervo' className='px-4 py-3 text-[#45474c] hover:bg-[#f5f3f4] hover:text-[#091426]'>
                Acervo
              </Link>
              <Link href='#planos' className='px-4 py-3 text-[#45474c] hover:bg-[#f5f3f4] hover:text-[#091426]'>
                Planos
              </Link>
              <div className='my-2 border-t border-[#e4e2e3]' />
              <Link href='/login' className='px-4 py-3 font-medium text-[#091426] hover:bg-[#f5f3f4]'>
                Entrar
              </Link>
              <Link
                href='/cadastro'
                className='mt-1 flex h-10 items-center justify-between bg-[#091426] px-4 font-medium text-white'
              >
                Criar conta
                <ArrowRight className='size-4' strokeWidth={1.8} aria-hidden='true' />
              </Link>
            </nav>
          </details>
        </div>
      </header>

      <div className='relative mx-auto h-[640px] w-full max-w-[1000px] overflow-hidden [container-type:inline-size] md:aspect-[1000/661] md:h-auto'>
        <div className='hidden md:block'>
          <HeroLineArt />
        </div>
        <MobileHeroLineArt />

        <div className='absolute left-1/2 top-[148px] z-10 w-[calc(100%-32px)] max-w-[490px] -translate-x-1/2 text-center font-sans text-[#091426] md:top-[14.5cqw] md:w-[49cqw]'>
          <p className='inline-flex bg-white px-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#75777d] md:text-[1.1cqw]'>
            Ambiente de leitura e pensamento
          </p>
          <h1
            id='hero-title'
            className='mt-4 font-serif text-[clamp(30px,8.5vw,38px)] font-semibold leading-[1.08] md:mt-[1.5cqw] md:text-[4.2cqw] md:leading-[1.08]'
          >
            Leia com profundidade.
            <br />
            Pense com clareza.
          </h1>
          <p className='mx-auto mt-5 max-w-[420px] text-[15px] leading-6 text-[#5a5f62] md:mt-[2.4cqw] md:w-[42cqw] md:text-[1.65cqw] md:leading-[1.45]'>
            Leia, destaque e desenvolva suas ideias em um espaço feito para manter o foco no que importa.
          </p>
          <Link
            href='/cadastro'
            className='mx-auto mt-7 flex h-11 w-fit items-center justify-center gap-2 bg-[#e72d31] px-6 text-sm font-semibold text-white transition-colors hover:bg-[#cf2428] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e72d31] md:mt-[2.8cqw] md:h-[4.6cqw] md:px-[2.4cqw] md:text-[1.3cqw]'
          >
            Começar gratuitamente
            <ArrowRight className='size-4 md:size-[1.4cqw]' strokeWidth={1.8} aria-hidden='true' />
          </Link>
        </div>
      </div>
    </section>
  )
}

function MobileHeroLineArt() {
  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 h-full w-full md:hidden'
      viewBox='0 0 375 640'
      preserveAspectRatio='none'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g stroke='#bebebe' strokeWidth='1' strokeDasharray='8 14' opacity='0.65'>
        <path d='M112 584C196 626 316 590 343 492C372 385 347 229 255 145C165 63 50 135 32 280C15 418 88 512 210 500C286 493 318 395 300 285C290 225 278 190 267 165' />
      </g>
      <circle cx='112' cy='584' r='3' fill='white' stroke='#bebebe' strokeWidth='1.2' />
      <circle cx='267' cy='165' r='3' fill='#bebebe' />

      <g stroke='#bdbdbd' strokeWidth='1.8' fill='white' strokeLinejoin='round'>
        <path d='M14 148C27 132 43 127 57 134C70 114 99 111 115 130C131 124 153 134 158 153H14Z' />
        <path d='M236 431C246 416 261 411 274 417C285 400 310 397 325 414C337 410 351 417 357 430V451H236Z' />
      </g>

      <g
        transform='translate(219 65) rotate(-6) scale(.68)'
        stroke='#171717'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <g transform='rotate(15 126 89)'>
          <path
            d='M91 84C101 59 119 37 153 19C166 32 174 51 174 71C155 101 134 116 108 123L91 84Z'
            fill='white'
            strokeWidth='2.4'
          />
          <path d='M153 19C161 15 169 12 178 11C179 22 178 32 175 41L153 19Z' fill='#e72d31' strokeWidth='2.4' />
          <ellipse cx='145' cy='55' rx='13' ry='15' fill='white' strokeWidth='2' />
          <ellipse cx='145' cy='55' rx='8' ry='10' strokeWidth='1.4' />
          <path d='M104 107L129 122L117 139L92 124L104 107Z' fill='#1a1a1a' strokeWidth='2' />
          <path d='M92 92L78 95L66 113L93 112M142 105L147 126L136 143L125 119' fill='white' strokeWidth='2.4' />
          <path
            d='M101 127C84 135 75 148 64 162C68 145 67 137 71 124C58 132 49 140 40 151C46 134 57 119 73 109L101 127Z'
            fill='#e72d31'
            strokeWidth='2.4'
          />
        </g>
      </g>

      <g transform='translate(12 440) scale(.78)'>
        <ReaderArtwork />
      </g>

      <g transform='translate(158 494) scale(.95)' stroke='#171717' strokeLinecap='round' strokeLinejoin='round'>
        <path
          d='M8 91L161 85L186 98L35 107L8 91ZM29 72L179 65L199 77L50 88L29 72ZM2 58L153 52L176 64L26 73L2 58Z'
          fill='white'
          strokeWidth='2.6'
        />
        <path
          d='M35 107L186 98L184 108L34 117L8 102M50 88L199 77L198 88L49 99L29 83M26 73L176 64L174 75L25 84L2 69'
          fill='white'
          strokeWidth='2.2'
        />
        <path d='M26 39L171 33L191 44L47 56L26 39Z' fill='white' strokeWidth='2.8' />
        <path d='M47 56L191 44L189 56L45 67L26 51' fill='white' strokeWidth='2.3' />
        <path d='M75 4L174 10L194 24L85 40L32 31L75 4Z' fill='#e72d31' strokeWidth='3' />
        <path d='M85 40L194 24L190 39L84 54L32 43L32 31' fill='white' strokeWidth='2.7' />
      </g>
    </svg>
  )
}

function ReaderArtwork() {
  return (
    <g stroke='#171717' strokeLinecap='round' strokeLinejoin='round'>
      <path
        d='M24 37C28 17 44 6 65 8C75 0 94 1 106 12C106 25 101 35 92 43C110 51 120 68 119 90C118 120 96 139 66 139C35 139 14 119 14 90C13 68 17 49 24 37Z'
        fill='white'
        strokeWidth='3'
      />
      <path
        d='M24 38C33 18 48 10 64 12C78 10 91 5 105 2C104 19 96 32 82 40C59 34 41 34 24 38Z'
        fill='white'
        strokeWidth='3'
      />
      <path d='M29 40C20 30 10 29 3 37C4 25 13 18 24 20C34 21 41 27 44 35' fill='white' strokeWidth='3' />
      <path
        d='M15 77C8 76 5 82 7 89C9 96 13 99 18 97M118 77C125 76 128 82 126 89C124 96 121 99 116 97'
        fill='white'
        strokeWidth='2.4'
      />
      <path d='M30 58C35 54 42 53 47 56M78 56C84 53 91 54 96 58' strokeWidth='2' />
      <ellipse cx='39' cy='73' rx='9' ry='11' fill='white' strokeWidth='2.4' />
      <ellipse cx='87' cy='73' rx='9' ry='11' fill='white' strokeWidth='2.4' />
      <circle cx='41' cy='76' r='3.2' fill='#171717' stroke='none' />
      <circle cx='85' cy='76' r='3.2' fill='#171717' stroke='none' />
      <path d='M61 77C59 82 60 85 65 86' strokeWidth='1.8' />
      <path d='M47 98C52 104 58 107 65 107C73 107 79 104 84 98' strokeWidth='2' />
      <path d='M34 119C41 111 50 108 61 108C73 108 83 112 91 120L97 142H27L34 119Z' fill='white' strokeWidth='2.5' />
      <path
        d='M20 125C39 116 56 117 72 127C89 117 108 116 130 124L128 226C107 219 88 218 72 226C55 217 34 216 11 223L9 122C13 123 17 124 20 125Z'
        fill='white'
        strokeWidth='3'
      />
      <path d='M72 130V223' strokeWidth='2.3' />
      <path d='M11 123C34 122 54 127 72 137C92 126 111 122 130 124' strokeWidth='2.3' />
      <path
        d='M25 141C39 139 52 142 64 148M25 154C39 152 52 155 64 161M25 168C39 166 52 169 64 175'
        stroke='#8b8b8b'
        strokeWidth='1'
      />
      <path
        d='M81 148C94 141 107 139 119 140M81 161C94 154 107 152 119 153M81 175C94 168 107 166 119 167'
        stroke='#8b8b8b'
        strokeWidth='1'
      />
      <path
        d='M10 144C-1 143-5 150 0 158C3 163 8 161 12 157C3 162 1 170 7 174C12 178 16 171 18 166'
        fill='white'
        strokeWidth='2.5'
      />
      <path
        d='M128 143C140 141 147 149 142 157C138 163 132 159 128 155C140 159 143 167 138 173C133 178 128 171 125 166'
        fill='white'
        strokeWidth='2.5'
      />
    </g>
  )
}

function HeroLineArt() {
  return (
    <svg
      aria-hidden='true'
      className='pointer-events-none absolute inset-0 h-full w-full'
      viewBox='0 0 1000 661'
      fill='none'
      xmlns='http://www.w3.org/2000/svg'
    >
      <g stroke='#b9b9b9' strokeWidth='1' strokeDasharray='9 15' opacity='0.6'>
        <path d='M120 585C250 650 520 630 720 520C880 430 865 235 710 150C535 55 275 90 165 240C65 380 160 515 345 535C525 555 680 470 720 345C750 270 770 235 795 213' />
      </g>
      <circle cx='120' cy='585' r='3.5' fill='white' stroke='#b9b9b9' strokeWidth='1.25' />
      <circle cx='795' cy='213' r='3.5' fill='#b9b9b9' />
      <g stroke='#bdbdbd' strokeWidth='2' fill='white' strokeLinejoin='round'>
        <path d='M24 236C39 233 47 224 54 215C65 201 79 195 92 201C105 187 130 185 143 203C156 201 172 209 177 221C185 222 194 229 195 239H24Z' />
        <path d='M28 264C42 258 52 259 62 265C74 248 98 243 115 254C126 244 145 245 155 258C167 255 182 263 185 277H28Z' />
        <path d='M727 397C736 383 750 375 764 378C777 358 805 351 825 364C836 354 853 354 865 365C883 362 904 375 908 393C930 388 955 398 970 415H727Z' />
        <path d='M874 306C887 292 902 287 916 294C925 278 944 272 958 280C969 286 976 297 978 310C965 318 948 319 934 312C920 319 893 317 874 306Z' />
        <path d='M875 489C888 475 905 470 919 477C928 467 945 462 958 470C969 476 976 487 978 500H875Z' />
      </g>
      <g
        transform='translate(726 43) rotate(-8 110 88) scale(1.05)'
        stroke='#171717'
        strokeLinecap='round'
        strokeLinejoin='round'
      >
        <g transform='rotate(15 126 89)'>
          <path
            d='M91 84C101 59 119 37 153 19C166 32 174 51 174 71C155 101 134 116 108 123L91 84Z'
            fill='white'
            strokeWidth='2.4'
          />
          <path d='M153 19C161 15 169 12 178 11C179 22 178 32 175 41L153 19Z' fill='#e72d31' strokeWidth='2.4' />
          <ellipse cx='145' cy='55' rx='13' ry='15' fill='white' strokeWidth='2' />
          <ellipse cx='145' cy='55' rx='8' ry='10' strokeWidth='1.4' />
          <circle cx='145' cy='47' r='2' fill='#171717' stroke='none' />
          <path d='M104 107L129 122L117 139L92 124L104 107Z' fill='#1a1a1a' strokeWidth='2' />
          <path d='M92 92L78 95L66 113L93 112' fill='white' strokeWidth='2.4' />
          <path d='M142 105L147 126L136 143L125 119' fill='white' strokeWidth='2.4' />
          <path
            d='M101 127C84 135 75 148 64 162C68 145 67 137 71 124C58 132 49 140 40 151C46 134 57 119 73 109L101 127Z'
            fill='#e72d31'
            strokeWidth='2.4'
          />
          <path d='M90 132L74 151' stroke='white' strokeWidth='3' />
          <path d='M168 44L176 50M165 60L176 64M158 76L168 83' strokeWidth='1.4' />
        </g>
      </g>
      <g transform='translate(20 353) scale(1.1)'>
        <ReaderArtwork />
      </g>
      <g transform='translate(181 478) scale(1.1)' stroke='#171717' strokeLinecap='round' strokeLinejoin='round'>
        <path d='M17 106L171 101L198 116L43 124L17 106Z' fill='white' strokeWidth='2.8' />
        <path d='M43 124L198 116L197 125L41 134L17 117L17 106' fill='white' strokeWidth='2.4' />
        <path d='M10 91L161 85L186 98L35 107L10 91Z' fill='white' strokeWidth='2.8' />
        <path d='M35 107L186 98L184 108L34 117L10 102L10 91' fill='white' strokeWidth='2.3' />
        <path d='M29 72L179 65L199 77L50 88L29 72Z' fill='white' strokeWidth='2.8' />
        <path d='M50 88L199 77L198 88L49 99L29 83L29 72' fill='white' strokeWidth='2.3' />
        <path d='M2 58L153 52L176 64L26 73L2 58Z' fill='white' strokeWidth='2.8' />
        <path d='M26 73L176 64L174 75L25 84L2 69L2 58' fill='white' strokeWidth='2.3' />
        <path d='M26 39L171 33L191 44L47 56L26 39Z' fill='white' strokeWidth='2.8' />
        <path d='M47 56L191 44L189 56L45 67L26 51L26 39' fill='white' strokeWidth='2.3' />
        <path d='M75 4L174 10L194 24L85 40L32 31L75 4Z' fill='#e72d31' strokeWidth='3' />
        <path d='M85 40L194 24L190 39L84 54L32 43L32 31' fill='white' strokeWidth='2.7' />
        <path d='M40 35L83 44L184 29M39 47L83 57L181 43' stroke='#757575' strokeWidth='1' />
      </g>
    </svg>
  )
}
