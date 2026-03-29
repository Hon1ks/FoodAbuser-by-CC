// Главный экран — дневная сводка питания
// Показывает: калории/БЖУ за день, последние приёмы пищи, рекомендации

import React from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Text, Card, ProgressBar } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDiary } from '../../contexts/DiaryContext';
import { useUser } from '../../contexts/UserContext';
import { COLORS, MEAL_TYPES } from '../../constants';
import { MealEntry } from '../../types';

// Целевое количество калорий (заглушка — позже из профиля пользователя)
const DAILY_CALORIE_GOAL = 2000;

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { getMealsByDate, getDailyStats } = useDiary();

  // Сегодняшняя дата в формате YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0];
  const stats = getDailyStats(today);
  const todayMeals = getMealsByDate(today);

  // Прогресс калорий (0..1)
  const calorieProgress = Math.min(stats.totalCalories / DAILY_CALORIE_GOAL, 1);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Приветствие */}
      <Text style={styles.greeting}>
        Привет, {user?.name || 'гость'} 👋
      </Text>
      <Text style={styles.date}>{formatDate(today)}</Text>

      {/* Карточка дневной статистики */}
      <Card style={styles.statsCard}>
        <Card.Content>
          <Text style={styles.statsTitle}>{t('home.todaySummary')}</Text>

          {/* Калории с прогрессом */}
          <View style={styles.calorieRow}>
            <Text style={styles.calorieValue}>{stats.totalCalories}</Text>
            <Text style={styles.calorieUnit}> / {DAILY_CALORIE_GOAL} {t('home.calories')}</Text>
          </View>
          <ProgressBar
            progress={calorieProgress}
            color={COLORS.accent}
            style={styles.progress}
          />

          {/* БЖУ */}
          <View style={styles.macros}>
            <MacroItem label={t('home.protein')} value={stats.totalProtein} unit="г" />
            <MacroItem label={t('home.fat')}     value={stats.totalFat}     unit="г" />
            <MacroItem label={t('home.carbs')}   value={stats.totalCarbs}   unit="г" />
          </View>
        </Card.Content>
      </Card>

      {/* Список приёмов пищи за сегодня */}
      <Text style={styles.sectionTitle}>Сегодня</Text>

      {todayMeals.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>{t('home.noMeals')}</Text>
          <Text style={styles.emptyHint}>{t('home.addFirst')}</Text>
        </View>
      ) : (
        todayMeals.map(meal => (
          <MealRow key={meal.id} meal={meal} />
        ))
      )}
    </ScrollView>
  );
}

// --- Вспомогательные компоненты ---

function MacroItem({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <View style={styles.macroItem}>
      <Text style={styles.macroValue}>{Math.round(value)}{unit}</Text>
      <Text style={styles.macroLabel}>{label}</Text>
    </View>
  );
}

function MealRow({ meal }: { meal: MealEntry }) {
  const mealType = MEAL_TYPES[meal.type];
  return (
    <Card style={styles.mealCard}>
      <Card.Content style={styles.mealContent}>
        <View style={styles.mealLeft}>
          <Text style={styles.mealType}>{mealType.label}</Text>
          <Text style={styles.mealName}>
            {meal.aiAnalysis?.foodName || meal.description || '—'}
          </Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
        </View>
        {meal.aiAnalysis && (
          <View style={styles.mealRight}>
            <Text style={styles.mealCalories}>{meal.aiAnalysis.calories}</Text>
            <Text style={styles.mealCalUnit}>ккал</Text>
          </View>
        )}
      </Card.Content>
    </Card>
  );
}

// Форматирование даты на русском
function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' });
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.text,
  },
  date: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
    marginBottom: 20,
    textTransform: 'capitalize',
  },
  // Карточка статистики
  statsCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 24,
  },
  statsTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  calorieRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  calorieValue: {
    fontSize: 40,
    fontWeight: '800',
    color: COLORS.accent,
  },
  calorieUnit: {
    fontSize: 15,
    color: COLORS.textSecondary,
  },
  progress: {
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.border,
    marginBottom: 16,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  macroItem: {
    alignItems: 'center',
  },
  macroValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  macroLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Список приёмов пищи
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.textSecondary,
  },
  emptyHint: {
    fontSize: 13,
    color: COLORS.border,
    marginTop: 8,
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 8,
  },
  mealContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealLeft: {
    flex: 1,
  },
  mealType: {
    fontSize: 11,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '600',
  },
  mealName: {
    fontSize: 15,
    color: COLORS.text,
    fontWeight: '500',
    marginTop: 2,
  },
  mealTime: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCalories: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.text,
  },
  mealCalUnit: {
    fontSize: 11,
    color: COLORS.textSecondary,
  },
});
