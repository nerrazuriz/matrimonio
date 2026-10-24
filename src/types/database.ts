export interface Guest {
  id: string
  full_name: string
  email: string | null
  phone: string | null
  group_label: string | null
  table_id: string | null
  qr_token: string
  rsvp_status: 'pending' | 'confirmed' | 'declined'
  dietary_restrictions: string | null
  plus_one: boolean
  plus_one_name: string | null
  plus_one_dietary: string | null
  is_admin: boolean
  created_at: string
  updated_at: string
}

export interface Table {
  id: string
  number: number
  name: string | null
  capacity: number
  created_at: string
}

export interface Photo {
  id: string
  uploaded_by: string
  storage_path: string
  thumb_path: string | null
  caption: string | null
  is_approved: boolean
  created_at: string
}

export interface Message {
  id: string
  guest_name: string
  content: string | null
  audio_path: string | null
  is_approved: boolean
  created_at: string
}

export interface GameQuestion {
  id: string
  question_text: string
  options: { text: string; isCorrect: boolean }[]
  time_limit_sec: number
  sort_order: number
  image_url: string | null
  created_at: string
}

export interface GameSession {
  id: string
  status: 'lobby' | 'question' | 'reveal' | 'leaderboard' | 'finished'
  current_question_idx: number
  question_started_at: string | null
  created_at: string
}

export interface GamePlayer {
  id: string
  session_id: string
  player_name: string
  avatar_emoji: string
  total_score: number
  created_at: string
}

export type RsvpMode = 'easy' | 'hard' | 'expert'

export interface RsvpSubmission {
  id: string
  entered_name: string
  rsvp_mode: RsvpMode | null
  challenge_ms: number | null
  rsvp_status: 'confirmed' | 'declined'
  dietary_restrictions: string | null
  plus_one: boolean
  plus_one_name: string | null
  plus_one_dietary: string | null
  linked_guest_id: string | null
  created_at: string
  updated_at: string
}

export interface GameAnswer {
  id: string
  session_id: string
  player_id: string
  question_id: string
  selected_option: number
  is_correct: boolean
  response_time_ms: number
  points_awarded: number
  created_at: string
}
