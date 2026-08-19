"use client";

import { useState, useTransition } from "react";
import { atualizarPesoDisciplina } from "@/app/actions/ciclo";

export function CicloRow({
  id,
  nome,
  bloco,
  peso,
  minutosEstudados,
  posicao,
}: {
  id: number;
  nome: string;
  bloco: string;
  peso: number;
  minutosEstudados: number;
  posicao: number;
}) {
  const [valor, setValor] = useState(peso);
  const [, startTransition] = useTransition();

  return (
    <div
      className={`flex items-center gap-4 rounded-xl border p-4 transition ${
        posicao === 1 ? "border-rose-600 bg-rose-950/20" : "border-neutral-800 bg-neutral-900"
      }`}
    >
      <div
        className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold ${
          posicao === 1 ? "bg-rose-600 text-white" : "bg-neutral-800 text-neutral-400"
        }`}
      >
        {posicao}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-white text-sm font-medium truncate">{nome}</p>
        <p className="text-xs text-neutral-500">
          Bloco {bloco} · {(minutosEstudados / 60).toFixed(1)}h estudadas
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <label className="text-xs text-neutral-500">Peso</label>
        <input
          type="range"
          min={1}
          max={5}
          value={valor}
          onChange={(e) => {
            const v = Number(e.target.value);
            setValor(v);
            startTransition(async () => {
              await atualizarPesoDisciplina(id, v);
            });
          }}
          className="accent-rose-600 w-24"
        />
        <span className="text-sm text-white w-4 text-center">{valor}</span>
      </div>
    </div>
  );
}
