// Metodologia de revisão espaçada usada pela plataforma:
// Revisão 1 -> feita no próprio dia em que o tópico é estudado (marcação manual).
// Revisão 2 -> agendada automaticamente para 7 dias após a Revisão 1.
// Revisão 3 -> agendada automaticamente para 30 dias após a Revisão 2.
// Esses intervalos seguem a curva do esquecimento (Ebbinghaus) e são os mesmos
// recomendados pelos professores no e-book do edital verticalizado.

export const DIAS_ATE_REVISAO_2 = 7;
export const DIAS_ATE_REVISAO_3 = 30;

export function proximaDataRevisao(dataBase: Date, dias: number): Date {
  const data = new Date(dataBase);
  data.setDate(data.getDate() + dias);
  return data;
}

export function formatarDataISO(data: Date): string {
  return data.toISOString().slice(0, 10);
}
