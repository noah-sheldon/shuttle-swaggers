'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Save, Settings, Users, Trophy, Timer, Target, Plus } from 'lucide-react';
import { GameType, PegSystemMode, ScoringSystem, SessionConfig } from '@/types';

export default function SessionConfigPage() {
  const [config, setConfig] = useState<SessionConfig>({
    game_type: 'partnership_rotation',
    scoring_system: 'single_set_21',
    court_count: 4,
    max_duration_minutes: 120,
    skill_balancing: true
  });

  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [availablePlayers, setAvailablePlayers] = useState([
    // Regular Players - Group 1
    'AB', 'Bipin', 'Noah Sheldon', 'Andrew Blake', 'Amit Sanghvi', 
    'Amit Shah', 'PB', 'Navendu', 'Kelvin', 'Raj Subramanian', 
    'Romel Palma', 'Arvin', 'Vinesh', 'Nimesh Arya', 'Madhavan (Maddy)', 
    'Anil Abraham', 'Joseph Chan', 'Hari', 'Sunil M',
    
    // Regular Players - Group 2  
    'Ganesh MK', 'Neel', 'Arun'
  ].sort()); // Sort alphabetically for easier selection

  const [newPlayerName, setNewPlayerName] = useState('');
  const [showAddPlayer, setShowAddPlayer] = useState(false);

  const addNewPlayer = () => {
    if (newPlayerName.trim() && !availablePlayers.includes(newPlayerName.trim())) {
      setAvailablePlayers(prev => [...prev, newPlayerName.trim()].sort());
      setSelectedPlayers(prev => [...prev, newPlayerName.trim()]);
      setNewPlayerName('');
      setShowAddPlayer(false);
    }
  };

  const updateConfig = (key: keyof SessionConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  };

  const togglePlayer = (playerName: string) => {
    setSelectedPlayers(prev => 
      prev.includes(playerName)
        ? prev.filter(p => p !== playerName)
        : [...prev, playerName]
    );
  };

  const getGameTypeDescription = (type: GameType) => {
    switch (type) {
      case 'partnership_rotation':
        return 'Winners stay, losers rotate out. Optimizes for variety of partnerships.';
      case 'tournament_single':
        return 'Single elimination bracket. Losers are completely eliminated.';
      case 'round_robin':
        return 'Everyone plays everyone. All players get equal game time.';
      case 'peg_system':
        return 'Court hierarchy system. Winners stay on higher courts, losers move down.';
      default:
        return '';
    }
  };

  const getPegModeDescription = (mode: PegSystemMode) => {
    switch (mode) {
      case 'balanced_teams':
        return 'Teams balanced within each court for competitive matches.';
      case 'skill_based_courts':
        return 'Strongest players on Court 1, weakest on lowest court. Winners stay.';
      default:
        return '';
    }
  };

  const getEstimatedMatches = () => {
    const playerCount = selectedPlayers.length;
    const courtCount = config.court_count;
    
    switch (config.game_type) {
      case 'partnership_rotation':
        return Math.floor((playerCount * 3) / 4); // Rough estimate
      case 'tournament_single':
        return playerCount - 4; // Elimination tournament
      case 'round_robin':
        return Math.floor((playerCount / 2) * ((playerCount / 2) - 1) / 2); // Team combinations
      case 'peg_system':
        return Math.floor(config.max_duration_minutes / 20) * courtCount; // 20 min per match
      default:
        return 0;
    }
  };

  const saveConfiguration = async () => {
    const sessionData = {
      date: new Date(),
      location: 'Watford Central',
      config,
      selected_players: selectedPlayers
    };

    try {
      const response = await fetch('/api/sessions/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sessionData),
      });

      if (response.ok) {
        alert('Session configuration saved successfully!');
        // Redirect to admin dashboard
        window.location.href = '/admin';
      } else {
        alert('Failed to save session configuration');
      }
    } catch (error) {
      console.error('Error saving configuration:', error);
      alert('Failed to save session configuration');
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={() => window.history.back()}
                className="text-[#004d40] hover:text-[#ff6f00]"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Admin
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-[#004d40]">Session Configuration</h1>
                <p className="text-gray-600">Set up your badminton session with complete control</p>
              </div>
            </div>
            <Button 
              onClick={saveConfiguration}
              className="bg-[#ff6f00] hover:bg-[#e65100]"
              disabled={selectedPlayers.length < 4}
            >
              <Save className="w-4 h-4 mr-2" />
              Save & Start Session
            </Button>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Main Configuration */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Game Type Selection */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#004d40]">
                    <Trophy className="w-5 h-5" />
                    Game Type
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={config.game_type}
                    onValueChange={(value: GameType) => updateConfig('game_type', value)}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="partnership_rotation" id="partnership" />
                        <div className="flex-1">
                          <Label htmlFor="partnership" className="font-semibold">Partnership Rotation</Label>
                          <p className="text-sm text-gray-600">{getGameTypeDescription('partnership_rotation')}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="tournament_single" id="tournament" />
                        <div className="flex-1">
                          <Label htmlFor="tournament" className="font-semibold">Tournament (Single Elimination)</Label>
                          <p className="text-sm text-gray-600">{getGameTypeDescription('tournament_single')}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="round_robin" id="roundrobin" />
                        <div className="flex-1">
                          <Label htmlFor="roundrobin" className="font-semibold">Round Robin</Label>
                          <p className="text-sm text-gray-600">{getGameTypeDescription('round_robin')}</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <RadioGroupItem value="peg_system" id="peg" />
                        <div className="flex-1">
                          <Label htmlFor="peg" className="font-semibold">Peg System</Label>
                          <p className="text-sm text-gray-600">{getGameTypeDescription('peg_system')}</p>
                        </div>
                      </div>
                    </div>
                  </RadioGroup>

                  {/* Peg System Options */}
                  {config.game_type === 'peg_system' && (
                    <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Label className="font-semibold text-[#004d40] mb-3 block">Peg System Mode</Label>
                      <RadioGroup
                        value={config.peg_system_mode || 'balanced_teams'}
                        onValueChange={(value: PegSystemMode) => updateConfig('peg_system_mode', value)}
                      >
                        <div className="space-y-2">
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="balanced_teams" id="balanced" />
                            <div className="flex-1">
                              <Label htmlFor="balanced" className="font-medium">Balanced Teams</Label>
                              <p className="text-sm text-gray-600">{getPegModeDescription('balanced_teams')}</p>
                            </div>
                          </div>
                          <div className="flex items-start space-x-2">
                            <RadioGroupItem value="skill_based_courts" id="skillbased" />
                            <div className="flex-1">
                              <Label htmlFor="skillbased" className="font-medium">Skill-Based Courts</Label>
                              <p className="text-sm text-gray-600">{getPegModeDescription('skill_based_courts')}</p>
                            </div>
                          </div>
                        </div>
                      </RadioGroup>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Session Settings */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#004d40]">
                    <Settings className="w-5 h-5" />
                    Session Settings
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="courts" className="font-semibold text-[#004d40]">Number of Courts</Label>
                      <Select value={config.court_count.toString()} onValueChange={(value) => updateConfig('court_count', parseInt(value))}>
                        <SelectTrigger className="mt-2">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="2">2 Courts</SelectItem>
                          <SelectItem value="3">3 Courts</SelectItem>
                          <SelectItem value="4">4 Courts</SelectItem>
                          <SelectItem value="5">5 Courts</SelectItem>
                          <SelectItem value="6">6 Courts</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="duration" className="font-semibold text-[#004d40]">Session Duration (minutes)</Label>
                      <Input
                        id="duration"
                        type="number"
                        value={config.max_duration_minutes}
                        onChange={(e) => updateConfig('max_duration_minutes', parseInt(e.target.value))}
                        className="mt-2"
                        min="60"
                        max="180"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="scoring" className="font-semibold text-[#004d40]">Scoring System</Label>
                    <Select value={config.scoring_system} onValueChange={(value: ScoringSystem) => updateConfig('scoring_system', value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="single_set_21">Single Set to 21</SelectItem>
                        <SelectItem value="best_of_3">Best of 3 Sets</SelectItem>
                        <SelectItem value="time_limited">Time Limited (Highest Score)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <Label htmlFor="balancing" className="font-semibold text-[#004d40]">Skill Balancing</Label>
                      <p className="text-sm text-gray-600">Use historical performance for team formation</p>
                    </div>
                    <Switch
                      id="balancing"
                      checked={config.skill_balancing}
                      onCheckedChange={(checked) => updateConfig('skill_balancing', checked)}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Player Selection */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2 text-[#004d40]">
                      <Users className="w-5 h-5" />
                      Player Selection ({selectedPlayers.length} selected)
                    </CardTitle>
                    <Button
                      onClick={() => setShowAddPlayer(!showAddPlayer)}
                      variant="outline"
                      size="sm"
                      className="border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white"
                    >
                      <Plus className="w-4 h-4 mr-1" />
                      Add New Player
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  
                  {/* Add New Player Form */}
                  {showAddPlayer && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Enter player name"
                          value={newPlayerName}
                          onChange={(e) => setNewPlayerName(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addNewPlayer()}
                          className="flex-1"
                        />
                        <Button
                          onClick={addNewPlayer}
                          disabled={!newPlayerName.trim() || availablePlayers.includes(newPlayerName.trim())}
                          size="sm"
                          className="bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          Add
                        </Button>
                        <Button
                          onClick={() => {
                            setShowAddPlayer(false);
                            setNewPlayerName('');
                          }}
                          variant="outline"
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                      {newPlayerName.trim() && availablePlayers.includes(newPlayerName.trim()) && (
                        <p className="text-red-600 text-xs mt-1">Player already exists</p>
                      )}
                    </div>
                  )}

                  {/* Player Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availablePlayers.map(player => (
                      <div
                        key={player}
                        onClick={() => togglePlayer(player)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all ${
                          selectedPlayers.includes(player)
                            ? 'bg-[#ff6f00] text-white border-[#ff6f00]'
                            : 'bg-white text-gray-700 border-gray-200 hover:border-[#ff6f00]'
                        }`}
                      >
                        <div className="text-sm font-medium">{player}</div>
                      </div>
                    ))}
                  </div>
                  
                  {/* Selection Actions */}
                  <div className="flex justify-between items-center pt-3 border-t">
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedPlayers(availablePlayers)}
                        variant="outline"
                        size="sm"
                      >
                        Select All
                      </Button>
                      <Button
                        onClick={() => setSelectedPlayers([])}
                        variant="outline"
                        size="sm"
                      >
                        Clear All
                      </Button>
                    </div>
                    {selectedPlayers.length < 4 && (
                      <p className="text-red-600 text-sm">
                        Select at least 4 players to start a session
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Panel */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-[#004d40]">
                    <Timer className="w-5 h-5" />
                    Session Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Game Type:</span>
                      <Badge variant="secondary" className="bg-[#004d40] text-white">
                        {config.game_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Courts:</span>
                      <span className="font-semibold">{config.court_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-semibold">{config.max_duration_minutes} min</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Players:</span>
                      <span className="font-semibold">{selectedPlayers.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Est. Matches:</span>
                      <span className="font-semibold">{getEstimatedMatches()}</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <h4 className="font-semibold text-[#004d40]">Quick Tips:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• 24 players ideal for 4 courts</li>
                      <li>• 10 players ideal for 2 courts</li>
                      <li>• 2 hour sessions work best</li>
                      <li>• Enable skill balancing for fair games</li>
                    </ul>
                  </div>

                  {selectedPlayers.length >= 4 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <Target className="w-4 h-4" />
                        <span className="font-semibold">Ready to Start!</span>
                      </div>
                      <p className="text-sm text-green-600 mt-1">
                        Configuration looks good. Click "Save & Start Session" to begin.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}