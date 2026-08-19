import { auth } from "@/auth";
import { db } from "@/db";
import { sessoesEstudo, disciplinas as disciplinasTable, topicos as topicosTable } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { getDisciplinasComTopicos } from "@/lib/queries";
import { SessaoForm } from "@/components/SessaoForm";

export default async function SessoesPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const [disciplinas, sessoes] = await Promise.all([
    getDisciplinasComTopicos(),
    db
      .select({
        id: sessoesEstudo.id,
        duracaoMin: sessoesEstudo.duracaoMin,
        notas: sessoesEstudo.notas,
        criadaEm: sessoesEstudo.criadaEm,
        disciplinaNome: disciplinasTable.nome,
        topicoTitulo: topicosTable.titulo,
      })
      .from(sessoesEstudo)
      .leftJoin(disciplinasTable, eq(disciplinasTable.id, sessoesEstudo.disciplinaId))
      .leftJoin(topicosTable, eq(topicosTable.id, sessoesEstudo.topicoId))
      .where(eq(sessoesEstudo.userId, userId))
      .orderBy(desc(sessoesEstudo.criadaEm))
      .limit(30),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Sessões de Estudo</h1>
        <p className="text-neutral-400 mt-1">
          Registre cada bloco de estudo. O tempo entra automaticamente no ciclo de estudos.
        </p>
      </div>

      <SessaoForm disciplinas={disciplinas.map((d) => ({ id: d.id, nome: d.nome, topicos: d.topicos }))} />

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-neutral-300 mb-4">Histórico recente</h2>
        {sessoes.length === 0 ? (
          <p className="text-sm text-neutral-500">Nenhuma sessão registrada ainda.</p>
        ) : (
          <ul className="divide-y divide-neutral-800">
            {sessoes.map((s) => (
              <li key={s.id} className="py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm text-white truncate">
                    {s.disciplinaNome ?? "—"}
                    {s.topicoTitulo ? ` · ${s.topicoTitulo.slice(0, 50)}` : ""}
                  </p>
                  {s.notas && <p className="text-xs text-neutral-500 truncate">{s.notas}</p>}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-white">{s.duracaoMin} min</p>
                  <p className="text-xs text-neutral-500">
                    {new Date(s.criadaEm).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
