// Экран настроек
// Язык, цель, уведомления, экспорт данных, выход из аккаунта

import React from 'react';
import { View, StyleSheet, ScrollView, Alert } from 'react-native';
import { Text, List, Switch, Divider, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import { COLORS } from '../../constants';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const { user, logout, setLanguage } = useUser();

  const isRu = i18n.language === 'ru';

  const handleLogout = () => {
    Alert.alert(
      'Выйти?',
      'Все данные останутся на устройстве',
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: 'Выйти',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      {/* Профиль */}
      {user && (
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>
              {user.name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileEmail}>{user.email}</Text>
          </View>
        </View>
      )}

      {/* Секция — Интерфейс */}
      <Text style={styles.sectionLabel}>Интерфейс</Text>
      <View style={styles.card}>
        <List.Item
          title={t('settings.language')}
          description={isRu ? 'Русский' : 'English'}
          left={props => <List.Icon {...props} icon="translate" color={COLORS.accent} />}
          right={() => (
            <Switch
              value={!isRu}
              onValueChange={v => setLanguage(v ? 'en' : 'ru')}
              color={COLORS.accent}
            />
          )}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
        <Divider style={styles.divider} />
        <List.Item
          title={t('settings.notifications')}
          description="Напоминания о приёмах пищи"
          left={props => <List.Icon {...props} icon="bell-outline" color={COLORS.accent} />}
          right={() => (
            // ЗАГЛУШКА: push-уведомления — см. STUBS.md
            <Switch value={false} color={COLORS.accent} disabled />
          )}
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
      </View>

      {/* Секция — Данные */}
      <Text style={styles.sectionLabel}>Данные</Text>
      <View style={styles.card}>
        <List.Item
          title={t('settings.export')}
          description="Экспорт в CSV"
          left={props => <List.Icon {...props} icon="download" color={COLORS.accent} />}
          onPress={() => Alert.alert('', 'Экспорт данных — в разработке')} // ЗАГЛУШКА
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
        <Divider style={styles.divider} />
        <List.Item
          title={t('settings.backup')}
          description="Резервное копирование"
          left={props => <List.Icon {...props} icon="cloud-upload-outline" color={COLORS.accent} />}
          onPress={() => Alert.alert('', 'Резервное копирование — в разработке')} // ЗАГЛУШКА
          titleStyle={styles.listTitle}
          descriptionStyle={styles.listDesc}
        />
        <Divider style={styles.divider} />
        <List.Item
          title={t('settings.privacy')}
          left={props => <List.Icon {...props} icon="shield-outline" color={COLORS.accent} />}
          onPress={() => Alert.alert('', 'Управление приватностью — в разработке')} // ЗАГЛУШКА
          titleStyle={styles.listTitle}
        />
      </View>

      {/* Выход */}
      <Button
        mode="outlined"
        onPress={handleLogout}
        style={styles.logoutBtn}
        labelStyle={styles.logoutLabel}
        icon="logout"
      >
        Выйти из аккаунта
      </Button>
    </ScrollView>
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
    marginBottom: 24,
  },
  // Профиль
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    gap: 16,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 24,
    fontWeight: '800',
    color: '#000',
  },
  profileName: {
    fontSize: 17,
    fontWeight: '700',
    color: COLORS.text,
  },
  profileEmail: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  // Секции
  sectionLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 8,
    marginLeft: 4,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: 16,
    marginBottom: 20,
    overflow: 'hidden',
  },
  listTitle: {
    color: COLORS.text,
    fontSize: 15,
  },
  listDesc: {
    color: COLORS.textSecondary,
    fontSize: 12,
  },
  divider: {
    backgroundColor: COLORS.border,
    marginLeft: 56,
  },
  // Выход
  logoutBtn: {
    borderColor: COLORS.error,
    borderRadius: 12,
    marginTop: 8,
  },
  logoutLabel: {
    color: COLORS.error,
  },
});
