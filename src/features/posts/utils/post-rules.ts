import { Post, PostStatus } from '../types/post.types'

// The workflow allows only these status movements.
export const allowedStatusTransitions = {
  [PostStatus.DRAFT]: [PostStatus.IN_REVIEW],
  [PostStatus.IN_REVIEW]: [PostStatus.PUBLISHED, PostStatus.REJECTED],
  [PostStatus.REJECTED]: [PostStatus.DRAFT],
  [PostStatus.PUBLISHED]: [PostStatus.DRAFT],
}

export function canTransition(from: PostStatus, to: PostStatus) {
  return allowedStatusTransitions[from]?.includes(to) ?? false
}

// Used by uniqueness checks so casing and extra spaces do not create duplicates.
export function normalize(value: string) {
  return value.trim().toLowerCase()
}

// Composite uniqueness rule: title + author email.
export function isDuplicatePost(
  posts: Post[],
  title: string,
  authorEmail: string,
  excludeId?: string,
) {
  return posts.some(
    (post) =>
      post.id !== excludeId &&
      normalize(post.title) === normalize(title) &&
      normalize(post.authorEmail) === normalize(authorEmail),
  )
}

// These statuses lock the edit form.
export function isReadOnlyStatus(status: PostStatus) {
  return status === PostStatus.PUBLISHED || status === PostStatus.IN_REVIEW
}
