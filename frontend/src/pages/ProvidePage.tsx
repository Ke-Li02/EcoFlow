import Navbar from "../components/common/Navbar";
import "../provide.css";

export default function ProvidePage() {
    const myListings = [
        { title: "Mountain Bike", price: "15", status: "Available" },
        { title: "Electric Scooter", price: "20", status: "Rented" },
    ];

    return (
        <div className="provide-container">
            <Navbar />
            <h2 className="header">Offer an Item</h2>

            <div className="provide-content">
                {/* Form Section */}
                <div className="provide-form-card">
                    <h3>New Listing</h3>
                    <div className="form-group">
                        <label htmlFor="provide-name">Item Name</label>
                        <input id="provide-name" type="text" placeholder="e.g. Mountain Bike" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-description">Description</label>
                        <textarea id="provide-description" placeholder="Describe your item..." rows={3} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-price">Price per day ($)</label>
                        <input id="provide-price" type="number" placeholder="e.g. 15" />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-photo">Photo</label>
                        <input id="provide-photo" type="file" accept="image/*" />
                    </div>
                    <button className="submit-btn">📋 Post Listing</button>
                </div>

                {/* My Listings Section */}
                <div className="my-listings">
                    <h3>My Listings</h3>
                    {myListings.map((item, index) => (
                        <div className="listing-card" key={index}>
                            <div className="listing-info">
                                <span className="listing-title">{item.title}</span>
                                <span className="listing-price">${item.price}/day</span>
                            </div>
                            <span className={`listing-status ${item.status === "Rented" ? "rented" : "available"}`}>
                                {item.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}