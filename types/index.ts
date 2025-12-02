export interface Player {
  player_id: string;
  name: string;
  wins: number;
  losses: number;
  points_for: number;
  points_against: number;
  played_with: string[];
  played_against: string[];
  skill_rating: number; // Historical performance rating (0-1000)
  session_skill_rating: number; // Session-specific rating that resets
  is_active: boolean; // Currently in session
  is_paused: boolean; // Temporarily paused from rotation
}

export interface Match {
  match_id: string;
  teams: [string[], string[]]; // [[player1_id, player2_id], [player3_id, player4_id]]
  scores: [number, number];
  winner_team_index: 0 | 1;
  court_number: number;
  start_time: Date;
  end_time?: Date;
  status: 'upcoming' | 'in_progress' | 'completed' | 'paused';
  duration_seconds?: number;
}

export interface Court {
  court_number: number;
  players: string[];
  is_active: boolean;
  status: 'available' | 'in_progress' | 'paused' | 'maintenance';
  current_match?: Match;
  next_players?: string[];
}

export interface VenueDetails {
  name: string;
  address: string;
  mapsUrl: string;
  parkingUrl?: string;
  parkingAddress?: string;
}

export type SessionStatus = 'upcoming' | 'live' | 'completed';
export type GameType = 'partnership_rotation' | 'tournament_single' | 'round_robin' | 'peg_system' | 'full_rotation';
export type PegSystemMode = 'balanced_teams' | 'skill_based_courts';
export type ScoringSystem = 'single_set_21' | 'best_of_3' | 'time_limited';

export interface SessionConfig {
  game_type: GameType;
  peg_system_mode?: PegSystemMode; // Only for peg system
  scoring_system: ScoringSystem;
  court_count: number;
  max_duration_minutes: number; // Usually 120 (2 hours)
  match_timeout_minutes?: number;
  skill_balancing: boolean;
}

export interface TournamentBracket {
  round: number;
  matches: Match[];
  eliminated_players: string[];
}

export interface Session {
  _id?: string;
  date: Date;
  location: 'Watford Central' | 'Fuller Health Life Centre';
  config: SessionConfig;
  courts_data: Court[];
  player_data: Player[];
  matches: Match[];
  rankings: Player[];
  is_live: boolean;
  status: SessionStatus;
  completed_at?: Date;
  waiting_queue: string[]; // player_ids
  next_up_queue: string[]; // Next 4 players to play
  tournament_bracket?: TournamentBracket[];
  session_start_time?: Date;
  
  // Legacy support
  courts: number; // Deprecated, use config.court_count
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

export interface TournamentPlayer {
  playerId: string;
  name: string;
}

export interface TournamentTeam {
  id: string;
  name: string;
  players: TournamentPlayer[];
}

export interface TournamentMatch {
  id: string;
  teamAId: string;
  teamBId: string;
  roundId: string;
  court: number;
}

export interface TournamentRound {
  id: string;
  title: string;
  matches: TournamentMatch[];
}

export type TournamentStatus = 'draft' | 'live' | 'completed';

export interface TournamentMatchResult {
  scoreA: number;
  scoreB: number;
  roundId: string;
  court: number;
  updatedAt: Date;
}

export interface TournamentPlayerStats {
  playerId: string;
  name: string;
  teamId: string;
  teamName: string;
  wins: number;
  gamesPlayed: number;
  points: number;
  pointDiff: number;
}

export interface TournamentTeamStats {
  teamId: string;
  name: string;
  wins: number;
  gamesPlayed: number;
  points: number;
  pointDiff: number;
}

export interface TournamentRecord {
  _id?: string;
  teams: TournamentTeam[];
  courtCount: number;
  rounds: TournamentRound[];
  status: TournamentStatus;
  results: Record<string, TournamentMatchResult>;
  createdAt: Date;
  updatedAt: Date;
  playerRankings?: TournamentPlayerStats[];
}

export interface Court {
  court_number: number;
  players: string[]; // player_ids (length 4)
  is_active: boolean;
  current_match?: Match;
}
