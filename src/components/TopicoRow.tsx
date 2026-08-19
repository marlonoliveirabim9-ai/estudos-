"use client";

import { useState, useTransition } from "react";
import { toggleRevisao, atualizarQuestoes } from "@/app/actions/progresso";

export type TopicoRowData = {
  id: number;
  numero: string;
  titulo: string;
  nivel: number;
  revisao1: boolean;
  revisao2: boolean;
  revisao3: boolean;
  questoesNum: number;
  questoesAcertos: number;
};

export function TopicoRow({ topico }: { topico: TopicoRowData }) {
  const [state, setState] = useState(topico);
  const [isPending, startTransition] = useTransition();
  const [editing, setEditing] = useState(false);
  const [num, setNum] = useState(String(topico.questoesNum || ""));
  const [acertos, setAcertos] = useState(String(topico.questoesAcertos || ""));

  function handleToggle(etapa: "revisao1" | "revisao2" | "revisao3") {
    setState((s) => ({ ...s, [etapa]: !s[etapa] }));
    startTransition(async () => {
      await toggleRevisao(topico.id, etapa);
    });
  }

  function handleSalvarQuestoes() {
    const n = parseInt(num || "0", 10) || 0;
    const a = parseInt(acertos || "0", 10) || 0;
    setState((s) => ({ ...s, questoesNum: n, questoesAcertos: a }));
    setEditing(false);
    startTransition(async () => {
      await atualizarQuestoes(topico.id, n, a);
    });
  }

  const indent = (topico.nivel - 1) * 16;
  const pct = state.questoesNum > 0 ? Math.round((state.questoesAcertos / state.questoesNum) * 100) : null;

  return (
    <div
      className={`flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-neutral-900/60 transition ${
        isPending ? "opacity-60" : ""
      }`}
      style={{ marginLeft: indent }}
    >
      <div className="flex gap-1.5 pt-0.5 shrink-0">
        {(["revisao1", "revisao2", "revisao3"] as const).map((etapa, i) => (
          <button
            key={etapa}
            title={`Revisão ${i + 1}`}
            onClick={() => handleToggle(etapa)}
            className={`w-5 h-5 rounded border text-[10px] font-bold flex items-center justify-center transition ${
              state[etapa]
                ? "bg-rose-600 border-rose-600 text-white"
                : "border-neutral-700 text-neutral-600 hover:border-neutral-500"
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm ${state.revisao1 ? "text-neutral-400 line-through decoration-neutral-700" : "text-neutral-200"}`}>
          <span className="text-neutral-500 mr-1.5">{topico.numero}</span>
          {topico.titulo}
        </p>
      </div>
      <div className="shrink-0 text-right w-32">
        {editing ? (
          <div className="flex items-center gap-1 justify-end">
            <input
              type="number"
              min={0}
              value={num}
              onChange={(e) => setNum(e.target.value)}
              className="w-12 rounded bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 text-xs text-white"
              placeholder="Qtd"
            />
            <input
              type="number"
              min={0}
              value={acertos}
              onChange={(e) => setAcertos(e.target.value)}
              className="w-12 rounded bg-neutral-800 border border-neutral-700 px-1.5 py-0.5 text-xs text-white"
              placeholder="OK"
            />
            <button
              onClick={handleSalvarQuestoes}
              className="text-xs text-rose-500 hover:underline px-1"
            >
              ✓
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-neutral-500 hover:text-neutral-300"
          >
            {state.questoesNum > 0
              ? `${state.questoesAcertos}/${state.questoesNum} (${pct}%)`
              : "+ questões"}
          </button>
        )}
      </div>
    </div>
  );
}
