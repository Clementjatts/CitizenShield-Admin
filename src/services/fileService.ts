import { storage } from '../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL, deleteObject, list, ListResult } from 'firebase/storage';
import { handleFirebaseError } from '../utils/errorHandler';

interface UploadProgressCallback {
    (progress: number): void;
}

class FileService {
    private generateFileName(file: File, prefix: string): string {
        const timestamp = Date.now();
        const randomString = Math.random().toString(36).substring(2, 8);
        const extension = file.name.split('.').pop();
        return `${prefix}/${timestamp}-${randomString}.${extension}`;
    }

    async uploadFile(
        file: File,
        directory: string,
        onProgress?: UploadProgressCallback
    ): Promise<string> {
        try {
            const fileName = this.generateFileName(file, directory);
            const storageRef = ref(storage, fileName);

            // Upload the file
            const snapshot = await uploadBytes(storageRef, file);

            // Get the download URL
            const downloadURL = await getDownloadURL(snapshot.ref);

            return downloadURL;
        } catch (error) {
            throw new Error(handleFirebaseError(error));
        }
    }

    async deleteFile(fileUrl: string): Promise<void> {
        try {
            // Extract the path from the URL
            const fileRef = ref(storage, fileUrl);
            await deleteObject(fileRef);
        } catch (error) {
            throw new Error(handleFirebaseError(error));
        }
    }

    async getFilesInDirectory(directory: string): Promise<ListResult> {
        try {
            const directoryRef = ref(storage, directory);
            return await list(directoryRef);
        } catch (error) {
            throw new Error(handleFirebaseError(error));
        }
    }

    async uploadProfileImage(userId: string, file: File): Promise<string> {
        return this.uploadFile(file, `profiles/${userId}`);
    }

    async uploadBlogImage(blogId: string, file: File): Promise<string> {
        return this.uploadFile(file, `blog/${blogId}`);
    }

    async uploadForumImage(postId: string, file: File): Promise<string> {
        return this.uploadFile(file, `forum/${postId}`);
    }
}

export const fileService = new FileService();