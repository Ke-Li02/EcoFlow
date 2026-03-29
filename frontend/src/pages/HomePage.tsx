import Navbar from "../components/common/Navbar";
import Searchbar from "../components/common/Searchbar";
import GalleryItem from "../components/common/GalleryItem";
import { useNavigate } from "react-router-dom";
import { getListingImageSrc } from "../utils/listingMedia";
import "../homepage.css";

import { useListing } from "../controllers/hooks/useListing";
import { useState } from "react";
import type { VehicleResponse } from "../models/types/listing";


export default function HomePage(){
    const { listings, fetchAvailableListings } = useListing();
    const navigate = useNavigate();
    const [vehicleType, setVehicleType] = useState<string | null>(null);
    const [region, setRegion] = useState<string | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    async function handleSearch(newVehicleType: string | null, newRegion: string | null) {
        setVehicleType(newVehicleType);
        setRegion(newRegion);
        await fetchAvailableListings();
        setHasSearched(true);
    }

    function handleListingSelect(listing: VehicleResponse) {
        navigate(`/listing/${listing.id}`, { state: { listing } });
    }

    function handleBookNow(listing: VehicleResponse) {
        navigate(`/booking/${listing.id}`, { state: { listing } });
    }

    const filteredListings = listings.filter((item) =>
        (vehicleType === null || vehicleType === item.vehicleType) &&
        (region === null || region === item.region)
    );

    return(
        <div className="homepage-container">
            <Navbar/>
            <h2 className="header"> Offered Rentals</h2>
            <Searchbar
                onSearch={handleSearch}
            />

            <div className="gallery">
                {!hasSearched && (
                    <p className="gallery-placeholder">No rentals loaded yet. Press Search to see results.</p>
                )}

                {hasSearched && filteredListings.length === 0 && (
                    <p className="gallery-placeholder">No rentals found. Try different filters and press Search again.</p>
                )}

                {hasSearched && filteredListings.map((item) => (
                    <GalleryItem
                    key={item.id}
                    image={getListingImageSrc(item.photoPath)}
                    price={item.hourlyRate.toString()}
                    onSelect={() => handleListingSelect(item)}
                    onBookNow={() => handleBookNow(item)}
                    />
                ))}

            </div>
        </div>
    );
}