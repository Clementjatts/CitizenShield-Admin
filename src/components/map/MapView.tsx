import React, { useState, useRef, useEffect } from "react";
import { Button, OverlayTrigger, Tooltip, Form } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup, useMap, ZoomControl, Circle } from "react-leaflet";
import { Share2, Crosshair, Map as MapIcon, AlertTriangle, Filter } from "lucide-react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Alert } from "../../types/shared";

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

const getPriorityColor = (priority: string): string => {
    switch (priority.toLowerCase()) {
        case "high":
            return "#ef4444"; // red-500
        case "medium":
            return "#f59e0b"; // amber-500
        case "low":
            return "#22c55e"; // green-500
        default:
            return "#3b82f6"; // blue-500
    }
};

interface MapViewProps {
    alerts: Alert[];
    center: [number, number];
    zoom: number;
    onClose: () => void;
}

const MapView = React.forwardRef<any, MapViewProps>(
    ({ alerts, center, zoom, onClose }, ref) => {
        const [isEarthView, setIsEarthView] = useState(false);
        const [showHeatmap, setShowHeatmap] = useState(false);
        const [showFilters, setShowFilters] = useState(false);
        const [filterPriority, setFilterPriority] = useState<string>("all");
        const [filterStatus, setFilterStatus] = useState<string>("all");
        const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>(alerts);
        const mapRef = useRef<L.Map | null>(null);

        useEffect(() => {
            // Apply filters whenever alerts or filter settings change
            const filtered = alerts.filter((alert) => {
                const matchesPriority =
                    filterPriority === "all" ||
                    alert.priority.toLowerCase() === filterPriority;
                const matchesStatus =
                    filterStatus === "all" || alert.status.toLowerCase() === filterStatus;
                return matchesPriority && matchesStatus;
            });
            setFilteredAlerts(filtered);
        }, [alerts, filterPriority, filterStatus]);

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

        const handleShare = async () => {
            if (!mapRef.current) return;

            try {
                const center = mapRef.current.getCenter();
                const zoom = mapRef.current.getZoom();
                const shareUrl = `https://www.google.com/maps/@${center.lat},${center.lng},${zoom}z`;
                await navigator.clipboard.writeText(shareUrl);
                alert("Map location copied to clipboard!");
            } catch (err) {
                console.error("Failed to copy location:", err);
            }
        };

        const handleRecenter = () => {
            if (mapRef.current) {
                mapRef.current.setView(center, zoom);
            }
        };

        const formatDate = (timestamp: string) => {
            return new Date(timestamp).toLocaleString();
        };

        return (
            <div className="fixed inset-0 z-50 bg-white">
                {/* Header Controls */}
                <div className="absolute top-4 left-4 right-4 z-[1000] flex justify-between items-center">
                    <Button variant="secondary" onClick={onClose} className="shadow-lg">
                        Close Map
                    </Button>

                    <div className="flex items-center gap-2">
                        <Button
                            variant="light"
                            onClick={() => setShowFilters(!showFilters)}
                            className="shadow-lg"
                        >
                            <Filter size={20} />
                        </Button>
                        <div className="bg-white rounded-lg shadow-lg p-2">
                            <span className="text-sm font-medium">
                                Showing {filteredAlerts.length} alerts
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters Panel */}
                {showFilters && (
                    <div className="absolute top-20 left-4 bg-white p-4 rounded-lg shadow-lg z-[1000] min-w-[250px]">
                        <h4 className="text-lg font-semibold mb-4">Filters</h4>
                        <Form.Group className="mb-3">
                            <Form.Label className="font-medium">Priority</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filterPriority}
                                onChange={(e) => setFilterPriority(e.target.value)}
                                className="w-full"
                            >
                                <option value="all">All Priorities</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </Form.Select>
                        </Form.Group>

                        <Form.Group>
                            <Form.Label className="font-medium">Status</Form.Label>
                            <Form.Select
                                size="sm"
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full"
                            >
                                <option value="all">All Statuses</option>
                                <option value="active">Active</option>
                                <option value="resolved">Resolved</option>
                            </Form.Select>
                        </Form.Group>
                    </div>
                )}

                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: "100vh", width: "100%" }}
                    zoomControl={false}
                    ref={mapRef}
                >
                    {/* Base Layer */}
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

                    {/* Alert Markers */}
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
                                        <div className="flex items-center gap-2 mb-2">
                                            <AlertTriangle
                                                size={20}
                                                className={
                                                    alert.status === "Active"
                                                        ? "text-red-500"
                                                        : "text-green-500"
                                                }
                                            />
                                            <h3 className="text-lg font-semibold m-0">
                                                {alert.type}
                                            </h3>
                                        </div>

                                        <div className="grid gap-2 text-sm">
                                            <p>
                                                <strong>Location:</strong> {alert.location}
                                            </p>
                                            <p>
                                                <strong>Status:</strong>{" "}
                                                <span
                                                    className={`${alert.status === "Active"
                                                            ? "text-red-500"
                                                            : "text-green-500"
                                                        } font-medium`}
                                                >
                                                    {alert.status}
                                                </span>
                                            </p>
                                            <p>
                                                <strong>Priority:</strong>{" "}
                                                <span
                                                    className="font-medium"
                                                    style={{ color: getPriorityColor(alert.priority) }}
                                                >
                                                    {alert.priority}
                                                </span>
                                            </p>
                                            <p>
                                                <strong>Reported:</strong> {formatDate(alert.timestamp)}
                                            </p>
                                            <p>
                                                <strong>Initiator:</strong> {alert.initiatorName}
                                            </p>
                                        </div>
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
                                        fillColor: getPriorityColor(alert.priority),
                                        fillOpacity: 0.2,
                                        color: "transparent",
                                    }}
                                    radius={500}
                                />
                            )}
                        </React.Fragment>
                    ))}

                    {/* Map Controls */}
                    <div className="absolute bottom-32 right-4 flex flex-col gap-2">
                        <OverlayTrigger
                            placement="left"
                            overlay={
                                <Tooltip id="toggle-view-tooltip">
                                    {isEarthView
                                        ? "Switch to Street View"
                                        : "Switch to Satellite View"}
                                </Tooltip>
                            }
                        >
                            <Button
                                variant="light"
                                onClick={() => setIsEarthView(!isEarthView)}
                                className="shadow-lg"
                            >
                                <MapIcon size={20} />
                            </Button>
                        </OverlayTrigger>

                        <OverlayTrigger
                            placement="left"
                            overlay={
                                <Tooltip id="heatmap-tooltip">
                                    {showHeatmap ? "Hide Impact Zones" : "Show Impact Zones"}
                                </Tooltip>
                            }
                        >
                            <Button
                                variant="light"
                                onClick={() => setShowHeatmap(!showHeatmap)}
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
            </div>
        );
    }
);

export default MapView;
