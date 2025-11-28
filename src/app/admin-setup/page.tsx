// src/app/admin-setup/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function AdminSetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@uncovering.local");
  const [senha, setSenha] = useState("admin123");
  const [name, setName] = useState("Admin");
  const [surname, setSurname] = useState("Sistema");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    
    if (!email.trim() || !senha.trim() || !name.trim() || !surname.trim()) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Creating admin user...');
      
      const response = await fetch('/api/auth/register-admin', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: name.trim(),
          surname: surname.trim(),
          email: email.trim(),
          password: senha,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar administrador");
      }

      console.log('✅ Admin created successfully!');
      setSuccess(true);

      // Esperar 2 segundos y redirigir al login
      setTimeout(() => {
        router.push("/");
      }, 2000);
      
    } catch (err: any) {
      console.error("❌ Admin setup error:", err);
      setError(err.message || "Erro ao criar administrador.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 mb-4 shadow-lg shadow-amber-500/20">
            <svg
              className="w-8 h-8 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
            Configuração de Administrador
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            Crie o primeiro usuário administrador do sistema
          </p>
        </div>

        {/* Warning */}
        <div className="mb-6 bg-amber-500/10 border border-amber-500/50 rounded-lg p-4">
          <p className="text-xs text-amber-400 mb-2">
            ⚠️ <strong>Modo de Desenvolvimento:</strong> Esta página cria um usuário normal.
          </p>
          <p className="text-xs text-amber-300">
            👉 Para tornar este usuário ADMIN, você precisa atualizar o role na base de dados manualmente.
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Success Message */}
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/50 rounded-lg p-3 text-sm text-emerald-400">
                ✅ Administrador criado com sucesso! Redirecionando...
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Nome */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Nome
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                disabled={loading || success}
              />
            </div>

            {/* Sobrenome */}
            <div>
              <label
                htmlFor="surname"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Sobrenome
              </label>
              <input
                id="surname"
                type="text"
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                disabled={loading || success}
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                disabled={loading || success}
              />
            </div>

            {/* Senha */}
            <div>
              <label
                htmlFor="senha"
                className="block text-sm font-medium text-zinc-300 mb-2"
              >
                Senha
              </label>
              <input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition"
                disabled={loading || success}
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
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
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Criando administrador...
                </span>
              ) : success ? (
                "✅ Administrador Criado!"
              ) : (
                "🔐 Criar Administrador"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <button
              onClick={() => router.push("/")}
              className="text-sm text-zinc-400 hover:text-zinc-300 transition"
            >
              ← Voltar para o login
            </button>
          </div>
        </div>

        {/* Info */}
        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-600">
            Após criar o administrador, você poderá fazer login normalmente
          </p>
        </div>
      </div>
    </main>
  );
}
