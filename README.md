# Clon BancoEstado Chile - Portal Oficial y Banca en Línea Segura

Aplicación web interactiva que recrea la experiencia oficial y digital de **BancoEstado de Chile**, incorporando el portal institucional con la identidad visual naranja representativa, junto a una plataforma completa y funcional de **Banca en Línea (Banca Personas)** enfocada en seguridad, accesibilidad e inclusión financiera. 

# Disclaimer
Este proyecto es una recreación no oficial de BancoEstado, desarrollada exclusivamente con fines educativos, laborales y de demostración de habilidades en desarrollo web.

No existe afiliación con BancoEstado ni conexión con sus sistemas reales. Todas las funcionalidades son demostrativas.

Se prohíbe su uso con fines fraudulentos, suplantación de identidad, phishing o cualquier actividad ilícita, las cuales pueden conllevar responsabilidades legales conforme a la legislación chilena.


# Tabla de Contenidos

1. Portal Institucional y Servicios Públicos
2. Simulador Financiero de Créditos
3. Banca en Línea - Portal de Clientes
4. Módulo de Transferencias Electrónicas (TEF)
5. Cartola Digital e Historial de Movimientos
6. Pago de Servicios y Recargas Metropolitanas
7. Centro de Seguridad y Prevención de Fraudes
8. Especificaciones Técnicas y Algoritmos

---

# Arquitectura 100% Autónoma y Segura

Esta aplicación fue construida como una solución web bancaria completamente autónoma:
- Todos los cálculos financieros (CAE, CTC, cuotas del crédito, dividendos con tasas CMF).
- Las transferencias electrónicas (TEF) y generación de comprobantes oficiales con folios únicos.
- La validación matemática del algoritmo Módulo 11 de RUT chileno.
- El análisis de mensajes sospechosos en el Centro de Ciberseguridad, teclado numérico virtual anti-keylogger y filtros de la cartola.

Todo el código se ejecuta **100% en el navegador del cliente mediante React y TypeScript estándar**. No depende de servicios externos, APIs propietarias ni servidores de terceros, funcionando con total autonomía.

---

# Guía Completa de Arranque Local (Puerto 3000)

Sigue estos pasos para ejecutar la aplicación en tu computador (Windows, macOS o Linux) a través de tu terminal de código (como la terminal de Visual Studio Code):

# 1. Requisitos Previos
- Tener instalado **[Node.js](https://nodejs.org/)** (versión 18.x o superior recomendada).
- Puedes verificar que lo tienes instalado ejecutando en tu terminal:
  ```bash
  node -v
  npm -v
  ```

# 2. Abrir la Terminal en la Carpeta del Proyecto
Abre tu terminal de comandos o PowerShell directamente en la raíz de la carpeta del proyecto donde se encuentra el archivo `package.json`.

# 3. Instalar Dependencias (solo la primera vez)
Ejecuta el siguiente comando para descargar las librerías necesarias (`react`, `vite`, `tailwindcss`, `lucide-react`, etc.):
```bash
npm install
```

# 4. Iniciar el Servidor de Desarrollo en el Puerto 3000
Ejecuta el script de arranque:
```bash
npm run dev
```

> **Nota de Configuración:** En el archivo `package.json`, el comando ya viene configurado de forma predeterminada como:
> ```json
> "scripts": {
>   "dev": "vite --port=3000 --host=0.0.0.0"
> }
> ```
> Esto garantiza que siempre intente abrir directamente en el puerto `3000` y permita acceso local o en red.

# 5. Salida Esperada en la Terminal
Una vez que el comando termine de compilar, verás en la consola una salida similar a esta:
```text
  VITE v8.3.0  ready in 280 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: http://0.0.0.0:3000/
  ➜  press h + enter to show help
```

# 6. Abrir en tu Navegador Web
Haz clic en el enlace o escribe manualmente en tu navegador (Chrome, Edge, Firefox, Safari):
```
http://localhost:3000
```


# 1. Portal Institucional y Servicios Públicos

- Segmentación de Clientes: Selector interactivo para Personas, Microempresas y Empresas.
- Catálogo de Productos Emblemáticos:
  - CuentaRUT: Tarjeta Visa Débito con chip contactless, compras nacionales e internacionales sin cobro de apertura ni mantención mensual.
  - Plan Cuenta Pro / Corriente: Cuenta para abono de remuneraciones con línea de sobregiro y transferencias ilimitadas costo $0.
  - Ahorro Platino Vivienda: Instrumento con reajuste en UF más tasa de interés real, orientado a la postulación a subsidios habitacionales del MINVU (DS1 y DS19).
  - Beneficios Semanales: Descuentos en combustible los días lunes ($100/lt), farmacias los martes (hasta 40%), restaurantes de fin de semana y cuotas sin interés.
- Canales de Emergencia y Atención Oficial: Enlaces directos a números de emergencia (600 200 7000) y bloqueo de tarjetas 24/7 (800 80 20 20).

---

# 2. Simulador Financiero de Créditos

Herramienta de cálculo en tiempo real que modela las fórmulas de la Comisión para el Mercado Financiero (CMF):

- Crédito de Consumo:
  - Montos evaluables: desde **$500.000** hasta **$25.000.000 CLP**.
  - Plazos de pago: **12, 24, 36, 48 y 60 meses**.
  - Meses de gracia: opción de **0 a 3 meses** para comenzar a pagar.
  - Inclusión optativa de seguros obligatorios (Desgravamen y Cesantía).
- Crédito Hipotecario:
  - Montos evaluables: desde $20.000.000 hasta $180.000.000 CLP.
  - Plazos de pago: **15, 20, 25 y 30 años** (conteo de dividendos mensuales).
  - Inclusión de seguros obligatorios (Desgravamen, Incendio y Sismo).
- Resultados Financieros Calculados:
  - Valor Cuota / Dividendo Mensual: Amortización precisa según tasa periódica mensual.
  - CAE (Carga Anual Equivalente): Porcentaje total anual de costo del crédito.
  - CTC (Costo Total del Crédito): Suma total de cuotas proyectadas en pesos chilenos.
  - Pre-aprobación en línea: Botón interactivo para registrar solicitudes de evaluación con retroalimentación inmediata.

---

# 3. Banca en Línea (Portal de Clientes)

- Ingreso Seguro con RUT y Clave:
  - Formateo automático de RUT (`12.345.678-K`).
  - Teclado virtual aleatorio anti-keylogger: Botonera numérica con disposición aleatoria para proteger al usuario de software espía de captura de pulsaciones.
  - Botón de carga rápida de credenciales de demostración (Viviana Silva Morales - 18.423.891-K).
- Resumen Consolidado de Cuentas:
  - Vista del patrimonio total disponible consolidado en BancoEstado.
  - Desglose individual de CuentaRUT, Cuenta Corriente y Cuenta de Ahorro Platino.
  - Muestra simultánea de Saldo Disponible y Saldo Contable.
  - Modo Privacidad: Botón para ocultar/mostrar saldos con un solo clic (`$ ••••••••`).

---

# 4. Módulo de Transferencias Electrónicas (TEF)

- Transferencias a Terceros e Interbancarias:
  - Compatibilidad con todos los bancos chilenos: *BancoEstado, Banco de Chile, Banco Santander, BCI, Scotiabank, Itaú, Banco Falabella, Banco BICE, Security, Consorcio, Tenpo, Mercado Pago, Copec Pay*.
  - Selección de cuenta de origen con visualización de fondos disponibles.
  - Directorio de contactos frecuentes guardados con acceso inmediato.
  - Creación de nuevo destinatario con validación de RUT mediante **Módulo 11**, tipo de cuenta y correo de notificación.
  - Verificación contra el límite máximo diario de transferencias.
- Autorización Segura BE Pass (2FA):
  - Simulación de segundo factor de autenticación mediante clave dinámica de 6 dígitos.
  - Cuenta regresiva de seguridad para la confirmación de la operación.
- Comprobante Oficial de Transferencia:*
  - Generación de comprobante con número de folio único (TEF-2026-XXXXXX).
  - Detalle completo: cuenta origen, datos del receptor, banco, monto en CLP, asunto, fecha y hora oficial.
  - Botón directo para imprimir o guardar el comprobante en PDF.
  - Descuento inmediato de fondos en el saldo de la cuenta y reflejo instantáneo en la cartola.

---

# 5. Cartola Digital e Historial de Movimientos

- Visualización Detallada de Operaciones:
  - Registro cronológico de compras con Redcompra, abonos de remuneraciones, pagos de servicios y transferencias emitidas/recibidas.
- Filtros Avanzados:
  - Filtrado por cuenta específica (CuentaRUT, Cuenta Corriente, Ahorro) o consolidado global.
  - Filtrado por naturaleza del movimiento: Todos, Solo Abonos (+) o Solo Cargos (-).
  - Buscador inteligente en tiempo real por nombre de comercio o destinatario (Lider, Enel, Metro, Juan Pérez, etc.).
- Exportación: Función para descargar la cartola en formato CSV.

---

# 6. Pago de Servicios y Recargas Metropolitanas

- Pago de Suministros Básicos:
  - Electricidad: Enel Distribución Chile, CGE Electricidad.
  - Agua Potable: Aguas Andinas (RM), Essbio / Esval.
  - Telecomunicaciones: Entel, Movistar, WOM.
  - Autopistas Urbanas: Costanera Norte (TAG), Vespucio.
- Recarga de Tarjeta bip! / Transporte Público:
  - Ingreso de los 8 dígitos de la tarjeta bip! o número de cliente.
  - Débito automático desde CuentaRUT o Cuenta Corriente con comprobante de pago emitido en el acto.

---

# 7. Centro de Seguridad y Prevención de Fraudes

- Control Integral de Tarjetas:
  - Bloqueo preventivo temporal: Opción de suspender y reactivar tarjetas en un clic ante extravío o sospecha.
  - Gestión de compras internacionales: Activar o desactivar compras por internet en el extranjero para mitigar cobros fraudulentos.
- Configuración de Límite Diario: Control deslizable para ajustar el tope diario transferible entre $500.000 y $10.000.000 CLP.
- Analizador Interactivo Anti-Phishing:
  - Permite pegar el texto de correos electrónicos o mensajes SMS sospechosos.
  - Detecta enlaces externos no oficiales, peticiones de claves y tácticas de suplantación de identidad para alertar al usuario antes de caer en estafas.
- Bitácora de Sesión Segura: Registro de accesos con IP, navegador, dispositivo móvil sincronizado con BE Pass y hora de última conexión.

---

# 8. Especificaciones Técnicas y Algoritmos

- Stack: React 19, TypeScript, Tailwind CSS, Lucide Icons.
- Algoritmo Módulo 11: Implementación matemática exacta para calcular el dígito verificador del RUT chileno (0 al 9 y K), evitando el ingreso de números de identidad erróneos.
- Formateo Numérico CLP: Formateo de moneda nacional con separación de miles por puntos (`$ 1.250.000`) y visualización tabular para prevenir saltos de línea.
- Diseño Responsivo: Adaptación fluida para dispositivos móviles, tablets y pantallas de escritorio (1440px).
