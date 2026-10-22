import { useState } from 'react';
import {
  INITIAL_ACCOUNTS,
  INITIAL_CONTACTS,
  INITIAL_TRANSACTIONS,
  INITIAL_USER,
} from './data/mockData';
import {
  BankAccount,
  ContactRecipient,
  Transaction,
  UserProfile,
  TransferReceipt,
  BillService,
} from './types/banking';
import { Navbar } from './components/Navbar';
import { HeroSection } from './components/HeroSection';
import { ProductsShowcase } from './components/ProductsShowcase';
import { CreditSimulator } from './components/CreditSimulator';
import { SecurityCenter } from './components/SecurityCenter';
import { OnlineBankingDashboard } from './components/OnlineBankingDashboard';
import { LoginModal } from './components/LoginModal';
import { Footer } from './components/Footer';
import { formatCLP, formatDateCL, formatTimeCL } from './utils/chileanFormatters';

export default function App() {
  // Estado del usuario activo y sesión de autenticación
  const [user, setUser] = useState<UserProfile>(INITIAL_USER);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true); // Precargado como activo para exploración inmediata
  const [activeView, setActiveView] = useState<'portal' | 'dashboard'>('portal');
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);

  // Estados financieros del cliente (cuentas, movimientos y libreta de contactos)
  const [accounts, setAccounts] = useState<BankAccount[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [contacts, setContacts] = useState<ContactRecipient[]>(INITIAL_CONTACTS);

  /*
    Manejador de Inicio de Sesión Exitoso:
    Actualiza el RUT activo, registra la marca de tiempo de conexión y redirige a la Banca en Línea.
   */
  const handleLoginSuccess = (rut: string) => {
    setUser(prev => ({
      ...prev,
      rut,
      lastLogin: `${formatDateCL(new Date())}, ${formatTimeCL(new Date())} hrs`,
    }));
    setIsLoggedIn(true);
    setActiveView('dashboard');
  };

  /*
    Manejador de Cierre de Sesión Seguro:
    Termina la sesión activa y retorna al usuario a la vista pública del portal.
   */
  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveView('portal');
  };

  /*
    Lógica Central de Ejecución de Transferencias (TEF):
    1. Descuenta atómicamente el monto del saldo disponible y contable de la cuenta de origen.
    2. Incorpora al destinatario en la lista de contactos frecuentes si no existía previamente.
    3. Registra una nueva transacción de tipo 'cargo' en la cartola con folio único TEF-2026-XXXXXX.
    4. Retorna el comprobante oficial estructurado para su impresión o descarga en PDF.
   */
  const handleExecuteTransfer = (
    originAccountId: string,
    recipient: ContactRecipient,
    amount: number,
    comment: string
  ): TransferReceipt => {
    // 1. Descontar saldo de la cuenta emisora
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === originAccountId) {
          return {
            ...acc,
            availableBalance: acc.availableBalance - amount,
            ledgerBalance: acc.ledgerBalance - amount,
          };
        }
        return acc;
      })
    );

    // 2. Guardar destinatario en la agenda de contactos frecuentes
    setContacts(prev => {
      const exists = prev.some(c => c.rut === recipient.rut);
      if (!exists) {
        return [recipient, ...prev];
      }
      return prev;
    });

    // 3. Crear registro de transacción contable en la cartola
    const now = new Date();
    const folio = `TEF-2026-${Math.floor(100000 + Math.random() * 900000)}`;
    const newTx: Transaction = {
      id: `tx-${Date.now()}`,
      accountId: originAccountId,
      date: now.toISOString(),
      description: `Transferencia a ${recipient.name}`,
      type: 'cargo',
      amount,
      category: 'transferencia',
      recipientOrSender: recipient.name,
      referenceNumber: folio,
    };
    setTransactions(prev => [newTx, ...prev]);

    // 4. Retornar el comprobante oficial de la transferencia
    const originAcc = accounts.find(a => a.id === originAccountId);
    return {
      folio,
      originAccount: originAcc?.name || 'Cuenta BancoEstado',
      destinationName: recipient.name,
      destinationRut: recipient.rut,
      destinationBank: recipient.bank,
      destinationAccount: recipient.accountNumber,
      destinationAccountType: recipient.accountType,
      amount,
      comment: comment || 'Transferencia de Fondos',
      date: formatDateCL(now),
      time: formatTimeCL(now),
    };
  };

  /*
    Lógica de Pago de Servicios Básicos y Recargas bip!:
    1. Descuenta el monto pagado de la cuenta seleccionada.
    2. Registra el comprobante contable de cargo en la cartola con número de orden PAG-XXXXXX.
   */
  const handlePayBill = (
    originAccountId: string,
    service: BillService,
    identifier: string,
    amount: number
  ) => {
    // Descuento en la cuenta bancaria de origen
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === originAccountId) {
          return {
            ...acc,
            availableBalance: acc.availableBalance - amount,
            ledgerBalance: acc.ledgerBalance - amount,
          };
        }
        return acc;
      })
    );

    // Creación del registro en el historial de movimientos
    const now = new Date();
    const newTx: Transaction = {
      id: `tx-bill-${Date.now()}`,
      accountId: originAccountId,
      date: now.toISOString(),
      description: `Pago ${service.company} (${identifier})`,
      type: 'cargo',
      amount,
      category: 'servicios',
      referenceNumber: `PAG-${Math.floor(100000 + Math.random() * 900000)}`,
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  // Card Controls
  const handleToggleCardLock = (accountId: string) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            isCardLocked: !acc.isCardLocked,
          };
        }
        return acc;
      })
    );
  };

  const handleToggleInternational = (accountId: string) => {
    setAccounts(prev =>
      prev.map(acc => {
        if (acc.id === accountId) {
          return {
            ...acc,
            internationalEnabled: !acc.internationalEnabled,
          };
        }
        return acc;
      })
    );
  };

  const handleUpdateTransferLimit = (newLimit: number) => {
    setUser(prev => ({
      ...prev,
      dailyTransferLimit: newLimit,
    }));
  };

  // Navigation scroll helper
  const handleScrollToSection = (sectionId: string) => {
    if (activeView === 'dashboard') {
      setActiveView('portal');
      setTimeout(() => {
        const el = document.getElementById(sectionId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleNavigateToTab = (tab: 'cuentas' | 'transferencias' | 'pagos' | 'seguridad' | 'simulador') => {
    if (tab === 'simulador') {
      handleScrollToSection('simulador-section');
    } else if (tab === 'seguridad') {
      handleScrollToSection('security-section');
    } else {
      if (!isLoggedIn) {
        setIsLoginModalOpen(true);
      } else {
        setActiveView('dashboard');
      }
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      
      {/* Global Navigation */}
      <Navbar
        user={isLoggedIn ? user : null}
        isLoggedIn={isLoggedIn}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onGoToDashboard={() => setActiveView('dashboard')}
        onGoHome={() => setActiveView('portal')}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeView === 'dashboard' && isLoggedIn ? (
          <OnlineBankingDashboard
            user={user}
            accounts={accounts}
            transactions={transactions}
            contacts={contacts}
            onLogout={handleLogout}
            onExecuteTransfer={handleExecuteTransfer}
            onPayBill={handlePayBill}
            onToggleCardLock={handleToggleCardLock}
            onToggleInternational={handleToggleInternational}
            onUpdateTransferLimit={handleUpdateTransferLimit}
          />
        ) : (
          <div>
            <HeroSection
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onQuickLogin={handleLoginSuccess}
              onNavigateToTab={handleNavigateToTab}
              isLoggedIn={isLoggedIn}
              onGoToDashboard={() => setActiveView('dashboard')}
              userName={user.name}
            />

            <ProductsShowcase
              onOpenLogin={() => setIsLoginModalOpen(true)}
              onSelectProduct={prod => {
                if (isLoggedIn) setActiveView('dashboard');
                else setIsLoginModalOpen(true);
              }}
            />

            <CreditSimulator />

            <SecurityCenter />
          </div>
        )}
      </main>

      {/* Global Institutional Footer */}
      <Footer />

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

    </div>
  );
}
