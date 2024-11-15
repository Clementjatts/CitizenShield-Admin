import React, { useState, useEffect } from 'react';
import AlertCard from '../../components/cards/AlertCard';
import MapView from '../../components/map/MapView';
import { Alert } from '../../types/shared';
import { db, auth } from '../../config/firebaseConfig';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { Alert as BootstrapAlert } from 'react-bootstrap';
import { handleFirebaseError } from '../../utils/errorHandler';

interface AlertViewProps {
    searchTerm: string;
}

// Interface for raw alert data from Firestore
interface FirestoreAlert {
    type: string;
    location: string;
    latitude: number;
    longitude: number;
    status: string;
    priority: string;
    timestamp: string;
    initiatorName: string;
    initiatorUserId: number;
    description: string;
}

const AlertsView: React.FC<AlertViewProps> = ({ searchTerm }) => {
    // Alert states
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Map states
    const [showMap, setShowMap] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
    const [mapZoom, setMapZoom] = useState(16);

    useEffect(() => {
        // Query for alerts ordered by timestamp
        const q = query(
            collection(db, 'emergencies'),
            orderBy('timestamp', 'desc')
        );

        const unsubscribe = onSnapshot(q,
            (snapshot) => {
                const alertsList = snapshot.docs.map(doc => {
                    const data = doc.data() as FirestoreAlert;
                    return {
                        id: parseInt(doc.id),
                        type: data.type,
                        location: data.location,
                        latitude: data.latitude,
                        longitude: data.longitude,
                        status: data.status,
                        priority: data.priority,
                        timestamp: data.timestamp,
                        initiatorName: data.initiatorName,
                        initiatorUserId: data.initiatorUserId,
                        description: data.description
                    } as Alert;
                });

                setAlerts(alertsList);
                setLoading(false);
            },
            (error) => {
                setError(handleFirebaseError(error));
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    const handleDeleteAlert = async (id: number) => {
        try {
            await deleteDoc(doc(db, 'emergencies', id.toString()));
        } catch (err) {
            setError(handleFirebaseError(err));
        }
    };

    const handleResolveAlert = async (id: number) => {
        try {
            const alertRef = doc(db, 'emergencies', id.toString());
            await updateDoc(alertRef, {
                status: 'Resolved',
                resolvedAt: new Date(),
                resolvedBy: auth.currentUser?.uid || 'system'
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

    const filteredAlerts = alerts.filter(alert =>
        alert.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        alert.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Group alerts by status
    const activeAlerts = filteredAlerts.filter(alert => alert.status === 'Active');
    const resolvedAlerts = filteredAlerts.filter(alert => alert.status === 'Resolved');

    // Group active alerts by initiator
    const activeGroupedAlerts = activeAlerts.reduce((acc, alert) => {
        if (!acc[alert.initiatorUserId]) {
            acc[alert.initiatorUserId] = [];
        }
        acc[alert.initiatorUserId].push(alert);
        return acc;
    }, {} as Record<number, Alert[]>);

    // Group resolved alerts by initiator
    const resolvedGroupedAlerts = resolvedAlerts.reduce((acc, alert) => {
        if (!acc[alert.initiatorUserId]) {
            acc[alert.initiatorUserId] = [];
        }
        acc[alert.initiatorUserId].push(alert);
        return acc;
    }, {} as Record<number, Alert[]>);

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
                <BootstrapAlert variant="danger" onClose={() => setError(null)} dismissible>
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