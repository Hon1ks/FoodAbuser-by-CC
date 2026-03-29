// Экран аналитики — графики и статистика питания
// Отображает: калории за неделю, распределение БЖУ, паттерны

import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { Text, SegmentedButtons } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useDiary } from '../../contexts/DiaryContext';
import { COLORS } from '../../constants';

const { width } = Dimensions.get('window');
const BAR_MAX_HEIGHT = 120;

// Генерируем даты за последние N дней
function getLastNDays(n: number): string[] {
  return Array.from({ length: n }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (n - 1 - i));
    return d.toISOString().split('T')[0];
  });
}

export default function AnalyticsScreen() {
  const { t } = useTranslation();
  const { getDailyStats } = useDiary();
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const days = period === 'week' ? getLastNDays(7) : getLastNDays(30);
  const statsAll = days.map(date => getDailyStats(date));

  // Максимум калорий за период (для масштабирования графика)
  const maxCal = Math.max(...statsAll.map(s => s.totalCalories), 1);

  // Суммарная статистика за период
  const totalCal     = statsAll.reduce((s, d) => s + d.totalCalories, 0);
  const totalProtein = statsAll.reduce((s, d) => s + d.totalProtein, 0);
  const totalFat     = statsAll.reduce((s, d) => s + d.totalFat, 0);
  const totalCarbs   = statsAll.reduce((s, d) => s + d.totalCarbs, 0);
  const totalMacros  = totalProtein + totalFat + totalCarbs || 1;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('analytics.title')}</Text>

      {/* Выбор периода */}
      <SegmentedButtons
        value={period}
        onValueChange={v => setPeriod(v as 'week' | 'month')}
        style={styles.periodToggle}
        buttons={[
          { value: 'week',  label: t('analytics.week') },
          { value: 'month', label: t('analytics.month') },
        ]}
        theme={{ colors: { secondaryContainer: COLORS.accent, onSecondaryContainer: '#000' } }}
      />

      {/* График калорий по дням */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Калории по дням</Text>
        {totalCal === 0 ? (
          <Text style={styles.noData}>{t('analytics.noData')}</Text>
        ) : (
          <View style={styles.barChart}>
            {statsAll.map((stat, i) => {
              const barH = (stat.totalCalories / maxCal) * BAR_MAX_HEIGHT;
              const d = new Date(stat.date);
              const label = period === 'week'
                ? d.toLocaleDateString('ru-RU', { weekday: 'short' })
                : d.getDate().toString();
              return (
                <View key={stat.date} style={styles.barWrapper}>
                  {stat.totalCalories > 0 && (
                    <Text style={styles.barValue}>{stat.totalCalories}</Text>
                  )}
                  <View style={[styles.bar, { height: Math.max(barH, 2) }]} />
                  <Text style={styles.barLabel}>{label}</Text>
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Распределение БЖУ (простые проценты) */}
      <View style={styles.chartCard}>
        <Text style={styles.chartTitle}>Распределение БЖУ</Text>
        {totalMacros <= 1 ? (
          <Text style={styles.noData}>{t('analytics.noData')}</Text>
        ) : (
          <>
            <MacroBar label="Белки" value={totalProtein} total={totalMacros} color={COLORS.accent} />
            <MacroBar label="Жиры"  value={totalFat}     total={totalMacros} color="#ffaa00" />
            <MacroBar label="Углев" value={totalCarbs}   total={totalMacros} color="#aa88ff" />
          </>
        )}
      </View>

      {/* Итоговая сводка за период */}
      <View style={styles.summaryCard}>
        <Text style={styles.chartTitle}>Итого за период</Text>
        <SummaryRow label="Калорий всего"  value={`${totalCal} ккал`} />
        <SummaryRow label="Среднее/день"   value={`${Math.round(totalCal / days.length)} ккал`} />
        <SummaryRow label="Белки"          value={`${Math.round(totalProtein)} г`} />
        <SummaryRow label="Жиры"           value={`${Math.round(totalFat)} г`} />
        <SummaryRow label="Углеводы"       value={`${Math.round(totalCarbs)} г`} />
      </View>
    </ScrollView>
  );
}

// --- Вспомогательные компоненты ---

function MacroBar({ label, value, total, color }: {
  label: string; value: number; total: number; color: string;
}) {
  const pct = Math.round((value / total) * 100);
  return (
    <View style={styles.macroBarRow}>
      <Text style={styles.macroBarLabel}>{label}</Text>
      <View style={styles.macroBarTrack}>
        <View style={[styles.macroBarFill, { width: `${pct}%`, backgroundColor: color }]} />
      </View>
      <Text style={styles.macroBarPct}>{pct}%</Text>
    </View>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },
  periodToggle: {
    marginBottom: 20,
  },
  // Карточки
  chartCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginBottom: 12,
  },
  noData: {
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: 20,
  },
  // Столбчатый график
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    height: BAR_MAX_HEIGHT + 40,
    justifyContent: 'space-around',
  },
  barWrapper: {
    alignItems: 'center',
    flex: 1,
  },
  barValue: {
    fontSize: 9,
    color: COLORS.textSecondary,
    marginBottom: 2,
  },
  bar: {
    width: 8,
    backgroundColor: COLORS.accent,
    borderRadius: 4,
    minHeight: 2,
  },
  barLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    marginTop: 4,
    textTransform: 'capitalize',
  },
  // Макро-бары
  macroBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  macroBarLabel: {
    width: 52,
    fontSize: 13,
    color: COLORS.text,
  },
  macroBarTrack: {
    flex: 1,
    height: 10,
    backgroundColor: COLORS.border,
    borderRadius: 5,
    overflow: 'hidden',
    marginHorizontal: 8,
  },
  macroBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  macroBarPct: {
    width: 36,
    fontSize: 12,
    color: COLORS.textSecondary,
    textAlign: 'right',
  },
  // Итоги
  summaryCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  summaryLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  summaryValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
});
