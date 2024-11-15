import { auth, db } from '../config/firebaseConfig';
import { signInWithEmailAndPassword, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export const signIn = async (email: string, password: string) => {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

    if (!userDoc.exists() || userDoc.data().role !== 'admin') {
        await signOut(auth);
        throw new Error('Unauthorized access. Admin privileges required.');
    }

    return userCredential.user;
};

export const logOut = async () => {
    await signOut(auth);
};

export const updateUserPassword = async (currentPassword: string, newPassword: string) => {
    if (!auth.currentUser || !auth.currentUser.email) {
        throw new Error('No authenticated user found');
    }

    const credential = EmailAuthProvider.credential(
        auth.currentUser.email,
        currentPassword
    );

    await reauthenticateWithCredential(auth.currentUser, credential);
    await updatePassword(auth.currentUser, newPassword);
};

export const updateLastLogin = async (userId: string) => {
    try {
        await updateDoc(doc(db, 'users', userId), {
            lastLoginDate: new Date()
        });
    } catch (error) {
        console.error('Error updating last login:', error);
        // Don't throw - we don't want to interrupt the login flow
    }
};

// Listen to auth state changes
export const onAuthStateChanged = (callback: (user: any) => void) => {
    return auth.onAuthStateChanged(callback);
};