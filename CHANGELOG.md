# Changelog — FoodAbuser

## [0.2.0] - 2026-03-28 03:20
### Добавлено
- Инициализирован Expo проект (TypeScript, blank template)
- Установлены зависимости: expo-router, react-native-paper, react-i18next, i18next, AsyncStorage
- `theme/index.ts` — тёмная тема, акцент #00ffcc (MD3DarkTheme)
- `types/index.ts` — глобальные TypeScript типы (User, MealEntry, AIAnalysisResult, DailyStats)
- `constants/index.ts` — цвета, типы приёмов пищи, ключи AsyncStorage
- `i18n/ru.json` + `i18n/en.json` — полная локализация RU/EN
- `i18n/index.ts` — инициализация react-i18next (язык по умолчанию: ru)
- `contexts/UserContext.tsx` — глобальное состояние пользователя
- `contexts/DiaryContext.tsx` — глобальное состояние дневника питания
- `services/aiService.ts` — AI сервис с заглушкой (STUBS.md)
- `services/storageService.ts` — типизированная обёртка AsyncStorage
- `app/_layout.tsx` — корневой layout с PaperProvider и контекстами
- `app/index.tsx` — Welcome Screen: анимация, переключатель языка, кнопки входа/регистрации
- `app/auth/login.tsx` — экран входа
- `app/auth/register.tsx` — экран регистрации
- `app/(tabs)/_layout.tsx` — нижняя навигация (5 вкладок)
- `app/(tabs)/home.tsx` — главный экран с дневной сводкой
- `app/(tabs)/diary.tsx` — дневник с выбором дня и фильтром по типу
- `app/(tabs)/add-meal.tsx` — добавление приёма пищи + AI анализ
- `app/(tabs)/analytics.tsx` — аналитика: столбчатый график, БЖУ, итоги
- `app/(tabs)/settings.tsx` — настройки: язык, профиль, экспорт, выход
- `app/meal/[id].tsx` — детальная карточка приёма пищи
- `STUBS.md` — документация всех заглушек и инструкции по замене
- `app.json` — обновлён (тёмная тема, правильное имя проекта)
- `dialog.md` — лог диалога с пользователем

## [0.1.0] - 2026-03-28 03:00
### Добавлено
- Создана папка проекта /root/projects/FoodAbuser
- Создан README_MAIN.md с полным описанием продукта, архитектурой, планом разработки и правилами
- Создана структура agent-runtime (state, messages, shared, outputs)
- Создан plan.md с описанием стека и текущей фазы
- Создан status.md для отслеживания статуса агентов
- Создан CHANGELOG.md
