import React, { useState, useEffect } from 'react';
import { Button, Alert } from 'react-bootstrap';
import { Bell } from 'lucide-react';
import NotificationCard from '../../components/cards/NotificationCard';
import CreateNotificationForm from '../forms/CreateNotificationForm';
import { Notification } from '../../types/shared';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, addDoc, doc, deleteDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface NotificationsViewProps {
    searchTerm: string;
}

const NotificationsView: React.FC<NotificationsViewProps> = ({ searchTerm }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const notificationsRef = collection(db, 'notifications');
        const q = query(notificationsRef, orderBy('timestamp', 'desc'));

        const unsubscribe = onSnapshot(q, (snapshot) => {
            try {
                const notificationsList = snapshot.docs.map(doc => ({
                    id: parseInt(doc.id),
                    title: doc.data().title,
                    message: doc.data().message,
                    audience: doc.data().audience,
                    targetUserId: doc.data().targetUserId,
                    targetUserName: doc.data().targetUserName,
                    timestamp: doc.data().timestamp?.toDate() || new Date(),
                    read: doc.data().read || false
                }));

                setNotifications(notificationsList);
                setLoading(false);
            } catch (error) {
                setError(handleFirebaseError(error));
                setLoading(false);
            }
        }, (error) => {
            setError(handleFirebaseError(error));
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const handleDeleteNotification = async (id: number) => {
        try {
            await deleteDoc(doc(db, 'notifications', id.toString()));
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleCreateNotification = async (notificationData: Omit<Notification, 'id' | 'date'>) => {
        try {
            const newNotification = {
                ...notificationData,
                date: new Date().toISOString(),
                createdAt: new Date(),
                createdBy: auth.currentUser?.uid || 'system',
            };

            await addDoc(collection(db, 'notifications'), newNotification);
            setShowCreateForm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const filteredNotifications = notifications.filter(notification =>
        notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        notification.audience.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Loading notifications...</div>;
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
                <Bell size={18} className="mr-2" />
                <span>Create Notification</span>
            </Button>

            {showCreateForm && (
                <CreateNotificationForm
                    onSubmit={handleCreateNotification}
                    onCancel={() => setShowCreateForm(false)}
                />
            )}

            {filteredNotifications.length === 0 ? (
                <Alert variant="info">
                    No notifications found matching your search.
                </Alert>
            ) : (
                filteredNotifications.map(notification => (
                    <NotificationCard
                        key={notification.id}
                        notification={notification}
                        onDelete={handleDeleteNotification}
                    />
                ))
            )}
        </div>
    );
};

export default NotificationsView;