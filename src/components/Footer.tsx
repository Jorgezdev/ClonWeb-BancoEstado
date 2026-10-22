import { BrandLogo } from './BrandLogo';
import { ShieldCheck, Phone, MapPin, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#001338] text-slate-400 text-xs border-t border-[#001c52]">
      {/* Top Footer Strip */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 border-b border-white/10">
        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
            Canales de Atención
          </h4>
          <ul className="space-y-2">
            <li className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[#FF6600]" />
              <span>Contact Center: 600 200 7000</span>
            </li>
            <li className="flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-rose-400" />
              <span>Bloqueo 24 hrs: 800 555 1000</span>
            </li>
            <li className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>Red BancoEstado Express</span>
            </li>
            <li>Cajeros Automáticos Redbanc</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
            Productos
          </h4>
          <ul className="space-y-2">
            <li>CuentaRUT Visa Débito</li>
            <li>Cuenta Corriente Pro</li>
            <li>Crédito Hipotecario</li>
            <li>Crédito de Consumo</li>
            <li>Ahorro Platino Vivienda</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
            Seguridad & Transparencia
          </h4>
          <ul className="space-y-2">
            <li>Centro de Ciberseguridad</li>
            <li>Recomendaciones Anti-Phishing</li>
            <li>Tarifas y Comisiones CMF</li>
            <li>Defensoría del Cliente Bancario</li>
            <li>Protección de Datos Personales</li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-3">
            Sobre este proyecto
          </h4>
          <p className="text-[11px] leading-relaxed text-slate-400">
            BancoEstado es un banco ficticio creado como proyecto de portafolio. No es una institución financiera real, no está afiliado a BancoEstado ni a ningún otro banco, y no procesa dinero ni datos reales.
          </p>
          <div className="mt-3 p-2.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-300">
            Todos los montos, cuentas y movimientos mostrados son datos de demostración.
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <BrandLogo variant="light" size="sm" />
        <div className="text-center sm:text-right text-[11px] text-slate-500">
          © {new Date().getFullYear()} BancoEstado · Todos los derechos reservados.
        </div>
      </div>
    </footer>
  );
}
