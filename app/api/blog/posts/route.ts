import { getAllPosts } from '@/lib/blog'

export async function GET() {
  try {
    const posts = getAllPosts()
    return Response.json(posts)
  } catch (error) {
    console.error('Failed to fetch posts:', error)
    return Response.json({ error: 'Failed to fetch posts' }, { status: 500 })
  }
}
