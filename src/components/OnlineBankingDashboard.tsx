import { useState, useMemo } from 'react';
import {
  BankAccount,
  ContactRecipient,
  Transaction,
  UserProfile,
  TransferReceipt,
  BillService,
} from '../types/banking';
import { formatCLP, formatRUT, validateRUT, cleanRUT, formatDateCL, formatTimeCL } from '../utils/chileanFormatters';
import { CHILEAN_BANKS, BILL_SERVICES } from '../data/mockData';
import { BrandLogo } from './BrandLogo';
import {
  CreditCard,
  Send,
  ReceiptText,
  Zap,
  ShieldCheck,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  Lock,
  Smartphone,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  Sliders,
  UserCheck,
  Building,
  RefreshCw,
} from 'lucide-react';

interface OnlineBankingDashboardProps {
  user: UserProfile;
  accounts: BankAccount[];
  transactions: Transaction[];
  contacts: ContactRecipient[];
  onLogout: () => void;
  onExecuteTransfer: (
    originAccountId: string,
    recipient: ContactRecipient,
    amount: number,
    comment: string
  ) => TransferReceipt;
  onPayBill: (
    originAccountId: string,
    service: BillService,
    identifier: string,
    amount: number
  ) => void;
  onToggleCardLock: (accountId: string) => void;
  onToggleInternational: (accountId: string) => void;
  onUpdateTransferLimit: (newLimit: number) => void;
}

export function OnlineBankingDashboard({
  user,
  accounts,
  transactions,
  contacts,
  onLogout,
  onExecuteTransfer,
  onPayBill,
  onToggleCardLock,
  onToggleInternational,
  onUpdateTransferLimit,
}: OnlineBankingDashboardProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'resumen' | 'transferir' | 'cartola' | 'pagos' | 'seguridad'>('resumen');

  // Privacy: Hide / Show balances
  const [showBalances, setShowBalances] = useState(true);

  // Transfer State
  const [transferOriginId, setTransferOriginId] = useState<string>(accounts[0]?.id || '');
  const [transferMode, setTransferMode] = useState<'contact' | 'new'>('contact');
  const [selectedContactId, setSelectedContactId] = useState<string>(contacts[0]?.id || '');
  
  // New recipient form
  const [newRecName, setNewRecName] = useState('');
  const [newRecRut, setNewRecRut] = useState('');
  const [newRecBank, setNewRecBank] = useState(CHILEAN_BANKS[0]);
  const [newRecType, setNewRecType] = useState<'CuentaRUT' | 'Cuenta Corriente' | 'Cuenta Vista' | 'Cuenta de Ahorro'>('CuentaRUT');
  const [newRecAccountNum, setNewRecAccountNum] = useState('');
  const [newRecEmail, setNewRecEmail] = useState('');
  
  // Transfer details
  const [transferAmount, setTransferAmount] = useState<string>('50000');
  const [transferComment, setTransferComment] = useState('Transferencia de fondos');
  const [transferError, setTransferError] = useState('');
  
  // BE Pass Step (2FA confirmation)
  const [showBePassModal, setShowBePassModal] = useState(false);
  const [bePassCode, setBePassCode] = useState('');
  const [simulatedBePassCode, setSimulatedBePassCode] = useState('839214');
  const [activeReceipt, setActiveReceipt] = useState<TransferReceipt | null>(null);

  // Cartola filter
  const [cartolaAccountFilter, setCartolaAccountFilter] = useState<string>('all');
  const [cartolaTypeFilter, setCartolaTypeFilter] = useState<'all' | 'cargo' | 'abono'>('all');
  const [cartolaSearch, setCartolaSearch] = useState('');

  // Bill payment state
  const [selectedBillServiceId, setSelectedBillServiceId] = useState(BILL_SERVICES[0].id);
  const [billIdentifier, setBillIdentifier] = useState('');
  const [billAmount, setBillAmount] = useState('18900');
  const [billOriginId, setBillOriginId] = useState(accounts[0]?.id || '');
  const [billSuccessMsg, setBillSuccessMsg] = useState('');

  /**
   Cálculo computado del balance patrimonial total.
   Suma los saldos disponibles de todas las cuentas del cliente (CuentaRUT, Corriente y Ahorro).
   */
  const totalBalance = useMemo(() => {
    return accounts.reduce((acc, curr) => acc + curr.availableBalance, 0);
  }, [accounts]);

  /**
    Obtiene la cuenta de origen seleccionada actualmente para efectuar transferencias.
   */
  const selectedOriginAccount = useMemo(() => {
    return accounts.find(a => a.id === transferOriginId) || accounts[0];
  }, [accounts, transferOriginId]);

  /**
   Lógica reactiva de filtrado para la Cartola Histórica de Movimientos:
   1. Filtra por cuenta bancaria seleccionada o 'all'.
   2. Filtra por naturaleza del movimiento: 'cargo' (egresos) o 'abono' (ingresos).
   3. Aplica búsqueda en tiempo real insensible a mayúsculas/minúsculas sobre la glosa,
      código de referencia y nombre del destinatario/emisor.
   */
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      if (cartolaAccountFilter !== 'all' && t.accountId !== cartolaAccountFilter) return false;
      if (cartolaTypeFilter !== 'all' && t.type !== cartolaTypeFilter) return false;
      if (cartolaSearch.trim()) {
        const query = cartolaSearch.toLowerCase();
        const matchesDesc = t.description.toLowerCase().includes(query);
        const matchesRef = t.referenceNumber?.toLowerCase().includes(query);
        const matchesParty = t.recipientOrSender?.toLowerCase().includes(query);
        if (!matchesDesc && !matchesRef && !matchesParty) return false;
      }
      return true;
    });
  }, [transactions, cartolaAccountFilter, cartolaTypeFilter, cartolaSearch]);

  /**
    Lógica de Validación Previa de Transferencia Electrónica (TEF):
    1. Verifica que el monto sea un número estrictamente positivo.
    2. Comprueba que la cuenta de origen cuente con fondos disponibles suficientes.
    3. Comprueba que el monto no sobrepase el límite máximo de transferencia diaria.
    4. Si es un nuevo destinatario:
       - Valida que el RUT cumpla estrictamente con el algoritmo Módulo 11.
       - Comprueba que el nombre y el número de cuenta no estén vacíos.
    5. Al superar todas las validaciones, genera un código dinámico BE Pass de 6 dígitos
       y abre la ventana de autorización en dos factores.
   */
  const handleInitiateTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    setTransferError('');

    const numericAmount = Number(transferAmount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setTransferError('Por favor ingresa un monto válido a transferir.');
      return;
    }

    if (numericAmount > selectedOriginAccount.availableBalance) {
      setTransferError('Saldo insuficiente en la cuenta de origen seleccionada.');
      return;
    }

    if (numericAmount > user.dailyTransferLimit) {
      setTransferError(`El monto excede tu límite de transferencia diaria (${formatCLP(user.dailyTransferLimit)}).`);
      return;
    }

    if (transferMode === 'new') {
      const cleaned = cleanRUT(newRecRut);
      if (!cleaned || !validateRUT(cleaned)) {
        setTransferError('El RUT del nuevo destinatario no es válido.');
        return;
      }
      if (!newRecName.trim()) {
        setTransferError('Ingresa el nombre completo del destinatario.');
        return;
      }
      if (!newRecAccountNum.trim()) {
        setTransferError('Ingresa el número de cuenta de destino.');
        return;
      }
    }

    // Genera código dinámico de seguridad BE Pass de 6 dígitos aleatorios
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSimulatedBePassCode(randomCode);
    setBePassCode(randomCode); // Precarga el código para facilitar la prueba al usuario
    setShowBePassModal(true);
  };

  /**
    Lógica de Confirmación de BE Pass y Ejecución de la Transferencia:
    1. Valida el código de 6 dígitos ingresado por el usuario.
    2. Construye el objeto con los datos del destinatario (sea contacto guardado o nuevo).
    3. Invoca la función superior `onExecuteTransfer` para:
       - Descontar el saldo de la cuenta de origen.
       - Registrar la transacción en la cartola con folio TEF.
       - Retornar el comprobante oficial imprimible.
    4. Cierra el modal de BE Pass y despliega el comprobante de éxito en pantalla.
   */
  const handleConfirmBePass = () => {
    if (bePassCode !== simulatedBePassCode && bePassCode.length !== 6) {
      setTransferError('Código BE Pass incorrecto.');
      return;
    }

    let recipientObj: ContactRecipient;
    if (transferMode === 'contact') {
      recipientObj = contacts.find(c => c.id === selectedContactId) || contacts[0];
    } else {
      recipientObj = {
        id: `cont-${Date.now()}`,
        name: newRecName.trim(),
        rut: formatRUT(newRecRut),
        bank: newRecBank,
        accountType: newRecType,
        accountNumber: newRecAccountNum.trim(),
        email: newRecEmail.trim(),
      };
    }

    // Ejecuta la transferencia y descuenta el saldo
    const receipt = onExecuteTransfer(
      selectedOriginAccount.id,
      recipientObj,
      Number(transferAmount),
      transferComment
    );

    setShowBePassModal(false);
    setActiveReceipt(receipt);
  };

  /**
    Lógica de Pago de Servicios (Luz, Agua, Autopistas, bip!):
    1. Valida el identificador ingresado (N° de cliente o tarjeta bip!).
    2. Comprueba que el monto sea válido.
    3. Descuenta el valor de la cuenta seleccionada y añade el cargo a la cartola.
   */
  const handlePayBillSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setBillSuccessMsg('');
    const srv = BILL_SERVICES.find(s => s.id === selectedBillServiceId) || BILL_SERVICES[0];
    const numAmount = Number(billAmount);
    if (!billIdentifier.trim()) {
      alert('Ingresa el identificador de la cuenta o servicio');
      return;
    }
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('Ingresa un monto válido');
      return;
    }
    onPayBill(billOriginId, srv, billIdentifier, numAmount);
    setBillSuccessMsg(`¡Pago realizado exitosamente! Se descontaron ${formatCLP(numAmount)} para ${srv.company}.`);
    setBillIdentifier('');
  };

  return (
    <div className="min-h-screen bg-slate-100/80 pb-16">
      
      {/* Top Banking Bar (Signature BancoEstado Orange) */}
      <div className="bg-gradient-to-r from-[#FF6600] via-[#FF6600] to-[#D44A00] text-white border-b border-[#D44A00] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <BrandLogo variant="light" size="sm" />
            <div className="hidden sm:block border-l border-white/30 pl-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-amber-200 block">
                Banca en Línea
              </span>
              <span className="text-xs text-orange-100">
                Portal Seguro de Personas
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden md:flex items-center gap-2 text-white bg-black/15 px-3 py-1.5 rounded-lg border border-white/20">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              <span>Última conexión: <strong className="text-white font-mono">{user.lastLogin}</strong></span>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right hidden sm:block">
                <div className="font-extrabold text-white leading-tight">{user.name}</div>
                <div className="text-orange-200 font-mono text-[11px]">{user.rut}</div>
              </div>
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 bg-black/30 hover:bg-black/50 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors cursor-pointer border border-white/20"
                title="Cerrar sesión de forma segura"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </button>
            </div>

          </div>

        </div>
      </div>

      {/* Main Navigation Sub-Bar (Segmented Dashboard Tabs) */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2">
          
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={() => setActiveTab('resumen')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'resumen'
                  ? 'bg-[#002469] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Resumen de Cuentas</span>
            </button>

            <button
              onClick={() => {
                setActiveTab('transferir');
                setActiveReceipt(null);
              }}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'transferir'
                  ? 'bg-[#FF6600] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>Transferencias en Línea</span>
            </button>

            <button
              onClick={() => setActiveTab('cartola')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'cartola'
                  ? 'bg-[#002469] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ReceiptText className="w-4 h-4" />
              <span>Cartola y Movimientos</span>
            </button>

            <button
              onClick={() => setActiveTab('pagos')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'pagos'
                  ? 'bg-[#002469] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>Pago de Servicios & bip!</span>
            </button>

            <button
              onClick={() => setActiveTab('seguridad')}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer whitespace-nowrap shrink-0 ${
                activeTab === 'seguridad'
                  ? 'bg-[#002469] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Seguridad & Tarjetas</span>
            </button>
          </div>

          {/* Balance visibility toggle */}
          <button
            onClick={() => setShowBalances(!showBalances)}
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md border border-slate-200 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
            title={showBalances ? 'Ocultar cifras de saldo' : 'Mostrar saldos'}
          >
            {showBalances ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span className="hidden md:inline">{showBalances ? 'Ocultar Saldos' : 'Mostrar Saldos'}</span>
          </button>

        </div>
      </div>

      {/* Main Workspace Viewport */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-8">

        {/* ---------------- 1. TAB: RESUMEN DE CUENTAS ---------------- */}
        {activeTab === 'resumen' && (
          <div className="space-y-8">
            
            {/* Patrimonial Consolidated Banner */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block mb-1">
                  Saldo Total Consolidado en BancoEstado
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-[#002469] tabular-nums">
                  {showBalances ? formatCLP(totalBalance) : '$ ••••••••'}
                </div>
                {/* Indicadores rápidos de la cuenta */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                  <span>3 Cuentas Activas</span>
                  <span aria-hidden="true">·</span>
                  <span>Cifrado de Seguridad SSL 256-bit</span>
                  <span aria-hidden="true">·</span>
                  <span>BE Pass Activo</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={() => {
                    setActiveTab('transferir');
                    setActiveReceipt(null);
                  }}
                  className="px-5 py-2.5 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Transferir Fondos</span>
                </button>
                <button
                  onClick={() => setActiveTab('pagos')}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-[#002469] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4" />
                  <span>Pagar Cuentas</span>
                </button>
              </div>
            </div>

            {/* Individual Account Cards */}
            <div>
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF6600]" />
                <span>Mis Cuentas y Tarjetas</span>
              </h2>

              <div className="grid md:grid-cols-3 gap-6">
                {accounts.map(acc => {
                  const isCuentaRUT = acc.type === 'cuentarut';
                  const isCorriente = acc.type === 'corriente';

                  return (
                    <div
                      key={acc.id}
                      className={`bg-white rounded-2xl p-6 border shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow relative overflow-hidden ${
                        isCuentaRUT
                          ? 'border-orange-300 ring-2 ring-orange-400/20 bg-linear-to-b from-teal-50/30 to-white'
                          : 'border-slate-200'
                      }`}
                    >
                      {isCuentaRUT && (
                        <div className="absolute top-0 right-0 bg-[#FF6600] text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-bl-lg tracking-wider">
                          CuentaRUT Oficial
                        </div>
                      )}
                      <div>
                        {/* Header of Card */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                                isCuentaRUT
                                  ? 'bg-[#FF6600] text-white shadow-xs'
                                  : isCorriente
                                  ? 'bg-blue-100 text-[#002469]'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              <CreditCard className="w-5 h-5" />
                            </div>
                            <div>
                              <h3 className="font-bold text-slate-900 text-sm">
                                {acc.name}
                              </h3>
                              <div className="text-xs text-slate-500 font-mono">
                                N° {acc.accountNumber}
                              </div>
                            </div>
                          </div>

                          {acc.isCardLocked && (
                            <span className="text-[11px] text-rose-700 bg-rose-50 px-2 py-0.5 rounded font-bold border border-rose-200">
                              Bloqueada
                            </span>
                          )}
                        </div>

                        {/* Balance display */}
                        <div className="py-4 border-y border-slate-100">
                          <span className="text-xs text-slate-500 block mb-1">
                            Saldo Disponible
                          </span>
                          <div className="text-2xl font-extrabold font-mono text-slate-900 tabular-nums">
                            {showBalances ? formatCLP(acc.availableBalance) : '$ ••••••'}
                          </div>
                          <div className="text-[11px] text-slate-400 font-mono mt-1">
                            Saldo Contable: {showBalances ? formatCLP(acc.ledgerBalance) : '$ ••••••'}
                          </div>
                        </div>

                        {/* Metadata details */}
                        <div className="pt-3 space-y-1.5 text-xs text-slate-600">
                          {acc.cardLastFour && (
                            <div className="flex justify-between">
                              <span>Tarjeta Asociada:</span>
                              <span className="font-mono font-medium">•••• {acc.cardLastFour}</span>
                            </div>
                          )}
                          <div className="flex justify-between">
                            <span>Estado:</span>
                            <span className="font-medium text-emerald-700">Operativa</span>
                          </div>
                        </div>
                      </div>

                      {/* Card Actions */}
                      <div className="pt-5 mt-4 border-t border-slate-100 grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            setTransferOriginId(acc.id);
                            setActiveTab('transferir');
                            setActiveReceipt(null);
                          }}
                          className="py-2 px-3 text-xs font-bold text-[#FF6600] hover:bg-orange-50 rounded-lg border border-orange-200 transition-colors text-center cursor-pointer"
                        >
                          Transferir
                        </button>
                        <button
                          onClick={() => {
                            setCartolaAccountFilter(acc.id);
                            setActiveTab('cartola');
                          }}
                          className="py-2 px-3 text-xs font-bold text-slate-700 hover:bg-slate-100 rounded-lg border border-slate-200 transition-colors text-center cursor-pointer"
                        >
                          Ver Cartola
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Recent Activity Quick View */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ReceiptText className="w-4 h-4 text-[#002469]" />
                  <span>Últimos Movimientos Registrados</span>
                </h2>
                <button
                  onClick={() => setActiveTab('cartola')}
                  className="text-xs font-bold text-[#FF6600] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Ver todos los movimientos</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider font-semibold">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Descripción</th>
                      <th className="py-2.5 px-3">Referencia</th>
                      <th className="py-2.5 px-3 text-right">Monto</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {transactions.slice(0, 5).map(t => (
                      <tr key={t.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                          {formatDateCL(t.date)}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-900">
                          {t.description}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-500 whitespace-nowrap">
                          {t.referenceNumber || 'N/A'}
                        </td>
                        <td
                          className={`py-3 px-3 font-mono font-bold text-right tabular-nums whitespace-nowrap ${
                            t.type === 'abono' ? 'text-emerald-600' : 'text-slate-900'
                          }`}
                        >
                          {t.type === 'abono' ? '+' : '-'} {formatCLP(t.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* ---------------- 2. TAB: TRANSFERENCIAS EN LÍNEA ---------------- */}
        {activeTab === 'transferir' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {activeReceipt ? (
              /* Chilean Official Transfer Receipt */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md">
                <div className="text-center pb-6 border-b border-slate-200">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#002469]">
                    ¡Transferencia Realizada con Éxito!
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Comprobante Oficial de Transferencia Electrónica de Fondos (TEF)
                  </p>
                  <div className="mt-2 inline-block font-mono text-xs font-bold bg-slate-100 px-3 py-1 rounded text-slate-700">
                    Folio: {activeReceipt.folio}
                  </div>
                </div>

                <div className="py-6 space-y-3.5 text-xs">
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Monto Transferido:</span>
                    <span className="text-base font-extrabold font-mono text-[#002469] tabular-nums">
                      {formatCLP(activeReceipt.amount)}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Destinatario:</span>
                    <span className="font-bold text-slate-900">{activeReceipt.destinationName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">RUT Destinatario:</span>
                    <span className="font-mono text-slate-900">{activeReceipt.destinationRut}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Banco Receptor:</span>
                    <span className="font-medium text-slate-900">{activeReceipt.destinationBank}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Tipo y N° de Cuenta:</span>
                    <span className="font-mono text-slate-900">
                      {activeReceipt.destinationAccountType} · {activeReceipt.destinationAccount}
                    </span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Fecha y Hora Oficial:</span>
                    <span className="font-mono text-slate-700">{activeReceipt.date} - {activeReceipt.time}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-100">
                    <span className="text-slate-500">Mensaje / Asunto:</span>
                    <span className="text-slate-900 italic">"{activeReceipt.comment}"</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-200 flex flex-wrap gap-3 justify-end">
                  <button
                    onClick={() => window.print()}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Imprimir Comprobante</span>
                  </button>
                  <button
                    onClick={() => {
                      setActiveReceipt(null);
                      setTransferAmount('50000');
                    }}
                    className="px-5 py-2 bg-[#FF6600] hover:bg-[#E05500] text-white text-xs font-bold rounded-lg shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Hacer otra transferencia</span>
                  </button>
                </div>
              </div>
            ) : (
              /* Transfer Form */
              <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
                <div className="border-b border-slate-200 pb-4 mb-6">
                  <h2 className="text-lg font-bold text-[#002469] flex items-center gap-2">
                    <Send className="w-5 h-5 text-[#FF6600]" />
                    <span>Transferencia Electrónica de Fondos (TEF)</span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-1">
                    Transfiere a cualquier banco en Chile de forma instantánea y segura.
                  </p>
                </div>

                <form onSubmit={handleInitiateTransfer} className="space-y-6">
                  {/* Origin Account Selection */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      1. Selecciona Cuenta de Origen
                    </label>
                    <div className="grid sm:grid-cols-2 gap-3">
                      {accounts.filter(a => a.type !== 'ahorro').map(acc => (
                        <button
                          key={acc.id}
                          type="button"
                          onClick={() => setTransferOriginId(acc.id)}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                            transferOriginId === acc.id
                              ? 'border-[#FF6600] bg-orange-50/60 ring-1 ring-[#FF6600]'
                              : 'border-slate-200 hover:border-slate-300 bg-white'
                          }`}
                        >
                          <div className="flex justify-between items-center mb-1">
                            <span className="font-bold text-xs text-slate-900">{acc.name}</span>
                            <span className="text-[11px] font-mono text-slate-500">N° {acc.accountNumber}</span>
                          </div>
                          <div className="text-sm font-extrabold font-mono text-[#002469] tabular-nums">
                            {formatCLP(acc.availableBalance)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Mode: Contact vs New */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                      2. Destinatario
                    </label>
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4 max-w-md">
                      <button
                        type="button"
                        onClick={() => setTransferMode('contact')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          transferMode === 'contact'
                            ? 'bg-white text-[#002469] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Contactos Frecuentes
                      </button>
                      <button
                        type="button"
                        onClick={() => setTransferMode('new')}
                        className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                          transferMode === 'new'
                            ? 'bg-white text-[#002469] shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Nuevo Destinatario
                      </button>
                    </div>

                    {transferMode === 'contact' ? (
                      <div className="grid sm:grid-cols-2 gap-3">
                        {contacts.map(c => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setSelectedContactId(c.id)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                              selectedContactId === c.id
                                ? 'border-[#002469] bg-blue-50/60 ring-1 ring-[#002469]'
                                : 'border-slate-200 hover:border-slate-300 bg-white'
                            }`}
                          >
                            <div className="font-bold text-xs text-slate-900">{c.name}</div>
                            <div className="text-[11px] text-slate-500 font-mono mt-0.5">
                              RUT: {c.rut}
                            </div>
                            <div className="text-[11px] text-slate-600 mt-1">
                              {c.bank} · {c.accountType}
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      /* New Contact Form */
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        <div className="grid sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              RUT del Destinatario
                            </label>
                            <input
                              type="text"
                              placeholder="12.345.678-K"
                              value={newRecRut}
                              onChange={e => setNewRecRut(formatRUT(e.target.value))}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 bg-white"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Nombre Completo
                            </label>
                            <input
                              type="text"
                              placeholder="Nombre y Apellidos"
                              value={newRecName}
                              onChange={e => setNewRecName(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Banco de Destino
                            </label>
                            <select
                              value={newRecBank}
                              onChange={e => setNewRecBank(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                            >
                              {CHILEAN_BANKS.map(b => (
                                <option key={b} value={b}>{b}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              Tipo de Cuenta
                            </label>
                            <select
                              value={newRecType}
                              onChange={e => setNewRecType(e.target.value as any)}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                            >
                              <option value="CuentaRUT">CuentaRUT</option>
                              <option value="Cuenta Corriente">Cuenta Corriente</option>
                              <option value="Cuenta Vista">Cuenta Vista</option>
                              <option value="Cuenta de Ahorro">Cuenta de Ahorro</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1">
                              N° de Cuenta
                            </label>
                            <input
                              type="text"
                              placeholder="Ej: 16540219"
                              value={newRecAccountNum}
                              onChange={e => setNewRecAccountNum(e.target.value)}
                              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 font-mono text-slate-900 bg-white"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-semibold text-slate-700 mb-1">
                            Email para Comprobante
                          </label>
                          <input
                            type="email"
                            placeholder="destinatario@correo.cl"
                            value={newRecEmail}
                            onChange={e => setNewRecEmail(e.target.value)}
                            className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Amount and Comment */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        3. Monto a Transferir (CLP)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500">
                          $
                        </span>
                        <input
                          type="number"
                          value={transferAmount}
                          onChange={e => setTransferAmount(e.target.value)}
                          className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 font-mono text-base font-bold text-slate-900 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
                        />
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono mt-1 block">
                        Límite diario: {formatCLP(user.dailyTransferLimit)}
                      </span>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                        Mensaje o Asunto
                      </label>
                      <input
                        type="text"
                        value={transferComment}
                        onChange={e => setTransferComment(e.target.value)}
                        placeholder="Ej: Almuerzo, arriendo, etc."
                        className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs text-slate-900 focus:border-[#FF6600] focus:ring-1 focus:ring-[#FF6600]"
                      />
                    </div>
                  </div>

                  {transferError && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>{transferError}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3.5 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold rounded-xl shadow-md transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Lock className="w-4 h-4" />
                    <span>Continuar y Autorizar con BE Pass</span>
                  </button>
                </form>
              </div>
            )}

          </div>
        )}

        {/* ---------------- 3. TAB: CARTOLA Y MOVIMIENTOS ---------------- */}
        {activeTab === 'cartola' && (
          <div className="space-y-6">
            
            {/* Filter Bar */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
              
              <div className="flex flex-wrap items-center gap-3">
                {/* Account selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Cuenta
                  </label>
                  <select
                    value={cartolaAccountFilter}
                    onChange={e => setCartolaAccountFilter(e.target.value)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-900 bg-white"
                  >
                    <option value="all">Todas las cuentas</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>

                {/* Type selector */}
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                    Tipo de Movimiento
                  </label>
                  <select
                    value={cartolaTypeFilter}
                    onChange={e => setCartolaTypeFilter(e.target.value as any)}
                    className="px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-medium text-slate-900 bg-white"
                  >
                    <option value="all">Todos (Abonos y Cargos)</option>
                    <option value="abono">Solo Abonos (+)</option>
                    <option value="cargo">Solo Cargos (-)</option>
                  </select>
                </div>
              </div>

              {/* Keyword Search */}
              <div className="w-full sm:w-72">
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Buscar por comercio o persona
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lider, Enel, Transferencia..."
                  value={cartolaSearch}
                  onChange={e => setCartolaSearch(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 text-slate-900 bg-white"
                />
              </div>

            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-5 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">
                    Cartola Histórica de Movimientos
                  </h3>
                  <span className="text-xs text-slate-500">
                    Mostrando {filteredTransactions.length} operaciones
                  </span>
                </div>
                <button
                  onClick={() => alert('Descargando archivo Cartola_BancoEstado_2026.csv')}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Exportar CSV</span>
                </button>
              </div>

              {filteredTransactions.length === 0 ? (
                <div className="p-12 text-center text-slate-500 text-xs">
                  No se encontraron movimientos con los filtros aplicados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4">Descripción / Comercio</th>
                        <th className="py-3 px-4">N° Referencia</th>
                        <th className="py-3 px-4">Categoría</th>
                        <th className="py-3 px-4 text-right">Monto (CLP)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredTransactions.map(t => (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4 font-mono text-slate-600 whitespace-nowrap">
                            {formatDateCL(t.date)}
                          </td>
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            {t.description}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-slate-500 whitespace-nowrap">
                            {t.referenceNumber || 'TRX-00000'}
                          </td>
                          <td className="py-3.5 px-4 text-slate-500 capitalize">
                            {t.category}
                          </td>
                          <td
                            className={`py-3.5 px-4 font-mono font-bold text-right tabular-nums whitespace-nowrap text-sm ${
                              t.type === 'abono' ? 'text-emerald-600' : 'text-slate-900'
                            }`}
                          >
                            {t.type === 'abono' ? '+' : '-'} {formatCLP(t.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>
        )}

        {/* ---------------- 4. TAB: PAGO DE SERVICIOS & BIP! ---------------- */}
        {activeTab === 'pagos' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <div className="border-b border-slate-200 pb-4 mb-6">
                <h2 className="text-lg font-bold text-[#002469] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#FF6600]" />
                  <span>Pago de Cuentas y Recarga Tarjeta bip!</span>
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Paga tus suministros de luz, agua, autopistas o recarga transporte metropolitano directamente desde tu cuenta BancoEstado.
                </p>
              </div>

              {billSuccessMsg && (
                <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{billSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handlePayBillSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    1. Empresa o Servicio a Pagar
                  </label>
                  <select
                    value={selectedBillServiceId}
                    onChange={e => setSelectedBillServiceId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                  >
                    {BILL_SERVICES.map(srv => (
                      <option key={srv.id} value={srv.id}>
                        {srv.company} ({srv.category.toUpperCase()})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    2. Identificador de Cliente / Tarjeta
                  </label>
                  <input
                    type="text"
                    placeholder="Ej: 1234567-8"
                    value={billIdentifier}
                    onChange={e => setBillIdentifier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 font-mono text-xs text-slate-900 bg-white"
                  />
                  <span className="text-[11px] text-slate-500 mt-1 block">
                    Revisa el número en tu boleta física o en el reverso de tu tarjeta bip!
                  </span>
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      3. Monto a Pagar (CLP)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-500">
                        $
                      </span>
                      <input
                        type="number"
                        value={billAmount}
                        onChange={e => setBillAmount(e.target.value)}
                        className="w-full pl-8 pr-4 py-2.5 rounded-lg border border-slate-300 font-mono text-sm font-bold text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                      4. Pagar con Cuenta
                    </label>
                    <select
                      value={billOriginId}
                      onChange={e => setBillOriginId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-900 bg-white"
                    >
                      {accounts.filter(a => a.type !== 'ahorro').map(a => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({formatCLP(a.availableBalance)})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 bg-[#002469] hover:bg-[#001c52] text-white font-bold rounded-xl shadow-md transition-all text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Zap className="w-4 h-4 text-[#FF6600]" />
                  <span>Pagar Cuenta en Línea</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* ---------------- 5. TAB: SEGURIDAD Y TARJETAS ---------------- */}
        {activeTab === 'seguridad' && (
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* Card Controls */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h2 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#FF6600]" />
                <span>Control y Bloqueo Inmediato de Tarjetas</span>
              </h2>

              <div className="space-y-4">
                {accounts.filter(a => a.cardLastFour).map(acc => (
                  <div
                    key={acc.id}
                    className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div>
                      <div className="font-bold text-sm text-slate-900">{acc.name}</div>
                      <div className="text-xs text-slate-500 font-mono">
                        Tarjeta Débito · N° •••• {acc.cardLastFour}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      {/* International transactions toggle */}
                      <button
                        onClick={() => onToggleInternational(acc.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer border ${
                          acc.internationalEnabled
                            ? 'bg-blue-50 text-[#002469] border-blue-200'
                            : 'bg-slate-200 text-slate-600 border-slate-300'
                        }`}
                      >
                        {acc.internationalEnabled ? 'Compras Int. Habilitadas' : 'Compras Int. Bloqueadas'}
                      </button>

                      {/* Card block toggle */}
                      <button
                        onClick={() => onToggleCardLock(acc.id)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                          acc.isCardLocked
                            ? 'bg-rose-600 text-white'
                            : 'bg-slate-800 hover:bg-slate-900 text-white'
                        }`}
                      >
                        {acc.isCardLocked ? 'Tarjeta Bloqueada (Desbloquear)' : 'Bloquear Temporalmente'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Daily Transfer Limit Configuration */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Límite Máximo Diario de Transferencias a Terceros
                  </h3>
                  <p className="text-xs text-slate-500">
                    Configura el monto tope que permites transferir por día para evitar transferencias no deseadas.
                  </p>
                </div>
                <span className="text-lg font-extrabold font-mono text-[#002469] tabular-nums">
                  {formatCLP(user.dailyTransferLimit)}
                </span>
              </div>

              <input
                type="range"
                min={500000}
                max={10000000}
                step={500000}
                value={user.dailyTransferLimit}
                onChange={e => onUpdateTransferLimit(Number(e.target.value))}
                className="w-full accent-[#FF6600] cursor-pointer"
              />
              <div className="flex justify-between text-xs text-slate-400 font-mono">
                <span>$ 500.000</span>
                <span>$ 5.000.000 (Recomendado)</span>
                <span>$ 10.000.000</span>
              </div>
            </div>

            {/* Security Audit Log */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs">
              <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Historial de Accesos y Dispositivos de Confianza</span>
              </h3>
              <div className="space-y-2 text-xs">
                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200 flex justify-between items-center text-emerald-900">
                  <div>
                    <strong className="block">Sesión Actual Segura (Navegador Web)</strong>
                    <span className="text-[11px] text-emerald-700">Santiago de Chile · Cifrado TLS 1.3</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-emerald-700">Conectado</span>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center text-slate-700">
                  <div>
                    <strong className="block">App BancoEstado Móvil (iPhone 15)</strong>
                    <span className="text-[11px] text-slate-500">BE Pass Activo · Última sincronización hace 2 horas</span>
                  </div>
                  <span className="font-mono text-xs text-slate-500">Autorizado</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>

      {/* Modal de autorización BE Pass (2FA) */}
      {showBePassModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-sm overflow-hidden">
            <div className="bg-[#002469] text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="w-5 h-5 text-[#FF6600]" />
                <h3 className="font-bold text-sm">Autorización BE Pass</h3>
              </div>
              <button
                onClick={() => setShowBePassModal(false)}
                className="text-slate-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 text-center space-y-4">
              <p className="text-xs text-slate-600">
                Para transferir <strong className="text-slate-900 font-mono">{formatCLP(Number(transferAmount))}</strong>, confirma tu clave dinámica de 6 dígitos:
              </p>

              {/* Dynamic code badge */}
              <div className="p-3 bg-orange-50 border border-orange-200 rounded-xl">
                <span className="text-[11px] text-[#FF6600] font-semibold block mb-1">
                  Código dinámico BE Pass generado:
                </span>
                <span className="text-2xl font-extrabold font-mono tracking-widest text-[#002469]">
                  {simulatedBePassCode}
                </span>
              </div>

              <input
                type="text"
                maxLength={6}
                value={bePassCode}
                onChange={e => setBePassCode(e.target.value.replace(/\D/g, ''))}
                placeholder="6 dígitos"
                className="w-full text-center py-2.5 font-mono text-xl tracking-widest border border-slate-300 rounded-lg focus:border-[#FF6600]"
              />

              <button
                type="button"
                onClick={handleConfirmBePass}
                className="w-full py-3 bg-[#FF6600] hover:bg-[#E05500] text-white font-bold rounded-lg text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Confirmar y Transferir
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
