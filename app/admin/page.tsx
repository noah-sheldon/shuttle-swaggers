'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, Plus, RefreshCw, Play, Square, Users, Clock, Settings, MapPin, Target, ChevronRight } from 'lucide-react';
import { Session } from '@/types';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveSession, setLiveSession] = useState<Session | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [configureSessionId, setConfigureSessionId] = useState<string | null>(null);
  
  // Configuration dialog state - unique player names only
  const [availablePlayers] = useState([
    'AB', 'Bipin', 'Noah Sheldon', 'Andrew Blake', 'Amit Sanghvi', 'Amit Shah', 
    'PB', 'Navendu', 'Kelvin', 'Raj Subramanian', 'Romel Palma', 'Arvin', 
    'Vinesh', 'Nimesh Arya', 'Madhevan (Maddy)', 'Anil', 'Abraham Joseph', 
    'Chan', 'Hari', 'Sunil M', 'Ganesh', 'MK', 'Neel', 'Arun'
  ].sort()); // Sort alphabetically for better UX
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [gameType, setGameType] = useState('partnership_rotation');
  const [courtCount, setCourtCount] = useState(4);
  const [newPlayerName, setNewPlayerName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [configuringSave, setConfiguringSave] = useState(false);

  useEffect(() => {
    fetchSessions();
    fetchLiveSession();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data.filter((s: Session) => s.status !== 'completed'));
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchLiveSession = async () => {
    try {
      const response = await fetch('/api/sessions/live');
      if (response.ok) {
        const data = await response.json();
        setLiveSession(data);
      }
    } catch (error) {
      console.error('Error fetching live session:', error);
    }
  };

  const generateSessions = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/sessions/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: '2025-08-26T00:00:00.000Z', // Tuesday, August 26, 2025
          monthsAhead: 2
        }),
      });

      const data = await response.json();
      setResult(data);
      if (!data.error) {
        fetchSessions(); // Refresh the sessions list
      }
    } catch (error) {
      setResult({ error: 'Failed to generate sessions' });
    } finally {
      setLoading(false);
    }
  };

  const manageLiveSession = async (sessionId: string, action: 'start' | 'end') => {
    setActionLoading(sessionId);
    
    try {
      const response = await fetch(`/api/sessions/${sessionId}/live`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action }),
      });

      if (response.ok) {
        await fetchSessions();
        await fetchLiveSession();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to manage session');
      }
    } catch (error) {
      toast.error('Failed to manage session');
    } finally {
      setActionLoading(null);
    }
  };

  const handleStartSession = (sessionId: string) => {
    router.push(`/admin/session/${sessionId}`);
  };

  const handleConfigureSession = (sessionId: string) => {
    const session = sessions.find(s => s._id === sessionId);
    if (session) {
      // Pre-populate with existing configuration
      setSelectedPlayers(session.player_data?.map(p => p.name) || []);
      setGameType(session.config?.game_type || 'partnership_rotation');
      setCourtCount(session.config?.court_count || session.courts || 4);
    }
    setConfigureSessionId(sessionId);
  };

  const saveSessionConfiguration = async () => {
    if (!configureSessionId || configuringSave) return;
    
    // Validation
    if (selectedPlayers.length < 4) {
      toast.error('Please select at least 4 players to configure the session.');
      return;
    }
    
    if (!gameType) {
      toast.error('Please select a game type.');
      return;
    }
    
    if (courtCount < 1 || courtCount > 6) {
      toast.error('Please select a valid number of courts (1-6).');
      return;
    }
    
    setConfiguringSave(true);
    
    try {
      const playerData = selectedPlayers.map((name, index) => ({
        player_id: `player_${Date.now()}_${index}`,
        name: name.trim(),
        wins: 0,
        losses: 0,
        points_for: 0,
        points_against: 0,
        played_with: [],
        played_against: [],
        skill_rating: 500,
        session_skill_rating: 500,
        is_active: true,
        is_paused: true // Start paused as requested
      }));

      const config = {
        game_type: gameType,
        court_count: courtCount,
        scoring_system: 'single_set_21',
        max_duration_minutes: 120,
        skill_balancing: true,
        peg_system_mode: 'balanced_teams'
      };

      const response = await fetch(`/api/sessions/${configureSessionId}/update-config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          config,
          player_data: playerData
        }),
      });

      if (response.ok) {
        const result = await response.json();
        toast.success('Session configured successfully! Players have been added and settings saved.');
        
        // Reset form
        setConfigureSessionId(null);
        setSelectedPlayers([]);
        setGameType('partnership_rotation');
        setCourtCount(4);
        setSearchQuery('');
        setNewPlayerName('');
        
        // Refresh sessions
        fetchSessions();
      } else {
        const error = await response.json();
        console.error('Configuration error:', error);
        toast.error(error.error || 'Failed to configure session. Please try again.');
      }
    } catch (error) {
      console.error('Error configuring session:', error);
      toast.error('Network error: Failed to configure session. Please check your connection and try again.');
    } finally {
      setConfiguringSave(false);
    }
  };

  const addPlayerToSelection = (playerName: string) => {
    // Case-insensitive check to prevent duplicates
    const nameExists = selectedPlayers.some(player => 
      player.toLowerCase() === playerName.toLowerCase()
    );
    
    if (!nameExists) {
      setSelectedPlayers([...selectedPlayers, playerName]);
    }
  };

  const removePlayerFromSelection = (playerName: string) => {
    setSelectedPlayers(selectedPlayers.filter(p => p !== playerName));
  };

  const addNewPlayer = () => {
    const trimmedName = newPlayerName.trim();
    
    // Validation checks
    if (!trimmedName) return;
    
    // Check if name already exists in available players or selected players
    const nameExists = availablePlayers.some(player => 
      player.toLowerCase() === trimmedName.toLowerCase()
    ) || selectedPlayers.some(player => 
      player.toLowerCase() === trimmedName.toLowerCase()
    );
    
    if (nameExists) {
      toast.error('A player with this name already exists. Please use a different name.');
      return;
    }
    
    // Add to selected players
    setSelectedPlayers([...selectedPlayers, trimmedName]);
    setNewPlayerName('');
  };

  const getFilteredPlayers = () => {
    return availablePlayers.filter(player => 
      player.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !selectedPlayers.includes(player)
    );
  };

  const selectAllPlayers = () => {
    const availableToSelect = availablePlayers.filter(player => !selectedPlayers.includes(player));
    setSelectedPlayers([...selectedPlayers, ...availableToSelect]);
  };

  const clearAllPlayers = () => {
    setSelectedPlayers([]);
  };

  const getGameTypeDescription = (type: string) => {
    switch (type) {
      case 'partnership_rotation':
        return 'Players rotate partners to avoid repetitive matchups. Best for social play.';
      case 'tournament_single':
        return 'Single elimination tournament bracket. Competitive knockout format.';
      case 'round_robin':
        return 'Everyone plays everyone else. Fair tournament format.';
      case 'peg_system':
        return 'Court hierarchy system. Winners stay, losers move down courts.';
      case 'full_rotation':
        return '4 players on court, remaining players rotate systematically. Equal playing time for all.';
      default:
        return '';
    }
  };

  const createNewSession = () => {
    // For now, redirect to the existing session-config page
    // Later we can make this a modal dialog
    router.push('/admin/session-config');
  };

  const formatSessionDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatSessionTime = (date: string | Date) => {
    return new Date(date).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSessionStatus = (session: Session) => {
    if (session.is_live) return 'live';
    if (session.status === 'completed') return 'completed';
    if (session.player_data && session.player_data.length > 0) return 'configured';
    return 'pending';
  };

  const resetSessionData = async (type: 'session' | 'historical') => {
    if (!liveSession) return;
    
    try {
      const response = await fetch(`/api/sessions/${liveSession._id}/control`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: type === 'session' ? 'reset_session_ratings' : 'reset_historical_ratings'
        }),
      });

      if (response.ok) {
        toast.success(`${type === 'session' ? 'Session ratings' : 'Historical data'} reset successfully`);
        await fetchLiveSession(); // Refresh data
      } else {
        const error = await response.json();
        toast.error(error.error || `Failed to reset ${type} data`);
      }
    } catch (error) {
      console.error(`Error resetting ${type} data:`, error);
      toast.error(`Failed to reset ${type} data`);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-[#004d40]">Admin Dashboard</h1>
            <div className="flex gap-3">
              <Button 
                onClick={createNewSession}
                className="bg-[#004d40] hover:bg-[#00695c] text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create New Session
              </Button>
              <Button 
                onClick={generateSessions}
                disabled={loading}
                variant="outline"
                className="border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Bulk Sessions
                  </>
                )}
              </Button>
            </div>
          </div>

          {result && (
            <Card className="mb-6">
              <CardContent className="p-4">
                {result.error ? (
                  <div className="text-red-600">
                    <strong>Error:</strong> {result.error}
                  </div>
                ) : (
                  <div className="text-green-600">
                    <div><strong>Success!</strong></div>
                    <div>Created: {result.sessions?.length || 0} new sessions</div>
                    <div>Skipped: {result.skipped || 0} existing sessions</div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Sessions Grid */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#004d40]">All Sessions</h2>
              <Badge variant="outline" className="text-sm">
                {sessions.length} sessions
              </Badge>
            </div>

            {loadingSessions ? (
              <div className="flex justify-center py-12">
                <RefreshCw className="w-8 h-8 animate-spin text-[#004d40]" />
              </div>
            ) : sessions.length === 0 ? (
              <Card className="p-8 text-center">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Sessions Available</h3>
                <p className="text-gray-500 mb-6">Create your first session or generate bulk sessions to get started.</p>
                <div className="flex justify-center gap-3">
                  <Button onClick={createNewSession} className="bg-[#004d40] hover:bg-[#00695c]">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Session
                  </Button>
                  <Button onClick={generateSessions} variant="outline" disabled={loading}>
                    <Calendar className="w-4 h-4 mr-2" />
                    Generate Bulk
                  </Button>
                </div>
              </Card>
            ) : (
              <div className="grid lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {sessions.map((session) => {
                  const sessionStatus = getSessionStatus(session);
                  const playerCount = session.player_data?.length || 0;
                  const courtCount = session.config?.court_count || session.courts || 0;
                  
                  return (
                    <Card key={session._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                      <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <MapPin className="w-4 h-4 text-[#ff6f00]" />
                              <h3 className="font-semibold text-[#004d40] text-lg">
                                {session.location === 'Watford Central' ? 'Watford Central' : 'Fuller Health'}
                              </h3>
                            </div>
                            <div className="space-y-1 text-sm text-gray-600">
                              <div className="flex items-center gap-2">
                                <Calendar className="w-3 h-3" />
                                <span>{formatSessionDate(session.date)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-3 h-3" />
                                <span>{formatSessionTime(session.date)} - {formatSessionTime(new Date(new Date(session.date).getTime() + 2 * 60 * 60 * 1000).toISOString())}</span>
                              </div>
                            </div>
                          </div>
                          <Badge 
                            className={
                              sessionStatus === 'live' ? 'bg-red-500 text-white animate-pulse' :
                              sessionStatus === 'completed' ? 'bg-green-500' :
                              sessionStatus === 'configured' ? 'bg-blue-500' :
                              'bg-gray-400'
                            }
                          >
                            {sessionStatus}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="text-center p-3 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#004d40]">{playerCount}</div>
                            <div className="text-xs text-gray-600">Players</div>
                          </div>
                          <div className="text-center p-3 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-[#ff6f00]">{courtCount}</div>
                            <div className="text-xs text-gray-600">Courts</div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={() => handleConfigureSession(session._id!)}
                            variant="outline"
                            size="sm"
                            className="flex-1 border-[#004d40] text-[#004d40] hover:bg-[#004d40] hover:text-white"
                          >
                            <Settings className="w-4 h-4 mr-2" />
                            Configure
                          </Button>
                          
                          {sessionStatus !== 'completed' && !liveSession && (
                            <Button
                              onClick={() => handleStartSession(session._id!)}
                              disabled={sessionStatus === 'pending'}
                              size="sm"
                              className="flex-1 bg-[#ff6f00] hover:bg-[#e65100] disabled:bg-gray-300"
                            >
                              <Play className="w-4 h-4 mr-2" />
                              {sessionStatus === 'live' ? 'Manage' : 'Start'}
                            </Button>
                          )}
                          
                          {sessionStatus === 'live' && (
                            <Button
                              onClick={() => manageLiveSession(session._id!, 'end')}
                              disabled={actionLoading === session._id}
                              variant="destructive"
                              size="sm"
                              className="flex-1"
                            >
                              {actionLoading === session._id ? (
                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                              ) : (
                                <Square className="w-4 h-4 mr-2" />
                              )}
                              End
                            </Button>
                          )}
                        </div>

                        {sessionStatus === 'pending' && (
                          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded text-xs text-yellow-800">
                            Configure this session before starting
                          </div>
                        )}
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Session Configuration Dialog */}
          <Dialog open={!!configureSessionId} onOpenChange={() => setConfigureSessionId(null)}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="text-2xl text-[#004d40]">Configure Session</DialogTitle>
              </DialogHeader>
              
              <Tabs defaultValue="gamemode" className="space-y-6">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="gamemode">Game Mode</TabsTrigger>
                  <TabsTrigger value="players">Players</TabsTrigger>
                  <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="gamemode" className="space-y-4">
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold text-[#004d40]">Select Game Type</Label>
                    <div className="grid gap-4">
                      {[
                        { value: 'partnership_rotation', icon: '🔄' },
                        { value: 'tournament_single', icon: '🏆' },
                        { value: 'round_robin', icon: '🔁' },
                        { value: 'peg_system', icon: '📊' },
                        { value: 'full_rotation', icon: '♻️' }
                      ].map((option) => (
                        <Card 
                          key={option.value}
                          className={`cursor-pointer transition-all duration-200 border-2 ${
                            gameType === option.value 
                              ? 'border-[#004d40] bg-green-50 shadow-md' 
                              : 'border-gray-200 hover:border-[#004d40] hover:shadow-sm'
                          }`}
                          onClick={() => setGameType(option.value)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-4">
                              <div className="text-2xl">{option.icon}</div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h3 className="font-semibold capitalize">
                                    {option.value.replace('_', ' ')}
                                  </h3>
                                  {gameType === option.value && (
                                    <Target className="w-4 h-4 text-[#004d40]" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600">
                                  {getGameTypeDescription(option.value)}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="players" className="space-y-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label className="text-lg font-semibold text-[#004d40]">
                        Select Players ({selectedPlayers.length} selected)
                      </Label>
                      <Badge variant="outline" className="text-sm">
                        Min: 4 players
                      </Badge>
                    </div>

                    {/* Search and Add New Player */}
                    <div className="space-y-3">
                      <div className="relative">
                        <Input
                          placeholder="Search players..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="pr-10"
                        />
                        <div className="absolute inset-y-0 right-3 flex items-center">
                          <Users className="w-4 h-4 text-gray-400" />
                        </div>
                      </div>
                      
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <Input
                            placeholder="Add new player..."
                            value={newPlayerName}
                            onChange={(e) => setNewPlayerName(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && addNewPlayer()}
                            className={`${
                              newPlayerName.trim() && (
                                availablePlayers.some(player => 
                                  player.toLowerCase() === newPlayerName.trim().toLowerCase()
                                ) || selectedPlayers.some(player => 
                                  player.toLowerCase() === newPlayerName.trim().toLowerCase()
                                )
                              ) ? 'border-red-400 focus:border-red-500' : ''
                            }`}
                          />
                          {newPlayerName.trim() && (
                            availablePlayers.some(player => 
                              player.toLowerCase() === newPlayerName.trim().toLowerCase()
                            ) || selectedPlayers.some(player => 
                              player.toLowerCase() === newPlayerName.trim().toLowerCase()
                            )
                          ) && (
                            <p className="text-xs text-red-600 mt-1">Player name already exists</p>
                          )}
                        </div>
                        <Button
                          onClick={addNewPlayer}
                          disabled={
                            !newPlayerName.trim() || 
                            availablePlayers.some(player => 
                              player.toLowerCase() === newPlayerName.trim().toLowerCase()
                            ) || selectedPlayers.some(player => 
                              player.toLowerCase() === newPlayerName.trim().toLowerCase()
                            )
                          }
                          variant="outline"
                          className="border-[#004d40] text-[#004d40] disabled:opacity-50"
                        >
                          <Plus className="w-4 h-4 mr-1" />
                          Add
                        </Button>
                      </div>
                    </div>

                    {/* Selected Players */}
                    {selectedPlayers.length > 0 && (
                      <div className="space-y-2">
                        <Label className="text-sm font-medium">Selected Players:</Label>
                        <div className="flex flex-wrap gap-2">
                          {selectedPlayers.map((player) => (
                            <Badge
                              key={player}
                              variant="secondary"
                              className="bg-[#004d40] text-white hover:bg-[#00695c] cursor-pointer"
                              onClick={() => removePlayerFromSelection(player)}
                            >
                              {player}
                              <span className="ml-1 text-xs">✕</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Available Players */}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-sm font-medium">Available Players:</Label>
                        <div className="flex gap-2">
                          {getFilteredPlayers().length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={selectAllPlayers}
                              className="text-xs border-[#004d40] text-[#004d40] hover:bg-[#004d40] hover:text-white"
                            >
                              <Users className="w-3 h-3 mr-1" />
                              Select All
                            </Button>
                          )}
                          {selectedPlayers.length > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearAllPlayers}
                              className="text-xs border-red-400 text-red-600 hover:bg-red-500 hover:text-white"
                            >
                              Clear All
                            </Button>
                          )}
                        </div>
                      </div>
                      <div className="max-h-64 overflow-y-auto border rounded-lg p-3 bg-gray-50">
                        {getFilteredPlayers().length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            {searchQuery ? 'No players match your search' : 'All players selected'}
                          </div>
                        ) : (
                          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                            {getFilteredPlayers().map((player) => (
                              <Badge
                                key={player}
                                variant="outline"
                                className="cursor-pointer hover:bg-[#004d40] hover:text-white transition-colors justify-center py-2"
                                onClick={() => addPlayerToSelection(player)}
                              >
                                {player}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="settings" className="space-y-4">
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="courtCount" className="text-lg font-semibold text-[#004d40]">
                        Number of Courts
                      </Label>
                      <Select value={courtCount.toString()} onValueChange={(value) => setCourtCount(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select court count" />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num} Court{num !== 1 ? 's' : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#004d40]">
                          {Math.max(courtCount * 4, selectedPlayers.length)}
                        </div>
                        <div className="text-sm text-gray-600">Players on Court</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-[#ff6f00]">
                          {Math.max(0, selectedPlayers.length - (courtCount * 4))}
                        </div>
                        <div className="text-sm text-gray-600">Players Waiting</div>
                      </div>
                    </div>

                    <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
                      <h4 className="font-semibold text-[#004d40]">Session Details</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Scoring System:</span>
                          <br />
                          <span className="text-gray-600">Single set to 21 points</span>
                        </div>
                        <div>
                          <span className="font-medium">Duration:</span>
                          <br />
                          <span className="text-gray-600">2 hours maximum</span>
                        </div>
                        <div>
                          <span className="font-medium">Skill Balancing:</span>
                          <br />
                          <span className="text-gray-600">Enabled</span>
                        </div>
                        <div>
                          <span className="font-medium">Player Status:</span>
                          <br />
                          <span className="text-gray-600">Start paused (self-unpause)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end gap-3 pt-6 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => setConfigureSessionId(null)}
                  className="border-gray-300"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={saveSessionConfiguration}
                  disabled={selectedPlayers.length < 4 || configuringSave}
                  className="bg-[#004d40] hover:bg-[#00695c]"
                >
                  {configuringSave ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      Save Configuration
                      <ChevronRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}