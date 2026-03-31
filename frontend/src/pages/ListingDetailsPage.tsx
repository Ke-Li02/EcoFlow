import { useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useListing } from '../controllers/hooks/useListing';
import type { VehicleResponse } from '../models/types/listing';
import { getListingImageSrc } from '../utils/listingMedia';
import '../listingdetails.css';

type ListingRouteState = {
  listing?: VehicleResponse;
};

export default function ListingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { listings, loading, error, fetchAvailableListings } = useListing();

  const listingId = Number(id);
  const routeState = location.state as ListingRouteState | null;
  const listingFromState = routeState?.listing;

  const listing =
    listingFromState && listingFromState.id === listingId
      ? listingFromState
      : listings.find((item) => item.id === listingId);

  useEffect(() => {
    if (!Number.isFinite(listingId)) {
      return;
    }

    if (!listingFromState || listingFromState.id !== listingId) {
      fetchAvailableListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, listingFromState]);

  if (!Number.isFinite(listingId)) {
    return (
      <div className="listing-details-page">
        <Navbar />
        <div className="listing-details-card">
          <h2>Invalid listing</h2>
          <p>The selected listing id is not valid.</p>
          <button type="button" className="listing-back-btn" onClick={() => navigate('/home')}>
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="listing-details-page">
      <Navbar />
      <div className="listing-details-wrapper">
        {loading && !listing && <p className="listing-status">Loading listing details...</p>}
        {error && !listing && <p className="listing-status error">{error}</p>}

        {!loading && !listing && (
          <div className="listing-details-card">
            <h2>Listing not found</h2>
            <p>This listing is no longer available.</p>
            <button type="button" className="listing-back-btn" onClick={() => navigate('/home')}>
              Back to listings
            </button>
          </div>
        )}

        {listing && (
          <article className="listing-details-card">
            <img
              className="listing-photo"
              src={getListingImageSrc(listing.photoPath)}
              alt={listing.name}
            />
            <div className="listing-meta">
              <h1>{listing.name}</h1>
              <p className="listing-price">${listing.hourlyRate}/hour</p>
              <p>{listing.description}</p>
              <p><strong>Vehicle Type:</strong> {listing.vehicleType}</p>
              <p><strong>Region:</strong> {listing.region}</p>
              <p><strong>Address:</strong> {listing.address}</p>
              <p><strong>Availability:</strong> {listing.available ? 'Available' : 'Not available'}</p>
              <p><strong>Listing ID:</strong> {listing.id}</p>
              <button
                type="button"
                className="listing-book-btn"
                onClick={() => navigate(`/booking/${listing.id}`, { state: { listing } })}
              >
                Book this item
              </button>
              <button type="button" className="listing-back-btn" onClick={() => navigate('/home')}>
                Back to listings
              </button>
            </div>
          </article>
        )}
      </div>
    </div>
  );
}


