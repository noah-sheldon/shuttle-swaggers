export interface Player {
  player_id: string;
  name: string;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  played_with: string[];
  played_against: string[];
}

export interface Match {
  match_id: string;
  teams: [string[], string[]]; // [[player1_id, player2_id], [player3_id, player4_id]]
  scores: [number, number];
  winner_team_index: 0 | 1;
  court_number: number;
}

export interface VenueDetails {
  name: string;
  address: string;
  mapsUrl: string;
  parkingUrl?: string;
  parkingAddress?: string;
}

export type SessionStatus = 'upcoming' | 'live' | 'completed';

export interface Session {
  _id?: string;
  date: Date;
  location: 'Watford Central' | 'Fuller Health Life Centre';
  courts: number;
  player_data: Player[];
  matches: Match[];
  rankings: Player[];
  is_live: boolean;
  status: SessionStatus;
  completed_at?: Date;
  waiting_queue: string[]; // player_ids
}

export interface GuestSignUp {
  _id?: string;
  name: string;
  email: string;
  mobile: string;
  feather_experience: 'No Experience' | 'Some Experience' | 'Play Regularly';
  league_experience: boolean;
  league_name?: string;
  player_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'High Intermediate';
  fitness_level: number; // 1-5
  session_id: string;
  created_at: Date;
}

export interface Court {
  court_number: number;
  players: string[]; // player_ids (length 4)
  is_active: boolean;
  current_match?: Match;
}