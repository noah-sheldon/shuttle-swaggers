'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar, Trophy, TrendingUp } from 'lucide-react';
import { Session } from '@/types';
import { getVenueDetails } from '@/lib/data/venues';

export default function HistoryPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompletedSessions();
  }, []);

  const fetchCompletedSessions = async () => {
    try {
      const response = await fetch('/api/sessions/completed');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching completed sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(new Date(date));
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(date));
  };

  const getSessionStats = (session: Session) => {
    const totalMatches = session.matches.length;
    const totalPlayers = session.player_data.length;
    const topPlayer = session.rankings[0];
    
    return { totalMatches, totalPlayers, topPlayer };
  };

  if (loading) {
    return (
      <div className="pt-16 min-h-screen bg-gray-50">
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6f00]"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="py-20 bg-[#004d40] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Session History</h1>
            <p className="text-xl opacity-90">
              Review past sessions, match results, and player performances
            </p>
          </div>
        </div>
      </section>

      {/* Sessions List */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          {sessions.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-[#004d40] mb-4">No completed sessions yet</h3>
              <p className="text-gray-600">Sessions will appear here once they're completed.</p>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {sessions.map((session) => {
                const stats = getSessionStats(session);
                const venue = getVenueDetails(session.location);
                
                return (
                  <Card key={session._id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="flex">
                      {/* Date Column */}
                      <div className="bg-[#004d40] text-white p-6 flex flex-col items-center justify-center min-w-[150px]">
                        <div className="text-3xl font-bold">
                          {new Date(session.date).getDate()}
                        </div>
                        <div className="text-sm opacity-90">
                          {new Date(session.date).toLocaleDateString('en-GB', { month: 'short' })}
                        </div>
                        <div className="text-xs opacity-75">
                          {new Date(session.date).getFullYear()}
                        </div>
                        <Badge className="mt-2 bg-green-500 text-white">Completed</Badge>
                      </div>

                      {/* Session Details */}
                      <div className="flex-1 p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <div className="flex items-center gap-2 mb-2">
                              <Calendar className="w-5 h-5 text-[#ff6f00]" />
                              <span className="font-semibold text-[#004d40]">
                                {formatDate(session.date)}
                              </span>
                            </div>
                            <div className="flex items-center gap-4 text-gray-600 mb-3">
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatTime(session.date)} - {formatTime(new Date(new Date(session.date).getTime() + 2 * 60 * 60 * 1000))}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                <span>{session.courts} Courts</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-gray-600 mb-4">
                              <MapPin className="w-4 h-4" />
                              <span>{session.location}</span>
                            </div>
                          </div>
                        </div>

                        {/* Session Statistics */}
                        <div className="grid md:grid-cols-3 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#ff6f00]">{stats.totalPlayers}</div>
                            <div className="text-sm text-gray-600">Players</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-[#ff6f00]">{stats.totalMatches}</div>
                            <div className="text-sm text-gray-600">Matches</div>
                          </div>
                          <div className="text-center">
                            {stats.topPlayer ? (
                              <>
                                <div className="flex items-center justify-center gap-1">
                                  <Trophy className="w-4 h-4 text-[#ff6f00]" />
                                  <div className="font-semibold text-[#004d40] text-sm">{stats.topPlayer.name}</div>
                                </div>
                                <div className="text-xs text-gray-600">Session Winner</div>
                              </>
                            ) : (
                              <>
                                <div className="text-2xl font-bold text-gray-400">-</div>
                                <div className="text-sm text-gray-600">No Winner</div>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <div className="text-sm text-gray-600">
                            Completed {session.completed_at ? new Intl.DateTimeFormat('en-GB', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            }).format(new Date(session.completed_at)) : 'recently'}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-[#ff6f00]">
                            <TrendingUp className="w-4 h-4" />
                            <span>View Details</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}