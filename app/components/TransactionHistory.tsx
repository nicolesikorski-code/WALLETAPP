"use client";

import { useState, useEffect } from "react";

const HORIZON_URL = "https://horizon-testnet.stellar.org";

interface TransactionHistoryProps {
  address: string | null;
}

interface Transaction {
  id: string;
  hash: string;
  created_at: string;
  type: string;
  amount: string;
  asset_code?: string;
  asset_issuer?: string;
  from: string;
  to: string;
  memo?: string;
}

export default function TransactionHistory({ address }: TransactionHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = async () => {
    if (!address) return;

    setLoading(true);
    setError(null);

    try {
      // Obtener transacciones desde Horizon
      const response = await fetch(
        `${HORIZON_URL}/accounts/${address}/transactions?order=desc&limit=20`
      );

      if (!response.ok) {
        throw new Error("Error al cargar las transacciones");
      }

      const data = await response.json();
      
      // Procesar transacciones
      const processedTx: Transaction[] = data._embedded.records.map((tx: any) => {
        // Buscar operación de pago
        const paymentOp = tx.operations?._embedded?.records?.find(
          (op: any) => op.type === "payment"
        );

        if (!paymentOp) {
          // Si no es pago, usar la primera operación
          const firstOp = tx.operations?._embedded?.records?.[0];
          return {
            id: tx.id,
            hash: tx.hash,
            created_at: tx.created_at,
            type: firstOp?.type || "unknown",
            amount: "0",
            from: address,
            to: firstOp?.to || "",
            memo: tx.memo || "",
          };
        }

        // Determinar dirección origen y destino
        const isReceived = paymentOp.to === address;
        
        return {
          id: tx.id,
          hash: tx.hash,
          created_at: tx.created_at,
          type: isReceived ? "received" : "sent",
          amount: paymentOp.amount,
          asset_code: paymentOp.asset_code || "XLM",
          asset_issuer: paymentOp.asset_issuer,
          from: paymentOp.from || address,
          to: paymentOp.to,
          memo: tx.memo || "",
        };
      });

      setTransactions(processedTx);
    } catch (err: any) {
      console.error("Error fetching transactions:", err);
      setError(err.message || "Error al cargar el historial de transacciones");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (address) {
      fetchTransactions();
      // Actualizar cada 30 segundos
      const interval = setInterval(fetchTransactions, 30000);
      return () => clearInterval(interval);
    }
  }, [address]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 8)}...${addr.slice(-8)}`;
  };

  const getExplorerLink = (hash: string) => {
    return `https://stellar.expert/explorer/testnet/tx/${hash}`;
  };

  if (!address) {
    return null;
  }

  return (
    <div className="bg-[#2D1B3D] rounded-2xl shadow-sm border border-[#FF4D8D]/30 p-8">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] rounded-xl mr-4 shadow-sm">
            <span className="text-2xl">📜</span>
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-white">Historial de Transacciones</h2>
            <p className="text-white/70">Revisa todas tus transacciones Stellar</p>
          </div>
        </div>
        <button
          onClick={fetchTransactions}
          disabled={loading}
          className="px-4 py-2 bg-[#2D1B3D] hover:bg-[#1A1A2E] text-white rounded-lg font-medium text-sm transition-all disabled:opacity-50"
        >
          {loading ? "Actualizando..." : "Actualizar"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-6 bg-[#FF7A85]/10 border border-[#FF7A85] rounded-xl p-4">
          <p className="text-[#FF7A85] text-sm">{error}</p>
        </div>
      )}

      {/* Loading */}
      {loading && transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-2 border-[#FF4D8D]/30 border-t-[#7263E8] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-sm">Cargando transacciones...</p>
        </div>
      )}

      {/* Transacciones */}
      {!loading && transactions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-white/70 text-sm">No hay transacciones para mostrar</p>
        </div>
      )}

      {transactions.length > 0 && (
        <>
          <div className="mb-4">
            <p className="text-white/80 text-sm">
              {transactions.length} transacción{transactions.length !== 1 ? "es" : ""} encontrada{transactions.length !== 1 ? "s" : ""} para la cuenta{" "}
              <span className="font-mono text-xs">{formatAddress(address)}</span>
            </p>
          </div>

          <div className="space-y-3">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="border border-[#FF4D8D]/30 rounded-xl p-4 hover:border-[#7263E8] hover:shadow-sm transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          tx.type === "sent"
                            ? "bg-gradient-to-r from-[#FF4D8D]/20 to-[#FF7A3D]/20 text-[#FFB3D1]"
                            : tx.type === "received"
                            ? "bg-gradient-to-r from-[#FF7A3D]/20 to-[#FF4D8D]/20 text-[#FFB088]"
                            : "bg-[#2D1B3D] text-white"
                        }`}
                      >
                        {tx.type === "sent" ? "Enviado" : tx.type === "received" ? "Recibido" : tx.type}
                      </span>
                      <span className="text-white/70 text-xs">{formatDate(tx.created_at)}</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-white/80 text-sm">
                          {tx.type === "sent" ? "A:" : "De:"}
                        </span>
                        <code className="text-[#FFB3D1] font-mono text-xs">
                          {formatAddress(tx.type === "sent" ? tx.to : tx.from)}
                        </code>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">
                          {tx.type === "sent" ? "-" : "+"}
                          {parseFloat(tx.amount).toFixed(2)} {tx.asset_code || "XLM"}
                        </span>
                      </div>

                      {tx.memo && (
                        <p className="text-white/70 text-xs italic">Memo: {tx.memo}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2">
                    <span className="text-xs text-[#9CA3AF]">Completado</span>
                    <a
                      href={getExplorerLink(tx.hash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[#FFB3D1] hover:text-[#5A4DD4] text-xs font-medium"
                    >
                      Ver en Explorer →
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-center">
            <p className="text-[#9CA3AF] text-xs">Actualizado cada 30 segundos</p>
          </div>
        </>
      )}
    </div>
  );
}
