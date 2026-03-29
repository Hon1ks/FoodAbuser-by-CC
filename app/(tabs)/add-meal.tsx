// Экран добавления приёма пищи
// Камера / галерея → AI анализ → сохранение в дневник

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Image,
  Alert,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Text, Button, TextInput, SegmentedButtons } from 'react-native-paper';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import * as MediaLibrary from 'expo-media-library';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { useDiary } from '../../contexts/DiaryContext';
import { useUser } from '../../contexts/UserContext';
import { COLORS, MEAL_TYPES } from '../../constants';
import { MealEntry, MealType, AIAnalysisResult } from '../../types';
import { analyzeFood } from '../../services/aiService';

const { width, height } = Dimensions.get('window');

export default function AddMealScreen() {
  const { t } = useTranslation();
  const { user } = useUser();
  const { addMeal } = useDiary();

  // Разрешения камеры
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [photoUri, setPhotoUri]         = useState<string | null>(null);
  const [photoBase64, setPhotoBase64]   = useState<string | null>(null);
  const [description, setDescription]   = useState('');
  const [mealType, setMealType]         = useState<MealType>('breakfast');
  const [mealTime, setMealTime]         = useState(
    new Date().toTimeString().slice(0, 5)
  );
  const [aiResult, setAiResult]         = useState<AIAnalysisResult | null>(null);
  const [analyzing, setAnalyzing]       = useState(false);
  const [saving, setSaving]             = useState(false);
  const [cameraOpen, setCameraOpen]     = useState(false);
  const [cameraFacing, setCameraFacing] = useState<CameraType>('back');

  const cameraRef = useRef<CameraView>(null);

  // --- Открыть камеру ---
  const handleOpenCamera = async () => {
    if (!cameraPermission?.granted) {
      const { granted } = await requestCameraPermission();
      if (!granted) {
        Alert.alert('Нет доступа к камере', 'Разрешите доступ в настройках устройства');
        return;
      }
    }
    setCameraOpen(true);
  };

  // --- Сделать снимок ---
  const handleTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
        base64: true,
      });
      if (photo) {
        setPhotoUri(photo.uri);
        setPhotoBase64(photo.base64 ?? null);
        setAiResult(null);
        setCameraOpen(false);
      }
    } catch (e) {
      Alert.alert(t('common.error'), 'Не удалось сделать фото');
    }
  };

  // --- Выбрать из галереи ---
  const handlePickGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Нет доступа к галерее', 'Разрешите доступ в настройках устройства');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      base64: true,
      allowsEditing: true,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setPhotoBase64(result.assets[0].base64 ?? null);
      setAiResult(null);
    }
  };

  // --- AI анализ ---
  const handleAnalyze = async () => {
    setAnalyzing(true);
    try {
      const result = await analyzeFood(photoBase64 || 'no_base64');
      setAiResult(result);
    } catch (e) {
      Alert.alert(t('common.error'), 'Не удалось проанализировать фото');
    } finally {
      setAnalyzing(false);
    }
  };

  // --- Сохранить запись ---
  const handleSave = async () => {
    if (!aiResult && !description) {
      Alert.alert('', 'Добавьте описание или проведите анализ фото');
      return;
    }
    setSaving(true);
    try {
      const entry: MealEntry = {
        id: Date.now().toString(),
        userId: user?.id || 'guest',
        date: new Date().toISOString().split('T')[0],
        time: mealTime,
        type: mealType,
        photoUri: photoUri || undefined,
        description,
        aiAnalysis: aiResult || undefined,
        createdAt: new Date().toISOString(),
      };
      await addMeal(entry);
      router.replace('/(tabs)/home');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <Text style={styles.title}>Новый приём пищи</Text>

        {/* Выбор типа */}
        <Text style={styles.label}>Тип</Text>
        <SegmentedButtons
          value={mealType}
          onValueChange={v => setMealType(v as MealType)}
          style={styles.segments}
          buttons={[
            { value: 'breakfast', label: 'Завтрак' },
            { value: 'lunch',     label: 'Обед' },
            { value: 'dinner',    label: 'Ужин' },
            { value: 'snack',     label: 'Перекус' },
          ]}
          theme={{ colors: { secondaryContainer: COLORS.accent, onSecondaryContainer: '#000' } }}
        />

        {/* Время */}
        <TextInput
          label="Время"
          value={mealTime}
          onChangeText={setMealTime}
          style={styles.input}
          textColor={COLORS.text}
          theme={{ colors: { primary: COLORS.accent } }}
          keyboardType="numbers-and-punctuation"
        />

        {/* Кнопки фото */}
        <View style={styles.photoButtons}>
          <Button
            mode="outlined"
            icon="camera"
            onPress={handleOpenCamera}
            style={styles.photoBtn}
            labelStyle={{ color: COLORS.accent }}
          >
            {t('meal.addPhoto')}
          </Button>
          <Button
            mode="outlined"
            icon="image"
            onPress={handlePickGallery}
            style={styles.photoBtn}
            labelStyle={{ color: COLORS.accent }}
          >
            {t('meal.fromGallery')}
          </Button>
        </View>

        {/* Превью фото */}
        {photoUri && (
          <View style={styles.photoContainer}>
            <Image source={{ uri: photoUri }} style={styles.photoPreview} resizeMode="cover" />
            {/* Кнопка убрать фото */}
            <TouchableOpacity style={styles.removePhoto} onPress={() => { setPhotoUri(null); setPhotoBase64(null); setAiResult(null); }}>
              <Text style={styles.removePhotoText}>✕</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Кнопка анализа */}
        {photoUri && !aiResult && (
          <Button
            mode="contained"
            icon="robot"
            onPress={handleAnalyze}
            loading={analyzing}
            disabled={analyzing}
            style={styles.analyzeBtn}
            labelStyle={styles.analyzeBtnLabel}
          >
            {analyzing ? t('meal.analyzing') : t('meal.analyze')}
          </Button>
        )}

        {/* Результат AI */}
        {aiResult && (
          <View style={styles.aiResult}>
            <Text style={styles.aiTitle}>{t('ai.resultTitle')}</Text>
            {aiResult.isStub && (
              <Text style={styles.stubWarning}>⚠️ Заглушка — данные тестовые (см. STUBS.md)</Text>
            )}
            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>{t('ai.food')}</Text>
              <Text style={styles.aiValue}>{aiResult.foodName}</Text>
            </View>
            <View style={styles.aiRow}>
              <Text style={styles.aiLabel}>Вес</Text>
              <Text style={styles.aiValue}>{aiResult.grams} {t('ai.grams')}</Text>
            </View>
            <View style={styles.aiMacros}>
              <AIBadge label="ккал" value={aiResult.calories} accent />
              <AIBadge label="Б"    value={aiResult.protein} />
              <AIBadge label="Ж"    value={aiResult.fat} />
              <AIBadge label="У"    value={aiResult.carbs} />
            </View>
            {/* Повторить анализ */}
            <Button
              mode="text"
              onPress={handleAnalyze}
              labelStyle={{ color: COLORS.accent, fontSize: 12 }}
              compact
            >
              {t('ai.retry')}
            </Button>
          </View>
        )}

        {/* Описание */}
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

        {/* Сохранить */}
        <Button
          mode="contained"
          onPress={handleSave}
          loading={saving}
          disabled={saving}
          style={styles.saveBtn}
          labelStyle={styles.saveBtnLabel}
        >
          {t('meal.save')}
        </Button>
      </ScrollView>

      {/* Модальное окно камеры */}
      <Modal visible={cameraOpen} animationType="slide" statusBarTranslucent>
        <View style={styles.cameraContainer}>
          <CameraView
            ref={cameraRef}
            style={styles.camera}
            facing={cameraFacing}
          >
            {/* Рамка прицела */}
            <View style={styles.cameraOverlay}>
              <View style={styles.cameraFrame} />
            </View>

            {/* Управление камерой */}
            <View style={styles.cameraControls}>
              {/* Закрыть */}
              <TouchableOpacity style={styles.camBtn} onPress={() => setCameraOpen(false)}>
                <Text style={styles.camBtnText}>✕</Text>
              </TouchableOpacity>

              {/* Сделать снимок */}
              <TouchableOpacity style={styles.shutterBtn} onPress={handleTakePhoto}>
                <View style={styles.shutterInner} />
              </TouchableOpacity>

              {/* Перевернуть */}
              <TouchableOpacity
                style={styles.camBtn}
                onPress={() => setCameraFacing(f => f === 'back' ? 'front' : 'back')}
              >
                <Text style={styles.camBtnText}>⟳</Text>
              </TouchableOpacity>
            </View>
          </CameraView>
        </View>
      </Modal>
    </>
  );
}

// --- Бейдж КБЖУ ---
function AIBadge({ label, value, accent }: { label: string; value: number; accent?: boolean }) {
  return (
    <View style={[styles.badge, accent && styles.badgeAccent]}>
      <Text style={[styles.badgeValue, accent && styles.badgeValueAccent]}>
        {Math.round(value)}
      </Text>
      <Text style={[styles.badgeLabel, accent && styles.badgeLabelAccent]}>{label}</Text>
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
    marginBottom: 24,
  },
  label: {
    fontSize: 13,
    color: COLORS.textSecondary,
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  segments: {
    marginBottom: 16,
  },
  input: {
    backgroundColor: COLORS.surface,
    marginBottom: 12,
  },
  // Кнопки фото
  photoButtons: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 12,
  },
  photoBtn: {
    flex: 1,
    borderColor: COLORS.accent,
  },
  // Превью
  photoContainer: {
    position: 'relative',
    marginBottom: 12,
    borderRadius: 12,
    overflow: 'hidden',
  },
  photoPreview: {
    width: '100%',
    height: 220,
    borderRadius: 12,
  },
  removePhoto: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  // Анализ
  analyzeBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    marginBottom: 12,
  },
  analyzeBtnLabel: {
    color: '#000',
    fontWeight: '700',
  },
  // AI результат
  aiResult: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.accent + '40',
  },
  aiTitle: {
    fontSize: 13,
    color: COLORS.accent,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    fontWeight: '700',
    marginBottom: 8,
  },
  stubWarning: {
    fontSize: 12,
    color: '#ff9900',
    marginBottom: 8,
  },
  aiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  aiLabel: {
    color: COLORS.textSecondary,
    fontSize: 14,
  },
  aiValue: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '600',
  },
  aiMacros: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
    marginBottom: 8,
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
  badgeLabelAccent: {
    color: COLORS.accent,
  },
  // Сохранить
  saveBtn: {
    backgroundColor: COLORS.accent,
    borderRadius: 12,
    paddingVertical: 4,
    marginTop: 8,
  },
  saveBtnLabel: {
    color: '#000',
    fontWeight: '700',
    fontSize: 16,
  },
  // Камера
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Квадратная рамка прицела
  cameraFrame: {
    width: width * 0.7,
    height: width * 0.7,
    borderWidth: 2,
    borderColor: COLORS.accent,
    borderRadius: 16,
    shadowColor: COLORS.accent,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 12,
  },
  // Кнопки управления камерой
  cameraControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingBottom: 48,
    paddingHorizontal: 32,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  camBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  camBtnText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  // Кнопка спуска затвора
  shutterBtn: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'transparent',
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.accent,
  },
});
