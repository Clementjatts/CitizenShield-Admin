import React, { useState, useRef, useEffect } from 'react';
import { Form, Button, Card, Alert } from 'react-bootstrap';
import { storage, auth, db } from '../../config/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { handleFirebaseError } from '../../utils/errorHandler';
import { BlogArticle } from '../../types/shared';
import { getDoc, doc } from 'firebase/firestore';

interface CreateArticleFormProps {
    onSubmit: (articleData: {
        title: string;
        snippet: string;
        content: string;
        imageUrl: string;
        published: boolean;
        author?: string;
        createdAt?: Date;
    }) => void;
    onCancel: () => void;
    editingArticle?: BlogArticle | null;
}

const CreateArticleForm: React.FC<CreateArticleFormProps> = ({ onSubmit, onCancel, editingArticle }) => {
    const [articleData, setArticleData] = useState({
        title: editingArticle?.title || '',
        snippet: editingArticle?.snippet || '',
        content: editingArticle?.content || '',
        imageUrl: editingArticle?.imageUrl || '',
        published: editingArticle?.published || false,
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string>(editingArticle?.imageUrl || '');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maxFileSizeInMB = 5;

    useEffect(() => {
        // Cleanup preview URL when component unmounts
        return () => {
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
        };
    }, [previewUrl]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setArticleData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
        }));
        setError(null);
    };

    const validateFile = (file: File): boolean => {
        // Check file size
        if (file.size > maxFileSizeInMB * 1024 * 1024) {
            setError(`File size must be less than ${maxFileSizeInMB}MB`);
            return false;
        }

        // Check file type
        if (!file.type.startsWith('image/')) {
            setError('Only image files are allowed');
            return false;
        }

        return true;
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (!validateFile(file)) {
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }

            setSelectedFile(file);

            // Create and set preview URL
            const preview = URL.createObjectURL(file);
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
            }
            setPreviewUrl(preview);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            let imageUrl = articleData.imageUrl;

            if (selectedFile) {
                try {
                    // Sanitize filename - remove special characters and spaces
                    const cleanFileName = selectedFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const filename = `blog-images/${Date.now()}-${cleanFileName}`;
                    const storageRef = ref(storage, filename);

                    // Add metadata to indicate it's an image
                    const metadata = {
                        contentType: selectedFile.type,
                        customMetadata: {
                            'createdBy': auth.currentUser?.uid || 'unknown',
                            'uploadTime': new Date().toISOString()
                        }
                    };

                    // Upload the file with metadata
                    const uploadResult = await uploadBytes(storageRef, selectedFile, metadata);
                    imageUrl = await getDownloadURL(uploadResult.ref);
                    console.log('Uploaded image URL:', imageUrl); // For debugging
                } catch (error) {
                    console.error('Error uploading image:', error);
                    throw error;
                }
            }

            // Fetch admin's full name
            const adminDoc = await getDoc(doc(db, 'users', auth.currentUser?.uid || ''));
            const adminData = adminDoc.data();
            const authorName = `${adminData?.fullName || adminData?.name || 'Unknown'} (Admin)`;

            await onSubmit({
                ...articleData,
                imageUrl,
                author: authorName,
                createdAt: new Date()
            });

            // Clear form after successful submission
            setArticleData({
                title: '',
                snippet: '',
                content: '',
                imageUrl: '',
                published: false
            });
            setSelectedFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            if (previewUrl && previewUrl.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrl);
                setPreviewUrl('');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveImage = () => {
        setSelectedFile(null);
        setArticleData(prev => ({ ...prev, imageUrl: '' }));
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        if (previewUrl && previewUrl.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl('');
    };

    return (
        <Card className="mb-4 shadow-lg">
            <Card.Body>
                <Card.Title>{editingArticle ? 'Edit Article' : 'Create New Article'}</Card.Title>
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
                            name="title"
                            value={articleData.title}
                            onChange={handleInputChange}
                            required
                            disabled={loading}
                            placeholder="Enter article title"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Snippet (Short Description)</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="snippet"
                            value={articleData.snippet}
                            onChange={handleInputChange}
                            required
                            rows={2}
                            disabled={loading}
                            placeholder="Enter a brief description of the article"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Content</Form.Label>
                        <Form.Control
                            as="textarea"
                            name="content"
                            value={articleData.content}
                            onChange={handleInputChange}
                            required
                            rows={10}
                            disabled={loading}
                            placeholder="Enter the main content of your article"
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Article Image</Form.Label>
                        <div className="d-flex align-items-center mb-2">
                            <Form.Control
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                ref={fileInputRef}
                                disabled={loading}
                            />
                            {(previewUrl || articleData.imageUrl) && (
                                <Button
                                    variant="outline-danger"
                                    onClick={handleRemoveImage}
                                    className="ms-2"
                                    disabled={loading}
                                >
                                    Remove
                                </Button>
                            )}
                        </div>
                        {previewUrl && (
                            <div className="mt-2 position-relative" style={{ maxWidth: '200px' }}>
                                <img
                                    src={previewUrl}
                                    alt="Preview"
                                    className="img-fluid rounded"
                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                        {!previewUrl && articleData.imageUrl && (
                            <div className="mt-2 position-relative" style={{ maxWidth: '200px' }}>
                                <img
                                    src={articleData.imageUrl}
                                    alt="Current"
                                    className="img-fluid rounded"
                                    style={{ maxHeight: '200px', objectFit: 'cover' }}
                                />
                            </div>
                        )}
                    </Form.Group>

                    <Form.Group className="mb-4">
                        <Form.Check
                            type="checkbox"
                            label="Publish immediately"
                            name="published"
                            checked={articleData.published}
                            onChange={(e) => handleInputChange(e)}
                            disabled={loading}
                            id="publish-checkbox"
                        />
                    </Form.Group>

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
                            disabled={loading}
                        >
                            {loading ? 'Saving...' : (editingArticle ? 'Save Changes' : 'Create Article')}
                        </Button>
                    </div>
                </Form>
            </Card.Body>
        </Card>
    );
};

export default CreateArticleForm;