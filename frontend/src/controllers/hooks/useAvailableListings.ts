import { useState, useEffect } from 'react';
import * as listingService from '../../services/listingService';
import type { VehicleResponse } from '../../models/types/listing';

export function useAvailableListings() {
  const [listings, setListings] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAvailableListings();
  }, []);

  async function fetchAvailableListings() {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getAvailableVehicles();
      setListings(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to fetch listings';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { listings, loading, error };
}