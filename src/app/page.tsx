'use client'

import { useEffect, useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Globe2, Newspaper, FileText, Clock, CheckCircle2, XCircle } from 'lucide-react'
import { PostCard } from '@/features/posts/components/PostCard'
import { usePostStore } from '@/features/posts/store/post.store'
import { PostStatus } from '@/features/posts/types/post.types'

const statConfig = [
  {
    label: 'Total posts',
    key: 'total' as const,
    icon: FileText,
    accent: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    label: 'Draft',
    key: PostStatus.DRAFT,
    icon: Clock,
    accent: 'text-slate-700 dark:text-slate-300',
    bg: 'bg-slate-50 dark:bg-slate-800/50',
    iconBg: 'bg-slate-100 dark:bg-slate-800',
  },
  {
    label: 'In review',
    key: PostStatus.IN_REVIEW,
    icon: Clock,
    accent: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-950/30',
    iconBg: 'bg-amber-100 dark:bg-amber-900/50',
  },
  {
    label: 'Published',
    key: PostStatus.PUBLISHED,
    icon: CheckCircle2,
    accent: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-950/30',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
  },
  {
    label: 'Rejected',
    key: PostStatus.REJECTED,
    icon: XCircle,
    accent: 'text-red-700 dark:text-red-400',
    bg: 'bg-red-50 dark:bg-red-950/30',
    iconBg: 'bg-red-100 dark:bg-red-900/50',
  },
]

export default function Home() {
  const { posts, loadPostsFromStorage } = usePostStore()

  useEffect(() => {
    loadPostsFromStorage()
  }, [loadPostsFromStorage])

  const statValues = useMemo(() => {
    const counts: Record<string, number> = { total: posts.length }
    Object.values(PostStatus).forEach((s) => {
      counts[s] = posts.filter((p) => p.status === s).length
    })
    return counts
  }, [posts])

  const recentPosts = [...posts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 3)

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <section>
        <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Content operations overview</h1>
        <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Track content by workflow status, jump into the review queue, and inspect country reference data.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statConfig.map((stat) => {
          const Icon = stat.icon
          const value = statValues[stat.key] ?? 0
          return (
            <article
              key={stat.label}
              className={`rounded-md border border-slate-200 p-4 dark:border-slate-800 ${stat.bg}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
                <div className={`rounded-md p-1.5 ${stat.iconBg}`}>
                  <Icon className={`h-4 w-4 ${stat.accent}`} />
                </div>
              </div>
              <p className={`mt-3 text-3xl font-semibold ${stat.accent}`}>{value}</p>
            </article>
          )
        })}
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <Link
          href="/posts"
          className="group rounded-md border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
        >
          <Newspaper className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">Manage posts</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Search, filter, edit, and move content through review.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-slate-100">
            Open posts
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>

        <Link
          href="/public-api"
          className="group rounded-md border border-slate-200 bg-white p-5 hover:border-slate-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700"
        >
          <Globe2 className="h-6 w-6 text-slate-700 dark:text-slate-300" />
          <h2 className="mt-4 text-base font-semibold text-slate-950 dark:text-slate-100">Country directory</h2>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">Browse country data from the REST Countries API.</p>
          <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-slate-950 dark:text-slate-100">
            Open countries
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </Link>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-950 dark:text-slate-100">Recently updated</h2>
          <Link href="/posts" className="text-sm font-medium text-slate-600 hover:text-slate-950 dark:text-slate-400 dark:hover:text-slate-100">
            View all
          </Link>
        </div>

        {recentPosts.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-3">
            {recentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        ) : (
          <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center dark:border-slate-800 dark:bg-slate-950">
            <p className="text-sm text-slate-500 dark:text-slate-400">No posts yet. Create your first post to get started.</p>
            <Link
              href="/posts/create"
              className="mt-3 inline-flex items-center gap-2 rounded-md bg-slate-950 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-300"
            >
              Create a post
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
