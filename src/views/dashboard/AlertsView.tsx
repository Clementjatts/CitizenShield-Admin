import React, { useState, useEffect } from "react";
import AlertCard from "../../components/cards/AlertCard";
import MapView from "../../components/map/MapView";
import { Alert } from "../../types/shared";
import { db } from "../../config/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, Timestamp, getDoc, DocumentData, where, QueryDocumentSnapshot } from "firebase/firestore";
import { Alert as BootstrapAlert, Tabs, Tab } from "react-bootstrap";
import { handleFirebaseError } from "../../utils/errorHandler";

interface AlertViewProps {
    searchTerm: string;
}

interface UserData extends DocumentData {
    fullName?: string;
    name?: string;
}

// Convert Firestore document to Alert type with default values
const convertDocToAlert = (doc: QueryDocumentSnapshot<DocumentData>): Alert => {
    const data = doc.data();
    return {
        id: doc.id,
        type: data.type || "Unknown",
        location: data.location || "Unknown Location",
        initialLocation: {
            latitude: data.initialLocation?.latitude || 0,
            longitude: data.initialLocation?.longitude || 0,
        },
        status: (data.status as "Active" | "Resolved") || "Active",
        priority: (data.priority as "Low" | "Medium" | "High") || "Medium",
        timestamp:
            data.timestamp instanceof Timestamp
                ? data.timestamp.toDate().toISOString()
                : new Date().toISOString(),
        initiatorName: data.initiatorName || "Unknown",
        userId: data.userId || "",
        description: data.description || "",
    };
};

const AlertsView: React.FC<AlertViewProps> = ({ searchTerm }) => {
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showMap, setShowMap] = useState(false);
    const [mapCenter, setMapCenter] = useState<[number, number]>([0, 0]);
    const [mapZoom, setMapZoom] = useState(16);
    const [activeTab, setActiveTab] = useState<string>("active");

    useEffect(() => {
        console.log("Fetching alerts...");
        const alertsRef = collection(db, "emergencies");
        const q = query(
            alertsRef,
            where("status", "==", activeTab === "active" ? "active" : "resolved"),
            orderBy("timestamp", "desc")
        );

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                console.log("Snapshot received:", snapshot.docs.length, "documents");
                try {
                    const alertsPromises = snapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();
                        console.log("Processing document:", docSnapshot.id, data);

                        // Fetch user data for the initiator
                        let initiatorName = "Unknown";
                        if (data.userId) {
                            try {
                                const userDocRef = doc(db, "users", data.userId);
                                const userDocSnap = await getDoc(userDocRef);

                                if (userDocSnap.exists()) {
                                    const userData = userDocSnap.data() as UserData;
                                    initiatorName =
                                        userData.fullName || userData.name || "Unknown";
                                }
                            } catch (error) {
                                console.error("Error fetching user data:", error);
                            }
                        }

                        // Convert document to Alert type with proper error handling
                        const alert = convertDocToAlert(docSnapshot);
                        alert.initiatorName = initiatorName;
                        return alert;
                    });

                    const resolvedAlerts = await Promise.all(alertsPromises);
                    console.log("Processed alerts:", resolvedAlerts);
                    setAlerts(resolvedAlerts);
                    setLoading(false);
                } catch (err) {
                    console.error("Error processing alerts:", err);
                    const errorMessage = handleFirebaseError(err);
                    setError(errorMessage);
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Snapshot error:", error);
                setError(handleFirebaseError(error));
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, [activeTab]);

    const handleDeleteAlert = async (id: string) => {
        try {
            const alertRef = doc(db, "emergencies", id);
            await deleteDoc(alertRef);
            console.log("Alert deleted successfully:", id);
        } catch (err) {
            console.error("Error deleting alert:", err);
            setError(handleFirebaseError(err));
        }
    };

    const handleResolveAlert = async (id: string) => {
        try {
            const alertRef = doc(db, "emergencies", id);
            await updateDoc(alertRef, {
                status: "Resolved",
                resolvedAt: new Date(),
            });
            console.log("Alert resolved successfully:", id);
        } catch (err) {
            console.error("Error resolving alert:", err);
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
        return (
            <div className="flex justify-center items-center p-8">
                <div className="spinner-border text-primary" role="status">
                    <span className="sr-only">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="relative p-4">
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
                            className="mb-4"
                        >
                            {error}
                        </BootstrapAlert>
                    )}

                    <Tabs
                        activeKey={activeTab}
                        onSelect={(k) => setActiveTab(k || "active")}
                        className="mb-4"
                    >
                        <Tab
                            eventKey="active"
                            title={
                                <div className="flex items-center gap-2 p-2">
                                    <span className="h-3 w-3 rounded-full bg-red-500"></span>
                                    Active Alerts (
                                    {alerts.filter((a) => a.status === "Active").length})
                                </div>
                            }
                        >
                            <div className="mt-4">
                                {filteredAlerts.length === 0 ? (
                                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-lg">
                                            No active alerts found
                                        </p>
                                    </div>
                                ) : (
                                    filteredAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            onDelete={handleDeleteAlert}
                                            onResolve={handleResolveAlert}
                                            setMapCenter={handleSetMapCenter}
                                        />
                                    ))
                                )}
                            </div>
                        </Tab>
                        <Tab
                            eventKey="resolved"
                            title={
                                <div className="flex items-center gap-2 p-2">
                                    <span className="h-3 w-3 rounded-full bg-green-500"></span>
                                    Resolved Alerts (
                                    {alerts.filter((a) => a.status === "Resolved").length})
                                </div>
                            }
                        >
                            <div className="mt-4">
                                {filteredAlerts.length === 0 ? (
                                    <div className="text-center p-8 bg-gray-50 rounded-lg">
                                        <p className="text-gray-500 text-lg">
                                            No resolved alerts found
                                        </p>
                                    </div>
                                ) : (
                                    filteredAlerts.map((alert) => (
                                        <AlertCard
                                            key={alert.id}
                                            alert={alert}
                                            onDelete={handleDeleteAlert}
                                            onResolve={handleResolveAlert}
                                            setMapCenter={handleSetMapCenter}
                                        />
                                    ))
                                )}
                            </div>
                        </Tab>
                    </Tabs>
                </>
            )}
        </div>
    );
};

export default AlertsView;
