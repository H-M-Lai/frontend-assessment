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
        .refine(
            (val) => val.replace(/<[^>]*>/g, '').trim().length >= 20,
            { message: 'Description must be at least 20 characters' },
        )
        .refine(
            (val) => val.replace(/<[^>]*>/g, '').trim().length <= 500,
            { message: 'Description must be at most 500 characters' },
        ),

    mediaType: z.enum(MediaType),

    mediaUrl: z.string().min(1, 'Media reference is required'),

    authorName: z.string().min(1),

    authorEmail: z.email(),
})

export type PostFormData = z.infer<typeof postSchema>
