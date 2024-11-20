import React, { useState, useEffect, useCallback } from "react";
import { Card, Badge, Button, Modal, Alert } from "react-bootstrap";
import { Trash2, CheckCircle, MapPin, Clock, User, AlertTriangle } from "lucide-react";
import { Alert as AlertType } from "../../types/shared";
import { handleFirebaseError } from "../../utils/errorHandler";

interface LocationUpdate {
    latitude: number;
    longitude: number;
    timestamp: Date;
}

interface AlertCardProps {
    alert: AlertType;
    onDelete: (id: string) => Promise<void>;
    onResolve: (id: string) => Promise<void>;
    setMapCenter: (coords: [number, number], zoom: number) => void;
    locationUpdates?: LocationUpdate[];
}

const getPriorityColor = (priority: string) => {
    switch (priority) {
        case "High":
            return "bg-red-600";
        case "Medium":
            return "bg-yellow-500";
        case "Low":
            return "bg-green-500";
        default:
            return "bg-blue-500";
    }
};

const getStatusColor = (status: string) => {
    return status === "Active" ? "bg-red-500" : "bg-green-500";
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
    locationUpdates = [],
}) => {
    const [showMap, setShowMap] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showResolveConfirm, setShowResolveConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [locationName, setLocationName] = useState<string>(
        "Loading location..."
    );

    const fetchLocationName = useCallback(async () => {
        try {
            if (
                alert.initialLocation &&
                typeof alert.initialLocation.latitude === "number" &&
                typeof alert.initialLocation.longitude === "number"
            ) {
                const lat = alert.initialLocation.latitude.toFixed(4);
                const lng = alert.initialLocation.longitude.toFixed(4);
                const locationString = `${lat}°N, ${lng}°E`;
                setLocationName(locationString);
            } else {
                setLocationName("Location unavailable");
            }
        } catch (err) {
            console.error("Error formatting location:", err);
            setLocationName("Location unavailable");
        }
    }, [alert.initialLocation]);

    useEffect(() => {
        fetchLocationName();
    }, [fetchLocationName]);

    const handleMapClick = () => {
        if (
            alert.initialLocation &&
            typeof alert.initialLocation.latitude === "number" &&
            typeof alert.initialLocation.longitude === "number"
        ) {
            setShowMap(!showMap);
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

    return (
        <Card className="mb-6 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl overflow-hidden">
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
                    <div className="flex justify-between items-start mb-4">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2 mb-2">
                                <AlertTriangle
                                    className={
                                        alert.status === "Active"
                                            ? "text-red-500"
                                            : "text-green-500"
                                    }
                                    size={24}
                                />
                                <h3 className="text-xl font-bold m-0">
                                    {alert.type || "Unknown Alert Type"}
                                </h3>
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
                                variant="ghost"
                                onClick={handleMapClick}
                                className="text-blue-500 hover:text-blue-700"
                            >
                                <MapPin size={24} />
                            </Button>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <User className="text-gray-400" size={18} />
                            <span className="font-medium">Initiator:</span>
                            <span>{alert.initiatorName || "Unknown"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="text-gray-400" size={18} />
                            <span>{getTimeElapsed(alert.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 col-span-2">
                            <MapPin className="text-gray-400" size={18} />
                            <span className="font-medium">Location:</span>
                            <span className="text-gray-600">{locationName}</span>
                        </div>
                    </div>

                    {locationUpdates && locationUpdates.length > 0 && (
                        <div className="mt-4 bg-gray-50 p-4 rounded-lg">
                            <h6 className="font-semibold mb-3">Location Updates</h6>
                            <div className="space-y-2">
                                {locationUpdates.map((update, index) => (
                                    <div
                                        key={index}
                                        className="flex justify-between items-center p-2 bg-white rounded shadow-sm"
                                    >
                                        <span className="text-sm text-gray-600">
                                            Update {index + 1} -{" "}
                                            {update.timestamp.toLocaleTimeString()}
                                        </span>
                                        <Button
                                            variant="outline-primary"
                                            size="sm"
                                            onClick={() =>
                                                setMapCenter([update.latitude, update.longitude], 16)
                                            }
                                        >
                                            <MapPin size={14} className="mr-1" />
                                            View
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="flex gap-3 mt-4">
                        <Button
                            variant="outline-danger"
                            className="flex-1 flex items-center justify-center gap-2"
                            onClick={() => setShowDeleteConfirm(true)}
                            disabled={loading}
                        >
                            <Trash2 size={18} />
                            Delete
                        </Button>
                        {alert.status === "Active" && (
                            <Button
                                variant="outline-success"
                                className="flex-1 flex items-center justify-center gap-2"
                                onClick={() => setShowResolveConfirm(true)}
                                disabled={loading}
                            >
                                <CheckCircle size={18} />
                                Resolve
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            <Modal
                show={showDeleteConfirm}
                onHide={() => setShowDeleteConfirm(false)}
            >
                <Modal.Header closeButton>
                    <Modal.Title>Confirm Delete</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to delete this alert? This action cannot be
                    undone.
                </Modal.Body>
                <Modal.Footer>
                    <Button
                        variant="secondary"
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={loading}
                    >
                        Cancel
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loading}>
                        {loading ? "Deleting..." : "Delete"}
                    </Button>
                </Modal.Footer>
            </Modal>

            {/* Resolve Confirmation Modal */}
            <Modal
                show={showResolveConfirm}
                onHide={() => setShowResolveConfirm(false)}
            >
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
                    <Button variant="success" onClick={handleResolve} disabled={loading}>
                        {loading ? "Resolving..." : "Resolve"}
                    </Button>
                </Modal.Footer>
            </Modal>
        </Card>
    );
};

export default AlertCard;
