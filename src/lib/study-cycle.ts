// Ciclo de estudos por rodízio ponderado (round-robin proporcional).
// Cada disciplina tem um peso (1 a 5, definido pelo usuário conforme a
// importância/nº de questões na prova). A cada momento, sugerimos a
// disciplina cuja razão (minutos já estudados / peso) é a menor — ou seja,
// a que está mais "atrasada" em relação à prioridade que deveria receber.
// É a mesma lógica por trás do clássico "ciclo de estudos" usado por
// professores de cursinho para concursos.

export type DisciplinaCiclo = {
  id: number;
  nome: string;
  bloco: string;
  peso: number;
  minutosEstudados: number;
};

export type DisciplinaCicloRank = DisciplinaCiclo & { razao: number; posicao: number };

export function calcularOrdemDoCiclo(disciplinas: DisciplinaCiclo[]): DisciplinaCicloRank[] {
  const comRazao = disciplinas.map((d) => ({
    ...d,
    razao: d.minutosEstudados / Math.max(d.peso, 1),
  }));

  comRazao.sort((a, b) => a.razao - b.razao);

  return comRazao.map((d, i) => ({ ...d, posicao: i + 1 }));
}
