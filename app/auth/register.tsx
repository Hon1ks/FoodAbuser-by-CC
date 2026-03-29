// Экран регистрации
// Форма: имя + email + пароль, создание профиля пользователя

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import { COLORS } from '../../constants';
import { User } from '../../types';

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { login } = useUser();

  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const validate = () => {
    if (!name.trim())            return 'Введите имя';
    if (!email.includes('@'))    return 'Введите корректный email';
    if (password.length < 6)     return 'Пароль минимум 6 символов';
    return null;
  };

  const handleRegister = async () => {
    const err = validate();
    if (err) { setError(err); return; }
    setError('');
    setLoading(true);

    try {
      // ЗАГЛУШКА: создаём пользователя локально без сервера — см. STUBS.md
      const newUser: User = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        language: 'ru',
        createdAt: new Date().toISOString(),
      };
      await login(newUser);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError('Ошибка регистрации. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.inner} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>{t('auth.registerTitle')}</Text>

        <TextInput
          label={t('auth.name')}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          style={styles.input}
          textColor={COLORS.text}
          theme={{ colors: { primary: COLORS.accent } }}
        />

        <TextInput
          label={t('auth.email')}
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
          textColor={COLORS.text}
          theme={{ colors: { primary: COLORS.accent } }}
        />

        <TextInput
          label={t('auth.password')}
          value={password}
          onChangeText={setPassword}
          secureTextEntry={!showPass}
          style={styles.input}
          textColor={COLORS.text}
          theme={{ colors: { primary: COLORS.accent } }}
          right={
            <TextInput.Icon
              icon={showPass ? 'eye-off' : 'eye'}
              onPress={() => setShowPass(v => !v)}
              color={COLORS.textSecondary}
            />
          }
        />

        {error ? <HelperText type="error">{error}</HelperText> : null}

        <Button
          mode="contained"
          onPress={handleRegister}
          loading={loading}
          style={styles.btn}
          labelStyle={styles.btnLabel}
        >
          {t('auth.registerBtn')}
        </Button>

        <Button
          mode="text"
          onPress={() => router.replace('/auth/login')}
          labelStyle={styles.linkLabel}
        >
          {t('auth.hasAccount')} {t('welcome.login')}
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    padding: 24,
    justifyContent: 'center',
    minHeight: '100%',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 32,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  btn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  btnLabel: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  linkLabel: {
    color: COLORS.accent,
    marginTop: 8,
  },
});
