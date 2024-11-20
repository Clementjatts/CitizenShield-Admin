import React, { useState, useEffect, useRef } from "react";
import AlertCard from "../../components/cards/AlertCard";
import MapView from "../../components/map/MapView";
import { Alert } from "../../types/shared";
import { db } from "../../config/firebaseConfig";
import { collection, query, orderBy, onSnapshot, doc, updateDoc, deleteDoc, getDoc, where, DocumentData, QueryDocumentSnapshot, Timestamp } from "firebase/firestore";
import { Alert as BootstrapAlert, Tabs, Tab, Form, InputGroup, Button, Dropdown } from "react-bootstrap";
import { Search, AlertTriangle, Filter, ArrowUpDown, MapPin, Check, XCircle } from "lucide-react";
import { handleFirebaseError } from "../../utils/errorHandler";
import { getAddressFromCoordinates } from "../../utils/locationUtils";

interface AlertViewProps {
    searchTerm: string;
}

interface UserData extends DocumentData {
    fullName?: string;
    name?: string;
}

const convertDocToAlert = async (doc: QueryDocumentSnapshot<DocumentData>): Promise<Alert> => {
    const data = doc.data();
    const initialLocation = {
        latitude: data.initialLocation?.latitude || 0,
        longitude: data.initialLocation?.longitude || 0,
    };

    let address = "No location provided";
    try {
        if (data.address) {
            address = data.address;
        } else if (initialLocation.latitude && initialLocation.longitude) {
            address = await getAddressFromCoordinates(
                initialLocation.latitude,
                initialLocation.longitude
            );
            
            if (address !== "Unknown location") {
                try {
                    await updateDoc(doc.ref, { address });
                } catch (error) {
                    console.error("Error storing address:", error);
                }
            }
        }
    } catch (error) {
        console.error("Error processing address:", error);
    }

    return {
        id: doc.id,
        type: data.type || "Unknown",
        location: address,
        initialLocation,
        status: (data.status?.toString().toLowerCase() === "active"
            ? "Active"
            : "Resolved") as "Active" | "Resolved",
        priority: (data.priority as "Low" | "Medium" | "High") || "Medium",
        timestamp:
            data.timestamp instanceof Timestamp
                ? data.timestamp.toDate().toISOString()
                : new Date().toISOString(),
        initiatorName: data.initiatorName || "Anonymous",
        userId: data.userId || "",
        resolvedAt: data.resolvedAt?.toDate() || undefined,
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
    const [filterPriority, setFilterPriority] = useState<string>("all");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
    const mapRef = useRef(null);

    useEffect(() => {
        const alertsRef = collection(db, "emergencies");
        const q = query(
            alertsRef,
            where("status", "==", activeTab === "active" ? "active" : "resolved"),
            orderBy("timestamp", sortOrder)
        );

        const unsubscribe = onSnapshot(
            q,
            async (snapshot) => {
                try {
                    const alertsPromises = snapshot.docs.map(async (docSnapshot) => {
                        const data = docSnapshot.data();

                        // Fetch user data for initiator
                        let initiatorName = "Anonymous";
                        if (data.userId) {
                            try {
                                const userDocRef = doc(db, "users", data.userId);
                                const userDocSnap = await getDoc(userDocRef);

                                if (userDocSnap.exists()) {
                                    const userData = userDocSnap.data() as UserData;
                                    initiatorName =
                                        userData.fullName || userData.name || "Anonymous";
                                }
                            } catch (error) {
                                console.error("Error fetching user data:", error);
                            }
                        }

                        const alert = await convertDocToAlert(docSnapshot);
                        alert.initiatorName = initiatorName;
                        return alert;
                    });

                    const resolvedAlerts = await Promise.all(alertsPromises);
                    const filteredAlerts = resolvedAlerts.filter((alert) => {
                        const priorityMatch =
                            filterPriority === "all" ||
                            alert.priority.toLowerCase() === filterPriority.toLowerCase();
                        return priorityMatch;
                    });

                    setAlerts(filteredAlerts);
                    setLoading(false);
                } catch (err) {
                    console.error("Error processing alerts:", err);
                    setError(handleFirebaseError(err));
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
    }, [activeTab, filterPriority, sortOrder]);

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

    const filteredAlerts = alerts.filter((alert) => {
        const searchText = (searchTerm || "").toLowerCase();
        return (
            alert.type.toLowerCase().includes(searchText) ||
            alert.location.toLowerCase().includes(searchText) ||
            alert.initiatorName.toLowerCase().includes(searchText)
        );
    });

    const getActiveCount = () =>
        alerts.filter((a) => a.status === "Active").length;
    const getResolvedCount = () =>
        alerts.filter((a) => a.status === "Resolved").length;

    if (loading) {
        return (
            <div className="flex justify-center items-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
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
                    ref={mapRef}
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

                    {/* Controls Section */}
                    <div className="mb-6 bg-white rounded-xl shadow-md p-4">
                        <div className="flex flex-col lg:flex-row justify-between gap-4 mb-4">
                            {/* Search */}
                            <InputGroup className="max-w-md">
                                <InputGroup.Text className="bg-white border-r-0">
                                    <Search size={18} className="text-gray-400" />
                                </InputGroup.Text>
                                <Form.Control
                                    type="text"
                                    placeholder="Search alerts..."
                                    value={searchTerm}
                                    onChange={(e) => (searchTerm = e.target.value)}
                                    className="border-l-0"
                                />
                            </InputGroup>

                            {/* Filters */}
                            <div className="flex gap-3">
                                <Dropdown>
                                    <Dropdown.Toggle
                                        variant="light"
                                        className="flex items-center gap-2"
                                    >
                                        <Filter size={18} />
                                        Priority:{" "}
                                        {filterPriority === "all" ? "All" : filterPriority}
                                    </Dropdown.Toggle>
                                    <Dropdown.Menu>
                                        <Dropdown.Item
                                            active={filterPriority === "all"}
                                            onClick={() => setFilterPriority("all")}
                                        >
                                            All
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={filterPriority === "high"}
                                            onClick={() => setFilterPriority("high")}
                                            className="text-red-600"
                                        >
                                            High
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={filterPriority === "medium"}
                                            onClick={() => setFilterPriority("medium")}
                                            className="text-amber-500"
                                        >
                                            Medium
                                        </Dropdown.Item>
                                        <Dropdown.Item
                                            active={filterPriority === "low"}
                                            onClick={() => setFilterPriority("low")}
                                            className="text-green-600"
                                        >
                                            Low
                                        </Dropdown.Item>
                                    </Dropdown.Menu>
                                </Dropdown>

                                <Button
                                    variant="light"
                                    onClick={() =>
                                        setSortOrder(sortOrder === "asc" ? "desc" : "asc")
                                    }
                                    className="flex items-center gap-2"
                                >
                                    <ArrowUpDown size={18} />
                                    {sortOrder === "asc" ? "Oldest" : "Newest"} First
                                </Button>

                                <Button
                                    variant="primary"
                                    onClick={() => setShowMap(true)}
                                    className="flex items-center gap-2"
                                >
                                    <MapPin size={18} />
                                    View Map
                                </Button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <Tabs
                            activeKey={activeTab}
                            onSelect={(k) => setActiveTab(k || "active")}
                            className="mb-0"
                        >
                            <Tab
                                eventKey="active"
                                title={
                                    <div className="flex items-center gap-2 p-2">
                                        <AlertTriangle size={18} className="text-red-500" />
                                        <span>Active Alerts</span>
                                        <span className="bg-red-100 text-red-600 px-2 py-0.5 rounded-full text-sm">
                                            {getActiveCount()}
                                        </span>
                                    </div>
                                }
                            />
                            <Tab
                                eventKey="resolved"
                                title={
                                    <div className="flex items-center gap-2 p-2">
                                        <Check size={18} className="text-green-500" />
                                        <span>Resolved</span>
                                        <span className="bg-green-100 text-green-600 px-2 py-0.5 rounded-full text-sm">
                                            {getResolvedCount()}
                                        </span>
                                    </div>
                                }
                            />
                        </Tabs>
                    </div>

                    {/* Alerts Grid */}
                    <div className="space-y-6">
                        {filteredAlerts.length === 0 ? (
                            <div className="text-center p-8 bg-gray-50 rounded-xl border border-gray-200">
                                <XCircle size={48} className="mx-auto mb-4 text-gray-400" />
                                <p className="text-gray-600 text-lg mb-2">No alerts found</p>
                                <p className="text-gray-500">
                                    {searchTerm
                                        ? "Try adjusting your search or filters"
                                        : `No ${activeTab} alerts at the moment`}
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
                </>
            )}
        </div>
    );
};

export default AlertsView;
