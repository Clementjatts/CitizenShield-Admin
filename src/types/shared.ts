export interface Notification {
    id: number;
    title: string;
    message: string;
    audience: "All Users" | "Individual User";
    targetUserId?: string;
    targetUserName?: string;
    timestamp: Date;
    read?: boolean;
}

export interface Alert {
    id: string;
    type: string;
    location: string;
    initialLocation: {
        latitude: number;
        longitude: number;
    };
    status: "Active" | "Resolved";
    priority: "Low" | "Medium" | "High";
    timestamp: string;
    initiatorName: string;
    userId: string;
    resolvedAt?: Date;
}

export interface EmergencyContact {
    name: string;
    phoneNumber: string;
    relationship: string;
}

export interface User {
    id: number;
    docId?: string;
    name: string;
    email: string;
    role: string;
    suspended: boolean;
    avatar: string;
    registrationDate: string;
    lastLoginDate: string;
    phoneNumber: string;
    password: string;
    emergencyContacts?: EmergencyContact[];
}

export interface Message {
    id: string;
    senderId: string;
    senderName: string;
    recipientId: string;
    recipientName: string;
    content: string;
    timestamp: string;
    isFlagged: boolean;
}

export interface Comment {
    id: number;
    author: string;
    content: string;
    date: string;
    isAdminComment: boolean;
}

export interface ForumPost {
    id: number;
    title: string;
    author: string;
    date: string;
    replies: number;
    likes: number;
    published: boolean;
    isAdminPost: boolean;
    snippet: string;
    content: string;
    comments: Comment[];
}

export interface BlogArticle {
    id: number;
    title: string;
    author: string;
    date: string;
    snippet: string;
    content: string;
    imageUrl: string;
    published: boolean;
}