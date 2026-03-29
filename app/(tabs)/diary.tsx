// Дневник питания — список записей с фильтром по дате
// Простой список дней с приёмами пищи (без внешних зависимостей календаря)

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Text, Card, IconButton, Chip } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDiary } from '../../contexts/DiaryContext';
import { COLORS, MEAL_TYPES } from '../../constants';
import { MealEntry, MealType } from '../../types';

// Генерируем последние 7 дней для выбора
function getLast7Days(): string[] {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return d.toISOString().split('T')[0];
  });
}

function formatDayLabel(iso: string): { day: string; weekday: string } {
  const d = new Date(iso);
  return {
    day: d.getDate().toString(),
    weekday: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
  };
}

export default function DiaryScreen() {
  const { t } = useTranslation();
  const { getMealsByDate, deleteMeal } = useDiary();

  const days = getLast7Days();
  const today = days[0];
  const [selectedDate, setSelectedDate] = useState(today);
  const [filterType, setFilterType] = useState<MealType | 'all'>('all');

  const meals = getMealsByDate(selectedDate);
  const filtered = filterType === 'all'
    ? meals
    : meals.filter(m => m.type === filterType);

  return (
    <View style={styles.container}>
      {/* Заголовок */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('tabs.diary')}</Text>
      </View>

      {/* Горизонтальный выбор дня */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.dayScroll}
        contentContainerStyle={styles.dayScrollContent}
      >
        {days.map(date => {
          const { day, weekday } = formatDayLabel(date);
          const isSelected = date === selectedDate;
          return (
            <TouchableOpacity
              key={date}
              style={[styles.dayBtn, isSelected && styles.dayBtnActive]}
              onPress={() => setSelectedDate(date)}
            >
              <Text style={[styles.dayWeekday, isSelected && styles.dayTextActive]}>
                {weekday}
              </Text>
              <Text style={[styles.dayNum, isSelected && styles.dayTextActive]}>
                {day}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Фильтр по типу приёма пищи */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterContent}
      >
        <Chip
          selected={filterType === 'all'}
          onPress={() => setFilterType('all')}
          style={[styles.chip, filterType === 'all' && styles.chipActive]}
          textStyle={filterType === 'all' ? styles.chipTextActive : styles.chipText}
        >
          Все
        </Chip>
        {(Object.keys(MEAL_TYPES) as MealType[]).map(type => (
          <Chip
            key={type}
            selected={filterType === type}
            onPress={() => setFilterType(type)}
            style={[styles.chip, filterType === type && styles.chipActive]}
            textStyle={filterType === type ? styles.chipTextActive : styles.chipText}
          >
            {MEAL_TYPES[type].label}
          </Chip>
        ))}
      </ScrollView>

      {/* Список приёмов пищи */}
      <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
        {filtered.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyText}>Нет записей</Text>
          </View>
        ) : (
          filtered.map(meal => (
            <MealCard
              key={meal.id}
              meal={meal}
              onPress={() => router.push(`/meal/${meal.id}`)}
              onDelete={() => deleteMeal(meal.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

// --- Карточка приёма пищи ---
interface MealCardProps {
  meal: MealEntry;
  onPress: () => void;
  onDelete: () => void;
}

function MealCard({ meal, onPress, onDelete }: MealCardProps) {
  const mealType = MEAL_TYPES[meal.type];
  return (
    <Card style={styles.mealCard} onPress={onPress}>
      <Card.Content style={styles.mealContent}>
        <View style={styles.mealLeft}>
          <Text style={styles.mealTypeLabel}>{mealType.label}</Text>
          <Text style={styles.mealName}>
            {meal.aiAnalysis?.foodName || meal.description || 'Без названия'}
          </Text>
          <Text style={styles.mealTime}>{meal.time}</Text>
          {meal.aiAnalysis && (
            <Text style={styles.mealMacros}>
              Б {meal.aiAnalysis.protein}г · Ж {meal.aiAnalysis.fat}г · У {meal.aiAnalysis.carbs}г
            </Text>
          )}
        </View>
        <View style={styles.mealRight}>
          {meal.aiAnalysis && (
            <Text style={styles.mealCal}>{meal.aiAnalysis.calories} ккал</Text>
          )}
          <IconButton
            icon="delete-outline"
            size={20}
            iconColor={COLORS.textSecondary}
            onPress={onDelete}
          />
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
  },
  // Выбор дня
  dayScroll: {
    flexGrow: 0,
  },
  dayScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayBtn: {
    width: 52,
    height: 64,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  dayBtnActive: {
    backgroundColor: COLORS.accent,
  },
  dayWeekday: {
    fontSize: 11,
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
  },
  dayNum: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 2,
  },
  dayTextActive: {
    color: '#000',
  },
  // Фильтр
  filterScroll: {
    flexGrow: 0,
    marginTop: 12,
  },
  filterContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  chip: {
    backgroundColor: COLORS.surface,
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: COLORS.accent,
  },
  chipText: {
    color: COLORS.textSecondary,
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '700',
  },
  // Список
  list: {
    flex: 1,
    marginTop: 16,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    color: COLORS.textSecondary,
    fontSize: 15,
  },
  mealCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 10,
  },
  mealContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  mealLeft: {
    flex: 1,
  },
  mealTypeLabel: {
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
  mealMacros: {
    fontSize: 12,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  mealRight: {
    alignItems: 'flex-end',
  },
  mealCal: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 4,
  },
});
