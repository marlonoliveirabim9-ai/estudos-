"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { registrarSimulado } from "@/app/actions/simulados";

type Disciplina = { id: number; nome: string };

type Linha = { disciplinaId: number; questoes: string; acertos: string };

export function SimuladoForm({ disciplinas }: { disciplinas: Disciplina[] }) {
  const router = useRouter();
  const [nome, setNome] = useState("");
  const [data, setData] = useState(() => new Date().toISOString().slice(0, 10));
  const [notas, setNotas] = useState("");
  const [linhas, setLinhas] = useState<Linha[]>([
    { disciplinaId: disciplinas[0]?.id ?? 0, questoes: "", acertos: "" },
  ]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, startTransition] = useTransition();

  function addLinha() {
    setLinhas((ls) => [...ls, { disciplinaId: disciplinas[0]?.id ?? 0, questoes: "", acertos: "" }]);
  }

  function removeLinha(i: number) {
    setLinhas((ls) => ls.filter((_, idx) => idx !== i));
  }

  function updateLinha(i: number, patch: Partial<Linha>) {
    setLinhas((ls) => ls.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const materias = linhas
      .filter((l) => l.questoes)
      .map((l) => ({
        disciplinaId: l.disciplinaId,
        questoes: Number(l.questoes) || 0,
        acertos: Number(l.acertos) || 0,
      }));

    startTransition(async () => {
      const res = await registrarSimulado({ nome, data, notas, materias });
      if (res.error) {
        setError(res.error);
        return;
      }
      setSuccess(true);
      setNome("");
      setLinhas([{ disciplinaId: disciplinas[0]?.id ?? 0, questoes: "", acertos: "" }]);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 space-y-4">
      <h2 className="text-sm font-medium text-neutral-300">Registrar simulado</h2>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Nome do simulado</label>
          <input
            required
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
            placeholder="Ex: Simulado Estratégia #3"
          />
        </div>
        <div>
          <label className="block text-xs text-neutral-500 mb-1">Data</label>
          <input
            type="date"
            required
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="block text-xs text-neutral-500">Resultado por matéria</label>
        {linhas.map((linha, i) => (
          <div key={i} className="flex items-center gap-2">
            <select
              value={linha.disciplinaId}
              onChange={(e) => updateLinha(i, { disciplinaId: Number(e.target.value) })}
              className="flex-1 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-white"
            >
              {disciplinas.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome}
                </option>
              ))}
            </select>
            <input
              type="number"
              min={0}
              placeholder="Questões"
              value={linha.questoes}
              onChange={(e) => updateLinha(i, { questoes: e.target.value })}
              className="w-24 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-white"
            />
            <input
              type="number"
              min={0}
              placeholder="Acertos"
              value={linha.acertos}
              onChange={(e) => updateLinha(i, { acertos: e.target.value })}
              className="w-24 rounded-lg bg-neutral-800 border border-neutral-700 px-2 py-1.5 text-sm text-white"
            />
            <button
              type="button"
              onClick={() => removeLinha(i)}
              className="text-neutral-500 hover:text-rose-500 text-sm px-1"
            >
              ✕
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addLinha}
          className="text-xs text-rose-500 hover:underline"
        >
          + adicionar matéria
        </button>
      </div>

      <div>
        <label className="block text-xs text-neutral-500 mb-1">Notas (opcional)</label>
        <input
          value={notas}
          onChange={(e) => setNotas(e.target.value)}
          className="w-full rounded-lg bg-neutral-800 border border-neutral-700 px-3 py-2 text-sm text-white"
        />
      </div>

      {error && <p className="text-sm text-rose-500">{error}</p>}
      {success && <p className="text-sm text-emerald-500">Simulado registrado!</p>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-rose-600 hover:bg-rose-500 transition text-white text-sm font-medium px-4 py-2 disabled:opacity-60"
      >
        {pending ? "Salvando..." : "Registrar simulado"}
      </button>
    </form>
  );
}
