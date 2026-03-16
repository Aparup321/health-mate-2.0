/**
 * Auth Context - Manages authentication state across the app
 */
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import { router } from "expo-router";
import {
  authApi,
  storeTokens,
  clearTokens,
  getAccessToken,
} from "./api";
import type { User, LoginRequest, SignupRequest } from "./types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (data: LoginRequest) => Promise<void>;
  signup: (data: SignupRequest) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
  });

  /** Check existing session on mount */
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const token = await getAccessToken();
      if (!token) {
        setState({ user: null, isLoading: false, isAuthenticated: false });
        return;
      }

      const response = await authApi.getMe();
      setState({
        user: response.data,
        isLoading: false,
        isAuthenticated: true,
      });
    } catch {
      await clearTokens();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }

  const login = useCallback(async (data: LoginRequest) => {
    const response = await authApi.login(data);
    const { accessToken, refreshToken, user } = response.data;
    await storeTokens({ accessToken, refreshToken });
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const signup = useCallback(async (data: SignupRequest) => {
    const response = await authApi.signup(data);
    const { accessToken, refreshToken, user } = response.data;
    await storeTokens({ accessToken, refreshToken });
    setState({ user, isLoading: false, isAuthenticated: true });
  }, []);

  const logout = useCallback(async () => {
    await clearTokens();
    setState({ user: null, isLoading: false, isAuthenticated: false });
    router.replace("/(auth)/login");
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const response = await authApi.getMe();
      setState((prev) => ({ ...prev, user: response.data }));
    } catch {
      // Silently fail - user data will be stale but functional
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{ ...state, login, signup, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/** Hook to access auth context */
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
