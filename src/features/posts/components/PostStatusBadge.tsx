import { PostStatus } from '../types/post.types'

type PostStatusBadgeProps = {
  status: PostStatus
}

const statusStyles: Record<PostStatus, string> = {
  [PostStatus.DRAFT]:
    'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  [PostStatus.IN_REVIEW]:
    'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-400 dark:border-amber-800',
  [PostStatus.PUBLISHED]:
    'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-400 dark:border-emerald-800',
  [PostStatus.REJECTED]:
    'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/50 dark:text-red-400 dark:border-red-800',
}

export function PostStatusBadge({ status }: PostStatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusStyles[status]}`}
    >
      {status}
    </span>
  )
}
