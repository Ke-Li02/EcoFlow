export interface RentalRecord {
  id: number;
  listingId: number;
  unlockCode: string;
  listingName: string;
  listingPhotoPath: string;
  vehicleType: string;
  region: string;
  hourlyRate: number;
  startDateTime: string;
  endDateTime: string;
  returnedAt: string | null;
  totalAmount: number;
  createdAt: string;
}

export interface CreateRentalRequest {
  vehicleId: number;
  startDateTime: string;
  endDateTime: string;
  totalAmount: number;
}

export type RentalPeriodStatus = 'Past' | 'Current' | 'Future';

export interface GroupedRentals {
  past: RentalRecord[];
  current: RentalRecord[];
  future: RentalRecord[];
}




