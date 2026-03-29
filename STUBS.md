# Заглушки (Stubs) — FoodAbuser

Этот файл описывает все места где используются заглушки и как их заменить на реальную реализацию.

---

## 1. AI Service — анализ еды

**Файл:** `constants/aiConfig.ts`

**Текущий статус:** заглушка (`provider: 'stub'`)

**Как подключить реальный API (без изменения кода):**

Просто отредактируй `constants/aiConfig.ts`:

```ts
// Вариант 1 — OpenAI GPT-4o (рекомендуется, лучшая точность):
provider: 'openai',
apiKey: 'sk-...',

// Вариант 2 — LogMeal (специализирован на еде):
provider: 'logmeal',
apiKey: 'your_token',

// Вариант 3 — CalorieNinjas (простой и дешёвый):
provider: 'calorieninjas',
apiKey: 'your_key',

// Вариант 4 — Кастомный API (любой эндпоинт):
provider: 'custom',
apiUrl: 'https://your-api.com/analyze',
apiKey: 'your_key',
responseMapping: {
  foodName: 'data.name',      // путь к полю в JSON ответе
  calories: 'data.kcal',
  // ...
},
```

Код менять не нужно — адаптеры под все провайдеры уже написаны в `services/aiService.ts`.

---

## 2. Авторизация — Auth Service

**Файлы:** `app/auth/login.tsx`, `app/auth/register.tsx`

**Где:** функции `handleLogin()` и `handleRegister()` — создают пользователя локально без сервера.

**Как заменить:**
1. Создай `services/authService.ts` с методами `login(email, password)` и `register(name, email, password)`
2. Подключи к бэкенду (Firebase Auth, Supabase, собственный API)
3. Замени `mockUser` на реальный ответ от сервера
4. Добавь хранение токена в `UserContext`

---

## 3. Камера и галерея — Camera & ImagePicker

**Статус: ✅ РЕАЛИЗОВАНО** — `expo-camera`, `expo-image-picker`, `expo-media-library` установлены и интегрированы в `app/(tabs)/add-meal.tsx`.

**Что работает:**
- Открытие камеры в модальном окне с прицелом
- Переключение фронт/тыл камеры
- Сохранение фото + base64 для AI анализа
- Выбор из галереи с кропом 4:3
- Запрос разрешений при первом использовании

---

## 4. Push-уведомления

**Файл:** `app/(tabs)/settings.tsx`

**Где:** Switch для уведомлений — задизейблен (`disabled`).

**Как заменить:**
1. Установить:
   ```bash
   npx expo install expo-notifications
   ```
2. Создать `services/notificationService.ts`
3. Включить Switch и подключить к сервису уведомлений

---

## 5. Экспорт данных

**Файл:** `app/(tabs)/settings.tsx`

**Где:** кнопки "Экспорт в CSV" и "Резервное копирование" показывают Alert-заглушку.

**Как заменить:**
1. Установить:
   ```bash
   npx expo install expo-sharing expo-file-system
   ```
2. Реализовать конвертацию `DiaryContext.meals` в CSV
3. Сохранить файл и вызвать `Sharing.shareAsync()`

---

## 6. Цель пользователя — Daily Calorie Goal

**Файл:** `app/(tabs)/home.tsx`

**Где:** `const DAILY_CALORIE_GOAL = 2000` — захардкожено.

**Как заменить:**
Когда профиль пользователя будет расширен (возраст, вес, рост, цель), вычислять КБЖУ норму динамически из `UserContext.user`.
