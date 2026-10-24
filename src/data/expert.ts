// --- Arma la mesa -----------------------------------------------------------
// Seats 0..5. Seats 0-2 are on the dance-floor side (their backs to it), 3-5 on the garden side
// (facing the dance floor). Column 0 is the end nearest the couple's table.
// Clues verified offline by brute force: exactly one of the 720 arrangements satisfies all of
// them, and removing any single clue allows more than one.

export const GUESTS = ['abuela', 'tio', 'tia', 'primo', 'madrina', 'amigo'] as const
export type Guest = (typeof GUESTS)[number]
export type Seating = Partial<Record<Guest, number>>

export const GUEST_LABEL: Record<Guest, string> = {
  abuela: 'La abuela',
  tio: 'El tío',
  tia: 'La tía',
  primo: 'El primo',
  madrina: 'La madrina',
  amigo: 'El amigo del novio',
}

const side = (s: number) => Math.floor(s / 3)
const col = (s: number) => s % 3
const facing = (a: number, b: number) => side(a) !== side(b) && col(a) === col(b)

export const SEATING_CLUES: { text: string; holds: (s: Record<Guest, number>) => boolean }[] = [
  { text: 'El tío y la tía están peleados: no quieren quedar frente a frente.', holds: s => !facing(s.tio, s.tia) },
  { text: 'La abuela se sienta más cerca de los novios que la tía.', holds: s => col(s.abuela) < col(s.tia) },
  { text: 'El primo y el tío se sientan del mismo lado de la mesa.', holds: s => side(s.primo) === side(s.tio) },
  { text: 'La abuela y el primo se sientan del mismo lado de la mesa.', holds: s => side(s.abuela) === side(s.primo) },
  { text: 'La tía quiere mirar la pista de baile.', holds: s => side(s.tia) === 1 },
  { text: 'El primo se sienta más cerca de los novios que la madrina.', holds: s => col(s.primo) < col(s.madrina) },
]

// --- Ajedrez: mate en 3 -----------------------------------------------------
// Lichess puzzle LOPOF. Verified offline with chess.js: no mate in 1 or 2 exists, and at every
// step the listed move is the only one that keeps a forced mate (the last one is the only mate).

export const CHESS_START = 'r1b2rk1/p5p1/2pqp1P1/5p2/4p3/2P1p3/PP1N1P2/R2QK2R'

export const CHESS_STEPS: { move: string; after: string; reply?: { move: string; after: string } }[] = [
  {
    move: 'h1h8',
    after: 'r1b2rkR/p5p1/2pqp1P1/5p2/4p3/2P1p3/PP1N1P2/R2QK3',
    reply: { move: 'g8h8', after: 'r1b2r1k/p5p1/2pqp1P1/5p2/4p3/2P1p3/PP1N1P2/R2QK3' },
  },
  {
    move: 'd1h5',
    after: 'r1b2r1k/p5p1/2pqp1P1/5p1Q/4p3/2P1p3/PP1N1P2/R3K3',
    reply: { move: 'h8g8', after: 'r1b2rk1/p5p1/2pqp1P1/5p1Q/4p3/2P1p3/PP1N1P2/R3K3' },
  },
  { move: 'h5h7', after: 'r1b2rk1/p5pQ/2pqp1P1/5p2/4p3/2P1p3/PP1N1P2/R3K3' },
]
