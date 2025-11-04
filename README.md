# 🦈 SharkWallet

**Navega las aguas cripto con confianza**

SharkWallet es una billetera digital moderna y elegante para gestionar tus activos en la red Stellar. Diseñada con una interfaz intuitiva y un diseño oscuro profesional, te permite enviar, recibir y gestionar XLM y USDC de forma segura y rápida.

## ✨ Características

- 🔐 **Conexión con Freighter**: Integración completa con la extensión Freighter para gestión segura de billeteras
- 💰 **Gestión de Activos**: Visualiza y gestiona tus balances de XLM y USDC
- 📊 **Historial de Transacciones**: Revisa todas tus transacciones Stellar con detalles completos
- 🚀 **Envío de Pagos**: Envía XLM o USDC de forma rápida y segura
- 🔗 **Gestión de Trustlines**: Crea trustlines para recibir activos USDC
- 🎨 **Diseño Moderno**: Interfaz oscura con gradientes vibrantes rosa-naranja
- ⚡ **Transacciones Rápidas**: Las transacciones en Stellar se confirman en 3-5 segundos
- 🧪 **Modo Testnet**: Conectado a Stellar Testnet para pruebas seguras

## 📋 Requisitos Previos

Antes de usar SharkWallet, necesitas:

1. **Navegador web moderno**: Chrome, Firefox, Edge o Safari (últimas versiones)
2. **Extensión Freighter instalada**: 
   - Descarga desde [freighter.app](https://www.freighter.app/)
   - Instala la extensión en tu navegador
   - Crea una nueva billetera o importa una existente

## 🚀 Instalación

### Opción 1: Usar la Versión en Línea (Recomendado)

SharkWallet está disponible en línea en: **https://sharkwallet.netlify.app**

Simplemente abre el enlace en tu navegador y comienza a usarlo.

### Opción 2: Instalación Local

Si prefieres ejecutar SharkWallet en tu computadora:

1. **Clona o descarga el repositorio**
   ```bash
   git clone [URL_DEL_REPOSITORIO]
   cd mi-wallet-app
   ```

2. **Instala las dependencias**
   ```bash
   npm install
   ```

3. **Inicia el servidor de desarrollo**
   ```bash
   npm run dev
   ```

4. **Abre tu navegador**
   - Ve a [http://localhost:3000](http://localhost:3000)
   - ¡Listo! SharkWallet estará funcionando localmente

## 📖 Guía de Uso

### Paso 1: Conectar tu Billetera Freighter

1. Abre SharkWallet en tu navegador
2. Haz clic en el botón **"Conectar Wallet Freighter"**
3. Aparecerá una ventana de Freighter pidiendo permisos
4. Selecciona la cuenta que deseas conectar
5. Autoriza la conexión haciendo clic en **"Conectar"**

✅ **¡Listo!** Tu billetera está conectada. Verás tu dirección Stellar en la parte superior.

### Paso 2: Ver tu Balance

Una vez conectado, verás automáticamente:

- **Balance Total**: La suma de todos tus activos en XLM
- **Tus Activos**: 
  - **XLM (Stellar Lumens)**: Tu balance de XLM nativo
  - **USDC (USD Coin)**: Tu balance de USDC (si tienes trustline)

El balance se actualiza automáticamente cada 30 segundos, o puedes hacer clic en **"Actualizar Balance"** para refrescar manualmente.

### Paso 3: Crear una Trustline para USDC

Para recibir USDC, primero necesitas crear una trustline:

1. Ve a la sección **"Estado"** (si no estás ahí ya)
2. En la sección **"Crear Trustline para USDC"**, lee la información sobre los costos
3. Haz clic en **"Crear Trustline para USDC"**
4. Aparecerá una ventana de Freighter pidiendo que firmes la transacción
5. Revisa los detalles y confirma la firma

⚠️ **Nota**: Crear una trustline tiene un costo de aproximadamente 0.5 XLM (se reserva como garantía) más el fee de transacción (~0.00001 XLM).

✅ Una vez creada la trustline, verás un mensaje de éxito y podrás recibir USDC.

### Paso 4: Generar una Cuenta de Prueba (Testnet)

Si estás en Testnet y necesitas fondos para probar:

1. Ve a la sección **"Generar Cuenta"**
2. Lee la información sobre las cuentas de prueba
3. Haz clic en **"Generar y Fondear Cuenta de Prueba"**
4. Se generará una nueva cuenta con:
   - **Clave Pública**: Tu dirección Stellar (guárdala)
   - **Clave Secreta**: ⚠️ **¡GUÁRDALA DE FORMA SEGURA!** No la compartas nunca
   - **10,000 XLM** de prueba (sin valor real)

💡 **Consejo**: Usa esta función solo en Testnet para pruebas. En Mainnet, nunca compartas tu clave secreta.

### Paso 5: Enviar un Pago

Para enviar XLM o USDC:

1. Ve a la sección **"Enviar Pago"**
2. **Selecciona el activo** que quieres enviar:
   - **XLM**: Para enviar Stellar Lumens
   - **USDC**: Para enviar USD Coin
3. **Ingresa la dirección destino**:
   - Pega la dirección Stellar del destinatario
   - Formato: `G...` seguido de 56 caracteres
4. **Ingresa la cantidad**:
   - Escribe el monto que deseas enviar
   - O usa los botones "25%", "50%", o "MAX" para calcular rápidamente
5. **(Opcional) Agrega un memo**:
   - Descripción del pago (máximo 28 caracteres)
6. **Revisa los detalles**:
   - Verifica la dirección destino
   - Verifica la cantidad
   - Verifica que tengas suficiente balance (incluye el fee)
7. Haz clic en **"Enviar Pago con Freighter"**
8. Aparecerá Freighter pidiendo que firmes la transacción
9. Revisa los detalles y confirma

✅ **¡Listo!** Tu pago se enviará y se confirmará en 3-5 segundos.

### Paso 6: Ver el Historial de Transacciones

Para revisar todas tus transacciones:

1. Ve a la sección **"Historial"**
2. Verás todas tus transacciones ordenadas por fecha (más recientes primero)
3. Cada transacción muestra:
   - **Tipo**: Enviado, Recibido, o Trustline
   - **Fecha y hora**: Cuándo ocurrió la transacción
   - **Dirección**: A quién enviaste o de quién recibiste
   - **Monto**: Cantidad de XLM o USDC
   - **Memo**: Si la transacción tenía un memo
   - **Estado**: Siempre "Completado" para transacciones exitosas
4. Haz clic en **"Ver en Explorer →"** para ver más detalles en Stellar Explorer

💡 El historial se actualiza automáticamente cada 30 segundos, o puedes hacer clic en **"Actualizar"** para refrescar manualmente.

## 🔍 Secciones de la Aplicación

### 📊 Estado

Muestra el estado actual de tu conexión con Freighter:
- ✅ Si Freighter está conectado correctamente
- 📋 Tu dirección Stellar actual (con botón para copiar)
- 🔗 Si tienes trustline de USDC creada
- Formulario para crear trustline de USDC (si no la tienes)

### ✨ Generar Cuenta

Genera nuevas cuentas de prueba en Stellar Testnet:
- Crea una nueva clave pública y privada
- Fondea automáticamente con 10,000 XLM de prueba
- Muestra tus claves de forma segura (¡guárdalas!)

### 💸 Enviar Pago

Interfaz completa para enviar pagos:
- Selector de activo (XLM o USDC)
- Campo para dirección destino
- Campo para cantidad con calculadoras rápidas (25%, 50%, MAX)
- Campo opcional para memo
- Información del balance disponible

### 📜 Historial

Vista completa de todas tus transacciones:
- Lista de todas las operaciones
- Detalles de cada transacción
- Links directos a Stellar Explorer
- Filtrado por tipo (Enviado, Recibido, Trustline)

## 🔐 Seguridad

⚠️ **IMPORTANTE - Lee esto antes de usar:**

1. **Claves Privadas**: Nunca compartas tu clave secreta con nadie. Quien tenga tu clave secreta tiene acceso completo a tu billetera.

2. **Testnet vs Mainnet**: SharkWallet está configurado para **Stellar Testnet** por defecto. Los XLM de prueba no tienen valor real. Para usar Mainnet, necesitarías modificar la configuración (avanzado).

3. **Freighter**: Asegúrate de que estás usando la extensión oficial de Freighter desde [freighter.app](https://www.freighter.app/).

4. **Verifica las Transacciones**: Siempre revisa los detalles de una transacción antes de firmarla en Freighter.

5. **Phishing**: Nunca ingreses tu clave secreta en sitios web. Freighter maneja todas las firmas de forma segura.

## ❓ Solución de Problemas

### "Freighter no está instalado"

**Solución**: 
1. Ve a [freighter.app](https://www.freighter.app/)
2. Instala la extensión oficial
3. Recarga la página de SharkWallet
4. Intenta conectar de nuevo

### "Error al cargar las transacciones"

**Soluciones**:
1. Verifica tu conexión a internet
2. Recarga la página (F5 o Ctrl+R)
3. Intenta hacer clic en "Actualizar" en la sección de Historial
4. Verifica que tu cuenta tenga transacciones en Stellar Explorer

### "No puedo crear la trustline"

**Soluciones**:
1. Verifica que tengas al menos 0.5 XLM disponibles (más el fee)
2. Verifica que no tengas ya una trustline creada (revisa en "Estado")
3. Asegúrate de estar en Testnet
4. Intenta recargar la página y crear de nuevo

### "No puedo enviar un pago"

**Soluciones**:
1. Verifica que tengas suficiente balance (incluye el fee de ~0.00001 XLM)
2. Verifica que la dirección destino sea válida (formato: G... seguido de 56 caracteres)
3. Verifica que Freighter esté desbloqueado
4. Si es USDC, asegúrate de tener una trustline creada

### "Mi balance no se actualiza"

**Soluciones**:
1. Haz clic en "Actualizar Balance" manualmente
2. Espera 30 segundos (se actualiza automáticamente)
3. Recarga la página
4. Verifica tu conexión a internet

### "Las transacciones muestran 0.00 XLM"

**Solución**:
1. Recarga la página con hard refresh (Ctrl+Shift+R o Cmd+Shift+R)
2. Espera unos segundos para que carguen los datos
3. Si persiste, verifica en Stellar Explorer que las transacciones tengan montos reales

## 🌐 Información Técnica

### Tecnologías Utilizadas

- **Next.js 16**: Framework de React para aplicaciones web
- **React 19**: Biblioteca de JavaScript para interfaces de usuario
- **Tailwind CSS**: Framework CSS utilitario
- **Stellar SDK**: SDK oficial de Stellar para interacciones con la blockchain
- **Freighter API**: API de la extensión Freighter para gestión de billeteras

### Redes Soportadas

- ✅ **Stellar Testnet**: Red de pruebas (por defecto)
- ⚠️ **Stellar Mainnet**: Requiere configuración adicional (avanzado)

### Límites y Fees

- **Fee de Transacción**: ~0.00001 XLM (mínimo en Stellar)
- **Trustline Reserve**: 0.5 XLM (se reserva como garantía)
- **Memo Máximo**: 28 caracteres
- **Tiempo de Confirmación**: 3-5 segundos

## 📞 Soporte

Si encuentras algún problema o tienes preguntas:

1. Revisa la sección de **Solución de Problemas** arriba
2. Verifica que estés usando la última versión de Freighter
3. Verifica que tu navegador esté actualizado
4. Revisa los logs en la consola del navegador (F12 → Console)

## 📝 Licencia

Este proyecto es de código abierto y está disponible para uso educativo y de desarrollo.

## 🎨 Créditos

Desarrollado con ❤️ (y 🧡) por una tiburona para la comunidad Stellar.

---

**¡Disfruta navegando las aguas cripto con SharkWallet! 🦈✨**
