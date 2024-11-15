import React, { useState } from 'react';
import { Card, Badge, Button, Modal, Alert } from 'react-bootstrap';
import { Trash2, CheckCircle, MapPin, Clock, User } from 'lucide-react';
import MapView from '../map/MapView';
import { Alert as AlertType } from '../../types/shared';
import { handleFirebaseError } from '../../utils/errorHandler';

interface AlertCardProps {
    alert: AlertType;
    onDelete: (id: number) => void;
    onResolve: (id: number) => void;
    setMapCenter: (coords: [number, number], zoom: number) => void;
}

const AlertCard: React.FC<AlertCardProps> = ({
    alert,
    onDelete,
    onResolve,
    setMapCenter
}) => {
    const [showMap, setShowMap] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'High': return 'danger';
            case 'Medium': return 'warning';
            case 'Low': return 'success';
            default: return 'primary';
        }
    };

    const getStatusColor = (status: string) => {
        return status === 'Active' ? 'danger' : 'success';
    };

    const getTimeElapsed = (timestamp: string) => {
        const now = new Date();
        const alertTime = new Date(timestamp);
        const diff = now.getTime() - alertTime.getTime();
        const hours = Math.floor(diff / 3600000);
        const minutes = Math.floor((diff % 3600000) / 60000);
        return `${hours}h ${minutes}m ago`;
    };

    const handleMapClick = () => {
        setShowMap(!showMap);
        setMapCenter([alert.latitude, alert.longitude], 16);
    };

    const handleDelete = async () => {
        setLoading(true);
        setError(null);
        try {
            await onDelete(alert.id);
            setShowDeleteConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    const handleResolve = async () => {
        setLoading(true);
        setError(null);
        try {
            await onResolve(alert.id);
            setShowResolveConfirm(false);
        } catch (err) {
            setError(handleFirebaseError(err));
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="mb-4 shadow-lg hover:shadow-xl transition-shadow duration-200 border-l-4"
            style={{ borderLeftColor: `var(--bs-${getPriorityColor(alert.priority)})` }}>
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            {showMap && (
                <MapView
                    alerts={[alert]}
                    center={[alert.latitude, alert.longitude]}
                    zoom={16}
                    onClose={() => setShowMap(false)}
                />
            )}

            <Card.Body className="p-0">
                <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                        <div>
                            <Card.Title className="text-2xl font-bold mb-1">{alert.type} Alert</Card.Title>
                            <Badge
                                bg={getStatusColor(alert.status)}
                                className="mr-2 px-3 py-2 rounded-pill"
                            >
                                {alert.status}
                            </Badge>
                            <Badge
                                bg={getPriorityColor(alert.priority)}
                                className="px-3 py-2 rounded-pill"
                            >
                                {alert.priority} Priority
                            </Badge>
                        </div>
                        <Button
                            variant="link"
                            onClick={handleMapClick}
                            className="text-primary"
                        >
                            <MapPin size={20} />
                        </Button>
                    </div>

                    <p className="text-gray-600 mb-3">{alert.description}</p>

                    <div className="flex items-center text-sm text-gray-500 mb-3">
                        <Clock size={16} className="mr-1" />
                        <span>{getTimeElapsed(alert.timestamp)}</span>
                        <User size={16} className="ml-4 mr-1" />
                        <span>{alert.initiatorName}</span>
                    </div>

                    <div className="mb-3">
                        <p><strong>Location:</strong> {alert.location}</p>
                        <p><strong>Latitude:</strong> {alert.latitude}</p>
                        <p><strong>Longitude:</strong> {alert.longitude}</p>
                    </div>
                </div>

                <div className="bg-gray-100 p-4 rounded-b-lg">
                    <div className="flex justify-between">
                        <Button
                            variant="outline-danger"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                            className="flex-1 mr-2 py-2"
                        >
                            <Trash2 size={18} className="mr-2" /> Delete
                        </Button>
                        {alert.status === 'Active' && (
                            <Button
                                variant="outline-success"
                                onClick={() => setShowResolveConfirm(true)}
                                disabled={loading}
                                className="flex-1 py-2"
                            >
                                <CheckCircle size={18} className="mr-2" /> Resolve
                            </Button>
                        )}
                    </div>
                </div>
            </Card.Body>

            {/* Delete Confirmation Modal */}
            <Modal show={showDeleteConfirm} onHide={() => setShowDeleteConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this alert? This action cannot be undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={loading}
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Resolve Confirmation Modal */}
            <Modal show={showResolveConfirm} onHide={() => setShowResolveConfirm(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Resolution</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to mark this alert as resolved?
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowResolveConfirm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleResolve}
                        disabled={loading}
                    >
                        {loading ? 'Resolving...' : 'Resolve'}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default AlertCard;