// src/app/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showRegister, setShowRegister] = useState(false);

  // Redirigir si ya está logueado
  useEffect(() => {
    if (typeof window !== "undefined") {
      const isLogged = localStorage.getItem("uh_logged_in");
      if (isLogged === "true") {
        router.push("/dashboard");
      }
    }
  }, [router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    // Validación simple
    if (!email.trim() || !senha.trim()) {
      setError("Por favor, preencha email e senha");
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Attempting login...');
      
      // Usar el API endpoint proxy de Next.js
      const response = await fetch('/api/auth', {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: senha,
        }),
      });

      console.log('📥 Login response status:', response.status);

      const data = await response.json();
      console.log('📥 Login response data:', data);

      if (!response.ok) {
        throw new Error(data.error || "Credenciais inválidas");
      }

      console.log('✅ Login successful!');

      // Guardar token que viene en la respuesta
      if (data.token) {
        localStorage.setItem("uh_auth_token", data.token);
      }

      // Guardar estado de login
      localStorage.setItem("uh_logged_in", "true");
      localStorage.setItem("uh_user_email", data.email || email);

      // Redirigir al dashboard
      router.push("/dashboard");
    } catch (err: any) {
      console.error("❌ Login error:", err);
      setError(err.message || "Erro ao fazer login. Verifique suas credenciais.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    
    if (!email.trim() || !senha.trim() || !name.trim() || !surname.trim()) {
      setError("Por favor, preencha todos os campos");
      return;
    }

    setLoading(true);

    try {
      console.log('🔄 Attempting registration...');
      
      const response = await fetch('/api/auth/register', {
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

      console.log('📥 Register response status:', response.status);
      
      const data = await response.json();
      console.log('📥 Register response data:', data);

      if (!response.ok) {
        if (response.status === 409) {
          throw new Error("Este email já está cadastrado");
        }
        throw new Error(data.error || data.details || "Erro ao criar usuário");
      }

      console.log('✅ Registration successful!');

      // El backend devuelve email + token directamente
      if (data.token) {
        localStorage.setItem("uh_auth_token", data.token);
      }

      localStorage.setItem("uh_logged_in", "true");
      localStorage.setItem("uh_user_email", data.email || email);

      // Redirigir al dashboard
      router.push("/dashboard");
      
    } catch (err: any) {
      console.error("❌ Register error:", err);
      setError(err.message || "Erro ao criar usuário.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-zinc-950 flex items-center justify-center p-4">
      {/* Card de Login */}
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 to-sky-500 mb-4 shadow-lg shadow-emerald-500/20">
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
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-zinc-50 tracking-tight">
            Uncovering History
          </h1>
          <p className="text-sm text-zinc-400 mt-1">
            {showRegister ? "Criar nova conta" : "Faça login para acessar o painel"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-zinc-900/50 backdrop-blur-xl rounded-2xl border border-zinc-800 shadow-2xl p-8">
          <form onSubmit={showRegister ? handleRegister : handleSubmit} className="space-y-4">
            {/* Error Message */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Campos de Name y Surname (solo en registro) */}
            {showRegister && (
              <>
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
                    placeholder="Seu nome"
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>

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
                    placeholder="Seu sobrenome"
                    className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                    disabled={loading}
                  />
                </div>
              </>
            )}

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
                placeholder="seu@email.com"
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                disabled={loading}
                autoComplete="username"
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
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-zinc-950/50 border border-zinc-700 rounded-xl text-zinc-100 placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition"
                disabled={loading}
                autoComplete={showRegister ? "new-password" : "current-password"}
              />
            </div>

            {/* Botón de submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-emerald-500 to-sky-500 hover:from-emerald-400 hover:to-sky-400 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-6"
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
                  {showRegister ? "Criando conta..." : "Entrando..."}
                </span>
              ) : (
                showRegister ? "Criar Conta" : "Entrar"
              )}
            </button>
          </form>

          {/* Toggle entre Login y Registro */}
          <div className="mt-6 pt-6 border-t border-zinc-800 text-center">
            <button
              onClick={() => {
                setShowRegister(!showRegister);
                setError("");
              }}
              className="text-sm text-emerald-400 hover:text-emerald-300 transition"
            >
              {showRegister 
                ? "← Já tem conta? Fazer login" 
                : "Não tem conta? Criar nova conta →"}
            </button>
          </div>

          {/* Footer del card */}
          <div className="mt-4 pt-4 border-t border-zinc-800">
            <p className="text-xs text-center text-zinc-500">
              Sistema de gestão de pontos históricos
            </p>
          </div>
        </div>

        {/* Info adicional */}
        <div className="mt-4 text-center">
          <p className="text-xs text-zinc-600">
            {showRegister 
              ? "Ao criar uma conta, você poderá gerenciar pontos históricos"
              : "💡 Use suas credenciais para acessar o sistema"}
          </p>
        </div>
      </div>
    </main>
  );
}
