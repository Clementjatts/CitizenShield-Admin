import React, { useState, useRef, useEffect } from "react";
import { Button, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Circle } from "react-leaflet";
import { Share2, Crosshair, Map as MapIcon, AlertTriangle } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Alert } from "../../types/shared";
import { db } from "../../config/firebaseConfig";
import { collection, query, where, onSnapshot, DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import { handleFirebaseError } from "../../utils/errorHandler";

// Custom marker icons
const createCustomIcon = (color: string) =>
    new L.Icon({
        iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
        shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

const activeIcon = createCustomIcon("red");
const resolvedIcon = createCustomIcon("green");

interface MapViewProps {
    alerts: Alert[];
    center: [number, number];
    zoom: number;
    onClose: () => void;
}

// Helper function to convert Firestore document to Alert type
const convertDocToAlert = (doc: QueryDocumentSnapshot<DocumentData>): Alert => {
    const data = doc.data();
    return {
        id: doc.id,
        type: data.type || "",
        location: data.location || "",
        initialLocation: {
            latitude: data.initialLocation?.latitude || 0,
            longitude: data.initialLocation?.longitude || 0,
        },
        status: data.status as "Active" | "Resolved",
        priority: data.priority as "Low" | "Medium" | "High",
        timestamp:
            data.timestamp?.toDate?.()?.toISOString() || new Date().toISOString(),
        initiatorName: data.initiatorName || "",
        userId: data.userId || "",
        description: data.description || "",
    };
};

const MapView = React.forwardRef<any, MapViewProps>(
    ({ alerts, center, zoom, onClose }, ref) => {
        const [isEarthView, setIsEarthView] = useState(false);
        const [showHeatmap, setShowHeatmap] = useState(false);
        const [filterPriority, setFilterPriority] = useState<string>("All");
        const [filterStatus, setFilterStatus] = useState<string>("All");
        const [liveAlerts, setLiveAlerts] = useState<Alert[]>(alerts);
        const [error, setError] = useState<string | null>(null);
        const mapRef = useRef<L.Map | null>(null);

        useEffect(() => {
            // Create query based on filters
            let q = query(collection(db, "emergencies"));

            if (filterStatus !== "All") {
                q = query(q, where("status", "==", filterStatus));
            }

            const unsubscribe = onSnapshot(
                q,
                (snapshot) => {
                    try {
                        const alertsList = snapshot.docs
                            .map(convertDocToAlert)
                            .filter(
                                (alert) =>
                                    filterPriority === "All" || alert.priority === filterPriority
                            );
                        setLiveAlerts(alertsList);
                    } catch (err) {
                        console.error("Error processing alert data:", err);
                        setError(handleFirebaseError(err));
                    }
                },
                (error) => {
                    console.error("Snapshot error:", error);
                    setError(handleFirebaseError(error));
                }
            );

            return () => unsubscribe();
        }, [filterStatus, filterPriority]);

        const MapHandler = () => {
            const map = useMap();
            mapRef.current = map;
            React.useImperativeHandle(ref, () => ({
                flyTo: (center: [number, number], zoom: number) => {
                    map.flyTo(center, zoom, { duration: 0.5 });
                },
            }));
            return null;
        };

        const toggleView = () => setIsEarthView(!isEarthView);
        const toggleHeatmap = () => setShowHeatmap(!showHeatmap);

        const handleShare = () => {
            if (mapRef.current) {
                const center = mapRef.current.getCenter();
                const zoom = mapRef.current.getZoom();
                const shareUrl = `https://www.google.com/maps/@${center.lat},${center.lng},${zoom}z`;
                navigator.clipboard
                    .writeText(shareUrl)
                    .then(() => {
                        alert("Map location copied to clipboard!");
                    })
                    .catch((err) => {
                        console.error("Failed to copy:", err);
                        setError("Failed to copy location to clipboard");
                    });
            }
        };

        const handleRecenter = () => {
            if (mapRef.current) {
                mapRef.current.setView(center, zoom);
            }
        };

        const filteredAlerts = liveAlerts.filter(
            (alert) =>
                (filterPriority === "All" || alert.priority === filterPriority) &&
                (filterStatus === "All" || alert.status === filterStatus)
        );

        return (
            <div className="fixed inset-0 z-50 bg-white">
                {error && (
                    <div className="absolute top-4 left-4 right-4 z-50">
                        <div
                            className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded"
                            role="alert"
                        >
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                        </div>
                    </div>
                )}
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: "100vh", width: "100%" }}
                    zoomControl={false}
                    ref={mapRef}
                >
                    {isEarthView ? (
                        <TileLayer
                            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                            attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
                        />
                    ) : (
                        <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        />
                    )}

                    {filteredAlerts.map((alert) => (
                        <React.Fragment key={alert.id}>
                            <Marker
                                position={[
                                    alert.initialLocation.latitude,
                                    alert.initialLocation.longitude,
                                ]}
                                icon={alert.status === "Active" ? activeIcon : resolvedIcon}
                            >
                                <Popup>
                                    <div className="popup-content">
                                        <h3
                                            className={`text-${alert.status === "Active" ? "red" : "green"
                                                }-500 font-bold mb-2`}
                                        >
                                            {alert.type}
                                        </h3>
                                        <p className="mb-1">
                                            <strong>Location:</strong> {alert.location}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Status:</strong>{" "}
                                            <span
                                                className={`text-${alert.status === "Active" ? "red" : "green"
                                                    }-500`}
                                            >
                                                {alert.status}
                                            </span>
                                        </p>
                                        <p className="mb-1">
                                            <strong>Priority:</strong>{" "}
                                            <span
                                                className={`text-${alert.priority === "High"
                                                        ? "red"
                                                        : alert.priority === "Medium"
                                                            ? "yellow"
                                                            : "green"
                                                    }-500`}
                                            >
                                                {alert.priority}
                                            </span>
                                        </p>
                                        <p className="mb-1">
                                            <strong>Time:</strong>{" "}
                                            {new Date(alert.timestamp).toLocaleString()}
                                        </p>
                                        <p className="mb-1">
                                            <strong>Initiator:</strong> {alert.initiatorName}
                                        </p>
                                        {alert.description && (
                                            <p className="mt-2 text-gray-600">{alert.description}</p>
                                        )}
                                    </div>
                                </Popup>
                            </Marker>

                            {showHeatmap && (
                                <Circle
                                    center={[
                                        alert.initialLocation.latitude,
                                        alert.initialLocation.longitude,
                                    ]}
                                    pathOptions={{
                                        fillColor: "red",
                                        fillOpacity: 0.2,
                                        color: "transparent",
                                    }}
                                    radius={500}
                                />
                            )}
                        </React.Fragment>
                    ))}

                    {/* Filter Controls */}
                    <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000]">
                        <Form.Group className="mb-3">
                            <Form.Label className="font-semibold">Priority</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="w-full"
                            >
                                <option value="All">All</option>
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="font-semibold">Status</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full"
                            >
                                <option value="All">All</option>
                                <option value="Active">Active</option>
                                <option value="Resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                    </div>

                    {/* Map Controls */}
                    <div className="absolute bottom-32 right-4 flex flex-col gap-2">
                        <OverlayTrigger
                            placement="left"
                            overlay={
                                <Tooltip id="toggle-view-tooltip">
                                    {isEarthView
                                        ? "Switch to Street View"
                                        : "Switch to Earth View"}
                                </Tooltip>
                            }
                        >
                            <Button
                                variant="light"
                                onClick={toggleView}
                                className="shadow-lg"
                            >
                                <MapIcon size={20} />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="left"
                            overlay={
                                <Tooltip id="heatmap-tooltip">
                                    {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                                </Tooltip>
                            }
                        >
                            <Button
                                variant="light"
                                onClick={toggleHeatmap}
                                className="shadow-lg"
                            >
                                <AlertTriangle size={20} />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip id="share-tooltip">Share Location</Tooltip>}
                        >
                            <Button
                                variant="light"
                                onClick={handleShare}
                                className="shadow-lg"
                            >
                                <Share2 size={20} />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="left"
                            overlay={<Tooltip id="recenter-tooltip">Recenter Map</Tooltip>}
                        >
                            <Button
                                variant="light"
                                onClick={handleRecenter}
                                className="shadow-lg"
                            >
                                <Crosshair size={20} />
                            </Button>
                        </OverlayTrigger>
                    </div>

                    <ZoomControl position="bottomright" />
                    <MapHandler />
                </MapContainer>

                {/* Close Button */}
                <Button
                    variant="secondary"
                    onClick={onClose}
                    className="absolute top-4 left-4 z-[1000] shadow-lg"
                >
                    Close Map
                </Button>
            </div>
        );
    }
);

export default MapView;
