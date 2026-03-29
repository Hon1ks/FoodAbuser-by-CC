// ╔══════════════════════════════════════════════════════════════╗
// ║           КОНФИГУРАЦИЯ AI API — FoodAbuser                  ║
// ║  Заполни этот файл когда получишь доступ к API              ║
// ╚══════════════════════════════════════════════════════════════╝

// Поддерживаемые провайдеры:
//   'stub'         — заглушка (тестовые данные, без API)
//   'openai'       — GPT-4o Vision (лучшая точность, есть бесплатный лимит)
//   'logmeal'      — LogMeal API (специализирован на еде)
//   'calorieninjas'— CalorieNinjas (простой, дешёвый)
//   'custom'       — любой другой API (настрой apiUrl + responseMapping)

export const AI_CONFIG = {
  // ── Выбор провайдера ────────────────────────────────────────────
  provider: 'stub' as
    | 'stub'
    | 'openai'               // GPT-4o Vision — одним запросом (распознавание + КБЖУ)
    | 'openai_nutritionix'   // ★ Рекомендуется: GPT-4o (блюдо+вес) + Nutritionix (точные КБЖУ)
    | 'logmeal'              // LogMeal — специализированный food API
    | 'calorieninjas'        // CalorieNinjas — дешевый текстовый
    | 'custom',              // Любой кастомный API

  // ── Ключ доступа к API ──────────────────────────────────────────
  // Сюда вставить ключ когда получишь
  apiKey: '',

  // ── Для Nutritionix (нужны два ключа) ──────────────────────────
  appId: '',            // x-app-id (для openai_nutritionix и nutritionix)
  nutritionixKey: '',   // x-app-key

  // ── Для кастомного API ──────────────────────────────────────────
  // URL эндпоинта
  apiUrl: 'https://your-api.com/analyze',

  // Формат тела запроса:
  //   'base64_json'     → { image: "<base64>" }
  //   'base64_data_url' → { image: "data:image/jpeg;base64,..." }
  //   'url'             → { image_url: "https://..." }
  requestFormat: 'base64_json' as 'base64_json' | 'base64_data_url' | 'url',

  // Дополнительные заголовки (если нужны)
  extraHeaders: {} as Record<string, string>,

  // Маппинг полей ответа кастомного API → внутренний формат
  // Поддерживается dot-notation: 'result.food.name'
  responseMapping: {
    foodName:   'food_name',    // название блюда
    grams:      'weight_g',     // вес в граммах
    calories:   'calories',     // ккал
    protein:    'protein_g',    // белки
    fat:        'fat_g',        // жиры
    carbs:      'carbs_g',      // углеводы
    confidence: 'confidence',   // уверенность 0..1
  },
};

// ── Как подключить провайдер ─────────────────────────────────────────────────
//
// ★ РЕКОМЕНДУЕТСЯ Research Manager — Вариант B (GPT-4o + Nutritionix):
//    provider:        'openai_nutritionix'
//    apiKey:          'sk-...'       (OpenAI key)
//    appId:           'xxx'          (Nutritionix App ID — бесплатно до 500 req/день)
//    nutritionixKey:  'yyy'          (Nutritionix App Key)
//
// 1. OpenAI только (один запрос, быстрее):
//    provider: 'openai'
//    apiKey:   'sk-...'
//
// 2. LogMeal:
//    provider: 'logmeal'
//    apiKey:   'your_logmeal_token'
//
// 3. CalorieNinjas (самый простой):
//    provider: 'calorieninjas'
//    apiKey:   'your_api_key'
//
// 4. Кастомный API:
//    provider:         'custom'
//    apiUrl:           'https://your-endpoint.com/v1/analyze'
//    apiKey:           'your_key'  (или оставь пустым если не нужен)
//    requestFormat:    'base64_json'
//    responseMapping:  { foodName: 'data.name', calories: 'data.kcal', ... }
