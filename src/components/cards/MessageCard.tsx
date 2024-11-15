import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Alert } from 'react-bootstrap';
import { Trash2, Flag, CheckSquare, Eye } from 'lucide-react';
import { Message } from '../../types/shared';
import { handleFirebaseError } from '../../utils/errorHandler';

interface MessageCardProps {
    message: Message;
    onDelete: (id: string) => void;
    onFlag: (id: string) => void;
    onClearFlag: (id: string) => void;
    onViewFullMessage: (message: Message) => void;
}

const MessageCard: React.FC<MessageCardProps> = ({
    message,
    onDelete,
    onFlag,
    onClearFlag,
    onViewFullMessage
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const truncate = (str: string, n: number) => {
        return str.length > n ? str.substr(0, n - 1) + '...' : str;
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await onDelete(message.id);
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleFlag = async () => {
        setLoading(true);
        setError(null);
        try {
            await onFlag(message.id);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleClearFlag = async () => {
        setLoading(true);
        setError(null);
        try {
            await onClearFlag(message.id);
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

            <Card.Body className="p-4">
                <div className="flex justify-between items-start mb-3">
                    <div>
                        <h5 className="text-lg font-semibold">
                            {message.senderName} → {message.recipientName}
                        </h5>
                        <p className="text-sm text-gray-500">
                            {new Date(message.timestamp).toLocaleString()}
                        </p>
                    </div>
                    {message.isFlagged && (
                        <Badge bg="warning" className="ml-2">Flagged</Badge>
                    )}
                </div>

                <Card.Text className="text-gray-600 mb-3">
                    {truncate(message.content, 100)}
                </Card.Text>

                <div className="flex justify-end space-x-2">
                    <Button
                        variant="outline-primary"
                        onClick={() => onViewFullMessage(message)}
                        disabled={loading}
                        className="flex items-center"
                    >
                        <Eye size={18} className="mr-2" />
                        View Full
                    </Button>

                    {message.isFlagged ? (
                        <Button
                            variant="outline-success"
                            onClick={handleClearFlag}
                            disabled={loading}
                            className="flex items-center"
                        >
                            <CheckSquare size={18} className="mr-2" />
                            Clear Flag
                        </Button>
                    ) : (
                        <Button
                            variant="outline-warning"
                            onClick={handleFlag}
                            disabled={loading}
                            className="flex items-center"
                        >
                            <Flag size={18} className="mr-2" />
                            Flag
                        </Button>
                    )}

                    <Button
                        variant="outline-danger"
                        onClick={() => setShowDeleteConfirm(true)}
                        disabled={loading}
                        className="flex items-center"
                    >
                        <Trash2 size={18} className="mr-2" />
                        Delete
                    </Button>
                </div>
            </Card.Body>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this message? This action cannot be undone.
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

export default MessageCard;