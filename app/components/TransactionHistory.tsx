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
    if (!address) {
      console.log("TransactionHistory: No address provided");
      return;
    }

    console.log("TransactionHistory: Fetching transactions for address:", address);
    setLoading(true);
    setError(null);

    try {
      const url = `${HORIZON_URL}/accounts/${address}/operations?order=desc&limit=20&include_failed=false`;
      console.log("TransactionHistory: Fetching from URL:", url);
      
      // Obtener operaciones directamente (más eficiente y confiable)
      // Incluir solo operaciones exitosas y de tipo payment, create_account, account_merge, change_trust
      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("TransactionHistory: Fetch failed:", response.status, errorText);
        throw new Error("Error al cargar las transacciones");
      }

      const data = await response.json();
      
      console.log("TransactionHistory: Operations data from API:", data);
      console.log("TransactionHistory: Records count:", data._embedded?.records?.length);
      
      // Procesar operaciones
      const processedTx: Transaction[] = data._embedded.records.map((op: any) => {
        // Determinar tipo y cantidad según el tipo de operación
        let amount = "0";
        let type = "unknown";
        let from = address;
        let to = address;
        let asset_code = "XLM";
        let asset_issuer;

        if (op.type === "payment") {
          // Asegurarse de capturar el amount correctamente
          // La API siempre devuelve amount como string en formato "100.0000000"
          amount = op.amount || "0";
          
          // asset_type: "native" significa XLM
          if (op.asset_type === "native") {
            asset_code = "XLM";
            asset_issuer = undefined;
          } else {
            asset_code = op.asset_code || "XLM";
            asset_issuer = op.asset_issuer;
          }
          from = op.from || address;
          to = op.to || address;
          type = op.to === address ? "received" : "sent";
        } else if (op.type === "create_account") {
          amount = op.starting_balance || "0";
          type = "received"; // La cuenta recibió fondos iniciales
          from = op.funder || "";
          to = address;
        } else if (op.type === "account_merge") {
          amount = op.amount || "0";
          type = "received"; // La cuenta recibió los fondos
          from = op.account || "";
          to = address;
                } else if (op.type === "change_trust") {
          type = "trustline";
          amount = "0";
        }
        
                // Intentar obtener el memo de la operación o usar vacío
        let memo = "";
        if (op.memo) {
          memo = typeof op.memo === 'string' ? op.memo : op.memo || "";
        } else if (op.memo_type && op.memo) {
          memo = op.memo;
        }
        
        const transaction = {
          id: op.id || op.transaction_hash,
          hash: op.transaction_hash || "",
          created_at: op.created_at,
          type: type,
          amount: amount, // El amount ya está asignado correctamente arriba
          asset_code: asset_code,
          asset_issuer: asset_issuer,
          from: from,
          to: to,
          memo: memo,
        };
        
        return transaction;
      });

      console.log("All processed transactions:", processedTx);
      
      // Verificar amounts de transacciones de pago
      const paymentTxs = processedTx.filter(tx => tx.type === "payment" || tx.type === "sent" || tx.type === "received");
      if (paymentTxs.length > 0) {
        console.log("Payment transactions amounts:", paymentTxs.map(tx => ({
          hash: tx.hash.substring(0, 10),
          type: tx.type,
          amount: tx.amount,
          asset: tx.asset_code
        })));
      }
      
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
                          {tx.amount && parseFloat(tx.amount) > 0 
                            ? parseFloat(tx.amount).toFixed(2) 
                            : parseFloat(tx.amount || "0").toFixed(2)} {tx.asset_code || "XLM"}
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
