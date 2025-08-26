import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Calendar, User, Clock, Share2, BookOpen } from 'lucide-react'
import { getBlogPost, getBlogPosts, type BlogPost } from '@/lib/data/blog-posts'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export async function generateStaticParams() {
  const posts = await getBlogPosts()
  return posts.map((post) => ({
    slug: post.slug
  }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)
  
  if (!post) {
    return {
      title: 'Blog Post Not Found | Shuttle Swaggers Badminton Club',
    }
  }

  return {
    title: `${post.title} | Shuttle Swaggers Blog`,
    description: post.description,
    keywords: post.keywords,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.description,
      type: 'article',
      publishedTime: post.date,
      authors: [post.author],
    },
  }
}

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'Local SEO': return 'bg-blue-100 text-blue-800'
    case 'Beginner Guide': return 'bg-green-100 text-green-800'
    case 'Technical Training': return 'bg-orange-100 text-orange-800'
    case 'Club News': return 'bg-purple-100 text-purple-800'
    case 'Health & Fitness': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const resolvedParams = await params
  const post = await getBlogPost(resolvedParams.slug)
  
  if (!post) {
    notFound()
  }

  const relatedPosts = await getBlogPosts(post.category, 3)
  const otherPosts = relatedPosts.filter(p => p.slug !== post.slug)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Back Button */}
        <div className="mb-8">
          <Link href="/blogs">
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </div>

        {/* Article Header */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Badge className={getCategoryColor(post.category)}>
              {post.category}
            </Badge>
            <div className="flex items-center text-sm text-gray-500">
              <Clock className="h-4 w-4 mr-1" />
              {post.readTime}
            </div>
          </div>
          
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>
          
          <p className="text-xl text-gray-600 mb-6">
            {post.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center">
                <User className="h-4 w-4 mr-1" />
                {post.author}
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(post.date).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </div>
            </div>
            
            <Button variant="outline" size="sm">
              <Share2 className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </header>

        <Separator className="mb-8" />

        {/* Article Content */}
        <article className="prose prose-lg prose-gray max-w-none mb-12">
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
        </article>

        {/* Author Bio */}
        <Card className="mb-12 p-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center text-white font-semibold text-lg">
              {post.author.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-1">{post.author}</h3>
              <p className="text-gray-600">{post.authorBio}</p>
            </div>
          </div>
        </Card>

        {/* Related Posts */}
        {otherPosts.length > 0 && (
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <BookOpen className="h-6 w-6 mr-2" />
              Related Articles
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherPosts.map((relatedPost) => (
                <Card key={relatedPost.slug} className="overflow-hidden hover:shadow-lg transition-shadow duration-200">
                  <CardContent className="p-4">
                    <Badge className={`${getCategoryColor(relatedPost.category)} mb-2`}>
                      {relatedPost.category}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2 hover:text-blue-600 transition-colors">
                      <Link href={`/blogs/${relatedPost.slug}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                      {relatedPost.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{relatedPost.author}</span>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {relatedPost.readTime}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Newsletter Signup */}
        <section className="mt-16 bg-gradient-to-r from-blue-600 to-green-600 rounded-2xl p-8 text-white text-center">
          <h3 className="text-2xl font-bold mb-4">Enjoyed this article?</h3>
          <p className="mb-6 opacity-90">
            Subscribe to get more badminton tips and training guides delivered to your inbox
          </p>
          <Link href="/contact">
            <Button variant="secondary">
              Subscribe to Newsletter
            </Button>
          </Link>
        </section>
      </div>
    </div>
  )
}