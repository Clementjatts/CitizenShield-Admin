import React, { useState } from 'react';
import { Card, Badge, Button, OverlayTrigger, Tooltip, Modal, Alert } from 'react-bootstrap';
import { Trash2, Unlock, Lock, FileText, Mail, Phone, Calendar, Shield, Key, Users } from 'lucide-react';
import { User } from '../../types/shared';
import { auth } from '../../config/firebaseConfig';
import { sendPasswordResetEmail } from 'firebase/auth';
import { handleFirebaseError } from '../../utils/errorHandler';
import defaultAvatar from '../../assets/avatar.png';

interface UserCardProps {
    user: User;
    onDelete: (id: number) => void;
    onSuspend: (id: number) => void;
    onUnsuspend: (id: number) => void;
    onResetPassword: (id: number) => void;
    onViewActivityLogs: (id: number) => void;
}

const UserCard: React.FC<UserCardProps> = ({
    user,
    onDelete,
    onSuspend,
    onUnsuspend,
    onResetPassword,
    onViewActivityLogs
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [imageError, setImageError] = useState(false);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const handlePasswordReset = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!user.email) throw new Error('No email address found for user');
            await sendPasswordResetEmail(auth, user.email);
            onResetPassword(user.id);
            // Changed from Alert.alert to displaying success message in the UI
            setError('Password reset email has been sent to the user.');  // You can use a separate success state if preferred
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            await onDelete(user.id);
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleSuspendToggle = async () => {
        try {
            if (user.suspended) {
                await onUnsuspend(user.id);
            } else {
                await onSuspend(user.id);
            }
            setShowSuspendConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    return (
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-200 overflow-hidden border-l-4"
            style={{ borderLeftColor: user.suspended ? 'var(--bs-danger)' : 'var(--bs-success)' }}>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <Card.Body className="p-4">
                <div className="flex items-start mb-4">
                    <div className="relative w-16 h-16 mr-4 rounded-full overflow-hidden bg-gray-100">
                        <img
                            src={!imageError ? (user.avatar || defaultAvatar) : defaultAvatar}
                            alt={`${user.name}'s avatar`}
                            className="w-full h-full object-cover"
                            onError={() => setImageError(true)}
                        />
                    </div>
                    <div className="flex-grow">
                        <div className="flex justify-between items-start">
                            <div>
                                <Card.Title className="text-xl font-bold mb-1">
                                    {user.name}
                                </Card.Title>
                                <Badge bg={user.role === 'Admin' ? 'primary' : 'secondary'}
                                    className="mr-2 px-3 py-2 rounded-pill d-inline-flex align-items-center">
                                    <Shield size={14} className="mr-1" />
                                    <span>{user.role}</span>
                                </Badge>
                                <Badge bg={user.suspended ? 'danger' : 'success'}
                                    className="px-3 py-2 rounded-pill">
                                    {user.suspended ? 'Suspended' : 'Active'}
                                </Badge>
                            </div>
                            <OverlayTrigger
                                placement="top"
                                overlay={<Tooltip id={`tooltip-${user.id}`}>Last login: {formatDate(user.lastLoginDate)}</Tooltip>}
                            >
                                <span className="text-sm text-gray-500 cursor-help d-inline-flex align-items-center">
                                    <Calendar size={14} className="mr-1" />
                                    <span>Registered: {formatDate(user.registrationDate)}</span>
                                </span>
                            </OverlayTrigger>
                        </div>
                        <div className="mt-2 text-gray-600">
                            <p className="mb-1">
                                <Mail size={14} className="mr-1 inline" />
                                {user.email}
                            </p>
                            {user.phoneNumber && (
                                <p>
                                    <Phone size={14} className="mr-1 inline" />
                                    {user.phoneNumber}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {user.emergencyContacts && user.emergencyContacts.length > 0 && (
                    <div className="mt-4 p-3 bg-light border rounded">
                        <h6 className="font-semibold mb-2 text-dark">
                            <Users size={14} className="mr-1 inline text-primary" />
                            Emergency Contacts:
                        </h6>
                        <div className="space-y-2">
                            {user.emergencyContacts.map((contact, index) => (
                                <div key={index} className="d-flex align-items-center justify-content-between p-2 bg-white border rounded shadow-sm">
                                    <div>
                                        <p className="mb-1 font-weight-bold text-dark">{contact.name}</p>
                                        <p className="mb-0 text-muted small">{contact.relationship}</p>
                                    </div>
                                    <div className="d-flex align-items-center text-primary">
                                        <Phone size={14} className="mr-1" />
                                        <span className="text-dark">{contact.phoneNumber}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </Card.Body>

            <Card.Footer className="bg-gray-50 p-3">
                <div className="flex flex-wrap justify-end">
                    <Button variant="outline-primary"
                        onClick={() => onViewActivityLogs(user.id)}
                        className="flex-1 mr-2 mb-2 py-2 d-inline-flex align-items-center justify-center">
                        <FileText size={18} />
                        <span className="ml-2">View Logs</span>
                    </Button>
                    <Button variant="outline-warning"
                        onClick={handlePasswordReset}
                        disabled={loading}
                        className="flex-1 mr-2 mb-2 py-2 d-inline-flex align-items-center justify-center">
                        <Key size={18} />
                        <span className="ml-2">{loading ? 'Resetting...' : 'Reset Password'}</span>
                    </Button>
                    <Button variant={user.suspended ? 'outline-success' : 'outline-danger'}
                        onClick={() => setShowSuspendConfirm(true)}
                        className="flex-1 mr-2 mb-2 py-2 d-inline-flex align-items-center justify-center">
                        {user.suspended ? (
                            <>
                                <Unlock size={18} />
                                <span className="ml-2">Unsuspend</span>
                            </>
                        ) : (
                            <>
                                <Lock size={18} />
                                <span className="ml-2">Suspend</span>
                            </>
                        )}
                    </Button>
                    <Button variant="outline-danger"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="flex-1 mb-2 py-2 d-inline-flex align-items-center justify-center">
                        <Trash2 size={18} />
                        <span className="ml-2">Delete</span>
                    </Button>
                </div>
            </Card.Footer>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete user {user.name}? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Suspend Confirmation Modal */}
            <Modal show={showSuspendConfirm} onHide={() => setShowSuspendConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm {user.suspended ? 'Unsuspend' : 'Suspend'}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to {user.suspended ? 'unsuspend' : 'suspend'} user {user.name}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowSuspendConfirm(false)}>
                        Cancel
                    </Button>
                    <Button variant={user.suspended ? 'success' : 'danger'} onClick={handleSuspendToggle}>
                        {user.suspended ? 'Unsuspend' : 'Suspend'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default UserCard;