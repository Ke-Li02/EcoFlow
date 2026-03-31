import { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { useRental } from '../controllers/hooks/useRental';
import { getRentalPeriodStatus, groupRentalsByPeriod } from '../services/rentalService';
import type { RentalRecord } from '../models/types/rental';
import { getListingImageSrc } from '../utils/listingMedia';
import '../myrentals.css';

function formatDateTime(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

type RentalSectionProps = {
  title: string;
  rentals: RentalRecord[];
  showReturnAction: boolean;
  onReturnRental: (rentalId: number) => Promise<void>;
  returningRentalId: number | null;
};

function RentalSectionTable({ title, rentals, showReturnAction, onReturnRental, returningRentalId }: Readonly<RentalSectionProps>) {
  return (
    <section className="my-rentals__section">
      <h3 className="my-rentals__section-title">{title}</h3>
      <div className="my-rentals__table-wrapper">
        <table className="my-rentals__table">
          <thead>
            <tr>
              <th>Item</th>
              <th>Vehicle</th>
              <th>Region</th>
              <th>Unlock Code</th>
              <th>Start</th>
              <th>End</th>
              <th>Hourly</th>
              <th>Total</th>
              <th>Status</th>
              {showReturnAction && <th>Action</th>}
            </tr>
          </thead>
          <tbody>
            {rentals.length === 0 && (
              <tr>
                <td colSpan={showReturnAction ? 10 : 9} className="my-rentals__empty-row">No rentals in this period.</td>
              </tr>
            )}

            {rentals.map((rental) => {
              const status = getRentalPeriodStatus(rental);
              return (
                <tr key={rental.id}>
                  <td>
                    <div className="my-rentals__item-cell">
                      <img src={getListingImageSrc(rental.listingPhotoPath)} alt={rental.listingName} />
                      <span>{rental.listingName}</span>
                    </div>
                  </td>
                  <td>{rental.vehicleType}</td>
                  <td>{rental.region}</td>
                  <td>{rental.unlockCode || 'N/A'}</td>
                  <td>{formatDateTime(rental.startDateTime)}</td>
                  <td>{formatDateTime(rental.endDateTime)}</td>
                  <td>${rental.hourlyRate}/hour</td>
                  <td>${rental.totalAmount.toFixed(2)}</td>
                  <td>
                    <span className={`my-rentals__status my-rentals__status--${status.toLowerCase()}`}>{status}</span>
                  </td>
                  {showReturnAction && (
                    <td>
                      <button
                        type="button"
                        className="my-rentals__return-btn"
                        onClick={() => onReturnRental(rental.id)}
                        disabled={Boolean(rental.returnedAt) || returningRentalId === rental.id}
                      >
                        {rental.returnedAt ? 'Returned' : returningRentalId === rental.id ? 'Returning...' : 'Return'}
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function MyRentalsPage() {
  const { rentals, loading, error, fetchMyRentals, returnMyRental } = useRental();
  const [returningRentalId, setReturningRentalId] = useState<number | null>(null);

  useEffect(() => {
    fetchMyRentals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = groupRentalsByPeriod(rentals);

  async function handleReturnRental(rentalId: number) {
    setReturningRentalId(rentalId);
    await returnMyRental(rentalId);
    setReturningRentalId(null);
  }

  return (
    <div className="my-rentals-page">
      <Navbar />
      <main className="my-rentals-container">
        <h2 className="my-rentals-title">My Rentals</h2>

        {loading && <p className="my-rentals__status-text">Loading your rentals...</p>}
        {error && <p className="my-rentals__status-text my-rentals__status-text--error">{error}</p>}

        {!loading && !error && rentals.length === 0 && (
          <p className="my-rentals__status-text">You do not have any rentals yet. Book an item to see it here.</p>
        )}

        {!loading && !error && rentals.length > 0 && (
          <>
            <RentalSectionTable
              title="Current Rentals"
              rentals={grouped.current}
              showReturnAction={true}
              onReturnRental={handleReturnRental}
              returningRentalId={returningRentalId}
            />
            <RentalSectionTable
              title="Future Rentals"
              rentals={grouped.future}
              showReturnAction={false}
              onReturnRental={handleReturnRental}
              returningRentalId={returningRentalId}
            />
            <RentalSectionTable
              title="Past Rentals"
              rentals={grouped.past}
              showReturnAction={true}
              onReturnRental={handleReturnRental}
              returningRentalId={returningRentalId}
            />
          </>
        )}
      </main>
    </div>
  );
}





