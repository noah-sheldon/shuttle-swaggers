'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Plus, RefreshCw, Play, Square, Users, Clock } from 'lucide-react';
import { Session } from '@/types';

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [liveSession, setLiveSession] = useState<Session | null>(null);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

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
        alert(error.error || 'Failed to manage session');
      }
    } catch (error) {
      alert('Failed to manage session');
    } finally {
      setActionLoading(null);
    }
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
        alert(`${type === 'session' ? 'Session ratings' : 'Historical data'} reset successfully`);
        await fetchLiveSession(); // Refresh data
      } else {
        const error = await response.json();
        alert(error.error || `Failed to reset ${type} data`);
      }
    } catch (error) {
      console.error(`Error resetting ${type} data:`, error);
      alert(`Failed to reset ${type} data`);
    }
  };

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-12">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-[#004d40] mb-8">Admin Dashboard</h1>
          
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Session Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <Button 
                  asChild
                  className="w-full bg-[#004d40] hover:bg-[#00695c] text-white"
                >
                  <a href="/admin/session-config">
                    <Plus className="w-4 h-4 mr-2" />
                    Configure New Session
                  </a>
                </Button>
                <Button 
                  onClick={generateSessions}
                  disabled={loading}
                  variant="outline"
                  className="w-full border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white"
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
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Bulk Session Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-600">
                Generate regular Tuesday and Thursday sessions for the next 2 months.
                Starting from August 26, 2025.
              </p>
              
              <div className="space-y-2 text-sm text-gray-600">
                <div>• Tuesdays: Watford Central Leisure Centre (8:00 PM - 10:00 PM)</div>
                <div>• Thursdays: Fuller Health Life Centre (8:00 PM - 10:00 PM)</div>
              </div>

              <Button 
                onClick={generateSessions}
                disabled={loading}
                className="w-full bg-[#ff6f00] hover:bg-[#e65100]"
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Generating Sessions...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate Sessions
                  </>
                )}
              </Button>

              {result && (
                <div className="mt-4 p-4 rounded-lg bg-gray-100">
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
                </div>
              )}
            </CardContent>
          </Card>

          {/* Session Data Management */}
          {liveSession && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5" />
                  Session Data Controls
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <Button
                    onClick={() => resetSessionData('session')}
                    variant="outline"
                    className="w-full border-[#ff6f00] text-[#ff6f00] hover:bg-[#ff6f00] hover:text-white"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Session Ratings
                  </Button>
                  <Button
                    onClick={() => {
                      if (confirm('This will permanently delete all historical performance data. Are you sure?')) {
                        resetSessionData('historical');
                      }
                    }}
                    variant="outline"
                    className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Reset Historical Data
                  </Button>
                </div>
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Session Ratings:</strong> Resets current session wins/losses/ratings but keeps historical data.<br />
                    <strong>Historical Data:</strong> Permanently deletes all historical performance data.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Live Session Management */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5" />
                Live Session Control
              </CardTitle>
            </CardHeader>
            <CardContent>
              {liveSession ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <div className="font-semibold text-red-900">
                        {liveSession.location} - {new Date(liveSession.date).toLocaleDateString()}
                      </div>
                      <div className="text-sm text-red-700">
                        Live session in progress
                      </div>
                    </div>
                    <Badge className="bg-red-500">LIVE</Badge>
                  </div>
                  <Button
                    onClick={() => manageLiveSession(liveSession._id!, 'end')}
                    disabled={actionLoading === liveSession._id}
                    variant="destructive"
                    className="w-full"
                  >
                    {actionLoading === liveSession._id ? (
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Square className="w-4 h-4 mr-2" />
                    )}
                    End Live Session
                  </Button>
                </div>
              ) : (
                <p className="text-gray-600 mb-4">
                  No live session currently active. Select a session below to start.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Session List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Upcoming Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingSessions ? (
                <div className="flex justify-center py-4">
                  <RefreshCw className="w-6 h-6 animate-spin" />
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-gray-600">No upcoming sessions. Generate some sessions first.</p>
              ) : (
                <div className="space-y-3">
                  {sessions.slice(0, 10).map((session) => (
                    <div key={session._id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">
                          {session.location}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.date).toLocaleDateString('en-GB')}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(session.date).toLocaleTimeString('en-GB', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          className={
                            session.status === 'live' ? 'bg-red-500' :
                            session.status === 'completed' ? 'bg-green-500' :
                            'bg-blue-500'
                          }
                        >
                          {session.status}
                        </Badge>
                        {session.status === 'upcoming' && !liveSession && (
                          <Button
                            onClick={() => manageLiveSession(session._id!, 'start')}
                            disabled={actionLoading === session._id}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {actionLoading === session._id ? (
                              <RefreshCw className="w-3 h-3 animate-spin" />
                            ) : (
                              <Play className="w-3 h-3" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}