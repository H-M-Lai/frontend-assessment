import Link from 'next/link'
import dayjs from 'dayjs'
import { Edit, Eye, Play, Trash2 } from 'lucide-react'
import { MediaType, Post } from '../types/post.types'
import { PostStatusBadge } from './PostStatusBadge'
import { getEmbeddableVideoUrl } from '../utils/media.utils'

type PostsTableProps = {
  posts: Post[]
  onDelete?: (id: string) => void
  footer?: React.ReactNode
}

/**
 * Renders a data table for posts.
 * Includes action buttons for viewing, editing, and deleting posts.
 * Handles empty states gracefully and supports injecting a custom footer (like pagination).
 * 
 * @param {PostsTableProps} props - The component props containing the posts list and event handlers.
 */
export function PostsTable({ posts, onDelete, footer }: PostsTableProps) {
  if (posts.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
        No posts found.
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-md border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
      <div className="overflow-x-auto">
        <table className="w-full table-fixed divide-y divide-slate-200 dark:divide-slate-800">
          <colgroup>
            <col className="w-[10%]" />
            <col className="w-[34%]" />
            <col className="w-[16%]" />
            <col className="w-[12%]" />
            <col className="w-[12%]" />
            <col className="w-[16%]" />
          </colgroup>
          <thead className="bg-slate-50 dark:bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Post
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Author
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Updated
              </th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase text-slate-500 dark:text-slate-400">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
            {posts.map((post) => {
              const isVideo = post.mediaType === MediaType.VIDEO
              const embed = isVideo ? getEmbeddableVideoUrl(post.mediaUrl) : null
              const videoThumbnail = embed?.type === 'youtube' ? embed.thumbnail : null

              return (
                <tr key={post.id} className="group hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors duration-150">
                  <td className="align-middle px-4 py-4 text-xs font-mono text-slate-500 dark:text-slate-400">
                    #{post.id.slice(0, 8)}
                  </td>

                  <td className="align-middle px-4 py-4">
                    <div className="flex items-center gap-3 min-w-0">
                      {post.mediaUrl ? (
                        <div className="relative h-10 w-16 flex-shrink-0 overflow-hidden rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          {isVideo ? (
                            <div className="relative h-full w-full">
                              {videoThumbnail ? (
                                <img
                                  src={videoThumbnail}
                                  alt=""
                                  className="h-full w-full object-cover"
                                />
                              ) : (
                                <video
                                  src={post.mediaUrl}
                                  className="h-full w-full object-cover"
                                  muted
                                  playsInline
                                />
                              )}
                              <div className="absolute inset-0 flex items-center justify-center bg-slate-950/20">
                                <Play className="h-2.5 w-2.5 fill-white stroke-white" />
                              </div>
                            </div>
                          ) : (
                            <img
                              src={post.mediaUrl}
                              alt=""
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          )}
                        </div>
                      ) : (
                      <div className="h-10 w-16 flex-shrink-0 rounded bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-[10px] text-slate-400">
                        No media
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-slate-950 dark:text-slate-100">{post.title}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{post.description}</p>
                    </div>
                  </div>
                </td>

                <td className="align-middle px-4 py-4">
                  <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">{post.authorName}</p>
                  <p className="mt-0.5 truncate text-xs text-slate-500 dark:text-slate-400">{post.authorEmail}</p>
                </td>

                <td className="align-middle px-4 py-4">
                  <PostStatusBadge status={post.status} />
                </td>

                <td className="align-middle whitespace-nowrap px-4 py-4 text-sm text-slate-600 dark:text-slate-400">
                  {dayjs(post.updatedAt).format('DD MMM YYYY')}
                </td>

                <td className="align-middle px-4 py-4">
                  <div className="flex justify-end gap-1.5">
                    <Link
                      href={`/posts/${post.id}`}
                      className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                      aria-label={`View ${post.title}`}
                    >
                      <Eye className="h-4 w-4" />
                    </Link>

                    <Link
                      href={`/posts/${post.id}/edit`}
                      className="rounded-md border border-slate-200 p-1.5 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-400 dark:hover:bg-slate-800"
                      aria-label={`Edit ${post.title}`}
                    >
                      <Edit className="h-4 w-4" />
                    </Link>

                    {onDelete ? (
                      <button
                        type="button"
                        onClick={() => onDelete(post.id)}
                        className="rounded-md border border-slate-200 p-1.5 text-red-600 hover:bg-red-50 dark:border-slate-800 dark:text-red-400 dark:hover:bg-red-950/30"
                        aria-label={`Delete ${post.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    ) : null}
                  </div>
                </td>
              </tr>
            )
          })}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
