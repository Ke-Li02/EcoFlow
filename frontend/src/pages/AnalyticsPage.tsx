import { useEffect } from "react";
import Navbar from "../components/common/Navbar";
import { useListing } from "../controllers/hooks/useListing";
import "../analytics.css";

export default function AnalyticsPage() {
    const { myListings, fetchMyListings } = useListing();

    useEffect(() => {
        fetchMyListings();
    }, [])

    return (
        <div className="analytics-container">
            <Navbar />
            <h2 className="header">User Analytics</h2>

            <div className="analytics-content">
                {/* My Listings Section */}
                <div className="my-listings">
                    <h3>My Listings</h3>
                    {myListings.map((item) => (
                        <div className="listing-card" key={item.id}>
                            <div className="listing-info">
                                <span className="listing-title">{item.name}</span>
                                <span className="listing-price">${item.hourlyRate}/hour</span>
                            </div>
                            <span className={`listing-status ${item.available ? "available" : "rented"}`}>
                                {item.available ? "Available" : "Rented" }
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}