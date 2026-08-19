import { db } from "@/db";
import {
  disciplinas,
  topicos,
  topicoProgresso,
  revisoesAgendadas,
  sessoesEstudo,
  cicloConfig,
} from "@/db/schema";
import { and, eq, gte, isNull, lte, sql } from "drizzle-orm";

export async function getDisciplinasComTopicos() {
  const rows = await db
    .select({
      disciplinaId: disciplinas.id,
      bloco: disciplinas.bloco,
      nome: disciplinas.nome,
      ordem: disciplinas.ordem,
      topicoId: topicos.id,
      numero: topicos.numero,
      titulo: topicos.titulo,
      nivel: topicos.nivel,
      topicoOrdem: topicos.ordem,
    })
    .from(disciplinas)
    .leftJoin(topicos, eq(topicos.disciplinaId, disciplinas.id))
    .orderBy(disciplinas.ordem, topicos.ordem);

  const map = new Map<
    number,
    { id: number; bloco: string; nome: string; ordem: number; topicos: { id: number; numero: string; titulo: string; nivel: number }[] }
  >();

  for (const row of rows) {
    if (!map.has(row.disciplinaId)) {
      map.set(row.disciplinaId, {
        id: row.disciplinaId,
        bloco: row.bloco,
        nome: row.nome,
        ordem: row.ordem,
        topicos: [],
      });
    }
    if (row.topicoId) {
      map.get(row.disciplinaId)!.topicos.push({
        id: row.topicoId,
        numero: row.numero!,
        titulo: row.titulo!,
        nivel: row.nivel!,
      });
    }
  }

  return Array.from(map.values()).sort((a, b) => a.ordem - b.ordem);
}

export async function getProgressoDoUsuario(userId: string) {
  const rows = await db.select().from(topicoProgresso).where(eq(topicoProgresso.userId, userId));
  const map = new Map<number, (typeof rows)[number]>();
  for (const r of rows) map.set(r.topicoId, r);
  return map;
}

export async function getResumoDashboard(userId: string) {
  const [{ totalTopicos }] = await db
    .select({ totalTopicos: sql<number>`count(*)::int` })
    .from(topicos);

  const [{ topicosEstudados }] = await db
    .select({ topicosEstudados: sql<number>`count(*)::int` })
    .from(topicoProgresso)
    .where(and(eq(topicoProgresso.userId, userId), eq(topicoProgresso.revisao1, true)));

  const [{ totalQuestoes, totalAcertos }] = await db
    .select({
      totalQuestoes: sql<number>`coalesce(sum(${topicoProgresso.questoesNum}), 0)::int`,
      totalAcertos: sql<number>`coalesce(sum(${topicoProgresso.questoesAcertos}), 0)::int`,
    })
    .from(topicoProgresso)
    .where(eq(topicoProgresso.userId, userId));

  const hoje = new Date().toISOString().slice(0, 10);
  const [{ revisoesPendentes }] = await db
    .select({ revisoesPendentes: sql<number>`count(*)::int` })
    .from(revisoesAgendadas)
    .where(
      and(
        eq(revisoesAgendadas.userId, userId),
        isNull(revisoesAgendadas.concluidaEm),
        lte(revisoesAgendadas.dataPrevista, hoje)
      )
    );

  const seteDiasAtras = new Date();
  seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
  const [{ minutosSemana }] = await db
    .select({ minutosSemana: sql<number>`coalesce(sum(${sessoesEstudo.duracaoMin}), 0)::int` })
    .from(sessoesEstudo)
    .where(and(eq(sessoesEstudo.userId, userId), gte(sessoesEstudo.criadaEm, seteDiasAtras)));

  return {
    totalTopicos,
    topicosEstudados,
    totalQuestoes,
    totalAcertos,
    revisoesPendentes,
    minutosSemana,
  };
}

export async function getProgressoPorBloco(userId: string) {
  const rows = await db
    .select({
      bloco: disciplinas.bloco,
      topicoId: topicos.id,
      revisao1: topicoProgresso.revisao1,
    })
    .from(disciplinas)
    .leftJoin(topicos, eq(topicos.disciplinaId, disciplinas.id))
    .leftJoin(
      topicoProgresso,
      and(eq(topicoProgresso.topicoId, topicos.id), eq(topicoProgresso.userId, userId))
    );

  const blocos: Record<string, { total: number; feito: number }> = {};
  for (const r of rows) {
    if (!r.topicoId) continue;
    blocos[r.bloco] ??= { total: 0, feito: 0 };
    blocos[r.bloco].total += 1;
    if (r.revisao1) blocos[r.bloco].feito += 1;
  }
  return blocos;
}

export async function getProgressoPorDisciplina(userId: string) {
  const rows = await db
    .select({
      disciplinaId: disciplinas.id,
      nome: disciplinas.nome,
      bloco: disciplinas.bloco,
      topicoId: topicos.id,
      revisao1: topicoProgresso.revisao1,
      questoesNum: topicoProgresso.questoesNum,
      questoesAcertos: topicoProgresso.questoesAcertos,
    })
    .from(disciplinas)
    .leftJoin(topicos, eq(topicos.disciplinaId, disciplinas.id))
    .leftJoin(
      topicoProgresso,
      and(eq(topicoProgresso.topicoId, topicos.id), eq(topicoProgresso.userId, userId))
    );

  const map = new Map<
    number,
    { id: number; nome: string; bloco: string; total: number; feito: number; questoes: number; acertos: number }
  >();

  for (const r of rows) {
    if (!map.has(r.disciplinaId)) {
      map.set(r.disciplinaId, {
        id: r.disciplinaId,
        nome: r.nome,
        bloco: r.bloco,
        total: 0,
        feito: 0,
        questoes: 0,
        acertos: 0,
      });
    }
    const d = map.get(r.disciplinaId)!;
    if (r.topicoId) {
      d.total += 1;
      if (r.revisao1) d.feito += 1;
      d.questoes += r.questoesNum ?? 0;
      d.acertos += r.questoesAcertos ?? 0;
    }
  }

  return Array.from(map.values());
}

export async function getCicloDoUsuario(userId: string) {
  const rows = await db
    .select({
      disciplinaId: disciplinas.id,
      nome: disciplinas.nome,
      bloco: disciplinas.bloco,
      peso: cicloConfig.peso,
    })
    .from(disciplinas)
    .leftJoin(
      cicloConfig,
      and(eq(cicloConfig.disciplinaId, disciplinas.id), eq(cicloConfig.userId, userId))
    )
    .orderBy(disciplinas.ordem);

  const minutosPorDisciplina = await db
    .select({
      disciplinaId: sessoesEstudo.disciplinaId,
      minutos: sql<number>`coalesce(sum(${sessoesEstudo.duracaoMin}), 0)::int`,
    })
    .from(sessoesEstudo)
    .where(eq(sessoesEstudo.userId, userId))
    .groupBy(sessoesEstudo.disciplinaId);

  const minutosMap = new Map(minutosPorDisciplina.map((m) => [m.disciplinaId, m.minutos]));

  return rows.map((r) => ({
    id: r.disciplinaId,
    nome: r.nome,
    bloco: r.bloco,
    peso: r.peso ?? 3,
    minutosEstudados: minutosMap.get(r.disciplinaId) ?? 0,
  }));
}

export async function getRevisoesPendentes(userId: string) {
  const hoje = new Date().toISOString().slice(0, 10);
  return db
    .select({
      id: revisoesAgendadas.id,
      etapa: revisoesAgendadas.etapa,
      dataPrevista: revisoesAgendadas.dataPrevista,
      topicoId: topicos.id,
      topicoNumero: topicos.numero,
      topicoTitulo: topicos.titulo,
      disciplinaNome: disciplinas.nome,
    })
    .from(revisoesAgendadas)
    .innerJoin(topicos, eq(topicos.id, revisoesAgendadas.topicoId))
    .innerJoin(disciplinas, eq(disciplinas.id, topicos.disciplinaId))
    .where(
      and(
        eq(revisoesAgendadas.userId, userId),
        isNull(revisoesAgendadas.concluidaEm),
        lte(revisoesAgendadas.dataPrevista, hoje)
      )
    )
    .orderBy(revisoesAgendadas.dataPrevista);
}
