'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PostForm } from '@/features/posts/components/PostForm'
import { usePostStore } from '@/features/posts/store/post.store'
import { PostFormData } from '@/features/posts/validators/post.schema'

export default function CreatePostPage() {
  const router = useRouter()
  const createPost = usePostStore((state) => state.createPost)

  async function handleSubmit(data: PostFormData) {
    try {
      // Store creates the draft, logs the creation, and persists it.
      const post = await createPost(data)
      toast.success('Post successfully created')
      router.push(`/posts/${post.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to create post.')
    }
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href="/posts"
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to posts
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">Create post</h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">New posts start as drafts.</p>
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <PostForm mode="create" onSubmit={handleSubmit} />
      </section>
    </main>
  )
}
