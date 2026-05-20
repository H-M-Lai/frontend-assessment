'use client'

import { useEffect, useMemo, useState } from 'react'
import { LayoutGrid, List, Search } from 'lucide-react'
import dayjs from 'dayjs'
import { PostStatus } from '@/features/posts/types/post.types'
import { PostsTable } from '@/features/posts/components/PostsTable'
import { PostCard } from '@/features/posts/components/PostCard'
import { usePostStore } from '@/features/posts/store/post.store'
import { toast } from 'sonner'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'

const PAGE_SIZE = 12

export default function PostsPage() {
  const { posts, loading, error, loadPostsFromStorage, deletePost } = usePostStore()
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('All')
  const [dateRange, setDateRange] = useState('all')
  const [page, setPage] = useState(1)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table')

  useEffect(() => {
    // Hydrate Zustand from localStorage when the listing page opens.
    loadPostsFromStorage()

    // Restore user's preferred layout view (table/grid) from localStorage
    const savedViewMode = localStorage.getItem('posts-view-mode') as 'table' | 'grid'
    if (savedViewMode === 'table' || savedViewMode === 'grid') {
      setViewMode(savedViewMode)
    }
  }, [loadPostsFromStorage])

  const handleViewModeChange = (mode: 'table' | 'grid') => {
    setViewMode(mode)
    localStorage.setItem('posts-view-mode', mode)
  }

  const filteredPosts = useMemo(() => {
    // Listing requirements: search by title, filter by status, sort by latest update.
    return posts
      .filter((post) => post.title.toLowerCase().includes(search.trim().toLowerCase()))
      .filter((post) => status === 'All' || post.status === status)
      .filter((post) => {
        if (dateRange === 'all') return true
        const postDate = dayjs(post.updatedAt)
        const now = dayjs()
        if (dateRange === 'today') {
          return postDate.isAfter(now.startOf('day'))
        }
        if (dateRange === '7days') {
          return postDate.isAfter(now.subtract(7, 'day'))
        }
        if (dateRange === '30days') {
          return postDate.isAfter(now.subtract(30, 'day'))
        }
        return true
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
  }, [posts, search, status, dateRange])

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / PAGE_SIZE))
  // Pagination is derived from the filtered results.
  const currentPosts = filteredPosts.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function handleDeleteRequest(id: string) {
    setDeleteId(id)
  }

  async function confirmDelete() {
    if (!deleteId) return

    try {
      await deletePost(deleteId)
      setDeleteId(null)
      toast.success('Post successfully deleted')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete post.')
    }
  }

  const pagination = (
    <div className="flex flex-col gap-3 border-t border-slate-200 bg-white px-4 py-3 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400 sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {currentPosts.length} of {filteredPosts.length} posts
      </span>

      <div className="flex items-center gap-2">
        <button
          type="button"
          disabled={page === 1}
          onClick={() => setPage((current) => Math.max(1, current - 1))}
          className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Previous
        </button>

        <span>
          Page {page} of {totalPages}
        </span>

        <button
          type="button"
          disabled={page === totalPages}
          onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          className="rounded-md border border-slate-300 px-3 py-2 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:hover:bg-slate-900"
        >
          Next
        </button>
      </div>
    </div>
  )

  return (
    <main className="mx-auto max-w-6xl space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-slate-100">Posts</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Review, filter, and manage content through the publishing workflow.
          </p>
        </div>

        <div className="flex items-center gap-1 rounded-md border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-950 shadow-sm">
          <button
            type="button"
            onClick={() => handleViewModeChange('table')}
            className={`rounded px-2.5 py-1.5 transition-all ${
              viewMode === 'table'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-label="Table view"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => handleViewModeChange('grid')}
            className={`rounded px-2.5 py-1.5 transition-all ${
              viewMode === 'grid'
                ? 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
            }`}
            aria-label="Grid view"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
        </div>
      </div>

      <section className="grid gap-3 rounded-md border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-950 sm:grid-cols-[1fr_180px_180px]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
              setPage(1)
            }}
            placeholder="Search by title..."
            className="w-full rounded-md border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm outline-none focus:border-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
          />
        </div>

        <select
          value={status}
          onChange={(event) => {
            setStatus(event.target.value)
            setPage(1)
          }}
          className="appearance-none rounded-md border border-slate-300 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat px-3 py-2 pr-9 text-sm outline-none focus:border-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="All">All statuses</option>
          {Object.values(PostStatus).map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={dateRange}
          onChange={(event) => {
            setDateRange(event.target.value)
            setPage(1)
          }}
          className="appearance-none rounded-md border border-slate-300 bg-white bg-[url('data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat px-3 py-2 pr-9 text-sm outline-none focus:border-slate-950 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-slate-500"
        >
          <option value="all">All time</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 days</option>
          <option value="30days">Last 30 days</option>
        </select>
      </section>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
          {error}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-md border border-slate-200 bg-white p-6 text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          Saving changes...
        </div>
      ) : null}

      {viewMode === 'table' ? (
        <PostsTable
          posts={currentPosts}
          onDelete={handleDeleteRequest}
          footer={pagination}
        />
      ) : currentPosts.length === 0 ? (
        <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
          No posts found.
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {currentPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
          <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            {pagination}
          </div>
        </div>
      )}

      <ConfirmDialog
        isOpen={!!deleteId}
        title="Delete post"
        message="Are you sure you want to delete this post? This action cannot be undone."
        onConfirm={confirmDelete}
        onCancel={() => setDeleteId(null)}
      />
    </main>
  )
}
