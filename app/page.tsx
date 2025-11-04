"use client";

import { useState } from "react";
import Navbar from "./components/Navbar";
import WalletButton from "./components/WalletButton";
import Balance from "./components/Balance";
import TrustlineManager from "./components/TrustlineManager";
import GenerateAccount from "./components/GenerateAccount";
import PaymentForm from "./components/PaymentForm";
import TransactionHistory from "./components/TransactionHistory";

export default function Home() {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>("estado");
  const [xlmBalance, setXlmBalance] = useState<string>("0.00");
  const [usdcBalance, setUsdcBalance] = useState<string>("0.00");
  const [refreshBalance, setRefreshBalance] = useState(0);

  const handleLogout = () => {
    setIsConnected(false);
    setAddress(null);
    setXlmBalance("0.00");
    setUsdcBalance("0.00");
  };

  const handleBalanceUpdate = (xlm: string, usdc: string) => {
    setXlmBalance(xlm);
    setUsdcBalance(usdc);
  };

  const handlePaymentSent = () => {
    setRefreshBalance(prev => prev + 1);
  };

  return (
    <div className="min-h-screen bg-[#1A1A2E]">
      {/* Navbar */}
      <Navbar
        isConnected={isConnected}
        onLogout={handleLogout}
        onSelect={setActiveSection}
        activeSection={activeSection}
      />

      {/* Contenido principal */}
      <main className="container mx-auto px-4 py-8">
        {!isConnected || !address ? (
          // Pantalla de bienvenida cuando no está conectado
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="mb-12">
              <div className="flex items-center justify-center w-32 h-32 md:w-40 md:h-40 mx-auto mb-6">
                <div className="w-full h-full bg-gradient-to-br from-[#FF4D8D] to-[#FF7A3D] rounded-3xl flex items-center justify-center shadow-lg shadow-[#FF4D8D]/50">
                  <span className="text-6xl">🦈</span>
                </div>
              </div>
            </div>

            <h2 className="text-5xl font-bold mb-4 text-white">
              Bienvenido a{" "}
              <span className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] bg-clip-text text-transparent">
                SharkWallet
              </span>
            </h2>

            <p className="text-gray-300 mb-10 text-lg max-w-md mx-auto">
              Gestiona tus activos Stellar de forma segura, rápida y moderna. 
              Navega las aguas cripto con la fuerza de un tiburón.
            </p>

            <WalletButton
              isConnected={isConnected}
              address={address}
              setIsConnected={setIsConnected}
              setAddress={setAddress}
            />

            <div className="mt-12 bg-[#2D1B3D] rounded-2xl shadow-lg border border-[#FF4D8D]/20 p-8 max-w-lg mx-auto">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gradient-to-br from-[#FF4D8D]/20 to-[#FF7A3D]/20 rounded-xl">
                  <span className="text-2xl">ℹ️</span>
                </div>
                <div className="text-left flex-1">
                  <h4 className="font-semibold mb-2 text-white">¿No tienes Freighter?</h4>
                  <p className="text-gray-300 text-sm mb-4">
                    Instala la extensión oficial de Freighter para comenzar a usar SharkWallet.
                  </p>
                  <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-[#FFB3D1] hover:text-[#FF4D8D] font-medium text-sm transition-colors group"
                  >
                    Descargar Freighter
                    <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Contenido cuando está conectado - Layout de dos columnas
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Columna izquierda: contenido dinámico */}
            <div className="lg:col-span-2 space-y-6">
              {activeSection === "estado" && (
                <div className="bg-[#2D1B3D] rounded-2xl shadow-lg border border-[#FF4D8D]/20 p-8">
                  <div className="flex items-center mb-6">
                    <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#FF4D8D] to-[#FF7A3D] rounded-xl mr-4 shadow-lg shadow-[#FF4D8D]/30">
                      <span className="text-2xl">✅</span>
                    </div>
                    <div>
                      <h2 className="text-2xl font-semibold text-white">Estado de Freighter</h2>
                      <p className="text-gray-300">Tu wallet está conectada correctamente</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-gradient-to-r from-[#FF4D8D]/10 to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-xl">
                      <p className="text-[#FFB3D1] text-sm font-medium mb-2">Conectado</p>
                      <p className="text-gray-300 text-sm">
                        Freighter está funcionando correctamente y sincronizado con la red TESTNET.
                      </p>
                    </div>

                    <div className="p-4 bg-[#1A1A2E] border border-[#FF7A3D]/20 rounded-xl">
                      <p className="text-gray-300 text-sm font-medium mb-2">Dirección actual</p>
                      <div className="flex items-center gap-2">
                        <code className="text-[#FFB3D1] font-mono text-sm break-all flex-1">
                          {address}
                        </code>
                        <button
                          onClick={() => {
                            navigator.clipboard.writeText(address || "");
                          }}
                          className="p-2 bg-[#2D1B3D] hover:bg-[#FF4D8D]/20 rounded-lg transition-colors border border-[#FF4D8D]/30"
                          title="Copiar dirección"
                        >
                          📋
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Trustline Manager */}
                  <div className="mt-6">
                    <TrustlineManager 
                      address={address} 
                      onTrustlineCreated={() => {
                        // Se actualizará automáticamente
                      }}
                    />
                  </div>
                </div>
              )}

              {activeSection === "cuenta" && (
                <GenerateAccount />
              )}

              {activeSection === "pago" && (
                <PaymentForm
                  address={address}
                  xlmBalance={xlmBalance}
                  usdcBalance={usdcBalance}
                  onPaymentSent={handlePaymentSent}
                />
              )}

              {activeSection === "historial" && (
                <TransactionHistory address={address} />
              )}
            </div>

            {/* Sidebar derecho: Balance */}
            <div className="lg:col-span-1">
              <div className="sticky top-24">
                <Balance 
                  isConnected={isConnected} 
                  address={address}
                  onBalanceUpdate={handleBalanceUpdate}
                  refreshTrigger={refreshBalance}
                />
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2D1B3D] mt-auto py-6 bg-[#1A1A2E]">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-400 text-sm">
            hecho con 🧡 por una tiburona - conectado a TESTNET
          </p>
        </div>
      </footer>
    </div>
  );
}
