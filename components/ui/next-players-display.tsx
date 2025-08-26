'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, Clock, ArrowRight } from 'lucide-react';
import { Player } from '@/types';

interface NextPlayersDisplayProps {
  nextUpQueue: string[];
  playerData: Player[];
  courts: any[];
  onStartNextMatch?: (courtNumber: number) => void;
  showStartButton?: boolean;
}

export function NextPlayersDisplay({ 
  nextUpQueue, 
  playerData, 
  courts, 
  onStartNextMatch,
  showStartButton = false 
}: NextPlayersDisplayProps) {
  
  const getPlayerName = (playerId: string): string => {
    const player = playerData.find(p => p.player_id === playerId);
    return player?.name || `Player ${playerId.slice(-4)}`;
  };

  const getPlayerRating = (playerId: string): number => {
    const player = playerData.find(p => p.player_id === playerId);
    return player?.session_skill_rating || 500;
  };

  const getAvailableCourt = (): number | null => {
    const availableCourt = courts.find(court => 
      court.status === 'available' || court.status === 'completed'
    );
    return availableCourt?.court_number || null;
  };

  const getNextFourPlayers = () => {
    return nextUpQueue.slice(0, 4).map(playerId => ({
      id: playerId,
      name: getPlayerName(playerId),
      rating: getPlayerRating(playerId)
    }));
  };

  const nextPlayers = getNextFourPlayers();
  const availableCourt = getAvailableCourt();
  const hasEnoughPlayers = nextPlayers.length === 4;

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-[#004d40]">
            <Users className="w-5 h-5" />
            Next Players
          </CardTitle>
          <div className="flex items-center gap-2">
            {hasEnoughPlayers && availableCourt && (
              <Badge className="bg-green-100 text-green-700 border-green-200">
                Ready
              </Badge>
            )}
            {!hasEnoughPlayers && (
              <Badge className="bg-yellow-100 text-yellow-700 border-yellow-200">
                Waiting for Players
              </Badge>
            )}
            {hasEnoughPlayers && !availableCourt && (
              <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                Waiting for Court
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {nextPlayers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No players in queue</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Next 4 Players Grid */}
            <div className="grid grid-cols-2 gap-3">
              {nextPlayers.map((player, index) => (
                <div
                  key={player.id}
                  className="p-3 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium text-sm">{player.name}</div>
                      <div className="text-xs text-gray-500">
                        Rating: {player.rating}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-xs"
                    >
                      {index < 2 ? 'Team 1' : 'Team 2'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>

            {/* Match Info */}
            {hasEnoughPlayers && (
              <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-700">
                    {availableCourt ? `Court ${availableCourt} Available` : 'Waiting for Court'}
                  </span>
                </div>
                {showStartButton && availableCourt && onStartNextMatch && (
                  <Button
                    size="sm"
                    onClick={() => onStartNextMatch(availableCourt)}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Start Match
                    <ArrowRight className="w-3 h-3 ml-1" />
                  </Button>
                )}
              </div>
            )}

            {/* Upcoming Players (next in line) */}
            {nextUpQueue.length > 4 && (
              <div className="pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  Up Next ({nextUpQueue.length - 4} more)
                </h4>
                <div className="flex flex-wrap gap-1">
                  {nextUpQueue.slice(4, 8).map(playerId => (
                    <Badge
                      key={playerId}
                      variant="secondary"
                      className="text-xs"
                    >
                      {getPlayerName(playerId)}
                    </Badge>
                  ))}
                  {nextUpQueue.length > 8 && (
                    <Badge variant="outline" className="text-xs">
                      +{nextUpQueue.length - 8} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Queue Management Tips */}
            {nextPlayers.length < 4 && nextUpQueue.length > 0 && (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-700">
                  <strong>Waiting for more players:</strong> {4 - nextPlayers.length} more needed to start next match
                </p>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}