// Welcome Screen — экран приветствия
// Анимированный логотип, переключение языка (RU/EN), кнопки входа/регистрации

import React, { useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Button } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '../contexts/UserContext';
import { COLORS } from '../constants';

const { height } = Dimensions.get('window');

export default function WelcomeScreen() {
  const { t, i18n } = useTranslation();
  const { isAuthenticated, isLoading } = useUser();

  // Анимации: fade-in логотипа и slide-up кнопок
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale   = useRef(new Animated.Value(0.8)).current;
  const buttonsY    = useRef(new Animated.Value(60)).current;
  const buttonsOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Если пользователь уже вошёл — переходим на главный экран
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/home');
      return;
    }

    // Последовательная анимация входа
    Animated.sequence([
      // 1. Логотип появляется и масштабируется
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      // 2. Кнопки появляются снизу
      Animated.parallel([
        Animated.timing(buttonsOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(buttonsY, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
  }, [isLoading, isAuthenticated]);

  // Переключение языка — RU ↔ EN
  const toggleLanguage = () => {
    const next = i18n.language === 'ru' ? 'en' : 'ru';
    i18n.changeLanguage(next);
  };

  if (isLoading) return null; // Ждём загрузку пользователя из AsyncStorage

  return (
    <View style={styles.container}>
      {/* Переключатель языка — верхний правый угол */}
      <TouchableOpacity style={styles.langToggle} onPress={toggleLanguage}>
        <Text style={styles.langText}>
          {i18n.language === 'ru' ? 'EN' : 'RU'}
        </Text>
      </TouchableOpacity>

      {/* Анимированный логотип */}
      <Animated.View
        style={[
          styles.logoContainer,
          { opacity: logoOpacity, transform: [{ scale: logoScale }] },
        ]}
      >
        {/* Иконка-заглушка — акцентный круг с буквой F */}
        <View style={styles.logoCircle}>
          <Text style={styles.logoLetter}>F</Text>
        </View>
        <Text style={styles.appName}>{t('welcome.title')}</Text>
        <Text style={styles.subtitle}>{t('welcome.subtitle')}</Text>
      </Animated.View>

      {/* Анимированные кнопки */}
      <Animated.View
        style={[
          styles.buttons,
          {
            opacity: buttonsOpacity,
            transform: [{ translateY: buttonsY }],
          },
        ]}
      >
        <Button
          mode="contained"
          style={styles.btnPrimary}
          labelStyle={styles.btnPrimaryLabel}
          onPress={() => router.push('/auth/register')}
        >
          {t('welcome.register')}
        </Button>
        <Button
          mode="outlined"
          style={styles.btnSecondary}
          labelStyle={styles.btnSecondaryLabel}
          onPress={() => router.push('/auth/login')}
        >
          {t('welcome.login')}
        </Button>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Переключатель языка
  langToggle: {
    position: 'absolute',
    top: 56,
    right: 24,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.accent,
  },
  langText: {
    color: COLORS.accent,
    fontWeight: '700',
    fontSize: 13,
  },
  // Логотип
  logoContainer: {
    alignItems: 'center',
    marginBottom: height * 0.08,
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 12,
  },
  logoLetter: {
    fontSize: 48,
    fontWeight: '900',
    color: '#000000',
  },
  appName: {
    fontSize: 32,
    fontWeight: '800',
    color: COLORS.text,
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 15,
    color: COLORS.textSecondary,
    marginTop: 8,
  },
  // Кнопки
  buttons: {
    width: '80%',
    gap: 12,
  },
  btnPrimary: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 4,
  },
  btnPrimaryLabel: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 16,
  },
  btnSecondary: {
    borderColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 4,
  },
  btnSecondaryLabel: {
    color: COLORS.accent,
    fontWeight: '600',
    fontSize: 16,
  },
});
