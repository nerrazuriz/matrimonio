export type TriviaQuestion = {
  question: string
  options: string[]
  answer: number
}

// Replace with personal questions about the couple; `answer` is the index of the correct option.
export const TRIVIA: TriviaQuestion[] = [
  {
    question: '¿Qué día se casan Nico y Cote?',
    options: ['11 de diciembre', '12 de diciembre', '11 de noviembre', '6 de diciembre'],
    answer: 0,
  },
  {
    question: '¿Dónde es la ceremonia?',
    options: [
      'Parroquia El Bosque',
      'Iglesia del Colegio Santa Úrsula',
      'Catedral de Santiago',
      'Capilla Los Dominicos',
    ],
    answer: 1,
  },
  {
    question: '¿Dónde es la fiesta?',
    options: ['Casona Las Condes', 'Viña Santa Rita', 'Hacienda Porvenir', 'Club de Golf'],
    answer: 2,
  },
]
