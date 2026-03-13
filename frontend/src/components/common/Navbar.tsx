import { Link } from "react-router-dom";
import { clearToken } from '../../store/authStore';
import "../../navbar.css";

export default function Navbar(){
    return(
        <nav className="navbar">
            <h2 className="logo">♻️EcoFlow</h2>

            <div className="nav-links">
                <Link to="/home">🏠Homepage</Link>
                <Link to="/stm">🚉STM Routes</Link>
                <Link to="/charging">🔌Charging EV Parking Stations</Link>
                <Link to="/provide">📋Offer an item to rent</Link>
                <Link to="/analytics">📊Analytics</Link>
                <Link to="/login" onClick={clearToken}>👋Sign Out</Link>
            </div>
        </nav>
    );
}