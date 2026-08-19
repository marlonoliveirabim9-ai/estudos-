import { auth } from "@/auth";
import {
  getResumoDashboard,
  getProgressoPorBloco,
  getRevisoesPendentes,
} from "@/lib/queries";
import Link from "next/link";

const NOMES_BLOCO: Record<string, string> = {
  I: "Bloco I — Conhecimentos Básicos",
  II: "Bloco II — Legislação de Trânsito",
  III: "Bloco III — Conhecimentos Específicos",
};

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <p className="text-sm text-neutral-400">{label}</p>
      <p className="text-2xl font-semibold text-white mt-1">{value}</p>
      {sub && <p className="text-xs text-neutral-500 mt-1">{sub}</p>}
    </div>
  );
}

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;
  const primeiroNome = session?.user?.name?.split(" ")[0] ?? "";

  const [resumo, porBloco, revisoes] = await Promise.all([
    getResumoDashboard(userId),
    getProgressoPorBloco(userId),
    getRevisoesPendentes(userId),
  ]);

  const pctConcluido = resumo.totalTopicos
    ? Math.round((resumo.topicosEstudados / resumo.totalTopicos) * 100)
    : 0;
  const pctAcerto = resumo.totalQuestoes
    ? Math.round((resumo.totalAcertos / resumo.totalQuestoes) * 100)
    : null;
  const horasSemana = (resumo.minutosSemana / 60).toFixed(1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-white">Olá, {primeiroNome} 👋</h1>
        <p className="text-neutral-400 mt-1">
          Aqui está o panorama da sua preparação para a PRF.
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Edital concluído"
          value={`${pctConcluido}%`}
          sub={`${resumo.topicosEstudados} de ${resumo.totalTopicos} tópicos`}
        />
        <StatCard
          label="Aproveitamento"
          value={pctAcerto !== null ? `${pctAcerto}%` : "—"}
          sub={`${resumo.totalAcertos} de ${resumo.totalQuestoes} questões`}
        />
        <StatCard label="Horas esta semana" value={`${horasSemana}h`} />
        <StatCard
          label="Revisões pendentes"
          value={String(resumo.revisoesPendentes)}
          sub={resumo.revisoesPendentes > 0 ? "vencidas ou para hoje" : "tudo em dia"}
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <h2 className="text-sm font-medium text-neutral-300 mb-4">Progresso por bloco</h2>
          <div className="space-y-4">
            {Object.entries(NOMES_BLOCO).map(([bloco, nome]) => {
              const d = porBloco[bloco] ?? { total: 0, feito: 0 };
              const pct = d.total ? Math.round((d.feito / d.total) * 100) : 0;
              return (
                <div key={bloco}>
                  <div className="flex justify-between text-xs text-neutral-400 mb-1">
                    <span>{nome}</span>
                    <span>
                      {d.feito}/{d.total} · {pct}%
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-rose-600" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-medium text-neutral-300">Revisões para hoje</h2>
            <Link href="/edital" className="text-xs text-rose-500 hover:underline">
              Ver edital
            </Link>
          </div>
          {revisoes.length === 0 ? (
            <p className="text-sm text-neutral-500">
              Nenhuma revisão pendente. Continue estudando para gerar seu ciclo de revisões
              espaçadas.
            </p>
          ) : (
            <ul className="space-y-2 max-h-64 overflow-y-auto">
              {revisoes.slice(0, 8).map((r) => (
                <li key={r.id} className="text-sm border-b border-neutral-800 pb-2 last:border-0">
                  <p className="text-white">
                    {r.topicoNumero} — {r.topicoTitulo}
                  </p>
                  <p className="text-xs text-neutral-500">
                    {r.disciplinaNome} · {r.etapa === "r2" ? "Revisão 2" : "Revisão 3"} · prevista
                    para {r.dataPrevista}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
        <h2 className="text-sm font-medium text-neutral-300 mb-2">Próximos passos</h2>
        <div className="grid sm:grid-cols-3 gap-3 text-sm">
          <Link
            href="/ciclo"
            className="rounded-xl border border-neutral-800 hover:border-rose-600 p-4 transition"
          >
            <p className="text-white font-medium">Ver ciclo de estudos</p>
            <p className="text-neutral-500 text-xs mt-1">Qual matéria estudar agora</p>
          </Link>
          <Link
            href="/edital"
            className="rounded-xl border border-neutral-800 hover:border-rose-600 p-4 transition"
          >
            <p className="text-white font-medium">Marcar progresso</p>
            <p className="text-neutral-500 text-xs mt-1">Atualize o edital verticalizado</p>
          </Link>
          <Link
            href="/simulados"
            className="rounded-xl border border-neutral-800 hover:border-rose-600 p-4 transition"
          >
            <p className="text-white font-medium">Registrar simulado</p>
            <p className="text-neutral-500 text-xs mt-1">Acompanhe sua evolução</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
