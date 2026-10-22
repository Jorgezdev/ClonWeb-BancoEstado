/**
  @file chileanFormatters.ts
  @description Utilidades para formateo financiero chileno y validación algorítmica de RUT.
  Incluye el algoritmo matemático Módulo 11 oficial para la verificación de identidad en Chile.
 */

/**
  Formatea un número al estándar monetario de Peso Chileno (CLP): "$ 1.234.567".
  - Elimina decimales (en Chile el peso no utiliza centavos en el comercio habitual).
  - Utiliza puntos como separadores de miles según la norma chilena.
  - Soporta números negativos adecuadamente ("-$ 50.000").
  
  @param amount - Valor numérico a formatear
  @returns Cadena formateada en pesos chilenos
 */
export function formatCLP(amount: number): string {
  const isNegative = amount < 0;
  const absVal = Math.abs(Math.round(amount));
  // Expresión regular que inserta un punto cada tres dígitos desde la derecha
  const parts = absVal.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${isNegative ? '-' : ''}$ ${parts}`;
}

/**
  Limpia una cadena de RUT eliminando cualquier carácter que no sea numérico o letra 'K'.
  - Remueve puntos, guiones y espacios en blanco.
  - Convierte la letra 'k' a mayúscula ('K') de manera estandarizada.
  
  @param rut - Cadena con el RUT ingresado por el usuario
  @returns Cadena limpia conteniendo solo dígitos y/o 'K'
 */
export function cleanRUT(rut: string): string {
  return rut.replace(/[^0-9kK]/g, '').toUpperCase();
}

/**
  Formatea un RUT con sus puntos separadores de miles y guión verificador: "12.345.678-K".
  Permite formatear cadenas completas o parciales mientras el usuario escribe en inputs de texto.
  
  @param rut - Cadena bruta o limpia del RUT
  @returns RUT estructurado con formato oficial chileno
 */
export function formatRUT(rut: string): string {
  const cleaned = cleanRUT(rut);
  if (!cleaned) return '';
  if (cleaned.length === 1) return cleaned;
  
  // El último carácter siempre corresponde al dígito verificador (DV)
  const dv = cleaned.slice(-1);
  // El resto de los caracteres corresponden al cuerpo numérico del RUT
  const body = cleaned.slice(0, -1);
  
  // Formatea el cuerpo aplicando puntos de miles
  const formattedBody = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formattedBody}-${dv}`;
}

/**
  Valida un RUT chileno aplicando el algoritmo oficial Módulo 11.
  
  Lógica matemática del algoritmo:
  1. Se recorre el cuerpo del RUT de derecha a izquierda.
  2. Cada dígito se multiplica por una serie periódica de factores: 2, 3, 4, 5, 6, 7 (y vuelve a 2).
  3. Se suman todas las multiplicaciones calculadas.
  4. Se calcula el módulo: 11 - (suma % 11).
     - Si el resultado es 11, el dígito verificador esperado es '0'.
     - Si el resultado es 10, el dígito verificador esperado es 'K'.
     - En cualquier otro caso, el dígito verificador es el número resultante (1 al 9).
  5. Se compara el dígito esperado con el dígito ingresado por el usuario.
  
  @param rut - RUT a validar
  @returns True si el RUT es matemáticamente auténtico, False si es inválido
 */
export function validateRUT(rut: string): boolean {
  const cleaned = cleanRUT(rut);
  // Un RUT chileno estándar tiene entre 8 y 9 caracteres (cuerpo + verificador)
  if (cleaned.length < 8 || cleaned.length > 9) return false;
  
  const body = cleaned.slice(0, -1);
  const dv = cleaned.slice(-1);
  
  let sum = 0;
  let multiplier = 2;
  
  // Recorrido de derecha a izquierda
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i], 10) * multiplier;
    multiplier = multiplier === 7 ? 2 : multiplier + 1; // Reinicia la serie en 2 al llegar a 7
  }
  
  // Cálculo del dígito verificador teórico
  const expectedMod = 11 - (sum % 11);
  let expectedDv = '';
  if (expectedMod === 11) expectedDv = '0';
  else if (expectedMod === 10) expectedDv = 'K';
  else expectedDv = expectedMod.toString();
  
  // Retorna verdadero solo si el dígito ingresado coincide exactamente con el teórico
  return dv === expectedDv;
}

/**
  Formatea una fecha según el formato estándar chileno (ej: "20 oct. 2026").
  Utiliza la API nativa de internacionalización de JavaScript (Intl.DateTimeFormat).
  
  @param isoStringOrDate - Objeto Date o cadena en formato ISO
  @returns Fecha formateada en español de Chile
 */
export function formatDateCL(isoStringOrDate: string | Date): string {
  const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
  return new Intl.DateTimeFormat('es-CL', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
  Formatea la hora en formato de 24 horas (ej: "14:30 hrs").
  
  @param isoStringOrDate - Objeto Date o cadena en formato ISO
  @returns Hora formateada en formato militar/24h estándar chileno
 */
export function formatTimeCL(isoStringOrDate: string | Date): string {
  const date = typeof isoStringOrDate === 'string' ? new Date(isoStringOrDate) : isoStringOrDate;
  return new Intl.DateTimeFormat('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}
