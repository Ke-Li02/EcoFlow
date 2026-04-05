import { Link } from "react-router-dom";
import { clearToken } from '../../store/authStore';
import "../../navbar.css";

export default function Navbar(){
    return(
        <nav className="navbar">
            <Link to="/home" className="logo-link">
                <h2 className="logo">♻️EcoFlow</h2>
            </Link>

            <div className="nav-links">
                <Link to="/home">🏠Homepage</Link>
                <Link to="/my-rentals">🗓️My Rentals</Link>
                <Link to="/transit">🚉STM Transit Routes</Link>
                <Link to="/parking">🔌Charging EV Parking Stations</Link>
                <Link to="/bixi">🚲Bixi Stations</Link>
                <Link to="/provide">📋Offer an item to rent</Link>
                <Link to="/analytics">📊Analytics</Link>
                <Link to="/login" onClick={clearToken}>👋Sign Out</Link>
            </div>
        </nav>
    );
}