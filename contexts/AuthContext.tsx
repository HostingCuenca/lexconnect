'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type UserRole = 'cliente' | 'abogado' | 'administrador';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  phone?: string;
  avatar_url?: string;
  email_verified: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  loading: boolean;
  isAuthenticated: boolean;
}

interface RegisterData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
}

interface AuthResponse {
  success: boolean;
  message: string;
  data?: {
    user: User;
    token: string;
    expiresIn: string;
  };
  error?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const isAuthenticated = !!user && !!token;

  // Verificar token almacenado al cargar
  useEffect(() => {
    const checkStoredAuth = () => {
      try {
        const storedToken = localStorage.getItem('lexconnect_token');
        const storedUser = localStorage.getItem('lexconnect_user');
        
        if (storedToken && storedUser) {
          const userData = JSON.parse(storedUser);
          
          // Verificar que el token no haya expirado (simple check)
          const tokenParts = storedToken.split('.');
          if (tokenParts.length === 3) {
            try {
              const payload = JSON.parse(atob(tokenParts[1]));
              const currentTime = Math.floor(Date.now() / 1000);
              
              if (payload.exp && payload.exp > currentTime) {
                setToken(storedToken);
                setUser(userData);
                console.log('✅ Sesión restaurada para:', userData.email);
              } else {
                console.log('🕐 Token expirado, limpiando sesión');
                clearStoredAuth();
              }
            } catch (error) {
              console.error('Error decodificando token:', error);
              clearStoredAuth();
            }
          } else {
            clearStoredAuth();
          }
        }
      } catch (error) {
        console.error('Error verificando autenticación almacenada:', error);
        clearStoredAuth();
      } finally {
        setLoading(false);
      }
    };

    checkStoredAuth();
  }, []);

  const clearStoredAuth = () => {
    localStorage.removeItem('lexconnect_token');
    localStorage.removeItem('lexconnect_user');
    
    // También limpiar cookies
    document.cookie = 'lexconnect_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    
    setToken(null);
    setUser(null);
  };

  const storeAuth = (authData: { user: User; token: string }) => {
    localStorage.setItem('lexconnect_token', authData.token);
    localStorage.setItem('lexconnect_user', JSON.stringify(authData.user));
    
    // También guardar en cookies para el middleware
    document.cookie = `lexconnect_token=${authData.token}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=strict`;
    
    setToken(authData.token);
    setUser(authData.user);
  };

  const login = async (email: string, password: string) => {
    setLoading(true);
    
    try {
      console.log('🔐 Intentando login para:', email);
      
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const result: AuthResponse = await response.json();

      if (!result.success) {
        throw new Error(result.message || 'Error en el login');
      }

      if (!result.data) {
        throw new Error('Respuesta de login inválida');
      }

      storeAuth({
        user: result.data.user,
        token: result.data.token
      });

      console.log('✅ Login exitoso para:', result.data.user.email, '(' + result.data.user.role + ')');
      
    } catch (error: any) {
      console.error('❌ Error en login:', error);
      clearStoredAuth();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData: RegisterData) => {
    setLoading(true);
    
    try {
      console.log('📝 Intento de registro para:', userData.email, 'como', userData.role);
      console.log('📝 Datos completos:', userData);
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const result: AuthResponse = await response.json();
      console.log('📝 Respuesta del servidor:', result);

      if (!result.success) {
        throw new Error(result.message || 'Error en el registro');
      }

      if (!result.data) {
        throw new Error('Respuesta de registro inválida');
      }

      storeAuth({
        user: result.data.user,
        token: result.data.token
      });

      console.log('✅ Registro exitoso para:', result.data.user.email, 'con rol:', result.data.user.role);
      
    } catch (error: any) {
      console.error('❌ Error en registro:', error);
      clearStoredAuth();
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    console.log('👋 Cerrando sesión...');
    clearStoredAuth();
  };

  const contextValue: AuthContextType = {
    user,
    token,
    login,
    register,
    logout,
    loading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook para peticiones autenticadas
export function useAuthenticatedFetch() {
  const { token, logout, loading } = useAuth();

  return async (url: string, options: RequestInit = {}) => {
    // Wait for auth to load if it's still loading
    if (loading) {
      throw new Error('Autenticación cargando...');
    }
    
    if (!token) {
      throw new Error('No hay token de autenticación');
    }

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      console.log('🔒 Token expirado, cerrando sesión');
      logout();
      throw new Error('Sesión expirada. Por favor, inicia sesión nuevamente.');
    }

    return response;
  };
}