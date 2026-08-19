"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const formData = new FormData(e.currentTarget);
    const res = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("E-mail ou senha incorretos.");
      return;
    }
    router.push(params.get("callbackUrl") || "/dashboard");
    router.refresh();
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-600 text-white font-bold text-lg mb-3">
            PRF
          </div>
          <h1 className="text-xl font-semibold text-white">Entrar</h1>
          <p className="text-sm text-neutral-400 mt-1">Sua plataforma de estudos para a PRF</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">E-mail</label>
            <input
              name="email"
              type="email"
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              placeholder="voce@email.com"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Senha</label>
            <input
              name="password"
              type="password"
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              placeholder="••••••••"
            />
          </div>
          {error && <p className="text-sm text-rose-500">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-600 hover:bg-rose-500 transition text-white text-sm font-medium py-2.5 disabled:opacity-60"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>
        <p className="text-center text-sm text-neutral-400 mt-4">
          Ainda não tem conta?{" "}
          <Link href="/cadastro" className="text-rose-500 hover:underline">
            Cadastre-se
          </Link>
        </p>
        <p className="text-center text-xs text-neutral-600 mt-6">
          Demo: demo@prfestudos.local / demo1234
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
