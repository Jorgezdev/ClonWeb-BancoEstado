import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { Lock, User, Menu, X, ShieldCheck, PhoneCall, Building2 } from 'lucide-react';
import { UserProfile } from '../types/banking';

interface NavbarProps {
  user: UserProfile | null;
  isLoggedIn: boolean;
  onOpenLogin: () => void;
  onGoToDashboard: () => void;
  onGoHome: () => void;
  onScrollToSection: (sectionId: string) => void;
}

export function Navbar({
  user,
  isLoggedIn,
  onOpenLogin,
  onGoToDashboard,
  onGoHome,
  onScrollToSection,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSegment, setActiveSegment] = useState<'personas' | 'microempresas' | 'empresas'>('personas');

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-slate-200 shadow-xs">
      {/* Top Institutional Utility Strip (Vibrant BancoEstado Orange) */}
      <div className="bg-[#D44A00] text-orange-100 text-xs py-1.5 px-4 sm:px-8 border-b border-[#D44A00]">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
          {/* Segments */}
          <div className="flex items-center gap-1 sm:gap-4 font-medium">
            <button
              onClick={() => setActiveSegment('personas')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeSegment === 'personas'
                  ? 'text-white bg-white/20 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Personas
            </button>
            <span className="text-orange-300">|</span>
            <button
              onClick={() => setActiveSegment('microempresas')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeSegment === 'microempresas'
                  ? 'text-white bg-white/20 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Microempresas
            </button>
            <span className="text-orange-300">|</span>
            <button
              onClick={() => setActiveSegment('empresas')}
              className={`px-2.5 py-0.5 rounded transition-colors ${
                activeSegment === 'empresas'
                  ? 'text-white bg-white/20 font-bold'
                  : 'hover:text-white'
              }`}
            >
              Empresas
            </button>
          </div>

          {/* Quick Help & Official Channels */}
          <div className="hidden md:flex items-center gap-5 text-orange-100">
            <span className="flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5 text-white" />
              <span className="font-mono font-medium">600 200 7000</span>
            </span>
            <span className="text-orange-300">·</span>
            <button
              onClick={() => onScrollToSection('security-section')}
              className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-200" />
              <span>Centro de Seguridad</span>
            </button>
            <span className="text-orange-300">·</span>
            <span className="flex items-center gap-1.5 text-orange-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>Sucursales y Cajeros</span>
            </span>
          </div>
        </div>
      </div>

      {/* Main Top Navigation Bar (Strict 3-Zone Contract) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-8">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={onGoHome}
          className="cursor-pointer text-left focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[#FF6600] rounded-sm"
          aria-label="BancoEstado Home"
        >
          <BrandLogo size="md" />
        </button>

        {/* Zone 2: 4-5 Concise Single-Line Navigation Links */}
        <nav className="hidden lg:flex items-center gap-8 text-sm font-semibold text-slate-700">
          <button
            onClick={() => onScrollToSection('cuentas-section')}
            className="hover:text-[#FF6600] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Cuentas & CuentaRUT
          </button>
          <button
            onClick={() => onScrollToSection('tarjetas-section')}
            className="hover:text-[#FF6600] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Tarjetas
          </button>
          <button
            onClick={() => onScrollToSection('simulador-section')}
            className="hover:text-[#FF6600] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Simulador de Crédito
          </button>
          <button
            onClick={() => onScrollToSection('security-section')}
            className="hover:text-[#FF6600] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Seguridad & Prevención
          </button>
          <button
            onClick={() => onScrollToSection('beneficios-section')}
            className="hover:text-[#FF6600] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Beneficios
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action (Banca en Línea) */}
        <div className="flex items-center gap-3 shrink-0">
          {isLoggedIn && user ? (
            <button
              onClick={onGoToDashboard}
              className="flex items-center gap-2 bg-[#002469] hover:bg-[#001c52] text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#002469]"
            >
              <User className="w-4 h-4 text-[#FF6600]" />
              <span className="hidden sm:inline">Hola, {user.name.split(' ')[0]}</span>
              <span className="sm:hidden">Mi Banca</span>
            </button>
          ) : (
            <button
              onClick={onOpenLogin}
              className="flex items-center gap-2 bg-[#FF6600] hover:bg-[#E05500] text-white px-4.5 py-2 rounded-lg text-sm font-bold shadow-xs hover:shadow-md transition-all whitespace-nowrap shrink-0 cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#FF6600]"
            >
              <Lock className="w-4 h-4" />
              <span>Banca en Línea</span>
            </button>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-slate-900 rounded-md hover:bg-slate-100"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-slate-200 px-5 py-4 space-y-3 shadow-lg">
          <button
            onClick={() => {
              onScrollToSection('cuentas-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-slate-800 hover:text-[#FF6600]"
          >
            Cuentas & CuentaRUT
          </button>
          <button
            onClick={() => {
              onScrollToSection('tarjetas-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-slate-800 hover:text-[#FF6600]"
          >
            Tarjetas
          </button>
          <button
            onClick={() => {
              onScrollToSection('simulador-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-slate-800 hover:text-[#FF6600]"
          >
            Simulador de Crédito
          </button>
          <button
            onClick={() => {
              onScrollToSection('security-section');
              setMobileMenuOpen(false);
            }}
            className="block w-full text-left py-2 font-medium text-slate-800 hover:text-[#FF6600]"
          >
            Seguridad Bancaria
          </button>
          <div className="pt-2 border-t border-slate-100">
            {isLoggedIn ? (
              <button
                onClick={() => {
                  onGoToDashboard();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#002469] text-white font-semibold rounded-lg text-center"
              >
                Ingresar a mi Banca en Línea
              </button>
            ) : (
              <button
                onClick={() => {
                  onOpenLogin();
                  setMobileMenuOpen(false);
                }}
                className="w-full py-2.5 bg-[#FF6600] text-white font-bold rounded-lg text-center"
              >
                Ingresar con RUT y Clave
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
