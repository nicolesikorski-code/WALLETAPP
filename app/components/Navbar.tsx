"use client";

import React from "react";

interface NavbarProps {
  isConnected: boolean;
  onLogout: () => void;
  onSelect: (section: string) => void;
  activeSection: string;
}

export default function Navbar({ isConnected, onLogout, onSelect, activeSection }: NavbarProps) {
  const menuItems = [
    { key: 'estado', label: 'Estado', icon: '👁️' },
    { key: 'cuenta', label: 'Generar Cuenta', icon: '✨' },
    { key: 'pago', label: 'Enviar Pago', icon: '💸' },
    { key: 'historial', label: 'Historial', icon: '📜' }
  ];

  return (
    <nav className="bg-[#1A1A2E] border-b border-[#2D1B3D] sticky top-0 z-50 shadow-lg">
      <div className="container mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
          {/* Logo y título */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#FF4D8D] to-[#FF7A3D] rounded-xl flex items-center justify-center shadow-lg shadow-[#FF4D8D]/30">
              <span className="text-2xl">🦈</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">SharkWallet</h1>
              <p className="text-gray-400 text-xs">Navega las aguas cripto con confianza</p>
            </div>
          </div>

          {/* Menú de navegación */}
          {isConnected && (
            <div className="flex items-center gap-2 bg-[#2D1B3D] rounded-xl p-1.5 border border-[#FF4D8D]/20">
              {menuItems.map((item) => (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    activeSection === item.key
                      ? "bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] text-white shadow-lg shadow-[#FF4D8D]/30"
                      : "text-gray-300 hover:text-white hover:bg-[#1A1A2E]"
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Estado de conexión */}
          <div className="flex items-center gap-3">
            {isConnected ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#FF4D8D]/10 to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-lg">
                  <div className="w-2 h-2 bg-[#FF4D8D] rounded-full animate-pulse"></div>
                  <span className="text-[#FFB3D1] text-xs font-medium">Conectado</span>
                </div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 bg-[#2D1B3D] hover:bg-[#FF4D8D]/20 text-gray-300 hover:text-white rounded-lg font-medium text-sm transition-all duration-200 border border-[#FF4D8D]/30"
                >
                  Cerrar sesión
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#2D1B3D] border border-[#2D1B3D] rounded-lg">
                <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                <span className="text-gray-500 text-xs font-medium">Desconectado</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
