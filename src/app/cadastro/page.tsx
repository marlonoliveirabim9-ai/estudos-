"use client";

import { useActionState, useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signupAction, type SignupState } from "@/app/actions/auth";

const initialState: SignupState = {};

export default function CadastroPage() {
  const [state, formAction, pending] = useActionState(signupAction, initialState);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (state.success && email && password) {
      signIn("credentials", { email, password, redirect: false }).then(() => {
        router.push("/edital");
        router.refresh();
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.success]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-rose-600 text-white font-bold text-lg mb-3">
            PRF
          </div>
          <h1 className="text-xl font-semibold text-white">Criar conta</h1>
          <p className="text-sm text-neutral-400 mt-1">Comece a organizar seus estudos hoje</p>
        </div>
        <form action={formAction} className="space-y-4 bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div>
            <label className="block text-sm text-neutral-300 mb-1">Nome</label>
            <input
              name="name"
              type="text"
              required
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="block text-sm text-neutral-300 mb-1">E-mail</label>
            <input
              name="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
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
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-white text-sm focus:outline-none focus:ring-2 focus:ring-rose-600"
              placeholder="Mínimo 6 caracteres"
            />
          </div>
          {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-rose-600 hover:bg-rose-500 transition text-white text-sm font-medium py-2.5 disabled:opacity-60"
          >
            {pending ? "Criando..." : "Criar conta"}
          </button>
        </form>
        <p className="text-center text-sm text-neutral-400 mt-4">
          Já tem conta?{" "}
          <Link href="/login" className="text-rose-500 hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}
