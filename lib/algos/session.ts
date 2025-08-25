import { Player, Match, Court } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export class SessionAlgorithm {
  /**
   * Initial court assignment for the start of a session
   */
  static initialAssignment(playerIds: string[], numCourts: number): {
    courts: Court[];
    waitingQueue: string[];
  } {
    const playersNeeded = numCourts * 4;
    const activePlayers = playerIds.slice(0, playersNeeded);
    const waitingQueue = playerIds.slice(playersNeeded);

    const courts: Court[] = [];
    
    for (let i = 0; i < numCourts; i++) {
      const courtPlayers = activePlayers.slice(i * 4, (i + 1) * 4);
      courts.push({
        court_number: i + 1,
        players: courtPlayers,
        is_active: true
      });
    }

    return { courts, waitingQueue };
  }

  /**
   * Generate next match after a court finishes
   */
  static generateNextMatch(
    winnerIds: string[],
    loserIds: string[],
    waitingQueue: string[],
    playerData: Player[]
  ): {
    newTeams: [string[], string[]];
    updatedQueue: string[];
  } {
    // Get next two players from queue
    const newPlayers = waitingQueue.slice(0, 2);
    const updatedQueue = [...waitingQueue.slice(2), ...loserIds];

    // Find best partners for the 4 players (2 winners + 2 new players)
    const allPlayers = [...winnerIds, ...newPlayers];
    const teams = this.findBestPartnerships(allPlayers, playerData);

    return {
      newTeams: teams,
      updatedQueue
    };
  }

  /**
   * Find the best partnerships to minimize repeat partnerships
   */
  private static findBestPartnerships(
    playerIds: string[],
    playerData: Player[]
  ): [string[], string[]] {
    const [p1, p2, p3, p4] = playerIds;
    
    // Get player data for partnership history
    const getPlayerData = (id: string) => 
      playerData.find(p => p.player_id === id) || {
        player_id: id,
        name: '',
        wins: 0,
        losses: 0,
        points_for: 0,
        points_against: 0,
        played_with: [],
        played_against: []
      };

    const pd1 = getPlayerData(p1);
    const pd2 = getPlayerData(p2);
    const pd3 = getPlayerData(p3);
    const pd4 = getPlayerData(p4);

    // Possible team combinations
    const combinations = [
      [[p1, p2], [p3, p4]],
      [[p1, p3], [p2, p4]],
      [[p1, p4], [p2, p3]]
    ];

    // Score each combination (lower is better)
    const scores = combinations.map(combo => {
      const [[t1p1, t1p2], [t2p1, t2p2]] = combo;
      let score = 0;

      // Penalize if players have played together before
      const t1Data1 = getPlayerData(t1p1);
      const t1Data2 = getPlayerData(t1p2);
      const t2Data1 = getPlayerData(t2p1);
      const t2Data2 = getPlayerData(t2p2);

      if (t1Data1.played_with.includes(t1p2)) score += 10;
      if (t2Data1.played_with.includes(t2p2)) score += 10;

      // Penalize if players have played against each other recently
      if (t1Data1.played_against.includes(t2p1) || t1Data1.played_against.includes(t2p2)) score += 1;
      if (t1Data2.played_against.includes(t2p1) || t1Data2.played_against.includes(t2p2)) score += 1;

      return score;
    });

    // Find combination with lowest score
    const bestIndex = scores.indexOf(Math.min(...scores));
    return combinations[bestIndex] as [string[], string[]];
  }

  /**
   * Update player statistics after a match
   */
  static updatePlayerStats(
    playerData: Player[],
    match: Match
  ): Player[] {
    const [team1, team2] = match.teams;
    const [score1, score2] = match.scores;
    const winnerTeam = match.winner_team_index === 0 ? team1 : team2;
    const loserTeam = match.winner_team_index === 0 ? team2 : team1;
    const winnerScore = match.winner_team_index === 0 ? score1 : score2;
    const loserScore = match.winner_team_index === 0 ? score2 : score1;

    return playerData.map(player => {
      if (winnerTeam.includes(player.player_id)) {
        return {
          ...player,
          wins: player.wins + 1,
          points_for: player.points_for + winnerScore,
          points_against: player.points_against + loserScore,
          played_with: [...new Set([...player.played_with, ...winnerTeam.filter(id => id !== player.player_id)])],
          played_against: [...new Set([...player.played_against, ...loserTeam])]
        };
      } else if (loserTeam.includes(player.player_id)) {
        return {
          ...player,
          losses: player.losses + 1,
          points_for: player.points_for + loserScore,
          points_against: player.points_against + winnerScore,
          played_with: [...new Set([...player.played_with, ...loserTeam.filter(id => id !== player.player_id)])],
          played_against: [...new Set([...player.played_against, ...winnerTeam])]
        };
      }
      return player;
    });
  }

  /**
   * Calculate current rankings
   */
  static calculateRankings(playerData: Player[]): Player[] {
    return [...playerData]
      .filter(player => player.wins + player.losses > 0) // Only players who have played
      .sort((a, b) => {
        // Primary: Win percentage
        const aWinRate = a.wins / (a.wins + a.losses);
        const bWinRate = b.wins / (b.wins + b.losses);
        if (aWinRate !== bWinRate) return bWinRate - aWinRate;

        // Secondary: Points difference
        const aPointsDiff = a.points_for - a.points_against;
        const bPointsDiff = b.points_for - b.points_against;
        if (aPointsDiff !== bPointsDiff) return bPointsDiff - aPointsDiff;

        // Tertiary: Total points scored
        return b.points_for - a.points_for;
      });
  }
}