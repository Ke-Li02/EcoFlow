import "./searchbar.css";

export default function Searchbar(){
    return(
        <div className="search-container">
            <select className="type-dropdown">
                <option>Type</option>
                <option>All Types</option>
                <option>Bike🚲</option>
                <option>EV🚗</option>
                <option>Scooter🛴</option>
            </select>

            <select className="region-dropdown">
                <option>Region</option>
                <option>All Regions</option>
                <option>Ahuntsic-Cartierville</option>
                <option>Anjou</option>
                <option>NDG</option>
                <option>Lachine</option>
                <option>LaSalle</option>
                <option>Mercier-Hochelaga Maisonneuve</option>
                <option>Montreal-Nord</option>
                <option>Outremont</option>
                <option>Westmount</option>
                <option>Pierrefonds-Roxboro</option>
                <option>Le Plateau-Mont Royal</option>
                <option>Pointe aux Trembles</option>
                <option>Rosemont La Petite Patrie</option>
                <option>Saint-Leonard</option>
                <option>Sud-Ouest</option>
                <option>West-Island</option>
                <option>Verdun</option>
                <option>Ville-Marie</option>
                <option>Villeray-Saint Michel-Par Extension</option>
            </select>

            <button className="search-btn">Search🔍</button>


        </div>
    );
}