import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Alert } from 'react-bootstrap';
import { Bell, User, Users, Trash2 } from 'lucide-react';
import { Notification } from '../../types/shared';
import { handleFirebaseError } from '../../utils/errorHandler';

interface NotificationCardProps {
  notification: Notification;
  onDelete: (id: number) => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({ notification, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setLoading(true);
    setError(null);
    try {
      await onDelete(notification.id);
      setShowDeleteConfirm(false);
    } catch (err) {
      setError(handleFirebaseError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-l-4 border-blue-500">
      {error && (
        <Alert variant="danger" onClose={() => setError(null)} dismissible>
          {error}
        </Alert>
      )}

      <Card.Body className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-grow">
            <Card.Title className="text-xl font-bold mb-1">
              {notification.title}
            </Card.Title>
            <Badge
              bg={notification.targetUserId ? 'info' : 'primary'}
              className="mb-2 px-3 py-2 rounded-pill d-inline-flex align-items-center"
            >
              {notification.targetUserId ? (
                <>
                  <User size={14} className="mr-1" />
                  <span className="ml-1">Individual User</span>
                </>
              ) : (
                <>
                  <Users size={14} className="mr-1" />
                  <span className="ml-1">All Users</span>
                </>
              )}
            </Badge>
            {notification.targetUserName && (
              <Badge bg="secondary" className="ml-2">
                To: {notification.targetUserName}
              </Badge>
            )}
          </div>
          <Bell size={24} className="text-blue-500" />
        </div>

        <Card.Text className="text-gray-600 mb-3">
          {notification.message}
        </Card.Text>

        <div className="flex items-center text-sm text-gray-500 mb-3">
          <span>{new Date(notification.timestamp).toLocaleString()}</span>
        </div>

        <div className="flex justify-end mt-4">
          <Button
            variant="outline-danger"
            onClick={() => setShowDeleteConfirm(true)}
            disabled={loading}
            className="py-2 px-4 d-inline-flex align-items-center"
          >
            <Trash2 size={18} />
            <span className="ml-2">Delete</span>
          </Button>
        </div>
      </Card.Body>

      <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Delete</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to delete this notification? This action cannot be undone.
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

export default NotificationCard;