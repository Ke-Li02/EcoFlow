import { useState } from 'react';
import * as listingService from '../../services/listingService';
import type { VehicleResponse, CreateListingRequest } from '../../models/types/listing';

export function useListing() {
  const [listings, setListings] = useState<VehicleResponse[]>([]);
  const [myListings, setMyListings] = useState<VehicleResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  async function fetchMyListings() {
    setLoading(true);
    setError(null);
    try {
      const data = await listingService.getMyVehicles();
      setMyListings(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to fetch your listings';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  async function createListing(data: CreateListingRequest) {
    setLoading(true);
    setError(null);
    try {
      await listingService.createVehicle(data);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Failed to create listing';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return { listings, myListings, loading, error, fetchAvailableListings, fetchMyListings, createListing };
}