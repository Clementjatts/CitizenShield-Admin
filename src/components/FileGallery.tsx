import React, { useState, useEffect, useCallback } from 'react';
import { Modal, Button, Card, Alert } from 'react-bootstrap';
import { Trash2, ExternalLink, Copy } from 'lucide-react';
import { fileService } from '../services/fileService';
import { handleFirebaseError } from '../utils/errorHandler';
import { getDownloadURL, getMetadata } from 'firebase/storage';

interface FileGalleryProps {
    directory: string;
    onSelect?: (url: string) => void;
    showSelect?: boolean;
}

interface FileItem {
    name: string;
    url: string;
    contentType: string;
}

const FileGallery: React.FC<FileGalleryProps> = ({
    directory,
    onSelect,
    showSelect = false
}) => {
    const [files, setFiles] = useState<FileItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const loadFiles = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const result = await fileService.getFilesInDirectory(directory);
            const filesList = await Promise.all(
                result.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    const metadata = await getMetadata(item);
                    return {
                        name: item.name,
                        url: url,
                        contentType: metadata.contentType || 'unknown'
                    };
                })
            );
            setFiles(filesList);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    }, [directory]);

    useEffect(() => {
        loadFiles();
    }, [loadFiles]);

    const handleDelete = async () => {
        if (!selectedFile) return;

        try {
            await fileService.deleteFile(selectedFile.url);
            setFiles(files.filter(f => f.url !== selectedFile.url));
            setSelectedFile(null);
            setShowDeleteModal(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleSelect = (file: FileItem) => {
        if (onSelect) {
            onSelect(file.url);
        }
    };

    const handleCopyUrl = async (url: string) => {
        try {
            await navigator.clipboard.writeText(url);
            alert('URL copied to clipboard!');
        } catch (err) {
            console.error('Failed to copy URL:', err);
        }
    };

    if (loading) {
        return <div>Loading files...</div>;
    }

    return (
        <div>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <div className="d-flex flex-wrap gap-3">
                {files.map((file, index) => (
                    <Card key={index} style={{ width: '200px' }}>
                        {file.contentType?.startsWith('image/') ? (
                            <Card.Img
                                variant="top"
                                src={file.url}
                                style={{ height: '150px', objectFit: 'cover' }}
                            />
                        ) : (
                            <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '150px' }}>
                                <span className="text-muted">{file.contentType}</span>
                            </div>
                        )}
                        <Card.Body>
                            <Card.Title className="text-truncate" style={{ fontSize: '0.9rem' }}>
                                {file.name}
                            </Card.Title>
                            <div className="d-flex gap-2">
                                {showSelect && (
                                    <Button
                                        variant="outline-primary"
                                        size="sm"
                                        onClick={() => handleSelect(file)}
                                    >
                                        Select
                                    </Button>
                                )}
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => handleCopyUrl(file.url)}
                                >
                                    <Copy size={14} />
                                </Button>
                                <Button
                                    variant="outline-secondary"
                                    size="sm"
                                    onClick={() => window.open(file.url, '_blank')}
                                >
                                    <ExternalLink size={14} />
                                </Button>
                                <Button
                                    variant="outline-danger"
                                    size="sm"
                                    onClick={() => {
                                        setSelectedFile(file);
                                        setShowDeleteModal(true);
                                    }}
                                >
                                    <Trash2 size={14} />
                                </Button>
                            </div>
                        </Card.Body>
                    </Card>
                ))}
            </div>

            {files.length === 0 && !loading && (
                <div className="text-center text-muted py-5">
                    No files found in this directory
                </div>
            )}

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete {selectedFile?.name}?
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>
                </Modal.Footer>
            </Modal>
        </div>
    );
};

export default FileGallery;