import { useState } from 'react';
import { ShieldCheck, AlertTriangle, Phone, CheckCircle2, Lock, Smartphone, Search } from 'lucide-react';

export function SecurityCenter() {
  const [suspectText, setSuspectText] = useState('');
  const [analysisResult, setAnalysisResult] = useState<{
    isSuspicious: boolean;
    reason: string;
  } | null>(null);

  /**
    Analizador heurístico de mensajes y correos electrónicos sospechosos.
    Examina el texto en busca de patrones frecuentes utilizados en campañas de Phishing en Chile:
    1. Palabras de urgencia o coerción psicológica ('urgente', 'bloqueada', 'suspensión').
    2. Solicitudes de claves o credenciales ('clave', 'actualiza').
    3. Dominios no oficiales o TLDs sospechosos ('.xyz', 'banco-estado', 'bancoe-').
    4. Enlaces externos ('link', 'ingresa aqui').
    
    De acuerdo a la normativa oficial de BancoEstado, el banco NUNCA adjunta links en SMS.
   */
  const analyzeMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!suspectText.trim()) return;

    const lower = suspectText.toLowerCase();
    const hasSuspiciousTerms =
      lower.includes('link') ||
      lower.includes('actualiza') ||
      lower.includes('bloqueada') ||
      lower.includes('urgente') ||
      lower.includes('ingresa aqui') ||
      lower.includes('clave') ||
      lower.includes('banco-estado') ||
      lower.includes('.xyz') ||
      lower.includes('bancoe-');

    if (hasSuspiciousTerms) {
      setAnalysisResult({
        isSuspicious: true,
        reason: '¡ALERTA DE SEGURIDAD! Este mensaje tiene características típicas de Phishing (suplantación de identidad). BancoEstado NUNCA incluye enlaces en SMS ni pide validar claves en páginas externas.',
      });
    } else {
      setAnalysisResult({
        isSuspicious: false,
        reason: 'Recuerda que cualquier comunicación oficial de BancoEstado solo entrega información informativa y nunca te solicitará hacer clic en enlaces para desbloquear productos o ingresar contraseñas.',
      });
    }
  };

  return (
    <section id="security-section" className="py-16 bg-slate-900 text-white border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">
            <ShieldCheck className="w-4 h-4" />
            <span>Centro de Ciberseguridad Bancaria</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Tu seguridad es nuestra mayor prioridad
          </h2>
          <p className="text-sm sm:text-base text-slate-300 mt-2">
            Aprende a proteger tus cuentas, reconocer intentos de estafa digital y utilizar las herramientas de seguridad que BancoEstado pone a tu disposición.
          </p>
        </div>

        {/* 3 Core Security Pillars */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 text-[#FF6600] flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Regla de Oro BancoEstado
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Jamás te llamaremos ni enviaremos SMS pidiéndote tu Clave de Internet, número de tarjeta, coordenadas ni códigos de autorización BE Pass.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <Smartphone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Autenticación BE Pass
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Autoriza todas tus transferencias y pagos en línea mediante la clave dinámica de 6 dígitos generada en tu App BancoEstado, segura y personal.
            </p>
          </div>

          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-3">
            <div className="w-10 h-10 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold">
              <Phone className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white">
              Línea de Emergencia 24/7
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Ante extravío, robo o sospecha de fraude, bloquea tus tarjetas al instante llamando al <strong className="text-white font-mono">800 555 1000</strong> o desde tu Banca en Línea.
            </p>
          </div>
        </div>

        {/* Interactive Anti-Phishing Checker Tool */}
        <div className="bg-slate-800 rounded-2xl p-6 sm:p-8 border border-slate-700 max-w-4xl mx-auto">
          <div className="flex items-center gap-2 mb-3">
            <Search className="w-5 h-5 text-[#FF6600]" />
            <h3 className="text-lg font-bold text-white">
              Verificador Anti-Fraude de Mensajes o Correos
            </h3>
          </div>
          <p className="text-xs text-slate-300 mb-4">
            ¿Recibiste un mensaje sospechoso por SMS, WhatsApp o Email supuestamente de BancoEstado? Pega el texto aquí para evaluar su nivel de riesgo:
          </p>

          <form onSubmit={analyzeMessage} className="space-y-3">
            <textarea
              rows={2}
              value={suspectText}
              onChange={e => setSuspectText(e.target.value)}
              placeholder='Ej: "BancoEstado informa: Su CuentaRUT ha sido suspendida. Para reactivar ingrese al link https://banco-estado-soporte.xyz/login"'
              className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                className="py-2.5 px-5 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold text-xs rounded-lg transition-colors cursor-pointer"
              >
                Analizar Mensaje
              </button>
            </div>
          </form>

          {analysisResult && (
            <div
              className={`mt-4 p-4 rounded-xl text-xs flex items-start gap-3 border ${
                analysisResult.isSuspicious
                  ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-950/70 border-emerald-500/50 text-emerald-200'
              }`}
            >
              {analysisResult.isSuspicious ? (
                <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              )}
              <div className="leading-relaxed">
                {analysisResult.reason}
              </div>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}
