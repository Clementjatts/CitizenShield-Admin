import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Alert } from 'react-bootstrap';
import { Edit3, Trash2, Eye, EyeOff, Calendar, User } from 'lucide-react';
import { BlogArticle } from '../../types/shared';
import { storage } from '../../config/firebaseConfig';
import { ref, deleteObject } from 'firebase/storage';
import { handleFirebaseError } from '../../utils/errorHandler';

interface BlogArticleCardProps {
    article: BlogArticle;
    onDelete: (id: number) => void;
    onEdit: (id: number) => void;
    onToggleVisibility: (id: number) => void;
}

const BlogArticleCard: React.FC<BlogArticleCardProps> = ({
    article,
    onDelete,
    onEdit,
    onToggleVisibility
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            // Delete the image from storage if it exists
            if (article.imageUrl) {
                try {
                    // Extract the file path from the Firebase Storage URL
                    const fileUrl = new URL(article.imageUrl);
                    const filePath = decodeURIComponent(fileUrl.pathname.split('/o/')[1].split('?')[0]);
                    const imageRef = ref(storage, filePath);
                    await deleteObject(imageRef);
                } catch (imageError) {
                    // Log the error but continue with post deletion
                    console.warn('Error deleting image:', imageError);
                }
            }

            await onDelete(article.id);
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <div className="flex flex-col md:flex-row">
                <div className="md:w-1/3 h-48 md:h-auto">
                    <img
                        src={article.imageUrl}
                        alt={article.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                            // Set a fallback image if the original fails to load
                            (e.target as HTMLImageElement).src = 'fallback-image-url.jpg';
                        }}
                    />
                </div>
                <div className="md:w-2/3 p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <Card.Title className="text-2xl font-bold mb-1">
                                {article.title}
                            </Card.Title>
                            <Badge
                                bg={article.published ? 'success' : 'warning'}
                                className="mb-2 px-3 py-2 rounded-pill"
                            >
                                {article.published ? 'Published' : 'Draft'}
                            </Badge>
                        </div>
                    </div>

                    <Card.Text className="text-gray-600 mb-3">{article.snippet}</Card.Text>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                        <User size={16} className="mr-1" />
                        <span className="mr-4">{article.author}</span>
                        <Calendar size={16} className="mr-1" />
                        <span>{new Date(article.date).toLocaleDateString()}</span>
                    </div>

                    <div className="flex justify-between mt-4">
                        <Button
                            variant="outline-primary"
                            onClick={() => onEdit(article.id)}
                            disabled={loading}
                            className="flex-1 mr-2 py-2"
                        >
                            <Edit3 size={18} className="mr-2" /> Edit
                        </Button>

                        <Button
                            variant={article.published ? 'outline-warning' : 'outline-success'}
                            onClick={() => onToggleVisibility(article.id)}
                            disabled={loading}
                            className="flex-1 mr-2 py-2"
                        >
                            {article.published ? (
                                <>
                                    <EyeOff size={18} className="mr-2" /> Unpublish
                                </>
                            ) : (
                                <>
                                    <Eye size={18} className="mr-2" /> Publish
                                </>
                            )}
                        </Button>

                        <Button
                            variant="outline-danger"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                            className="flex-1 py-2"
                        >
                            <Trash2 size={18} className="mr-2" /> Delete
                        </Button>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete the article "{article.title}"? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default BlogArticleCard;