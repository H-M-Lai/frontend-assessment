// Status Enum for Post
export enum PostStatus {
    DRAFT = 'Draft',
    IN_REVIEW = 'In Review',
    PUBLISHED = 'Published',
    REJECTED = 'Rejected',
}

// Media Type Enum for Post
export enum MediaType {
    IMAGE = 'Image',
    VIDEO = 'Video',
}

// Activity Log Type for Post
export interface ActivityLog {
    id: string;
    timestamp: string;
    action: string;
    summary: string;
    details?: string; // Optional field for more detailed information
    rejectionReason?: string; // Optional field for rejection reason if action is 'Rejected'
}

// Post Type
export interface Post {
    id: string;
    title: string;
    description: string;
    status: PostStatus;
    
    mediaType?: MediaType; // Optional field for media type
    mediaUrl?: string; // Optional field for media URL

    authorName: string;
    authorEmail: string;

    createdAt: string;
    updatedAt: string;

    activityLogs: ActivityLog[]; // Array of activity logs for the post, tracking arrays should always be initialized
}

