import Navbar from "../components/common/NavBar";
import Searchbar from "../components/common/Searchbar";
import GalleryItem from "../components/common/GalleryItem";
import "../homepage.css";

import bike1 from "../assets/bike1.jpg";
import scooter1 from "../assets/scooter1.jpg";
import ev1 from "../assets/ev1.jpg";


export default function HomePage(){
    //hardcoded, change
    const rentals = [
        {
            image: bike1,
            price: "15"
        },
        {
            image: scooter1,
            price: "20"
        },
        {
            image: ev1,
            price: "45"
        }

    ];

    return(
        <div className="homepage-container">
            <Navbar/>
            <h2 className="header"> Offered Rentals</h2>
            <Searchbar/>

            <div className="gallery">
                {rentals.map((item, index) => (
                    <GalleryItem
                    key={index}
                    image={item.image}
                    price={item.price}
                    />
                ))}

            </div>
        </div>
    );
}