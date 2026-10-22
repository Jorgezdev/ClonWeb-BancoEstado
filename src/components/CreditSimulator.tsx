import { useState, useMemo } from 'react';
import { formatCLP } from '../utils/chileanFormatters';
import { Calculator, ArrowRight, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export function CreditSimulator() {
  const [creditType, setCreditType] = useState<'consumo' | 'hipotecario'>('consumo');
  const [amount, setAmount] = useState<number>(3000000);
  const [termMonths, setTermMonths] = useState<number>(36);
  const [graceMonths, setGraceMonths] = useState<number>(0);
  const [hasInsurance, setHasInsurance] = useState<boolean>(true);
  const [isRequested, setIsRequested] = useState<boolean>(false);

  /**
    Cambia la configuración del simulador según el tipo de crédito seleccionado.
    Ajusta los montos y plazos predeterminados:
    - Consumo: montos menores ($3M) y plazos en meses (36m).
    - Hipotecario: montos mayores para compra de vivienda ($45M) y plazos en años (20 años = 240 meses).
   */
  const handleTypeChange = (type: 'consumo' | 'hipotecario') => {
    setCreditType(type);
    setIsRequested(false);
    if (type === 'consumo') {
      setAmount(3000000);
      setTermMonths(36);
    } else {
      setAmount(45000000);
      setTermMonths(240); // 20 años en dividendos mensuales
    }
  };

  /**
   Cálculo financiero de amortización y costos del crédito en tiempo real.
    Utiliza la fórmula matemática estándar del sistema francés (cuota fija mensual):
    
    Cuota = P * [ r * (1 + r)^n ] / [ (1 + r)^n - 1 ]
    Donde:
      P = Monto del capital solicitado (principal)
      r = Tasa de interés periódica mensual (Tasa Anual / 12)
      n = Número total de cuotas mensuales (plazo)
    
    Además incorpora:
    1. Ajuste de meses de gracia: Los intereses generados durante los meses de gracia se prorratean en las cuotas.
    2. Seguros obligatorios CMF: Seguro de desgravamen y cesantía (consumo) / incendio y sismo (hipotecario).
    3. Carga Anual Equivalente (CAE): Métrica porcentual que resume el costo real anual del crédito para el consumidor.
    4. Costo Total del Crédito (CTC): Suma agregada de todas las cuotas a pagar.
   */
  const calculation = useMemo(() => {
    const isConsumo = creditType === 'consumo';
    // Tasas anuales referenciales de mercado chileno: 16.8% en consumo / 4.8% en hipotecario
    const annualRate = isConsumo ? 0.168 : 0.048;
    const monthlyRate = annualRate / 12;
    
    // Cálculo de prima mensual de seguros obligatorios (tasa proporcional al capital)
    const insuranceMonthly = hasInsurance ? (isConsumo ? amount * 0.00085 : amount * 0.00045) : 0;
    
    // Aplicación de la fórmula de amortización francesa
    const factor = Math.pow(1 + monthlyRate, termMonths);
    const baseCuota = (amount * (monthlyRate * factor)) / (factor - 1);
    
    // Prorrateo de intereses generados durante el periodo de gracia
    const graceAdjustment = graceMonths > 0 ? (amount * monthlyRate * graceMonths) / termMonths : 0;
    
    // Cuota final mensual que pagará el cliente
    const finalMonthlyPayment = Math.round(baseCuota + graceAdjustment + insuranceMonthly);
    
    // Costo Total del Crédito (CTC)
    const totalCreditCost = finalMonthlyPayment * termMonths;
    
    // CAE (Carga Anual Equivalente): Tasa nominal + recargo de gastos y seguros
    const cae = (annualRate * 100 + (hasInsurance ? 2.4 : 0)).toFixed(2);

    return {
      monthlyPayment: finalMonthlyPayment,
      totalCreditCost,
      cae,
      insuranceMonthly: Math.round(insuranceMonthly),
    };
  }, [creditType, amount, termMonths, graceMonths, hasInsurance]);

  return (
    <section id="simulador-section" className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FF6600] uppercase tracking-wider mb-2">
            <Calculator className="w-4 h-4" />
            <span>Simulador Oficial en Línea</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-[#002469] tracking-tight">
            Calcula tu cuota con tasa preferencial
          </h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Conoce el valor exacto de tus cuotas, el Costo Total del Crédito (CTC) y la Carga Anual Equivalente (CAE) de forma transparente.
          </p>
        </div>

        {/* Simulator Grid */}
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden grid lg:grid-cols-12">
          
          {/* Left: Input Controls */}
          <div className="lg:col-span-7 p-6 sm:p-8 space-y-6">
            
            {/* Segmented Type Selector */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Tipo de Financiamiento
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => handleTypeChange('consumo')}
                  className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    creditType === 'consumo'
                      ? 'bg-white text-[#002469] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Crédito de Consumo
                </button>
                <button
                  type="button"
                  onClick={() => handleTypeChange('hipotecario')}
                  className={`py-2.5 px-3 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                    creditType === 'hipotecario'
                      ? 'bg-white text-[#002469] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Crédito Hipotecario
                </button>
              </div>
            </div>

            {/* Amount Slider & Input */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Monto a Solicitar
                </label>
                <span className="text-lg font-extrabold font-mono text-[#002469] tabular-nums">
                  {formatCLP(amount)}
                </span>
              </div>
              
              <input
                type="range"
                min={creditType === 'consumo' ? 500000 : 20000000}
                max={creditType === 'consumo' ? 25000000 : 180000000}
                step={creditType === 'consumo' ? 100000 : 1000000}
                value={amount}
                onChange={e => setAmount(Number(e.target.value))}
                className="w-full accent-[#FF6600] cursor-pointer"
              />
              <div className="flex justify-between text-[11px] text-slate-400 font-mono mt-1">
                <span>{creditType === 'consumo' ? '$ 500.000' : '$ 20.000.000'}</span>
                <span>{creditType === 'consumo' ? '$ 25.000.000' : '$ 180.000.000'}</span>
              </div>
            </div>

            {/* Term selector */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Plazo de Pago
                </label>
                <span className="text-sm font-bold text-slate-900">
                  {creditType === 'consumo'
                    ? `${termMonths} Meses (${(termMonths / 12).toFixed(1)} años)`
                    : `${termMonths / 12} Años (${termMonths} dividendos)`}
                </span>
              </div>

              {creditType === 'consumo' ? (
                <div className="grid grid-cols-5 gap-2">
                  {[12, 24, 36, 48, 60].map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTermMonths(m)}
                      className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        termMonths === m
                          ? 'border-[#FF6600] bg-orange-50 text-[#FF6600]'
                          : 'border-slate-200 text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {m} m
                    </button>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30].map(years => {
                    const months = years * 12;
                    return (
                      <button
                        key={years}
                        type="button"
                        onClick={() => setTermMonths(months)}
                        className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                          termMonths === months
                            ? 'border-[#FF6600] bg-orange-50 text-[#FF6600]'
                            : 'border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        {years} Años
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Grace period (Consumo only) */}
            {creditType === 'consumo' && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                  Meses de Gracia (Comienza a pagar después)
                </label>
                <div className="flex gap-2">
                  {[0, 1, 2, 3].map(g => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setGraceMonths(g)}
                      className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                        graceMonths === g
                          ? 'border-[#002469] bg-slate-100 font-bold text-[#002469]'
                          : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {g === 0 ? 'Sin gracia' : `${g} ${g === 1 ? 'mes' : 'meses'}`}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Insurance Checkbox */}
            <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-700">
                <input
                  type="checkbox"
                  checked={hasInsurance}
                  onChange={e => setHasInsurance(e.target.checked)}
                  className="rounded text-[#FF6600] focus:ring-[#FF6600]"
                />
                <span className="font-medium">
                  Incluir Seguros Obligatorios (Desgravamen y Cesantía / Incendio)
                </span>
              </label>
              <span className="text-xs text-slate-400 font-mono">
                {hasInsurance ? formatCLP(calculation.insuranceMonthly) + '/mes' : '$0'}
              </span>
            </div>

          </div>

          {/* Right: Real-Time Results Card (BancoEstado Orange Gradient) */}
          <div className="lg:col-span-5 bg-gradient-to-br from-[#D44A00] via-[#D44A00] to-[#D44A00] text-white p-6 sm:p-8 flex flex-col justify-between shadow-inner">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-200">
                  Resultado Simulación
                </span>
                <span className="text-[11px] text-orange-100 font-mono">
                  Sujeto a evaluación
                </span>
              </div>

              {/* Primary Monthly Quota */}
              <div className="p-4 rounded-xl bg-black/15 border border-white/20">
                <div className="text-xs text-orange-100 mb-1">
                  {creditType === 'consumo' ? 'Valor Cuota Mensual Estimada' : 'Dividendo Mensual Estimado'}
                </div>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-white tabular-nums">
                  {formatCLP(calculation.monthlyPayment)}
                </div>
                <div className="text-[11px] text-slate-300 mt-1 flex items-center gap-1">
                  <span>Plazo de {termMonths} meses</span>
                  <span>·</span>
                  <span>{hasInsurance ? 'Con seguros' : 'Sin seguros'}</span>
                </div>
              </div>

              {/* Financial Metrics Strip */}
              <div className="space-y-2.5 text-xs">
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">Monto del Préstamo:</span>
                  <span className="font-mono font-semibold">{formatCLP(amount)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">CAE (Carga Anual Eq.):</span>
                  <span className="font-mono font-semibold text-emerald-400">{calculation.cae}%</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">Costo Total del Crédito:</span>
                  <span className="font-mono font-bold text-[#FF7700]">{formatCLP(calculation.totalCreditCost)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/10">
                  <span className="text-slate-300">Tasa de Interés Referencial:</span>
                  <span className="font-mono font-semibold">
                    {creditType === 'consumo' ? '1.40% Mensual' : '0.40% Mensual (UF + 4.8%)'}
                  </span>
                </div>
              </div>
            </div>

            {/* Action CTA */}
            <div className="pt-6 mt-6 border-t border-white/10">
              {isRequested ? (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500/50 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-emerald-300">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>¡Solicitud de Pre-evaluación Ingresada!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Un ejecutivo BancoEstado te contactará al teléfono registrado para continuar.
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsRequested(true)}
                  className="w-full py-3.5 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
                >
                  <span>Solicitar Evaluación en Línea</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
              
              <p className="text-[10px] text-slate-400 text-center mt-3">
                Valores referenciales calculados según normativa de la CMF (Comisión para el Mercado Financiero).
              </p>
            </div>

          </div>

        </div>

      </div>
    </section>
  );
}
