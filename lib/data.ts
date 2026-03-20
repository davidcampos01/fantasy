export type Player = string;

export interface Jornada {
  id: number;
  ultimo: Player;
  penultimo: Player;
  primero?: Player;
}

export interface PlayerStats {
  name: Player;
  ultimos: number;
  penultimos: number;
  primeros: number;
  totalDebt: number;
  paid: number;
  owes: number;
}

export const ULTIMO_COST = 2.5;
export const PENULTIMO_COST = 2.0;

export const DEFAULT_PLAYERS: Player[] = [
  "Delope", "Ruben", "Tosin", "Ivan", "Calvo", "Guille", "Felix", "Jaime"
];

export function calcStats(players: Player[], jornadas: Jornada[], payments: Record<string, number>): PlayerStats[] {
  return players.map(name => {
    const ultimos = jornadas.filter(j => j.ultimo === name).length;
    const penultimos = jornadas.filter(j => j.penultimo === name).length;
    const primeros = jornadas.filter(j => j.primero === name).length;
    const totalDebt = ultimos * ULTIMO_COST + penultimos * PENULTIMO_COST;
    const paid = payments[name] ?? 0;
    const owes = Math.max(0, totalDebt - paid);
    return { name, ultimos, penultimos, primeros, totalDebt, paid, owes };
  });
}
