"use client";

import { useState } from "react";
import { TopicoRow, type TopicoRowData } from "./TopicoRow";

export function DisciplinaAccordion({
  nome,
  topicos,
  defaultOpen = false,
}: {
  nome: string;
  topicos: TopicoRowData[];
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const feitos = topicos.filter((t) => t.revisao1).length;
  const pct = topicos.length ? Math.round((feitos / topicos.length) * 100) : 0;

  return (
    <div className="border border-neutral-800 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3 bg-neutral-900 hover:bg-neutral-800/70 transition text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className={`transition-transform text-neutral-500 ${open ? "rotate-90" : ""}`}>
            ▶
          </span>
          <span className="font-medium text-white truncate">{nome}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-24 h-1.5 rounded-full bg-neutral-800 overflow-hidden hidden sm:block">
            <div className="h-full bg-rose-600" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs text-neutral-400 tabular-nums">
            {feitos}/{topicos.length}
          </span>
        </div>
      </button>
      {open && (
        <div className="p-2 divide-y divide-neutral-900">
          {topicos.map((t) => (
            <TopicoRow key={t.id} topico={t} />
          ))}
        </div>
      )}
    </div>
  );
}
