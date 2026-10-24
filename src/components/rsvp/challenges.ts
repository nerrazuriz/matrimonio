import type { ChallengeConfig } from './Challenge'
import ClimbGame from './games/ClimbGame'
import ChessGame from './games/ChessGame'
import SlidingPuzzle from './games/SlidingPuzzle'

// Stored as rsvp_mode 'expert': completing it enters the guest in the cotillón draw.
export const EXPERT_CHALLENGE: ChallengeConfig = {
  storageKey: 'wedding_rsvp_expert',
  games: [
    { title: 'Sube la montaña', Component: ClimbGame },
    { title: 'Mate en 3', Component: ChessGame },
    { title: 'Arma la foto', Component: SlidingPuzzle },
  ],
  done: {
    label: 'Modo difícil superado',
    title: '¡Eres un crack!',
    text: 'Superaste los tres desafíos. Confirma tu asistencia para participar por el cotillón especial.',
  },
}
