'use client'

import { create } from 'zustand'
import { Post, PostStatus, ActivityLog } from '../types/post.types'
import { loadPosts, savePosts } from '../../../lib/storage/posts.storage'
import { canTransition, isDuplicatePost, isReadOnlyStatus } from '../utils/post-rules'
import { PostFormData } from '../validators/post.schema'

interface PostState {
  posts: Post[]
  loading: boolean
  error: string | null

  loadPostsFromStorage: () => void
  getPostById: (id: string) => Post | undefined
  createPost: (data: PostFormData) => Promise<Post>
  updatePost: (id: string, data: PostFormData) => Promise<Post>
  deletePost: (id: string) => Promise<void>
  changeStatus: (id: string, nextStatus: PostStatus, rejectionReason?: string) => Promise<void>
}

// Simulates a real network request so optimistic UI behavior can be tested.
function fakeApiDelay() {
  return new Promise((resolve) => setTimeout(resolve, 1000))
}

// Gives each write operation a small failure chance to prove rollback works.
function shouldFail() {
  // return Math.random() < 0.2 // this for testing the optimistic updates (simulated 20% failure rate)
  return false; // this to prevent failure of the optimistic updates
}

// Central helper for every automatic activity log entry.
function createActivityLog(
  action: string,
  summary: string,
  rejectionReason?: string,
): ActivityLog {
  return {
    id: crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    action,
    summary,
    rejectionReason,
  }
}

// Waits for the simulated request to succeed before updating the UI.
async function optimisticSave(
  previousPosts: Post[],
  nextPosts: Post[],
  set: (state: Partial<PostState>) => void,
) {
  set({ loading: true, error: null })

  try {
    await fakeApiDelay()

    if (shouldFail()) {
      throw new Error('Request failed')
    }

    savePosts(nextPosts)
    set({ posts: nextPosts, loading: false, error: null })
  } catch (error) {
    set({
      loading: false,
      error: error instanceof Error ? error.message : 'Request failed',
    })
    throw error
  }
}

export const usePostStore = create<PostState>((set, get) => ({
  posts: [],
  loading: false,
  error: null,

  loadPostsFromStorage: () => {
    // localStorage is the mock persistence layer for this assessment.
    set({ posts: loadPosts(), error: null })
  },

  getPostById: (id) => {
    return get().posts.find((post) => post.id === id)
  },

  createPost: async (data) => {
    const previousPosts = get().posts

    // Business rule: title + author email must be unique, ignoring case and spaces.
    if (isDuplicatePost(previousPosts, data.title, data.authorEmail)) {
      throw new Error('A post with this title and author email already exists.')
    }

    const now = new Date().toISOString()
    const newPost: Post = {
      id: crypto.randomUUID(),
      title: data.title,
      description: data.description,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      status: PostStatus.DRAFT,
      createdAt: now,
      updatedAt: now,
      activityLogs: [createActivityLog('Post created', 'Post was created as draft')],
    }

    await optimisticSave(previousPosts, [newPost, ...previousPosts], set)
    return newPost
  },

  updatePost: async (id, data) => {
    const previousPosts = get().posts
    const existingPost = previousPosts.find((post) => post.id === id)

    if (!existingPost) {
      throw new Error('Post not found.')
    }

    // Published and in-review posts are locked by workflow rules.
    if (isReadOnlyStatus(existingPost.status)) {
      throw new Error('This post cannot be edited in its current status.')
    }

    if (isDuplicatePost(previousPosts, data.title, data.authorEmail, id)) {
      throw new Error('A post with this title and author email already exists.')
    }

    const updatedPost: Post = {
      ...existingPost,
      title: data.title,
      description: data.description,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      updatedAt: new Date().toISOString(),
      activityLogs: [
        createActivityLog('Post edited', 'Post details were updated'),
        ...existingPost.activityLogs,
      ],
    }

    const nextPosts = previousPosts.map((post) => (post.id === id ? updatedPost : post))

    await optimisticSave(previousPosts, nextPosts, set)
    return updatedPost
  },

  deletePost: async (id) => {
    const previousPosts = get().posts
    const nextPosts = previousPosts.filter((post) => post.id !== id)

    if (nextPosts.length === previousPosts.length) {
      throw new Error('Post not found.')
    }

    await optimisticSave(previousPosts, nextPosts, set)
  },

  changeStatus: async (id, nextStatus, rejectionReason) => {
    const previousPosts = get().posts
    const existingPost = previousPosts.find((post) => post.id === id)

    if (!existingPost) {
      throw new Error('Post not found.')
    }

    // Prevent invalid workflow jumps such as Draft -> Published.
    if (!canTransition(existingPost.status, nextStatus)) {
      throw new Error(`Cannot change status from ${existingPost.status} to ${nextStatus}.`)
    }

    // Rejection requires an audit reason for the activity log.
    if (nextStatus === PostStatus.REJECTED && !rejectionReason?.trim()) {
      throw new Error('Rejection reason is required.')
    }

    // Each workflow transition creates a readable audit entry.
    const logByStatus: Record<PostStatus, ActivityLog> = {
      [PostStatus.DRAFT]: createActivityLog(
        existingPost.status === PostStatus.PUBLISHED ? 'Unpublished' : 'Moved to draft',
        'Post was moved back to draft',
      ),
      [PostStatus.IN_REVIEW]: createActivityLog(
        'Submitted for review',
        'Post was submitted for review',
      ),
      [PostStatus.PUBLISHED]: createActivityLog(
        'Published',
        'Post was published successfully',
      ),
      [PostStatus.REJECTED]: createActivityLog(
        'Rejected',
        'Post was rejected',
        rejectionReason?.trim(),
      ),
    }

    const updatedPost: Post = {
      ...existingPost,
      status: nextStatus,
      updatedAt: new Date().toISOString(),
      activityLogs: [logByStatus[nextStatus], ...existingPost.activityLogs],
    }

    const nextPosts = previousPosts.map((post) => (post.id === id ? updatedPost : post))

    await optimisticSave(previousPosts, nextPosts, set)
  },
}))
