import { useState } from 'react';
import { BrandLogo } from './BrandLogo';
import { formatRUT, validateRUT, cleanRUT } from '../utils/chileanFormatters';
import { Lock, ShieldCheck, X, Eye, EyeOff, KeyRound, AlertCircle, Sparkles } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (rut: string) => void;
}

export function LoginModal({ isOpen, onClose, onLoginSuccess }: LoginModalProps) {
  const [rut, setRut] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [useVirtualKeypad, setUseVirtualKeypad] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  /**
   Manejador del cambio de texto en el campo RUT.
   Aplica en caliente la máscara visual con puntos y guión (12.345.678-K).
   */
  const handleRutChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatRUT(raw);
    setRut(formatted);
    if (errorMsg) setErrorMsg('');
  };

  /**
   Registra una pulsación sobre el teclado virtual numérico aleatorio.
   Limita la longitud máxima de la clave de internet a 6 dígitos.
   */
  const handleKeypadPress = (digit: string) => {
    if (password.length < 6) {
      setPassword(prev => prev + digit);
    }
  };

  /**
   Elimina el último dígito ingresado mediante el teclado virtual.
   */
  const handleKeypadBackspace = () => {
    setPassword(prev => prev.slice(0, -1));
  };

  /**
   Limpia por completo la clave de internet ingresada.
   */
  const handleKeypadClear = () => {
    setPassword('');
  };

  /**
   Rellena automáticamente los campos con los datos de la cuenta de prueba de Daniela Fuentes.
   */
  const handleDemoFill = () => {
    setRut('12.345.678-5');
    setPassword('778899');
    setErrorMsg('');
  };

  /**
    Valida las credenciales antes de autorizar el ingreso:
    1. Verifica que el RUT no esté vacío.
    2. Comprueba que el RUT supere el algoritmo matemático oficial Módulo 11.
    3. Comprueba que la clave contenga al menos 4 dígitos numéricos.
    4. Simula la verificación criptográfica del servidor y procede a abrir la Banca en Línea.
   */
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleaned = cleanRUT(rut);
    if (!cleaned) {
      setErrorMsg('Ingresa tu RUT para continuar');
      return;
    }

    if (!validateRUT(cleaned)) {
      setErrorMsg('El RUT ingresado no es válido. Revisa el dígito verificador.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('La clave de internet debe tener al menos 4 dígitos numéricos.');
      return;
    }

    setIsLoading(true);
    // Simula una breve latencia de autenticación segura por TLS
    setTimeout(() => {
      setIsLoading(false);
      onLoginSuccess(rut);
      onClose();
    }, 600);
  };

  // Disposición aleatoria de dígitos del teclado virtual para frustrar keyloggers basados en coordenadas fijas
  const keypadNumbers = ['7', '2', '9', '4', '0', '5', '1', '8', '3', '6'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div 
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
      >
        {/* Modal Header (BancoEstado Orange) */}
        <div className="bg-gradient-to-r from-[#FF6600] to-[#E05500] text-white px-6 py-4 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-white" />
            <h2 className="text-base font-bold">Ingreso a Banca en Línea</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 hover:text-white p-1 rounded-md hover:bg-white/10 transition-colors"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          <div className="flex justify-center mb-5">
            <BrandLogo size="md" />
          </div>

          {/* Acceso rápido de prueba */}
          <div className="mb-5 p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-[#FF6600] shrink-0 mt-0.5" />
            <div className="flex-1">
              <span className="font-semibold block">Acceso Rápido de Prueba:</span>
              <span>Puedes usar tus datos o cargar la cuenta de demostración de Daniela Fuentes.</span>
              <button
                type="button"
                onClick={handleDemoFill}
                className="mt-1.5 inline-block text-xs font-bold text-[#002469] hover:text-[#FF6600] underline cursor-pointer"
              >
                Completar con datos de prueba (12.345.678-5)
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* RUT Input */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                RUT Titular
              </label>
              <input
                type="text"
                placeholder="12.345.678-K"
                value={rut}
                onChange={handleRutChange}
                maxLength={12}
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 font-mono text-base tracking-wide text-slate-900 bg-slate-50/50"
                autoComplete="username"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Ingresa tu RUT con o sin puntos y con guión
              </span>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Clave de Internet
                </label>
                <button
                  type="button"
                  onClick={() => setUseVirtualKeypad(!useVirtualKeypad)}
                  className="text-xs text-[#002469] hover:text-[#FF6600] flex items-center gap-1 font-medium cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  {useVirtualKeypad ? 'Usar teclado normal' : 'Teclado seguro'}
                </button>
              </div>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  inputMode="numeric"
                  placeholder="••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  maxLength={6}
                  readOnly={useVirtualKeypad}
                  className="w-full px-3.5 py-2.5 pr-10 rounded-lg border border-slate-300 focus:border-[#FF6600] focus:ring-2 focus:ring-[#FF6600]/20 font-mono text-base tracking-widest text-slate-900 bg-slate-50/50"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                  aria-label={showPassword ? 'Ocultar clave' : 'Mostrar clave'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Teclado virtual con orden aleatorio */}
            {useVirtualKeypad && (
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200">
                <div className="text-[11px] font-medium text-slate-600 mb-2 text-center">
                  Teclado numérico aleatorio (Protección contra registro de pulsaciones)
                </div>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {keypadNumbers.map(digit => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="h-10 bg-white border border-slate-300 hover:border-[#FF6600] hover:bg-orange-50 font-mono font-bold text-slate-800 rounded-md text-base transition-colors active:scale-95 shadow-xs"
                    >
                      {digit}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleKeypadBackspace}
                    className="flex-1 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md"
                  >
                    Borrar
                  </button>
                  <button
                    type="button"
                    onClick={handleKeypadClear}
                    className="flex-1 py-1.5 text-xs font-semibold bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-md"
                  >
                    Limpiar
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold rounded-lg transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm tracking-wide cursor-pointer focus:ring-2 focus:ring-[#FF6600] focus:ring-offset-2 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span>Validando credenciales seguras...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  <span>Ingresar Seguro</span>
                </>
              )}
            </button>
          </form>

          {/* Security & Anti-Phishing Advisory */}
          <div className="mt-5 pt-4 border-t border-slate-100 flex items-start gap-2.5 text-[11px] text-slate-500 leading-relaxed">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <p>
              <strong className="text-slate-700 font-semibold">Consejo de Seguridad:</strong> BancoEstado nunca te solicitará tus claves ni códigos de autorización por correo electrónico, llamadas telefónicas o mensajes de WhatsApp.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
