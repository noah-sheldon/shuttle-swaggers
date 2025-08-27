'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Trophy, Clock, MapPin, Target } from 'lucide-react';
import { Player, Match, Court } from '@/types';
import { NextPlayersDisplay } from '@/components/ui/next-players-display';
import { useMatchTimer, useSessionTimer } from '@/hooks/useMatchTimer';

export default function GamesPage() {
  const [liveSession, setLiveSession] = useState<any>(null);
  const [completedSessions, setCompletedSessions] = useState<any[]>([]);
  const [courts, setCourts] = useState<Court[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<any>(null);
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.game-header', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo('.court-card',
        { opacity: 0, scale: 0.9 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'back.out(1.7)',
          delay: 0.3
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, [courts]);

  useEffect(() => {
    fetchLiveSession();
    fetchCompletedSessions();
    const interval = setInterval(() => {
      fetchLiveSession();
      fetchCompletedSessions();
    }, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchLiveSession = async () => {
    try {
      const response = await fetch('/api/sessions/live');
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setLiveSession(data);
          // Extract courts and waiting queue from session data
          setCourts(data.courts_data || []);
          setWaitingQueue(data.waiting_queue || []);
          setRankings(data.rankings || []);
        }
      }
    } catch (error) {
      console.error('Error fetching live session:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletedSessions = async () => {
    try {
      const response = await fetch('/api/sessions/completed');
      if (response.ok) {
        const data = await response.json();
        setCompletedSessions(data || []);
      }
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
    }
  };



  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const handleSessionClick = (session: any) => {
    setSelectedSession(session);
    setShowSessionModal(true);
  };

  const handlePlayerClick = (player: Player, sessionData?: any) => {
    setSelectedPlayer(player);
    if (sessionData) {
      setSelectedSession(sessionData);
    }
    setShowPlayerModal(true);
  };

  const getPlayerStats = (player: Player, session?: any) => {
    if (!session) return null;
    
    const playerMatches = session.matches?.filter((match: Match) => 
      match.teams[0].includes(player.player_id) || match.teams[1].includes(player.player_id)
    ) || [];

    const partnerships = Array.from(new Set(player.played_with));
    const opponents = Array.from(new Set(player.played_against));
    
    return {
      matchesPlayed: playerMatches.length,
      winRate: player.wins + player.losses > 0 ? (player.wins / (player.wins + player.losses) * 100) : 0,
      pointsDifference: player.points_for - player.points_against,
      averagePointsPerMatch: playerMatches.length > 0 ? (player.points_for / playerMatches.length) : 0,
      partnerships: partnerships.length,
      opponents: opponents.length,
      matches: playerMatches
    };
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6f00] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading live games...</p>
        </div>
      </div>
    );
  }

  if (!liveSession && completedSessions.length === 0) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <section className="py-20 bg-[#004d40] text-white">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-6">Games</h1>
            <p className="text-xl opacity-90">Live sessions and match history</p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-[#004d40] mb-4">No Games Yet</h2>
              <p className="text-gray-600 mb-8">
                There are currently no active or completed sessions. 
                Check back during our scheduled session times.
              </p>
              <Button asChild className="bg-[#ff6f00] hover:bg-[#e65100]">
                <a href="/sessions">View Upcoming Sessions</a>
              </Button>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="pt-16 min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="py-12 bg-[#004d40] text-white">
        <div className="container mx-auto px-6">
          <div className="game-header flex flex-col md:flex-row justify-between items-start md:items-center">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {liveSession && <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>}
                <h1 className="text-4xl font-bold">
                  {liveSession ? 'Live Session' : 'Games'}
                </h1>
              </div>
              {liveSession && (
                <div className="flex items-center gap-6 text-sm opacity-90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{liveSession.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    <span>{formatDate(liveSession.date)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>{liveSession.courts} Courts</span>
                  </div>
                </div>
              )}
              {!liveSession && (
                <p className="text-xl opacity-90">Live sessions and match history</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <Tabs defaultValue={liveSession ? "courts" : "completed"} className="space-y-6">
            <TabsList className={`grid w-full ${liveSession ? 'grid-cols-4' : 'grid-cols-2'}`}>
              {liveSession && (
                <>
                  <TabsTrigger value="courts">Live Courts</TabsTrigger>
                  <TabsTrigger value="queue">Queue & Next</TabsTrigger>
                  <TabsTrigger value="rankings">Rankings</TabsTrigger>
                </>
              )}
              <TabsTrigger value="completed">Completed Sessions</TabsTrigger>
            </TabsList>

            {/* Courts Tab */}
            <TabsContent value="courts" className="space-y-6">
              <div className="grid lg:grid-cols-4 gap-6">
                <div className="lg:col-span-3">
                  <div className="grid md:grid-cols-2 gap-6">
                    {courts.map((court) => {
                      const courtPlayers = court.players.map(playerId => 
                        liveSession?.player_data.find((p: Player) => p.player_id === playerId)?.name || 'Unknown'
                      );
                      
                      return (
                        <Card key={court.court_number} className="court-card border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                          <CardHeader className="pb-3">
                            <div className="flex justify-between items-center">
                              <div className="flex items-center gap-2">
                                <CardTitle className="text-[#004d40]">Court {court.court_number}</CardTitle>
                                {court.current_match?.start_time && (
                                  <Badge variant="outline" className="text-xs">
                                    {/* Timer would be implemented here */}
                                    {Math.floor((Date.now() - new Date(court.current_match.start_time).getTime()) / 60000)}m
                                  </Badge>
                                )}
                              </div>
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
                            
                            <div className="text-center">
                              <div className="text-sm text-gray-600">
                                Match in progress - View only
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
                
                {/* Next Players Side Panel */}
                <div className="lg:col-span-1">
                  <NextPlayersDisplay
                    nextUpQueue={liveSession?.next_up_queue || []}
                    playerData={liveSession?.player_data || []}
                    courts={courts}
                    showStartButton={false}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Queue Tab */}
            <TabsContent value="queue" className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                
                {/* Waiting Queue */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-[#004d40] flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Waiting Queue ({waitingQueue.length} players)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {waitingQueue.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No players in queue</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {waitingQueue.map((playerId, index) => {
                          const player = liveSession?.player_data.find((p: Player) => p.player_id === playerId);
                          return (
                            <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                              <div>
                                <div className="font-medium">{player?.name || `Player ${index + 1}`}</div>
                                <div className="text-sm text-gray-500">Position #{index + 1}</div>
                              </div>
                              <div className="text-xs text-gray-400">
                                Rating: {player?.session_skill_rating || 500}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Next Players */}
                <NextPlayersDisplay
                  nextUpQueue={liveSession?.next_up_queue || []}
                  playerData={liveSession?.player_data || []}
                  courts={courts}
                  showStartButton={false}
                />
              </div>
            </TabsContent>

            {/* Rankings Tab */}
            <TabsContent value="rankings">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-[#004d40] flex items-center gap-2">
                    <Trophy className="w-5 h-5" />
                    Live Rankings
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {rankings.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>No matches played yet</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {rankings.map((player, index) => (
                        <div 
                          key={player.player_id} 
                          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => handlePlayerClick(player, liveSession)}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-yellow-600' :
                              'bg-[#004d40]'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold">{player.name}</div>
                              <div className="text-sm text-gray-500">
                                {player.wins}W - {player.losses}L
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#004d40]">
                              {player.wins + player.losses > 0 
                                ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%` 
                                : '0%'}
                            </div>
                            <div className="text-sm text-gray-500">
                              +{player.points_for - player.points_against}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Completed Sessions Tab */}
            <TabsContent value="completed">
              <div className="space-y-6">
                {completedSessions.length === 0 ? (
                  <Card className="border-0 shadow-lg">
                    <CardContent className="py-12">
                      <div className="text-center text-gray-500">
                        <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <h3 className="text-lg font-semibold mb-2">No Completed Sessions</h3>
                        <p>Completed session history will appear here after matches are played.</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid lg:grid-cols-2 gap-6">
                    {completedSessions.map((session) => (
                      <Card 
                        key={session._id} 
                        className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                        onClick={() => handleSessionClick(session)}
                      >
                        <CardHeader>
                          <div className="flex justify-between items-start">
                            <div>
                              <CardTitle className="text-[#004d40] flex items-center gap-2">
                                <Trophy className="w-5 h-5" />
                                {session.location}
                              </CardTitle>
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                <div className="flex items-center gap-1">
                                  <Clock className="w-4 h-4" />
                                  <span>{formatDate(session.date)}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Users className="w-4 h-4" />
                                  <span>{session.config?.court_count || session.courts} Courts</span>
                                </div>
                              </div>
                            </div>
                            <Badge variant="outline" className="bg-green-50 text-green-700">
                              Completed
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-2xl font-bold text-[#004d40]">
                                {session.matches?.length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Matches Played</div>
                            </div>
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-2xl font-bold text-[#ff6f00]">
                                {session.player_data?.filter((p: Player) => p.wins + p.losses > 0).length || 0}
                              </div>
                              <div className="text-sm text-gray-600">Active Players</div>
                            </div>
                          </div>

                          {session.rankings && session.rankings.length > 0 && (
                            <div>
                              <h4 className="font-semibold text-[#004d40] mb-3">Top Performers</h4>
                              <div className="space-y-2">
                                {session.rankings.slice(0, 3).map((player: Player, index: number) => (
                                  <div 
                                    key={player.player_id} 
                                    className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100 cursor-pointer transition-colors"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handlePlayerClick(player, session);
                                    }}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold ${
                                        index === 0 ? 'bg-yellow-500' :
                                        index === 1 ? 'bg-gray-400' :
                                        'bg-yellow-600'
                                      }`}>
                                        {index + 1}
                                      </div>
                                      <span className="font-medium">{player.name}</span>
                                    </div>
                                    <div className="text-sm text-gray-600">
                                      {player.wins}W-{player.losses}L ({player.wins + player.losses > 0 
                                        ? Math.round((player.wins / (player.wins + player.losses)) * 100)
                                        : 0}%)
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-2 border-t">
                            <div className="text-xs text-gray-500 text-center">
                              Game Type: {session.config?.game_type?.replace('_', ' ')?.toUpperCase() || 'Partnership Rotation'}
                              {session.completed_at && (
                                <span className="ml-2">• Completed {new Date(session.completed_at).toLocaleDateString()}</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Session Details Modal */}
      <Dialog open={showSessionModal} onOpenChange={setShowSessionModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          {selectedSession && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#ff6f00]" />
                  {selectedSession.location} - {formatDate(selectedSession.date)}
                </DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="overview" className="mt-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="rankings">Full Rankings</TabsTrigger>
                  <TabsTrigger value="matches">All Matches</TabsTrigger>
                  <TabsTrigger value="stats">Statistics</TabsTrigger>
                </TabsList>

                <TabsContent value="overview" className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-[#004d40]">
                        {selectedSession.matches?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Total Matches</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-[#ff6f00]">
                        {selectedSession.player_data?.length || 0}
                      </div>
                      <div className="text-sm text-gray-600">Players</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-[#004d40]">
                        {selectedSession.config?.court_count || selectedSession.courts || 0}
                      </div>
                      <div className="text-sm text-gray-600">Courts</div>
                    </Card>
                    <Card className="p-4">
                      <div className="text-2xl font-bold text-green-600">
                        {Math.round((selectedSession.matches?.length || 0) * 120 / 60)}h
                      </div>
                      <div className="text-sm text-gray-600">Est. Duration</div>
                    </Card>
                  </div>

                  <Card className="p-4">
                    <h3 className="font-semibold text-[#004d40] mb-3">Session Configuration</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><strong>Game Type:</strong> {selectedSession.config?.game_type?.replace('_', ' ')?.toUpperCase() || 'Partnership Rotation'}</div>
                      <div><strong>Scoring:</strong> {selectedSession.config?.scoring_system?.replace('_', ' ')?.toUpperCase() || 'Single Set 21'}</div>
                      <div><strong>Max Duration:</strong> {selectedSession.config?.max_duration_minutes || 120} minutes</div>
                      <div><strong>Skill Balancing:</strong> {selectedSession.config?.skill_balancing ? 'Enabled' : 'Disabled'}</div>
                    </div>
                  </Card>
                </TabsContent>

                <TabsContent value="rankings" className="space-y-4">
                  <div className="space-y-3">
                    {selectedSession.rankings?.map((player: Player, index: number) => (
                      <Card 
                        key={player.player_id} 
                        className="p-4 hover:shadow-lg transition-shadow cursor-pointer"
                        onClick={() => handlePlayerClick(player, selectedSession)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                              index === 0 ? 'bg-yellow-500' :
                              index === 1 ? 'bg-gray-400' :
                              index === 2 ? 'bg-yellow-600' :
                              'bg-[#004d40]'
                            }`}>
                              {index + 1}
                            </div>
                            <div>
                              <div className="font-semibold text-[#004d40]">{player.name}</div>
                              <div className="text-sm text-gray-500">
                                {player.wins}W - {player.losses}L • Rating: {player.session_skill_rating}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-[#004d40]">
                              {player.wins + player.losses > 0 
                                ? `${Math.round((player.wins / (player.wins + player.losses)) * 100)}%` 
                                : '0%'}
                            </div>
                            <div className="text-sm text-gray-500">
                              +{player.points_for - player.points_against} pts
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="matches" className="space-y-4">
                  <div className="space-y-3">
                    {selectedSession.matches?.map((match: Match, index: number) => {
                      const team1Names = match.teams[0].map(playerId => 
                        selectedSession.player_data?.find((p: Player) => p.player_id === playerId)?.name || 'Unknown'
                      );
                      const team2Names = match.teams[1].map(playerId => 
                        selectedSession.player_data?.find((p: Player) => p.player_id === playerId)?.name || 'Unknown'
                      );
                      
                      return (
                        <Card key={match.match_id} className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <div className="font-medium text-[#004d40]">Match {index + 1}</div>
                              <div className="text-sm text-gray-500 mt-1">
                                Court {match.court_number} • {new Date(match.start_time).toLocaleTimeString()}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className={`text-right ${match.winner_team_index === 0 ? 'font-bold text-green-600' : 'text-gray-600'}`}>
                                <div>{team1Names.join(' & ')}</div>
                                <div className="text-lg">{match.scores[0]}</div>
                              </div>
                              <div className="text-gray-400">vs</div>
                              <div className={`text-left ${match.winner_team_index === 1 ? 'font-bold text-green-600' : 'text-gray-600'}`}>
                                <div>{team2Names.join(' & ')}</div>
                                <div className="text-lg">{match.scores[1]}</div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="stats" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-4">
                      <h3 className="font-semibold text-[#004d40] mb-3">Top Scorers</h3>
                      <div className="space-y-2">
                        {selectedSession.player_data
                          ?.filter((p: Player) => p.points_for > 0)
                          ?.sort((a: Player, b: Player) => b.points_for - a.points_for)
                          ?.slice(0, 5)
                          ?.map((player: Player) => (
                            <div key={player.player_id} className="flex justify-between">
                              <span>{player.name}</span>
                              <span className="font-medium">{player.points_for} pts</span>
                            </div>
                          ))}
                      </div>
                    </Card>

                    <Card className="p-4">
                      <h3 className="font-semibold text-[#004d40] mb-3">Most Active</h3>
                      <div className="space-y-2">
                        {selectedSession.player_data
                          ?.filter((p: Player) => p.wins + p.losses > 0)
                          ?.sort((a: Player, b: Player) => (b.wins + b.losses) - (a.wins + a.losses))
                          ?.slice(0, 5)
                          ?.map((player: Player) => (
                            <div key={player.player_id} className="flex justify-between">
                              <span>{player.name}</span>
                              <span className="font-medium">{player.wins + player.losses} matches</span>
                            </div>
                          ))}
                      </div>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Player Analysis Modal */}
      <Dialog open={showPlayerModal} onOpenChange={setShowPlayerModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedPlayer && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#ff6f00]" />
                  {selectedPlayer.name} - Player Analysis
                </DialogTitle>
              </DialogHeader>

              {(() => {
                const stats = getPlayerStats(selectedPlayer, selectedSession);
                if (!stats) return null;

                return (
                  <div className="space-y-6 mt-4">
                    {/* Key Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-[#004d40]">{selectedPlayer.wins}</div>
                        <div className="text-sm text-gray-600">Wins</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-red-600">{selectedPlayer.losses}</div>
                        <div className="text-sm text-gray-600">Losses</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-[#ff6f00]">{Math.round(stats.winRate)}%</div>
                        <div className="text-sm text-gray-600">Win Rate</div>
                      </Card>
                      <Card className="p-4 text-center">
                        <div className="text-2xl font-bold text-green-600">+{stats.pointsDifference}</div>
                        <div className="text-sm text-gray-600">Point Diff</div>
                      </Card>
                    </div>

                    {/* Performance Breakdown */}
                    <Card className="p-6">
                      <h3 className="font-semibold text-[#004d40] mb-4">Performance Breakdown</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Matches Played:</span>
                            <span className="font-medium">{stats.matchesPlayed}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Points Scored:</span>
                            <span className="font-medium text-green-600">{selectedPlayer.points_for}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Points Against:</span>
                            <span className="font-medium text-red-600">{selectedPlayer.points_against}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Avg Points/Match:</span>
                            <span className="font-medium">{stats.averagePointsPerMatch.toFixed(1)}</span>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Unique Partners:</span>
                            <span className="font-medium">{stats.partnerships}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Faced Opponents:</span>
                            <span className="font-medium">{stats.opponents}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Session Rating:</span>
                            <span className="font-medium">{selectedPlayer.session_skill_rating}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Historical Rating:</span>
                            <span className="font-medium">{selectedPlayer.skill_rating}</span>
                          </div>
                        </div>
                      </div>
                    </Card>

                    {/* Match History */}
                    <Card className="p-6">
                      <h3 className="font-semibold text-[#004d40] mb-4">Match History</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {stats.matches.map((match: Match, index: number) => {
                          const isPlayerInTeam1 = match.teams[0].includes(selectedPlayer.player_id);
                          const playerTeam = isPlayerInTeam1 ? 0 : 1;
                          const isWinner = match.winner_team_index === playerTeam;
                          const partnerIds = isPlayerInTeam1 
                            ? match.teams[0].filter(id => id !== selectedPlayer.player_id)
                            : match.teams[1].filter(id => id !== selectedPlayer.player_id);
                          const opponentIds = isPlayerInTeam1 ? match.teams[1] : match.teams[0];
                          
                          const partnerNames = partnerIds.map(id => 
                            selectedSession?.player_data?.find((p: Player) => p.player_id === id)?.name || 'Unknown'
                          );
                          const opponentNames = opponentIds.map(id => 
                            selectedSession?.player_data?.find((p: Player) => p.player_id === id)?.name || 'Unknown'
                          );

                          return (
                            <div key={match.match_id} className={`p-3 rounded-lg border-l-4 ${
                              isWinner ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                            }`}>
                              <div className="flex justify-between items-start">
                                <div>
                                  <div className="font-medium">
                                    {isWinner ? '✓ Won' : '✗ Lost'} - Match {index + 1}
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">
                                    Partner: {partnerNames.join(', ') || 'None'}<br/>
                                    vs {opponentNames.join(' & ')}
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="font-bold">{match.scores[playerTeam]} - {match.scores[playerTeam === 0 ? 1 : 0]}</div>
                                  <div className="text-sm text-gray-500">Court {match.court_number}</div>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </Card>
                  </div>
                );
              })()}
            </>
          )}
        </DialogContent>
      </Dialog>

    </div>
  );
}