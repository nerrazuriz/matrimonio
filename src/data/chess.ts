// Lichess puzzle LOPOF (mate in 3). Verified offline with chess.js: no mate in 1 or 2 exists, and at
// every step the listed move is the only one that keeps a forced mate (the last one is the only mate).

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
