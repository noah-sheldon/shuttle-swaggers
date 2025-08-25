'use client';

import { useState, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MapPin, Clock, Users, Calendar, ChevronRight, Car, ExternalLink } from 'lucide-react';
import { GuestSignupForm } from '@/components/modules/sign-up/GuestSignupForm';
import { getVenueDetails } from '@/lib/data/venues';

interface SessionData {
  _id: string;
  date: Date;
  location: 'Watford Central' | 'Fuller Health Life Centre';
  courts: number;
  is_live: boolean;
}

export default function SessionsPage() {
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [selectedSession, setSelectedSession] = useState<SessionData | null>(null);
  const [showSignupForm, setShowSignupForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const headerRef = useRef<HTMLDivElement>(null);
  const sessionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.page-title', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo('.session-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          delay: 0.3
        }
      );
    }, headerRef);

    return () => ctx.revert();
  }, [sessions]);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignupClick = (session: SessionData) => {
    setSelectedSession(session);
    setShowSignupForm(true);
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

  if (showSignupForm && selectedSession) {
    return (
      <div className="pt-16">
        <GuestSignupForm 
          session={selectedSession}
          onBack={() => setShowSignupForm(false)}
          onComplete={() => {
            setShowSignupForm(false);
            setSelectedSession(null);
          }}
        />
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-gray-50">
      {/* Header Section */}
      <section ref={headerRef} className="py-20 bg-[#004d40] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="page-title text-5xl font-bold mb-6">Upcoming Sessions</h1>
            <p className="text-xl opacity-90">
              Join our advanced/high intermediate badminton sessions in Watford. 
              Guest sessions available for £12 per session.
            </p>
          </div>
        </div>
      </section>

      {/* Sessions List */}
      <section ref={sessionsRef} className="py-20">
        <div className="container mx-auto px-6">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#ff6f00]"></div>
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-20">
              <h3 className="text-2xl font-semibold text-[#004d40] mb-4">No upcoming sessions</h3>
              <p className="text-gray-600 mb-8">Check back soon for new session announcements.</p>
              <Button 
                asChild
                className="bg-[#ff6f00] hover:bg-[#e65100]"
              >
                <a href="/contact">Contact Us for Updates</a>
              </Button>
            </div>
          ) : (
            <div className="max-w-4xl mx-auto space-y-6">
              {sessions.map((session, index) => (
                <Card 
                  key={session._id} 
                  className="session-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
                >
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
                            {session.is_live && (
                              <Badge className="bg-red-500 text-white">Live</Badge>
                            )}
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
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <MapPin className="w-4 h-4" />
                              <span>{session.location}</span>
                            </div>
                            {(() => {
                              const venue = getVenueDetails(session.location);
                              if (!venue) return null;
                              return (
                                <div className="flex flex-col gap-1 text-xs text-gray-500 ml-6">
                                  <a 
                                    href={venue.mapsUrl} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1 hover:text-[#ff6f00] transition-colors"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                    View Location
                                  </a>
                                  {venue.parkingUrl && (
                                    <a 
                                      href={venue.parkingUrl} 
                                      target="_blank" 
                                      rel="noopener noreferrer"
                                      className="flex items-center gap-1 hover:text-[#ff6f00] transition-colors"
                                    >
                                      <Car className="w-3 h-3" />
                                      Parking Info
                                    </a>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-[#ff6f00] mb-1">£12</div>
                          <div className="text-sm text-gray-600">Guest Fee</div>
                        </div>
                      </div>

                      <div className="flex justify-between items-center">
                        <div className="text-sm text-gray-600">
                          Advanced/High Intermediate • Feather Shuttlecocks
                        </div>
                        <Button 
                          onClick={() => handleSignupClick(session)}
                          className="bg-[#ff6f00] hover:bg-[#e65100] text-white font-semibold"
                          disabled={session.is_live}
                        >
                          {session.is_live ? 'Session in Progress' : 'Sign Up as Guest'}
                          {!session.is_live && <ChevronRight className="ml-2 w-4 h-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}

              {/* Info Card */}
              <Card className="border-0 shadow-lg bg-gradient-to-r from-[#004d40] to-[#00695c] text-white">
                <CardContent className="p-8">
                  <h3 className="text-2xl font-semibold mb-4">What to Expect</h3>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-3 text-[#ff6f00]">Key Information</h4>
                      <ul className="space-y-2 opacity-90 text-sm">
                        <li className="flex items-start">
                          <span className="text-[#ff6f00] mr-2">•</span>
                          Advanced/High Intermediate skill level required
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#ff6f00] mr-2">•</span>
                          Feather shuttlecocks used exclusively
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#ff6f00] mr-2">•</span>
                          Smart rotation system ensures fair play and maximum court time
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#ff6f00] mr-2">•</span>
                          Bring your racquet, non-marking shoes, and comfortable sportswear
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#ff6f00] mr-2">•</span>
                          Shuttlecocks and court time included in guest fee
                        </li>
                        <li className="flex items-start">
                          <span className="text-[#ff6f00] mr-2">•</span>
                          Club administrator will confirm your spot after signup
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}