import { useState } from 'react';
import { ArrowRight, Lock, CreditCard, Send, Zap, ShieldAlert, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { formatRUT, validateRUT, cleanRUT } from '../utils/chileanFormatters';

interface HeroSectionProps {
  onOpenLogin: () => void;
  onQuickLogin: (rut: string) => void;
  onNavigateToTab: (tab: 'cuentas' | 'transferencias' | 'pagos' | 'seguridad' | 'simulador') => void;
  isLoggedIn: boolean;
  onGoToDashboard: () => void;
  userName?: string;
}

export function HeroSection({
  onOpenLogin,
  onQuickLogin,
  onNavigateToTab,
  isLoggedIn,
  onGoToDashboard,
  userName,
}: HeroSectionProps) {
  const [rutInput, setRutInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');

  const handleHeroLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const cleaned = cleanRUT(rutInput);
    if (!cleaned || !validateRUT(cleaned)) {
      setLoginError('RUT inválido. Formato: 12.345.678-K');
      return;
    }
    if (passwordInput.length < 4) {
      setLoginError('Ingresa tu clave de internet.');
      return;
    }
    onQuickLogin(rutInput);
  };

  const handleQuickDemo = () => {
    setRutInput('12.345.678-5');
    setPasswordInput('778899');
    setLoginError('');
  };

  return (
    <section className="relative bg-gradient-to-br from-[#FF6600] via-[#E05500] to-[#D44A00] text-white overflow-hidden">
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#D44A00]/95 via-[#FF6600]/90 to-[#9E2E00]/80 z-10" />

      {/* Hero Background Image */}
      <div className="absolute inset-0 z-0 opacity-25 mix-blend-luminosity">
        <img
          src="/src/assets/images/banco_hero_banner_1792534637250.jpg"
          alt="BancoEstado Centro Financiero Chile"
          className="w-full h-full object-cover object-center"
          referrerPolicy="no-referrer"
        />
      </div>

      <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-8 py-12 lg:py-20">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Proposition and Highlight */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-white bg-black/20 px-3.5 py-1.5 rounded-lg backdrop-blur-xs border border-white/20">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-300" />
              <span>Banca Digital Segura e Inclusiva</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight text-balance">
              Tu banco de siempre, <br />
              <span className="text-amber-200">más ágil, intuitivo y seguro</span>.
            </h1>

            <p className="text-base sm:text-lg text-orange-50 max-w-xl leading-relaxed font-normal">
              Consulta tus saldos, realiza transferencias instantáneas con BE Pass, paga tus servicios y simula créditos hipotecarios o de consumo desde cualquier lugar de Chile.
            </p>

            {/* Chilean Trust Metrics */}
            <div className="grid grid-cols-3 gap-4 pt-4 border-t border-white/25 max-w-lg">
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                  14.2M+
                </div>
                <div className="text-xs text-orange-100 mt-0.5">
                  CuentasÚnicas Activas
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-amber-200 tabular-nums">
                  100%
                </div>
                <div className="text-xs text-orange-100 mt-0.5">
                  Comunas de Chile
                </div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-extrabold font-mono text-white tabular-nums">
                  256-bit
                </div>
                <div className="text-xs text-orange-100 mt-0.5">
                  Cifrado de Seguridad
                </div>
              </div>
            </div>

            {/* Quick Actions Pills */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => onNavigateToTab('simulador')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors cursor-pointer"
              >
                <span>Simular Crédito</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigateToTab('seguridad')}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-semibold rounded-lg border border-white/20 transition-colors cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Consejos Anti-Phishing</span>
              </button>
            </div>
          </div>

          {/* Right Column: Interactive Online Banking Portal Card */}
          <div className="lg:col-span-5">
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-2xl border border-slate-200 text-slate-900">
              
              {isLoggedIn ? (
                <div className="space-y-5">
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider block">
                        Sesión Activa
                      </span>
                      <h2 className="text-lg font-bold text-slate-900">
                        Banca en Línea Conectada
                      </h2>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-orange-100 text-[#FF6600] flex items-center justify-center font-bold text-sm border border-orange-200">
                      {userName
                        ? userName
                            .split(' ')
                            .slice(0, 2)
                            .map((n: string) => n[0])
                            .join('')
                        : 'JS'}
                    </div>
                  </div>

                  <p className="text-sm text-slate-600">
                    Ya has iniciado sesión de forma segura. Accede a tu resumen de cuentas, transferencias y pagos directos.
                  </p>

                  <button
                    onClick={onGoToDashboard}
                    className="w-full py-3.5 bg-[#002469] hover:bg-[#001c52] text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <span>Ir a mi Banca en Línea</span>
                    <ArrowRight className="w-4 h-4 text-[#FF6600]" />
                  </button>

                  <div className="grid grid-cols-2 gap-2 pt-2">
                    <button
                      onClick={() => onNavigateToTab('transferencias')}
                      className="p-3 bg-slate-50 hover:bg-orange-50 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <Send className="w-4 h-4 text-[#FF6600] mb-1" />
                      <div className="text-xs font-bold text-slate-900">Transferir</div>
                      <div className="text-[11px] text-slate-500">A terceros o CuentaRUT</div>
                    </button>
                    <button
                      onClick={() => onNavigateToTab('pagos')}
                      className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 rounded-lg text-left transition-colors cursor-pointer"
                    >
                      <Zap className="w-4 h-4 text-[#002469] mb-1" />
                      <div className="text-xs font-bold text-slate-900">Pagar Cuentas</div>
                      <div className="text-[11px] text-slate-500">Luz, agua, TAG y bip!</div>
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-orange-100 text-[#FF6600] flex items-center justify-center">
                        <Lock className="w-4 h-4" />
                      </div>
                      <div>
                        <h2 className="text-base font-bold text-slate-900">
                          Acceso Directo Seguro
                        </h2>
                        <span className="text-[11px] text-slate-500">
                          Banca Personas BancoEstado
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Demo helper */}
                  <div className="mb-4 p-2.5 bg-amber-50 rounded-lg border border-amber-200 flex items-center justify-between text-xs text-amber-900">
                    <span className="flex items-center gap-1.5 font-medium">
                      <Sparkles className="w-3.5 h-3.5 text-[#FF6600]" />
                      Cuenta demo precargada
                    </span>
                    <button
                      type="button"
                      onClick={handleQuickDemo}
                      className="font-bold text-[#002469] hover:underline cursor-pointer"
                    >
                      Cargar datos
                    </button>
                  </div>

                  <form onSubmit={handleHeroLogin} className="space-y-3.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        RUT Titular
                      </label>
                      <input
                        type="text"
                        placeholder="12.345.678-5"
                        value={rutInput}
                        onChange={e => {
                          setRutInput(formatRUT(e.target.value));
                          if (loginError) setLoginError('');
                        }}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 font-mono text-sm text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="text-xs font-semibold text-slate-700">
                          Clave de Internet
                        </label>
                        <span className="text-[11px] text-slate-400">4 a 6 dígitos</span>
                      </div>
                      <input
                        type="password"
                        placeholder="••••••"
                        value={passwordInput}
                        onChange={e => setPasswordInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 font-mono text-sm tracking-widest text-slate-900 bg-slate-50/50"
                      />
                    </div>

                    {loginError && (
                      <div className="text-xs text-rose-600 bg-rose-50 p-2 rounded-md border border-rose-200">
                        {loginError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold rounded-lg shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer focus:ring-2 focus:ring-[#FF6600]"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Ingresar a mi Cuenta</span>
                    </button>
                  </form>

                  {/* Fast Action Shortcuts */}
                  <div className="mt-5 pt-4 border-t border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-2.5">
                      Operaciones Frecuentes
                    </span>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <button
                        onClick={onOpenLogin}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer group"
                      >
                        <Send className="w-4 h-4 text-[#FF6600] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium text-slate-700 block">Transferir</span>
                      </button>
                      <button
                        onClick={onOpenLogin}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer group"
                      >
                        <CreditCard className="w-4 h-4 text-[#002469] mx-auto mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium text-slate-700 block">CuentaRUT</span>
                      </button>
                      <button
                        onClick={onOpenLogin}
                        className="p-2 rounded-lg bg-slate-50 hover:bg-slate-100 border border-slate-200/80 transition-colors cursor-pointer group"
                      >
                        <ShieldAlert className="w-4 h-4 text-rose-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                        <span className="text-[11px] font-medium text-slate-700 block">Bloqueo</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
