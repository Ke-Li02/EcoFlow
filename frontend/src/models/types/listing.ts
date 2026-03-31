export interface CreateListingRequest {
    name: string;
    description: string;
    available: boolean;
    address: string;
    photo: File;
    hourlyRate: number;
    vehicleType: string;
    region: string;
}

export type UpdateListingRequest = {
    name?: string;
    description?: string;
    address?: string;
    hourlyRate?: number;
    vehicleType?: VehicleTypeValue;
    region?: RegionValue;
    photo?: File;
};

export interface VehicleResponse {
    id: number;
    name: string;
    description: string;
    available: boolean;
    address: string;
    photoPath: string;
    hourlyRate: number;
    vehicleType: string;
    region: string;
}

export interface AddListingCommandPayload {
    name: string;
    description: string;
    address: string;
    photoPath: string;
    hourlyRate: number;
    vehicleType: string;
    region: string;
    available?: boolean;
}

export interface UpdateListingCommandPayload {
    vehicleId: number;
    updates: Partial<Omit<VehicleResponse, 'id'>>;
}

export interface RemoveListingCommandPayload {
    vehicleId: number;
}

export type ListingCommand =
    | { type: 'add'; payload: AddListingCommandPayload }
    | { type: 'update'; payload: UpdateListingCommandPayload }
    | { type: 'remove'; payload: RemoveListingCommandPayload };

export interface ListingBatchResponse {
    processed: number;
    results: Array<{
        type: 'add' | 'update' | 'remove';
        vehicle?: VehicleResponse;
        vehicleId?: number;
    }>;
}

export const VehicleType = {
    Bike: "Bike",
    EV: "EV",
    Scooter: "Scooter"
} as const;

export const Region = {
    AhuntsicCartierville: "Ahuntsic-Cartierville",
    Anjou: "Anjou",
    NDG: "NDG",
    Lachine: "Lachine",
    LaSalle: "LaSalle",
    MercierHochelagaMaisonneuve: "Mercier-Hochelaga Maisonneuve",
    MontrealNord: "Montreal-Nord",
    Outremont: "Outremont",
    Westmount: "Westmount",
    PierrefondsRoxboro: "Pierrefonds-Roxboro",
    LePlateauMontRoyal: "Le Plateau-Mont Royal",
    PointeAuxTrembles: "Pointe aux Trembles",
    RosemontLaPetitePatrie: "Rosemont La Petite Patrie",
    SaintLeonard: "Saint-Leonard",
    SudOuest: "Sud-Ouest",
    WestIsland: "West-Island",
    Verdun: "Verdun",
    VilleMarie: "Ville-Marie",
    VilleraySaintMichelParcExtension: "Villeray-Saint-Michel-Parc-Extension"
} as const;

export type VehicleTypeValue = typeof VehicleType[keyof typeof VehicleType];
export type RegionValue = typeof Region[keyof typeof Region];