"use client";

import { useState, useEffect } from "react";

// Configuración de USDC en testnet
const USDC_ISSUER = "GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5";
const HORIZON_URL = "https://horizon-testnet.stellar.org";

interface BalanceProps {
  isConnected: boolean;
  address: string | null;
  onBalanceUpdate?: (xlm: string, usdc: string) => void;
  refreshTrigger?: number;
}

export default function Balance({ isConnected, address, onBalanceUpdate, refreshTrigger }: BalanceProps) {
  const [xlmBalance, setXlmBalance] = useState<string>("0.00");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [loading, setLoading] = useState(false);
  const [hasUsdcTrustline, setHasUsdcTrustline] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalances = async () => {
    if (!address) {
      setXlmBalance("0.00");
      setUsdcBalance("0.00");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Usar fetch directamente para evitar problemas con StellarSdk.Server
      const response = await fetch(`${HORIZON_URL}/accounts/${address}`);
      if (!response.ok) {
        throw new Error("Error al cargar la cuenta");
      }
      const account = await response.json();

      // Obtener balance de XLM (native)
      const xlm = account.balances?.find((b: any) => b.asset_type === "native");
      const xlmBal = xlm ? parseFloat(xlm.balance).toFixed(2) : "0.00";
      setXlmBalance(xlmBal);

      // Obtener balance de USDC
      const usdc = account.balances?.find(
        (b: any) => b.asset_code === "USDC" && b.asset_issuer === USDC_ISSUER
      );

      if (usdc) {
        const usdcBal = parseFloat(usdc.balance).toFixed(2);
        setUsdcBalance(usdcBal);
        setHasUsdcTrustline(true);
        if (onBalanceUpdate) {
          onBalanceUpdate(xlmBal, usdcBal);
        }
      } else {
        setUsdcBalance("0.00");
        setHasUsdcTrustline(false);
        if (onBalanceUpdate) {
          onBalanceUpdate(xlmBal, "0.00");
        }
      }
    } catch (err: any) {
      console.error("Error fetching balances:", err);
      setError(
        err.message || "Error al obtener los balances. Verifica que la cuenta tenga fondos."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isConnected && address) {
      fetchBalances();
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchBalances, 30000);
      return () => clearInterval(interval);
    }
  }, [isConnected, address, refreshTrigger]);

  if (!isConnected) {
    return (
      <div className="bg-[#2D1B3D] rounded-2xl shadow-lg border border-[#FF4D8D]/20 p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-[#FF4D8D]/20 to-[#FF7A3D]/20 rounded-full flex items-center justify-center">
          <span className="text-3xl">💼</span>
        </div>
        <p className="text-gray-300 font-medium">Conecta tu wallet para ver tu balance</p>
      </div>
    );
  }

  if (loading && xlmBalance === "0.00" && usdcBalance === "0.00") {
    return (
      <div className="bg-[#2D1B3D] rounded-2xl shadow-lg border border-[#FF4D8D]/20 p-8">
        <div className="flex flex-col items-center justify-center">
          <div className="relative w-8 h-8 mb-4">
            <div className="absolute inset-0 border-4 border-[#FF4D8D]/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-[#FF4D8D] rounded-full animate-spin"></div>
          </div>
          <p className="text-gray-300 font-medium">Cargando balances...</p>
        </div>
      </div>
    );
  }

  const totalXlm = parseFloat(xlmBalance);
  const totalUsdc = parseFloat(usdcBalance);

  return (
    <div className="space-y-4 mt-6">
      {/* Tarjeta de Balance Principal */}
      <div className="bg-gradient-to-br from-[#FF4D8D] to-[#FF7A3D] rounded-2xl shadow-lg shadow-[#FF4D8D]/30 border border-[#FF4D8D]/50 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Balance Total</h3>
          <span className="px-3 py-1 bg-white/20 backdrop-blur-sm text-white text-xs font-medium rounded-full border border-white/30">
            TESTNET
          </span>
        </div>
        
        <div className="space-y-2">
          <p className="text-4xl font-bold text-white">{totalXlm.toFixed(2)} XLM</p>
          {totalUsdc > 0 && (
            <p className="text-2xl font-semibold text-white/90">{totalUsdc.toFixed(2)} USDC</p>
          )}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-[#2D1B3D] border border-[#FF4D8D]/50 rounded-xl p-4">
          <p className="text-[#FFB3D1] text-sm text-center">{error}</p>
        </div>
      )}

      {/* Lista de Activos */}
      <div className="bg-[#2D1B3D] rounded-2xl shadow-lg border border-[#FF4D8D]/20 p-6">
        <h4 className="text-sm font-semibold text-white mb-4">Tus Activos</h4>
        
        <div className="space-y-3">
          {/* XLM */}
          <div className="flex justify-between items-center p-4 bg-[#1A1A2E] rounded-xl hover:bg-[#1A1A2E]/80 transition-colors border border-[#FF7A3D]/20">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#FF7A3D] to-[#FFB088] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF7A3D]/30">
                <span className="text-white text-lg">⭐</span>
              </div>
              <div>
                <p className="text-white font-semibold">XLM</p>
                <p className="text-gray-400 text-xs">Stellar Lumens</p>
              </div>
            </div>
            <p className="text-white font-bold text-lg">{xlmBalance}</p>
          </div>

          {/* USDC */}
          {hasUsdcTrustline ? (
            <div className="flex justify-between items-center p-4 bg-[#1A1A2E] rounded-xl hover:bg-[#1A1A2E]/80 transition-colors border border-[#FF4D8D]/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#FF4D8D] to-[#FFB3D1] rounded-lg flex items-center justify-center shadow-lg shadow-[#FF4D8D]/30">
                  <span className="text-white text-lg">💵</span>
                </div>
                <div>
                  <p className="text-white font-semibold">USDC</p>
                  <p className="text-gray-400 text-xs">USD Coin</p>
                </div>
              </div>
              <p className="text-white font-bold text-lg">{usdcBalance}</p>
            </div>
          ) : (
            <div className="p-4 bg-gradient-to-r from-[#FF7A3D]/10 to-[#FF4D8D]/10 border border-[#FF7A3D]/30 rounded-xl">
              <p className="text-[#FFB088] text-sm text-center flex items-center justify-center gap-2">
                <span>💡</span>
                Necesitas crear una trustline para recibir USDC
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Botón actualizar */}
      <button
        onClick={fetchBalances}
        disabled={loading}
        className="w-full bg-[#2D1B3D] hover:bg-[#2D1B3D]/80 text-gray-300 hover:text-white font-medium py-3 px-4 rounded-xl border border-[#FF4D8D]/30 hover:border-[#FF4D8D]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
      >
        {loading ? (
          <>
            <div className="w-4 h-4 border-2 border-[#FF4D8D]/30 border-t-[#FF4D8D] rounded-full animate-spin"></div>
            <span>Actualizando...</span>
          </>
        ) : (
          <>
            <span>🔄</span>
            <span>Actualizar Balance</span>
          </>
        )}
      </button>

      {/* Info de red */}
      <div className="bg-[#2D1B3D] border border-[#FF7A3D]/30 rounded-xl p-3">
        <p className="text-[#FFB088] text-xs font-medium text-center mb-1 flex items-center justify-center gap-1">
          <span>🔗</span>
          Conectado a TESTNET
        </p>
        <p className="text-gray-400 text-xs text-center">
          Todas las transacciones son con XLM de prueba.
        </p>
      </div>
    </div>
  );
}
