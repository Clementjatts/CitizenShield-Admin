import { db } from '../config/firebaseConfig';
import {
    collection,
    query,
    orderBy,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    onSnapshot
} from 'firebase/firestore';
import { handleFirebaseError } from '../utils/errorHandler';

export const subscribeToAlerts = (callback: (alerts: any[]) => void) => {
    const q = query(collection(db, 'emergencies'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const alerts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(alerts);
    }, error => {
        console.error('Error in alerts subscription:', handleFirebaseError(error));
    });
};

export const subscribeToUsers = (callback: (users: any[]) => void) => {
    const q = query(collection(db, 'users'));
    return onSnapshot(q, (snapshot) => {
        const users = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(users);
    }, error => {
        console.error('Error in users subscription:', handleFirebaseError(error));
    });
};

export const subscribeToBlogPosts = (callback: (posts: any[]) => void) => {
    const q = query(collection(db, 'blogPosts'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(posts);
    }, error => {
        console.error('Error in blog posts subscription:', handleFirebaseError(error));
    });
};

export const subscribeToForumPosts = (callback: (posts: any[]) => void) => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const posts = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(posts);
    }, error => {
        console.error('Error in forum posts subscription:', handleFirebaseError(error));
    });
};

export const subscribeToMessages = (callback: (messages: any[]) => void) => {
    const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const messages = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(messages);
    }, error => {
        console.error('Error in messages subscription:', handleFirebaseError(error));
    });
};

export const subscribeToNotifications = (callback: (notifications: any[]) => void) => {
    const q = query(collection(db, 'notifications'), orderBy('date', 'desc'));
    return onSnapshot(q, (snapshot) => {
        const notifications = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        callback(notifications);
    }, error => {
        console.error('Error in notifications subscription:', handleFirebaseError(error));
    });
};

// Operations for Alert Management
export const resolveAlert = async (alertId: string) => {
    const alertRef = doc(db, 'emergencies', alertId);
    await updateDoc(alertRef, {
        status: 'Resolved',
        resolvedAt: new Date()
    });
};

export const deleteAlert = async (alertId: string) => {
    await deleteDoc(doc(db, 'emergencies', alertId));
};

// Operations for User Management
export const updateUserStatus = async (userId: string, suspended: boolean) => {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, { suspended });
};

export const deleteUser = async (userId: string) => {
    await deleteDoc(doc(db, 'users', userId));
};

// Operations for Blog Management
export const updateBlogVisibility = async (blogId: string, published: boolean) => {
    const blogRef = doc(db, 'blogPosts', blogId);
    await updateDoc(blogRef, { published });
};

export const deleteBlogPost = async (blogId: string) => {
    await deleteDoc(doc(db, 'blogPosts', blogId));
};

// Operations for Forum Management
export const updateForumPostVisibility = async (postId: string, published: boolean) => {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, { published });
};

export const deleteForumPost = async (postId: string) => {
    await deleteDoc(doc(db, 'posts', postId));
};

// Operations for Message Management
export const deleteMessage = async (messageId: string) => {
    await deleteDoc(doc(db, 'messages', messageId));
};

// Operations for Notification Management
export const createNotification = async (notificationData: any) => {
    await addDoc(collection(db, 'notifications'), {
        ...notificationData,
        timestamp: new Date()
    });
};

export const deleteNotification = async (notificationId: string) => {
    await deleteDoc(doc(db, 'notifications', notificationId));
};