import "dotenv/config";
import { db } from "./index";
import { disciplinas, topicos, cicloConfig, users } from "./schema";
import { EDITAL_PRF } from "./edital-prf";
import { eq } from "drizzle-orm";

async function main() {
  console.log("Semeando banco com o edital verticalizado da PRF...");

  const existentes = await db.select().from(disciplinas);
  if (existentes.length > 0) {
    console.log(`Já existem ${existentes.length} disciplinas no banco. Pulando seed do edital.`);
  } else {
    for (const d of EDITAL_PRF) {
      const [disciplina] = await db
        .insert(disciplinas)
        .values({ bloco: d.bloco, nome: d.nome, ordem: d.ordem })
        .returning();

      const rows = d.topicos.map((t, i) => ({
        disciplinaId: disciplina.id,
        parentId: null,
        numero: t.numero,
        titulo: t.titulo,
        ordem: i,
        nivel: t.nivel,
      }));

      if (rows.length > 0) {
        await db.insert(topicos).values(rows);
      }
      console.log(`  + ${d.nome} (${d.topicos.length} tópicos)`);
    }
    console.log("Edital semeado com sucesso.");
  }

  // Cria um usuário demo para facilitar testes locais
  const demoEmail = "demo@prfestudos.local";
  const existingUser = await db.select().from(users).where(eq(users.email, demoEmail));
  if (existingUser.length === 0) {
    const bcrypt = await import("bcryptjs");
    const passwordHash = await bcrypt.hash("demo1234", 10);
    const [user] = await db
      .insert(users)
      .values({ name: "Usuário Demo", email: demoEmail, passwordHash })
      .returning();

    const allDisciplinas = await db.select().from(disciplinas);
    await db.insert(cicloConfig).values(
      allDisciplinas.map((d) => ({ userId: user.id, disciplinaId: d.id, peso: 3 }))
    );
    console.log(`Usuário demo criado: ${demoEmail} / senha: demo1234`);
  } else {
    console.log("Usuário demo já existe.");
  }

  console.log("Seed finalizado.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
