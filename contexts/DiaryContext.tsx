// DiaryContext — глобальное состояние дневника питания
// Хранит все приёмы пищи, предоставляет CRUD и агрегированную статистику

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { MealEntry, DailyStats } from '../types';
import { STORAGE_KEYS } from '../constants';

interface DiaryContextType {
  meals: MealEntry[];
  isLoading: boolean;
  addMeal: (meal: MealEntry) => Promise<void>;
  updateMeal: (id: string, data: Partial<MealEntry>) => Promise<void>;
  deleteMeal: (id: string) => Promise<void>;
  getMealsByDate: (date: string) => MealEntry[];
  getDailyStats: (date: string) => DailyStats;
  getMealById: (id: string) => MealEntry | undefined;
}

const DiaryContext = createContext<DiaryContextType | null>(null);

export function DiaryProvider({ children }: { children: ReactNode }) {
  const [meals, setMeals] = useState<MealEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Загружаем все приёмы пищи из AsyncStorage при старте
  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.MEALS);
      if (stored) {
        setMeals(JSON.parse(stored));
      }
    } catch (error) {
      console.error('DiaryContext: ошибка загрузки дневника', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Сохраняем в AsyncStorage при каждом изменении
  const saveMeals = async (updated: MealEntry[]) => {
    await AsyncStorage.setItem(STORAGE_KEYS.MEALS, JSON.stringify(updated));
    setMeals(updated);
  };

  const addMeal = async (meal: MealEntry) => {
    await saveMeals([...meals, meal]);
  };

  const updateMeal = async (id: string, data: Partial<MealEntry>) => {
    const updated = meals.map(m => m.id === id ? { ...m, ...data } : m);
    await saveMeals(updated);
  };

  const deleteMeal = async (id: string) => {
    await saveMeals(meals.filter(m => m.id !== id));
  };

  // Получить все записи за конкретную дату (YYYY-MM-DD)
  const getMealsByDate = (date: string) =>
    meals.filter(m => m.date === date);

  // Агрегированная статистика за день
  const getDailyStats = (date: string): DailyStats => {
    const dayMeals = getMealsByDate(date);
    return dayMeals.reduce<DailyStats>(
      (acc, meal) => {
        const ai = meal.aiAnalysis;
        if (ai) {
          acc.totalCalories += ai.calories;
          acc.totalProtein  += ai.protein;
          acc.totalFat      += ai.fat;
          acc.totalCarbs    += ai.carbs;
        }
        acc.mealCount += 1;
        return acc;
      },
      { date, totalCalories: 0, totalProtein: 0, totalFat: 0, totalCarbs: 0, mealCount: 0 }
    );
  };

  const getMealById = (id: string) => meals.find(m => m.id === id);

  return (
    <DiaryContext.Provider
      value={{
        meals,
        isLoading,
        addMeal,
        updateMeal,
        deleteMeal,
        getMealsByDate,
        getDailyStats,
        getMealById,
      }}
    >
      {children}
    </DiaryContext.Provider>
  );
}

// Хук для удобного доступа к контексту
export function useDiary() {
  const context = useContext(DiaryContext);
  if (!context) {
    throw new Error('useDiary: должен быть обёрнут в DiaryProvider');
  }
  return context;
}
