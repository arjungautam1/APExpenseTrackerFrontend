import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { User } from '../types';
import { authService, LoginData, RegisterData } from '../services/auth';
import toast from 'react-hot-toast';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

type AuthAction =
  | { type: 'LOGIN_START' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE' }
  | { type: 'LOGOUT' }
  | { type: 'SET_USER'; payload: User }
  | { type: 'SET_LOADING'; payload: boolean };

interface AuthContextType extends AuthState {
  login: (data: LoginData) => Promise<boolean>;
  register: (data: RegisterData) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        isLoading: true,
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case 'SET_USER':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
      };
    case 'SET_LOADING':
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = async (data: LoginData): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.login(data);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        authService.setTokens(token, refreshToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        toast.success('Login successful!');
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        toast.error(response.message || 'Login failed');
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error.response?.data?.message || 'Login failed';
      toast.error(message);
      return false;
    }
  };

  const register = async (data: RegisterData): Promise<boolean> => {
    try {
      dispatch({ type: 'LOGIN_START' });
      
      const response = await authService.register(data);
      
      if (response.success) {
        const { user, token, refreshToken } = response.data;
        authService.setTokens(token, refreshToken);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
        toast.success('Registration successful!');
        return true;
      } else {
        dispatch({ type: 'LOGIN_FAILURE' });
        toast.error(response.message || 'Registration failed');
        return false;
      }
    } catch (error: any) {
      dispatch({ type: 'LOGIN_FAILURE' });
      const message = error.response?.data?.message || 'Registration failed';
      toast.error(message);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authService.logout();
      dispatch({ type: 'LOGOUT' });
      toast.success('Logged out successfully');
    } catch (error) {
      // Even if logout fails on server, clear local state
      authService.clearTokens();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const checkAuth = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      if (!authService.isAuthenticated()) {
        dispatch({ type: 'LOGIN_FAILURE' });
        return;
      }

      const user = await authService.getCurrentUser();
      console.log('Auth check - received user data:', user);
      dispatch({ type: 'SET_USER', payload: user });
    } catch (error) {
      console.log('Auth check failed:', error);
      authService.clearTokens();
      dispatch({ type: 'LOGIN_FAILURE' });
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const value: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}