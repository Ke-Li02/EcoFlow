import type { KeyboardEvent, MouseEvent } from "react";
import "../../galleryitem.css";

interface Props{
    image: string;
    price: string; //passed data from the Put an Item for RENT form, user can upload a png
    onSelect?: () => void;
    onBookNow?: () => void;
}

export default function GalleryItem({image,price,onSelect,onBookNow}: Props){
    const isClickable = typeof onSelect === "function";

    function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!isClickable) return;
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            onSelect();
        }
    }

    function handleBookNowClick(event: MouseEvent<HTMLButtonElement>) {
        event.stopPropagation();
        onBookNow?.();
    }

    return(
        <div
            className={`gallery-item${isClickable ? " gallery-item-clickable" : ""}`}
            onClick={onSelect}
            onKeyDown={handleKeyDown}
            role={isClickable ? "button" : undefined}
            tabIndex={isClickable ? 0 : undefined}
        >
            <img src={image} alt="item for rent" />
            <p className="price">${price}/hour</p>
            <button className="book-btn" type="button" onClick={handleBookNowClick}>Book Now✅</button>

        </div>
    );
}