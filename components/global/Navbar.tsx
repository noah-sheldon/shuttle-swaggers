'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed w-full z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-[#004d40]/95 backdrop-blur-md shadow-lg' 
        : 'bg-[#004d40]/90'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <Image 
              src="/logo.jpeg" 
              alt="Shuttle Swaggers BC Logo" 
              width={40} 
              height={40} 
              className="rounded-full"
            />
            <span className="font-bold text-xl text-white">
              Shuttle Swaggers
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link 
              href="/" 
              className="text-white hover:text-[#ff6f00] transition-colors"
            >
              Home
            </Link>
            <Link 
              href="/sessions" 
              className="text-white hover:text-[#ff6f00] transition-colors"
            >
              Sessions
            </Link>
            <Link 
              href="/games" 
              className="text-white hover:text-[#ff6f00] transition-colors"
            >
              Games
            </Link>
            <Link 
              href="/blogs" 
              className="text-white hover:text-[#ff6f00] transition-colors"
            >
              Blog
            </Link>
            <Link 
              href="/contact" 
              className="text-white hover:text-[#ff6f00] transition-colors"
            >
              Contact
            </Link>
            <Button 
              asChild
              className="bg-[#ff6f00] hover:bg-[#e65100] text-white border-0"
            >
              <Link href="/sessions">Join a Session</Link>
            </Button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-white"
            >
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-[#004d40] hover:text-[#ff6f00]"
                onClick={() => setIsOpen(false)}
              >
                Home
              </Link>
              <Link 
                href="/sessions" 
                className="block px-3 py-2 text-[#004d40] hover:text-[#ff6f00]"
                onClick={() => setIsOpen(false)}
              >
                Sessions
              </Link>
              <Link 
                href="/games" 
                className="block px-3 py-2 text-[#004d40] hover:text-[#ff6f00]"
                onClick={() => setIsOpen(false)}
              >
                Games
              </Link>
              <Link 
                href="/blogs" 
                className="block px-3 py-2 text-[#004d40] hover:text-[#ff6f00]"
                onClick={() => setIsOpen(false)}
              >
                Blog
              </Link>
              <Link 
                href="/contact" 
                className="block px-3 py-2 text-[#004d40] hover:text-[#ff6f00]"
                onClick={() => setIsOpen(false)}
              >
                Contact
              </Link>
              <div className="px-3 py-2">
                <Button 
                  asChild
                  className="w-full bg-[#ff6f00] hover:bg-[#e65100] text-white"
                >
                  <Link href="/sessions">Join a Session</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}