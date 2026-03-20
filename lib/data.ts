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

export const INITIAL_JORNADAS: Jornada[] = [
  { id: 1,  ultimo: "Ivan",   penultimo: "Tosin",  primero: "Calvo"  },
  { id: 2,  ultimo: "Ivan",   penultimo: "Ruben",  primero: "Guille" },
  { id: 3,  ultimo: "Ivan",   penultimo: "Guille", primero: "Tosin"  },
  { id: 4,  ultimo: "Ivan",   penultimo: "Delope", primero: "Guille" },
  { id: 5,  ultimo: "Ruben",  penultimo: "Ivan",   primero: "Calvo"  },
  { id: 6,  ultimo: "Tosin",  penultimo: "Ruben",  primero: "Calvo"  },
  { id: 7,  ultimo: "Ruben",  penultimo: "Felix",  primero: "Guille" },
  { id: 8,  ultimo: "Delope", penultimo: "Tosin",  primero: "Felix"  },
  { id: 9,  ultimo: "Ruben",  penultimo: "Tosin",  primero: "Ivan"   },
  { id: 10, ultimo: "Tosin",  penultimo: "Ivan",   primero: "Guille" },
  { id: 11, ultimo: "Calvo",  penultimo: "Ruben",  primero: "Delope" },
  { id: 12, ultimo: "Tosin",  penultimo: "Guille", primero: "Ivan"   },
  { id: 13, ultimo: "Delope", penultimo: "Tosin",  primero: "Jaime"  },
  { id: 14, ultimo: "Delope", penultimo: "Guille", primero: "Jaime"  },
  { id: 15, ultimo: "Calvo",  penultimo: "Tosin",  primero: "Ruben"  },
  { id: 16, ultimo: "Delope", penultimo: "Tosin",  primero: "Guille" },
  { id: 17, ultimo: "Delope", penultimo: "Guille", primero: "Felix"  },
  { id: 18, ultimo: "Calvo",  penultimo: "Ruben",  primero: "Guille" },
  { id: 19, ultimo: "Ruben",  penultimo: "Delope", primero: "Calvo"  },
  { id: 20, ultimo: "Guille", penultimo: "Calvo",  primero: "Tosin"  },
  { id: 21, ultimo: "Ruben",  penultimo: "Felix",  primero: "Jaime"  },
  { id: 22, ultimo: "Delope", penultimo: "Jaime",  primero: "Ivan"   },
  { id: 23, ultimo: "Ruben",  penultimo: "Delope", primero: "Calvo"  },
  { id: 24, ultimo: "Calvo",  penultimo: "Delope", primero: "Felix"  },
  { id: 25, ultimo: "Jaime",  penultimo: "Felix",  primero: "Guille" },
  { id: 26, ultimo: "Guille", penultimo: "Calvo",  primero: "Ivan"   },
  { id: 27, ultimo: "Delope", penultimo: "Felix",  primero: "Jaime"  },
  { id: 28, ultimo: "Felix",  penultimo: "Delope", primero: "Guille" },
];

export const INITIAL_PAYMENTS: Record<string, number> = {
  Delope: 21.5,
  Ruben:  20.5,
  Tosin:  19.5,
  Ivan:   14,
  Calvo:  14,
  Guille: 13,
  Felix:  10.5,
  Jaime:  4.5,
};

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
