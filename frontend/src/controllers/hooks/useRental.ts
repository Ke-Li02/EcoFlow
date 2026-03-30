import { useState } from 'react';
import * as rentalService from '../../services/rentalService';
import type { RentalRecord } from '../../models/types/rental';
import type { VehicleResponse } from '../../models/types/listing';

export function useRental() {
  const [rentals, setRentals] = useState<RentalRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function fetchMyRentals() {
    setLoading(true);
    setError(null);
    try {
      const data = await rentalService.getMyRentals();
      setRentals(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to load rentals';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function createMyRental(
    listing: VehicleResponse,
    startDateTime: string,
    endDateTime: string,
    totalAmount: number,
  ): Promise<{ ok: boolean; error?: string }> {
    setLoading(true);
    setError(null);
    try {
      await rentalService.createRental({
        vehicleId: listing.id,
        startDateTime,
        endDateTime,
        totalAmount,
      });

      return { ok: true };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to save booking';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  async function returnMyRental(rentalId: number): Promise<{ ok: boolean; error?: string }> {
    setLoading(true);
    setError(null);

    try {
      const updatedRental = await rentalService.returnRental(rentalId);
      setRentals((currentRentals) =>
        currentRentals.map((rental) => (rental.id === rentalId ? updatedRental : rental))
      );
      return { ok: true };
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to return rental';
      setError(msg);
      return { ok: false, error: msg };
    } finally {
      setLoading(false);
    }
  }

  return { rentals, loading, error, fetchMyRentals, createMyRental, returnMyRental };
}




