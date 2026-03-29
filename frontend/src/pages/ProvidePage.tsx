import { useEffect, useMemo, useRef, useState } from "react";
import Navbar from "../components/common/Navbar";
import { useListing } from "../controllers/hooks/useListing";
import { VehicleType, type VehicleTypeValue, Region, type RegionValue } from "../models/types/listing";
import {
    emptyProvideDraftState,
    ProvideDraftCaretaker,
    ProvideDraftOriginator,
    type ProvideDraftState,
} from "../utils/provideDraftMemento";
import "../provide.css";

export default function ProvidePage() {
    const { createListing } = useListing();
    const [name, setName] = useState(emptyProvideDraftState.name);
    const [description, setDescription] = useState(emptyProvideDraftState.description);
    const [address, setAddress] = useState(emptyProvideDraftState.address);
    const [hourlyRate, setHourlyRate] = useState<number | "">(emptyProvideDraftState.hourlyRate);
    const [vehicleType, setVehicleType] = useState<VehicleTypeValue | "">(emptyProvideDraftState.vehicleType);
    const [region, setRegion] = useState<RegionValue | "">(emptyProvideDraftState.region);
    const [photo, setPhoto] = useState<File | null>(null);
    const [photoFileName, setPhotoFileName] = useState(emptyProvideDraftState.photoFileName);
    const [draftRestored, setDraftRestored] = useState(false);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const caretaker = useMemo(() => new ProvideDraftCaretaker(), []);
    const originatorRef = useRef(new ProvideDraftOriginator(emptyProvideDraftState));

    function clearForm() {
        setName(emptyProvideDraftState.name);
        setDescription(emptyProvideDraftState.description);
        setAddress(emptyProvideDraftState.address);
        setHourlyRate(emptyProvideDraftState.hourlyRate);
        setVehicleType(emptyProvideDraftState.vehicleType);
        setRegion(emptyProvideDraftState.region);
        setPhoto(null);
        setPhotoFileName(emptyProvideDraftState.photoFileName);
        if (photoInputRef.current) {
            photoInputRef.current.value = "";
        }
    }

    useEffect(() => {
        const savedDraft = caretaker.restore();
        if (!savedDraft) return;

        const restoredState = originatorRef.current.restore(savedDraft);
        setName(restoredState.name);
        setDescription(restoredState.description);
        setAddress(restoredState.address);
        setHourlyRate(restoredState.hourlyRate);
        setVehicleType(restoredState.vehicleType);
        setRegion(restoredState.region);
        setPhotoFileName(restoredState.photoFileName);
        setDraftRestored(true);
    }, [caretaker]);

    useEffect(() => {
        const nextState: ProvideDraftState = {
            name,
            description,
            address,
            hourlyRate,
            vehicleType,
            region,
            photoFileName,
        };
        originatorRef.current.setState(nextState);
        caretaker.save(originatorRef.current.createMemento());
    }, [name, description, address, hourlyRate, vehicleType, region, photoFileName, caretaker]);

    async function handleSubmit() {
        if (!name || !description || !address || !hourlyRate || !vehicleType || !region || !photo) {
            alert("Please fill in all required fields and add a photo.");
            return;
        }

        const success = await createListing({
            name,
            description,
            available: true,
            address,
            photo,
            hourlyRate,
            vehicleType,
            region
        });

        if (!success) return;

        caretaker.clear();
        clearForm();
        setDraftRestored(false);
    }

    function handleCancel() {
        caretaker.clear();
        clearForm();
        setDraftRestored(false);
    }

    return (
        <div className="provide-container">
            <Navbar />
            <h2 className="header">Offer an Item</h2>

            <div className="provide-content">
                {/* Form Section */}
                <div className="provide-form-card">
                    <h3>New Listing</h3>
                    {draftRestored && (
                        <p className="draft-note">Draft restored. Re-select photo before posting.</p>
                    )}
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
                        <input
                            id="provide-price"
                            type="number"
                            placeholder="e.g. 15"
                            value={hourlyRate}
                            onChange={e => {
                                const nextValue = e.target.value;
                                setHourlyRate(nextValue === "" ? "" : Number(nextValue));
                            }}
                        />
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
                        <input
                            id="provide-photo"
                            type="file"
                            accept="image/*"
                            ref={photoInputRef}
                            onChange={e => {
                                const selectedPhoto = e.target.files?.[0] ?? null;
                                setPhoto(selectedPhoto);
                                setPhotoFileName(selectedPhoto?.name ?? "");
                            }}
                        />
                    </div>
                    <div className="actions-row">
                        <button className="submit-btn" onClick={handleSubmit}>Post Listing</button>
                        <button className="cancel-btn" type="button" onClick={handleCancel}>Cancel</button>
                    </div>
                </div>
            </div>
        </div>
    );
}