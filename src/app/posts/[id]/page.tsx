'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import dayjs from 'dayjs'
import { ArrowLeft, Eye, Layout } from 'lucide-react'
import { toast } from 'sonner'
import { ActivityLogList } from '@/features/posts/components/ActivityLogList'
import { PostStatusBadge } from '@/features/posts/components/PostStatusBadge'
import { usePostStore } from '@/features/posts/store/post.store'
import { MediaType, PostStatus } from '@/features/posts/types/post.types'
import { PromptDialog } from '@/components/shared/PromptDialog'
import { getEmbeddableVideoUrl } from '@/features/posts/utils/media.utils'

export default function PostDetailPage() {
  const params = useParams<{ id: string }>()
  const { loadPostsFromStorage, getPostById, changeStatus, loading, error } = usePostStore()

  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
  const [viewMode, setViewMode] = useState<'admin' | 'preview'>('admin')

  useEffect(() => {
    // Detail pages read from the same localStorage-backed store as the listing.
    loadPostsFromStorage()
  }, [loadPostsFromStorage])

  const post = params?.id ? getPostById(params.id) : undefined

  async function handleStatusChange(nextStatus: PostStatus, reason?: string) {
    if (!post) return

    try {
      await changeStatus(post.id, nextStatus, reason)
      toast.success(`Post status changed to ${nextStatus}`)
      setIsRejectDialogOpen(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update status.')
    }
  }

  if (!post) {
    return (
      <main className="mx-auto max-w-4xl p-6">
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          Post not found.
        </div>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5 dark:border-slate-800/80">
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href="/posts"
            className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-950 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-100 shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to posts
          </Link>

          {/* Segmented View Mode Toggle */}
          <div className="inline-flex rounded-lg bg-slate-100 p-0.5 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('admin')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                viewMode === 'admin'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Layout className="h-3.5 w-3.5" />
              Admin View
            </button>
            <button
              type="button"
              onClick={() => setViewMode('preview')}
              className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
                viewMode === 'preview'
                  ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-800 dark:text-slate-50'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <Eye className="h-3.5 w-3.5" />
              Reader Preview
            </button>
          </div>
        </div>

        {viewMode === 'admin' ? (
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <Link
              href={`/posts/${post.id}/edit`}
              className="rounded-md border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-900 shadow-sm"
            >
              Edit
            </Link>

            {post.status === PostStatus.DRAFT ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStatusChange(PostStatus.IN_REVIEW)}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-300 shadow-sm"
              >
                Submit for review
              </button>
            ) : null}

            {post.status === PostStatus.IN_REVIEW ? (
              <>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => handleStatusChange(PostStatus.PUBLISHED)}
                  className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:opacity-60 shadow-sm"
                >
                  Publish
                </button>
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setIsRejectDialogOpen(true)}
                  className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-60 shadow-sm"
                >
                  Reject
                </button>
              </>
            ) : null}

            {post.status === PostStatus.PUBLISHED || post.status === PostStatus.REJECTED ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => handleStatusChange(PostStatus.DRAFT)}
                className="rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-300 shadow-sm"
              >
                {post.status === PostStatus.PUBLISHED ? 'Unpublish' : 'Move to draft'}
              </button>
            ) : null}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-900 py-1.5 px-3 rounded-full border border-slate-200 dark:border-slate-800 shadow-sm">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Simulating public reader view
          </div>
        )}
      </div>

      {/* Two-Column Workspace Layout or Centered Reader Layout */}
      {viewMode === 'preview' ? (
        <div className="mx-auto max-w-3xl space-y-6">
          {/* Reader Canvas (Actual Post Content Preview) but centered and distraction-free */}
          <div className="space-y-6 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 shadow-sm sm:p-8">
            {/* Post Heading */}
            <div className="space-y-4">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 md:text-5xl md:leading-tight">
                {post.title}
              </h1>

              {/* Author Byline & Date */}
              <div className="flex items-center gap-3 border-y border-slate-100 py-4 dark:border-slate-800/80">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Published on {dayjs(post.updatedAt).format('MMMM DD, YYYY')}
                  </p>
                </div>
              </div>
            </div>

            {/* Hero Media Container */}
            <div className="overflow-hidden rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 shadow-sm">
              {post.mediaType === MediaType.VIDEO ? (
                (() => {
                  const embed = getEmbeddableVideoUrl(post.mediaUrl)
                  if (embed?.type === 'youtube' || embed?.type === 'vimeo') {
                    return (
                      <iframe
                        src={embed.url}
                        className="aspect-video w-full border-0 animate-fade-in"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    )
                  }
                  return <video src={post.mediaUrl} controls className="aspect-video w-full animate-fade-in" />
                })()
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="aspect-video w-full object-cover animate-fade-in"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const fallback = document.createElement('div')
                    fallback.className = 'flex aspect-video w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400 dark:bg-slate-900'
                    fallback.textContent = 'Unable to load media'
                    target.parentNode?.insertBefore(fallback, target)
                  }}
                />
              )}
            </div>

            {/* Actual Article Body Copy */}
            <div className="prose prose-slate dark:prose-invert max-w-none pt-4">
              <p className="text-lg leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre-wrap font-serif">
                {post.description}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <section className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr] items-start">
          
          {/* Left Column: The Reader Canvas (Actual Post Content Preview) */}
          <div className="space-y-6 rounded-md border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-950 shadow-sm">
            {/* Post Heading */}
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-950 dark:text-slate-100 md:text-4xl">
                {post.title}
              </h1>

              {/* Author Byline & Date */}
              <div className="flex items-center gap-3 border-y border-slate-100 py-3.5 dark:border-slate-800/80">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                  {post.authorName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-950 dark:text-slate-100 truncate">
                    {post.authorName}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {post.authorEmail}
                  </p>
                </div>
                <div className="hidden text-right text-xs text-slate-500 dark:text-slate-400 sm:block">
                  <div>Updated</div>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {dayjs(post.updatedAt).format('DD MMM YYYY, h:mm A')}
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Media Container */}
            <div className="overflow-hidden rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800/50 shadow-sm">
              {post.mediaType === MediaType.VIDEO ? (
                (() => {
                  const embed = getEmbeddableVideoUrl(post.mediaUrl)
                  if (embed?.type === 'youtube' || embed?.type === 'vimeo') {
                    return (
                      <iframe
                        src={embed.url}
                        className="aspect-video w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                        allowFullScreen
                      />
                    )
                  }
                  return <video src={post.mediaUrl} controls className="aspect-video w-full" />
                })()
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={post.mediaUrl}
                  alt={post.title}
                  className="aspect-video w-full object-cover"
                  onError={(e) => {
                    const target = e.currentTarget
                    target.style.display = 'none'
                    const fallback = document.createElement('div')
                    fallback.className = 'flex aspect-video w-full items-center justify-center rounded-lg bg-slate-100 text-sm text-slate-400 dark:bg-slate-900'
                    fallback.textContent = 'Unable to load media'
                    target.parentNode?.insertBefore(fallback, target)
                  }}
                />
              )}
            </div>

            {/* Actual Article Body Copy */}
            <div className="prose prose-slate dark:prose-invert max-w-none pt-2">
              <p className="text-base leading-relaxed text-slate-800 dark:text-slate-300 whitespace-pre-wrap">
                {post.description}
              </p>
            </div>
          </div>

          {/* Right Column: CMS Sidebar (Technical Metrics & Activity logs) */}
          <div className="space-y-6">
            
            {/* Metadata Widget Card */}
            <div className="rounded-md border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-950 shadow-sm">
              <h2 className="mb-4 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                Technical Details
              </h2>
              <dl className="space-y-4 text-xs">
                <div>
                  <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Workflow Status
                  </dt>
                  <dd className="mt-1">
                    <PostStatusBadge status={post.status} />
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Created Date
                  </dt>
                  <dd className="mt-1 text-slate-900 dark:text-slate-100 font-medium">
                    {dayjs(post.createdAt).format('DD MMM YYYY, h:mm A')}
                  </dd>
                </div>

                <div>
                  <dt className="font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide">
                    Content Media Type
                  </dt>
                  <dd className="mt-1 text-slate-900 dark:text-slate-100 font-medium capitalize">
                    {post.mediaType?.toLowerCase() || 'image'}
                  </dd>
                </div>

              </dl>
            </div>

            {/* Activity Logs Widget Section */}
            <div className="space-y-3">
              <h2 className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-1">
                Activity History
              </h2>
              <ActivityLogList logs={post.activityLogs} />
            </div>
          </div>

        </section>
      )}

      {/* Rejection Prompt Dialog */}
      <PromptDialog
        isOpen={isRejectDialogOpen}
        title="Reject post"
        message="Please provide a reason for rejecting this post so the author can make necessary updates."
        placeholder="Reason for rejection..."
        confirmText="Reject Post"
        isDanger={true}
        validate={(val) => {
          if (val.trim().length < 10) return 'Reason must be at least 10 characters long.'
          return null
        }}
        onConfirm={(reason) => handleStatusChange(PostStatus.REJECTED, reason)}
        onCancel={() => setIsRejectDialogOpen(false)}
      />
    </main>
  )
}
