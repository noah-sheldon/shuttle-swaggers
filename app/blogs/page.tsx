import { Metadata } from 'next'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, Calendar, User, Clock } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Badminton Blog | Shuttle Swaggers - Best Badminton Club in Watford & West London',
  description: 'Expert badminton tips, training guides, and local badminton news from Watford\'s premier badminton club. Serving North West London, West London, and North London.',
  keywords: 'badminton blog, badminton training, Watford badminton, West London badminton, North London badminton, badminton tips, badminton techniques'
}

interface BlogPost {
  slug: string
  title: string
  description: string
  category: 'Local SEO' | 'Beginner Guide' | 'Technical Training' | 'Club News' | 'Health & Fitness'
  author: string
  date: string
  readTime: string
  featured: boolean
}

const blogPosts: BlogPost[] = [
  {
    slug: 'best-badminton-courts-watford-west-london',
    title: 'Best Badminton Courts in Watford and West London',
    description: 'Discover the top badminton facilities in Watford, North West London, and surrounding areas. Complete guide to courts, booking, and amenities.',
    category: 'Local SEO',
    author: 'Shuttle Swaggers Team',
    date: '2024-08-20',
    readTime: '8 min read',
    featured: true
  },
  {
    slug: 'complete-beginner-guide-badminton',
    title: 'Complete Beginner\'s Guide to Badminton',
    description: 'Everything you need to know to start playing badminton. From basic rules to essential equipment and your first shots.',
    category: 'Beginner Guide',
    author: 'Coach Sarah Mitchell',
    date: '2024-08-18',
    readTime: '12 min read',
    featured: true
  },
  {
    slug: '10-essential-badminton-techniques',
    title: '10 Essential Badminton Techniques Every Player Should Master',
    description: 'Master these fundamental badminton techniques to improve your game dramatically. From grip to footwork.',
    category: 'Technical Training',
    author: 'Head Coach James Wilson',
    date: '2024-08-15',
    readTime: '10 min read',
    featured: true
  },
  {
    slug: 'badminton-training-programs-near-me-watford',
    title: 'Badminton Training Programs Near Me - Watford & North West London',
    description: 'Find the best badminton coaching and training programs in Watford and North West London. All skill levels welcome.',
    category: 'Local SEO',
    author: 'Shuttle Swaggers Team',
    date: '2024-08-12',
    readTime: '6 min read',
    featured: false
  },
  {
    slug: 'badminton-equipment-guide-racket-buying',
    title: 'Badminton Equipment Guide: What Racket Should You Buy?',
    description: 'Complete guide to choosing your first badminton racket. Weight, balance, string tension, and budget considerations.',
    category: 'Beginner Guide',
    author: 'Equipment Specialist Tom Davies',
    date: '2024-08-10',
    readTime: '9 min read',
    featured: false
  },
  {
    slug: 'common-badminton-mistakes-how-to-fix',
    title: 'Common Badminton Mistakes and How to Fix Them',
    description: 'Avoid these common badminton errors that hold players back. Simple fixes to improve your game immediately.',
    category: 'Beginner Guide',
    author: 'Coach Sarah Mitchell',
    date: '2024-08-08',
    readTime: '7 min read',
    featured: false
  },
  {
    slug: 'badminton-footwork-drills-court-movement',
    title: 'Badminton Footwork Drills for Better Court Movement',
    description: 'Essential footwork patterns and drills to improve your court coverage and reaction time in badminton.',
    category: 'Technical Training',
    author: 'Movement Coach Alex Chen',
    date: '2024-08-05',
    readTime: '11 min read',
    featured: false
  },
  {
    slug: 'singles-vs-doubles-strategy-guide',
    title: 'Singles vs Doubles Strategy Guide',
    description: 'Master the tactical differences between singles and doubles badminton. Positioning, shot selection, and teamwork.',
    category: 'Technical Training',
    author: 'Strategy Coach Maria Rodriguez',
    date: '2024-08-03',
    readTime: '13 min read',
    featured: false
  },
  {
    slug: 'health-benefits-playing-badminton',
    title: 'Health Benefits of Playing Badminton',
    description: 'Discover how badminton improves cardiovascular health, builds muscle, and enhances mental wellbeing.',
    category: 'Health & Fitness',
    author: 'Sports Physiologist Dr. Helen Park',
    date: '2024-08-01',
    readTime: '8 min read',
    featured: false
  },
  {
    slug: 'badminton-injury-prevention-tips',
    title: 'Badminton Injury Prevention Tips',
    description: 'Prevent common badminton injuries with proper warm-up, technique, and recovery strategies.',
    category: 'Health & Fitness',
    author: 'Sports Physiologist Dr. Helen Park',
    date: '2024-07-30',
    readTime: '9 min read',
    featured: false
  },
  {
    slug: 'best-warm-up-exercises-badminton',
    title: 'Best Warm-up Exercises for Badminton',
    description: 'Complete pre-game warm-up routine to prepare your body for badminton and reduce injury risk.',
    category: 'Health & Fitness',
    author: 'Fitness Coach David Thompson',
    date: '2024-07-28',
    readTime: '6 min read',
    featured: false
  },
  {
    slug: 'watford-badminton-tournament-results-august-2024',
    title: 'Watford Badminton Tournament Results - August 2024',
    description: 'Results and highlights from our latest tournament featuring players from across North West London.',
    category: 'Club News',
    author: 'Tournament Director Lisa Wong',
    date: '2024-07-25',
    readTime: '5 min read',
    featured: false
  }
]

const categories = ['All', 'Local SEO', 'Beginner Guide', 'Technical Training', 'Club News', 'Health & Fitness']

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Local SEO': return 'bg-blue-100 text-blue-800 hover:bg-blue-200'
    case 'Beginner Guide': return 'bg-green-100 text-green-800 hover:bg-green-200'
    case 'Technical Training': return 'bg-orange-100 text-orange-800 hover:bg-orange-200'
    case 'Club News': return 'bg-purple-100 text-purple-800 hover:bg-purple-200'
    case 'Health & Fitness': return 'bg-red-100 text-red-800 hover:bg-red-200'
    default: return 'bg-gray-100 text-gray-800 hover:bg-gray-200'
  }
}

export default function BlogsPage() {
  const featuredPosts = blogPosts.filter(post => post.featured)
  const regularPosts = blogPosts.filter(post => !post.featured)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Badminton Blog
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Expert tips, training guides, and local badminton news from Watford's premier badminton club serving North West London, West London, and North London
          </p>
          
          {/* Search Bar */}
          <div className="max-w-md mx-auto relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="search"
              placeholder="Search articles..."
              className="pl-10 pr-4 py-2 w-full"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={category === 'All' ? 'default' : 'outline'}
              className="mb-2"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Featured Posts */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Featured Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredPosts.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                    <Link href={`/blogs/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* All Posts */}
        <section>
          <h2 className="text-3xl font-bold text-gray-900 mb-8">All Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Card key={post.slug} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <Badge className={getCategoryColor(post.category)}>
                      {post.category}
                    </Badge>
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-4 w-4 mr-1" />
                      {post.readTime}
                    </div>
                  </div>
                  <CardTitle className="text-xl hover:text-blue-600 transition-colors">
                    <Link href={`/blogs/${post.slug}`}>
                      {post.title}
                    </Link>
                  </CardTitle>
                  <CardDescription className="line-clamp-3">
                    {post.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {post.author}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(post.date).toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Stay Updated</h3>
          <p className="mb-6 opacity-90">
            Get the latest badminton tips, training guides, and club news delivered to your inbox
          </p>
          <div className="max-w-md mx-auto flex gap-2">
            <Input
              type="email"
              placeholder="Enter your email"
              className="bg-white text-gray-900"
            />
            <Button variant="secondary">Subscribe</Button>
          </div>
        </section>
      </div>
    </div>
  )
}