import "../../galleryitem.css";

interface Props{
    image: string;
    price: string; //passed data from the Put an Item for RENT form, user can upload a png
}

export default function GalleryItem({image,price}: Props){
    return(
        <div className="gallery-item">
            <img src={image} alt="item for rent" />
            <p className="price">{price}$/booking</p>
            <button className="book-btn">Book Now✅</button>

        </div>
    );
}