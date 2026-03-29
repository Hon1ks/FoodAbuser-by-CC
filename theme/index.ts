// Тема приложения FoodAbuser
// Акцентный цвет: #00ffcc (бирюзовый)
// Базовый фон: тёмная тема

import { MD3DarkTheme } from 'react-native-paper';

export const AppTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    // Основные цвета
    primary: '#00ffcc',          // Акцент — бирюзовый
    onPrimary: '#000000',        // Текст на акцентном цвете
    primaryContainer: '#003d30', // Контейнер акцента
    onPrimaryContainer: '#00ffcc',

    // Фон
    background: '#0d0d0d',       // Основной фон
    surface: '#1a1a1a',          // Поверхности (карточки, модалки)
    surfaceVariant: '#242424',   // Вариант поверхности

    // Текст
    onBackground: '#f5f5f5',     // Текст на фоне
    onSurface: '#f5f5f5',        // Текст на поверхности
    onSurfaceVariant: '#aaaaaa', // Вторичный текст

    // Акценты и состояния
    secondary: '#00cc99',        // Вторичный акцент
    error: '#ff4444',            // Ошибка
    outline: '#333333',          // Границы
  },
};

// Тип темы для TypeScript
export type AppThemeType = typeof AppTheme;
