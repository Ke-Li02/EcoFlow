import { getUser } from '../store/authStore';
import type { RegionValue, VehicleTypeValue } from '../models/types/listing';

export interface ProvideDraftState {
  name: string;
  description: string;
  address: string;
  hourlyRate: number | '';
  vehicleType: VehicleTypeValue | '';
  region: RegionValue | '';
  photoFileName: string;
}

export class ProvideDraftMemento {
  private readonly state: ProvideDraftState;

  constructor(state: ProvideDraftState) {
    this.state = { ...state };
  }

  getState(): ProvideDraftState {
    return { ...this.state };
  }
}

export class ProvideDraftOriginator {
  private state: ProvideDraftState;

  constructor(initialState: ProvideDraftState) {
    this.state = initialState;
  }

  setState(nextState: ProvideDraftState): void {
    this.state = { ...nextState };
  }

  createMemento(): ProvideDraftMemento {
    return new ProvideDraftMemento(this.state);
  }

  restore(memento: ProvideDraftMemento): ProvideDraftState {
    this.state = memento.getState();
    return { ...this.state };
  }
}

export class ProvideDraftCaretaker {
  private readonly storageKey: string;

  constructor() {
    const user = getUser();
    const userScope = user ? String(user.id) : 'anonymous';
    this.storageKey = `ecoflow_provide_draft_v1:${userScope}`;
  }

  save(memento: ProvideDraftMemento): void {
    localStorage.setItem(this.storageKey, JSON.stringify(memento.getState()));
  }

  restore(): ProvideDraftMemento | null {
    const raw = localStorage.getItem(this.storageKey);
    if (!raw) return null;

    try {
      const parsed = JSON.parse(raw) as ProvideDraftState;
      return new ProvideDraftMemento(parsed);
    } catch {
      return null;
    }
  }

  clear(): void {
    localStorage.removeItem(this.storageKey);
  }
}

export const emptyProvideDraftState: ProvideDraftState = {
  name: '',
  description: '',
  address: '',
  hourlyRate: '',
  vehicleType: '',
  region: '',
  photoFileName: '',
};


