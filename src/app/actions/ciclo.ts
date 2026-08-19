"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { cicloConfig } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

async function getUserId() {
  const session = await auth();
  if (!session?.user) throw new Error("Não autenticado.");
  return (session.user as { id: string }).id;
}

export async function atualizarPesoDisciplina(disciplinaId: number, peso: number) {
  const userId = await getUserId();
  const pesoClamp = Math.max(1, Math.min(5, Math.round(peso)));

  const existing = await db
    .select()
    .from(cicloConfig)
    .where(and(eq(cicloConfig.userId, userId), eq(cicloConfig.disciplinaId, disciplinaId)));

  if (existing.length > 0) {
    await db
      .update(cicloConfig)
      .set({ peso: pesoClamp })
      .where(eq(cicloConfig.id, existing[0].id));
  } else {
    await db.insert(cicloConfig).values({ userId, disciplinaId, peso: pesoClamp });
  }

  revalidatePath("/ciclo");
}
