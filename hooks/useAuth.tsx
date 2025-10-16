import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as api from '../services/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<User>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = api.onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const userData = await api.getUserById(firebaseUser.uid);
        if (userData) {
          setUser(userData);
        } else {
          // This case might happen if user is in Auth but not in Firestore DB.
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string): Promise<User> => {
    const { user: firebaseUser } = await api.signIn(email, pass);
    const userData = await api.getUserById(firebaseUser.uid);

    if (!userData) {
      throw new Error("Datos del usuario no encontrados en la base de datos.");
    }
    setUser(userData);
    return userData;
  };

  const logout = async () => {
    await api.signOut();
    setUser(null);
  };

  const value = { user, loading, login, logout };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
