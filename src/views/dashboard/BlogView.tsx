import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { FileText } from 'lucide-react';
import BlogArticleCard from '../../components/cards/BlogArticleCard';
import CreateArticleForm from '../forms/CreateArticleForm';
import { BlogArticle } from '../../types/shared';
import { collection, addDoc, doc, updateDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db, auth, storage } from '../../config/firebaseConfig';
import { ref, deleteObject, getMetadata } from 'firebase/storage';
import { subscribeToBlogPosts, updateBlogVisibility } from '../../services/dashboardService';
import { handleFirebaseError } from '../../utils/errorHandler';

interface BlogViewProps {
    searchTerm: string;
}

const BlogView: React.FC<BlogViewProps> = ({ searchTerm }) => {
    const [articles, setArticles] = useState<BlogArticle[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [editingArticle, setEditingArticle] = useState<BlogArticle | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = subscribeToBlogPosts((newArticles) => {
            setArticles(newArticles);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Helper function to extract storage path from the image URL
    function extractStoragePath(url: string): string | null {
        // Decode the URL to handle URL-encoded characters
        const decodedUrl = decodeURIComponent(url);
        // Use a regular expression to extract the path between '/o/' and the query parameters
        const matches = decodedUrl.match(/\/o\/(.*?)\?/);
        if (matches && matches[1]) {
            return matches[1];
        }
        return null;
    }

    const handleDeleteBlog = async (id: number) => {
        try {
            const article = articles.find(a => a.id === id);
            if (!article) {
                console.log('Article not found');
                return;
            }

            // First delete the Firestore document
            await deleteDoc(doc(db, 'blogPosts', id.toString()));
            console.log('Blog post document deleted successfully');

            // Then try to delete the image if it exists
            if (article.imageUrl) {
                try {
                    // Extract the storage path from the image URL
                    const path = extractStoragePath(article.imageUrl);
                    if (path) {
                        const imageRef = ref(storage, path);
                        // Check if the file exists before attempting to delete
                        try {
                            await getMetadata(imageRef);
                            console.log('File exists, proceeding with deletion');
                            await deleteObject(imageRef);
                            console.log('Image deleted successfully');
                        } catch (metadataError) {
                            console.error('File does not exist or cannot be accessed:', metadataError);
                        }
                    } else {
                        console.error('Failed to extract storage path from URL');
                    }
                } catch (storageError) {
                    console.error('Storage error:', storageError);
                    // Continue even if deleting the image fails
                }
            }
        } catch (err) {
            console.error('Error in handleDeleteBlog:', err);
            setError(handleFirebaseError(err));
        }
    };

    const handleEditBlogArticle = async (id: number) => {
        try {
            const articleToEdit = articles.find(a => a.id === id);
            if (articleToEdit) {
                setEditingArticle(articleToEdit);
                setShowCreateForm(true);
            }
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleToggleBlogVisibility = async (id: number) => {
        try {
            const article = articles.find(a => a.id === id);
            if (article) {
                await updateBlogVisibility(id.toString(), !article.published);
            }
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleCreateBlogArticle = async (articleData: {
        title: string;
        snippet: string;
        content: string;
        imageUrl: string;
        published: boolean;
        author?: string;
    }) => {
        try {
            // Fetch the current admin's full name from their user document
            const adminDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
            const adminData = adminDoc.data();
            const authorName = `${adminData?.fullName || adminData?.name || 'Unknown'} (Admin)`;

            if (editingArticle) {
                // Update existing article
                const articleRef = doc(db, 'blogPosts', editingArticle.id.toString());
                await updateDoc(articleRef, {
                    ...articleData,
                    updatedAt: new Date(),
                    lastEditedBy: authorName
                });
            } else {
                // Create new article
                const newArticle = {
                    ...articleData,
                    date: new Date().toISOString(),
                    author: authorName,
                };
                await addDoc(collection(db, 'blogPosts'), newArticle);
            }

            setShowCreateForm(false);
            setEditingArticle(null); // Reset editing state
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const filteredBlogData = articles.filter(article =>
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.snippet.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCancelForm = () => {
        setShowCreateForm(false);
        setEditingArticle(null);
    };

    if (loading) {
        return <div>Loading blog articles...</div>;
    }

    return (
        <div>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <Button
                variant="primary"
                className="mb-4 d-flex align-items-center"
                onClick={() => setShowCreateForm(true)}
            >
                <FileText size={18} className="mr-2" />
                <span>{editingArticle ? 'Edit Article' : 'Create New Article'}</span>
            </Button>

            {showCreateForm && (
                <CreateArticleForm
                    onSubmit={handleCreateBlogArticle}
                    onCancel={handleCancelForm}
                    editingArticle={editingArticle}
                />
            )}

            {filteredBlogData.map(article => (
                <BlogArticleCard
                    key={article.id}
                    article={article}
                    onDelete={handleDeleteBlog}
                    onEdit={handleEditBlogArticle}
                    onToggleVisibility={handleToggleBlogVisibility}
                />
            ))}

            {filteredBlogData.length === 0 && !loading && (
                <Alert variant="info">
                    No blog articles found. {searchTerm ? 'Try adjusting your search.' : 'Create your first article!'}
                </Alert>
            )}
        </div>
    );
};

export default BlogView;