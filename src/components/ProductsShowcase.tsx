import { CreditCard, Wallet, Home, Sparkles, Check, ArrowUpRight } from 'lucide-react';

interface ProductsShowcaseProps {
  onOpenLogin: () => void;
  onSelectProduct: (productName: string) => void;
}

export function ProductsShowcase({ onOpenLogin, onSelectProduct }: ProductsShowcaseProps) {
  return (
    <section id="cuentas-section" className="py-16 bg-white border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
          <div>
            <div className="text-xs font-bold text-[#FF6600] uppercase tracking-wider mb-1.5">
              Productos Destacados BancoEstado
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002469] tracking-tight">
              Soluciones financieras al alcance de todos
            </h2>
          </div>
          <p className="text-sm text-slate-500 max-w-md">
            Diseñadas para simplificar tu vida diaria, apoyar tus proyectos familiares y darte total autonomía económica.
          </p>
        </div>

        {/* Highlight Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          
          {/* Card 1: CuentaRUT */}
          <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 flex flex-col justify-between hover:border-orange-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 text-[#FF6600] flex items-center justify-center mb-6">
                <CreditCard className="w-6 h-6" />
              </div>

              {/* Etiquetas rápidas del producto */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>Cuenta Vista</span>
                <span aria-hidden="true">·</span>
                <span>Uso Internacional</span>
                <span aria-hidden="true">·</span>
                <span>Chip Contactless</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                CuentaRUT Visa Débito
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                La tarjeta más usada en Chile. Sin cobros por apertura ni mantención mensual. Tu número de cuenta es tu RUT sin dígito verificador.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <span>Compras en Chile y en todo el mundo (presencial y web)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <span>Transferencias gratuitas entre cuentas BancoEstado</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#FF6600] shrink-0" />
                  <span>Suscripciones a apps de streaming y servicios globales</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectProduct('CuentaRUT')}
              className="w-full py-2.5 px-4 bg-white hover:bg-orange-50 border border-slate-300 hover:border-[#FF6600] text-[#002469] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Conocer detalles de CuentaRUT</span>
              <ArrowUpRight className="w-4 h-4 text-[#FF6600]" />
            </button>
          </div>

          {/* Card 2: Cuenta Corriente Digital / Pro */}
          <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 flex flex-col justify-between hover:border-orange-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-blue-100 text-[#002469] flex items-center justify-center mb-6">
                <Wallet className="w-6 h-6" />
              </div>

              {/* Etiquetas rápidas del producto */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>Cuenta Corriente</span>
                <span aria-hidden="true">·</span>
                <span>Línea de Crédito</span>
                <span aria-hidden="true">·</span>
                <span>Tarifa $0 con Abono</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Plan Cuenta Pro
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Una cuenta corriente completa con tarjeta de débito y línea de sobregiro para emergencias. Mantención costo cero abonando tu sueldo.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#002469] shrink-0" />
                  <span>Línea de crédito automática ante emergencias</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#002469] shrink-0" />
                  <span>Transferencias ilimitadas a cualquier banco sin costo</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#002469] shrink-0" />
                  <span>Tarjeta Mastercard Black opcional con acceso a Salones VIP</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectProduct('Cuenta Corriente Pro')}
              className="w-full py-2.5 px-4 bg-white hover:bg-blue-50 border border-slate-300 hover:border-[#002469] text-[#002469] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Solicitar Plan Cuenta Pro</span>
              <ArrowUpRight className="w-4 h-4 text-[#002469]" />
            </button>
          </div>

          {/* Card 3: Cuenta de Ahorro Vivienda */}
          <div className="bg-slate-50 rounded-2xl p-7 border border-slate-200 flex flex-col justify-between hover:border-orange-300 transition-colors">
            <div>
              <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-6">
                <Home className="w-6 h-6" />
              </div>

              {/* Etiquetas rápidas del producto */}
              <div className="flex items-center gap-2 text-xs text-slate-500 mb-2">
                <span>Ahorro en UF</span>
                <span aria-hidden="true">·</span>
                <span>Subsidio MINVU</span>
                <span aria-hidden="true">·</span>
                <span>Giro Diferido</span>
              </div>

              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Ahorro Platino Vivienda
              </h3>
              <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                Ahorra de forma segura protegiendo tu dinero de la inflación con reajuste en UF y postula a los subsidios habitacionales del Estado.
              </p>

              <ul className="space-y-2.5 text-xs text-slate-700 mb-6">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Interés real garantizado + reajuste trimestral en UF</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Válida para postulación al Subsidio Habitacional DS1 y DS19</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Programación de ahorro automático mensual desde tu cuenta</span>
                </li>
              </ul>
            </div>

            <button
              onClick={() => onSelectProduct('Ahorro Platino Vivienda')}
              className="w-full py-2.5 px-4 bg-white hover:bg-emerald-50 border border-slate-300 hover:border-emerald-700 text-[#002469] font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Abrir Cuenta de Ahorro</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-700" />
            </button>
          </div>

        </div>

        {/* Editorial Feature Banner with Generated Family Photo (BancoEstado Orange) */}
        <div id="beneficios-section" className="bg-gradient-to-br from-[#D44A00] via-[#D44A00] to-[#9E2E00] rounded-3xl overflow-hidden text-white grid lg:grid-cols-12 shadow-xl">
          <div className="lg:col-span-6 p-8 sm:p-12 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-amber-200">
                <Sparkles className="w-4 h-4" />
                <span>Alianza y Descuentos Exclusivos</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Disfruta de beneficios reales en tus compras de cada semana
              </h3>
              <p className="text-sm text-orange-100 leading-relaxed">
                Paga con tus tarjetas BancoEstado (Débito CuentaRUT o Crédito) y ahorra en bencina, farmacias, supermercados y pasajes de bus interurbano.
              </p>

              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/20 text-xs">
                <div>
                  <div className="font-bold text-base text-amber-300">$100/lt</div>
                  <div className="text-orange-100">Dscto. Bencina días Lunes</div>
                </div>
                <div>
                  <div className="font-bold text-base text-amber-300">Hasta 40%</div>
                  <div className="text-orange-100">En Farmacias días Martes</div>
                </div>
                <div>
                  <div className="font-bold text-base text-white">20% Dscto.</div>
                  <div className="text-orange-100">Restaurantes fin de semana</div>
                </div>
                <div>
                  <div className="font-bold text-base text-amber-200">3 a 12 Cuotas</div>
                  <div className="text-orange-100">Sin interés en todo Chile</div>
                </div>
              </div>
            </div>

            <div className="pt-6 mt-6 border-t border-white/20">
              <button
                onClick={onOpenLogin}
                className="py-3 px-6 bg-white hover:bg-orange-50 text-[#D44A00] font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md cursor-pointer"
              >
                Revisar mis beneficios en Banca en Línea
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 relative min-h-[320px] lg:min-h-full">
            <img
              src="/src/assets/images/banco_family_saving_1792534637616.jpg"
              alt="Familia chilena disfrutando beneficios BancoEstado"
              className="w-full h-full object-cover object-center"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-linear-to-t lg:bg-linear-to-r from-[#001338] via-transparent to-transparent" />
          </div>
        </div>

      </div>
    </section>
  );
}
