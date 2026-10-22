interface BrandLogoProps {
  variant?: 'light' | 'dark';
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({ variant = 'dark', className = '', size = 'md' }: BrandLogoProps) {
  const isLight = variant === 'light';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-11 h-11',
  };

  const textSizes = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  };

  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Isotipo geométrico oficial: el Pato de BancoEstado */}
      <div className={`relative ${iconSizes[size]} rounded-lg bg-linear-to-br from-[#FF6600] to-[#E04F00] flex items-center justify-center shadow-xs overflow-hidden shrink-0`}>
        <svg viewBox="0 0 36 36" fill="none" className="w-5/6 h-5/6 text-white" aria-hidden="true">
          <ellipse cx="14" cy="19" rx="8" ry="6" fill="white" />
          <circle cx="21" cy="13" r="5" fill="white" />
          <path d="M25 12L31 14.5L25 17Z" fill="#FFC72C" />
          <circle cx="20" cy="12" r="1.2" fill="#002469" />
          <path d="M8 20C8 20 10 23 15 23C20 23 23 20 23 20" stroke="#002469" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <div className="flex items-baseline">
          <span className={`font-extrabold tracking-tight ${textSizes[size]} ${isLight ? 'text-white' : 'text-[#002469]'}`}>
            Banco
          </span>
          <span className={`font-extrabold tracking-tight ${textSizes[size]} text-[#FF6600]`}>
            Estado
          </span>
        </div>
      </div>
    </div>
  );
}
