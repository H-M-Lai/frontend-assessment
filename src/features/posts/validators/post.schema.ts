import { z } from 'zod'
import { MediaType } from '../types/post.types'

// Shared form schema used by both create and edit pages.
export const postSchema = z.object({
    title: z
        .string()
        .min(5)
        .max(80),

    description: z
        .string()
        .min(20)
        .max(500),

    mediaType: z.enum(MediaType),

    mediaUrl: z.string().min(1, 'Media reference is required'),

    authorName: z.string().min(1),

    authorEmail: z.email(),
})

export type PostFormData = z.infer<typeof postSchema>
