"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { simulados, simuladoMaterias } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return (session.user as { id: string }).id;
}

const materiaSchema = z.object({
  disciplinaId: z.coerce.number().int().positive(),
  questoes: z.coerce.number().int().min(0),
  acertos: z.coerce.number().int().min(0),
});

const simuladoSchema = z.object({
  nome: z.string().min(1).max(150),
  data: z.string().min(1),
  notas: z.string().max(2000).optional(),
  materias: z.array(materiaSchema).min(1),
});

export type SimuladoState = { error?: string; success?: boolean };

export async function registrarSimulado(payload: unknown): Promise<SimuladoState> {
  const userId = await getUserId();
  const parsed = simuladoSchema.safeParse(payload);

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { nome, data, notas, materias } = parsed.data;
  const totalQuestoes = materias.reduce((acc, m) => acc + m.questoes, 0);
  const totalAcertos = materias.reduce((acc, m) => acc + m.acertos, 0);

  if (totalQuestoes === 0) {
    return { error: "Informe ao menos uma questão em alguma matéria." };
  }

  const [simulado] = await db
    .insert(simulados)
    .values({ userId, nome, data, totalQuestoes, totalAcertos, notas: notas ?? null })
    .returning();

  await db.insert(simuladoMaterias).values(
    materias
      .filter((m) => m.questoes > 0)
      .map((m) => ({
        simuladoId: simulado.id,
        disciplinaId: m.disciplinaId,
        questoes: m.questoes,
        acertos: m.acertos,
      }))
  );

  revalidatePath("/simulados");
  revalidatePath("/dashboard");
  return { success: true };
}
