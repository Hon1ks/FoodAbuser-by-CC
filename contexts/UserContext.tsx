// UserContext — глобальное состояние пользователя
// Хранит профиль, токен авторизации, настройки языка

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { STORAGE_KEYS } from '../constants';
import i18n from '../i18n';

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (user: User) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
  setLanguage: (lang: 'ru' | 'en') => void;
}

const UserContext = createContext<UserContextType | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем сохранённого пользователя при старте
  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.USER);
      if (stored) {
        const parsed: User = JSON.parse(stored);
        setUser(parsed);
        // Восстанавливаем язык пользователя
        if (parsed.language) {
          i18n.changeLanguage(parsed.language);
        }
      }
    } catch (error) {
      console.error('UserContext: ошибка загрузки пользователя', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData: User) => {
    setUser(userData);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(userData));
    i18n.changeLanguage(userData.language);
  };

  const logout = async () => {
    setUser(null);
    await AsyncStorage.removeItem(STORAGE_KEYS.USER);
    i18n.changeLanguage('ru'); // сбрасываем на русский
  };

  const updateUser = async (data: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...data };
    setUser(updated);
    await AsyncStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(updated));
  };

  const setLanguage = (lang: 'ru' | 'en') => {
    i18n.changeLanguage(lang);
    updateUser({ language: lang });
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
        setLanguage,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

// Хук для удобного доступа к контексту
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser: должен быть обёрнут в UserProvider');
  }
  return context;
}
