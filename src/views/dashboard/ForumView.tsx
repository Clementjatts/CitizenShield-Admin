import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import ForumPostCard from '../../components/cards/ForumPostCard';
import { ForumPost } from '../../types/shared';
import { db } from '../../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc, writeBatch, getDocs, increment, getDoc, Timestamp, DocumentData, updateDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface ForumViewProps {
    searchTerm: string;
}

interface UserData {
    fullName?: string;
    name?: string;
    role?: string;
}

interface CommentData {
    author: string;
    content: string;
    timestamp: Timestamp;
    isAdminComment: boolean;
}

interface PostData extends DocumentData {
    title: string;
    content: string;
    authorId: string;
    createdAt: Timestamp;
    likes: number;
    authorRole?: string;
}

const ForumView: React.FC<ForumViewProps> = ({ searchTerm }) => {
    const [posts, setPosts] = useState<ForumPost[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const postsRef = collection(db, 'posts');
        const q = query(postsRef, orderBy('createdAt', 'desc'));

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            try {
                const postsData: ForumPost[] = await Promise.all(
                    snapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data() as PostData;

                        // Get author's name
                        let authorName = 'Unknown User';
                        if (data.authorId) {
                            const userDoc = await getDoc(doc(db, 'users', data.authorId));
                            const userData = userDoc.data() as UserData;
                            authorName = userData?.fullName || userData?.name || 'Unknown User';
                        }

                        // Get comments
                        const commentsRef = collection(db, 'posts', docSnapshot.id, 'comments');
                        const commentsSnapshot = await getDocs(commentsRef);
                        const comments = commentsSnapshot.docs.map(commentDoc => {
                            const commentData = commentDoc.data() as CommentData;
                            return {
                                id: parseInt(commentDoc.id),
                                author: commentData.author,
                                content: commentData.content,
                                date: commentData.timestamp.toDate().toISOString(),
                                isAdminComment: commentData.isAdminComment
                            };
                        });

                        // Convert timestamp to ISO string or use current date
                        const timestamp = data.createdAt instanceof Timestamp ?
                            data.createdAt.toDate().toISOString() :
                            new Date().toISOString();

                        return {
                            id: parseInt(docSnapshot.id),
                            title: data.title || '',
                            author: authorName,
                            content: data.content || '',
                            snippet: data.content?.substring(0, 100) || '',
                            date: timestamp,
                            replies: comments.length,
                            likes: data.likes || 0,
                            published: true,
                            isAdminPost: data.authorRole === 'admin',
                            authorId: data.authorId,
                            comments: comments
                        } as ForumPost;
                    })
                );

                setPosts(postsData);
                setLoading(false);
            } catch (error) {
                const errorMessage = handleFirebaseError(error);
                setError(errorMessage);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    const handleDeleteForumPost = async (id: number) => {
        try {
            const batch = writeBatch(db);

            // Get reference to the post document
            const postRef = doc(db, 'posts', id.toString());

            // Get all comments for this post
            const commentsRef = collection(postRef, 'comments');
            const commentSnapshot = await getDocs(commentsRef);

            // Add delete operations for all comments to the batch
            commentSnapshot.docs.forEach((commentDoc) => {
                batch.delete(doc(postRef, 'comments', commentDoc.id));
            });

            // Add delete operation for the post to the batch
            batch.delete(postRef);

            // Commit the batch
            await batch.commit();
        } catch (err) {
            setError(handleFirebaseError(err));
            throw err;
        }
    };

    const handleDeleteComment = async (postId: number, commentId: number) => {
        try {
            // Create reference to the comment
            const commentRef = doc(db, 'posts', postId.toString(), 'comments', commentId.toString());

            // Delete the comment
            await deleteDoc(commentRef);

            // Update the post's comment count
            const postRef = doc(db, 'posts', postId.toString());
            await updateDoc(postRef, {
                commentCount: increment(-1)
            });
        } catch (err) {
            setError(handleFirebaseError(err));
            throw err;
        }
    };

    const filteredPosts = posts.filter(post =>
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Loading forum posts...</div>;
    }

    return (
        <div>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {filteredPosts.length === 0 ? (
                <Alert variant="info">
                    No forum posts found {searchTerm && 'matching your search criteria'}.
                </Alert>
            ) : (
                filteredPosts.map(post => (
                    <ForumPostCard
                        key={post.id}
                        post={post}
                        onDelete={handleDeleteForumPost}
                        onDeleteComment={handleDeleteComment}
                    />
                ))
            )}
        </div>
    );
};

export default ForumView;