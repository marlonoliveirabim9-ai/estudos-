import { auth } from "@/auth";
import { getCicloDoUsuario } from "@/lib/queries";
import { calcularOrdemDoCiclo } from "@/lib/study-cycle";
import { CicloRow } from "@/components/CicloRow";

export default async function CicloPage() {
  const session = await auth();
  const userId = (session!.user as { id: string }).id;

  const disciplinas = await getCicloDoUsuario(userId);
  const ranking = calcularOrdemDoCiclo(disciplinas);
  const proxima = ranking[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-white">Ciclo de Estudos</h1>
        <p className="text-neutral-400 mt-1 max-w-2xl">
          Defina o peso (1 a 5) de cada matéria conforme sua importância na prova — quanto
          maior a incidência de questões e sua dificuldade pessoal, maior o peso. A cada
          sessão registrada, a plataforma recalcula qual matéria está mais &quot;atrasada&quot;
          em relação ao tempo que já deveria ter recebido e sugere o que estudar a seguir.
        </p>
      </div>

      {proxima && (
        <div className="rounded-2xl border border-rose-600 bg-rose-950/20 p-5">
          <p className="text-xs uppercase tracking-wide text-rose-500 font-medium mb-1">
            Estude agora
          </p>
          <p className="text-xl text-white font-semibold">{proxima.nome}</p>
          <p className="text-sm text-neutral-400 mt-1">
            Bloco {proxima.bloco} · peso {proxima.peso} · {(proxima.minutosEstudados / 60).toFixed(1)}h
            estudadas até agora
          </p>
        </div>
      )}

      <div className="space-y-2">
        {ranking.map((d) => (
          <CicloRow
            key={d.id}
            id={d.id}
            nome={d.nome}
            bloco={d.bloco}
            peso={d.peso}
            minutosEstudados={d.minutosEstudados}
            posicao={d.posicao}
          />
        ))}
      </div>
    </div>
  );
}
