'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, Settings, Users, Trophy, Timer, Target, Plus, Minus, 
  Play, Pause, RotateCcw, UserPlus, UserMinus, Edit3, Save, 
  Clock, AlertCircle, CheckCircle, Wrench
} from 'lucide-react';
import { Player, Court } from '@/types';
import { NextPlayersDisplay } from '@/components/ui/next-players-display';
import { toast } from 'sonner';

export default function LiveControlPage() {
  const [liveSession, setLiveSession] = useState<any>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Player[]>([]);
  
  // Modal states
  const [isAddPlayerModalOpen, setIsAddPlayerModalOpen] = useState(false);
  const [isSubstituteModalOpen, setIsSubstituteModalOpen] = useState(false);
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  
  // Form states
  const [newPlayerName, setNewPlayerName] = useState('');
  const [selectedCourtForAction, setSelectedCourtForAction] = useState<number | null>(null);
  const [selectedPlayerOut, setSelectedPlayerOut] = useState('');
  const [selectedPlayerIn, setSelectedPlayerIn] = useState('');
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [scores, setScores] = useState<[number, number]>([21, 0]);
  
  // Session config states
  const [sessionConfig, setSessionConfig] = useState<any>({});

  useEffect(() => {
    fetchLiveSession();
    const interval = setInterval(fetchLiveSession, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchLiveSession = async () => {
    try {
      const response = await fetch('/api/sessions/live');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setLiveSession(data);
          setCourts(data.courts_data || []);
          setWaitingQueue(data.waiting_queue || []);
          setRankings(data.rankings || []);
          setSessionConfig(data.config || {});
        }
      }
    } catch (error) {
      console.error('Error fetching live session:', error);
    }
  };

  // Player Management
  const addPlayer = async () => {
    if (!newPlayerName.trim() || !liveSession) return;
    
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add', playerName: newPlayerName.trim() })
      });

      if (response.ok) {
        setNewPlayerName('');
        setIsAddPlayerModalOpen(false);
        fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add player');
      }
    } catch (error) {
      toast.error('Failed to add player');
    }
  };

  const removePlayer = async (playerName: string) => {
    if (!confirm(`Remove ${playerName} from the session?`)) return;
    
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/players`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove', playerName })
      });

      if (response.ok) {
        fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove player');
      }
    } catch (error) {
      toast.error('Failed to remove player');
    }
  };

  // Court Management
  const controlCourt = async (action: string, courtNumber: number, matchData?: any) => {
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, courtNumber, matchData })
      });

      if (response.ok) {
        fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to ${action}`);
      }
    } catch (error) {
      toast.error(`Failed to ${action}`);
    }
  };

  const addCourt = async () => {
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'add_court' })
      });

      if (response.ok) {
        fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to add court');
      }
    } catch (error) {
      toast.error('Failed to add court');
    }
  };

  const removeCourt = async (courtNumber: number) => {
    if (!confirm(`Remove Court ${courtNumber}? Players will be moved to waiting queue.`)) return;
    
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/courts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_court', courtNumber })
      });

      if (response.ok) {
        fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to remove court');
      }
    } catch (error) {
      toast.error('Failed to remove court');
    }
  };

  // Player Substitution
  const substitutePlayer = async () => {
    if (!selectedPlayerOut || !selectedPlayerIn || !selectedCourtForAction) return;
    
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/substitute`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtNumber: selectedCourtForAction,
          playerOut: selectedPlayerOut,
          playerIn: selectedPlayerIn
        })
      });

      if (response.ok) {
        setIsSubstituteModalOpen(false);
        setSelectedPlayerOut('');
        setSelectedPlayerIn('');
        setSelectedCourtForAction(null);
        fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to substitute player');
      }
    } catch (error) {
      toast.error('Failed to substitute player');
    }
  };

  // Score Management
  const handleScoreSubmit = async () => {
    if (!selectedCourt || !liveSession) return;

    try {
      const response = await fetch('/api/sessions/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: liveSession._id,
          match: {
            match_id: `match_${Date.now()}`,
            teams: [
              [selectedCourt.players[0], selectedCourt.players[1]],
              [selectedCourt.players[2], selectedCourt.players[3]]
            ],
            scores: scores,
            winner_team_index: scores[0] > scores[1] ? 0 : 1,
            court_number: selectedCourt.court_number,
            start_time: new Date(),
            status: 'completed'
          }
        })
      });

      if (response.ok) {
        setIsScoreModalOpen(false);
        setSelectedCourt(null);
        setScores([21, 0]);
        fetchLiveSession();
      }
    } catch (error) {
      toast.error('Failed to submit score');
    }
  };

  if (!liveSession) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-700 mb-2">No Live Session</h2>
            <p className="text-gray-600 mb-4">Start a session from the admin dashboard to begin.</p>
            <Button asChild className="bg-[#ff6f00] hover:bg-[#e65100]">
              <a href="/admin">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => window.history.back()}
              className="text-[#004d40] hover:text-[#ff6f00]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-[#004d40]">Live Session Control</h1>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <Badge className="bg-red-500 text-white">LIVE</Badge>
                <span>{liveSession.location}</span>
                <span>
                  {liveSession.session_start_time 
                    ? `${Math.floor((Date.now() - new Date(liveSession.session_start_time).getTime()) / 60000)} min elapsed`
                    : 'Not started'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="courts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="courts">Courts</TabsTrigger>
            <TabsTrigger value="players">Players</TabsTrigger>
            <TabsTrigger value="queue">Queue</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Courts Management Tab */}
          <TabsContent value="courts" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#004d40]">Court Management</h2>
              <div className="flex gap-2">
                <Button
                  onClick={addCourt}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="sm"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Add Court
                </Button>
              </div>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courts.map((court) => {
                const courtPlayers = court.players.map(playerId => 
                  liveSession?.player_data.find((p: Player) => p.player_id === playerId)?.name || 'Unknown'
                );
                
                return (
                  <Card key={court.court_number} className="border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-[#004d40]">Court {court.court_number}</CardTitle>
                          {court.current_match?.start_time && (
                            <Badge variant="outline" className="text-xs">
                              {Math.floor((Date.now() - new Date(court.current_match.start_time).getTime()) / 60000)}m
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-1">
                          <Badge 
                            variant="outline" 
                            className={
                              court.status === 'in_progress' ? 'bg-green-50 text-green-700' :
                              court.status === 'paused' ? 'bg-yellow-50 text-yellow-700' :
                              court.status === 'maintenance' ? 'bg-red-50 text-red-700' :
                              'bg-blue-50 text-blue-700'
                            }
                          >
                            {court.status.replace('_', ' ')}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-[#ff6f00] uppercase tracking-wider">Team 1</div>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{courtPlayers[0] || 'Empty'}</div>
                            <div className="font-medium text-sm">{courtPlayers[1] || 'Empty'}</div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-[#ff6f00] uppercase tracking-wider">Team 2</div>
                          <div className="space-y-1">
                            <div className="font-medium text-sm">{courtPlayers[2] || 'Empty'}</div>
                            <div className="font-medium text-sm">{courtPlayers[3] || 'Empty'}</div>
                          </div>
                        </div>
                      </div>
                      
                      {court.current_match && (
                        <div className="flex justify-between items-center p-2 bg-gray-50 rounded text-sm">
                          <span>Score:</span>
                          <span className="font-bold">
                            {court.current_match.scores[0]} - {court.current_match.scores[1]}
                          </span>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          onClick={() => {
                            setSelectedCourt(court);
                            setIsScoreModalOpen(true);
                          }}
                          className="bg-[#ff6f00] hover:bg-[#e65100] text-white"
                          size="sm"
                          disabled={court.status !== 'in_progress'}
                        >
                          <Target className="w-3 h-3 mr-1" />
                          Score
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedCourtForAction(court.court_number);
                            setIsSubstituteModalOpen(true);
                          }}
                          variant="outline"
                          size="sm"
                          disabled={courtPlayers.length < 4}
                        >
                          <UserMinus className="w-3 h-3 mr-1" />
                          Sub
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-1">
                        <Button
                          onClick={() => controlCourt(
                            court.status === 'paused' ? 'resume_court' : 'pause_court', 
                            court.court_number
                          )}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          {court.status === 'paused' ? <Play className="w-3 h-3" /> : <Pause className="w-3 h-3" />}
                        </Button>
                        <Button
                          onClick={() => controlCourt('restart_match', court.court_number)}
                          variant="outline"
                          size="sm"
                          className="text-xs"
                        >
                          <RotateCcw className="w-3 h-3" />
                        </Button>
                        <Button
                          onClick={() => removeCourt(court.court_number)}
                          variant="outline"
                          size="sm"
                          className="text-xs text-red-600 border-red-200 hover:bg-red-50"
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Players Tab */}
          <TabsContent value="players" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[#004d40]">Player Management</h2>
              <Button
                onClick={() => setIsAddPlayerModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white"
                size="sm"
              >
                <UserPlus className="w-4 h-4 mr-1" />
                Add Player
              </Button>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              {/* Active Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004d40]">Active Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {liveSession.player_data
                      ?.filter((player: Player) => player.is_active && !player.is_paused)
                      .map((player: Player) => (
                      <div key={player.player_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            Rating: {player.session_skill_rating} | {player.wins}W-{player.losses}L
                          </div>
                        </div>
                        <Button
                          onClick={() => controlCourt('pause_player', 0, { playerId: player.player_id })}
                          variant="outline"
                          size="sm"
                        >
                          <Pause className="w-3 h-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Paused Players */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004d40]">Paused Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {liveSession.player_data
                      ?.filter((player: Player) => player.is_paused)
                      .map((player: Player) => (
                      <div key={player.player_id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                        <div>
                          <div className="font-medium">{player.name}</div>
                          <div className="text-sm text-gray-500">
                            Rating: {player.session_skill_rating} | {player.wins}W-{player.losses}L
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button
                            onClick={() => controlCourt('resume_player', 0, { playerId: player.player_id })}
                            variant="outline"
                            size="sm"
                          >
                            <Play className="w-3 h-3" />
                          </Button>
                          <Button
                            onClick={() => removePlayer(player.name)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <UserMinus className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Queue Tab */}
          <TabsContent value="queue">
            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004d40]">Waiting Queue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {waitingQueue.map((playerId, index) => {
                      const player = liveSession?.player_data.find((p: Player) => p.player_id === playerId);
                      return (
                        <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{player?.name || `Player ${index + 1}`}</div>
                            <div className="text-sm text-gray-500">
                              Position #{index + 1} | Rating: {player?.session_skill_rating || 500}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <NextPlayersDisplay
                nextUpQueue={liveSession?.next_up_queue || []}
                playerData={liveSession?.player_data || []}
                courts={courts}
                showStartButton={false}
              />
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004d40]">Session Controls</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    onClick={() => controlCourt('reset_session_ratings', 0)}
                    variant="outline"
                    className="w-full border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Session Ratings
                  </Button>
                  
                  <Button
                    onClick={() => {
                      if (confirm('This will permanently delete all historical performance data. Are you sure?')) {
                        controlCourt('reset_historical_ratings', 0);
                      }
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50"
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset Historical Data
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-[#004d40]">Session Info</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <span>Game Type:</span>
                      <Badge className="bg-[#004d40]">
                        {sessionConfig?.game_type?.replace('_', ' ') || 'Partnership Rotation'}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Courts:</span>
                      <span className="font-semibold">{courts.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Active Players:</span>
                      <span className="font-semibold">
                        {liveSession?.player_data?.filter((p: Player) => p.is_active && !p.is_paused).length || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Waiting:</span>
                      <span className="font-semibold">{waitingQueue.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Matches Played:</span>
                      <span className="font-semibold">{liveSession?.matches?.length || 0}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="text-[#004d40]">Match History</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {liveSession.matches?.length > 0 ? (
                    liveSession.matches.map((match: any, index: number) => (
                      <div key={match.match_id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-semibold">Match #{index + 1} - Court {match.court_number}</div>
                            <div className="text-sm text-gray-600">
                              Score: {match.scores[0]} - {match.scores[1]}
                            </div>
                          </div>
                          <Badge className={match.winner_team_index === 0 ? 'bg-blue-500' : 'bg-green-500'}>
                            Team {match.winner_team_index + 1} Won
                          </Badge>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-500 text-center py-8">No matches played yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      
      {/* Add Player Modal */}
      <Dialog open={isAddPlayerModalOpen} onOpenChange={setIsAddPlayerModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#004d40]">Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="newPlayerName" className="text-[#004d40] font-semibold">
                Player Name
              </Label>
              <Input
                id="newPlayerName"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                className="mt-2"
                onKeyDown={(e) => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setNewPlayerName('');
                  setIsAddPlayerModalOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={addPlayer}
                disabled={!newPlayerName.trim()}
                className="bg-[#ff6f00] hover:bg-[#e65100] text-white"
              >
                Add Player
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Player Substitution Modal */}
      <Dialog open={isSubstituteModalOpen} onOpenChange={setIsSubstituteModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#004d40]">
              Substitute Player - Court {selectedCourtForAction}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-[#004d40] font-semibold">Player to Remove</Label>
              <Select value={selectedPlayerOut} onValueChange={setSelectedPlayerOut}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select player to remove" />
                </SelectTrigger>
                <SelectContent>
                  {selectedCourtForAction && courts.find(c => c.court_number === selectedCourtForAction)?.players.map(playerId => {
                    const player = liveSession?.player_data.find((p: Player) => p.player_id === playerId);
                    return (
                      <SelectItem key={playerId} value={player?.name || playerId}>
                        {player?.name || 'Unknown'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label className="text-[#004d40] font-semibold">Substitute Player</Label>
              <Select value={selectedPlayerIn} onValueChange={setSelectedPlayerIn}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Select substitute player" />
                </SelectTrigger>
                <SelectContent>
                  {waitingQueue.map(playerId => {
                    const player = liveSession?.player_data.find((p: Player) => p.player_id === playerId);
                    return (
                      <SelectItem key={playerId} value={player?.name || playerId}>
                        {player?.name || 'Unknown'}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => {
                  setIsSubstituteModalOpen(false);
                  setSelectedPlayerOut('');
                  setSelectedPlayerIn('');
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={substitutePlayer}
                disabled={!selectedPlayerOut || !selectedPlayerIn}
                className="bg-[#ff6f00] hover:bg-[#e65100] text-white"
              >
                Substitute
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Entry Modal */}
      <Dialog open={isScoreModalOpen} onOpenChange={setIsScoreModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[#004d40]">
              Enter Match Score - Court {selectedCourt?.court_number}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="text-center space-y-3">
                <div className="text-sm font-semibold text-[#ff6f00] uppercase tracking-wider">Team 1</div>
                <div className="space-y-1 text-sm">
                  {selectedCourt?.players.slice(0, 2).map((playerId, i) => {
                    const player = liveSession?.player_data.find((p: Player) => p.player_id === playerId);
                    return <div key={i}>{player?.name || 'Unknown'}</div>;
                  })}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScores([Math.max(0, scores[0] - 1), scores[1]])}
                    disabled={scores[0] <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="w-16 text-center text-2xl font-bold text-[#004d40]">
                    {scores[0]}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScores([scores[0] + 1, scores[1]])}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="text-center space-y-3">
                <div className="text-sm font-semibold text-[#ff6f00] uppercase tracking-wider">Team 2</div>
                <div className="space-y-1 text-sm">
                  {selectedCourt?.players.slice(2, 4).map((playerId, i) => {
                    const player = liveSession?.player_data.find((p: Player) => p.player_id === playerId);
                    return <div key={i}>{player?.name || 'Unknown'}</div>;
                  })}
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScores([scores[0], Math.max(0, scores[1] - 1)])}
                    disabled={scores[1] <= 0}
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <div className="w-16 text-center text-2xl font-bold text-[#004d40]">
                    {scores[1]}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setScores([scores[0], scores[1] + 1])}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => setIsScoreModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleScoreSubmit}
                className="bg-[#ff6f00] hover:bg-[#e65100] text-white"
                disabled={Math.max(scores[0], scores[1]) < 21 || Math.abs(scores[0] - scores[1]) < 2}
              >
                Submit Score
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}