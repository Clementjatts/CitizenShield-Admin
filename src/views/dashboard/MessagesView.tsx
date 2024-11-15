import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button, Modal, Alert } from 'react-bootstrap';
import { Search, SortAsc, SortDesc } from 'lucide-react';
import MessageCard from '../../components/cards/MessageCard';
import { Message } from '../../types/shared';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, where, orderBy, onSnapshot, doc, getDoc, updateDoc, deleteDoc, getDocs, Timestamp } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';

interface MessagesViewProps {
    searchTerm: string;
}

interface UserData {
    fullName: string;
    email: string;
}

const MessagesView: React.FC<MessagesViewProps> = ({ searchTerm }) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [localSearchTerm, setLocalSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [showFlagged, setShowFlagged] = useState(false);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const [conversationMessages, setConversationMessages] = useState<{ content: string, timestamp: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setLocalSearchTerm(searchTerm);
    }, [searchTerm]);

    useEffect(() => {
        if (!auth.currentUser) {
            setError('Authentication required');
            setLoading(false);
            return;
        }

        try {
            const chatsRef = collection(db, 'chats');
            // Create base query with proper composite index order
            const baseQuery = showFlagged
                ? query(
                    chatsRef,
                    where('isFlagged', '==', true),
                    orderBy('lastMessageTimestamp', 'desc')
                )
                : query(
                    chatsRef,
                    orderBy('lastMessageTimestamp', sortOrder)
                );

            const unsubscribe = onSnapshot(baseQuery, async (snapshot) => {
                try {
                    const userDataCache = new Map<string, UserData>();

                    const getUserData = async (userId: string) => {
                        if (userDataCache.has(userId)) {
                            return userDataCache.get(userId)!;
                        }

                        const userDoc = await getDoc(doc(db, 'users', userId));
                        const userData = userDoc.data() as UserData;
                        userDataCache.set(userId, userData);
                        return userData;
                    };

                    const messagePromises = snapshot.docs.map(async (chatDoc) => {
                        const chatData = chatDoc.data();
                        const participants = chatData.participants || [];

                        // Skip if no participants or lastMessage
                        if (participants.length < 2 || !chatData.lastMessage) {
                            return null;
                        }

                        try {
                            const [sender, recipient] = await Promise.all([
                                getUserData(participants[0]),
                                getUserData(participants[1])
                            ]);

                            return {
                                id: chatDoc.id,
                                senderId: participants[0],
                                senderName: sender?.fullName || 'Unknown User',
                                recipientId: participants[1],
                                recipientName: recipient?.fullName || 'Unknown User',
                                content: chatData.lastMessage,
                                timestamp: chatData.lastMessageTimestamp?.toDate().toISOString() || new Date().toISOString(),
                                isFlagged: chatData.isFlagged || false
                            } as Message;
                        } catch (err) {
                            console.error('Error processing chat:', chatDoc.id, err);
                            return null;
                        }
                    });

                    const resolvedMessages = (await Promise.all(messagePromises))
                        .filter((message): message is Message => message !== null);

                    setMessages(resolvedMessages);
                    setLoading(false);
                } catch (err) {
                    console.error('Error processing messages:', err);
                    setError(handleFirebaseError(err));
                    setLoading(false);
                }
            }, (err) => {
                console.error('Snapshot error:', err);
                setError(handleFirebaseError(err));
                setLoading(false);
            });

            return () => unsubscribe();
        } catch (err) {
            console.error('Setup error:', err);
            setError(handleFirebaseError(err));
            setLoading(false);
        }
    }, [sortOrder, showFlagged]);

    const handleDeleteMessage = async (id: string) => {
        try {
            // First delete all messages in the chat
            const messagesRef = collection(db, 'chats', id, 'messages');
            const messagesSnapshot = await getDocs(messagesRef);
            const deletionPromises = messagesSnapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletionPromises);

            // Then delete the chat document
            await deleteDoc(doc(db, 'chats', id));
        } catch (err) {
            console.error('Delete error:', err);
            setError(handleFirebaseError(err));
        }
    };

    const handleFlagMessage = async (id: string) => {
        try {
            const chatRef = doc(db, 'chats', id);
            await updateDoc(chatRef, {
                isFlagged: true,
                flaggedAt: Timestamp.now()
            });
        } catch (err) {
            console.error('Flag error:', err);
            setError(handleFirebaseError(err));
        }
    };

    const handleClearFlag = async (id: string) => {
        try {
            const chatRef = doc(db, 'chats', id);
            await updateDoc(chatRef, {
                isFlagged: false,
                flaggedAt: null
            });
        } catch (err) {
            console.error('Clear flag error:', err);
            setError(handleFirebaseError(err));
        }
    };

    const handleViewFullMessage = async (message: Message) => {
        try {
            const chatRef = doc(db, 'chats', message.id);
            const messagesRef = collection(chatRef, 'messages');
            const q = query(messagesRef, orderBy('timestamp', 'asc'));

            const messagesSnapshot = await getDocs(q);
            const messages = messagesSnapshot.docs.map(doc => ({
                content: doc.data().content || '',
                timestamp: doc.data().timestamp?.toDate().toISOString() || new Date().toISOString()
            }));

            setConversationMessages(messages);
            setSelectedMessage(message);

            // Mark chat as read
            await updateDoc(chatRef, { read: true });
        } catch (err) {
            console.error('View message error:', err);
            setError(handleFirebaseError(err));
        }
    };

    const filteredMessages = messages.filter(message => {
        const searchText = (localSearchTerm + ' ' + searchTerm).toLowerCase();
        return (
            message.senderName.toLowerCase().includes(searchText) ||
            message.recipientName.toLowerCase().includes(searchText) ||
            message.content.toLowerCase().includes(searchText)
        );
    });

    if (loading) {
        return <div>Loading messages...</div>;
    }

    return (
        <div>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <Form className="mb-4">
                <InputGroup>
                    <Form.Control
                        type="text"
                        placeholder="Search messages..."
                        value={localSearchTerm}
                        onChange={(e) => setLocalSearchTerm(e.target.value)}
                    />
                    <Button variant="outline-secondary">
                        <Search size={18} />
                    </Button>
                </InputGroup>
            </Form>

            <div className="mb-4 d-flex justify-content-between align-items-center">
                <Form.Check
                    type="switch"
                    id="flagged-switch"
                    label="Show only flagged messages"
                    checked={showFlagged}
                    onChange={(e) => setShowFlagged(e.target.checked)}
                />
                <Button
                    variant="outline-secondary"
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                >
                    {sortOrder === 'asc' ? <SortAsc size={18} /> : <SortDesc size={18} />}
                    Sort by {sortOrder === 'asc' ? 'oldest' : 'newest'}
                </Button>
            </div>

            {filteredMessages.length === 0 ? (
                <Alert variant="info">
                    No messages found {searchTerm && 'matching your search criteria'}.
                </Alert>
            ) : (
                filteredMessages.map((message) => (
                    <MessageCard
                        key={message.id}
                        message={message}
                        onDelete={handleDeleteMessage}
                        onFlag={handleFlagMessage}
                        onClearFlag={handleClearFlag}
                        onViewFullMessage={handleViewFullMessage}
                    />
                ))
            )}

            <Modal
                show={!!selectedMessage}
                onHide={() => setSelectedMessage(null)}
                size="lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title>Message Details</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedMessage && (
                        <>
                            <div className="mb-3">
                                <p><strong>From:</strong> {selectedMessage.senderName}</p>
                                <p><strong>To:</strong> {selectedMessage.recipientName}</p>
                            </div>
                            <hr />
                            <div className="conversation-messages" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                {conversationMessages.map((msg, index) => (
                                    <div key={index} className="message-item mb-3">
                                        <p className="text-muted mb-1" style={{ fontSize: '0.8rem' }}>
                                            {new Date(msg.timestamp).toLocaleString()}
                                        </p>
                                        <p className="mb-0">{msg.content}</p>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    {selectedMessage?.isFlagged && (
                        <Button
                            variant="warning"
                            onClick={() => selectedMessage && handleClearFlag(selectedMessage.id)}
                        >
                            Clear Flag
                        </Button>
                    )}
                    <Button variant="secondary" onClick={() => setSelectedMessage(null)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default MessagesView;