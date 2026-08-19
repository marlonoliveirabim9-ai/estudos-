"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { sessoesEstudo } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { z } from "zod";

async function getUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return (session.user as { id: string }).id;
}

const sessaoSchema = z.object({
  disciplinaId: z.coerce.number().int().positive(),
  topicoId: z.coerce.number().int().positive().optional().nullable(),
  duracaoMin: z.coerce.number().int().min(1).max(600),
  notas: z.string().max(2000).optional(),
});

export type RegistrarSessaoState = { error?: string; success?: boolean };

export async function registrarSessao(
  _prev: RegistrarSessaoState,
  formData: FormData
): Promise<RegistrarSessaoState> {
  const userId = await getUserId();

  const topicoRaw = formData.get("topicoId");
  const parsed = sessaoSchema.safeParse({
    disciplinaId: formData.get("disciplinaId"),
    topicoId: topicoRaw ? topicoRaw : null,
    duracaoMin: formData.get("duracaoMin"),
    notas: formData.get("notas") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await db.insert(sessoesEstudo).values({
    userId,
    disciplinaId: parsed.data.disciplinaId,
    topicoId: parsed.data.topicoId ?? null,
    duracaoMin: parsed.data.duracaoMin,
    notas: parsed.data.notas ?? null,
  });

  revalidatePath("/sessoes");
  revalidatePath("/dashboard");
  revalidatePath("/ciclo");
  return { success: true };
}
