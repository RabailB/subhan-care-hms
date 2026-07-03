import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { UserAccount, UserRole } from '../types';
import { db, logActivity } from '../services/db';

interface AuthContextType {
  user: UserAccount | null;
  login: (username: string, passwordPlain: string) => { success: boolean; error?: string };
  logout: (reason?: string) => void;
  resetPassword: (username: string, contactNum: string, newPasswordPlain: string) => { success: boolean; error?: string };
  sessionTimeRemaining: number; // in seconds
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const INACTIVITY_TIMEOUT_SEC = 15 * 60; // 15 minutes in seconds

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserAccount | null>(null);
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState<number>(INACTIVITY_TIMEOUT_SEC);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const timeTrackerRef = useRef<number>(INACTIVITY_TIMEOUT_SEC);

  const logout = (reason = 'Manual Logout') => {
    if (user) {
      logActivity(user.userId, user.username, user.role, `User Logout: ${reason}`, 'UserAccount', user.userId);
    }
    setUser(null);
    setSessionTimeRemaining(INACTIVITY_TIMEOUT_SEC);
    if (timerRef.current) clearInterval(timerRef.current);
    localStorage.removeItem('subhancare_active_user');
  };

  const login = (username: string, passwordPlain: string) => {
    const res = db.login(username, passwordPlain);
    if (res.success && res.user) {
      setUser(res.user);
      localStorage.setItem('subhancare_active_user', JSON.stringify(res.user));
      resetInactivityTimer();
    }
    return { success: res.success, error: res.error };
  };

  const resetPassword = (username: string, contactNum: string, newPasswordPlain: string) => {
    return db.resetPassword(username, contactNum, newPasswordPlain);
  };

  const resetInactivityTimer = () => {
    timeTrackerRef.current = INACTIVITY_TIMEOUT_SEC;
    setSessionTimeRemaining(INACTIVITY_TIMEOUT_SEC);
  };

  // Check if session was preserved in localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('subhancare_active_user');
    if (savedUser) {
      try {
        const u = JSON.parse(savedUser) as UserAccount;
        setUser(u);
        resetInactivityTimer();
      } catch {
        localStorage.removeItem('subhancare_active_user');
      }
    }
  }, []);

  // Monitor user activity to reset inactivity timer
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      resetInactivityTimer();
    };

    window.addEventListener('mousemove', handleActivity);
    window.addEventListener('keydown', handleActivity);
    window.addEventListener('click', handleActivity);
    window.addEventListener('scroll', handleActivity);

    return () => {
      window.removeEventListener('mousemove', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('click', handleActivity);
      window.removeEventListener('scroll', handleActivity);
    };
  }, [user]);

  // Session Inactivity Countdown Timer
  useEffect(() => {
    if (!user) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    timerRef.current = setInterval(() => {
      timeTrackerRef.current -= 1;
      setSessionTimeRemaining(timeTrackerRef.current);

      if (timeTrackerRef.current <= 0) {
        logout('Session Inactivity Timeout (15 minutes)');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [user]);

  return (
    <AuthContext.Provider value={{
      user,
      login,
      logout,
      resetPassword,
      sessionTimeRemaining
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
