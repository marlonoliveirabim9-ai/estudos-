import { auth } from "@/auth";
import { db } from "@/db";
import { simulados, simuladoMaterias, disciplinas } from "@/db/schema";
import { eq, asc, inArray } from "drizzle-orm";
import { SimuladoForm } from "@/components/SimuladoForm";
import { SimuladoChart, type SimuladoPonto } from "@/components/SimuladoChart";

export default async function SimuladosPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [todasDisciplinas, meusSimulados] = await Promise.all([
    db.select({ id: disciplinas.id, nome: disciplinas.nome }).from(disciplinas).orderBy(disciplinas.ordem),
    db
      .select()
      .from(simulados)
      .where(eq(simulados.userId, userId))
      .orderBy(asc(simulados.data)),
  ]);

  const pontos: SimuladoPonto[] = meusSimulados.map((s) => ({
    data: new Date(s.data).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" }),
    pct: s.totalQuestoes ? Math.round((s.totalAcertos / s.totalQuestoes) * 100) : 0,
    nome: s.nome,
  }));

  const materiasPorSimulado = new Map<number, { nome: string; questoes: number; acertos: number }[]>();
  if (meusSimulados.length > 0) {
    const rows = await db
      .select({
        simuladoId: simuladoMaterias.simuladoId,
        nome: disciplinas.nome,
        questoes: simuladoMaterias.questoes,
        acertos: simuladoMaterias.acertos,
      })
      .from(simuladoMaterias)
      .innerJoin(disciplinas, eq(disciplinas.id, simuladoMaterias.disciplinaId))
      .where(
        inArray(
          simuladoMaterias.simuladoId,
          meusSimulados.map((s) => s.id)
        )
      );
    for (const r of rows) {
      if (!materiasPorSimulado.has(r.simuladoId)) materiasPorSimulado.set(r.simuladoId, []);
      materiasPorSimulado.get(r.simuladoId)!.push({ nome: r.nome, questoes: r.questoes, acertos: r.acertos });
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Simulados</h1>
        <p className="text-neutral-400 mt-1">
          Faça simulados regularmente — é o melhor termômetro do seu nível de preparo.
        </p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-neutral-300 mb-4">Evolução do aproveitamento</h2>
        <SimuladoChart pontos={pontos} />
      </div>

      <SimuladoForm disciplinas={todasDisciplinas} />

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-neutral-300 mb-4">Histórico</h2>
        {meusSimulados.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhum simulado registrado ainda.</p>
        ) : (
          <ul className="space-y-4">
            {[...meusSimulados].reverse().map((s) => {
              const pct = s.totalQuestoes ? Math.round((s.totalAcertos / s.totalQuestoes) * 100) : 0;
              return (
                <li key={s.id} className="border-b border-neutral-800 pb-4 last:border-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-white text-sm font-medium">{s.nome}</p>
                      <p className="text-xs text-neutral-500">
                        {new Date(s.data).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    <p className="text-sm text-white">
                      {s.totalAcertos}/{s.totalQuestoes} · {pct}%
                    </p>
                  </div>
                  {s.notas && <p className="text-xs text-neutral-500 mt-1">{s.notas}</p>}
                  {(materiasPorSimulado.get(s.id) ?? []).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {materiasPorSimulado.get(s.id)!.map((m, i) => {
                        const mp = m.questoes ? Math.round((m.acertos / m.questoes) * 100) : 0;
                        return (
                          <span
                            key={i}
                            className="text-[11px] rounded-full bg-neutral-800 text-neutral-400 px-2 py-0.5"
                          >
                            {m.nome}: {m.acertos}/{m.questoes} ({mp}%)
                          </span>
                        );
                      })}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
