/**
  @file banking.ts
  @description Definición de tipos e interfaces TypeScript para el sistema bancario de BancoEstado.
  Define la estructura de cuentas, transacciones, destinatarios de transferencias, pagos y seguridad.
 */

/*
  Representa una cuenta bancaria del usuario (CuentaRUT, Cuenta Corriente o Ahorro).
 */
export interface BankAccount {
  /* Identificador único interno de la cuenta (ej: 'acc-cuentarut') */
  id: string;
  /* Tipo de producto bancario */
  type: 'cuentarut' | 'corriente' | 'ahorro';
  /* Nombre comercial visible del producto (ej: 'CuentaRUT Visa Débito') */
  name: string;
  /* Número oficial de la cuenta (en CuentaRUT corresponde al RUT sin dígito verificador) */
  accountNumber: string;
  /* Saldo disponible líquido para giros y transferencias inmediatas */
  availableBalance: number;
  /* Saldo contable total (incluye retenciones o cheques en tránsito) */
  ledgerBalance: number;
  /* Moneda de la cuenta (CLP, UF, USD) */
  currency: string;
  /* Últimos 4 dígitos de la tarjeta física/digital asociada */
  cardLastFour?: string;
  /* Estado de bloqueo preventivo de seguridad de la tarjeta */
  isCardLocked?: boolean;
  /* Indica si las compras en comercio web extranjero están habilitadas */
  internationalEnabled?: boolean;
}

/**
  Representa un movimiento financiero registrado en la cartola bancaria.
 */
export interface Transaction {
  /* Identificador único de la transacción */
  id: string;
  /*  ID de la cuenta bancaria donde ocurrió el movimiento */
  accountId: string;
  /* Fecha y hora en formato ISO de la operación */
  date: string;
  /* Glosa o descripción legible del movimiento comercial */
  description: string;
  /* Tipo de operación: 'cargo' (egreso de dinero) o 'abono' (ingreso de dinero) */
  type: 'cargo' | 'abono';
  /* Monto de la operación en pesos chilenos */
  amount: number;
  /* Categoría temática para clasificar gastos */
  category: 'supermercado' | 'transferencia' | 'servicios' | 'transporte' | 'salud' | 'sueldo' | 'otro';
  /* Nombre del emisor o receptor en caso de transferencias */
  recipientOrSender?: string;
  /* Folio o código de autorización oficial de la red bancaria */
  referenceNumber?: string;
}

/**
  Representa a un contacto destinatario guardado en la libreta de transferencias.
 */
export interface ContactRecipient {
  /* Identificador único del contacto */
  id: string;
  /* Nombre completo del titular de la cuenta de destino */
  name: string;
  /* RUT chileno formateado del destinatario */
  rut: string;
  /* Institución financiera o banco receptor en Chile */
  bank: string;
  /* Tipo de cuenta de destino */
  accountType: 'CuentaRUT' | 'Cuenta Corriente' | 'Cuenta Vista' | 'Cuenta de Ahorro';
  /* Número de cuenta de destino */
  accountNumber: string;
  /* Correo electrónico para el envío automático del comprobante TEF */
  email: string;
  /** Marca si el contacto está fijado en favoritos para transferir en un clic */
  isFavorite?: boolean;
}

/**
 * Representa una empresa o servicio disponible en el portal de pago de cuentas.
 */
export interface BillService {
  /** Identificador único del servicio */
  id: string;
  /** Rubro o categoría del servicio */
  category: 'electricidad' | 'agua' | 'telecom' | 'autopista' | 'transporte';
  /** Razón social o nombre comercial de la empresa prestadora */
  company: string;
  /** Nombre del código identificador requerido en la boleta física o digital */
  identifierName: string;
  /** Valor de ejemplo orientativo para guiar al usuario */
  exampleValue: string;
}

/**
  Comprobante emitido tras completar una Transferencia Electrónica de Fondos (TEF).
 */
export interface TransferReceipt {
  /* Número de folio oficial único e irrepetible para trazabilidad */
  folio: string;
  /* Nombre de la cuenta de origen desde donde se debitaron los fondos */
  originAccount: string;
  /* Nombre del titular de destino */
  destinationName: string;
  /* RUT del titular de destino */
  destinationRut: string;
  /* Banco receptor de la transferencia */
  destinationBank: string;
  /* Número de cuenta de destino */
  destinationAccount: string;
  /* Modalidad o tipo de cuenta receptora */
  destinationAccountType: string;
  /* Monto total transferido en pesos chilenos */
  amount: number;
  /* Mensaje o glosa personalizada de la transferencia */
  comment: string;
  /* Fecha oficial de ejecución */
  date: string;
  /* Hora oficial con precisión horaria en Chile */
  time: string;
}

/*
  Perfil y parámetros de seguridad del usuario autenticado en Banca en Línea.
 */
export interface UserProfile {
  /* Nombre y apellidos del cliente titular */
  name: string;
  /* Rol Único Tributario (RUT) del cliente */
  rut: string;
  /* Correo electrónico registrado para alertas de seguridad */
  email: string;
  /* Teléfono celular registrado para validaciones 2FA */
  phone: string;
  /* Registro de fecha y hora del último inicio de sesión */
  lastLogin: string;
  /* Estado de activación del segundo factor de autenticación BE Pass */
  bePassActive: boolean;
  /* Límite monetario máximo diario para transferir a terceros en CLP */
  dailyTransferLimit: number;
}
