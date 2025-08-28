'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { MapPin, Clock, Mail, Phone, Users, Trophy, MessageCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const pageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.contact-header', 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
      );

      gsap.fromTo('.contact-card',
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

      gsap.fromTo('.info-item',
        { opacity: 0, x: -30 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          delay: 0.6
        }
      );
    }, pageRef);

    return () => ctx.revert();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setIsSubmitted(true);
        setFormData({ name: '', email: '', subject: '', message: '' });
        toast.success('Message sent successfully! We\'ll get back to you soon.');
      } else {
        throw new Error('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('There was an error sending your message. Please try again or contact us directly.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div ref={pageRef} className="pt-16 min-h-screen bg-gray-50">
      {/* Header Section */}
      <section className="py-20 bg-[#004d40] text-white">
        <div className="container mx-auto px-6">
          <div className="contact-header max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">Get in Touch</h1>
            <p className="text-xl opacity-90">
              Have questions about joining Watford Shuttlers? We'd love to hear from you. 
              Contact us about sessions, membership, or any badminton-related inquiries.
            </p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20">
        <div className="container mx-auto px-6">
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <div className="space-y-8">
              <div>
                <h2 className="text-3xl font-bold text-[#004d40] mb-6">Contact Information</h2>
                <p className="text-gray-600 mb-8">
                  Ready to join our advanced badminton community? Get in touch and we'll help you 
                  get started with your first session.
                </p>
              </div>

              <div className="space-y-6">
                <div className="info-item flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ff6f00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#004d40] mb-1">Email Us</h3>
                    <p className="text-gray-600">shuttleswaggersbc@gmail.com</p>
                    <p className="text-sm text-gray-500 mt-1">
                      We typically respond within 24 hours
                    </p>
                  </div>
                </div>

                <div className="info-item flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ff6f00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#004d40] mb-1">Quick Questions</h3>
                    <p className="text-gray-600">Use our contact form for general inquiries</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Perfect for questions about skill level, sessions, or membership
                    </p>
                  </div>
                </div>

                <div className="info-item flex items-start space-x-4">
                  <div className="w-12 h-12 bg-[#ff6f00] rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-[#004d40] mb-1">Guest Sessions</h3>
                    <p className="text-gray-600">£12 per session for new players</p>
                    <p className="text-sm text-gray-500 mt-1">
                      Try before you commit - perfect for assessing fit
                    </p>
                  </div>
                </div>
              </div>

              {/* Session Times Card */}
              <Card className="contact-card border-0 shadow-lg bg-gradient-to-r from-[#004d40] to-[#00695c] text-white">
                <CardContent className="p-6">
                  <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Session Times
                  </h3>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Tuesday Sessions</div>
                        <div className="text-sm opacity-75">Watford Central Leisure Centre</div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">8:00 PM - 10:00 PM</div>
                        <div className="text-sm opacity-75">2 Courts</div>
                      </div>
                    </div>
                    <div className="border-t border-white/20 pt-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="font-medium">Thursday Sessions</div>
                          <div className="text-sm opacity-75">Fuller Health Life Centre</div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">8:00 PM - 10:00 PM</div>
                          <div className="text-sm opacity-75">4 Courts</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Achievement Card */}
              <Card className="contact-card border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-[#ff6f00] rounded-full flex items-center justify-center">
                      <Trophy className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-semibold text-[#004d40]">Recent Achievement</h3>
                  </div>
                  <p className="text-gray-600">
                    <strong>Hillingdon Division Three Runners-up</strong> - 2024-2025 season
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Join our competitive team and be part of our continued success!
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form */}
            <div>
              <Card className="contact-card border-0 shadow-xl">
                <CardContent className="p-8">
                  <h2 className="text-2xl font-bold text-[#004d40] mb-6">Send us a Message</h2>
                  
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Send className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold text-[#004d40] mb-2">Message Sent!</h3>
                      <p className="text-gray-600 mb-4">
                        Thank you for your message. We'll get back to you soon.
                      </p>
                      <Button 
                        onClick={() => setIsSubmitted(false)}
                        variant="outline"
                        className="border-[#004d40] text-[#004d40] hover:bg-[#004d40] hover:text-white"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="name" className="text-[#004d40] font-semibold">Name *</Label>
                          <Input
                            id="name"
                            value={formData.name}
                            onChange={(e) => updateFormData('name', e.target.value)}
                            className="mt-1"
                            placeholder="Your name"
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="email" className="text-[#004d40] font-semibold">Email *</Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => updateFormData('email', e.target.value)}
                            className="mt-1"
                            placeholder="your.email@example.com"
                            required
                          />
                        </div>
                      </div>

                      <div>
                        <Label htmlFor="subject" className="text-[#004d40] font-semibold">Subject *</Label>
                        <Input
                          id="subject"
                          value={formData.subject}
                          onChange={(e) => updateFormData('subject', e.target.value)}
                          className="mt-1"
                          placeholder="What's your inquiry about?"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="message" className="text-[#004d40] font-semibold">Message *</Label>
                        <Textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => updateFormData('message', e.target.value)}
                          className="mt-1 min-h-[120px]"
                          placeholder="Tell us about your badminton experience, questions about joining, or any other inquiries..."
                          required
                        />
                      </div>

                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#ff6f00] hover:bg-[#e65100] text-white font-semibold py-3"
                      >
                        {isSubmitting ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            Sending Message...
                          </>
                        ) : (
                          <>
                            <Send className="w-4 h-4 mr-2" />
                            Send Message
                          </>
                        )}
                      </Button>

                      <p className="text-sm text-gray-500 text-center">
                        We'll respond to your message within 24 hours during weekdays.
                      </p>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}