"use client"; // Necesario porque usamos hooks y APIs del navegador

import { useState } from "react";
import { isConnected, requestAccess } from "@stellar/freighter-api";
import Balance from "./Balance";
import TrustlineManager from "./TrustlineManager";

export default function WalletConnect() {
  // Estados para manejar la conexión
  const [walletConnected, setWalletConnected] = useState(false);
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      // Paso 2: Verificar si Freighter está instalado
      const connectedResult = await isConnected();
      
      if (connectedResult.error) {
        setError("Freighter no está instalado");
        setIsConnecting(false);
        return;
      }

      // Paso 3: Solicitar acceso
      const accessResult = await requestAccess();
      
      if (accessResult.error) {
        if (accessResult.error.message?.includes("User rejected") || accessResult.error.message?.includes("denied")) {
          setError("Acceso denegado. Por favor, autoriza la conexión en Freighter.");
        } else {
          setError(accessResult.error.message || "Error al solicitar acceso a la wallet");
        }
        setIsConnecting(false);
        return;
      }

      setPublicKey(accessResult.address);
      setWalletConnected(true);
      setIsConnecting(false);
    } catch (err) {
      setError("Error inesperado al conectar la wallet");
      setIsConnecting(false);
      console.error(err);
    }
  };

  const disconnectWallet = async () => {
    try {
      setWalletConnected(false);
      setPublicKey(null);
      setError(null);
      setCopySuccess(false);
    } catch (err) {
      console.error("Error al desconectar:", err);
    }
  };

  const copyToClipboard = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return "";
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Tarjeta principal */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-sm">
              <span className="text-3xl">🌌</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Stellar Wallet
            </h1>
            <p className="text-gray-600 text-sm">
              Conecta tu Freighter Wallet de forma segura
            </p>
          </div>

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <div className="flex items-center">
                <span className="text-red-500 text-xl mr-2">⚠️</span>
                <p className="text-red-700 text-sm font-medium">{error}</p>
              </div>
            </div>
          )}

          {/* Contenido según estado */}
          {!walletConnected ? (
            <div className="space-y-6">
                                {/* Botón de conectar */}
                  <button
                    onClick={connectWallet}
                    disabled={isConnecting}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
                  >
                {isConnecting ? (
                  <>
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Conectando...
                  </>
                ) : (
                  <>
                    <span className="text-xl">🔗</span>
                    Conectar Wallet
                  </>
                )}
              </button>

              {/* Info box */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-4 border border-blue-100 dark:border-blue-800/50">
                <div className="flex items-start gap-3">
                  <span className="text-blue-500 text-xl">💡</span>
                  <div className="text-sm text-blue-800 dark:text-blue-300">
                    <p className="font-semibold mb-1">Asegúrate de tener Freighter instalado</p>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-2">
                      Si no aparece el popup, revoca permisos en Freighter: <span className="font-mono text-xs">Settings → Manage Site Access</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6 transition-all duration-300">
              {/* Estado conectado */}
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
                  <span className="text-2xl">✅</span>
                </div>
                <p className="text-green-600 dark:text-green-400 font-semibold text-lg mb-6">
                  Wallet Conectada
                </p>

                                  {/* Dirección pública */}
                  {publicKey && (
                    <div className="bg-gray-50 rounded-xl p-5 border border-gray-200">
                      <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                        Dirección Pública
                      </p>
                      <div className="flex items-center justify-between gap-3">
                        <code className="text-sm font-mono text-gray-900 break-all flex-1">
                          {publicKey}
                        </code>
                        <button
                          onClick={copyToClipboard}
                          className="flex-shrink-0 p-2 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors duration-200"
                          title="Copiar dirección"
                        >
                          {copySuccess ? (
                            <span className="text-green-600 text-lg">✓</span>
                          ) : (
                            <span className="text-blue-600 text-lg">📋</span>
                          )}
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-2 font-mono">
                        {formatAddress(publicKey)}
                      </p>
                    </div>
                  )}
              </div>

              {/* Componente de Balances */}
              <Balance isConnected={walletConnected} address={publicKey} />

              {/* Trustline Manager */}
              <TrustlineManager 
                address={publicKey} 
                onTrustlineCreated={() => {
                  // Recargar balances después de crear trustline
                  // Esto se manejará automáticamente con el useEffect en Balance
                }}
              />

              {/* Botón desconectar */}
              <button
                onClick={disconnectWallet}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-4 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2"
              >
                <span className="text-xl">🚪</span>
                Desconectar Wallet
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-500 mt-6">
          Conectado de forma segura con Freighter
        </p>
      </div>
    </div>
  );
}
