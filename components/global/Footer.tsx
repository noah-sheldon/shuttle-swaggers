'use client';

import Link from 'next/link';
import Image from 'next/image';
import { MapPin, Clock, Mail, Trophy } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-[#004d40] text-white">
      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Club Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <Image 
                src="/logo.jpeg" 
                alt="Shuttle Swaggers BC Logo" 
                width={32} 
                height={32} 
                className="rounded-full"
              />
              <span className="font-bold text-lg">Shuttle Swaggers</span>
            </div>
            <p className="text-sm opacity-90 mb-4">
              Advanced/High Intermediate badminton club in Watford. Join our championship-level community.
            </p>
            <div className="flex items-center space-x-2 text-sm opacity-75">
              <Trophy className="w-4 h-4" />
              <span>Hillingdon Div 3 Runners-up 2024-25</span>
            </div>
          </div>

          {/* Session Times */}
          <div>
            <h3 className="font-semibold text-[#ff6f00] mb-4">Session Times</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="font-medium">Tuesday Sessions</div>
                <div className="opacity-75">8:00 PM - 10:00 PM</div>
                <div className="opacity-60 text-xs">Watford Central Leisure Centre</div>
              </div>
              <div>
                <div className="font-medium">Thursday Sessions</div>
                <div className="opacity-75">8:00 PM - 10:00 PM</div>
                <div className="opacity-60 text-xs">Fuller Health Life Centre</div>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-[#ff6f00] mb-4">Quick Links</h3>
            <div className="space-y-2 text-sm">
              <Link href="/sessions" className="block opacity-90 hover:opacity-100 hover:text-[#ff6f00] transition-colors">
                Upcoming Sessions
              </Link>
              <Link href="/games" className="block opacity-90 hover:opacity-100 hover:text-[#ff6f00] transition-colors">
                Live Games
              </Link>
              <Link href="/contact" className="block opacity-90 hover:opacity-100 hover:text-[#ff6f00] transition-colors">
                Contact Us
              </Link>
              <Link href="/sessions" className="block opacity-90 hover:opacity-100 hover:text-[#ff6f00] transition-colors">
                Join as Guest (£12)
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-[#ff6f00] mb-4">Contact</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-2">
                <Mail className="w-4 h-4 mt-0.5 opacity-75" />
                <div>
                  <a 
                    href="mailto:shuttleswaggersbc@gmail.com" 
                    className="opacity-90 hover:opacity-100 hover:text-[#ff6f00] transition-colors"
                  >
                    shuttleswaggersbc@gmail.com
                  </a>
                  <div className="opacity-60 text-xs">Usually respond within 24h</div>
                </div>
              </div>
              
              <div className="flex items-start space-x-2">
                <MapPin className="w-4 h-4 mt-0.5 opacity-75" />
                <div>
                  <div className="opacity-90">Watford Central Leisure Centre</div>
                  <div className="opacity-90">Fuller Health Life Centre</div>
                  <div className="opacity-60 text-xs">See sessions page for details</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/20 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm">
            <div className="opacity-75">
              © 2025 Shuttle Swaggers Badminton Club. All rights reserved.
            </div>
            <div className="flex items-center space-x-6 mt-4 md:mt-0 opacity-75">
              <div>Advanced/High Intermediate Level</div>
              <div>•</div>
              <div>Feather Shuttlecocks Only</div>
              <div>•</div>
              <div>Guest Fee: £12</div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}