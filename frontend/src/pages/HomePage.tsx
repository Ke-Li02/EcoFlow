import Navbar from "../components/common/Navbar";
import Searchbar from "../components/common/Searchbar";
import GalleryItem from "../components/common/GalleryItem";
import "../homepage.css";

import { useAvailableListings } from "../controllers/hooks/useAvailableListings";


export default function HomePage(){
    const { listings } = useAvailableListings();

    return(
        <div className="homepage-container">
            <Navbar/>
            <h2 className="header"> Offered Rentals</h2>
            <Searchbar/>

            <div className="gallery">
                {listings.map((item) => (
                    <GalleryItem
                    key={item.id}
                    image={item.photo_path}
                    price={item.hourly_rate.toString()}
                    />
                ))}

            </div>
        </div>
    );
}