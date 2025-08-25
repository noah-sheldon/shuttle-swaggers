'use client';

import { useState, useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
// import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Check, Loader2, MapPin, Clock, Calendar } from 'lucide-react';

interface SessionData {
  _id: string;
  date: Date;
  location: 'Watford Central' | 'Fuller Health Life Centre';
  courts: number;
}

interface GuestSignupFormProps {
  session: SessionData;
  onBack: () => void;
  onComplete: () => void;
}

interface FormData {
  name: string;
  email: string;
  mobile: string;
  feather_experience: 'No Experience' | 'Some Experience' | 'Play Regularly';
  league_experience: boolean;
  league_name: string;
  player_level: 'Beginner' | 'Intermediate' | 'Advanced' | 'High Intermediate';
  fitness_level: number;
}

export function GuestSignupForm({ session, onBack, onComplete }: GuestSignupFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    mobile: '',
    feather_experience: 'No Experience',
    league_experience: false,
    league_name: '',
    player_level: 'Intermediate',
    fitness_level: 3
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo('.form-step', 
        { opacity: 0, x: 50 },
        { opacity: 1, x: 0, duration: 0.5, ease: 'power3.out' }
      );
    }, formRef);

    return () => ctx.revert();
  }, [currentStep]);

  const updateFormData = (field: keyof FormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        return !!(formData.name && formData.email && formData.mobile);
      case 2:
        return !!(formData.feather_experience && formData.player_level);
      case 3:
        return true;
      default:
        return false;
    }
  };

  const nextStep = () => {
    if (validateStep(currentStep) && currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(3)) return;

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/guest-signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          session_id: session._id
        }),
      });

      if (response.ok) {
        setIsComplete(true);
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('There was an error submitting your form. Please try again.');
    } finally {
      setIsSubmitting(false);
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

  if (isComplete) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <Card className="max-w-md w-full border-0 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <Check className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#004d40] mb-4">Thank You!</h2>
            <p className="text-gray-600 mb-6">
              Your sign-up has been submitted successfully. We'll be in touch shortly to confirm your spot.
            </p>
            <div className="text-sm text-gray-500">
              Redirecting in a moment...
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={onBack}
              className="mb-4 text-[#004d40] hover:text-[#ff6f00]"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Sessions
            </Button>
            <h1 className="text-3xl font-bold text-[#004d40] mb-2">Join Our Session</h1>
            <p className="text-gray-600">Complete your guest sign-up in 3 simple steps</p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between mb-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                    step <= currentStep
                      ? 'bg-[#ff6f00] text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            {/* <Progress value={(currentStep / 3) * 100} className="h-2" /> */}
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-[#ff6f00] h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Personal Details</span>
              <span>Skill Assessment</span>
              <span>Confirmation</span>
            </div>
          </div>

          {/* Session Details Card */}
          <Card className="mb-6 border-0 shadow-lg bg-gradient-to-r from-[#004d40] to-[#00695c] text-white">
            <CardContent className="p-6">
              <h3 className="font-semibold mb-3">Session Details</h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 opacity-75" />
                  <span>{formatDate(session.date)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 opacity-75" />
                  <span>{formatTime(session.date)} - {formatTime(new Date(new Date(session.date).getTime() + 2 * 60 * 60 * 1000))}</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 opacity-75" />
                  <span>{session.location}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Steps */}
          <Card ref={formRef} className="border-0 shadow-xl">
            <CardHeader>
              <CardTitle className="text-[#004d40]">
                {currentStep === 1 && 'Personal Details'}
                {currentStep === 2 && 'Skill Assessment'}
                {currentStep === 3 && 'Confirm Your Details'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8">
              <div className="form-step">
                {/* Step 1: Personal Details */}
                {currentStep === 1 && (
                  <div className="space-y-6">
                    <div>
                      <Label htmlFor="name" className="text-[#004d40] font-semibold">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        className="mt-2"
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div>
                      <Label htmlFor="email" className="text-[#004d40] font-semibold">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        className="mt-2"
                        placeholder="Enter your email address"
                      />
                    </div>
                    <div>
                      <Label htmlFor="mobile" className="text-[#004d40] font-semibold">Mobile Number *</Label>
                      <Input
                        id="mobile"
                        value={formData.mobile}
                        onChange={(e) => updateFormData('mobile', e.target.value)}
                        className="mt-2"
                        placeholder="Enter your mobile number"
                      />
                    </div>
                  </div>
                )}

                {/* Step 2: Skill Assessment */}
                {currentStep === 2 && (
                  <div className="space-y-8">
                    <div>
                      <Label className="text-[#004d40] font-semibold block mb-4">
                        What is your experience with feather shuttlecocks? *
                      </Label>
                      <RadioGroup
                        value={formData.feather_experience}
                        onValueChange={(value) => updateFormData('feather_experience', value)}
                        className="space-y-3"
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="No Experience" id="no-exp" />
                          <Label htmlFor="no-exp">No Experience</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Some Experience" id="some-exp" />
                          <Label htmlFor="some-exp">Some Experience</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Play Regularly" id="play-reg" />
                          <Label htmlFor="play-reg">Play Regularly</Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <Label htmlFor="league" className="text-[#004d40] font-semibold">
                          Have you played in any leagues?
                        </Label>
                        <Switch
                          id="league"
                          checked={formData.league_experience}
                          onCheckedChange={(checked) => updateFormData('league_experience', checked)}
                        />
                      </div>
                      {formData.league_experience && (
                        <Input
                          value={formData.league_name}
                          onChange={(e) => updateFormData('league_name', e.target.value)}
                          placeholder="Which league(s)?"
                          className="mt-2"
                        />
                      )}
                    </div>

                    <div>
                      <Label className="text-[#004d40] font-semibold block mb-4">
                        What is your player level? *
                      </Label>
                      <Select 
                        value={formData.player_level} 
                        onValueChange={(value) => updateFormData('player_level', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select your level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Beginner">Beginner</SelectItem>
                          <SelectItem value="Intermediate">Intermediate</SelectItem>
                          <SelectItem value="High Intermediate">High Intermediate</SelectItem>
                          <SelectItem value="Advanced">Advanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-[#004d40] font-semibold block mb-4">
                        Fitness Level: {formData.fitness_level}/5
                      </Label>
                      <Slider
                        value={[formData.fitness_level]}
                        onValueChange={(value) => updateFormData('fitness_level', value[0])}
                        max={5}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Basic</span>
                        <span>Excellent</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Confirmation */}
                {currentStep === 3 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-semibold text-[#004d40] mb-4">
                      Please confirm your details:
                    </h3>
                    
                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="font-medium">Name:</span>
                          <p>{formData.name}</p>
                        </div>
                        <div>
                          <span className="font-medium">Email:</span>
                          <p>{formData.email}</p>
                        </div>
                        <div>
                          <span className="font-medium">Mobile:</span>
                          <p>{formData.mobile}</p>
                        </div>
                        <div>
                          <span className="font-medium">Player Level:</span>
                          <p>{formData.player_level}</p>
                        </div>
                        <div>
                          <span className="font-medium">Feather Experience:</span>
                          <p>{formData.feather_experience}</p>
                        </div>
                        <div>
                          <span className="font-medium">Fitness Level:</span>
                          <p>{formData.fitness_level}/5</p>
                        </div>
                      </div>
                      
                      {formData.league_experience && (
                        <div>
                          <span className="font-medium">League Experience:</span>
                          <p>{formData.league_name}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-[#ff6f00]/10 border border-[#ff6f00]/20 p-4 rounded-lg">
                      <p className="text-sm text-[#004d40]">
                        <strong>Next steps:</strong> After submitting this form, a club administrator 
                        will contact you at {formData.mobile} to confirm your spot and provide 
                        any additional details needed for the session.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <Button
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="border-[#004d40] text-[#004d40] hover:bg-[#004d40] hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>

                {currentStep < 3 ? (
                  <Button
                    onClick={nextStep}
                    disabled={!validateStep(currentStep)}
                    className="bg-[#ff6f00] hover:bg-[#e65100] text-white"
                  >
                    Next
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !validateStep(3)}
                    className="bg-[#ff6f00] hover:bg-[#e65100] text-white"
                  >
                    {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                    {isSubmitting ? 'Submitting...' : 'Confirm & Submit'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}