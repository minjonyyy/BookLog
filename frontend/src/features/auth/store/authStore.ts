import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
}

interface AuthState {
  isLoggedIn: boolean;
  token: string | null;
  user: User | null;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const useAuthStore = create<AuthState>((set) => ({
  isLoggedIn: false,
  token: null,
  user: null,
  login: (token, user) => {
    localStorage.setItem('authToken', token);
    set({ isLoggedIn: true, token, user });
  },
  logout: () => {
    localStorage.removeItem('authToken');
    set({ isLoggedIn: false, token: null, user: null });
  },
}));

export default useAuthStore; 