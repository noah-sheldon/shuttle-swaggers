'use client';

import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Clock, Trophy, Users, Star, ChevronRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function Home() {
  const heroRef = useRef<HTMLDivElement>(null);
  const shuttlecockRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero section animation
      gsap.fromTo('.hero-title', 
        { opacity: 0, y: 50 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo('.hero-subtitle', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.3, ease: 'power3.out' }
      );

      gsap.fromTo('.hero-buttons', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, delay: 0.6, ease: 'power3.out' }
      );

      // Shuttlecock floating animation
      gsap.to(shuttlecockRef.current, {
        y: -20,
        x: 10,
        rotation: 5,
        duration: 3,
        ease: 'power2.inOut',
        yoyo: true,
        repeat: -1
      });

      // Stats counter animation
      const statElements = document.querySelectorAll('.stat-number');
      statElements.forEach((element) => {
        const target = element as HTMLElement;
        const finalValue = parseInt(target.getAttribute('data-value') || '0', 10);
        
        gsap.fromTo(target, 
          { innerText: 0 },
          { 
            innerText: finalValue,
            duration: 2,
            snap: { innerText: 1 },
            ease: 'power2.out',
            scrollTrigger: {
              trigger: statsRef.current,
              start: 'top 80%',
              toggleActions: 'play none none reverse'
            }
          }
        );
      });

      // Feature cards stagger animation
      gsap.fromTo('.feature-card',
        { opacity: 0, y: 50 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          stagger: 0.2,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: featuresRef.current,
            start: 'top 80%'
          }
        }
      );

    }, heroRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="overflow-hidden">
      {/* Hero Section */}
      <section 
        ref={heroRef}
        className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-[#004d40] via-[#00695c] to-[#004d40]"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/3 right-1/3 w-24 h-24 border-2 border-white rounded-full"></div>
          <div className="absolute bottom-1/4 left-1/3 w-40 h-40 border-2 border-white rounded-full"></div>
        </div>

        {/* Animated Shuttlecock */}
        <div 
          ref={shuttlecockRef}
          className="absolute top-20 right-10 md:right-20 text-white opacity-20 text-6xl"
        >
          🏸
        </div>

        <div className="container mx-auto px-6 text-center text-white relative z-10">
          <h1 className="hero-title text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Shuttle
            <span className="block text-[#ff6f00]">Swaggers</span>
          </h1>
          <p className="hero-subtitle text-xl md:text-2xl mb-8 max-w-3xl mx-auto font-light">
            Advanced/High Intermediate badminton club where passion meets precision. 
            Join our championship-level community in Watford.
          </p>
          <div className="hero-buttons space-x-4">
            <Button 
              asChild
              size="lg"
              className="bg-[#ff6f00] hover:bg-[#e65100] text-white px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/sessions">
                Join a Session
                <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <Button 
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#004d40] px-8 py-4 text-lg font-semibold rounded-full transform hover:scale-105 transition-all duration-300"
            >
              <Link href="/games">View Live Games</Link>
            </Button>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white rounded-full mt-2"></div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section ref={statsRef} className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="space-y-2">
              <div className="stat-number text-4xl font-bold text-[#004d40]" data-value="60">0</div>
              <p className="text-gray-600">Active Members</p>
            </div>
            <div className="space-y-2">
              <div className="stat-number text-4xl font-bold text-[#004d40]" data-value="6">0</div>
              <p className="text-gray-600">Courts Available</p>
            </div>
            <div className="space-y-2">
              <div className="stat-number text-4xl font-bold text-[#004d40]" data-value="8">0</div>
              <p className="text-gray-600">Sessions per Month</p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold text-[#004d40]">2nd</div>
              <p className="text-gray-600">Hillingdon Div 3</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section ref={featuresRef} className="py-20">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-[#004d40] mb-4">Why Choose Shuttle Swaggers?</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              We're more than just a badminton club - we're a community of dedicated players pushing each other to excel.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ff6f00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#004d40] mb-4">Championship Level</h3>
                <p className="text-gray-600">
                  Advanced/High Intermediate players competing at the highest level. 
                  Recent runners-up in Hillingdon Division Three.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ff6f00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#004d40] mb-4">Prime Locations</h3>
                <p className="text-gray-600">
                  Two excellent venues: Watford Central Leisure Centre and Fuller Health Life Centre, 
                  both with modern facilities and easy access.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ff6f00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Clock className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#004d40] mb-4">Regular Sessions</h3>
                <p className="text-gray-600">
                  Consistent weekly sessions every Tuesday and Thursday, 8 PM - 10 PM. 
                  Build your skills with regular, reliable practice.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ff6f00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#004d40] mb-4">Welcoming Community</h3>
                <p className="text-gray-600">
                  A supportive environment where experienced players help newcomers develop their skills. 
                  Guest sessions available for £12.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ff6f00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Star className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#004d40] mb-4">Feather Shuttlecocks</h3>
                <p className="text-gray-600">
                  We play exclusively with feather shuttlecocks for the authentic badminton experience. 
                  Perfect for players looking to compete at a higher level.
                </p>
              </CardContent>
            </Card>

            <Card className="feature-card border-0 shadow-lg hover:shadow-xl transition-all duration-300 group">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 bg-[#ff6f00] rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Trophy className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-[#004d40] mb-4">Live Game System</h3>
                <p className="text-gray-600">
                  Modern court management system with real-time scoring, rankings, and player rotation. 
                  Stay engaged with live match updates.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-[#004d40] text-white">
        <div className="container mx-auto px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4">Ready to Join the Swaggers?</h2>
              <p className="text-lg opacity-90">
                Take your badminton to the next level with our championship community
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {/* Guest Session Card */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-[#ff6f00]">Try a Guest Session</h3>
                  <ul className="space-y-2 text-sm mb-4 opacity-90">
                    <li>• £12 per session</li>
                    <li>• Advanced/High Intermediate level</li>
                    <li>• Feather shuttlecocks included</li>
                    <li>• Tuesday & Thursday 8-10 PM</li>
                  </ul>
                  <Button 
                    asChild
                    className="w-full bg-[#ff6f00] hover:bg-[#e65100] text-white font-semibold rounded-full"
                  >
                    <Link href="/sessions">
                      Book Guest Session
                      <ChevronRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Contact Card */}
              <Card className="bg-white/10 backdrop-blur-md border-white/20 text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-3 text-[#ff6f00]">Get More Info</h3>
                  <ul className="space-y-2 text-sm mb-4 opacity-90">
                    <li>• Ask about membership</li>
                    <li>• Check skill requirements</li>
                    <li>• Learn about our venues</li>
                    <li>• Quick response within 24h</li>
                  </ul>
                  <Button 
                    asChild
                    variant="outline"
                    className="w-full border-2 border-white text-white bg-transparent hover:bg-white hover:text-[#004d40] font-semibold rounded-full"
                  >
                    <Link href="/contact">Contact Us</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <p className="text-sm opacity-75">
                Join 60+ active members • 6 courts available • 8 sessions per month
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}