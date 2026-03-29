// Корневой layout приложения
// Оборачивает всё в провайдеры: тема, контексты, i18n

import '../i18n'; // инициализация локализации
import React from 'react';
import { Stack } from 'expo-router';
import { PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import { UserProvider } from '../contexts/UserContext';
import { DiaryProvider } from '../contexts/DiaryContext';
import { AppTheme } from '../theme';

export default function RootLayout() {
  return (
    // PaperProvider — тема React Native Paper (тёмная, акцент #00ffcc)
    <PaperProvider theme={AppTheme}>
      {/* Глобальные провайдеры состояния */}
      <UserProvider>
        <DiaryProvider>
          {/* StatusBar в тёмном стиле */}
          <StatusBar style="light" backgroundColor="#0d0d0d" />
          {/* Expo Router Stack — без хедера по умолчанию */}
          <Stack screenOptions={{ headerShown: false }} />
        </DiaryProvider>
      </UserProvider>
    </PaperProvider>
  );
}
