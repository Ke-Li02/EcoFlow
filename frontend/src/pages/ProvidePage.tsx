import { useEffect, useState, useRef } from "react";
import Navbar from "../components/common/Navbar";
import { useListing } from "../controllers/hooks/useListing";
import { VehicleType, type VehicleTypeValue, Region, type RegionValue } from "../models/types/listing";
import "../provide.css";

export default function ProvidePage() {
    const { myListings, fetchMyListings, createListing } = useListing();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [hourlyRate, setHourlyRate] = useState<number | "">("");
    const [vehicleType, setVehicleType] = useState<VehicleTypeValue | "">("");
    const [region, setRegion] = useState<RegionValue | "">("");
    const [photo, setPhoto] = useState<File | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchMyListings();
    }, [])

    async function handleSubmit() {
        if (!name || !description || !address || !hourlyRate || !vehicleType || !region || !photo) {
            alert("Please fill in all required fields and add a photo.");
            return;
        }

        await createListing({
            name,
            description,
            available: true,
            address,
            photo,
            hourlyRate,
            vehicleType,
            region
        });

        setName("");
        setDescription("");
        setAddress("");
        setHourlyRate("");
        setVehicleType("");
        setRegion("");
        setPhoto(null);
        
        if (photoInputRef.current) photoInputRef.current.value = ""

        fetchMyListings();
    }

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
                        <input id="provide-name" type="text" placeholder="e.g. Mountain Bike" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-description">Description</label>
                        <textarea id="provide-description" placeholder="Describe your item..." rows={3} value={description} onChange={e => setDescription(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-address">Pickup address</label>
                        <input id="provide-address" type="text" placeholder="e.g. 1455, boulevard de Maisonneuve O, Montréal, QC" value={address} onChange={e => setAddress(e.target.value)} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-price">Price per hour ($)</label>
                        <input id="provide-price" type="number" placeholder="e.g. 15" value={hourlyRate} onChange={e => setHourlyRate(Number(e.target.value))} />
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-type">Vehicle Type</label>
                        <select id="provide-type" value={vehicleType} onChange={e => setVehicleType(e.target.value as VehicleTypeValue)}>
                            <option value="">Select a type</option>
                            {Object.values(VehicleType).map(t => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-region">Region</label>
                        <select id="provide-region" value={region} onChange={e => setRegion(e.target.value as RegionValue)}>
                            <option value="">Select a region</option>
                            {Object.values(Region).map(r => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label htmlFor="provide-photo">Photo</label>
                        <input id="provide-photo" type="file" accept="image/*" ref={photoInputRef} onChange={e => setPhoto(e.target.files?.[0] ?? null)} />
                    </div>
                    <button className="submit-btn" onClick={handleSubmit}>📋 Post Listing</button>
                </div>

                {/* My Listings Section */}
                <div className="my-listings">
                    <h3>My Listings</h3>
                    {myListings.map((item) => (
                        <div className="listing-card" key={item.id}>
                            <div className="listing-info">
                                <span className="listing-title">{item.name}</span>
                                <span className="listing-price">${item.hourlyRate}/hour</span>
                            </div>
                            <span className={`listing-status ${item.available ? "available" : "rented"}`}>
                                {item.available ? "Available" : "Rented" }
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}