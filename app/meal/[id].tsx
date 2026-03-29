// Детальная карточка приёма пищи
// Показывает все данные записи, позволяет редактировать описание или удалить

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Alert, Image } from 'react-native';
import { Text, Button, TextInput, IconButton } from 'react-native-paper';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useDiary } from '../../contexts/DiaryContext';
import { COLORS, MEAL_TYPES } from '../../constants';

export default function MealDetailScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { getMealById, updateMeal, deleteMeal } = useDiary();

  const meal = getMealById(id);
  const [description, setDescription] = useState(meal?.description || '');
  const [saving, setSaving] = useState(false);

  if (!meal) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Запись не найдена</Text>
        <Button onPress={() => router.back()} labelStyle={{ color: COLORS.accent }}>
          Назад
        </Button>
      </View>
    );
  }

  const mealType = MEAL_TYPES[meal.type];

  const handleSave = async () => {
    setSaving(true);
    await updateMeal(meal.id, { description });
    setSaving(false);
    router.back();
  };

  const handleDelete = () => {
    Alert.alert(
      'Удалить запись?',
      'Это действие нельзя отменить',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            await deleteMeal(meal.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Шапка */}
      <View style={styles.header}>
        <IconButton
          icon="arrow-left"
          iconColor={COLORS.text}
          onPress={() => router.back()}
        />
        <Text style={styles.headerType}>{mealType.label}</Text>
        <IconButton
          icon="delete-outline"
          iconColor={COLORS.error}
          onPress={handleDelete}
        />
      </View>

      {/* Время */}
      <Text style={styles.time}>{meal.time} · {meal.date}</Text>

      {/* Фото */}
      {meal.photoUri && meal.photoUri !== 'stub://photo' && (
        <Image source={{ uri: meal.photoUri }} style={styles.photo} />
      )}

      {/* AI результат */}
      {meal.aiAnalysis && (
        <View style={styles.aiCard}>
          <Text style={styles.aiTitle}>{t('ai.resultTitle')}</Text>
          <Text style={styles.foodName}>{meal.aiAnalysis.foodName}</Text>
          <Text style={styles.grams}>{meal.aiAnalysis.grams} г</Text>

          <View style={styles.macros}>
            <MacroBadge label="ккал" value={meal.aiAnalysis.calories} accent />
            <MacroBadge label="Б" value={meal.aiAnalysis.protein} />
            <MacroBadge label="Ж" value={meal.aiAnalysis.fat} />
            <MacroBadge label="У" value={meal.aiAnalysis.carbs} />
          </View>
        </View>
      )}

      {/* Редактируемое описание */}
      <TextInput
        label={t('meal.description')}
        value={description}
        onChangeText={setDescription}
        style={styles.input}
        textColor={COLORS.text}
        theme={{ colors: { primary: COLORS.accent } }}
        multiline
        numberOfLines={3}
      />

      <Button
        mode="contained"
        onPress={handleSave}
        loading={saving}
        style={styles.saveBtn}
        labelStyle={styles.saveBtnLabel}
      >
        {t('common.save')}
      </Button>
    </ScrollView>
  );
}

function MacroBadge({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={[styles.badge, accent && styles.badgeAccent]}>
      <Text style={[styles.badgeValue, accent && styles.badgeValueAccent]}>
        {Math.round(value)}
      </Text>
      <Text style={styles.badgeLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingBottom: 40,
  },
  notFound: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  notFoundText: {
    color: COLORS.textSecondary,
    fontSize: 16,
    marginBottom: 16,
  },
  // Шапка
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 48,
    paddingHorizontal: 8,
  },
  headerType: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  time: {
    fontSize: 13,
    color: COLORS.textSecondary,
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  photo: {
    width: '100%',
    height: 240,
    marginBottom: 16,
  },
  // AI карточка
  aiCard: {
    backgroundColor: COLORS.surface,
    margin: 16,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.accent + '30',
  },
  aiTitle: {
    fontSize: 11,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 8,
  },
  foodName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },
  grams: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  macros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  badge: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceVariant,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minWidth: 56,
  },
  badgeAccent: {
    backgroundColor: COLORS.accent + '20',
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  badgeValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.text,
  },
  badgeValueAccent: {
    color: COLORS.accent,
  },
  badgeLabel: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginHorizontal: 16,
    marginBottom: 12,
  },
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    marginHorizontal: 16,
    paddingVertical: 4,
  },
  saveBtnLabel: {
    color: '#000',
    fontWeight: '700',
  },
});
