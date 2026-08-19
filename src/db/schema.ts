import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  boolean,
  timestamp,
  uuid,
  uniqueIndex,
  date,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------- Usuários ----------
export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 120 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- Estrutura do edital ----------
export const disciplinas = pgTable("disciplinas", {
  id: serial("id").primaryKey(),
  bloco: varchar("bloco", { length: 10 }).notNull(), // "I", "II", "III"
  nome: varchar("nome", { length: 120 }).notNull(),
  ordem: integer("ordem").notNull(),
  cor: varchar("cor", { length: 20 }).default("rose"),
});

export const topicos = pgTable("topicos", {
  id: serial("id").primaryKey(),
  disciplinaId: integer("disciplina_id")
    .notNull()
    .references(() => disciplinas.id, { onDelete: "cascade" }),
  parentId: integer("parent_id"),
  numero: varchar("numero", { length: 20 }).notNull(),
  titulo: text("titulo").notNull(),
  ordem: integer("ordem").notNull(),
  nivel: integer("nivel").notNull().default(1), // profundidade hierárquica
});

// ---------- Progresso do usuário por tópico ----------
export const topicoProgresso = pgTable(
  "topico_progresso",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    topicoId: integer("topico_id")
      .notNull()
      .references(() => topicos.id, { onDelete: "cascade" }),
    revisao1: boolean("revisao1").notNull().default(false),
    revisao1At: timestamp("revisao1_at", { withTimezone: true }),
    revisao2: boolean("revisao2").notNull().default(false),
    revisao2At: timestamp("revisao2_at", { withTimezone: true }),
    revisao3: boolean("revisao3").notNull().default(false),
    revisao3At: timestamp("revisao3_at", { withTimezone: true }),
    questoesNum: integer("questoes_num").notNull().default(0),
    questoesAcertos: integer("questoes_acertos").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex("topico_progresso_user_topico_idx").on(t.userId, t.topicoId)]
);

// ---------- Revisões agendadas (repetição espaçada) ----------
export const revisoesAgendadas = pgTable("revisoes_agendadas", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  topicoId: integer("topico_id")
    .notNull()
    .references(() => topicos.id, { onDelete: "cascade" }),
  etapa: varchar("etapa", { length: 10 }).notNull(), // "r2" | "r3"
  dataPrevista: date("data_prevista").notNull(),
  concluidaEm: timestamp("concluida_em", { withTimezone: true }),
});

// ---------- Sessões de estudo ----------
export const sessoesEstudo = pgTable("sessoes_estudo", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  disciplinaId: integer("disciplina_id").references(() => disciplinas.id, {
    onDelete: "set null",
  }),
  topicoId: integer("topico_id").references(() => topicos.id, { onDelete: "set null" }),
  duracaoMin: integer("duracao_min").notNull(),
  notas: text("notas"),
  criadaEm: timestamp("criada_em", { withTimezone: true }).defaultNow().notNull(),
});

// ---------- Ciclo de estudos ----------
export const cicloConfig = pgTable(
  "ciclo_config",
  {
    id: serial("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    disciplinaId: integer("disciplina_id")
      .notNull()
      .references(() => disciplinas.id, { onDelete: "cascade" }),
    peso: integer("peso").notNull().default(3), // 1 (baixa prioridade) a 5 (alta)
  },
  (t) => [uniqueIndex("ciclo_config_user_disciplina_idx").on(t.userId, t.disciplinaId)]
);

// ---------- Simulados ----------
export const simulados = pgTable("simulados", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  nome: varchar("nome", { length: 150 }).notNull(),
  data: date("data").notNull(),
  totalQuestoes: integer("total_questoes").notNull(),
  totalAcertos: integer("total_acertos").notNull(),
  notas: text("notas"),
});

export const simuladoMaterias = pgTable("simulado_materias", {
  id: serial("id").primaryKey(),
  simuladoId: integer("simulado_id")
    .notNull()
    .references(() => simulados.id, { onDelete: "cascade" }),
  disciplinaId: integer("disciplina_id")
    .notNull()
    .references(() => disciplinas.id, { onDelete: "cascade" }),
  questoes: integer("questoes").notNull(),
  acertos: integer("acertos").notNull(),
});

// ---------- Relations ----------
export const disciplinasRelations = relations(disciplinas, ({ many }) => ({
  topicos: many(topicos),
}));

export const topicosRelations = relations(topicos, ({ one, many }) => ({
  disciplina: one(disciplinas, {
    fields: [topicos.disciplinaId],
    references: [disciplinas.id],
  }),
  progresso: many(topicoProgresso),
}));

export const usersRelations = relations(users, ({ many }) => ({
  progresso: many(topicoProgresso),
  sessoes: many(sessoesEstudo),
  simulados: many(simulados),
}));
