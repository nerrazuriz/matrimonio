import type { ChallengeConfig } from './Challenge'
import ClimbGame from './games/ClimbGame'
import TriviaGame from './games/TriviaGame'
import SlidingPuzzle from './games/SlidingPuzzle'
import SeatingGame from './games/expert/SeatingGame'
import ChessGame from './games/expert/ChessGame'
import MathGame from './games/expert/MathGame'

export const HARD_CHALLENGE: ChallengeConfig = {
  storageKey: 'wedding_rsvp_challenge',
  games: [
    { title: 'Sube la montaña', Component: ClimbGame },
    { title: 'Trivia de los novios', Component: TriviaGame },
    { title: 'Arma la foto', Component: SlidingPuzzle },
  ],
  done: {
    label: 'Modo difícil superado',
    title: '¡Lo lograste!',
    text: () => 'Superaste los tres desafíos. Ahora sí, confirma tu asistencia.',
  },
}

export const EXPERT_LIVES = 3

export const EXPERT_CHALLENGE: ChallengeConfig = {
  storageKey: 'wedding_rsvp_expert',
  lives: EXPERT_LIVES,
  games: [
    { title: 'Mate en 3', Component: ChessGame },
    { title: 'Arma la mesa', Component: SeatingGame },
    { title: 'La pregunta', Component: MathGame },
  ],
  rules: [
    `Tienes ${EXPERT_LIVES} vidas para todo el modo. Cada error te quita una.`,
    'Si pierdes todas, vuelves al primer desafío.',
    'El cronómetro empieza al tocar "Comenzar" y no se detiene.',
    'Si lo completas y confirmas tu asistencia, concursas por un cotillón especial.',
  ],
  done: {
    label: 'Modo experto superado',
    title: '¡Eres experto!',
    text: elapsed =>
      `Lo completaste en ${elapsed}. Confirma tu asistencia para concursar por el cotillón especial.`,
  },
}

export const CHALLENGE_STORAGE_KEYS = [HARD_CHALLENGE.storageKey, EXPERT_CHALLENGE.storageKey]
