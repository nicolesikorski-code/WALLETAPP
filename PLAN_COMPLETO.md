# 🎯 Plan Completo - Stellar Wallet App

## 📊 Resumen del Objetivo

Combinar:
1. ✅ **Tu proyecto actual** - Conexión Freighter funcionando
2. ✅ **TiburonasPay** (referencia) - Navegación y estructura
3. ✅ **Funcionalidades USDC** - Crear trustline, ver balance, enviar USDC

**Diseño:** Único (azul/cyan/morado), NO copiado de TiburonasPay

---

## 🏗️ Estructura Final Esperada

```
app/
  components/
    ✅ Navbar.tsx              - Navegación principal
    ✅ WalletButton.tsx        - Botón de conexión
    ✅ Balance.tsx             - Sidebar con balances (XLM + USDC)
    🆕 TrustlineManager.tsx    - Crear trustline para USDC
    🆕 PaymentForm.tsx         - Enviar XLM o USDC
    🆕 GenerateAccount.tsx     - Generar cuenta de prueba
    🆕 TransactionHistory.tsx  - Historial de transacciones
  page.tsx                     - Página principal con navegación
```

---

## ✅ Lo Que YA Tenemos Funcionando

- ✅ Conexión/Desconexión con Freighter
- ✅ Mostrar dirección pública
- ✅ UI básica con diseño único

---

## 🎯 Lo Que FALTA Implementar

### **PASO 1: Restaurar Balance Component** ⏱️ 20 min
**Objetivo:** Mostrar balances de XLM y USDC

**Tareas:**
- ✅ Crear `Balance.tsx` con diseño único (azul/cyan)
- ✅ Mostrar balance de XLM (nativo)
- ✅ Detectar si tiene trustline de USDC
- ✅ Mostrar balance de USDC si existe
- ✅ Mensaje si no tiene trustline

---

### **PASO 2: Crear Trustline para USDC** ⏱️ 45 min
**Objetivo:** Permitir crear trustline para recibir USDC

**Componente:** `TrustlineManager.tsx`

**Funcionalidades:**
1. Verificar si ya tiene trustline
2. Botón "Crear Trustline para USDC"
3. Usar `stellar-sdk` para crear operación `ChangeTrust`
4. Firmar transacción con Freighter
5. Mostrar costo (0.5 XLM)
6. Feedback visual (loading, éxito, error)

**Código clave:**
```typescript
import StellarSdk from 'stellar-sdk';
import { signTransaction } from '@stellar/freighter-api';

// 1. Crear asset USDC
const usdcAsset = new StellarSdk.Asset(
  'USDC', 
  'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5'
);

// 2. Crear operación ChangeTrust
const changeTrustOp = StellarSdk.Operation.changeTrust({
  asset: usdcAsset,
  limit: '10000' // Máximo USDC que puede recibir
});

// 3. Construir transacción
const transaction = new StellarSdk.TransactionBuilder(account, {
  fee: '100',
  networkPassphrase: StellarSdk.Networks.TESTNET
})
  .addOperation(changeTrustOp)
  .setTimeout(30)
  .build();

// 4. Firmar con Freighter
const signedTx = await signTransaction(transaction.toXDR(), {
  network: 'testnet',
  accountToSign: publicKey
});

// 5. Enviar a la blockchain
await server.submitTransaction(signedTx);
```

---

### **PASO 3: Formulario de Envío de Pagos** ⏱️ 1 hora
**Objetivo:** Enviar XLM o USDC a otra dirección

**Componente:** `PaymentForm.tsx`

**Funcionalidades:**
1. Selector de activo (XLM o USDC)
2. Input para dirección destino
3. Input para cantidad
4. Botón "Enviar Pago"
5. Validaciones:
   - Dirección válida de Stellar
   - Balance suficiente
   - Si es USDC, verificar trustline
6. Firmar y enviar transacción

**Código clave:**
```typescript
// Para XLM (nativo)
const paymentOp = StellarSdk.Operation.payment({
  destination: destinationAddress,
  asset: StellarSdk.Asset.native(), // XLM
  amount: amount
});

// Para USDC
const usdcAsset = new StellarSdk.Asset('USDC', USDC_ISSUER);
const paymentOp = StellarSdk.Operation.payment({
  destination: destinationAddress,
  asset: usdcAsset,
  amount: amount
});
```

---

### **PASO 4: Generar Cuenta de Prueba** ⏱️ 30 min
**Objetivo:** Generar y fondear cuenta en testnet

**Componente:** `GenerateAccount.tsx`

**Funcionalidades:**
1. Botón "Generar Nueva Cuenta"
2. Crear par de claves (público/privado)
3. Mostrar clave privada (con advertencia de seguridad)
4. Mostrar clave pública
5. Botón "Fondear con Friendbot" (Stellar testnet)
6. Copiar al portapapeles

**Código clave:**
```typescript
import StellarSdk from 'stellar-sdk';

// Generar par de claves
const pair = StellarSdk.Keypair.random();
const publicKey = pair.publicKey();
const secretKey = pair.secret();

// Fondear con Friendbot (solo testnet)
const response = await fetch(
  `https://friendbot.stellar.org/?addr=${publicKey}`
);
```

---

### **PASO 5: Historial de Transacciones** ⏱️ 1 hora
**Objetivo:** Mostrar todas las transacciones de la cuenta

**Componente:** `TransactionHistory.tsx`

**Funcionalidades:**
1. Cargar últimas 20 transacciones
2. Tabla con columnas:
   - Fecha/Hora
   - Tipo (Pago, Trustline, etc.)
   - Destino/Origen
   - Cantidad (XLM o USDC)
   - Estado (Éxito/Fallido)
   - Hash (link a Stellar Explorer)
3. Botón "Recargar"
4. Filtrar por tipo de transacción
5. Paginación

**Código clave:**
```typescript
const transactions = await server
  .transactions()
  .forAccount(publicKey)
  .order('desc')
  .limit(20)
  .call();

transactions.records.forEach(tx => {
  // tx.hash - ID de transacción
  // tx.created_at - Fecha
  // tx.operations - Array de operaciones
});
```

---

## 🎨 Diseño Visual

### **Colores Principales:**
- **Fondo:** `slate-900` (oscuro)
- **Acentos:** `cyan-400`, `blue-500`, `purple-600` (gradientes)
- **Éxito:** `emerald-400`
- **Error:** `red-400`
- **Texto:** `white`, `slate-300`, `slate-400`

### **Estilo:**
- Glassmorphism (backdrop-blur)
- Gradientes suaves
- Sombras con color (shadow-cyan-500/25)
- Animaciones sutiles (hover, transitions)

---

## 📋 Orden de Implementación Recomendado

1. **Primero:** Restaurar Balance Component (mostrar XLM y USDC)
2. **Segundo:** Crear Trustline Manager (funcionalidad USDC clave)
3. **Tercero:** Formulario de Pagos (XLM y USDC)
4. **Cuarto:** Generar Cuenta (útil para testing)
5. **Quinto:** Historial (completa la app)

---

## 🔑 Conceptos Importantes

### **Trustline:**
- Stellar requiere "confiar" en un activo antes de recibirlo
- USDC no es nativo, necesita trustline
- Costo: 0.5 XLM (se puede recuperar eliminando trustline)
- Sin trustline = no puedes recibir USDC

### **Horizon Server:**
- API de Stellar para consultar datos
- Testnet: `https://horizon-testnet.stellar.org`
- Permite: consultar balances, transacciones, crear transacciones

### **Firmar Transacciones:**
- Freighter NO envía directamente
- Freighter SOLO firma la transacción
- Tú envías la transacción firmada a Horizon

---

## ✅ Checklist Final

### Funcionalidades Básicas:
- [ ] Conexión Freighter ✅
- [ ] Mostrar dirección ✅
- [ ] Ver balance XLM
- [ ] Ver balance USDC

### Funcionalidades USDC:
- [ ] Crear trustline USDC
- [ ] Detectar si tiene trustline
- [ ] Enviar USDC
- [ ] Recibir USDC (automático si tiene trustline)

### Funcionalidades Adicionales:
- [ ] Generar cuenta prueba
- [ ] Enviar XLM
- [ ] Historial de transacciones
- [ ] Navegación entre secciones

---

## 🚀 Próximo Paso Inmediato

**Crear `Balance.tsx`** con:
- Diseño único (azul/cyan)
- Mostrar XLM
- Detectar y mostrar USDC
- Mensaje si no tiene trustline
- Actualización automática

¿Empezamos con esto?
