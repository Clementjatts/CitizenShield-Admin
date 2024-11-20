import React, { useState } from "react";
import { Card, Badge, Button, Modal, Alert } from "react-bootstrap";
import { AlertTriangle, Clock, Map as MapIcon, User, CheckCircle, Trash2, AlertCircle, CalendarClock } from "lucide-react";
import { Alert as AlertType } from "../../types/shared";
import { handleFirebaseError } from "../../utils/errorHandler";

interface AlertCardProps {
    alert: AlertType;
    onDelete: (id: string) => Promise<void>;
    onResolve: (id: string) => Promise<void>;
    setMapCenter: (coords: [number, number], zoom: number) => void;
}

const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
        case "high":
            return "bg-red-600";
        case "medium":
            return "bg-amber-500";
        case "low":
            return "bg-green-500";
        default:
            return "bg-blue-500";
    }
};

const getStatusColor = (status: string): string => {
    return status === "Active" ? "bg-red-500" : "bg-green-500";
};

const getPriorityIcon = (priority: string) => {
    switch (priority.toLowerCase()) {
        case "high":
            return <AlertTriangle className="text-red-600" size={24} />;
        case "medium":
            return <AlertCircle className="text-amber-500" size={24} />;
        case "low":
            return <AlertTriangle className="text-green-500" size={24} />;
        default:
            return <AlertTriangle className="text-blue-500" size={24} />;
    }
};

const getTimeElapsed = (timestamp: string) => {
    const now = new Date();
    const alertTime = new Date(timestamp);
    const diff = now.getTime() - alertTime.getTime();
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    return `${hours}h ${minutes}m ago`;
};

const AlertCard: React.FC<AlertCardProps> = ({
    alert,
    onDelete,
    onResolve,
    setMapCenter,
}) => {
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleMapClick = () => {
        if (
            alert.initialLocation &&
            typeof alert.initialLocation.latitude === "number" &&
            typeof alert.initialLocation.longitude === "number"
        ) {
            setMapCenter(
                [alert.initialLocation.latitude, alert.initialLocation.longitude],
                16
            );
        }
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

    const formatDateTime = (timestamp: string) => {
        return new Date(timestamp).toLocaleString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        });
    };

    return (
        <Card className="mb-6 hover:shadow-xl transition-all duration-300 rounded-xl overflow-hidden border-0 shadow-lg">
            {error && (
                <Alert variant="danger" onClose={() => setError(null)} dismissible>
                    {error}
                </Alert>
            )}

            <div className="relative">
                <div
                    className={`absolute top-0 left-0 w-2 h-full ${getPriorityColor(
                        alert.priority
                    )}`}
                />

                <div className="p-6">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-3 mb-2">
                                {getPriorityIcon(alert.priority)}
                                <h3 className="text-xl font-bold m-0">{alert.type}</h3>
                            </div>
                            <div className="flex gap-2">
                                <Badge
                                    className={`${getStatusColor(
                                        alert.status
                                    )} text-white px-3 py-1 rounded-full`}
                                >
                                    {alert.status}
                                </Badge>
                                <Badge
                                    className={`${getPriorityColor(
                                        alert.priority
                                    )} text-white px-3 py-1 rounded-full`}
                                >
                                    {alert.priority} Priority
                                </Badge>
                            </div>
                        </div>

                        {alert.initialLocation && (
                            <Button
                                variant="light"
                                onClick={handleMapClick}
                                className="text-blue-500 hover:text-blue-700 shadow-sm hover:shadow-md transition-all duration-200"
                            >
                                <MapIcon size={24} />
                            </Button>
                        )}
                    </div>

                    {/* Information Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <User className="text-gray-500" size={18} />
                            <span className="font-medium text-gray-700">Initiator:</span>
                            <span className="text-gray-600">{alert.initiatorName}</span>
                        </div>

                        <div className="flex items-center gap-2">
                            <Clock className="text-gray-500" size={18} />
                            <span className="font-medium text-gray-700">Time Elapsed:</span>
                            <span className="text-gray-600">
                                {getTimeElapsed(alert.timestamp)}
                            </span>
                        </div>

                        <div className="flex items-center gap-2">
                            <CalendarClock className="text-gray-500" size={18} />
                            <span className="font-medium text-gray-700">Reported:</span>
                            <span className="text-gray-600">
                                {formatDateTime(alert.timestamp)}
                            </span>
                        </div>

                        {alert.resolvedAt && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="text-green-500" size={18} />
                                <span className="font-medium text-gray-700">Resolved:</span>
                                <span className="text-gray-600">
                                    {alert.resolvedAt.toLocaleString()}
                                </span>
                            </div>
                        )}

                        <div className="flex items-center gap-2 col-span-2">
                            <MapIcon className="text-gray-500" size={18} />
                            <span className="font-medium text-gray-700">Location:</span>
                            <span className="text-gray-600">
                                {alert.location}
                                {alert.initialLocation && (
                                    <span className="text-gray-400 ml-2">
                                        {`{${alert.initialLocation.latitude.toFixed(6)}°N, ${alert.initialLocation.longitude.toFixed(6)}°E}`}
                                    </span>
                                )}
                            </span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 mt-6">
                        <Button
                            variant="outline-danger"
                            className="flex-1 flex items-center justify-center gap-2 py-2.5"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                        >
                            <Trash2 size={18} />
                            Delete Alert
                        </Button>

                        {alert.status === "Active" && (
                            <Button
                                variant="outline-success"
                                className="flex-1 flex items-center justify-center gap-2 py-2.5"
                                onClick={() => setShowResolveConfirm(true)}
                                disabled={loading}
                            >
                                <CheckCircle size={18} />
                                Mark as Resolved
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
                centered
            >
                <Modal.Header closeButton className="border-b-0">
                    <Modal.Title className="text-xl font-bold">
                        Confirm Delete
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this alert? This action cannot be
                    undone.
                </Modal.Body>
                <Modal.Footer className="border-t-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="danger"
                        onClick={handleDelete}
                        disabled={loading}
                        className="min-w-[100px]"
                    >
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Resolve Confirmation Modal */}
            <Modal
                show={showResolveConfirm}
                onHide={() => setShowResolveConfirm(false)}
                centered
            >
                <Modal.Header closeButton className="border-b-0">
                    <Modal.Title className="text-xl font-bold">
                        Confirm Resolution
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to mark this alert as resolved?
                </Modal.Body>
                <Modal.Footer className="border-t-0">
                    <Button
                        variant="outline-secondary"
                        onClick={() => setShowResolveConfirm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="success"
                        onClick={handleResolve}
                        disabled={loading}
                        className="min-w-[100px]"
                    >
                        {loading ? "Resolving..." : "Resolve"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default AlertCard;
