import { useRef } from "react";
import "../../searchbar.css";

interface SearchbarProps {
  onSearch: (vehicleType: string | null, region: string | null) => void;
}

export default function Searchbar({ onSearch }: Readonly<SearchbarProps>){
    const vehicleTypeRef = useRef<HTMLSelectElement>(null);
    const regionRef = useRef<HTMLSelectElement>(null);

    return(
        <div className="search-container">
            
            <select className="type-dropdown" ref={vehicleTypeRef}>
                <option value="">All Types</option>
                <option>Bike</option>
                <option>EV</option>
                <option>Scooter</option>
            </select>

            <select className="region-dropdown" ref={regionRef}>
                <option value="">All Regions</option>
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
                <option>Villeray-Saint-Michel-Parc-Extension</option>
            </select>

            <button className="search-btn" onClick={() => onSearch(vehicleTypeRef.current?.value || null, regionRef.current?.value || null)}>Search🔍</button>


        </div>
    );
}