export interface CreateListingRequest {
    name: string;
    description: string;
    available: boolean;
    address: string;
    photo: File;
    hourlyRate: number;
}

export interface VehicleResponse {
    id: number;
    name: string;
    description: string;
    available: boolean;
    address: string;
    photo_path: string;
    hourly_rate: number;
}