import React, { useState, useRef } from 'react';
import { Button, ProgressBar, Alert } from 'react-bootstrap';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import { fileService } from '../services/fileService';

interface FileUploaderProps {
    onFileUpload: (url: string) => void;
    directory: string;
    acceptedFileTypes?: string;
    maxSizeInMB?: number;
    currentFile?: string;
    buttonText?: string;
}

const FileUploader: React.FC<FileUploaderProps> = ({
    onFileUpload,
    directory,
    acceptedFileTypes = "image/*",
    maxSizeInMB = 5,
    currentFile,
    buttonText = "Upload File"
}) => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [preview, setPreview] = useState<string | null>(currentFile || null);
    const [progress, setProgress] = useState<number>(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        setError(null);
        const file = event.target.files?.[0];

        if (!file) return;

        // Check file size
        if (file.size > maxSizeInMB * 1024 * 1024) {
            setError(`File size must be less than ${maxSizeInMB}MB`);
            return;
        }

        // Check file type
        if (!file.type.match(acceptedFileTypes.replace(/\*/g, '.*'))) {
            setError(`Only ${acceptedFileTypes} files are allowed`);
            return;
        }

        setSelectedFile(file);

        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setLoading(true);
        setError(null);

        try {
            // If there's a current file, delete it first
            if (currentFile) {
                await fileService.deleteFile(currentFile);
            }

            const downloadURL = await fileService.uploadFile(
                selectedFile,
                directory,
                (progress) => setProgress(progress)
            );

            onFileUpload(downloadURL);
            setProgress(0);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred during upload');
        } finally {
            setLoading(false);
        }
    };

    const handleClear = () => {
        setSelectedFile(null);
        setPreview(null);
        setProgress(0);
        setError(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div className="file-uploader">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <div className="mb-3">
                <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept={acceptedFileTypes}
                    style={{ display: 'none' }}
                />

                <div className="d-flex gap-2 mb-3">
                    <Button
                        variant="outline-primary"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                    >
                        <ImageIcon size={18} className="me-2" />
                        {buttonText}
                    </Button>

                    {selectedFile && (
                        <Button
                            variant="outline-danger"
                            onClick={handleClear}
                            disabled={loading}
                        >
                            <X size={18} className="me-2" />
                            Clear
                        </Button>
                    )}
                </div>

                {selectedFile && (
                    <div className="selected-file mb-3">
                        <small className="text-muted">
                            Selected: {selectedFile.name} ({(selectedFile.size / 1024 / 1024).toFixed(2)}MB)
                        </small>
                    </div>
                )}
            </div>

            {preview && (
                <div className="preview-container mb-3">
                    <img
                        src={preview}
                        alt="Preview"
                        style={{
                            maxWidth: '200px',
                            maxHeight: '200px',
                            objectFit: 'cover',
                            borderRadius: '4px'
                        }}
                    />
                </div>
            )}

            {progress > 0 && progress < 100 && (
                <ProgressBar
                    now={progress}
                    label={`${progress}%`}
                    className="mb-3"
                />
            )}

            {selectedFile && !loading && (
                <Button
                    variant="primary"
                    onClick={handleUpload}
                    disabled={!selectedFile || loading}
                >
                    <Upload size={18} className="me-2" />
                    Upload
                </Button>
            )}
        </div>
    );
};

export default FileUploader;