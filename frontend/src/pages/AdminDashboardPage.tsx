import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { getAdminDashboard, type AdminDashboardData } from "../services/adminService";
import "../admin.css";

function getStatusColor(code: number) {
    if (code < 300) return "rgba(100, 220, 140, 0.8)";   // green — 2xx
    if (code < 400) return "rgba(100, 180, 255, 0.8)";   // blue — 3xx
    if (code < 500) return "rgba(255, 200, 80, 0.8)";    // yellow — 4xx
    return "rgba(255, 100, 100, 0.8)";                   // red — 5xx
}

export default function AdminDashboardPage() {
    const navigate = useNavigate();
    const [data, setData] = useState<AdminDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAdminDashboard()
            .then(setData)
            .catch((err) => {
                const msg = err?.response?.data?.message ?? "Failed to load dashboard";
                alert(msg);
                navigate("/");
            })
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="admin-container">
                <Navbar />
                <p className="loading-text">Loading dashboard...</p>
            </div>
        );
    }

    if (!data) return null;

    const { requestVolume, statusBreakdown, topEndpoints } = data;
    const maxCount = Math.max(...requestVolume.map((r) => r.count), 1);

    return (
        <div className="admin-container">
            <Navbar />
            <h2 className="header">Admin Dashboard</h2>

            <div className="admin-content">

                {/* Request Volume */}
                <div className="admin-card">
                    <h3>Request Volume <span className="card-subtitle">(last 24h)</span></h3>
                    {requestVolume.length === 0 ? (
                        <p className="empty-text">No requests logged yet.</p>
                    ) : (
                        <div className="bar-chart">
                            {requestVolume.map((entry) => {
                                const hour = new Date(entry.hour).getHours();
                                const showLabel = hour % 6 === 0;
                                const heightPct = (entry.count / maxCount) * 100;
                                return (
                                    <div className="bar-col" key={entry.hour}>
                                        <span className="bar-count">{entry.count}</span>
                                        <div
                                            className="bar"
                                            style={{ height: `${Math.max(heightPct, 2)}%` }}
                                        />
                                        <span className="bar-label">{showLabel ? `${hour}:00` : ""}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Status Code Breakdown */}
                <div className="admin-card">
                    <h3>HTTP Status Codes <span className="card-subtitle">(last 24h)</span></h3>
                    {statusBreakdown.length === 0 ? (
                        <p className="empty-text">No data yet.</p>
                    ) : (
                        <div className="status-list">
                            {statusBreakdown.map((entry) => {
                                const total = statusBreakdown.reduce((sum, e) => sum + e.count, 0);
                                const pct = Math.round((entry.count / total) * 100);
                                return (
                                    <div className="status-row" key={entry.status_code}>
                                        <span
                                            className="status-badge"
                                            style={{ background: getStatusColor(entry.status_code) }}
                                        >
                                            {entry.status_code}
                                        </span>
                                        <div className="status-bar-track">
                                            <div
                                                className="status-bar-fill"
                                                style={{
                                                    width: `${pct}%`,
                                                    background: getStatusColor(entry.status_code),
                                                }}
                                            />
                                        </div>
                                        <span className="status-count">{entry.count}</span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Top Endpoints */}
                <div className="admin-card">
                    <h3>Top Endpoints <span className="card-subtitle">(last 24h)</span></h3>
                    {topEndpoints.length === 0 ? (
                        <p className="empty-text">No data yet.</p>
                    ) : (
                        <div className="endpoint-list">
                            {topEndpoints.map((entry, i) => (
                                <div className="endpoint-row" key={i}>
                                    <span className={`method-badge method-${entry.method.toLowerCase()}`}>
                                        {entry.method}
                                    </span>
                                    <span className="endpoint-path">{entry.path}</span>
                                    <span className="endpoint-count">{entry.count}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}