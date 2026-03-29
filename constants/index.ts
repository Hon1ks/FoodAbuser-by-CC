// Константы приложения FoodAbuser

export const COLORS = {
  accent: '#00ffcc',
  background: '#0d0d0d',
  surface: '#1a1a1a',
  surfaceVariant: '#242424',
  text: '#f5f5f5',
  textSecondary: '#aaaaaa',
  error: '#ff4444',
  success: '#00cc99',
  border: '#333333',
};

// Типы приёмов пищи с иконками (MaterialCommunityIcons)
export const MEAL_TYPES = {
  breakfast: { label: 'Завтрак', labelEn: 'Breakfast', icon: 'weather-sunny' },
  lunch:     { label: 'Обед',    labelEn: 'Lunch',     icon: 'food' },
  dinner:    { label: 'Ужин',    labelEn: 'Dinner',    icon: 'weather-night' },
  snack:     { label: 'Перекус', labelEn: 'Snack',     icon: 'food-apple' },
} as const;

// AsyncStorage ключи
export const STORAGE_KEYS = {
  USER: '@foodabuser:user',
  MEALS: '@foodabuser:meals',
  SETTINGS: '@foodabuser:settings',
  ONBOARDED: '@foodabuser:onboarded',
} as const;

// AI API — конфигурация в constants/aiConfig.ts
// Для подключения реального API: отредактируй constants/aiConfig.ts
export { AI_CONFIG } from './aiConfig';
