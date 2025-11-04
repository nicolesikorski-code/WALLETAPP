"use client";

import { useState, useEffect } from "react";
import { signTransaction } from "@stellar/freighter-api";

const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const HORIZON_URL = "https://horizon-testnet.stellar.org";

interface PaymentFormProps {
  address: string | null;
  xlmBalance: string;
  usdcBalance: string;
  onPaymentSent?: () => void;
}

export default function PaymentForm({ address, xlmBalance, usdcBalance, onPaymentSent }: PaymentFormProps) {
  const [assetType, setAssetType] = useState<"XLM" | "USDC">("XLM");
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [memo, setMemo] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Calcular balance disponible
  const availableBalance = assetType === "XLM" ? parseFloat(xlmBalance) : parseFloat(usdcBalance);
  const maxAvailable = assetType === "XLM" 
    ? (availableBalance - 0.00001).toFixed(7) // Fee mínimo
    : availableBalance.toFixed(2);

  const sendPayment = async () => {
    if (!address) {
      setError("No hay dirección de wallet conectada");
      return;
    }

    if (!destination || !amount) {
      setError("Por favor completa todos los campos");
      return;
    }

    setIsSending(true);
    setError(null);
    setSuccess(false);

    try {
      // Importar StellarSdk dinámicamente
      let StellarSdk: any;
      try {
        const StellarSdkModule = await import("stellar-sdk");
        StellarSdk = StellarSdkModule.default || StellarSdkModule;
        
        // Si es un objeto vacío o no tiene las propiedades, intentar otra forma
        if (!StellarSdk || (typeof StellarSdk === 'object' && Object.keys(StellarSdk).length === 0)) {
          // Intentar importación alternativa
          const altImport = await import("stellar-sdk/lib/index");
          StellarSdk = altImport.default || altImport;
        }
      } catch (importError) {
        console.error("Error al importar stellar-sdk:", importError);
        throw new Error("No se pudo cargar stellar-sdk. Asegúrate de que está instalado correctamente.");
      }

      // Verificar que StellarSdk tiene las propiedades necesarias
      if (!StellarSdk) {
        throw new Error("StellarSdk no se cargó correctamente");
      }

      // Validar dirección Stellar
      let StrKey = StellarSdk.StrKey;
      if (!StrKey && StellarSdk.default) StrKey = StellarSdk.default.StrKey;
      if (!StrKey || !StrKey.isValidEd25519PublicKey) {
        throw new Error("StellarSdk.StrKey no está disponible");
      }
      if (!StrKey.isValidEd25519PublicKey(destination)) {
        setError("Dirección de destino inválida");
        setIsSending(false);
        return;
      }

      const amountNum = parseFloat(amount);
      if (isNaN(amountNum) || amountNum <= 0) {
        setError("Cantidad inválida");
        setIsSending(false);
        return;
      }

      if (amountNum > availableBalance) {
        setError(`Balance insuficiente. Disponible: ${maxAvailable} ${assetType}`);
        setIsSending(false);
        return;
      }

      // 1. Obtener datos de la cuenta
      const accountResponse = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!accountResponse.ok) throw new Error("Error al cargar la cuenta");
      
      // 2. Crear servidor y cargar cuenta
      let Server = StellarSdk.Server;
      if (!Server && StellarSdk.default) {
        Server = StellarSdk.default.Server;
      }
      if (!Server && (StellarSdk as any).Horizon) {
        Server = (StellarSdk as any).Horizon.Server;
      }
      
      if (!Server || typeof Server !== 'function') {
        console.error("StellarSdk estructura:", Object.keys(StellarSdk || {}));
        throw new Error("StellarSdk.Server no está disponible. La estructura del módulo puede ser diferente.");
      }
      const server = new Server(HORIZON_URL);
      const account = await server.loadAccount(address);

      // 3. Crear asset
      let Asset = StellarSdk.Asset;
      if (!Asset && StellarSdk.default) Asset = StellarSdk.default.Asset;
      if (!Asset || typeof Asset !== 'function') {
        throw new Error("StellarSdk.Asset no está disponible");
      }
      const asset = assetType === "XLM" 
        ? Asset.native()
        : new Asset("USDC", USDC_ISSUER);

      // 4. Crear operación de pago
      let Operation = StellarSdk.Operation;
      if (!Operation && StellarSdk.default) Operation = StellarSdk.default.Operation;
      if (!Operation || !Operation.payment) {
        throw new Error("StellarSdk.Operation.payment no está disponible");
      }
      const paymentOp = Operation.payment({
        destination: destination,
        asset: asset,
        amount: amountNum.toFixed(7),
      });

      // 5. Construir transacción
      let TransactionBuilder = StellarSdk.TransactionBuilder;
      let Networks = StellarSdk.Networks;
      let Memo = StellarSdk.Memo;
      if (!TransactionBuilder && StellarSdk.default) {
        TransactionBuilder = StellarSdk.default.TransactionBuilder;
        Networks = StellarSdk.default.Networks;
        Memo = StellarSdk.default.Memo;
      }
      if (!TransactionBuilder || !Networks) {
        throw new Error("StellarSdk.TransactionBuilder o Networks no están disponibles");
      }

      let transaction = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(paymentOp);

      // Agregar memo si existe
      if (memo.trim() && Memo && Memo.text) {
        transaction = transaction.addMemo(Memo.text(memo.trim().substring(0, 28)));
      }

      transaction = transaction.setTimeout(30).build();

      // 6. Firmar con Freighter
      // signTransaction devuelve: { signedTxXdr: string, signerAddress: string, error?: FreighterApiError }
      const signResult = await signTransaction(transaction.toXDR(), {
        networkPassphrase: Networks.TESTNET,
        address: address,
      });

      // Verificar si hay un error
      if (signResult.error) {
        const errorMsg = signResult.error.message || String(signResult.error);
        if (errorMsg?.includes("User rejected") || errorMsg?.includes("denied") || errorMsg?.includes("cancelled")) {
          throw new Error("Firma cancelada por el usuario");
        }
        throw new Error(errorMsg || "Error al firmar la transacción con Freighter");
      }

      // Extraer el XDR firmado
      if (!signResult.signedTxXdr) {
        console.error("signTransaction no devolvió signedTxXdr:", signResult);
        throw new Error("No se recibió el XDR firmado de Freighter");
      }

      const signedTxXDR = signResult.signedTxXdr;

      // Limpiar el XDR: eliminar espacios, saltos de línea y asegurarse de que esté en base64
      const cleanXDR = String(signedTxXDR).trim().replace(/\s/g, '');

      // 7. Enviar transacción usando fetch directamente
      // Horizon espera el XDR codificado en base64 en el campo 'tx'
      // Codificar solo los caracteres especiales necesarios
      const encodedXDR = encodeURIComponent(cleanXDR);

      const submitResponse = await fetch(`${HORIZON_URL}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `tx=${encodedXDR}`,
      });

      if (!submitResponse.ok) {
        let errorMessage = "Error al enviar la transacción";
        try {
          const errorData = await submitResponse.json();
          console.error("Error de Horizon:", errorData);
          
          // Intentar obtener un mensaje de error más descriptivo
          if (errorData.extras?.result_codes) {
            const codes = errorData.extras.result_codes;
            if (codes.transaction) {
              errorMessage = `Error en la transacción: ${codes.transaction}`;
            }
            if (codes.operations && codes.operations.length > 0) {
              errorMessage += `. Operación: ${codes.operations[0]}`;
            }
          } else if (errorData.detail) {
            errorMessage = errorData.detail;
          } else if (errorData.type) {
            errorMessage = `${errorData.type}: ${errorData.title || errorMessage}`;
          }
        } catch (e) {
          // Si no se puede parsear el JSON, usar el texto de la respuesta
          const text = await submitResponse.text();
          console.error("Error response text:", text);
          errorMessage = `Error HTTP ${submitResponse.status}: ${text.substring(0, 200)}`;
        }
        throw new Error(errorMessage);
      }

      const result = await submitResponse.json();

      console.log("Pago enviado exitosamente:", result);
      setSuccess(true);
      setDestination("");
      setAmount("");
      setMemo("");

      if (onPaymentSent) {
        onPaymentSent();
      }

      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error sending payment:", err);
      
      if (err.message?.includes("User rejected")) {
        setError("Transacción cancelada por el usuario");
      } else if (err.message?.includes("insufficient")) {
        setError("Balance insuficiente para realizar esta transacción");
      } else {
        setError(err.message || "Error al enviar el pago. Intenta de nuevo.");
      }
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="bg-[#2D1B3D] rounded-2xl shadow-sm border border-[#FF4D8D]/30 p-8">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] rounded-xl mr-4 shadow-sm">
          <span className="text-2xl">💸</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Enviar Pago</h2>
          <p className="text-white/70">Transfiere XLM o USDC de forma segura y rápida</p>
        </div>
      </div>

      {/* Selector de activo */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-white mb-2">Activo</label>
        <div className="flex gap-2">
          <button
            onClick={() => setAssetType("XLM")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              assetType === "XLM"
                ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] text-white shadow-lg shadow-[#FF4D8D]/30"
                : "bg-[#2D1B3D] text-gray-300 hover:bg-[#1A1A2E] border border-[#FF4D8D]/20"
            }`}
          >
            XLM
          </button>
          <button
            onClick={() => setAssetType("USDC")}
            className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
              assetType === "USDC"
                ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] text-white shadow-lg shadow-[#FF4D8D]/30"
                : "bg-[#2D1B3D] text-gray-300 hover:bg-[#1A1A2E] border border-[#FF4D8D]/20"
            }`}
          >
            USDC
          </button>
        </div>
      </div>

      {/* Balance disponible */}
      <div className="mb-6 p-4 bg-[#2D1B3D] border border-[#FF4D8D]/30 rounded-xl">
        <div className="flex items-center justify-between">
          <span className="text-gray-300 text-sm font-medium">Balance Disponible</span>
          <span className="text-white font-bold text-lg">{availableBalance.toFixed(2)} {assetType}</span>
        </div>
      </div>

      {/* Formulario */}
      <div className="space-y-4">
        {/* Dirección destino */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Dirección Destino</label>
          <input
            type="text"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
            placeholder="G..."
            className="w-full px-4 py-3 bg-[#1A1A2E] text-white placeholder-gray-500 border border-[#FF4D8D]/30 rounded-xl focus:ring-2 focus:ring-[#FF4D8D] focus:border-[#FF4D8D] outline-none"
          />
        </div>

        {/* Cantidad */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Cantidad {assetType}</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.0"
            step="0.0000001"
            max={maxAvailable}
            className="w-full px-4 py-3 bg-[#1A1A2E] text-white placeholder-gray-500 border border-[#FF4D8D]/30 rounded-xl focus:ring-2 focus:ring-[#FF4D8D] focus:border-[#FF4D8D] outline-none"
          />
          <p className="text-white/70 text-xs mt-1">
            Máximo disponible: {maxAvailable} {assetType} {assetType === "XLM" && "(incluye fee)"}
          </p>
        </div>

        {/* Memo */}
        <div>
          <label className="block text-sm font-medium text-white mb-2">Memo (Opcional)</label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value.substring(0, 28))}
            placeholder="Descripción del pago..."
            maxLength={28}
            className="w-full px-4 py-3 bg-[#1A1A2E] text-white placeholder-gray-500 border border-[#FF4D8D]/30 rounded-xl focus:ring-2 focus:ring-[#FF4D8D] focus:border-[#FF4D8D] outline-none"
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mt-6 bg-[#2D1B3D] border border-[#FF4D8D]/50 border border-[#FF7A85] rounded-xl p-4">
          <p className="text-[#FFB3D1] text-sm">{error}</p>
        </div>
      )}

      {/* Éxito */}
      {success && (
        <div className="mt-6 bg-[#A8E063]/10 border border-[#A8E063]/50 rounded-xl p-4">
          <p className="text-white text-sm font-medium">
            ¡Pago enviado exitosamente!
          </p>
        </div>
      )}

      {/* Botón enviar */}
      <button
        onClick={sendPayment}
        disabled={isSending || !destination || !amount}
        className="w-full mt-6 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] hover:from-[#FF3D7D] hover:to-[#FF6A2D] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
      >
        {isSending ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Enviando pago...</span>
          </>
        ) : (
          <>
            <span className="text-xl">🚀</span>
            <span>Enviar Pago con Freighter</span>
          </>
        )}
      </button>
    </div>
  );
}
