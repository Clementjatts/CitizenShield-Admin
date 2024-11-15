import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Alert } from 'react-bootstrap';
import { Trash2, MessageSquare, ThumbsUp, Calendar, User } from 'lucide-react';
import { ForumPost, Comment } from '../../types/shared';
import { handleFirebaseError } from '../../utils/errorHandler';

interface ForumPostCardProps {
    post: ForumPost;
    onDelete: (id: number) => Promise<void>;
    onDeleteComment: (postId: number, commentId: number) => Promise<void>;
}

const ForumPostCard: React.FC<ForumPostCardProps> = ({
    post,
    onDelete,
    onDeleteComment
}) => {
    const [showComments, setShowComments] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await onDelete(post.id);
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: number) => {
        setLoading(true);
        setError(null);
        try {
            await onDeleteComment(post.id, commentId);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const renderComment = (comment: Comment) => (
        <div key={comment.id} className="border-bottom mb-3 pb-3">
            <div className="d-flex justify-content-between align-items-center mb-2">
                <div className="d-flex align-items-center">
                    <User size={16} className="mr-2" />
                    <span className="font-weight-bold">{comment.author}</span>
                    {comment.isAdminComment && (
                        <Badge bg="primary" className="ml-2">Admin</Badge>
                    )}
                </div>
                <small className="text-muted">{formatDate(comment.date)}</small>
            </div>
            <p className="mb-2">{comment.content}</p>
            <div className="d-flex justify-content-end">
                <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                    disabled={loading}
                >
                    <Trash2 size={14} className="mr-1" />
                    Delete
                </Button>
            </div>
        </div>
    );

    return (
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-200">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-3">
                    <div>
                        <h5 className="mb-1">{post.title}</h5>
                        <div className="d-flex align-items-center text-muted small">
                            <User size={14} className="mr-1" />
                            <span className="mr-3">{post.author}</span>
                            <Calendar size={14} className="mr-1" />
                            <span>{formatDate(post.date)}</span>
                        </div>
                    </div>
                    {post.isAdminPost && (
                        <Badge bg="primary">Admin Post</Badge>
                    )}
                </div>

                <Card.Text>{post.content}</Card.Text>

                <div className="d-flex align-items-center mt-3">
                    <div className="d-flex align-items-center mr-4">
                        <ThumbsUp size={16} className="mr-1" />
                        <span>{post.likes}</span>
                    </div>
                    <div className="d-flex align-items-center">
                        <MessageSquare size={16} className="mr-1" />
                        <span>{post.comments.length}</span>
                    </div>
                </div>

                <div className="d-flex justify-content-end mt-3">
                    <Button
                        variant="outline-primary"
                        className="mr-2"
                        onClick={() => setShowComments(!showComments)}
                    >
                        <MessageSquare size={16} className="mr-1" />
                        {showComments ? 'Hide Comments' : 'View Comments'}
                    </Button>
                    <Button
                        variant="outline-danger"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={loading}
                    >
                        <Trash2 size={16} className="mr-1" />
                        Delete Post
                    </Button>
                </div>

                {showComments && (
                    <div className="mt-4">
                        <h6 className="mb-3">Comments ({post.comments.length})</h6>
                        {post.comments.length > 0 ? (
                            post.comments.map(comment => renderComment(comment))
                        ) : (
                            <p className="text-muted">No comments yet.</p>
                        )}
                    </div>
                )}
            </Card.Body>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this post? This action cannot be undone.
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

export default ForumPostCard;