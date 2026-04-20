import { create } from 'zustand';

interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
}

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  updateUser: (profile: Partial<UserProfile>) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => set({ user, isLoading: false }),
  setLoading: (loading) => set({ isLoading: loading }),
  updateUser: (profile) => set((state) => ({
    user: state.user ? { ...state.user, ...profile } : null
  })),
}));
