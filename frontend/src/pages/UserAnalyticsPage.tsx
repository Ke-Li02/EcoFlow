import { useEffect } from "react";
import Navbar from "../components/common/Navbar";
import { useListing } from "../controllers/hooks/useListing";
import { useRental } from '../controllers/hooks/useRental';
import { useNavigate } from "react-router-dom";
import "../analytics.css";
import { getRentalPeriodStatus } from "../services/rentalService";

export default function UserAnalyticsPage() {
  const { myListings, fetchMyListings } = useListing();
  const { vehicleRentals, fetchMyVehicleRentals } = useRental();
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyListings();
    fetchMyVehicleRentals();
  }, []);

  const totalListings = myListings.length;
  const rentedCount = vehicleRentals.filter((r) => getRentalPeriodStatus(r) == "Current").length;
  const availableCount = Math.max(0, myListings.filter((l) => l.available).length - rentedCount);
  const totalEarnings = vehicleRentals.reduce((sum, r) => sum + r.totalAmount, 0);

  return (
    <div className="analytics-container">
      <Navbar />
      <h2 className="header">User Analytics</h2>
      <div className="analytics-content">

        {/* User Analytics Stats Section */}
        <div className="user-analytics-section">
          <h3>Overview</h3>
          <div className="stats-grid">
            <div className="stat-card">
              <span className="stat-value">{totalListings}</span>
              <span className="stat-label">Total Listings</span>
            </div>
            <div className="stat-card">
              <span className="stat-value available-text">{availableCount}</span>
              <span className="stat-label">Available</span>
            </div>
            <div className="stat-card">
              <span className="stat-value rented-text">{rentedCount}</span>
              <span className="stat-label">Rented</span>
            </div>
            <div className="stat-card">
              <span className="stat-value earnings-text">
                ${totalEarnings.toLocaleString()}
              </span>
              <span className="stat-label">Est. Total Earning</span>
            </div>
          </div>
        </div>

        {/* My Listings Section */}
        <div className="my-listings">
          <h3>My Listings</h3>
          {myListings.map((item) => (
            <div className="listing-card" key={item.id}>
              <div className="listing-info">
                <span className="listing-title">{item.name}</span>
                <span className="listing-price">${item.hourlyRate}/hour</span>
              </div>
              <div className="listing-actions">
                <span
                  className={`listing-status ${item.available ? "available" : "rented"}`}
                >
                  {item.available ? "Available" : "Rented"}
                </span>
                <button
                  className="edit-btn"
                  onClick={() => navigate(`/edit-listing/${item.id}`)}
                >
                  ✏️ Edit
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}