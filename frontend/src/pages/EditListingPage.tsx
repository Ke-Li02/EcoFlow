import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Navbar from "../components/common/Navbar";
import { useListing } from "../controllers/hooks/useListing";
import { getListingImageSrc } from "../utils/listingMedia";
import {
    VehicleType,
    type VehicleTypeValue,
    Region,
    type RegionValue,
} from "../models/types/listing";
import "../provide.css";
import "../edit.css";

export default function EditListingPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, fetchListingById, updateListing, deleteListing } = useListing();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [address, setAddress] = useState("");
    const [hourlyRate, setHourlyRate] = useState<number | "">("");
    const [vehicleType, setVehicleType] = useState<VehicleTypeValue | "">("");
    const [region, setRegion] = useState<RegionValue | "">("");
    const [photo, setPhoto] = useState<File | null>(null);
    const [existingPhotoUrl, setExistingPhotoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [confirmDelete, setConfirmDelete] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (error) alert(error);
    }, [error]);

    useEffect(() => {
        const numericId = id ? Number(id) : null;
        if (!numericId) return;

        fetchListingById(numericId).then((listing) => {
            if (!listing) return;
            setName(listing.name);
            setDescription(listing.description);
            setAddress(listing.address);
            setHourlyRate(listing.hourlyRate);

            if (Object.values(VehicleType).includes(listing.vehicleType as VehicleTypeValue)) {
                setVehicleType(listing.vehicleType as VehicleTypeValue);
            }

            if (Object.values(Region).includes(listing.region as RegionValue)) {
                setRegion(listing.region as RegionValue);
            }

            setExistingPhotoUrl(listing.photoPath ?? null);
            setLoading(false);
        });
    }, [id]);

    async function handleSave() {
        const numericId = id ? Number(id) : null;
        if (!numericId) return;

        if (!name || !description || !address || !hourlyRate || !vehicleType || !region) {
            alert("Please fill in all required fields.");
            return;
        }

        const success = await updateListing(numericId, {
            name,
            description,
            address,
            hourlyRate,
            vehicleType,
            region,
            ...(photo ? { photo } : {}),
        });

        if (success) navigate("/analytics");
    }

    async function handleDelete() {
        const numericId = id ? Number(id) : null;
        if (!numericId) return;

        if (!confirmDelete) {
            setConfirmDelete(true);
            return;
        }
        const success = await deleteListing(numericId);
        if (success) navigate("/analytics");
    }

    if (loading) {
        return (
            <div className="provide-container">
                <Navbar />
                <p className="loading-text">Loading listing...</p>
            </div>
        );
    }

    return (
        <div className="provide-container">
            <Navbar />
            <h2 className="header">Edit Listing</h2>

            <div className="provide-content">
                <div className="provide-form-card">
                    <h3>Update Listing</h3>

                    <div className="form-group">
                        <label htmlFor="edit-name">Item Name</label>
                        <input
                            id="edit-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-description">Description</label>
                        <textarea
                            id="edit-description"
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-address">Pickup Address</label>
                        <input
                            id="edit-address"
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-price">Price per hour ($)</label>
                        <input
                            id="edit-price"
                            type="number"
                            value={hourlyRate}
                            onChange={(e) =>
                                setHourlyRate(e.target.value === "" ? "" : Number(e.target.value))
                            }
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-type">Vehicle Type</label>
                        <select
                            id="edit-type"
                            value={vehicleType}
                            onChange={(e) => setVehicleType(e.target.value as VehicleTypeValue)}
                        >
                            <option value="">Select a type</option>
                            {Object.values(VehicleType).map((t) => (
                                <option key={t} value={t}>{t}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-region">Region</label>
                        <select
                            id="edit-region"
                            value={region}
                            onChange={(e) => setRegion(e.target.value as RegionValue)}
                        >
                            <option value="">Select a region</option>
                            {Object.values(Region).map((r) => (
                                <option key={r} value={r}>{r}</option>
                            ))}
                        </select>
                    </div>

                    <div className="form-group">
                        <label htmlFor="edit-photo">Photo</label>
                        {existingPhotoUrl && !photo && (
                            <img
                                src={getListingImageSrc(existingPhotoUrl)}
                                alt="Current listing"
                                className="existing-photo-preview"
                            />
                        )}
                        <input
                            id="edit-photo"
                            type="file"
                            accept="image/*"
                            ref={photoInputRef}
                            onChange={(e) => {
                                const selected = e.target.files?.[0] ?? null;
                                setPhoto(selected);
                            }}
                        />
                        {photo && (
                            <p className="draft-note">New photo selected: {photo.name}</p>
                        )}
                    </div>

                    {/* Save + Cancel */}
                    <div className="actions-row">
                        <button className="submit-btn" onClick={handleSave}>
                            Save Changes
                        </button>
                        <button className="cancel-btn" onClick={() => navigate("/analytics")}>
                            Cancel
                        </button>
                    </div>

                    {/* Delete */}
                    <button
                        className={`delete-btn ${confirmDelete ? "delete-confirm" : ""}`}
                        onClick={handleDelete}
                    >
                        {confirmDelete ? "⚠️ Tap again to confirm delete" : "🗑 Delete Listing"}
                    </button>
                </div>
            </div>
        </div>
    );
}