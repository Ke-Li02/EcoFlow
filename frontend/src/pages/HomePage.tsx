import Navbar from "../components/common/Navbar";
import Searchbar from "../components/common/Searchbar";
import GalleryItem from "../components/common/GalleryItem";
import "../homepage.css";

import { useListing } from "../controllers/hooks/useListing";
import { useEffect, useState } from "react";


export default function HomePage(){
    const { listings, fetchAvailableListings } = useListing();
    const [vehicleType, setVehicleType] = useState<string | null>(null);
    const [region, setRegion] = useState<string | null>(null);

    function handleSearch(newVehicleType: string | null, newRegion: string | null) {
        setVehicleType(newVehicleType);
        setRegion(newRegion);
    }

    useEffect(() => {
        fetchAvailableListings();
    }, []);

    return(
        <div className="homepage-container">
            <Navbar/>
            <h2 className="header"> Offered Rentals</h2>
            <Searchbar
                onSearch={handleSearch}
            />

            <div className="gallery">
                {listings.map((item) => (
                    (vehicleType === null || vehicleType === item.vehicleType) &&
                    (region === null || region === item.region) &&
                    <GalleryItem
                    key={item.id}
                    image={item.photoPath}
                    price={item.hourlyRate.toString()}
                    />
                ))}

            </div>
        </div>
    );
}