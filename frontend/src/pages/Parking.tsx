import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/common/Navbar";
import { getChargingStations } from "../services/mapService";
import type { ChargingStation } from "../models/types/map";
import "../parking.css";
 
// ─────────────────────────────────────────────
// LEAFLET ICON FIX
// Leaflet's default marker icons break in Vite because Vite
// processes assets differently than a normal browser.
// We manually tell Leaflet where to find the icon image files
// by deleting the broken auto-detection and setting paths ourselves.
// ─────────────────────────────────────────────
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete ((L.Icon.Default.prototype as unknown) as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
 
// ─────────────────────────────────────────────
// CUSTOM EV ICON
// Instead of the default blue Leaflet pin, we create a custom
// circle with a ⚡ emoji using DivIcon, which lets us
// use plain HTML/CSS as a marker. 
// ─────────────────────────────────────────────
const evIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    background:#3d8c33;
    color:white;
    border-radius:50%;
    width:28px;
    height:28px;
    display:flex;
    align-items:center;
    justify-content:center;
    font-size:15px;
    border:2px solid #fff;
    box-shadow:0 2px 6px rgba(0,0,0,0.3);
  ">⚡</div>`,
  iconSize: [28, 28],       // pixel size of the icon
  iconAnchor: [14, 14],     // the point of the icon that corresponds to the marker's location
  popupAnchor: [0, -16],    // where the popup opens relative to the icon
});
 
// ─────────────────────────────────────────────
// TYPESCRIPT INTERFACE
// Defines the shape of each charging station object.
// This tells TypeScript exactly what fields each station has
// so it can catch mistakes if we typo a field name.
// ─────────────────────────────────────────────
export default function Parking() {
  // ─────────────────────────────────────────────
  // STATE
  // stations: the list of EV stations fetched from the API
  // loading:  true while the fetch is in progress
  // error:    holds an error message string if something goes wrong
  // ─────────────────────────────────────────────
  const [stations, setStations] = useState<ChargingStation[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
 
  // ─────────────────────────────────────────────
  // useEffect
  // Runs once when the component first mounts (loads).
  // The empty [] dependency array means "only run this on mount".
  // This is where we fetch the charging station data from Overpass.
  // ─────────────────────────────────────────────
  // ─────────────────────────────────────────────
  // HELPER FUNCTIONS
  // ─────────────────────────────────────────────
  function throwError(message: string): never {
    throw new Error(message);
  }

  useEffect(() => {
    async function fetchStations() {
      try {
        const parsed = await getChargingStations();
        if (parsed.length === 0) {
          throwError("No charging stations found in this area.");
        }

        setStations(parsed);
 
      } catch (e: unknown) {
        // Only show the error if we have no stations at all
        // This prevents a false error when data loads but a minor issue occurs
        const errorMessage = e instanceof Error ? e.message : "Could not load charging stations. Please try again later.";
        setError(errorMessage);
      } finally {
        // Always stop the loading spinner, whether we succeeded or failed
        setLoading(false);
      }
    }
 
    fetchStations();
  }, []); // empty array = run once on mount only
 
  return (
    <div className="parking-page">
      <Navbar />
 
      {/* Station count badge — only show once loading is done and we have stations */}
      {!loading && stations.length > 0 && (
        <div className="parking-badge">
          ⚡ {stations.length} EV charging stations in Montreal
        </div>
      )}
 
      {/* Loading overlay — covers the map while data is being fetched */}
      {loading && (
        <div className="parking-loading">
          <div className="parking-spinner" />
          <p>Loading EV charging stations…</p>
        </div>
      )}
 
      {/* Error message — only show if we have NO stations at all */}
      {error && stations.length === 0 && (
        <div className="parking-error">{error}</div>
      )}
 
      {/* ─────────────────────────────────────────────
          MAP
          MapContainer sets up the Leaflet map with an initial
          center (Montreal) and zoom level.
 
          TileLayer loads the actual map tiles from OpenStreetMap.
          The {s}, {z}, {x}, {y} in the URL are placeholders that
          Leaflet fills in automatically for each map tile.
 
          Each Station gets a Marker at its coordinates.
          The custom evIcon is used instead of the default pin.
          Popup shows the station details when the marker is clicked.
          ───────────────────────────────────────────── */}
      <div className="parking-body">
        <MapContainer
          center={[45.5017, -73.5673]}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
 
          {stations.map(station => (
            <Marker
              key={station.id}
              position={[station.lat, station.lon]}
              icon={evIcon}
            >
              <Popup>
                <div style={{ minWidth: "180px", fontSize: "13px", lineHeight: "1.6" }}>
                  <strong style={{ fontSize: "14px", color: "#2e6e26" }}>
                    ⚡ {station.name}
                  </strong>
                  <hr style={{ margin: "6px 0", borderColor: "#c8dfc3" }} />
                  <div>📍 {station.address}</div>
                  <div>🔌 Connectors: {station.connectors}</div>
                  <div>Sockets: {station.sockets}</div>
                  <div>Network: {station.network}</div>
                  <div>Access: {station.access}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}