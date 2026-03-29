// Экран входа
// Форма email + пароль, переход на главный экран после успешного входа

import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { Text, TextInput, Button, HelperText } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useUser } from '../../contexts/UserContext';
import { COLORS } from '../../constants';
import { User } from '../../types';

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useUser();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Заполните все поля');
      return;
    }
    setError('');
    setLoading(true);

    try {
      // ЗАГЛУШКА: локальный вход без сервера — см. STUBS.md
      const mockUser: User = {
        id: Date.now().toString(),
        name: email.split('@')[0],
        email,
        language: 'ru',
        createdAt: new Date().toISOString(),
      };
      await login(mockUser);
      router.replace('/(tabs)/home');
    } catch (e) {
      setError('Ошибка входа. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.inner}>
        <Text style={styles.title}>{t('auth.loginTitle')}</Text>

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
          onPress={handleLogin}
          loading={loading}
          style={styles.btn}
          labelStyle={styles.btnLabel}
        >
          {t('auth.loginBtn')}
        </Button>

        <Button
          mode="text"
          onPress={() => router.replace('/auth/register')}
          labelStyle={styles.linkLabel}
        >
          {t('auth.noAccount')} {t('welcome.register')}
        </Button>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  inner: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
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
