import { useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents, Circle } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/common/NavBar";
import "../transit.css";
 
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});
 
const ORS_KEY         = import.meta.env.VITE_ORS_API_KEY;
const TRANSITLAND_KEY = import.meta.env.VITE_TRANSITLAND_KEY;
 

// CREDIT/SOURCE TRANSITLAND DOCUMENTATION FOR MOST OF THE CODE INVOLVING DIRECTIONS
// LEAFLET USED FOR MAPS

const TRAVEL_MODES = [
  { value: "driving-car",     label: "🚗 Drive" },
  { value: "cycling-regular", label: "🚲 Bike"  },
  { value: "foot-walking",    label: "🚶 Walk"  },
  { value: "bus-metro",       label: "🚌 Bus/Metro" },
];
 
// STM operator ID, stuff from Transitland
const STM_OPERATOR = "o-f25d-socitdetransportdemontral";
 
function MapClickHandler({ onMapClick }: { onMapClick: (latlng: [number, number]) => void }) {
  useMapEvents({ click(e) { onMapClick([e.latlng.lat, e.latlng.lng]); } });
  return null;
}
 
interface Suggestion {
  label: string;
  coords: [number, number];
}
 
interface Stop {
  id: string;
  name: string;
  lat: number;
  lon: number;
  routes: string[];
}
 //transitland stuff
export default function Transit() {
  const [origin, setOrigin]             = useState("");
  const [destination, setDestination]   = useState("");
  const [mode, setMode]                 = useState("driving-car");
  const [route, setRoute]               = useState<[number, number][] | null>(null);
  const [originCoords, setOriginCoords] = useState<[number, number] | null>(null);
  const [destCoords, setDestCoords]     = useState<[number, number] | null>(null);
  const [clickTarget, setClickTarget]   = useState<"origin" | "destination">("origin");
  const [summary, setSummary]           = useState<{ distance: string; duration: string } | null>(null);
  const [error, setError]               = useState("");
  const [loading, setLoading]           = useState(false);
  const [originSuggestions, setOriginSuggestions] = useState<Suggestion[]>([]);
  const [destSuggestions, setDestSuggestions]     = useState<Suggestion[]>([]);
  const [stops, setStops]               = useState<Stop[]>([]);
  const [transitInfo, setTransitInfo]   = useState<string[]>([]);
 
  async function fetchSuggestions(text: string, setter: (s: Suggestion[]) => void) {
    if (text.length < 3) { setter([]); return; }
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/geocode/autocomplete?api_key=${ORS_KEY}&text=${encodeURIComponent(text)}&boundary.country=CA&size=5`
      );
      const data = await res.json();
      const suggestions: Suggestion[] = (data.features || []).map((f: any) => ({
        label: f.properties.label,
        coords: [f.geometry.coordinates[1], f.geometry.coordinates[0]] as [number, number],
      }));
      setter(suggestions);
    } catch { setter([]); }
  }
 
  // fetch STM stops near a coordinate from Transitland
  async function fetchNearbyStops(lat: number, lon: number, radiusMeters = 500): Promise<Stop[]> {
    const res = await fetch(
      `https://transit.land/api/v2/rest/stops?lat=${lat}&lon=${lon}&radius=${radiusMeters}&served_by_operator_onestop_ids=${STM_OPERATOR}&per_page=20&apikey=${TRANSITLAND_KEY}`
    );
    const data = await res.json();
    return (data.stops || []).map((s: any) => ({
      id: s.onestop_id,
      name: s.stop_name,
      lat: s.geometry.coordinates[1],
      lon: s.geometry.coordinates[0],
      routes: (s.route_stops || []).map((r: any) => r.route?.route_short_name).filter(Boolean),
    }));
  }
 
  // Fetch STM routes that serve both origin and destination areas
  async function fetchTransitRoute(oCoords: [number, number], dCoords: [number, number]) {
    setLoading(true);
    setError("");
    setStops([]);
    setRoute(null);
    setSummary(null);
    setTransitInfo([]);
 
    try {
      // Fetch stops near origin and destination in parallel
      const [originStops, destStops] = await Promise.all([
        fetchNearbyStops(oCoords[0], oCoords[1]),
        fetchNearbyStops(dCoords[0], dCoords[1]),
      ]);
 
      if (!originStops.length && !destStops.length) {
        throw new Error("No STM stops found near your origin or destination. Try a different location.");
      }
 
      // Combine all stops for display
      const allStops = [...originStops, ...destStops];
      setStops(allStops);
 
      // Find shared routes between origin and destination stops
      const originRoutes = new Set(originStops.flatMap(s => s.routes));
      const destRoutes   = new Set(destStops.flatMap(s => s.routes));
      const shared       = [...originRoutes].filter(r => destRoutes.has(r));
 
      if (shared.length) {
        setTransitInfo([`🚌 Direct routes available: ${shared.join(", ")}`,
          `📍 ${originStops.length} stops near origin, ${destStops.length} stops near destination`]);
      } else {
        setTransitInfo([
          `📍 Nearby stops at origin: ${originStops.slice(0, 3).map(s => s.name).join(", ")}`,
          `📍 Nearby stops at destination: ${destStops.slice(0, 3).map(s => s.name).join(", ")}`,
          `🔄 No direct route — a transfer may be needed.`,
        ]);
      }
 
      // Draw a straight line between the two closest stops
      if (originStops.length && destStops.length) {
        setRoute([
          [originStops[0].lat, originStops[0].lon],
          [destStops[0].lat,   destStops[0].lon],
        ]);
      }
 
      // Rough walking time estimate
      const R = 6371000;
      const dLat = (dCoords[0] - oCoords[0]) * Math.PI / 180;
      const dLon = (dCoords[1] - oCoords[1]) * Math.PI / 180;
      const a = Math.sin(dLat/2)**2 + Math.cos(oCoords[0]*Math.PI/180) * Math.cos(dCoords[0]*Math.PI/180) * Math.sin(dLon/2)**2;
      const distM = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const km = (distM / 1000).toFixed(1);
      const min = Math.round(distM / 250); // ~15 km/h average bus speed estimate
      setSummary({ distance: `${km} km`, duration: min >= 60 ? `${Math.floor(min/60)}h ${min%60}m` : `${min} min` });
 
    } catch (e: any) {
      setError(e.message || "Could not load transit data. Please try again.");
    } finally {
      setLoading(false);
    }
  }
 
  async function handleGetRoute() {
    setError("");
    setRoute(null);
    setSummary(null);
    setStops([]);
    setTransitInfo([]);
 
    if (!originCoords || !destCoords) {
      setError("Please select both an origin and a destination.");
      return;
    }
 
    // Bus/Metro mode → use Transitland
    if (mode === "bus-metro") {
      await fetchTransitRoute(originCoords, destCoords);
      return;
    }
 
    // All other modes → use ORS
    setLoading(true);
    try {
      const res = await fetch(
        `https://api.openrouteservice.org/v2/directions/${mode}?api_key=${ORS_KEY}&start=${originCoords[1]},${originCoords[0]}&end=${destCoords[1]},${destCoords[0]}`
      );
      const data = await res.json();
      if (!data.features?.length) throw new Error("No route found between those locations.");
 
      const seg = data.features[0].properties.segments[0];
      const km  = (seg.distance / 1000).toFixed(1);
      const min = Math.round(seg.duration / 60);
      setSummary({
        distance: `${km} km`,
        duration: min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min} min`,
      });
 
      const coords: [number, number][] = data.features[0].geometry.coordinates.map(
        ([lng, lat]: [number, number]) => [lat, lng]
      );
      setRoute(coords);
    } catch (e: any) {
      setError(e.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }
 
  function handleMapClick(latlng: [number, number]) {
    const label = `${latlng[0].toFixed(5)}, ${latlng[1].toFixed(5)}`;
    if (clickTarget === "origin") {
      setOriginCoords(latlng);
      setOrigin(label);
      setOriginSuggestions([]);
    } else {
      setDestCoords(latlng);
      setDestination(label);
      setDestSuggestions([]);
    }
  }
 
  return (
    <div className="transit-page">
      <Navbar />
      <div className="transit-body">
 
        {/* ── Side Panel ── */}
        <div className="transit-panel">
          <h2 className="transit-panel-title">🗺️ Plan your route</h2>
 
          {/* Origin */}
          <label className="transit-label">From</label>
          <div className="transit-autocomplete">
            <input
              className="transit-input"
              placeholder="e.g. Berri-UQAM, Montreal"
              value={origin}
              onChange={e => {
                setOrigin(e.target.value);
                setOriginCoords(null);
                fetchSuggestions(e.target.value, setOriginSuggestions);
              }}
              onKeyDown={e => e.key === "Enter" && handleGetRoute()}
            />
            {originSuggestions.length > 0 && (
              <ul className="transit-suggestions">
                {originSuggestions.map((s, i) => (
                  <li key={i} onClick={() => {
                    setOrigin(s.label);
                    setOriginCoords(s.coords);
                    setOriginSuggestions([]);
                  }}>{s.label}</li>
                ))}
              </ul>
            )}
          </div>
          <p className="transit-hint" onClick={() => setClickTarget("origin")}
            style={{ color: clickTarget === "origin" ? "#3d8c33" : undefined }}>
            📍 {clickTarget === "origin" ? "Click the map to set origin" : "Set origin from map"}
          </p>
 
          {/* Destination */}
          <label className="transit-label">To</label>
          <div className="transit-autocomplete">
            <input
              className="transit-input"
              placeholder="e.g. Mont-Royal, Montreal"
              value={destination}
              onChange={e => {
                setDestination(e.target.value);
                setDestCoords(null);
                fetchSuggestions(e.target.value, setDestSuggestions);
              }}
              onKeyDown={e => e.key === "Enter" && handleGetRoute()}
            />
            {destSuggestions.length > 0 && (
              <ul className="transit-suggestions">
                {destSuggestions.map((s, i) => (
                  <li key={i} onClick={() => {
                    setDestination(s.label);
                    setDestCoords(s.coords);
                    setDestSuggestions([]);
                  }}>{s.label}</li>
                ))}
              </ul>
            )}
          </div>
          <p className="transit-hint" onClick={() => setClickTarget("destination")}
            style={{ color: clickTarget === "destination" ? "#3d8c33" : undefined }}>
            📍 {clickTarget === "destination" ? "Click the map to set destination" : "Set destination from map"}
          </p>
 
          {/* Travel Mode */}
          <label className="transit-label">Travel mode</label>
          <div className="transit-modes">
            {TRAVEL_MODES.map(m => (
              <button key={m.value}
                className={`transit-mode-btn ${mode === m.value ? "active" : ""}`}
                onClick={() => setMode(m.value)}>
                {m.label}
              </button>
            ))}
          </div>
 
          <button className="transit-go-btn" onClick={handleGetRoute} disabled={loading}>
            {loading ? "Finding route…" : "Get directions"}
          </button>
 
          {error && <p className="transit-error">{error}</p>}
 
          {/* Transit info (bus/metro mode) */}
          {transitInfo.length > 0 && (
            <div className="transit-info-box">
              {transitInfo.map((line, i) => <p key={i}>{line}</p>)}
            </div>
          )}
 
          {summary && (
            <div className="transit-summary">
              <span>📏 {summary.distance}</span>
              <span>⏱️ {summary.duration}</span>
            </div>
          )}
        </div>
 
        {/* ── Map ── */}
        <div className="transit-map-container">
          <MapContainer
            center={[45.5017, -73.5673]}
            zoom={13}
            style={{ width: "calc(100vw - 300px)", height: "calc(100vh - 70px)" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            />
            <MapClickHandler onMapClick={handleMapClick} />
 
            {originCoords && <Marker position={originCoords}><Popup>📍 Origin</Popup></Marker>}
            {destCoords   && <Marker position={destCoords}><Popup>🏁 Destination</Popup></Marker>}
            {route        && <Polyline positions={route} color="#1a73e8" weight={5} opacity={0.8} />}
 
            {/* STM stops as green circles-- when you click on them info will display about the bus stop, credit to Transitland */}
            {stops.map(stop => (
              <Circle
                key={stop.id}
                center={[stop.lat, stop.lon]}
                radius={25}
                pathOptions={{ color: "#2e6e26", fillColor: "#5aaa4d", fillOpacity: 0.8 }}
              >
                <Popup>
                  <strong>{stop.name}</strong>
                  {stop.routes.length > 0 && <><br />🚌 Routes: {stop.routes.join(", ")}</>}
                </Popup>
              </Circle>
            ))}
          </MapContainer>
        </div>
 
      </div>
    </div>
  );
}