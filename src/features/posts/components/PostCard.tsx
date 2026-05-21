import Link from 'next/link'
import dayjs from 'dayjs'
import { Play } from 'lucide-react'
import { MediaType, Post } from '../types/post.types'
import { PostStatusBadge } from './PostStatusBadge'
import { getEmbeddableVideoUrl } from '../utils/media.utils'

type PostCardProps = {
  post: Post
}

export function PostCard({ post }: PostCardProps) {
  const isVideo = post.mediaType === MediaType.VIDEO
  const embed = isVideo ? getEmbeddableVideoUrl(post.mediaUrl) : null
  const videoThumbnail = embed?.type === 'youtube' ? embed.thumbnail : null

  return (
    <Link
      href={`/posts/${post.id}`}
      className="group flex flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:shadow-slate-900/50"
    >
      {post.mediaUrl ? (
        <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
          {isVideo ? (
            <div className="relative h-full w-full">
              {videoThumbnail ? (
                <img
                  src={videoThumbnail}
                  alt=""
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
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
                <div className="rounded-full bg-white/90 p-2 shadow dark:bg-slate-950/90">
                  <Play className="h-4 w-4 fill-slate-950 stroke-slate-950 dark:fill-slate-100 dark:stroke-slate-100" />
                </div>
              </div>
            </div>
          ) : (
            <img
              src={post.mediaUrl}
              alt=""
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-102"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          )}
        </div>
      ) : null}

      <article className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-3">
          <h3 className="line-clamp-2 text-sm font-semibold text-slate-950 transition-colors group-hover:text-slate-800 dark:text-slate-100 dark:group-hover:text-slate-300">
            {post.title}
          </h3>
          <PostStatusBadge status={post.status} />
        </div>
        
        <p className="mt-1.5 line-clamp-2 text-xs text-slate-500 dark:text-slate-400">
          {post.description.replace(/<[^>]*>/g, '')}
        </p>

        <div className="mt-auto pt-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-500 dark:text-slate-400">
          <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[120px]">
            {post.authorName}
          </span>
          <span>
            {dayjs(post.updatedAt).format('DD MMM YYYY')}
          </span>
        </div>
      </article>
    </Link>
  )
}

