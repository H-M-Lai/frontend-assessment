import { useEffect, useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Film, Image, Link as LinkIcon, Trash2, UploadCloud } from 'lucide-react'
import { MediaType, Post } from '../types/post.types'
import { PostFormData, postSchema } from '../validators/post.schema'
import { getEmbeddableVideoUrl, detectMediaType } from '../utils/media.utils'
import { RichTextEditor } from './RichTextEditor'

type PostFormProps = {
  mode: 'create' | 'edit'
  initialValues?: Post
  onSubmit: (data: PostFormData) => void | Promise<void>
  disabled?: boolean
}

const inputClass =
  'mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-950 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500 shadow-sm transition-all'

const labelClass = 'text-sm font-semibold text-slate-700 dark:text-slate-300'

const selectClass =
  'mt-1 w-full appearance-none rounded-md border border-slate-300 bg-white bg-[url(\'data:image/svg+xml;charset=utf-8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%2216%22%20height%3D%2216%22%20viewBox%3D%220%200%2024%2024%22%20fill%3D%22none%22%20stroke%3D%22%2394a3b8%22%20stroke-width%3D%222%22%20stroke-linecap%3D%22round%22%20stroke-linejoin%3D%22round%22%3E%3Cpolyline%20points%3D%226%209%2012%2015%2018%209%22%3E%3C%2Fpolyline%3E%3C%2Fsvg%3E\')] bg-[length:16px] bg-[right_12px_center] bg-no-repeat px-3 py-2 pr-9 text-sm outline-none focus:border-slate-950 disabled:bg-slate-100 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-100 dark:focus:border-slate-500 dark:disabled:bg-slate-900/50 dark:disabled:text-slate-500'

export function PostForm({ mode, initialValues, onSubmit, disabled = false }: PostFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    mode: 'onChange',
    defaultValues: {
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      mediaType: initialValues?.mediaType ?? MediaType.IMAGE,
      mediaUrl: initialValues?.mediaUrl ?? '',
      authorName: initialValues?.authorName ?? '',
      authorEmail: initialValues?.authorEmail ?? '',
    },
  })

  // Watch fields for dynamic visual feedback
  const currentMediaUrl = watch('mediaUrl')
  const currentMediaType = watch('mediaType')

  const [mediaTab, setMediaTab] = useState<'link' | 'upload'>('link')
  const [isDragging, setIsDragging] = useState(false)
  const [previewError, setPreviewError] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Reset image preview errors instantly when the mediaUrl is updated
  useEffect(() => {
    setPreviewError(false)
  }, [currentMediaUrl])

  // Configure initial tabs depending on if media is local base64 or link
  useEffect(() => {
    const isLocal = initialValues?.mediaUrl?.startsWith('data:')
    setMediaTab(isLocal ? 'upload' : 'link')

    reset({
      title: initialValues?.title ?? '',
      description: initialValues?.description ?? '',
      mediaType: initialValues?.mediaType ?? MediaType.IMAGE,
      mediaUrl: initialValues?.mediaUrl ?? '',
      authorName: initialValues?.authorName ?? '',
      authorEmail: initialValues?.authorEmail ?? '',
    })
  }, [initialValues, reset])

  // Dynamically calculate and update mediaType behind the scenes
  useEffect(() => {
    const detectedType = detectMediaType(currentMediaUrl)
    setValue('mediaType', detectedType, { shouldValidate: true })
  }, [currentMediaUrl, setValue])

  const isDisabled = disabled || isSubmitting

  // Drag and Drop Event Handlers
  function handleDragOver(e: React.DragEvent) {
    e.preventDefault()
    if (isDisabled) return
    setIsDragging(true)
  }

  function handleDragLeave() {
    setIsDragging(false)
  }

  function handleFileRead(file: File) {
    const isVideo = file.type.startsWith('video/')
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64String = reader.result as string
      setValue('mediaUrl', base64String, { shouldValidate: true })
      setValue('mediaType', isVideo ? MediaType.VIDEO : MediaType.IMAGE, { shouldValidate: true })
    }
    reader.readAsDataURL(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    setIsDragging(false)
    if (isDisabled) return

    const file = e.dataTransfer.files?.[0]
    if (file) {
      handleFileRead(file)
    }
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    if (isDisabled) return
    const file = e.target.files?.[0]
    if (file) {
      handleFileRead(file)
    }
  }

  function handleClearMedia() {
    setValue('mediaUrl', '', { shouldValidate: true })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input
          id="title"
          disabled={isDisabled}
          placeholder="e.g. Mastering Next.js App Router"
          className={inputClass}
          {...register('title')}
        />
        {errors.title ? <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.title.message}</p> : null}
      </div>

      {/* Description — Rich Text Editor */}
      <div>
        <label className={labelClass}>
          Description
        </label>
        <div className="mt-1">
          <RichTextEditor
            content={watch('description')}
            onChange={(html) => setValue('description', html, { shouldValidate: true })}
            disabled={isDisabled}
            placeholder="Write your article summary or excerpt..."
          />
        </div>
        {errors.description ? (
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.description.message}</p>
        ) : null}
      </div>

      {/* Modern Media Workspace */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className={labelClass}>Featured Media</label>

          {/* Media Switcher Tab Group */}
          <div className="flex gap-1 rounded-md bg-slate-100 p-1 dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setMediaTab('link')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                mediaTab === 'link'
                  ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <LinkIcon className="h-3 w-3" />
              Link URL
            </button>
            <button
              type="button"
              onClick={() => setMediaTab('upload')}
              className={`flex items-center gap-1.5 rounded px-2.5 py-1 text-xs font-medium transition-all ${
                mediaTab === 'upload'
                  ? 'bg-white text-slate-950 shadow-sm dark:bg-slate-800 dark:text-slate-100'
                  : 'text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
            >
              <UploadCloud className="h-3 w-3" />
              Upload Local
            </button>
          </div>
        </div>

        <div className={mediaTab === 'link' ? 'block' : 'hidden'}>
          {/* Tab A: Public Resource Link URL */}
          <div className="space-y-3">
            <div>
              <input
                id="mediaUrl"
                disabled={isDisabled}
                placeholder="Paste direct image URL, YouTube/Vimeo link, or direct stream link..."
                className={inputClass}
                {...register('mediaUrl')}
              />
              {errors.mediaUrl ? (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mediaUrl.message}</p>
              ) : null}
            </div>

            {/* Live Media URL Preview Box */}
            {currentMediaUrl && !currentMediaUrl.startsWith('data:') && (
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-inner p-1">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1 px-2 pt-1">
                  Live Resource Preview
                </div>
                {currentMediaType === MediaType.VIDEO ? (
                  (() => {
                    const embed = getEmbeddableVideoUrl(currentMediaUrl)
                    if (embed?.type === 'youtube' || embed?.type === 'vimeo') {
                      return (
                        <iframe
                          src={embed.url}
                          className="aspect-video w-full max-h-[220px] rounded border-0"
                          allowFullScreen
                        />
                      )
                    }
                    return (
                      <video
                        src={currentMediaUrl}
                        controls
                        className="aspect-video w-full max-h-[220px] rounded object-contain"
                      />
                    )
                  })()
                ) : previewError ? (
                  <div className="flex aspect-video w-full max-h-[220px] items-center justify-center rounded bg-slate-100/50 text-xs text-slate-400 dark:bg-slate-900/50 border border-dashed border-slate-200 dark:border-slate-800">
                    Waiting for a valid image URL...
                  </div>
                ) : (
                  <img
                    src={currentMediaUrl}
                    alt="Live link preview"
                    className="aspect-video w-full max-h-[220px] object-cover rounded"
                    onError={() => {
                      setPreviewError(true)
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className={mediaTab === 'upload' ? 'block' : 'hidden'}>
          {/* Tab B: Interactive Drag and Drop Upload Area */}
          <div className="space-y-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*,video/*"
              onChange={handleFileSelect}
              className="hidden"
              disabled={isDisabled}
            />

            {currentMediaUrl && currentMediaUrl.startsWith('data:') ? (
              /* Live Upload File Preview */
              <div className="relative overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900 shadow-inner">
                {currentMediaType === MediaType.VIDEO ? (
                  <video src={currentMediaUrl} controls className="aspect-video w-full max-h-[260px] mx-auto object-contain" />
                ) : (
                  <img
                    src={currentMediaUrl}
                    alt="Upload preview"
                    className="aspect-video w-full max-h-[260px] object-cover mx-auto rounded-lg"
                  />
                )}

                {/* Control Overlay Buttons */}
                <div className="absolute right-3 top-3 flex items-center gap-1.5">
                  <span className="rounded bg-slate-900/80 px-2 py-1 text-[10px] font-semibold uppercase text-white tracking-wider backdrop-blur-sm">
                    Local {currentMediaType?.toLowerCase() || 'image'}
                  </span>
                  <button
                    type="button"
                    onClick={handleClearMedia}
                    disabled={isDisabled}
                    className="rounded bg-red-600 p-1.5 text-white hover:bg-red-700 transition shadow-md"
                    title="Remove media"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              /* Interactive Drop Area */
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 text-center transition cursor-pointer ${
                  isDragging
                    ? 'border-slate-950 bg-slate-50 dark:border-slate-200 dark:bg-slate-900'
                    : 'border-slate-300 hover:border-slate-400 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-900/30'
                }`}
              >
                <UploadCloud className={`h-8 w-8 mb-2 transition-transform duration-200 ${isDragging ? 'scale-110 text-slate-800 dark:text-slate-100' : 'text-slate-400'}`} />
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                  Drag & drop your file here, or <span className="text-slate-950 underline dark:text-slate-100">browse</span>
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Supports JPEG, PNG, GIF, MP4, WebM (Max 4MB recommended)
                </p>
              </div>
            )}
            
            {errors.mediaUrl ? (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.mediaUrl.message}</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* Author Name / Email */}
      <div className="grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="authorName" className={labelClass}>
            Author name
          </label>
          <input
            id="authorName"
            disabled={isDisabled}
            placeholder="John Doe"
            className={inputClass}
            {...register('authorName')}
          />
          {errors.authorName ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.authorName.message}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="authorEmail" className={labelClass}>
            Author email
          </label>
          <input
            id="authorEmail"
            type="email"
            disabled={isDisabled}
            placeholder="john@example.com"
            className={inputClass}
            {...register('authorEmail')}
          />
          {errors.authorEmail ? (
            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.authorEmail.message}</p>
          ) : null}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
        <button
          type="submit"
          disabled={isDisabled}
          className="rounded-md bg-slate-950 px-6 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-70 dark:bg-slate-100 dark:text-slate-950 dark:hover:bg-slate-300 shadow-sm transition"
        >
          {isSubmitting ? 'Saving...' : mode === 'create' ? 'Create post' : 'Save changes'}
        </button>
      </div>
    </form>
  )
}

