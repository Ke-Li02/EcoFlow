import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import { useListing } from '../controllers/hooks/useListing';
import { useRental } from '../controllers/hooks/useRental';
import type { VehicleResponse } from '../models/types/listing';
import { getListingImageSrc } from '../utils/listingMedia';
import '../booking.css';
import emailjs from '@emailjs/browser';

//EmailJS keys
const EMAILJS_SERVICE_ID = 'service_y11edji';
const EMAILJS_TEMPLATE_ID = 'template_j9vwamr';
const EMAILJS_PUBLIC_KEY = 'EU1TRthi4MvBj0CYF';

type BookingRouteState = {
  listing?: VehicleResponse;
};

export default function BookingPage() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const { listings, loading, error, fetchAvailableListings } = useListing();
  const { createMyRental } = useRental();

  const [startDateTime, setStartDateTime] = useState('');
  const [endDateTime, setEndDateTime] = useState('');
  const [cardholderName, setCardholderName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [email, setEmail] = useState('');

  const listingId = Number(id);
  const routeState = location.state as BookingRouteState | null;
  const listingFromState = routeState?.listing;

  const listing =
    listingFromState && listingFromState.id === listingId
      ? listingFromState
      : listings.find((item) => item.id === listingId);

  useEffect(() => {
    if (!Number.isFinite(listingId)) return;
    if (!listingFromState || listingFromState.id !== listingId) {
      fetchAvailableListings();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId, listingFromState]);

  const estimatedHours = useMemo(() => {
    if (!startDateTime || !endDateTime) return 0;

    const start = new Date(startDateTime).getTime();
    const end = new Date(endDateTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return 0;

    return (end - start) / (1000 * 60 * 60);
  }, [startDateTime, endDateTime]);

  const estimatedTotal = useMemo(() => {
    if (!listing || estimatedHours <= 0) return 0;
    return estimatedHours * listing.hourlyRate;
  }, [estimatedHours, listing]);

  function validateForm() {
    //make sure that the email is valid
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return 'Please enter a valid email address.';
    }
    if (!listing) return 'Listing not found.';
    if (!startDateTime || !endDateTime) return 'Please select start and end date/time.';

    const start = new Date(startDateTime).getTime();
    const end = new Date(endDateTime).getTime();
    if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
      return 'End date/time must be after start date/time.';
    }

    if (!cardholderName.trim()) return 'Please enter the cardholder name.';

    const normalizedCard = cardNumber.replace(/\s+/g, '');
    if (!/^\d{16}$/.test(normalizedCard)) {
      return 'Card number must be 16 digits.';
    }

    if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(expiryDate)) {
      return 'Expiry date must be in MM/YY format.';
    }

    if (!/^\d{3,4}$/.test(cvv)) {
      return 'CVV must be 3 or 4 digits.';
    }

    return null;
  }

  //EmailJS sender
  async function sendConfirmationEmail() {
  if (!listing) return;

  // Simulate a cryptographic NFC unlock key
  const rawSeed = `${listing.id}-${email.trim()}-${startDateTime}-${endDateTime}-${Date.now()}`;
  const encodedSeed = btoa(unescape(encodeURIComponent(rawSeed))); //base64 encoding
  // XOR-scramble 
  const keyBytes = encodedSeed
    .split('')
    .map((char, i) => (char.charCodeAt(0) ^ (0xA3 + i * 0x07)).toString(16).padStart(2, '0'))
    .join('');
  const formattedKey = keyBytes.match(/.{1,8}/g)?.join('-') ?? keyBytes; //some formatting
  const keyFileContent = `ECOFLOW-NFC-KEY-V1\n${formattedKey}`;
  const base64Attachment = btoa(unescape(encodeURIComponent(keyFileContent)));

  const templateParams = {
    email: email.trim(),
    attachment: base64Attachment,
    attachment_name: 'ecoflow-key.txt',
  };

  await emailjs.send(
    EMAILJS_SERVICE_ID,
    EMAILJS_TEMPLATE_ID,
    templateParams,
    EMAILJS_PUBLIC_KEY,
  );
}

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextError = validateForm();

    if (nextError) {
      setFormError(nextError);
      setPaymentSuccess(false);
      return;
    }

    if (!listing) {
      setFormError('Listing not found.');
      setPaymentSuccess(false);
      return;
    }

    const result = await createMyRental(listing, startDateTime, endDateTime, estimatedTotal);
    if (!result.ok) {
      setFormError(result.error ?? 'Failed to save your booking.');
      setPaymentSuccess(false);
      return;
    }

    setFormError(null);
    setPaymentSuccess(true);
    await sendConfirmationEmail(); //sending the email
  }

  if (!Number.isFinite(listingId)) {
    return (
      <div className="booking-page">
        <Navbar />
        <div className="booking-panel">
          <h2>Invalid listing</h2>
          <p>The selected listing id is not valid.</p>
          <button type="button" className="booking-back-btn" onClick={() => navigate('/home')}>
            Back to listings
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <Navbar />
      <div className="booking-wrapper">
        {loading && !listing && <p className="booking-status">Loading booking details...</p>}
        {error && !listing && <p className="booking-status error">{error}</p>}

        {!loading && !listing && (
          <div className="booking-panel">
            <h2>Listing not found</h2>
            <p>This listing is no longer available.</p>
            <button type="button" className="booking-back-btn" onClick={() => navigate('/home')}>
              Back to listings
            </button>
          </div>
        )}

        {listing && (
          <div className="booking-grid">
            <article className="booking-panel booking-summary">
              <img src={getListingImageSrc(listing.photoPath)} alt={listing.name} className="booking-photo" />
              <h1>{listing.name}</h1>
              <p className="booking-price">${listing.hourlyRate}/hour</p>
              <p>{listing.description}</p>
              <p><strong>Vehicle Type:</strong> {listing.vehicleType}</p>
              <p><strong>Region:</strong> {listing.region}</p>
              <p><strong>Address:</strong> {listing.address}</p>
              {estimatedTotal > 0 && (
                <p className="booking-total">
                  Estimated total: ${estimatedTotal.toFixed(2)} ({estimatedHours.toFixed(2)} h)
                </p>
              )}
            </article>

            <form className="booking-panel booking-form" onSubmit={handleSubmit}>
              <h2>Book This Item</h2>

              <div className="booking-field">
                <label htmlFor="booking-start">Start date and time</label>
                <input
                  id="booking-start"
                  type="datetime-local"
                  value={startDateTime}
                  onChange={(event) => setStartDateTime(event.target.value)}
                />
              </div>

              <div className="booking-field">
                <label htmlFor="booking-end">End date and time</label>
                <input
                  id="booking-end"
                  type="datetime-local"
                  value={endDateTime}
                  onChange={(event) => setEndDateTime(event.target.value)}
                />
              </div>

              <div className="booking-field">
                <label htmlFor="booking-email">Email address</label>
                <input
                  id="booking-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <h3>Mock Payment</h3>

              <div className="booking-field">
                <label htmlFor="booking-cardholder">Cardholder name</label>
                <input
                  id="booking-cardholder"
                  type="text"
                  placeholder="Name on card"
                  value={cardholderName}
                  onChange={(event) => setCardholderName(event.target.value)}
                />
              </div>

              <div className="booking-field">
                <label htmlFor="booking-card-number">Card number</label>
                <input
                  id="booking-card-number"
                  type="text"
                  inputMode="numeric"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(event) => setCardNumber(event.target.value)}
                />
              </div>

              <div className="booking-inline-fields">
                <div className="booking-field">
                  <label htmlFor="booking-expiry">Expiry (MM/YY)</label>
                  <input
                    id="booking-expiry"
                    type="text"
                    placeholder="MM/YY"
                    value={expiryDate}
                    onChange={(event) => setExpiryDate(event.target.value)}
                  />
                </div>

                <div className="booking-field">
                  <label htmlFor="booking-cvv">CVV</label>
                  <input
                    id="booking-cvv"
                    type="password"
                    inputMode="numeric"
                    placeholder="123"
                    value={cvv}
                    onChange={(event) => setCvv(event.target.value)}
                  />
                </div>
              </div>

              {formError && <p className="booking-status error">{formError}</p>}
              {paymentSuccess && (
                <p className="booking-status success">
                  Mock payment successful. Your booking request was submitted.
                </p>
              )}

              <div className="booking-actions">
                <button type="submit" className="booking-submit-btn">Confirm booking</button>
                {paymentSuccess && (
                  <button type="button" className="booking-submit-btn" onClick={() => navigate('/my-rentals')}>
                    View my rentals
                  </button>
                )}
                <button type="button" className="booking-back-btn" onClick={() => navigate(`/listing/${listing.id}`, { state: { listing } })}>
                  Back to details
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}


