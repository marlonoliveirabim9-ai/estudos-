"use client";

import { useActionState, useState } from "react";
import { registrarSessao, type RegistrarSessaoState } from "@/app/actions/sessoes";

type Disciplina = { id: number; nome: string; topicos: { id: number; numero: string; titulo: string }[] };

const initialState: RegistrarSessaoState = {};

export function SessaoForm({ disciplinas }: { disciplinas: Disciplina[] }) {
  const [state, formAction, pending] = useActionState(registrarSessao, initialState);
  const [disciplinaId, setDisciplinaId] = useState<string>(disciplinas[0]?.id.toString() ?? "");

  const disciplinaSelecionada = disciplinas.find((d) => d.id.toString() === disciplinaId);

  return (
    <form
      action={formAction}
      key={state.success ? Math.random() : "form"}
      className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4"
    >
      <h2 className="text-sm font-medium text-neutral-300">Registrar sessão de estudo</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Matéria</label>
          <select
            name="disciplinaId"
            value={disciplinaId}
            onChange={(e) => setDisciplinaId(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
          >
            {disciplinas.map((d) => (
              <option key={d.id} value={d.id}>
                {d.nome}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Tópico (opcional)</label>
          <select
            name="topicoId"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
            defaultValue=""
          >
            <option value="">— não especificar —</option>
            {disciplinaSelecionada?.topicos.map((t) => (
              <option key={t.id} value={t.id}>
                {t.numero} — {t.titulo.slice(0, 60)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Duração (minutos)</label>
          <input
            name="duracaoMin"
            type="number"
            min={1}
            max={600}
            required
            defaultValue={50}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Notas (opcional)</label>
          <input
            name="notas"
            type="text"
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
            placeholder="O que você estudou..."
          />
        </div>
      </div>
      {state.error && <p className="text-sm text-rose-500">{state.error}</p>}
      {state.success && <p className="text-sm text-emerald-500">Sessão registrada!</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-rose-600 hover:bg-rose-500 transition text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar sessão"}
      </button>
    </form>
  );
}
