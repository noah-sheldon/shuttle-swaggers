import { NextRequest, NextResponse } from 'next/server'
import { getBlogPosts } from '@/lib/data/blog-posts'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const limit = searchParams.get('limit')
    const featured = searchParams.get('featured')

    let posts
    
    if (featured === 'true') {
      const { getFeaturedPosts } = await import('@/lib/data/blog-posts')
      posts = await getFeaturedPosts()
    } else {
      posts = await getBlogPosts(
        category || undefined,
        limit ? parseInt(limit) : undefined
      )
    }

    return NextResponse.json({
      success: true,
      data: posts,
      total: posts.length
    })
  } catch (error) {
    console.error('Error fetching blog posts:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch blog posts' },
      { status: 500 }
    )
  }
}