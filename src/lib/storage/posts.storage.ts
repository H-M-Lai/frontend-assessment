import { seedPosts } from '../../mocks/seed-posts';
import { Post } from '../../features/posts/types/post.types';

const STORAGE_KEY = 'posts';

// Load posts safely so bad or missing localStorage data does not break the app.
export function loadPosts(): Post[] {
    try {
        const raw = localStorage.getItem(STORAGE_KEY)

        if (!raw) return seedPosts

        const parsed = JSON.parse(raw)

        if (!Array.isArray(parsed)) {
        return seedPosts
        }

        return parsed
    } catch {
        return seedPosts
    }
}

// Persist the mock database after successful store operations.
export function savePosts(posts: Post[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts))
}
