"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { topicoProgresso, revisoesAgendadas } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import {
  DIAS_ATE_REVISAO_2,
  DIAS_ATE_REVISAO_3,
  proximaDataRevisao,
  formatarDataISO,
} from "@/lib/spaced-repetition";

async function getUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return (session.user as { id: string }).id;
}

async function getOrCreateProgresso(userId: string, topicoId: number) {
  const existing = await db
    .select()
    .from(topicoProgresso)
    .where(and(eq(topicoProgresso.userId, userId), eq(topicoProgresso.topicoId, topicoId)));

  if (existing.length > 0) return existing[0];

  const [created] = await db
    .insert(topicoProgresso)
    .values({ userId, topicoId })
    .returning();
  return created;
}

export async function toggleRevisao(topicoId: number, etapa: "revisao1" | "revisao2" | "revisao3") {
  const userId = await getUserId();
  const progresso = await getOrCreateProgresso(userId, topicoId);

  const novoValor = !progresso[etapa];
  const agora = new Date();

  if (etapa === "revisao1") {
    await db
      .update(topicoProgresso)
      .set({ revisao1: novoValor, revisao1At: novoValor ? agora : null, updatedAt: agora })
      .where(eq(topicoProgresso.id, progresso.id));
  } else if (etapa === "revisao2") {
    await db
      .update(topicoProgresso)
      .set({ revisao2: novoValor, revisao2At: novoValor ? agora : null, updatedAt: agora })
      .where(eq(topicoProgresso.id, progresso.id));
  } else {
    await db
      .update(topicoProgresso)
      .set({ revisao3: novoValor, revisao3At: novoValor ? agora : null, updatedAt: agora })
      .where(eq(topicoProgresso.id, progresso.id));
  }

  // Agenda a próxima revisão espaçada automaticamente
  if (novoValor && etapa === "revisao1") {
    const dataPrevista = formatarDataISO(proximaDataRevisao(agora, DIAS_ATE_REVISAO_2));
    await db.insert(revisoesAgendadas).values({ userId, topicoId, etapa: "r2", dataPrevista });
  }
  if (novoValor && etapa === "revisao2") {
    const dataPrevista = formatarDataISO(proximaDataRevisao(agora, DIAS_ATE_REVISAO_3));
    await db.insert(revisoesAgendadas).values({ userId, topicoId, etapa: "r3", dataPrevista });
  }
  if (novoValor) {
    // marca como concluída qualquer revisão agendada correspondente
    const etapaCurta = etapa === "revisao2" ? "r2" : etapa === "revisao3" ? "r3" : null;
    if (etapaCurta) {
      await db
        .update(revisoesAgendadas)
        .set({ concluidaEm: agora })
        .where(
          and(
            eq(revisoesAgendadas.userId, userId),
            eq(revisoesAgendadas.topicoId, topicoId),
            eq(revisoesAgendadas.etapa, etapaCurta)
          )
        );
    }
  }

  revalidatePath("/edital");
  revalidatePath("/dashboard");
}

export async function atualizarQuestoes(topicoId: number, questoesNum: number, questoesAcertos: number) {
  const userId = await getUserId();
  const progresso = await getOrCreateProgresso(userId, topicoId);

  const num = Math.max(0, Math.floor(questoesNum) || 0);
  const acertos = Math.max(0, Math.min(num, Math.floor(questoesAcertos) || 0));

  await db
    .update(topicoProgresso)
    .set({ questoesNum: num, questoesAcertos: acertos, updatedAt: new Date() })
    .where(eq(topicoProgresso.id, progresso.id));

  revalidatePath("/edital");
  revalidatePath("/dashboard");
}
