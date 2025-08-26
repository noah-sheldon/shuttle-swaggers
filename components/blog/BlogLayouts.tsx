import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, AlertTriangle, Info, Target, Trophy, Heart, MapPin, Users, Calendar, Clock } from 'lucide-react'

interface BlogLayoutProps {
  content: string
  category: string
  title: string
  author: string
  readTime: string
  date: string
}

// Enhanced content parser that creates interactive elements
const parseContent = (content: string, category: string) => {
  // Convert HTML to React elements with enhanced styling based on category
  const parser = new DOMParser()
  const doc = parser.parseFromString(content, 'text/html')
  
  return content // For now, we'll enhance this with specific parsing logic
}

// Local SEO Layout with map integration and location highlights
export const LocalSEOLayout: React.FC<BlogLayoutProps> = ({ content, title, author, readTime, date }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Hero Section with Location Context */}
      <div className="relative bg-gradient-to-r from-blue-600 via-blue-700 to-green-600 rounded-2xl p-8 mb-8 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-6 w-6" />
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
              Local Guide
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 leading-tight">{title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-white/90">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{author}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{readTime}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{new Date(date).toLocaleDateString('en-GB')}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Quick Facts */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card className="border-blue-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Coverage Area
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">5+ Miles</p>
            <p className="text-sm text-gray-600">Watford & surrounding areas</p>
          </CardContent>
        </Card>
        
        <Card className="border-green-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Venues Listed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">8+</p>
            <p className="text-sm text-gray-600">Premium badminton facilities</p>
          </CardContent>
        </Card>
        
        <Card className="border-orange-200">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Community
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-gray-900">200+</p>
            <p className="text-sm text-gray-600">Active local players</p>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Content */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div 
            className="prose prose-lg prose-gray max-w-none
              prose-headings:text-gray-900 prose-headings:font-bold
              prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:pb-2 prose-h2:border-b prose-h2:border-blue-100
              prose-h3:text-xl prose-h3:mt-6 prose-h3:mb-3 prose-h3:text-blue-700
              prose-p:mb-4 prose-p:leading-relaxed
              prose-ul:mb-4 prose-li:mb-2
              prose-strong:text-blue-600 prose-strong:font-semibold"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </CardContent>
      </Card>

      {/* Call to Action */}
      <Alert className="border-blue-200 bg-blue-50">
        <Info className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-800">
          <strong>Ready to play?</strong> Join Shuttle Swaggers and get access to the best badminton facilities in Watford and North West London.
        </AlertDescription>
      </Alert>
    </div>
  )
}

// Beginner Guide Layout with progress tracking and interactive elements
export const BeginnerGuideLayout: React.FC<BlogLayoutProps> = ({ content, title, author, readTime, date }) => {
  const skillAreas = [
    { name: 'Basic Rules', progress: 90 },
    { name: 'Equipment Knowledge', progress: 75 },
    { name: 'Basic Techniques', progress: 60 },
    { name: 'Court Movement', progress: 45 }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Beginner-Friendly Hero */}
      <div className="bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="h-6 w-6" />
          <Badge variant="secondary" className="bg-white/20 text-white">
            Beginner Friendly
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-white/90 mb-6">
          Step-by-step guidance to get you started on your badminton journey
        </p>
        <div className="flex flex-wrap gap-4 text-sm text-white/80">
          <span>👨‍🏫 {author}</span>
          <span>⏱️ {readTime}</span>
          <span>📅 {new Date(date).toLocaleDateString('en-GB')}</span>
        </div>
      </div>

      {/* Learning Progress Tracker */}
      <Card className="mb-8 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-700 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Learning Journey
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {skillAreas.map((skill, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">{skill.name}</span>
                <span className="text-gray-600">{skill.progress}%</span>
              </div>
              <Progress value={skill.progress} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Tabbed Content for Better Organization */}
      <Tabs defaultValue="content" className="mb-8">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="content">📚 Guide</TabsTrigger>
          <TabsTrigger value="checklist">✅ Checklist</TabsTrigger>
          <TabsTrigger value="tips">💡 Quick Tips</TabsTrigger>
        </TabsList>
        
        <TabsContent value="content" className="mt-6">
          <Card>
            <CardContent className="p-8">
              <div 
                className="prose prose-lg max-w-none
                  prose-headings:text-green-700 prose-headings:font-bold
                  prose-h2:text-2xl prose-h2:flex prose-h2:items-center prose-h2:gap-2
                  prose-ul:space-y-2 prose-li:pl-2
                  prose-strong:text-green-600 prose-strong:bg-green-50 prose-strong:px-1 prose-strong:rounded"
                dangerouslySetInnerHTML={{ __html: content }} 
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="checklist" className="mt-6">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Get proper badminton shoes</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Learn basic grip technique</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <span>Practice basic serves</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="h-5 w-5 rounded-full border-2 border-gray-300" />
                  <span>Join a beginner-friendly club</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="tips" className="mt-6">
          <div className="grid md:grid-cols-2 gap-4">
            <Alert className="border-yellow-200 bg-yellow-50">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800">
                <strong>Remember:</strong> Start slow and focus on technique before power
              </AlertDescription>
            </Alert>
            <Alert className="border-blue-200 bg-blue-50">
              <Info className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Pro Tip:</strong> Watch your opponent, not just the shuttlecock
              </AlertDescription>
            </Alert>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Technical Training Layout with interactive drills and video placeholders
export const TechnicalTrainingLayout: React.FC<BlogLayoutProps> = ({ content, title, author, readTime, date }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* Technical Hero */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -mr-20 -mt-20"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-6 w-6" />
            <Badge variant="secondary" className="bg-white/20 text-white">
              Technical Training
            </Badge>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
          <p className="text-lg text-white/90 mb-6">
            Master advanced techniques with professional guidance
          </p>
        </div>
      </div>

      {/* Difficulty & Skills Meter */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        <Card className="border-orange-200">
          <CardHeader>
            <CardTitle className="text-orange-700 flex items-center gap-2">
              <Target className="h-5 w-5" />
              Skill Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm">Difficulty</span>
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  Intermediate
                </Badge>
              </div>
              <Progress value={75} className="h-3" />
              <p className="text-sm text-gray-600">
                Requires basic badminton knowledge
              </p>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-700 flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Practice Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="text-2xl font-bold text-red-600">2-4 weeks</div>
              <p className="text-sm text-gray-600">
                With regular practice sessions
              </p>
              <div className="text-xs text-gray-500">
                15-30 minutes daily recommended
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Interactive Content with Video Placeholders */}
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-orange-700">📹 Video Tutorial</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="aspect-video bg-gradient-to-br from-orange-100 to-red-100 rounded-lg flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z"/>
                  </svg>
                </div>
                <p className="text-orange-700 font-medium">Interactive Video Tutorial</p>
                <p className="text-sm text-gray-600">Step-by-step technique breakdown</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-8">
            <div 
              className="prose prose-lg max-w-none
                prose-headings:text-orange-700 prose-headings:font-bold
                prose-h2:text-2xl prose-h2:border-b prose-h2:border-orange-200 prose-h2:pb-2
                prose-h3:text-lg prose-h3:text-red-600
                prose-strong:text-orange-600 prose-strong:font-semibold
                prose-ul:space-y-1 prose-ol:space-y-2"
              dangerouslySetInnerHTML={{ __html: content }} 
            />
          </CardContent>
        </Card>

        {/* Practice Reminder */}
        <Alert className="border-orange-200 bg-orange-50">
          <Target className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Practice Tip:</strong> Master each technique slowly before increasing speed. Quality over quantity!
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

// Health & Fitness Layout with progress tracking and health metrics
export const HealthFitnessLayout: React.FC<BlogLayoutProps> = ({ content, title, author, readTime, date }) => {
  const healthMetrics = [
    { label: 'Calories Burned', value: '400-600', unit: 'per hour', color: 'text-red-600' },
    { label: 'Heart Rate', value: '140-160', unit: 'BPM average', color: 'text-pink-600' },
    { label: 'Muscles Used', value: '15+', unit: 'major groups', color: 'text-purple-600' }
  ]

  return (
    <div className="max-w-4xl mx-auto">
      {/* Health-focused Hero */}
      <div className="bg-gradient-to-r from-pink-500 via-red-500 to-pink-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Heart className="h-6 w-6" />
          <Badge variant="secondary" className="bg-white/20 text-white">
            Health & Fitness
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <p className="text-lg text-white/90">
          Discover how badminton transforms your physical and mental wellbeing
        </p>
      </div>

      {/* Health Metrics Cards */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {healthMetrics.map((metric, index) => (
          <Card key={index} className="border-pink-200">
            <CardContent className="p-6 text-center">
              <div className={`text-3xl font-bold ${metric.color} mb-2`}>
                {metric.value}
              </div>
              <div className="text-sm font-medium text-gray-700 mb-1">
                {metric.label}
              </div>
              <div className="text-xs text-gray-500">
                {metric.unit}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content with Health Focus */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:text-pink-700 prose-headings:font-bold
              prose-h2:text-2xl prose-h2:flex prose-h2:items-center prose-h2:gap-2
              prose-h3:text-red-600
              prose-strong:text-pink-600 prose-strong:bg-pink-50 prose-strong:px-1 prose-strong:rounded
              prose-ul:space-y-2"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </CardContent>
      </Card>

      {/* Health Benefits Summary */}
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        <Alert className="border-green-200 bg-green-50">
          <Heart className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Physical Benefits:</strong> Improved cardiovascular health, muscle strength, and coordination
          </AlertDescription>
        </Alert>
        <Alert className="border-blue-200 bg-blue-50">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Mental Benefits:</strong> Reduced stress, better focus, and enhanced mood
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}

// Club News Layout with event styling and social elements
export const ClubNewsLayout: React.FC<BlogLayoutProps> = ({ content, title, author, readTime, date }) => {
  return (
    <div className="max-w-4xl mx-auto">
      {/* News Hero */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-8 mb-8 text-white">
        <div className="flex items-center gap-2 mb-4">
          <Trophy className="h-6 w-6" />
          <Badge variant="secondary" className="bg-white/20 text-white">
            Club News
          </Badge>
        </div>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">{title}</h1>
        <div className="flex items-center gap-4 text-white/90">
          <span>🏆 Tournament Results</span>
          <span>📅 {new Date(date).toLocaleDateString('en-GB')}</span>
        </div>
      </div>

      {/* Tournament Stats */}
      <div className="grid md:grid-cols-4 gap-4 mb-8">
        <Card className="border-purple-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-purple-600">48</div>
            <div className="text-sm text-gray-600">Participants</div>
          </CardContent>
        </Card>
        <Card className="border-blue-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-blue-600">78</div>
            <div className="text-sm text-gray-600">Matches</div>
          </CardContent>
        </Card>
        <Card className="border-green-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-green-600">5</div>
            <div className="text-sm text-gray-600">Categories</div>
          </CardContent>
        </Card>
        <Card className="border-orange-200 text-center">
          <CardContent className="p-4">
            <div className="text-2xl font-bold text-orange-600">£500</div>
            <div className="text-sm text-gray-600">Prize Pool</div>
          </CardContent>
        </Card>
      </div>

      {/* News Content */}
      <Card>
        <CardContent className="p-8">
          <div 
            className="prose prose-lg max-w-none
              prose-headings:text-purple-700 prose-headings:font-bold
              prose-h2:text-2xl prose-h2:border-b prose-h2:border-purple-200 prose-h2:pb-2
              prose-h3:text-blue-600 prose-h3:flex prose-h3:items-center prose-h3:gap-2
              prose-strong:text-purple-600 prose-strong:font-semibold
              prose-ul:bg-gray-50 prose-ul:p-4 prose-ul:rounded-lg prose-ul:space-y-1"
            dangerouslySetInnerHTML={{ __html: content }} 
          />
        </CardContent>
      </Card>
    </div>
  )
}