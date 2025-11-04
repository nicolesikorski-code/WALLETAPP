"use client";

import { useState } from "react";

export default function GenerateAccount() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [publicKey, setPublicKey] = useState<string>("");
  const [secretKey, setSecretKey] = useState<string>("");

  const generateAccount = async () => {
    setIsGenerating(true);
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

      // 1. Generar par de claves
      let Keypair = StellarSdk.Keypair;
      if (!Keypair && StellarSdk.default) {
        Keypair = StellarSdk.default.Keypair;
      }
      if (!Keypair || typeof Keypair !== 'function') {
        console.error("StellarSdk estructura:", Object.keys(StellarSdk || {}));
        throw new Error("StellarSdk.Keypair no está disponible");
      }

      const pair = Keypair.random();
      const newPublicKey = pair.publicKey();
      const newSecretKey = pair.secret();

      setPublicKey(newPublicKey);
      setSecretKey(newSecretKey);

      // 2. Fondear con Friendbot (solo testnet)
      const response = await fetch(
        `https://friendbot.stellar.org/?addr=${newPublicKey}`
      );

      if (!response.ok) {
        throw new Error("Error al fondear la cuenta con Friendbot");
      }

      setSuccess(true);
    } catch (err: any) {
      console.error("Error generating account:", err);
      setError(err.message || "Error al generar la cuenta. Intenta de nuevo.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="bg-[#2D1B3D] rounded-2xl shadow-sm border border-[#FF4D8D]/30 p-8">
      <div className="flex items-center mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] rounded-xl mr-4 shadow-sm">
          <span className="text-2xl">✨</span>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-white">Generar Cuenta de Prueba</h2>
          <p className="text-white/70">Crea y fondea una cuenta en la red Testnet</p>
        </div>
      </div>

      {/* Lista de beneficios */}
      <div className="mb-6 space-y-3">
        <div className="flex items-start gap-3">
          <span className="text-[#FFB088] text-xl">✓</span>
          <p className="text-white/80 text-sm">Crear una nueva cuenta Stellar automáticamente</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[#FFB088] text-xl">✓</span>
          <p className="text-white/80 text-sm">Fondear con 10,000 XLM de prueba</p>
        </div>
        <div className="flex items-start gap-3">
          <span className="text-[#FFB088] text-xl">✓</span>
          <p className="text-white/80 text-sm">Ideal para testing y desarrollo</p>
        </div>
      </div>

      {/* Botón generar */}
      <button
        onClick={generateAccount}
        disabled={isGenerating}
        className="w-full bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D] hover:hover:from-[#FF3D7D] hover:to-[#FF6A2D] disabled:bg-[#D1D5DB] disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl shadow-sm transition-all duration-200 flex items-center justify-center gap-2 mb-6"
      >
        {isGenerating ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span>Generando cuenta...</span>
          </>
        ) : (
          <>
            <span className="text-xl">✨</span>
            <span>Generar y Fondear Cuenta de Prueba</span>
          </>
        )}
      </button>

      {/* Mensaje informativo */}
      <div className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-xl p-4 mb-6">
        <div className="flex items-start gap-3">
          <span className="text-[#FFB3D1] text-xl">ℹ️</span>
          <p className="text-white/80 text-sm">
            Las cuentas generadas se crean en TESTNET y se fondean automáticamente con 10,000 XLM de prueba. No tienen valor real.
          </p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-[#FF7A85]/10 border border-[#FF7A85] rounded-xl p-4 mb-6">
          <p className="text-[#FF7A85] text-sm">{error}</p>
        </div>
      )}

      {/* Resultado exitoso */}
      {success && publicKey && secretKey && (
        <div className="space-y-4">
          <div className="bg-gradient-to-r from-[#FF4D8D] to-[#FF7A3D]/10 border border-[#FF4D8D]/30 rounded-xl p-4">
            <p className="text-white text-sm font-medium mb-2">¡Cuenta generada exitosamente!</p>
            <p className="text-white/80 text-xs">Guarda tu clave secreta de forma segura. No la compartas nunca.</p>
          </div>

          {/* Clave pública */}
          <div className="bg-[#2D1B3D] border border-[#FF4D8D]/30 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-white text-sm font-medium">Clave Pública</p>
              <button
                onClick={() => copyToClipboard(publicKey)}
                className="text-[#FFB3D1] hover:text-[#5A4DD4] text-sm font-medium"
              >
                Copiar
              </button>
            </div>
            <code className="text-white font-mono text-xs break-all block bg-[#2D1B3D] p-2 rounded border border-[#FF4D8D]/30">
              {publicKey}
            </code>
          </div>

          {/* Clave secreta */}
          <div className="bg-gradient-to-r from-[#FF7A3D]/10 to-[#FF4D8D]/10 border-2 border-[#FF7A3D]/50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[#FFB088] text-sm font-medium">⚠️ Clave Secreta</p>
              <button
                onClick={() => copyToClipboard(secretKey)}
                className="text-[#FFB088] hover:text-[#FF7A3D] text-sm font-medium"
              >
                Copiar
              </button>
            </div>
            <code className="text-white font-mono text-xs break-all block bg-[#2D1B3D] p-2 rounded border border-[#FF4D8D]/50">
              {secretKey}
            </code>
            <p className="text-[#FF7A85] text-xs mt-2">⚠️ No compartas esta clave con nadie. Quien la tenga puede controlar tu cuenta.</p>
          </div>
        </div>
      )}
    </div>
  );
}
