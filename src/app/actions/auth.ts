"use server";

import { db } from "@/db";
import { users, cicloConfig, disciplinas } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { z } from "zod";

const signupSchema = z.object({
  name: z.string().min(2, "Informe seu nome."),
  email: z.string().email("E-mail inválido."),
  password: z.string().min(6, "A senha deve ter ao menos 6 caracteres."),
});

export type SignupState = { error?: string; success?: boolean };

export async function signupAction(_prev: SignupState, formData: FormData): Promise<SignupState> {
  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const { name, email, password } = parsed.data;

  const existing = await db.select().from(users).where(eq(users.email, email));
  if (existing.length > 0) {
    return { error: "Já existe uma conta com esse e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db.insert(users).values({ name, email, passwordHash }).returning();

  // inicializa o ciclo de estudos com peso padrão para todas as disciplinas
  const todasDisciplinas = await db.select().from(disciplinas);
  if (todasDisciplinas.length > 0) {
    await db
      .insert(cicloConfig)
      .values(todasDisciplinas.map((d) => ({ userId: user.id, disciplinaId: d.id, peso: 3 })));
  }

  return { success: true };
}
