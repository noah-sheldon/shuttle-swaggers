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
  const [courts, setCourts] = useState<Court[]>([]);
  const [waitingQueue, setWaitingQueue] = useState<string[]>([]);
  const [rankings, setRankings] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
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
    const interval = setInterval(fetchLiveSession, 10000); // Refresh every 10 seconds
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



  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
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

  if (!liveSession) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <section className="py-20 bg-[#004d40] text-white">
          <div className="container mx-auto px-6 text-center">
            <h1 className="text-5xl font-bold mb-6">Live Games</h1>
            <p className="text-xl opacity-90">Real-time badminton session management</p>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-bold text-[#004d40] mb-4">No Live Session</h2>
              <p className="text-gray-600 mb-8">
                There are currently no active badminton sessions. 
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
                <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>
                <h1 className="text-4xl font-bold">Live Session</h1>
              </div>
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
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="courts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="courts">Live Courts</TabsTrigger>
              <TabsTrigger value="queue">Queue & Next</TabsTrigger>
              <TabsTrigger value="rankings">Rankings</TabsTrigger>
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
                        <div key={player.player_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
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
          </Tabs>
        </div>
      </section>

    </div>
  );
}