import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import Select from 'react-select';
import { db } from '../../config/firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface CreateNotificationFormProps {
    onSubmit: (notificationData: {
        title: string;
        message: string;
        targetUserId?: string;
        targetUserName?: string;
        timestamp: Date;
        audience: "All Users" | "Individual User";
    }) => void;
    onCancel: () => void;
}

interface UserOption {
    value: string;
    label: string;
}

const CreateNotificationForm: React.FC<CreateNotificationFormProps> = ({ onSubmit, onCancel }) => {
    const [notificationData, setNotificationData] = useState({
        title: '',
        message: '',
        isIndividualUser: false,
        targetUser: null as UserOption | null,
    });
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef, where('suspended', '==', false));
                const querySnapshot = await getDocs(q);

                const userOptions: UserOption[] = [];
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    userOptions.push({
                        value: doc.id,
                        label: userData.fullName || userData.email,
                    });
                });

                setUsers(userOptions);
            } catch (error) {
                const errorMessage = handleFirebaseError(error);
                setError(errorMessage);
            }
        };

        fetchUsers();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            if (!notificationData.title.trim() || !notificationData.message.trim()) {
                throw new Error('Title and message are required');
            }

            const formData = {
                title: notificationData.title,
                message: notificationData.message,
                timestamp: new Date(),
                audience: notificationData.isIndividualUser ? "Individual User" as const : "All Users" as const,
                ...(notificationData.isIndividualUser && notificationData.targetUser ? {
                    targetUserId: notificationData.targetUser.value,
                    targetUserName: notificationData.targetUser.label,
                } : {}),
            };

            await onSubmit(formData);
        } catch (error) {
            const errorMessage = handleFirebaseError(error);
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-4 shadow-lg">
            <Card.Body>
                <Card.Title>Create New Notification</Card.Title>
                {error && (
                    <Alert variant="danger" onClose={() => setError(null)} dismissible>
                        {error}
                    </Alert>
                )}
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>Title</Form.Label>
                        <Form.Control
                            type="text"
                            value={notificationData.title}
                            onChange={(e) => setNotificationData(prev => ({ ...prev, title: e.target.value }))}
                            required
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Message</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={4}
                            value={notificationData.message}
                            onChange={(e) => setNotificationData(prev => ({ ...prev, message: e.target.value }))}
                            required
                            disabled={loading}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Check
                            type="checkbox"
                            label="Send to individual user"
                            checked={notificationData.isIndividualUser}
                            onChange={(e) => setNotificationData(prev => ({
                                ...prev,
                                isIndividualUser: e.target.checked,
                                targetUser: null
                            }))}
                            disabled={loading}
                        />
                    </Form.Group>

                    {notificationData.isIndividualUser && (
                        <Form.Group className="mb-3">
                            <Form.Label>Select User</Form.Label>
                            <Select
                                value={notificationData.targetUser}
                                onChange={(selected) => setNotificationData(prev => ({
                                    ...prev,
                                    targetUser: selected as UserOption
                                }))}
                                options={users}
                                isDisabled={loading}
                                isClearable
                                isSearchable
                                placeholder="Search and select user..."
                            />
                        </Form.Group>
                    )}

                    <div className="d-flex justify-content-end">
                        <Button
                            variant="secondary"
                            onClick={onCancel}
                            className="me-2"
                            disabled={loading}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="primary"
                            type="submit"
                            disabled={loading || (notificationData.isIndividualUser && !notificationData.targetUser)}
                        >
                            {loading ? 'Creating...' : 'Create Notification'}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default CreateNotificationForm;