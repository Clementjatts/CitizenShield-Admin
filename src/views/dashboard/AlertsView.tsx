import React, { useState, useEffect } from "react";
import AlertCard from "../../components/cards/AlertCard";
import MapView from "../../components/map/MapView";
import { Alert } from "../../types/shared";
import { db } from "../../config/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { Alert as BootstrapAlert } from "react-bootstrap";
import { handleFirebaseError } from "../../utils/errorHandler";

interface AlertViewProps {
    searchTerm: string;
}

const AlertsView: React.FC<AlertViewProps> = ({ searchTerm }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
    const [mapZoom, setMapZoom] = useState(16);

    useEffect(() => {
        const alertsRef = collection(db, "emergencies");
        const q = query(alertsRef, orderBy("timestamp", "desc"));

        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                try {
                    const alertsList = snapshot.docs.map((doc) => {
                        const data = doc.data();
                        return {
                            id: parseInt(doc.id),
                            type: data.type || "",
                            location: data.location || "",
                            initialLocation: {
                                latitude: data.initialLocation?.latitude || 0,
                                longitude: data.initialLocation?.longitude || 0,
                            },
                            status: data.status || "Active",
                            priority: data.priority || "Medium",
                            timestamp:
                                data.timestamp instanceof Timestamp
                                    ? data.timestamp.toDate().toISOString()
                                    : new Date().toISOString(),
                            initiatorName: data.initiatorName || "",
                            userId: data.userId || "", // Changed from initiatorUserId to userId
                            description: data.description || "",
                        };
                    });
                    setAlerts(alertsList);
                    setLoading(false);
                } catch (err) {
                    const errorMessage = handleFirebaseError(err);
                    setError(errorMessage);
                    setLoading(false);
                }
            },
            (error) => {
                const errorMessage = handleFirebaseError(error);
                setError(errorMessage);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleDeleteAlert = async (id: number) => {
        try {
            await deleteDoc(doc(db, "emergencies", id.toString()));
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleResolveAlert = async (id: number) => {
        try {
            const alertRef = doc(db, "emergencies", id.toString());
            await updateDoc(alertRef, {
                status: "Resolved",
                resolvedAt: new Date(),
            });
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleSetMapCenter = (coords: [number, number], zoom: number) => {
        setMapCenter(coords);
        setMapZoom(zoom);
        setShowMap(true);
    };

    const filteredAlerts = alerts.filter(
        (alert) =>
            alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
            alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <div>Loading alerts...</div>;
    }

    return (
        <div className="relative">
            {showMap ? (
                <MapView
                    alerts={filteredAlerts}
                    center={mapCenter}
                    zoom={mapZoom}
                    onClose={() => setShowMap(false)}
                />
            ) : (
                <>
                    {error && (
                        <BootstrapAlert
                            variant="danger"
                            onClose={() => setError(null)}
                            dismissible
                        >
                            {error}
                        </BootstrapAlert>
                    )}

                    {filteredAlerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onDelete={handleDeleteAlert}
                            onResolve={handleResolveAlert}
                            setMapCenter={handleSetMapCenter}
                        />
                    ))}

                    {filteredAlerts.length === 0 && !loading && (
                        <BootstrapAlert variant="info">
                            No alerts found {searchTerm && "matching your search criteria"}.
                        </BootstrapAlert>
                    )}
                </>
            )}
        </div>
    );
};

export default AlertsView;
