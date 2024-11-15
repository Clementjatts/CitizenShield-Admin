import React, { useState, useEffect } from 'react';
import { Alert } from 'react-bootstrap';
import UserCard from '../../components/cards/UserCard';
import { User } from '../../types/shared';
import { auth, db } from '../../config/firebaseConfig';
import { collection, query, getDocs, where, deleteDoc, doc, updateDoc } from 'firebase/firestore';
import { handleFirebaseError } from '../../utils/errorHandler';
import { sendPasswordResetEmail } from 'firebase/auth';

interface UsersViewProps {
    searchTerm: string;
}

const UsersView: React.FC<UsersViewProps> = ({ searchTerm }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const usersRef = collection(db, 'users');
                const q = query(usersRef);
                const querySnapshot = await getDocs(q);
                const usersList: User[] = [];

                await Promise.all(querySnapshot.docs.map(async (doc, index) => {
                    const data = doc.data();
                    const userName = data.fullName || data.name || 'Unnamed User';

                    // Fetch emergency contacts for this user
                    const emergencyContactsRef = collection(db, 'emergencyContacts');
                    const emergencyQuery = query(emergencyContactsRef, where('userId', '==', doc.id));
                    const emergencySnapshot = await getDocs(emergencyQuery);

                    const emergencyContacts = emergencySnapshot.docs.map(contactDoc => ({
                        name: contactDoc.data().name,
                        phoneNumber: contactDoc.data().phoneNumber,
                        relationship: contactDoc.data().relationship
                    }));

                    usersList.push({
                        id: index + 1,
                        docId: doc.id,
                        name: userName,
                        email: data.email || '',
                        role: data.role || 'User',
                        suspended: data.suspended || false,
                        avatar: data.profileImageUrl || null,
                        registrationDate: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
                        lastLoginDate: data.lastLoginDate?.toDate?.()?.toISOString() || new Date().toISOString(),
                        phoneNumber: data.phoneNumber || '',
                        password: '',
                        emergencyContacts: emergencyContacts
                    });
                }));

                setUsers(usersList);
                setLoading(false);
            } catch (error) {
                const errorMessage = handleFirebaseError(error);
                setError(errorMessage);
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    const handleDeleteUser = async (id: number) => {
        try {
            const userToDelete = users.find(user => user.id === id);
            if (!userToDelete || !userToDelete.docId) {
                throw new Error('User not found');
            }

            await deleteDoc(doc(db, 'users', userToDelete.docId));
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleSuspendUser = async (id: number) => {
        try {
            const userToUpdate = users.find(user => user.id === id);
            if (!userToUpdate || !userToUpdate.docId) {
                throw new Error('User not found');
            }

            await updateDoc(doc(db, 'users', userToUpdate.docId), {
                suspended: true
            });
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleUnsuspendUser = async (id: number) => {
        try {
            const userToUpdate = users.find(user => user.id === id);
            if (!userToUpdate || !userToUpdate.docId) {
                throw new Error('User not found');
            }

            await updateDoc(doc(db, 'users', userToUpdate.docId), {
                suspended: false
            });
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleResetUserPassword = async (id: number) => {
        try {
            const user = users.find(u => u.id === id);
            if (user?.email) {
                await sendPasswordResetEmail(auth, user.email);
                setError('Password reset email has been sent.');
            }
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleViewActivityLogs = async (id: number) => {
        try {
            console.log(`Viewing logs for user ${id}`);
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const filteredUsers = users.filter(user =>
        (user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
        (user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
    );

    if (loading) {
        return <div>Loading users...</div>;
    }

    return (
        <div>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                    <UserCard
                        key={user.id}
                        user={user}
                        onDelete={handleDeleteUser}
                        onSuspend={handleSuspendUser}
                        onUnsuspend={handleUnsuspendUser}
                        onResetPassword={handleResetUserPassword}
                        onViewActivityLogs={handleViewActivityLogs}
                    />
                ))
            ) : (
                <Alert variant="info">
                    No users found {searchTerm && 'matching your search criteria'}.
                </Alert>
            )}
        </div>
    );
};

export default UsersView;