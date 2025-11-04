"use client";

import { useState } from "react";
import * as Freighter from "@stellar/freighter-api";

interface WalletButtonProps {
  isConnected: boolean;
  address: string | null;
  setIsConnected: (value: boolean) => void;
  setAddress: (value: string | null) => void;
}

export default function WalletButton({
  isConnected,
  address,
  setIsConnected,
  setAddress,
}: WalletButtonProps) {
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const connectWallet = async () => {
    try {
      setIsConnecting(true);
      setError(null);

      const connectedResult = await Freighter.isConnected();
      
      if (connectedResult.error) {
        setError("Freighter no está instalado");
        setIsConnecting(false);
        return;
      }

      const accessResult = await Freighter.requestAccess();
      
      if (accessResult.error) {
        if (accessResult.error.message?.includes("User rejected") || accessResult.error.message?.includes("denied")) {
          setError("Acceso denegado. Por favor, autoriza la conexión en Freighter.");
        } else {
          setError(accessResult.error.message || "Error al solicitar acceso a la wallet");
        }
        setIsConnecting(false);
        return;
      }

      setAddress(accessResult.address);
      setIsConnected(true);
      setIsConnecting(false);
    } catch (err) {
      setError("Error inesperado al conectar la wallet");
      setIsConnecting(false);
      console.error(err);
    }
  };

  if (isConnected) {
    return null;
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <button
        onClick={connectWallet}
        disabled={isConnecting}
        className="w-full max-w-md bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] hover:from-[#FF3D7D] hover:to-[#FF6A2D] disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-bold py-4 px-8 rounded-xl shadow-lg shadow-[#FF4D8D]/50 transition-all duration-200 flex items-center justify-center gap-3 text-lg"
      >
        {isConnecting ? (
          <>
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Conectando...
          </>
        ) : (
          <>
            <span className="text-xl">⚡</span>
            Conectar Wallet Freighter
          </>
        )}
      </button>

      {error && (
        <div className="mt-4 p-4 bg-[#2D1B3D] border border-[#FF4D8D]/50 rounded-xl">
          <p className="text-[#FFB3D1] text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
