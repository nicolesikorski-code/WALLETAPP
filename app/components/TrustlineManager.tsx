"use client";

import { useState, useEffect } from "react";
import { signTransaction } from "@stellar/freighter-api";

// Configuración de USDC en testnet
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const HORIZON_URL = "https://horizon-testnet.stellar.org";

interface TrustlineManagerProps {
  address: string | null;
  onTrustlineCreated?: () => void;
}

export default function TrustlineManager({ address, onTrustlineCreated }: TrustlineManagerProps) {
  const [hasTrustline, setHasTrustline] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [checking, setChecking] = useState(false);

  // Verificar si ya tiene trustline
  const checkTrustline = async () => {
    if (!address) return;

    setChecking(true);
    try {
      // Usar fetch directamente para evitar problemas con StellarSdk
      const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!response.ok) throw new Error("Error al verificar cuenta");
      const accountData = await response.json();

      const usdc = accountData.balances?.find(
        (b: any) => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER
      );

      setHasTrustline(!!usdc);
    } catch (err) {
      console.error("Error checking trustline:", err);
    } finally {
      setChecking(false);
    }
  };

  useEffect(() => {
    if (address) {
      checkTrustline();
    }
  }, [address]);

  const createTrustline = async () => {
    if (!address) {
      setError("No hay dirección de wallet conectada");
      return;
    }

    setIsCreating(true);
    setError(null);
    setSuccess(false);

    try {
      // Importar StellarSdk dinámicamente
      let StellarSdk: any;
      try {
        const StellarSdkModule = await import("stellar-sdk");
        StellarSdk = StellarSdkModule.default || StellarSdkModule;
      } catch (importError) {
        console.error("Error al importar stellar-sdk:", importError);
        throw new Error("No se pudo cargar stellar-sdk. Asegúrate de que está instalado correctamente.");
      }

      // Verificar que StellarSdk tiene las propiedades necesarias
      if (!StellarSdk) {
        throw new Error("StellarSdk no se cargó correctamente");
      }

      // 1. Obtener datos de la cuenta usando fetch
      const accountResponse = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!accountResponse.ok) throw new Error("Error al cargar la cuenta");
      const accountData = await accountResponse.json();

      // 2. Crear servidor y cargar cuenta
      // Intentar diferentes formas de acceder a Server
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

      // 3. Crear el asset USDC
      let Asset = StellarSdk.Asset;
      if (!Asset && StellarSdk.default) Asset = StellarSdk.default.Asset;
      if (!Asset || typeof Asset !== 'function') {
        throw new Error("StellarSdk.Asset no está disponible");
      }
      const usdcAsset = new Asset("USDC", USDC_ISSUER);

      // 4. Crear la operación ChangeTrust
      let Operation = StellarSdk.Operation;
      if (!Operation && StellarSdk.default) Operation = StellarSdk.default.Operation;
      if (!Operation || !Operation.changeTrust) {
        throw new Error("StellarSdk.Operation.changeTrust no está disponible");
      }
      const changeTrustOp = Operation.changeTrust({
        asset: usdcAsset,
        limit: "10000", // Límite máximo de USDC que puede recibir
      });

      // 5. Construir la transacción
      let TransactionBuilder = StellarSdk.TransactionBuilder;
      let Networks = StellarSdk.Networks;
      if (!TransactionBuilder && StellarSdk.default) {
        TransactionBuilder = StellarSdk.default.TransactionBuilder;
        Networks = StellarSdk.default.Networks;
      }
      if (!TransactionBuilder || !Networks) {
        throw new Error("StellarSdk.TransactionBuilder o Networks no están disponibles");
      }
      const transaction = new TransactionBuilder(account, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(changeTrustOp)
        .setTimeout(30)
        .build();

      // 6. Pedir a Freighter que firme la transacción
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
      
      console.log("XDR original length:", signedTxXDR.length);
      console.log("XDR limpio length:", cleanXDR.length);
      console.log("XDR preview:", cleanXDR.substring(0, 50) + "...");
      console.log("XDR completo (primeros 100 chars):", cleanXDR.substring(0, 100));

      // 7. Enviar la transacción firmada a la blockchain usando fetch directamente
      // Horizon espera el XDR codificado en base64 en el campo 'tx'
      // Codificar solo los caracteres especiales necesarios (mantener +, /, = de base64)
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
          console.error("Error de Horizon completo:", errorData);
          
          // Si hay un envelope_xdr en los extras, mostrarlo para debug
          if (errorData.extras?.envelope_xdr) {
            console.error("Envelope XDR recibido por Horizon:", errorData.extras.envelope_xdr.substring(0, 100));
            console.error("Nuestro XDR enviado:", cleanXDR.substring(0, 100));
          }
          
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

      console.log("Trustline creada exitosamente:", result);
      setSuccess(true);
      setHasTrustline(true);

      // Llamar callback si existe
      if (onTrustlineCreated) {
        onTrustlineCreated();
      }

      // Limpiar mensaje de éxito después de 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
    } catch (err: any) {
      console.error("Error creating trustline:", err);
      
      // Manejar errores específicos
      if (err.message?.includes("User rejected")) {
        setError("Transacción cancelada por el usuario");
      } else if (err.message?.includes("insufficient")) {
        setError("No tienes suficiente XLM. Necesitas al menos 0.5 XLM para crear la trustline.");
      } else {
        setError(err.message || "Error al crear la trustline. Intenta de nuevo.");
      }
    } finally {
      setIsCreating(false);
    }
  };

  if (!address) {
    return null;
  }

        if (checking) {
        return (
          <div className="bg-[#2D1B3D] rounded-2xl shadow-sm border border-[#3D2B4D]/30 p-6">
            <div className="flex items-center justify-center">
              <div className="w-5 h-5 border-2 border-[#3D2B4D]/30 border-t-[#FFB3D1] rounded-full animate-spin mr-3"></div>
              <p className="text-white text-sm">Verificando trustline...</p>
            </div>
          </div>
        );
      }

      if (hasTrustline) {
        return (
          <div className="bg-gradient-to-r from-[#FF4D8D]/10 to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] rounded-full flex items-center justify-center">
                <span className="text-white text-xl">✓</span>
              </div>
              <div>
                <p className="text-white font-semibold">Trustline de USDC creada</p>
                <p className="text-white/80 text-sm">Ya puedes recibir USDC en tu wallet</p>
              </div>
            </div>
          </div>
        );
      }

        return (
        <div className="bg-[#2D1B3D] rounded-2xl shadow-sm border border-[#3D2B4D]/30 p-6 space-y-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Crear Trustline para USDC</h3>
            <p className="text-white/80 text-sm mb-4">
              Para recibir USDC en Stellar, necesitas crear una trustline. Esto tiene un costo de aproximadamente 0.5 XLM (se reserva como garantía).
            </p>
          </div>

          {/* Información sobre el costo */}
          <div className="bg-gradient-to-r from-[#FF4D8D]/10 to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <span className="text-[#FFB3D1] text-xl">ℹ️</span>
              <div className="flex-1">
                <p className="text-white font-medium text-sm mb-1">Costo de la operación</p>
                <p className="text-white/80 text-xs">
                  • Fee de transacción: ~0.00001 XLM<br />
                  • Base reserve para trustline: 0.5 XLM<br />
                  • El reserve se puede recuperar eliminando la trustline en el futuro
                </p>
              </div>
            </div>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="bg-[#FF7A85]/10 border border-[#FF7A85] rounded-xl p-4">
              <p className="text-[#FF7A85] text-sm">{error}</p>
            </div>
          )}

          {/* Mensaje de éxito */}
          {success && (
            <div className="bg-gradient-to-r from-[#FF4D8D]/10 to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-xl p-4">
              <p className="text-white text-sm font-medium">
                ¡Trustline creada exitosamente! Ya puedes recibir USDC.
              </p>
            </div>
          )}

          {/* Botón crear trustline */}
          <button
            onClick={createTrustline}
            disabled={isCreating || success}
            className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] hover:from-[#FF3D7D] hover:to-[#FF6A2D] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D8D]/30"
          >
        {isCreating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Creando trustline...</span>
          </>
        ) : success ? (
          <>
            <span className="text-xl">✓</span>
            <span>Trustline Creada</span>
          </>
        ) : (
          <>
            <span className="text-xl">��</span>
            <span>Crear Trustline para USDC</span>
          </>
        )}
      </button>
    </div>
  );
}
