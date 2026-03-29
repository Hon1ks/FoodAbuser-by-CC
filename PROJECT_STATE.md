# PROJECT_STATE.md — FoodAbuser
> Читай этот файл в начале каждого нового диалога. Он даёт полный контекст проекта.

---

## Что за проект
Мобильное приложение **FoodAbuser** — минималистичный трекер питания с фото-анализом еды через AI, дневником и аналитикой.

**Платформа:** Expo (React Native + TypeScript)
**Расположение на сервере:** `/root/projects/FoodAbuser/`

---

## Стек
| Слой | Технология |
|------|-----------|
| Платформа | Expo SDK 55 (canary) + React Native + TypeScript |
| Навигация | Expo Router (файловая маршрутизация) |
| UI | React Native Paper (MD3DarkTheme, акцент **#00ffcc**) |
| Состояние | Context API: `UserContext`, `DiaryContext` |
| Локализация | react-i18next — RU (по умолчанию) / EN |
| Хранилище | AsyncStorage (офлайн) |
| AI | `services/aiService.ts` + `constants/aiConfig.ts` — адаптеры: OpenAI, Gemini, Groq, LogMeal, CalorieNinjas, Custom. Сейчас `stub`, ждём ключ. Research: `AI_API_GUIDE.md` |

---

## Структура проекта
```
/root/projects/FoodAbuser/
├── app/
│   ├── _layout.tsx          # Корневой layout (PaperProvider + Contexts)
│   ├── index.tsx            # Welcome Screen (анимация, RU/EN переключатель)
│   ├── auth/
│   │   ├── login.tsx        # Экран входа
│   │   └── register.tsx     # Экран регистрации
│   ├── (tabs)/
│   │   ├── _layout.tsx      # Нижняя навигация (5 вкладок)
│   │   ├── home.tsx         # Главный экран — дневная сводка
│   │   ├── diary.tsx        # Дневник — выбор дня + фильтр
│   │   ├── add-meal.tsx     # Добавление еды + AI анализ
│   │   ├── analytics.tsx    # Аналитика — графики
│   │   └── settings.tsx     # Настройки
│   └── meal/
│       └── [id].tsx         # Детальная карточка приёма пищи
├── components/              # Пока пусто — компоненты в экранах
├── contexts/
│   ├── UserContext.tsx      # Пользователь: профиль, язык, авторизация
│   └── DiaryContext.tsx     # Дневник: CRUD, статистика за день
├── services/
│   ├── aiService.ts         # AI анализ еды (ЗАГЛУШКА — см. STUBS.md)
│   └── storageService.ts    # Типизированная обёртка AsyncStorage
├── i18n/
│   ├── index.ts             # Инициализация i18next
│   ├── ru.json              # Русские переводы
│   └── en.json              # Английские переводы
├── theme/index.ts           # Тёмная тема, акцент #00ffcc
├── types/index.ts           # TypeScript типы (User, MealEntry, AIAnalysisResult...)
├── constants/index.ts       # Цвета, MEAL_TYPES, STORAGE_KEYS, AI_API_URL
├── STUBS.md                 # Все заглушки + как заменить
├── CHANGELOG.md             # История изменений
├── README_MAIN.md           # Главный план + архитектура + правила
├── AI_API_GUIDE.md          # Сравнение AI API: цены, качество, бесплатные модели
├── dialog.md                # Лог всех сообщений пользователя
├── constants/
│   ├── index.ts             # Цвета, MEAL_TYPES, STORAGE_KEYS
│   └── aiConfig.ts          # Конфиг AI провайдера (сюда вставить ключ)
└── agent-runtime/           # Рабочая зона агентов
    ├── state/plan.md
    └── state/status.md
```

---

## Текущий статус фаз

| Фаза | Статус | Что сделано |
|------|--------|------------|
| 0 — Инициализация | ✅ DONE | Expo, зависимости, структура |
| 1 — Welcome + Auth | ✅ DONE | Welcome Screen, Login, Register, UserContext |
| 2 — Навигация + Home | ✅ DONE | 5 табов, главный экран, статистика |
| 3 — Добавление еды | ✅ DONE | Экран, камера (модал + прицел), галерея, AI заглушка |
| 4 — Дневник | ✅ DONE | Выбор дня, список, фильтр, детальная карточка |
| 5 — Аналитика | ✅ DONE | Графики, БЖУ, итоги |
| 6 — Настройки | 🔄 Частично | Язык готов. Уведомления/экспорт — заглушки |
| 7 — Полировка | ⬜ НЕ НАЧАТО | Haptics, анимации, офлайн, тесты |

---

## Следующие задачи (в приоритете)

1. **✅ Камера + ImagePicker** — реализовано (модальная камера с прицелом, галерея)
2. 🔄 Реальный AI API — сервис готов (6 провайдеров + custom). Research рекомендует **Gemini Flash** ($0/мес для MVP) или `openai_nutritionix`. Полный гайд: `AI_API_GUIDE.md`. Подключить: `constants/aiConfig.ts` → `provider` + `apiKey`
3. ⬜ Push-уведомления — `expo-notifications`
4. ⬜ Экспорт данных — `expo-sharing` + `expo-file-system`
5. ⬜ Профиль пользователя (1.5) — форма настройки после регистрации
6. ⬜ Фаза 7 — Полировка (Haptics, анимации переходов)

---

## Важные заметки

- **Expo SDK:** используется canary версия `55.0.10-canary-20260327-0789fbc` — при установке пакетов использовать `--legacy-peer-deps`
- **Заглушки:** все задокументированы в `STUBS.md`
- **Авторизация:** локальная (без сервера) — пользователь создаётся в AsyncStorage
- **Стиль:** тёмная тема, акцент `#00ffcc`, MinWidth компоненты через React Native Paper
- **Пользователь:** не спрашивать подтверждения перед выполнением команд — просто делать

---

## Как запустить проект (на машине разработчика)
```bash
# 1. Скопировать на локальную машину:
scp -r root@5.35.93.63:/root/projects/FoodAbuser ./FoodAbuser

# 2. Перейти в папку и запустить:
cd FoodAbuser
npm install
npx expo start

# 3. Открыть в Expo Go на телефоне (QR-код)
```

---

*Последнее обновление: 2026-03-28 — AI сервис: 6 провайдеров (Gemini/Groq/OpenAI/LogMeal/CalorieNinjas/Custom). AI_API_GUIDE.md создан. rclone установлен, ожидает токен Google Drive от пользователя.*
