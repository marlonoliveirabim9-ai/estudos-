import { auth } from "@/auth";
import { getDisciplinasComTopicos, getProgressoDoUsuario } from "@/lib/queries";
import { DisciplinaAccordion } from "@/components/DisciplinaAccordion";

const NOMES_BLOCO: Record<string, string> = {
  I: "Bloco I — Conhecimentos Básicos",
  II: "Bloco II — Legislação de Trânsito",
  III: "Bloco III — Conhecimentos Específicos",
};

export default async function EditalPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [disciplinas, progressoMap] = await Promise.all([
    getDisciplinasComTopicos(),
    getProgressoDoUsuario(userId),
  ]);

  const porBloco = new Map<string, typeof disciplinas>();
  for (const d of disciplinas) {
    if (!porBloco.has(d.bloco)) porBloco.set(d.bloco, []);
    porBloco.get(d.bloco)!.push(d);
  }

  let primeiraRenderizada = false;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Edital Verticalizado</h1>
        <p className="text-neutral-400 mt-1 max-w-2xl">
          Marque as revisões 1, 2 e 3 conforme for estudando. A Revisão 2 é agendada
          automaticamente para 7 dias depois, e a Revisão 3 para 30 dias após a Revisão 2 —
          é a repetição espaçada que fixa o conteúdo na memória de longo prazo.
        </p>
      </div>

      {Array.from(porBloco.entries()).map(([bloco, disciplinasDoBloco]) => (
        <div key={bloco} className="space-y-3">
          <h2 className="text-sm font-semibold text-rose-500 uppercase tracking-wide">
            {NOMES_BLOCO[bloco] ?? `Bloco ${bloco}`}
          </h2>
          <div className="space-y-3">
            {disciplinasDoBloco.map((d) => {
              const topicosComProgresso = d.topicos.map((t) => {
                const p = progressoMap.get(t.id);
                return {
                  ...t,
                  revisao1: p?.revisao1 ?? false,
                  revisao2: p?.revisao2 ?? false,
                  revisao3: p?.revisao3 ?? false,
                  questoesNum: p?.questoesNum ?? 0,
                  questoesAcertos: p?.questoesAcertos ?? 0,
                };
              });
              const isFirst = !primeiraRenderizada;
              if (isFirst) primeiraRenderizada = true;
              return (
                <DisciplinaAccordion
                  key={d.id}
                  nome={d.nome}
                  topicos={topicosComProgresso}
                  defaultOpen={isFirst}
                />
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
