import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/common/NavBar";
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
delete (L.Icon.Default.prototype as any)._getIconUrl;
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
interface Station {
  id: number;
  lat: number;
  lon: number;
  name: string;
  address: string;
  network: string;
  sockets: string;
  connectors: string;
  access: string;
}
 
// ─────────────────────────────────────────────
// OVERPASS API QUERY
// Overpass is a read-only API for OpenStreetMap data.
// This query asks for all nodes and ways tagged with
// amenity=charging_station inside a bounding box around Montreal.
// The bounding box format is: (south, west, north, east)
// "out center tags" means: return the center point + all tags for each result.
// ─────────────────────────────────────────────
const OVERPASS_QUERY = `
[out:json][timeout:25];
(
  node["amenity"="charging_station"](45.40,-73.97,45.70,-73.47);
  way["amenity"="charging_station"](45.40,-73.97,45.70,-73.47);
);
out center tags;
`;
 
export default function Parking() {
  // ─────────────────────────────────────────────
  // STATE
  // stations: the list of EV stations fetched from the API
  // loading:  true while the fetch is in progress
  // error:    holds an error message string if something goes wrong
  // ─────────────────────────────────────────────
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
 
  // ─────────────────────────────────────────────
  // useEffect
  // Runs once when the component first mounts (loads).
  // The empty [] dependency array means "only run this on mount".
  // This is where we fetch the charging station data from Overpass.
  // ─────────────────────────────────────────────
  useEffect(() => {
    async function fetchStations() {
      try {
        // Send a POST request to the Overpass API with our query as the body
        const res = await fetch("https://overpass-api.de/api/interpreter", {
          method: "POST",
          body: OVERPASS_QUERY,
        });
 
        // If the server returned a non-OK HTTP status (e.g. 500), throw an error
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
 
        const data = await res.json();
 
        // Check that we actually got elements back
        if (!data.elements || data.elements.length === 0) {
          throw new Error("No charging stations found in this area.");
        }
 
        // ─────────────────────────────────────────────
        // DATA TRANSFORMATION
        // The Overpass API returns raw OSM data which isn't
        // directly usable. We map over each element and extract
        // only the fields we care about into our Station interface.
        //
        // Notes:
        // - "tags" holds all OSM key-value metadata for the element
        // - Ways (polygons) don't have lat/lon directly — they have
        //   a "center" object instead, so we handle both cases
        // - We filter out any elements missing coordinates at the end
        // ─────────────────────────────────────────────
        const parsed: Station[] = data.elements
          .map((el: any) => {
            const tags = el.tags || {};
 
            // Nodes have lat/lon directly; ways have a center object
            const lat = el.lat ?? el.center?.lat;
            const lon = el.lon ?? el.center?.lon;
 
            return {
              id:   el.id,
              lat,
              lon,
 
              // Use the station name, or fall back to the operator name,
              // or a generic label if neither exists
              name: tags.name || tags.operator || "EV Charging Station",
 
              // Build a readable address from individual OSM address tags
              address: [
                tags["addr:housenumber"],
                tags["addr:street"],
                tags["addr:city"],
              ].filter(Boolean).join(" ") || "Montreal, QC",
 
              network:  tags.network || tags.operator || "Unknown network",
 
              // capacity = total number of charging points at this station
              sockets:  tags.capacity || tags["socket:count"] || "N/A",
 
              // OSM stores connector types as individual tags like socket:type2=2
              // We check each known connector type and build a readable list
              connectors: [
                tags["socket:type2"]              && "Type 2",
                tags["socket:chademo"]            && "CHAdeMO",
                tags["socket:type2_combo"]        && "CCS",
                tags["socket:tesla_supercharger"] && "Tesla",
                tags["socket:type1"]              && "Type 1",
              ].filter(Boolean).join(", ") || "See on-site",
 
              // Determine if the station is free or paid
              access: tags.fee === "yes" ? "Paid" : tags.fee === "no" ? "Free" : "Check on-site",
            };
          })
          // Remove any elements that are missing coordinates
          .filter((s: Station) => s.lat != null && s.lon != null);
 
        setStations(parsed);
 
      } catch (e: any) {
        // Only show the error if we have no stations at all
        // This prevents a false error when data loads but a minor issue occurs
        setError(e.message || "Could not load charging stations. Please try again later.");
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