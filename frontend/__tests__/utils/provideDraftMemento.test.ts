import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  ProvideDraftOriginator, 
  ProvideDraftMemento, 
  ProvideDraftCaretaker, 
  emptyProvideDraftState,
  type ProvideDraftState 
} from '../../src/utils/ProvideDraftMemento';
import * as authStore from '../../src/store/authStore';

vi.mock('../../src/store/authStore');

describe('Memento Pattern: ProvideDraft', () => {
  const testState: ProvideDraftState = {
    ...emptyProvideDraftState,
    name: 'Electric Bike',
    hourlyRate: 15,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  describe('ProvideDraftOriginator & Memento', () => {
    it('should create a memento with current state', () => {
      const originator = new ProvideDraftOriginator(testState);
      const memento = originator.createMemento();
      expect(memento.getState()).toEqual(testState);
    });

    it('should restore state from a memento', () => {
      const originator = new ProvideDraftOriginator(emptyProvideDraftState);
      const memento = new ProvideDraftMemento(testState);
      const restored = originator.restore(memento);
      expect(restored).toEqual(testState);
      expect(originator.createMemento().getState()).toEqual(testState);
    });

    it('should maintain immutability (shallow copy)', () => {
      const memento = new ProvideDraftMemento(testState);
      const stateFromMemento = memento.getState();
      stateFromMemento.name = 'Modified';
      expect(memento.getState().name).toBe('Electric Bike');
    });
  });

  describe('ProvideDraftCaretaker', () => {
    it('should scope storage key to user ID', () => {
      vi.spyOn(authStore, 'getUser').mockReturnValue({ id: 123 } as any);
      
      const caretaker = new ProvideDraftCaretaker();
      const memento = new ProvideDraftMemento(testState);
      caretaker.save(memento);
      
      const key = Object.keys(localStorage).find(k => k.includes('123'));
      expect(key).toBeDefined();
    });

    it('should scope storage key to anonymous if no user', () => {
      vi.spyOn(authStore, 'getUser').mockReturnValue(null);
      
      const caretaker = new ProvideDraftCaretaker();
      caretaker.save(new ProvideDraftMemento(testState));
      expect(localStorage.getItem('ecoflow_provide_draft_v1:anonymous')).toBeDefined();
    });

    it('should restore a memento from localStorage', () => {
      vi.spyOn(authStore, 'getUser').mockReturnValue(null);
      
      const caretaker = new ProvideDraftCaretaker();
      const memento = new ProvideDraftMemento(testState);
      caretaker.save(memento);
      
      const restoredMemento = caretaker.restore();
      expect(restoredMemento?.getState()).toEqual(testState);
    });

    it('should return null if storage is empty or corrupted', () => {
      vi.spyOn(authStore, 'getUser').mockReturnValue(null);
      const caretaker = new ProvideDraftCaretaker();
      
      expect(caretaker.restore()).toBeNull();
      
      localStorage.setItem('ecoflow_provide_draft_v1:anonymous', 'invalid-json');
      expect(caretaker.restore()).toBeNull();
    });

    it('should clear storage', () => {
      vi.spyOn(authStore, 'getUser').mockReturnValue(null);
      const caretaker = new ProvideDraftCaretaker();
      
      caretaker.save(new ProvideDraftMemento(testState));
      caretaker.clear();
      expect(localStorage.length).toBe(0);
    });
  });
});