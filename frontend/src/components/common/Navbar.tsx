import {Link} from "react-router-dom";
import "../../navbar.css";

export default function Navbar(){
    return(
        <nav className="navbar">
            <h2 className="logo">♻️EcoFlow</h2>

            <div className="nav-links">
                <Link to="/home">🏠Homepage</Link>
                <Link to="/transit">🚉STM Transit Routes</Link>
                <Link to="/parking">🔌Charging EV Parking Stations</Link>
                <Link to="/provide">📋Offer an item to rent</Link>
                <Link to="/analytics">📊Analytics</Link>
            </div>
        </nav>
    );
}