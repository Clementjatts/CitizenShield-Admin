import { storage } from '../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';

export const uploadFile = async (file: File, path: string) => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
};

export const deleteFile = async (path: string) => {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
};

export const uploadBlogImage = async (file: File, blogId: string) => {
    const path = `blog/${blogId}/${file.name}`;
    return uploadFile(file, path);
};

export const uploadUserAvatar = async (file: File, userId: string) => {
    const path = `avatars/${userId}/${file.name}`;
    return uploadFile(file, path);
};

export const deleteBlogImage = async (path: string) => {
    await deleteFile(path);
};

export const deleteUserAvatar = async (path: string) => {
    await deleteFile(path);
};