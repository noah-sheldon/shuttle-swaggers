'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Users, 
  Play, 
  Pause, 
  RotateCcw, 
  Settings, 
  History, 
  Plus, 
  UserMinus,
  UserPlus,
  Clock,
  Trophy,
  Target,
  Zap,
  RefreshCw,
  ArrowLeft,
  MapPin
} from 'lucide-react';
import { Player, Match, Court, Session } from '@/types';
import { toast } from 'sonner';

export default function LiveSessionPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.id as string;
  const pageRef = useRef<HTMLDivElement>(null);
  
  const [session, setSession] = useState<Session | null>(null);
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLive, setIsLive] = useState(false);
  
  // Modal states
  const [showSubstituteModal, setShowSubstituteModal] = useState(false);
  const [showAddPlayerModal, setShowAddPlayerModal] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [courtScores, setCourtScores] = useState<Record<number, [number, number]>>({});
  const [completingMatch, setCompletingMatch] = useState<number | null>(null);
  
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.session-header', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo('.control-card',
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
  }, [session]);

  useEffect(() => {
    fetchSession();
    const interval = setInterval(fetchSession, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [sessionId]);

  const fetchSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}`);
      if (response.ok) {
        const data = await response.json();
        setSession(data);
        setCourts(data.courts_data || []);
        setIsLive(data.is_live || false);
      }
    } catch (error) {
      console.error('Error fetching session:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'start' }),
      });
      
      if (response.ok) {
        setIsLive(true);
        // Trigger auto-assignment when session starts
        await triggerAutoAssignment();
        fetchSession();
      }
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const endSession = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/live`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'end' }),
      });
      
      if (response.ok) {
        setIsLive(false);
        router.push('/admin');
      }
    } catch (error) {
      console.error('Error ending session:', error);
    }
  };

  const pauseCourt = async (courtNumber: number, action: 'pause' | 'resume') => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/pause-court`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ courtNumber, action }),
      });
      
      if (response.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error('Error managing court:', error);
    }
  };

  const addPlayer = async () => {
    if (!newPlayerName.trim()) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/add-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player: { name: newPlayerName.trim() } }),
      });
      
      if (response.ok) {
        setNewPlayerName('');
        setShowAddPlayerModal(false);
        fetchSession();
      }
    } catch (error) {
      console.error('Error adding player:', error);
    }
  };

  const pausePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/manage-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action: 'pause' }),
      });
      
      if (response.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error('Error pausing player:', error);
    }
  };

  const resumePlayer = async (playerId: string) => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/manage-player`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerId, action: 'resume' }),
      });
      
      if (response.ok) {
        // After resuming player, trigger auto-assignment for partnership rotation
        await triggerAutoAssignment();
        fetchSession();
      }
    } catch (error) {
      console.error('Error resuming player:', error);
    }
  };

  const triggerAutoAssignment = async () => {
    try {
      const response = await fetch(`/api/sessions/${sessionId}/auto-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'check_and_assign' }),
      });
      
      if (response.ok) {
        const result = await response.json();
        if (result.assignmentsMade > 0) {
          toast.success(`🏸 Auto-assigned ${result.assignmentsMade} court(s) with optimal partnerships!`);
        } else if (result.playersWaiting > 0 && result.playersWaiting < 4) {
          toast.info(`⏳ ${result.playersWaiting} player(s) waiting - need ${4 - result.playersWaiting} more for next match`);
        }
      }
    } catch (error) {
      console.error('Error in auto-assignment:', error);
    }
  };

  const updateScore = (courtNumber: number, team: 0 | 1, score: number) => {
    setCourtScores(prev => ({
      ...prev,
      [courtNumber]: team === 0 
        ? [score, prev[courtNumber]?.[1] || 0]
        : [prev[courtNumber]?.[0] || 0, score]
    }));
  };

  const completeMatch = async (courtNumber: number) => {
    const scores = courtScores[courtNumber] || [0, 0];
    if (scores[0] === 0 && scores[1] === 0) {
      toast.error('Please enter scores before finishing the match');
      return;
    }

    setCompletingMatch(courtNumber);
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/complete-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courtNumber,
          scores: scores,
          winnerTeamIndex: scores[0] > scores[1] ? 0 : 1
        }),
      });
      
      if (response.ok) {
        toast.success(`Match completed! Court ${courtNumber} ready for next game`);
        // Clear the scores for this court
        setCourtScores(prev => {
          const newScores = { ...prev };
          delete newScores[courtNumber];
          return newScores;
        });
        // Trigger auto-assignment for next match
        await triggerAutoAssignment();
        fetchSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to complete match');
      }
    } catch (error) {
      console.error('Error completing match:', error);
      toast.error('Failed to complete match');
    } finally {
      setCompletingMatch(null);
    }
  };

  const resetData = async (type: 'session' | 'historical') => {
    const confirmMessage = type === 'historical' 
      ? 'This will permanently delete all historical performance data. Are you sure?'
      : 'This will reset all session ratings and statistics. Continue?';
      
    if (!confirm(confirmMessage)) return;
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/reset-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetType: type }),
      });
      
      if (response.ok) {
        fetchSession();
      }
    } catch (error) {
      console.error('Error resetting data:', error);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getPlayerName = (playerId: string) => {
    return session?.player_data.find(p => p.player_id === playerId)?.name || 'Unknown';
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-[#004d40] mx-auto mb-4" />
          <p className="text-gray-600">Loading session...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="p-8 text-center">
          <h2 className="text-2xl font-bold text-[#004d40] mb-4">Session Not Found</h2>
          <Button onClick={() => router.push('/admin')} className="bg-[#004d40] hover:bg-[#00695c]">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div ref={pageRef} className="pt-16 min-h-screen bg-gray-50">
      {/* Header */}
      <section className="session-header py-8 bg-[#004d40] text-white">
        <div className="container mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <Button
                  variant="ghost"
                  onClick={() => router.push('/admin')}
                  className="text-white hover:bg-white/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Dashboard
                </Button>
                {isLive && <Badge className="bg-red-500 text-white animate-pulse">LIVE</Badge>}
              </div>
              <h1 className="text-3xl font-bold mb-2">Live Session Control</h1>
              <div className="flex items-center gap-6 text-sm opacity-90">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>{session.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  <span>{session.player_data?.length || 0} Players</span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {!isLive ? (
                <Button
                  onClick={startSession}
                  className="bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Start Session
                </Button>
              ) : (
                <Button
                  onClick={endSession}
                  variant="destructive"
                  size="lg"
                >
                  <Target className="w-5 h-5 mr-2" />
                  End Session
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-6">
          <Tabs defaultValue="courts" className="space-y-6">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="courts">Courts</TabsTrigger>
              <TabsTrigger value="players">Players</TabsTrigger>
              <TabsTrigger value="queue">Queue</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
              <TabsTrigger value="history">History</TabsTrigger>
            </TabsList>

            {/* Courts Tab */}
            <TabsContent value="courts" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#004d40]">Court Management</h2>
                <Badge variant="outline">{courts.length} courts active</Badge>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                {courts.map((court) => (
                  <Card key={court.court_number} className="control-card border-0 shadow-lg">
                    <CardHeader className="pb-3">
                      <div className="flex justify-between items-center">
                        <CardTitle className="text-[#004d40]">Court {court.court_number}</CardTitle>
                        <Badge 
                          variant="outline" 
                          className={
                            court.status === 'in_progress' ? 'bg-green-50 text-green-700' :
                            court.status === 'paused' ? 'bg-yellow-50 text-yellow-700' :
                            'bg-gray-50 text-gray-700'
                          }
                        >
                          {court.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs font-semibold text-[#ff6f00] uppercase mb-2">Team 1</div>
                          <div className="space-y-1">
                            {court.players.slice(0, 2).map(playerId => (
                              <div key={playerId} className="text-sm font-medium">
                                {getPlayerName(playerId)}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-[#ff6f00] uppercase mb-2">Team 2</div>
                          <div className="space-y-1">
                            {court.players.slice(2, 4).map(playerId => (
                              <div key={playerId} className="text-sm font-medium">
                                {getPlayerName(playerId)}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Score Input Section */}
                      {court.status === 'in_progress' && court.players.length === 4 && (
                        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                          <div className="text-sm font-semibold text-[#004d40] text-center">Match Score</div>
                          <div className="flex items-center justify-center gap-6">
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Team 1</div>
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                value={courtScores[court.court_number]?.[0] || ''}
                                onChange={(e) => updateScore(court.court_number, 0, parseInt(e.target.value) || 0)}
                                className="w-16 text-center text-lg font-bold"
                                placeholder="0"
                              />
                            </div>
                            <div className="text-2xl font-bold text-gray-400">VS</div>
                            <div className="text-center">
                              <div className="text-xs text-gray-600 mb-1">Team 2</div>
                              <Input
                                type="number"
                                min="0"
                                max="30"
                                value={courtScores[court.court_number]?.[1] || ''}
                                onChange={(e) => updateScore(court.court_number, 1, parseInt(e.target.value) || 0)}
                                className="w-16 text-center text-lg font-bold"
                                placeholder="0"
                              />
                            </div>
                          </div>
                          <Button
                            onClick={() => completeMatch(court.court_number)}
                            disabled={completingMatch === court.court_number}
                            className="w-full bg-[#ff6f00] hover:bg-[#e65100] text-white"
                            size="sm"
                          >
                            {completingMatch === court.court_number ? (
                              <>
                                <RefreshCw className="w-3 h-3 mr-2 animate-spin" />
                                Finishing...
                              </>
                            ) : (
                              <>
                                <Trophy className="w-3 h-3 mr-2" />
                                Finish Match
                              </>
                            )}
                          </Button>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          onClick={() => pauseCourt(court.court_number, court.status === 'paused' ? 'resume' : 'pause')}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          {court.status === 'paused' ? (
                            <>
                              <Play className="w-3 h-3 mr-2" />
                              Resume
                            </>
                          ) : (
                            <>
                              <Pause className="w-3 h-3 mr-2" />
                              Pause
                            </>
                          )}
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedCourt(court);
                            setShowSubstituteModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Users className="w-3 h-3 mr-2" />
                          Substitute
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedCourt(court);
                            setShowScoreModal(true);
                          }}
                          variant="outline"
                          size="sm"
                          className="flex-1"
                        >
                          <Trophy className="w-3 h-3 mr-2" />
                          Score
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            {/* Players Tab */}
            <TabsContent value="players" className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-[#004d40]">Player Management</h2>
                <Button
                  onClick={() => setShowAddPlayerModal(true)}
                  className="bg-[#004d40] hover:bg-[#00695c]"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Player
                </Button>
              </div>

              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="control-card">
                  <CardHeader>
                    <CardTitle className="text-[#004d40]">Active Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.player_data?.filter(p => p.is_active && !p.is_paused).map(player => (
                        <div key={player.player_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">Rating: {player.session_skill_rating}</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => pausePlayer(player.player_id)}
                            className="hover:bg-yellow-100"
                          >
                            <Pause className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="control-card">
                  <CardHeader>
                    <CardTitle className="text-[#004d40]">Paused Players</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.player_data?.filter(p => p.is_paused).map(player => (
                        <div key={player.player_id} className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                          <div>
                            <div className="font-medium">{player.name}</div>
                            <div className="text-sm text-gray-500">Paused</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => resumePlayer(player.player_id)}
                            className="hover:bg-green-100"
                          >
                            <Play className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Player Self-Service Section */}
              <Card className="control-card border-2 border-[#ff6f00]">
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#ff6f00]" />
                    <CardTitle className="text-[#ff6f00]">Player Self-Service</CardTitle>
                  </div>
                  <p className="text-sm text-gray-600">Players can unpause themselves when ready to play</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="bg-gradient-to-r from-[#ff6f00]/10 to-[#004d40]/10 p-4 rounded-lg">
                      <h4 className="font-semibold text-[#004d40] mb-3">🏸 Quick Unpause</h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        {session.player_data?.filter(p => p.is_paused).map(player => (
                          <div key={player.player_id} className="bg-white rounded-lg p-3 shadow-sm border">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="font-medium text-sm">{player.name}</div>
                                <div className="text-xs text-gray-500">Ready to play?</div>
                              </div>
                              <Button
                                size="sm"
                                onClick={() => resumePlayer(player.player_id)}
                                className="bg-[#ff6f00] hover:bg-[#e65100] text-white px-3 py-1 text-xs"
                              >
                                <Play className="w-3 h-3 mr-1" />
                                Join
                              </Button>
                            </div>
                          </div>
                        ))}
                        {session.player_data?.filter(p => p.is_paused).length === 0 && (
                          <div className="col-span-full text-center py-6 text-gray-500">
                            <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
                            <p>All players are active! 🎉</p>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-blue-50 p-3 rounded-lg">
                      <div className="flex items-center gap-2 text-sm text-blue-800">
                        <Target className="w-4 h-4" />
                        <span className="font-medium">Instructions for Players:</span>
                      </div>
                      <ul className="mt-2 text-xs text-blue-700 space-y-1 ml-6">
                        <li>• Click "Join" when you're ready to be added to the rotation</li>
                        <li>• You'll be added to the waiting queue automatically</li>
                        <li>• Wait for your court assignment from the organizer</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Queue Tab */}
            <TabsContent value="queue" className="space-y-6">
              <h2 className="text-xl font-semibold text-[#004d40]">Queue Management</h2>
              
              <div className="grid lg:grid-cols-2 gap-6">
                <Card className="control-card">
                  <CardHeader>
                    <CardTitle className="text-[#004d40]">Waiting Queue</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.waiting_queue?.map((playerId, index) => (
                        <div key={playerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{getPlayerName(playerId)}</div>
                            <div className="text-sm text-gray-500">Position #{index + 1}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card className="control-card">
                  <CardHeader>
                    <CardTitle className="text-[#004d40]">Next Up</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {session.next_up_queue?.map(playerId => (
                        <div key={playerId} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                          <div>
                            <div className="font-medium">{getPlayerName(playerId)}</div>
                            <div className="text-sm text-gray-500">Ready to play</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <h2 className="text-xl font-semibold text-[#004d40]">Session Settings</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <Card className="control-card">
                  <CardHeader>
                    <CardTitle className="text-[#004d40]">Game Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label>Game Type</Label>
                      <div className="text-sm text-gray-600 mt-1">
                        {session.config?.game_type?.replace('_', ' ').toUpperCase() || 'Partnership Rotation'}
                      </div>
                    </div>
                    <div>
                      <Label>Courts</Label>
                      <div className="text-sm text-gray-600 mt-1">
                        {session.config?.court_count || session.courts} courts active
                      </div>
                    </div>
                    <div>
                      <Label>Scoring System</Label>
                      <div className="text-sm text-gray-600 mt-1">
                        {session.config?.scoring_system?.replace('_', ' ').toUpperCase() || 'Single Set 21'}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="control-card">
                  <CardHeader>
                    <CardTitle className="text-[#004d40]">Data Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Button
                      onClick={() => resetData('session')}
                      variant="outline"
                      className="w-full border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Session Data
                    </Button>
                    <Button
                      onClick={() => resetData('historical')}
                      variant="outline"
                      className="w-full text-red-600 border-red-200 hover:bg-red-50"
                    >
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Reset Historical Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-6">
              <h2 className="text-xl font-semibold text-[#004d40]">Match History</h2>
              
              <Card className="control-card">
                <CardContent className="p-6">
                  <div className="text-center text-gray-500">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Match history will appear here as games are completed.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Add Player Modal */}
      <Dialog open={showAddPlayerModal} onOpenChange={setShowAddPlayerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Player</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="playerName">Player Name</Label>
              <Input
                id="playerName"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter player name"
                onKeyPress={(e) => e.key === 'Enter' && addPlayer()}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={addPlayer} className="flex-1 bg-[#004d40] hover:bg-[#00695c]">
                <Plus className="w-4 h-4 mr-2" />
                Add Player
              </Button>
              <Button onClick={() => setShowAddPlayerModal(false)} variant="outline" className="flex-1">
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Substitute Modal - Placeholder */}
      <Dialog open={showSubstituteModal} onOpenChange={setShowSubstituteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Substitute Players - Court {selectedCourt?.court_number}</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-600">
            Player substitution functionality will be implemented here.
          </div>
        </DialogContent>
      </Dialog>

      {/* Score Modal - Placeholder */}
      <Dialog open={showScoreModal} onOpenChange={setShowScoreModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Update Score - Court {selectedCourt?.court_number}</DialogTitle>
          </DialogHeader>
          <div className="p-4 text-center text-gray-600">
            Score entry functionality will be implemented here.
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}