// AI Service — сервис анализа еды по фото
// Архитектура: адаптеры под разные API + единый интерфейс
// Реальный API подключается через AI_CONFIG в constants/aiConfig.ts

import { AIAnalysisResult } from '../types';
import { AI_CONFIG } from '../constants/aiConfig';

// ─── Адаптеры под конкретные API ──────────────────────────────────────────────

// Формат нормализованного ответа от любого адаптера
interface RawAnalysis {
  foodName: string;
  grams: number;
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  confidence?: number;
}

// --- OpenAI Vision (GPT-4o) ---
// Запрос: base64 image → промпт → JSON ответ
async function analyzeWithOpenAI(base64: string): Promise<RawAnalysis> {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: { url: `data:image/jpeg;base64,${base64}` },
            },
            {
              type: 'text',
              text: `Analyze this food photo and respond ONLY with valid JSON in this exact format:
{
  "food_name": "название блюда на русском",
  "grams": 250,
  "calories": 300,
  "protein": 15,
  "fat": 10,
  "carbs": 35,
  "confidence": 0.9
}
Estimate weight based on typical serving size. Be precise.`,
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${err}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content ?? '';

  // Вырезаем JSON из ответа (на случай если модель добавила текст вокруг)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error('OpenAI: не удалось распарсить JSON из ответа');

  const parsed = JSON.parse(jsonMatch[0]);
  return {
    foodName:   parsed.food_name  ?? 'Неизвестное блюдо',
    grams:      parsed.grams      ?? 100,
    calories:   parsed.calories   ?? 0,
    protein:    parsed.protein    ?? 0,
    fat:        parsed.fat        ?? 0,
    carbs:      parsed.carbs      ?? 0,
    confidence: parsed.confidence ?? 0.8,
  };
}

// --- LogMeal API ---
// Запрос: multipart/form-data с изображением
// Ответ: recognition → food items → nutrition
async function analyzeWithLogMeal(base64: string): Promise<RawAnalysis> {
  // Шаг 1: распознать еду
  const blob = base64ToBlob(base64);
  const formData = new FormData();
  formData.append('image', blob, 'food.jpg');

  const recogResp = await fetch('https://api.logmeal.com/v2/image/recognition/complete', {
    method: 'POST',
    headers: { Authorization: `Bearer ${AI_CONFIG.apiKey}` },
    body: formData,
  });

  if (!recogResp.ok) throw new Error(`LogMeal recognition error: ${recogResp.status}`);
  const recogData = await recogResp.json();

  const topFood    = recogData.foodName?.[0]?.name ?? 'Unknown';
  const imageId    = recogData.imageId;
  const confidence = recogData.foodName?.[0]?.prob ?? 0.8;

  // Шаг 2: получить КБЖУ
  const nutResp = await fetch('https://api.logmeal.com/v2/nutrition/recipe/nutritionalInfo', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({ imageId }),
  });

  if (!nutResp.ok) throw new Error(`LogMeal nutrition error: ${nutResp.status}`);
  const nutData = await nutResp.json();

  const n = nutData.nutritional_info ?? {};
  return {
    foodName:   topFood,
    grams:      nutData.serving_size ?? 100,
    calories:   n.calories   ?? 0,
    protein:    n.proteins   ?? 0,
    fat:        n.fat        ?? 0,
    carbs:      n.carbohydrates ?? 0,
    confidence,
  };
}

// --- Nutritionix API ---
// Запрос: текстовое описание (нужен сначала OCR или название еды)
// Используется совместно с другим API для распознавания → название → КБЖУ
async function analyzeWithNutritionix(foodName: string, grams: number): Promise<RawAnalysis> {
  const response = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id':    AI_CONFIG.appId ?? '',
      'x-app-key':   AI_CONFIG.apiKey,
    },
    body: JSON.stringify({ query: `${grams}g ${foodName}` }),
  });

  if (!response.ok) throw new Error(`Nutritionix error: ${response.status}`);
  const data = await response.json();

  const food = data.foods?.[0];
  if (!food) throw new Error('Nutritionix: еда не найдена');

  return {
    foodName:   food.food_name,
    grams:      food.serving_weight_grams ?? grams,
    calories:   food.nf_calories          ?? 0,
    protein:    food.nf_protein           ?? 0,
    fat:        food.nf_total_fat         ?? 0,
    carbs:      food.nf_total_carbohydrate ?? 0,
    confidence: 0.85,
  };
}

// --- GPT-4o Vision + Nutritionix (Вариант B — рекомендован Research Manager) ---
// Шаг 1: GPT-4o распознаёт блюдо и вес
// Шаг 2: Nutritionix возвращает точные нутриенты из базы USDA
async function analyzeWithOpenAIplusNutritionix(base64: string): Promise<RawAnalysis> {
  // Шаг 1: GPT-4o — распознать блюдо и вес
  const recogResp = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${AI_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 100,
      response_format: { type: 'json_object' },
      messages: [
        {
          role: 'system',
          content: 'You are a food recognition AI. Return ONLY valid JSON, no markdown.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'image_url',
              image_url: {
                url: `data:image/jpeg;base64,${base64}`,
                detail: 'high',
              },
            },
            {
              type: 'text',
              text: 'Identify the main food dish and estimate its weight. Return JSON: {"food_name_en": "pizza margherita", "food_name_ru": "пицца маргарита", "weight_grams": 300, "confidence": 0.9}',
            },
          ],
        },
      ],
    }),
  });

  if (!recogResp.ok) throw new Error(`OpenAI recognition error: ${recogResp.status}`);
  const recogData  = await recogResp.json();
  const recogParsed = JSON.parse(recogData.choices?.[0]?.message?.content ?? '{}');

  const foodNameEn = recogParsed.food_name_en ?? 'food';
  const foodNameRu = recogParsed.food_name_ru ?? foodNameEn;
  const grams      = recogParsed.weight_grams ?? 100;
  const confidence = recogParsed.confidence   ?? 0.8;

  // Шаг 2: Nutritionix — точные нутриенты
  const nutResp = await fetch('https://trackapi.nutritionix.com/v2/natural/nutrients', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-app-id':    AI_CONFIG.appId ?? '',
      'x-app-key':   AI_CONFIG.nutritionixKey ?? '',
    },
    body: JSON.stringify({ query: `${grams}g ${foodNameEn}` }),
  });

  if (!nutResp.ok) {
    // Fallback: вернуть результат только от GPT-4o без нутриентов из базы
    console.warn('Nutritionix недоступен, используем оценку GPT-4o');
    return analyzeWithOpenAI(base64);
  }

  const nutData = await nutResp.json();
  const food    = nutData.foods?.[0];
  if (!food) throw new Error('Nutritionix: еда не найдена');

  return {
    foodName:   foodNameRu,
    grams:      food.serving_weight_grams ?? grams,
    calories:   food.nf_calories             ?? 0,
    protein:    food.nf_protein              ?? 0,
    fat:        food.nf_total_fat            ?? 0,
    carbs:      food.nf_total_carbohydrate   ?? 0,
    confidence,
  };
}

// --- CalorieNinjas API ---
// Запрос: текстовое описание еды
async function analyzeWithCalorieNinjas(foodName: string): Promise<RawAnalysis> {
  const response = await fetch(
    `https://api.calorieninjas.com/v1/nutrition?query=${encodeURIComponent(foodName)}`,
    {
      headers: { 'X-Api-Key': AI_CONFIG.apiKey },
    }
  );

  if (!response.ok) throw new Error(`CalorieNinjas error: ${response.status}`);
  const data = await response.json();

  const item = data.items?.[0];
  if (!item) throw new Error('CalorieNinjas: еда не найдена');

  return {
    foodName:   item.name,
    grams:      item.serving_size_g ?? 100,
    calories:   item.calories       ?? 0,
    protein:    item.protein_g      ?? 0,
    fat:        item.fat_total_g    ?? 0,
    carbs:      item.carbohydrates_total_g ?? 0,
    confidence: 0.8,
  };
}

// ─── Главная функция ──────────────────────────────────────────────────────────

/**
 * Анализирует фото еды, возвращает КБЖУ.
 * Провайдер выбирается через AI_CONFIG.provider в constants/aiConfig.ts
 *
 * @param photoBase64 - фото в формате base64 (без префикса data:image/...)
 */
export async function analyzeFood(photoBase64: string): Promise<AIAnalysisResult> {
  // Если нет ключа или режим заглушки — вернуть mock
  if (!AI_CONFIG.apiKey || AI_CONFIG.provider === 'stub') {
    return getStubResult();
  }

  let raw: RawAnalysis;

  switch (AI_CONFIG.provider) {
    case 'openai':
      raw = await analyzeWithOpenAI(photoBase64);
      break;
    case 'openai_nutritionix':
      // Рекомендованный Research Manager вариант B:
      // GPT-4o распознаёт блюдо → Nutritionix даёт точные нутриенты из базы
      raw = await analyzeWithOpenAIplusNutritionix(photoBase64);
      break;
    case 'logmeal':
      raw = await analyzeWithLogMeal(photoBase64);
      break;
    case 'calorieninjas':
      raw = await analyzeWithCalorieNinjas(photoBase64);
      break;
    default:
      // Кастомный API — передаём на универсальный адаптер
      raw = await analyzeWithCustomAPI(photoBase64);
  }

  return {
    foodName:   raw.foodName,
    grams:      Math.round(raw.grams),
    calories:   Math.round(raw.calories),
    protein:    Math.round(raw.protein * 10) / 10,
    fat:        Math.round(raw.fat * 10) / 10,
    carbs:      Math.round(raw.carbs * 10) / 10,
    confidence: raw.confidence ?? 0.8,
    isStub:     false,
  };
}

// ─── Кастомный API (для произвольного эндпоинта) ─────────────────────────────
// Когда пользователь предоставит свой API — заполнить маппинг в constants/aiConfig.ts

async function analyzeWithCustomAPI(base64: string): Promise<RawAnalysis> {
  const response = await fetch(AI_CONFIG.apiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(AI_CONFIG.apiKey ? { Authorization: `Bearer ${AI_CONFIG.apiKey}` } : {}),
      ...(AI_CONFIG.extraHeaders ?? {}),
    },
    body: JSON.stringify(
      buildCustomRequestBody(base64, AI_CONFIG.requestFormat)
    ),
  });

  if (!response.ok) {
    throw new Error(`Custom API error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  return mapCustomResponse(data, AI_CONFIG.responseMapping);
}

// Собирает тело запроса по конфигу
function buildCustomRequestBody(base64: string, format: string): object {
  switch (format) {
    case 'base64_json':
      return { image: base64 };
    case 'base64_data_url':
      return { image: `data:image/jpeg;base64,${base64}` };
    case 'url':
      return { image_url: base64 }; // в этом случае base64 — это URL
    default:
      return { image: base64 };
  }
}

// Маппинг ответа кастомного API на единый формат
function mapCustomResponse(data: any, mapping: Record<string, string>): RawAnalysis {
  const get = (path: string) => path.split('.').reduce((o, k) => o?.[k], data);
  return {
    foodName:   get(mapping.foodName)   ?? 'Неизвестное блюдо',
    grams:      get(mapping.grams)      ?? 100,
    calories:   get(mapping.calories)   ?? 0,
    protein:    get(mapping.protein)    ?? 0,
    fat:        get(mapping.fat)        ?? 0,
    carbs:      get(mapping.carbs)      ?? 0,
    confidence: get(mapping.confidence) ?? 0.8,
  };
}

// ─── Заглушка ─────────────────────────────────────────────────────────────────

function getStubResult(): AIAnalysisResult {
  return {
    foodName:   'Овсяная каша с ягодами',
    grams:      250,
    calories:   180,
    protein:    6,
    fat:        3,
    carbs:      32,
    confidence: 0.87,
    isStub:     true,
  };
}

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function base64ToBlob(base64: string, mime = 'image/jpeg'): Blob {
  const binary = atob(base64);
  const bytes  = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}
