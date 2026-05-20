'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import { PostForm } from '@/features/posts/components/PostForm'
import { usePostStore } from '@/features/posts/store/post.store'
import { isReadOnlyStatus } from '@/features/posts/utils/post-rules'
import { PostFormData } from '@/features/posts/validators/post.schema'

export default function EditPostPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const { loadPostsFromStorage, getPostById, updatePost } = usePostStore()

  useEffect(() => {
    // Load the latest persisted posts before looking up the route id.
    loadPostsFromStorage()
  }, [loadPostsFromStorage])

  const post = params?.id ? getPostById(params.id) : undefined

  async function handleSubmit(data: PostFormData) {
    if (!post) return

    try {
      await updatePost(post.id, data)
      toast.success('Post successfully updated')
      router.push(`/posts/${post.id}`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update post.')
    }
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          Post not found.
        </div>
      </main>
    )
  }

  // Published and in-review posts stay visible but cannot be edited.
  const disabled = isReadOnlyStatus(post.status)

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <div>
        <Link
          href={`/posts/${post.id}`}
          className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to post
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-50">Edit post</h1>
        {disabled ? (
          <p className="mt-1 text-sm text-amber-700 dark:text-amber-500">
            This post is read-only while it is {post.status}.
          </p>
        ) : (
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Update post content and metadata.</p>
        )}
      </div>

      <section className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950">
        <PostForm
          mode="edit"
          initialValues={post}
          onSubmit={handleSubmit}
          disabled={disabled}
        />
      </section>
    </main>
  )
}
