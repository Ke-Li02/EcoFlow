import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { getAdminDashboard, type AdminDashboardData } from "../services/adminService";
import "../admin.css";

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

    const { requestVolume } = data;
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

            </div>
        </div>
    );
}