import React, { useState, useEffect } from "react";
import AlertCard from "../../components/cards/AlertCard";
import MapView from "../../components/map/MapView";
import { Alert } from "../../types/shared";
import { db, auth } from "../../config/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDocs } from "firebase/firestore";
import { Alert as BootstrapAlert } from "react-bootstrap";
import { handleFirebaseError } from "../../utils/errorHandler";

interface AlertViewProps {
    searchTerm: string;
}

// Interface for location updates
interface LocationUpdate {
    latitude: number;
    longitude: number;
    timestamp: Date;
}

interface ExtendedAlert extends Alert {
    locationUpdates?: LocationUpdate[];
}

const AlertsView: React.FC<AlertViewProps> = ({ searchTerm }) => {
    // Alert states
    const [alerts, setAlerts] = useState<ExtendedAlert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Map states
    const [showMap, setShowMap] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
    const [mapZoom, setMapZoom] = useState(16);

    useEffect(() => {
        if (!auth.currentUser) {
            setError("Authentication required");
            setLoading(false);
            return;
        }

        try {
            const alertsRef = collection(db, "emergencies");
            const q = query(alertsRef, orderBy("timestamp", "desc"));

            const unsubscribe = onSnapshot(q, async (snapshot) => {
                try {
                    const alertsWithUpdates = await Promise.all(
                        snapshot.docs.map(async (doc) => {
                            const alertData = doc.data();

                            // Fetch location updates for this emergency
                            const updatesRef = collection(doc.ref, "locationUpdates");
                            const updatesQuery = query(
                                updatesRef,
                                orderBy("timestamp", "asc")
                            ); // Order by timestamp ascending
                            const updatesSnapshot = await getDocs(updatesQuery);

                            const locationUpdates = updatesSnapshot.docs.map((updateDoc) => ({
                                latitude: updateDoc.data().latitude,
                                longitude: updateDoc.data().longitude,
                                timestamp: updateDoc.data().timestamp.toDate(),
                            })) as LocationUpdate[];

                            return {
                                id: parseInt(doc.id),
                                type: alertData.type || "",
                                location: alertData.location || "",
                                latitude: alertData.initialLocation.latitude,
                                longitude: alertData.initialLocation.longitude,
                                status: alertData.status as "Active" | "Resolved",
                                priority: alertData.priority as "Low" | "Medium" | "High",
                                timestamp:
                                    alertData.timestamp?.toDate?.()?.toISOString() ||
                                    new Date().toISOString(),
                                initiatorName: alertData.initiatorName || "",
                                initiatorUserId: Number(alertData.userId) || 0,
                                description: alertData.description || "",
                                locationUpdates: locationUpdates,
                            } as ExtendedAlert;
                        })
                    );

                    // Sort alerts by latest timestamp first
                    alertsWithUpdates.sort(
                        (a, b) =>
                            new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
                    );

                    setAlerts(alertsWithUpdates);
                } catch (err) {
                    setError(handleFirebaseError(err));
                } finally {
                    setLoading(false);
                }
            });

            return () => unsubscribe();
        } catch (error) {
            const errorMessage = handleFirebaseError(error);
            setError(errorMessage);
            setLoading(false);
        }
    }, []);

    const handleDeleteAlert = async (id: number) => {
        try {
            // First delete all location updates
            const updatesRef = collection(
                db,
                "emergencies",
                id.toString(),
                "locationUpdates"
            );
            const updatesSnapshot = await getDocs(updatesRef);
            const deletePromises = updatesSnapshot.docs.map((doc) =>
                deleteDoc(doc.ref)
            );
            await Promise.all(deletePromises);

            // Then delete the main alert document
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
                resolvedBy: auth.currentUser?.uid || "system",
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

    // Group alerts by status
    const activeAlerts = filteredAlerts.filter(
        (alert) => alert.status === "Active"
    );
    const resolvedAlerts = filteredAlerts.filter(
        (alert) => alert.status === "Resolved"
    );

    // Group active alerts by initiator
    const activeGroupedAlerts = activeAlerts.reduce((acc, alert) => {
        if (!acc[alert.initiatorUserId]) {
            acc[alert.initiatorUserId] = [];
        }
        acc[alert.initiatorUserId].push(alert);
        return acc;
    }, {} as Record<number, ExtendedAlert[]>);

    // Group resolved alerts by initiator
    const resolvedGroupedAlerts = resolvedAlerts.reduce((acc, alert) => {
        if (!acc[alert.initiatorUserId]) {
            acc[alert.initiatorUserId] = [];
        }
        acc[alert.initiatorUserId].push(alert);
        return acc;
    }, {} as Record<number, ExtendedAlert[]>);

    if (loading) {
        return <div>Loading alerts...</div>;
    }

    return (
        <div>
            {/* Map View Component */}
            {showMap && (
                <MapView
                    alerts={filteredAlerts}
                    center={mapCenter}
                    zoom={mapZoom}
                    onClose={() => setShowMap(false)}
                />
            )}

            {/* Error Alert */}
            {error && (
                <BootstrapAlert
                    variant="danger"
                    onClose={() => setError(null)}
                    dismissible
                >
                    {error}
                </BootstrapAlert>
            )}

            {/* Active Alerts */}
            <h2>Active Alerts ({activeAlerts.length})</h2>
            {Object.entries(activeGroupedAlerts).map(([userId, userAlerts]) => (
                <div key={userId}>
                    <h3>{userAlerts[0].initiatorName}'s Active Alerts</h3>
                    {userAlerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onDelete={handleDeleteAlert}
                            onResolve={handleResolveAlert}
                            setMapCenter={handleSetMapCenter}
                            locationUpdates={alert.locationUpdates}
                        />
                    ))}
                </div>
            ))}

            {/* Resolved Alerts */}
            <h2>Resolved Alerts ({resolvedAlerts.length})</h2>
            {Object.entries(resolvedGroupedAlerts).map(([userId, userAlerts]) => (
                <div key={userId}>
                    <h3>{userAlerts[0].initiatorName}'s Resolved Alerts</h3>
                    {userAlerts.map((alert) => (
                        <AlertCard
                            key={alert.id}
                            alert={alert}
                            onDelete={handleDeleteAlert}
                            onResolve={handleResolveAlert}
                            setMapCenter={handleSetMapCenter}
                            locationUpdates={alert.locationUpdates}
                        />
                    ))}
                </div>
            ))}

            {/* No Results Message */}
            {filteredAlerts.length === 0 && (
                <BootstrapAlert variant="info">
                    No alerts found matching your search criteria.
                </BootstrapAlert>
            )}
        </div>
    );
};

export default AlertsView;
