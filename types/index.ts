// Глобальные TypeScript типы приложения FoodAbuser

// --- Пользователь ---
export interface User {
  id: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;       // кг
  height?: number;       // см
  goal?: UserGoal;
  language: 'ru' | 'en';
  createdAt: string;     // ISO date
}

export type UserGoal = 'lose_weight' | 'maintain' | 'gain_weight' | 'track_habits';

// --- Приём пищи ---
export interface MealEntry {
  id: string;
  userId: string;
  date: string;          // YYYY-MM-DD
  time: string;          // HH:MM
  type: MealType;
  photoUri?: string;     // Локальный URI фото
  description?: string;
  aiAnalysis?: AIAnalysisResult;
  createdAt: string;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// --- AI анализ еды ---
export interface AIAnalysisResult {
  foodName: string;      // Название блюда
  grams: number;         // Вес в граммах
  calories: number;      // ккал
  protein: number;       // Белки, г
  fat: number;           // Жиры, г
  carbs: number;         // Углеводы, г
  confidence: number;    // Уверенность AI, 0-1
  isStub?: boolean;      // true если это заглушка
}

// --- Дневная статистика ---
export interface DailyStats {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalFat: number;
  totalCarbs: number;
  mealCount: number;
}

// --- Навигация ---
export type RootStackParamList = {
  index: undefined;
  'auth/login': undefined;
  'auth/register': undefined;
  '(tabs)': undefined;
  'meal/[id]': { id: string };
};
