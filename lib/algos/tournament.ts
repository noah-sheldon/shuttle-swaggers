import { Player, Match, Court, GameType, SessionConfig, TournamentBracket, PegSystemMode } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class TournamentAlgorithms {
  
  /**
   * Initialize session based on game type
   */
  static initializeSession(
    players: Player[], 
    config: SessionConfig
  ): {
    courts_data: Court[];
    waiting_queue: string[];
    next_up_queue: string[];
    tournament_bracket?: TournamentBracket[];
  } {
    const activePlayers = players.filter(p => p.is_active && !p.is_paused);
    
    switch (config.game_type) {
      case 'partnership_rotation':
        return this.initializePartnershipRotation(activePlayers, config);
      case 'tournament_single':
        return this.initializeTournament(activePlayers, config);
      case 'round_robin':
        return this.initializeRoundRobin(activePlayers, config);
      case 'peg_system':
        return this.initializePegSystem(activePlayers, config);
      default:
        throw new Error(`Unsupported game type: ${config.game_type}`);
    }
  }

  /**
   * Partnership Rotation System (current system)
   */
  private static initializePartnershipRotation(
    players: Player[], 
    config: SessionConfig
  ): {
    courts_data: Court[];
    waiting_queue: string[];
    next_up_queue: string[];
  } {
    const playersNeeded = config.court_count * 4;
    const activePlayers = players.slice(0, playersNeeded);
    const waitingQueue = players.slice(playersNeeded).map(p => p.player_id);

    const courts_data: Court[] = [];
    
    for (let i = 0; i < config.court_count; i++) {
      const courtPlayers = activePlayers.slice(i * 4, (i + 1) * 4).map(p => p.player_id);
      courts_data.push({
        court_number: i + 1,
        players: courtPlayers,
        is_active: true,
        status: 'in_progress'
      });
    }

    const next_up_queue = waitingQueue.slice(0, 4);

    return { courts_data, waiting_queue: waitingQueue, next_up_queue };
  }

  /**
   * Single Elimination Tournament
   */
  private static initializeTournament(
    players: Player[], 
    config: SessionConfig
  ): {
    courts_data: Court[];
    waiting_queue: string[];
    next_up_queue: string[];
    tournament_bracket: TournamentBracket[];
  } {
    // Need power of 2 players for clean bracket
    const tournamentPlayers = this.getPowerOf2Players(players);
    const bracket = this.createTournamentBracket(tournamentPlayers);
    
    // Start first round matches
    const firstRound = bracket[0];
    const courts_data: Court[] = [];
    
    for (let i = 0; i < Math.min(config.court_count, firstRound.matches.length); i++) {
      const match = firstRound.matches[i];
      const courtPlayers = [...match.teams[0], ...match.teams[1]];
      
      courts_data.push({
        court_number: i + 1,
        players: courtPlayers,
        is_active: true,
        status: 'in_progress',
        current_match: match
      });
    }

    const remainingMatches = firstRound.matches.slice(config.court_count);
    const waiting_queue = remainingMatches.flatMap(m => [...m.teams[0], ...m.teams[1]]);
    const next_up_queue = waiting_queue.slice(0, 4);

    return { courts_data, waiting_queue, next_up_queue, tournament_bracket: bracket };
  }

  /**
   * Round Robin Tournament
   */
  private static initializeRoundRobin(
    players: Player[], 
    config: SessionConfig
  ): {
    courts_data: Court[];
    waiting_queue: string[];
    next_up_queue: string[];
  } {
    const allMatches = this.generateRoundRobinMatches(players);
    
    // Start first matches
    const courts_data: Court[] = [];
    for (let i = 0; i < Math.min(config.court_count, allMatches.length); i++) {
      const match = allMatches[i];
      const courtPlayers = [...match.teams[0], ...match.teams[1]];
      
      courts_data.push({
        court_number: i + 1,
        players: courtPlayers,
        is_active: true,
        status: 'in_progress',
        current_match: match
      });
    }

    const remainingMatches = allMatches.slice(config.court_count);
    const waiting_queue = remainingMatches.flatMap(m => [...m.teams[0], ...m.teams[1]]);
    const next_up_queue = waiting_queue.slice(0, 4);

    return { courts_data, waiting_queue, next_up_queue };
  }

  /**
   * Peg System (Court Hierarchy)
   */
  private static initializePegSystem(
    players: Player[], 
    config: SessionConfig
  ): {
    courts_data: Court[];
    waiting_queue: string[];
    next_up_queue: string[];
  } {
    const sortedPlayers = [...players].sort((a, b) => {
      // Sort by session skill rating (higher is better)
      return b.session_skill_rating - a.session_skill_rating;
    });

    const playersNeeded = config.court_count * 4;
    const courtPlayers = sortedPlayers.slice(0, playersNeeded);
    const waitingPlayers = sortedPlayers.slice(playersNeeded);

    const courts_data: Court[] = [];
    
    for (let i = 0; i < config.court_count; i++) {
      const startIdx = i * 4;
      const endIdx = startIdx + 4;
      const playersForCourt = courtPlayers.slice(startIdx, endIdx);
      
      let teams: [string[], string[]];
      
      if (config.peg_system_mode === 'balanced_teams') {
        // Balance teams within each court
        teams = this.balanceTeamsForCourt(playersForCourt);
      } else {
        // Skill-based: strongest vs weakest in each court
        teams = [
          [playersForCourt[0].player_id, playersForCourt[3].player_id], // Best + worst
          [playersForCourt[1].player_id, playersForCourt[2].player_id]  // 2nd best + 2nd worst
        ];
      }
      
      courts_data.push({
        court_number: i + 1,
        players: [...teams[0], ...teams[1]],
        is_active: true,
        status: 'in_progress'
      });
    }

    const waiting_queue = waitingPlayers.map(p => p.player_id);
    const next_up_queue = waiting_queue.slice(0, 4);

    return { courts_data, waiting_queue, next_up_queue };
  }

  /**
   * Generate next matches after completion
   */
  static generateNextMatch(
    completedMatch: Match,
    session: any,
    config: SessionConfig
  ): {
    newMatch?: Match;
    updatedCourts: Court[];
    updatedWaitingQueue: string[];
    updatedNextUpQueue: string[];
  } {
    switch (config.game_type) {
      case 'partnership_rotation':
        return this.handlePartnershipRotation(completedMatch, session, config);
      case 'tournament_single':
        return this.handleTournamentProgression(completedMatch, session, config);
      case 'round_robin':
        return this.handleRoundRobinProgression(completedMatch, session, config);
      case 'peg_system':
        return this.handlePegSystemProgression(completedMatch, session, config);
      default:
        throw new Error(`Unsupported game type: ${config.game_type}`);
    }
  }

  /**
   * Helper: Get power of 2 players for tournament
   */
  private static getPowerOf2Players(players: Player[]): Player[] {
    const powers = [4, 8, 16, 32, 64]; // Common tournament sizes for badminton
    const targetSize = powers.find(p => p >= players.length) || powers[0];
    return players.slice(0, targetSize);
  }

  /**
   * Helper: Create tournament bracket structure
   */
  private static createTournamentBracket(players: Player[]): TournamentBracket[] {
    const bracket: TournamentBracket[] = [];
    let currentPlayers = [...players];
    let round = 1;

    while (currentPlayers.length > 4) { // Until we have finalists
      const matches: Match[] = [];
      const nextRoundPlayers: string[] = [];

      // Pair players into matches (every 4 players = 1 match)
      for (let i = 0; i < currentPlayers.length; i += 4) {
        const matchPlayers = currentPlayers.slice(i, i + 4);
        if (matchPlayers.length === 4) {
          const match: Match = {
            match_id: uuidv4(),
            teams: [
              [matchPlayers[0].player_id, matchPlayers[1].player_id],
              [matchPlayers[2].player_id, matchPlayers[3].player_id]
            ],
            scores: [0, 0],
            winner_team_index: 0,
            court_number: 0,
            start_time: new Date(),
            status: 'upcoming'
          };
          matches.push(match);
        }
      }

      bracket.push({
        round,
        matches,
        eliminated_players: []
      });

      // Prepare next round (winners advance)
      currentPlayers = []; // Will be populated when matches complete
      round++;
    }

    return bracket;
  }

  /**
   * Helper: Generate all round robin matches
   */
  private static generateRoundRobinMatches(players: Player[]): Match[] {
    const matches: Match[] = [];
    const playerIds = players.map(p => p.player_id);

    // Generate all possible team combinations
    const teams: string[][] = [];
    for (let i = 0; i < playerIds.length; i += 2) {
      if (i + 1 < playerIds.length) {
        teams.push([playerIds[i], playerIds[i + 1]]);
      }
    }

    // Generate matches between all team combinations
    for (let i = 0; i < teams.length; i++) {
      for (let j = i + 1; j < teams.length; j++) {
        // Ensure no player plays twice in same match
        const team1 = teams[i];
        const team2 = teams[j];
        const hasOverlap = team1.some(p => team2.includes(p));
        
        if (!hasOverlap) {
          matches.push({
            match_id: uuidv4(),
            teams: [team1, team2],
            scores: [0, 0],
            winner_team_index: 0,
            court_number: 0,
            start_time: new Date(),
            status: 'upcoming'
          });
        }
      }
    }

    return matches;
  }

  /**
   * Helper: Balance teams for a court
   */
  private static balanceTeamsForCourt(players: Player[]): [string[], string[]] {
    // Sort by skill rating
    const sorted = [...players].sort((a, b) => b.session_skill_rating - a.session_skill_rating);
    
    // Distribute for balanced teams: [best + 3rd best] vs [2nd best + worst]
    return [
      [sorted[0].player_id, sorted[2].player_id],
      [sorted[1].player_id, sorted[3].player_id]
    ];
  }

  // Progression handlers would continue here...
  private static handlePartnershipRotation(completedMatch: Match, session: any, config: SessionConfig) {
    // Implementation for partnership rotation progression
    return {
      updatedCourts: session.courts_data,
      updatedWaitingQueue: session.waiting_queue,
      updatedNextUpQueue: session.next_up_queue
    };
  }

  private static handleTournamentProgression(completedMatch: Match, session: any, config: SessionConfig) {
    // Implementation for tournament progression
    return {
      updatedCourts: session.courts_data,
      updatedWaitingQueue: session.waiting_queue,
      updatedNextUpQueue: session.next_up_queue
    };
  }

  private static handleRoundRobinProgression(completedMatch: Match, session: any, config: SessionConfig) {
    // Implementation for round robin progression
    return {
      updatedCourts: session.courts_data,
      updatedWaitingQueue: session.waiting_queue,
      updatedNextUpQueue: session.next_up_queue
    };
  }

  private static handlePegSystemProgression(completedMatch: Match, session: any, config: SessionConfig) {
    // Implementation for peg system progression (winners stay, losers move down)
    return {
      updatedCourts: session.courts_data,
      updatedWaitingQueue: session.waiting_queue,
      updatedNextUpQueue: session.next_up_queue
    };
  }

  /**
   * Update skill ratings based on match results
   */
  static updateSkillRatings(
    players: Player[],
    completedMatch: Match,
    useHistorical: boolean = true
  ): Player[] {
    const [winnerTeam, loserTeam] = completedMatch.winner_team_index === 0 
      ? [completedMatch.teams[0], completedMatch.teams[1]]
      : [completedMatch.teams[1], completedMatch.teams[0]];

    return players.map(player => {
      if (winnerTeam.includes(player.player_id)) {
        return {
          ...player,
          session_skill_rating: Math.min(1000, player.session_skill_rating + 25),
          skill_rating: useHistorical 
            ? Math.min(1000, player.skill_rating + 15)
            : player.skill_rating
        };
      } else if (loserTeam.includes(player.player_id)) {
        return {
          ...player,
          session_skill_rating: Math.max(0, player.session_skill_rating - 20),
          skill_rating: useHistorical 
            ? Math.max(0, player.skill_rating - 10)
            : player.skill_rating
        };
      }
      return player;
    });
  }

  /**
   * Reset session skill ratings (start fresh)
   */
  static resetSessionRatings(players: Player[]): Player[] {
    return players.map(player => ({
      ...player,
      session_skill_rating: 500, // Default middle rating
      wins: 0,
      losses: 0,
      points_for: 0,
      points_against: 0,
      played_with: [],
      played_against: []
    }));
  }
}