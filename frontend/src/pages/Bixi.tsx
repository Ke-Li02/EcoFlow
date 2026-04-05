import { useEffect, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import Navbar from "../components/common/Navbar";
import { getBixiStations } from "../services/mapService";
import type { BixiStation } from "../models/types/map";
import "../bixi.css";

import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";
delete ((L.Icon.Default.prototype as unknown) as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

const bixiIcon = new L.DivIcon({
  className: "",
  html: `<div style="
    background:#0b6bcb;
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
  ">B</div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 14],
  popupAnchor: [0, -16],
});

export default function Bixi() {
  const [stations, setStations] = useState<BixiStation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchStations() {
      try {
        const stationData = await getBixiStations();
        if (stationData.length === 0) {
          setError("No Bixi stations found in the feed.");
          return;
        }
        setStations(stationData);
      } catch (e: unknown) {
        const errorMessage = e instanceof Error ? e.message : "Could not load Bixi stations. Please try again later.";
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    }

    fetchStations();
  }, []);

  const activeStations = stations.filter((station) => station.isInstalled && station.isRenting).length;

  return (
    <div className="bixi-page">
      <Navbar />

      {!loading && stations.length > 0 && (
        <div className="bixi-badge">
          {stations.length} Bixi stations ({activeStations} renting)
        </div>
      )}

      {loading && (
        <div className="bixi-loading">
          <div className="bixi-spinner" />
          <p>Loading Bixi stations...</p>
        </div>
      )}

      {error && stations.length === 0 && <div className="bixi-error">{error}</div>}

      <div className="bixi-body">
        <MapContainer center={[45.5017, -73.5673]} zoom={13} style={{ width: "100%", height: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />

          {stations.map((station) => (
            <Marker key={station.id} position={[station.lat, station.lon]} icon={bixiIcon}>
              <Popup>
                <div style={{ minWidth: "210px", fontSize: "13px", lineHeight: "1.6" }}>
                  <strong style={{ fontSize: "14px", color: "#0a4f93" }}>{station.name}</strong>
                  <hr style={{ margin: "6px 0", borderColor: "#b8d5f3" }} />
                  <div>Address: {station.address}</div>
                  <div>Bikes available: {station.numBikesAvailable}</div>
                  <div>E-bikes available: {station.numEbikesAvailable}</div>
                  <div>Docks available: {station.numDocksAvailable}</div>
                  <div>Capacity: {station.capacity ?? "N/A"}</div>
                  <div>Status: {station.isRenting ? "Renting enabled" : "Renting unavailable"}</div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
