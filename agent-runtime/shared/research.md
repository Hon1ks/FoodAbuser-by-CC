# Research: API для распознавания еды и расчёта КБЖУ

**Дата исследования:** 2026-03-28
**Автор:** Research Manager
**Статус:** DONE

---

## 1. LogMeal API

**Сайт:** https://logmeal.com/api
**Специализация:** Полный пайплайн — распознавание еды на фото + нутриенты.

### Формат запроса

- **Тип:** `multipart/form-data` (загрузка файла) ИЛИ JSON с base64
- **Эндпоинт распознавания:** `POST https://api.logmeal.com/v2/image/segmentation/complete`
- **Эндпоинт нутриентов:** `POST https://api.logmeal.com/v2/recipe/nutritionalInfo`
- **Аутентификация:** Bearer Token в заголовке

**Запрос (multipart/form-data):**
```bash
curl -X POST "https://api.logmeal.com/v2/image/segmentation/complete" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@/path/to/food.jpg"
```

**Запрос (base64 JSON):**
```json
POST /v2/image/segmentation/complete
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "image": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA..."
}
```

**Запрос нутриентов (после получения imageId):**
```json
POST /v2/recipe/nutritionalInfo
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "imageId": 12345
}
```

### Формат ответа

**Шаг 1 — распознавание:**
```json
{
  "imageId": 12345,
  "segmentation_results": [
    {
      "recognition_results": [
        {
          "id": 301,
          "name": "pizza margherita",
          "probability": 0.92,
          "foodId": 5001
        }
      ],
      "score": 0.92,
      "mask": "base64_mask_data..."
    }
  ],
  "imageHeight": 480,
  "imageWidth": 640
}
```

**Шаг 2 — нутриенты:**
```json
{
  "nutritional_info": {
    "totalWeight": 250.0,
    "calories": 665.0,
    "protein": 28.5,
    "fat": 22.3,
    "carbohydrates": 89.1,
    "fiber": 3.2,
    "sugar": 5.8,
    "saturated_fat": 9.1,
    "sodium": 1240.0
  },
  "food_names": ["pizza margherita"],
  "imageId": 12345
}
```

**Ключевые поля ответа:**
| Поле | Описание |
|------|----------|
| `name` | Название блюда (EN) |
| `totalWeight` | Вес в граммах |
| `calories` | Калории (ккал) |
| `protein` | Белки (г) |
| `fat` | Жиры (г) |
| `carbohydrates` | Углеводы (г) |
| `probability` | Уверенность модели (0–1) |

### Pricing
- **Free tier:** 50 запросов/день бесплатно (Developer план)
- **Starter:** ~$49/мес — 1 000 запросов/мес
- **Pro:** ~$149/мес — 5 000 запросов/мес
- **Enterprise:** договорная цена

### Точность
- Заявлено: >85% top-1 accuracy на собственном датасете (2000+ категорий блюд)
- Хорошо работает с европейскими и американскими блюдами; азиатская кухня — хуже

---

## 2. Nutritionix API (track endpoint)

**Сайт:** https://www.nutritionix.com/business/api
**Специализация:** База нутриентов + NLP-распознавание еды по тексту. Отдельного vision-эндпоинта нет — только текстовый запрос.

### Формат запроса

- **Тип:** JSON
- **Эндпоинт:** `POST https://trackapi.nutritionix.com/v2/natural/nutrients`
- **Аутентификация:** Заголовки `x-app-id` и `x-app-key`

```bash
curl -X POST "https://trackapi.nutritionix.com/v2/natural/nutrients" \
  -H "x-app-id: YOUR_APP_ID" \
  -H "x-app-key: YOUR_APP_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "2 scrambled eggs with 100g rice and salad"
  }'
```

**Для поиска по фото — нужна интеграция:**
Сначала получить название блюда из Vision API (GPT-4o / Clarifai), затем передать текст в Nutritionix.

### Формат ответа

```json
{
  "foods": [
    {
      "food_name": "scrambled eggs",
      "brand_name": null,
      "serving_qty": 2,
      "serving_unit": "large",
      "serving_weight_grams": 94,
      "nf_calories": 182,
      "nf_total_fat": 13.5,
      "nf_saturated_fat": 3.9,
      "nf_cholesterol": 372,
      "nf_sodium": 342,
      "nf_total_carbohydrate": 1.6,
      "nf_dietary_fiber": 0,
      "nf_sugars": 0.8,
      "nf_protein": 12.4,
      "nf_potassium": 138,
      "nf_p": 0,
      "full_nutrients": [
        { "attr_id": 203, "value": 12.4 },
        { "attr_id": 204, "value": 13.5 },
        { "attr_id": 205, "value": 1.6 },
        { "attr_id": 208, "value": 182 }
      ],
      "nix_brand_name": null,
      "nix_item_name": null,
      "nix_item_id": null,
      "upc": null,
      "consumed_at": "2026-03-28T00:00:00+00:00",
      "metadata": {},
      "source": 1,
      "ndb_no": 1132,
      "tags": {
        "item": "scrambled eggs",
        "measure": null,
        "quantity": "2.0",
        "food_group": 1,
        "tag_id": 517
      },
      "alt_measures": [
        { "serving_weight": 47, "measure": "large", "seq": 1, "qty": 1 }
      ],
      "lat": null,
      "lng": null,
      "meal_type": 1,
      "photo": {
        "thumb": "https://d2eawub7utcl6.cloudfront.net/images/nix-apple-grey.png",
        "highres": null,
        "is_user_uploaded": false
      }
    }
  ]
}
```

**Ключевые поля ответа:**
| Поле | Описание |
|------|----------|
| `food_name` | Название продукта |
| `serving_weight_grams` | Вес порции в граммах |
| `nf_calories` | Калории (ккал) |
| `nf_protein` | Белки (г) |
| `nf_total_fat` | Жиры (г) |
| `nf_total_carbohydrate` | Углеводы (г) |
| `nf_dietary_fiber` | Клетчатка (г) |
| `nf_sugars` | Сахар (г) |

### Pricing
- **Free tier:** 500 запросов/день — БЕСПЛАТНО (Developer plan)
- **Pro:** $99/мес — до 10 000 запросов/день
- **Enterprise:** индивидуально

### Точность
- NLP-распознавание текстовых запросов: очень высокое (>95% для стандартных блюд)
- База: USDA + брендовые продукты (1M+ позиций)
- Не распознаёт еду по фото самостоятельно

---

## 3. Clarifai Food Model

**Сайт:** https://clarifai.com/clarifai/main/models/food-item-recognition
**Специализация:** Классификация еды на фото (возвращает теги, не КБЖУ). Для нутриентов нужна интеграция с Nutritionix.

### Формат запроса

- **Тип:** JSON с base64 ИЛИ URL изображения
- **Эндпоинт:** `POST https://api.clarifai.com/v2/models/{model_id}/outputs`
- **Model ID:** `bd367be194cf45149e75f01d59f77ba7` (food-item-recognition)
- **Аутентификация:** `Authorization: Key YOUR_PAT`

**Запрос (URL изображения):**
```json
POST https://api.clarifai.com/v2/models/bd367be194cf45149e75f01d59f77ba7/outputs
Authorization: Key YOUR_PAT
Content-Type: application/json

{
  "inputs": [
    {
      "data": {
        "image": {
          "url": "https://example.com/pizza.jpg"
        }
      }
    }
  ]
}
```

**Запрос (base64):**
```json
{
  "inputs": [
    {
      "data": {
        "image": {
          "base64": "/9j/4AAQSkZJRgABAQAA..."
        }
      }
    }
  ]
}
```

### Формат ответа

```json
{
  "status": {
    "code": 10000,
    "description": "Ok"
  },
  "outputs": [
    {
      "id": "output_id_abc123",
      "status": { "code": 10000, "description": "Ok" },
      "created_at": "2026-03-28T10:00:00.000000Z",
      "model": {
        "id": "bd367be194cf45149e75f01d59f77ba7",
        "name": "food-item-recognition",
        "model_version": { "id": "version_id" }
      },
      "input": { "id": "input_id", "data": { "image": { "url": "..." } } },
      "data": {
        "concepts": [
          { "id": "ai_3PlgVmlN", "name": "pizza", "value": 0.9853, "app_id": "main" },
          { "id": "ai_SsmKLB4z", "name": "baked goods", "value": 0.9721, "app_id": "main" },
          { "id": "ai_5VHsZr65", "name": "mozzarella", "value": 0.8934, "app_id": "main" },
          { "id": "ai_WbH7C9P4", "name": "tomato sauce", "value": 0.8712, "app_id": "main" },
          { "id": "ai_TBlp0Pt3", "name": "Italian", "value": 0.7651, "app_id": "main" }
        ]
      }
    }
  ]
}
```

**ВАЖНО:** Clarifai возвращает только **теги (concepts)** с вероятностью — граммы и КБЖУ отсутствуют. Нужна дополнительная интеграция с Nutritionix или аналогичным API.

**Ключевые поля ответа:**
| Поле | Описание |
|------|----------|
| `concepts[].name` | Название тега (pizza, salad, etc.) |
| `concepts[].value` | Уверенность (0–1) |

### Pricing
- **Free tier:** 1 000 операций/мес — БЕСПЛАТНО
- **Essential:** $30/мес — 10 000 операций/мес
- **Professional:** $300/мес — 100 000 операций/мес
- **Enterprise:** индивидуально

### Точность
- 1000+ категорий еды
- Заявлено ~85–90% top-5 accuracy
- Распознаёт ингредиенты, а не только блюдо целиком
- Не подходит как единственный источник нутриентов

---

## 4. OpenAI Vision API (GPT-4o) — промпт для анализа еды

**Сайт:** https://platform.openai.com/docs/guides/vision
**Специализация:** Универсальная мультимодальная модель. Может анализировать фото еды и возвращать КБЖУ в структурированном виде при правильном промпте.

### Формат запроса

- **Тип:** JSON с base64 ИЛИ URL изображения
- **Эндпоинт:** `POST https://api.openai.com/v1/chat/completions`
- **Аутентификация:** `Authorization: Bearer YOUR_OPENAI_KEY`

**Запрос (URL изображения):**
```json
POST https://api.openai.com/v1/chat/completions
Authorization: Bearer YOUR_OPENAI_KEY
Content-Type: application/json

{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/food_photo.jpg",
            "detail": "high"
          }
        },
        {
          "type": "text",
          "text": "Analyze this food photo. Identify each food item, estimate the portion size in grams, and calculate nutritional values. Return ONLY valid JSON in this exact format:\n{\n  \"dishes\": [\n    {\n      \"name\": \"dish name in English\",\n      \"name_ru\": \"название на русском\",\n      \"weight_grams\": 250,\n      \"calories\": 450,\n      \"protein_g\": 20.5,\n      \"fat_g\": 15.3,\n      \"carbs_g\": 55.2\n    }\n  ],\n  \"total\": {\n    \"weight_grams\": 250,\n    \"calories\": 450,\n    \"protein_g\": 20.5,\n    \"fat_g\": 15.3,\n    \"carbs_g\": 55.2\n  },\n  \"confidence\": \"high|medium|low\",\n  \"notes\": \"any important observations\"\n}"
        }
      ]
    }
  ],
  "max_tokens": 1000,
  "response_format": { "type": "json_object" }
}
```

**Запрос (base64):**
```json
{
  "model": "gpt-4o",
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "image_url",
          "image_url": {
            "url": "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAA...",
            "detail": "high"
          }
        },
        {
          "type": "text",
          "text": "...(тот же промпт)..."
        }
      ]
    }
  ]
}
```

### Формат ответа

```json
{
  "id": "chatcmpl-abc123",
  "object": "chat.completion",
  "created": 1711612800,
  "model": "gpt-4o-2024-08-06",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "{\n  \"dishes\": [\n    {\n      \"name\": \"pizza margherita\",\n      \"name_ru\": \"пицца маргарита\",\n      \"weight_grams\": 300,\n      \"calories\": 797,\n      \"protein_g\": 34.2,\n      \"fat_g\": 26.7,\n      \"carbs_g\": 106.9\n    }\n  ],\n  \"total\": {\n    \"weight_grams\": 300,\n    \"calories\": 797,\n    \"protein_g\": 34.2,\n    \"fat_g\": 26.7,\n    \"carbs_g\": 106.9\n  },\n  \"confidence\": \"high\",\n  \"notes\": \"Standard pizza slice portion estimated at 300g. Values may vary based on specific recipe.\"\n}"
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 1247,
    "completion_tokens": 183,
    "total_tokens": 1430
  }
}
```

**Рекомендуемый системный промпт:**
```
You are a professional nutritionist and food recognition AI.
When shown a food photo, you must:
1. Identify all visible food items
2. Estimate realistic portion weights based on visual cues (plate size, cutlery scale)
3. Calculate КБЖУ (calories, protein, fat, carbohydrates) per 100g then scale to portion
4. Return ONLY valid JSON, no markdown, no extra text
Always underestimate portions slightly — it's safer than overestimating.
```

### Pricing (GPT-4o, актуально на 2025)
- **Нет бесплатного тарифа** (только $5 бесплатных кредитов при регистрации)
- **Input:** $2.50 / 1M токенов (текст); изображение high-detail ~1000–2000 токенов
- **Output:** $10.00 / 1M токенов
- **Примерная стоимость 1 запроса с фото:** ~$0.003–0.006 (0.3–0.6 центов)
- **1000 запросов:** ~$3–6

### Точность
- **Лучшая среди всех рассмотренных API** для смешанных и нестандартных блюд
- Понимает контекст, размер порции по тарелке/столовым приборам
- Ошибка по весу порции: ±20–30% (субъективная оценка по фото)
- Ошибка по КБЖУ на 100г: ±10–15%
- Хорошо справляется с русскими/советскими блюдами (борщ, пельмени и т.д.)
- Не детерминирован — одно фото может дать разные ответы

---

## 5. Google Cloud Vision + Nutritionix (комбо)

**Специализация:** Google Cloud Vision распознаёт объекты на фото → передаём названия еды в Nutritionix для получения нутриентов.

### Шаг 1: Google Cloud Vision API

**Эндпоинт:** `POST https://vision.googleapis.com/v1/images:annotate`
**Аутентификация:** API Key или OAuth2

**Запрос:**
```json
POST https://vision.googleapis.com/v1/images:annotate?key=YOUR_API_KEY
Content-Type: application/json

{
  "requests": [
    {
      "image": {
        "content": "/9j/4AAQSkZJRgABAQAA..."
      },
      "features": [
        { "type": "LABEL_DETECTION", "maxResults": 10 },
        { "type": "WEB_DETECTION", "maxResults": 5 }
      ]
    }
  ]
}
```

**Или через URL:**
```json
{
  "requests": [
    {
      "image": {
        "source": { "imageUri": "https://example.com/food.jpg" }
      },
      "features": [
        { "type": "LABEL_DETECTION", "maxResults": 10 }
      ]
    }
  ]
}
```

**Ответ Vision API:**
```json
{
  "responses": [
    {
      "labelAnnotations": [
        { "mid": "/m/0663v", "description": "pizza", "score": 0.9876, "topicality": 0.9876 },
        { "mid": "/m/04kkgm", "description": "cheese", "score": 0.9712, "topicality": 0.9712 },
        { "mid": "/m/0hnyx", "description": "fast food", "score": 0.9201, "topicality": 0.9201 },
        { "mid": "/m/02wbm", "description": "food", "score": 0.9100, "topicality": 0.9100 }
      ],
      "webDetection": {
        "bestGuessLabels": [
          { "label": "pizza margherita", "languageCode": "en" }
        ]
      }
    }
  ]
}
```

### Шаг 2: Передача в Nutritionix

```json
POST https://trackapi.nutritionix.com/v2/natural/nutrients
{
  "query": "pizza margherita"
}
```

### Итоговая схема комбо:
```
Фото → Google Vision (LABEL_DETECTION) → топ-1 label → Nutritionix /natural/nutrients → КБЖУ
```

### Pricing (Google Cloud Vision)
- **Free tier:** 1 000 запросов/мес — БЕСПЛАТНО
- **Далее:** $1.50 / 1 000 запросов (LABEL_DETECTION)

### Точность комбо
- Слабее GPT-4o: Vision часто возвращает общие теги ("food", "dish", "cuisine")
- `webDetection.bestGuessLabels` даёт более конкретный результат
- Проблема: один тег не учитывает размер порции и состав сложных блюд
- Рекомендуется как fallback, а не основной метод

---

## 6. Edamam Food Database API

**Сайт:** https://developer.edamam.com/food-database-api
**Специализация:** Поиск нутриентов по названию еды + парсинг текстовых запросов. Нет встроенного vision-распознавания.

### Формат запроса

**Эндпоинт (парсинг текста):**
`POST https://api.edamam.com/api/food-database/v2/parser`

**Аутентификация:** Query params `app_id` и `app_key`

```bash
GET https://api.edamam.com/api/food-database/v2/parser
  ?app_id=YOUR_APP_ID
  &app_key=YOUR_APP_KEY
  &ingr=100g%20chicken%20breast
  &nutrition-type=cooking
```

**Или через POST:**
```json
POST https://api.edamam.com/api/food-database/v2/nutrients
Authorization: Basic (app_id:app_key base64)
Content-Type: application/json

{
  "ingredients": [
    {
      "quantity": 100,
      "measureURI": "http://www.edamam.com/ontologies/edamam.owl#Measure_gram",
      "foodId": "food_ahmuvrjaa4vlfaabqnzdgay"
    }
  ]
}
```

### Формат ответа

```json
{
  "uri": "http://www.edamam.com/ontologies/edamam.owl#recipe_...",
  "calories": 165,
  "totalWeight": 100.0,
  "totalNutrients": {
    "ENERC_KCAL": {
      "label": "Energy",
      "quantity": 165.0,
      "unit": "kcal"
    },
    "PROCNT": {
      "label": "Protein",
      "quantity": 31.0,
      "unit": "g"
    },
    "FAT": {
      "label": "Fat",
      "quantity": 3.6,
      "unit": "g"
    },
    "CHOCDF": {
      "label": "Carbs",
      "quantity": 0.0,
      "unit": "g"
    },
    "FIBTG": {
      "label": "Fiber",
      "quantity": 0.0,
      "unit": "g"
    },
    "SUGAR": {
      "label": "Sugars",
      "quantity": 0.0,
      "unit": "g"
    },
    "NA": {
      "label": "Sodium",
      "quantity": 74.0,
      "unit": "mg"
    }
  },
  "totalDaily": {
    "ENERC_KCAL": { "label": "Energy", "quantity": 8.25, "unit": "%" }
  },
  "ingredients": [
    {
      "parsed": [
        {
          "foodId": "food_ahmuvrjaa4vlfaabqnzdgay",
          "quantity": 100,
          "measure": "gram",
          "weight": 100.0,
          "food": {
            "foodId": "food_ahmuvrjaa4vlfaabqnzdgay",
            "label": "Chicken Breast",
            "nutrients": {
              "ENERC_KCAL": 165.0,
              "PROCNT": 31.0,
              "FAT": 3.6,
              "CHOCDF": 0.0
            },
            "category": "Generic foods",
            "categoryLabel": "food",
            "image": "https://www.edamam.com/food-img/..."
          }
        }
      ]
    }
  ]
}
```

**Ключевые поля (коды нутриентов):**
| Код | Нутриент |
|-----|----------|
| `ENERC_KCAL` | Калории (ккал) |
| `PROCNT` | Белки (г) |
| `FAT` | Жиры (г) |
| `CHOCDF` | Углеводы (г) |
| `FIBTG` | Клетчатка (г) |
| `SUGAR` | Сахара (г) |
| `NA` | Натрий (мг) |

### Pricing
- **Free tier:** 10 000 запросов/мес — БЕСПЛАТНО (Developer plan)
- **Starter:** $99/мес — 100 000 запросов/мес
- **Growth:** $299/мес — 500 000 запросов/мес

### Точность
- Очень точные нутриенты (база USDA + международные данные)
- Нет встроенного vision — нужна интеграция с GPT-4o / Clarifai
- Хорошо работает с общими продуктами, хуже — с ресторанными блюдами

---

## 7. CalorieNinjas API

**Сайт:** https://calorieninjas.com/api
**Специализация:** Простой REST API для получения нутриентов по текстовому запросу. Самый дешёвый вариант.

### Формат запроса

- **Тип:** GET с query param
- **Эндпоинт:** `GET https://api.calorieninjas.com/v1/nutrition`
- **Аутентификация:** Header `X-Api-Key`

```bash
curl -X GET "https://api.calorieninjas.com/v1/nutrition?query=100g+grilled+chicken+and+200g+rice" \
  -H "X-Api-Key: YOUR_API_KEY"
```

**Для изображений** — нужно сначала распознать еду (GPT-4o / Clarifai), затем передать текст.

### Формат ответа

```json
{
  "items": [
    {
      "name": "chicken",
      "calories": 239.0,
      "serving_size_g": 100.0,
      "fat_total_g": 13.6,
      "fat_saturated_g": 3.8,
      "protein_g": 27.3,
      "sodium_mg": 82.0,
      "potassium_mg": 256.0,
      "cholesterol_mg": 88.0,
      "carbohydrates_total_g": 0.0,
      "fiber_g": 0.0,
      "sugar_g": 0.0
    },
    {
      "name": "rice",
      "calories": 260.0,
      "serving_size_g": 200.0,
      "fat_total_g": 0.4,
      "fat_saturated_g": 0.1,
      "protein_g": 5.4,
      "sodium_mg": 2.0,
      "potassium_mg": 55.0,
      "cholesterol_mg": 0.0,
      "carbohydrates_total_g": 57.2,
      "fiber_g": 0.6,
      "sugar_g": 0.1
    }
  ]
}
```

**Ключевые поля ответа:**
| Поле | Описание |
|------|----------|
| `name` | Название продукта |
| `serving_size_g` | Вес порции (г) |
| `calories` | Калории (ккал) |
| `protein_g` | Белки (г) |
| `fat_total_g` | Жиры (г) |
| `carbohydrates_total_g` | Углеводы (г) |
| `fiber_g` | Клетчатка (г) |
| `sugar_g` | Сахар (г) |

### Pricing
- **Free tier:** 10 000 запросов/мес — БЕСПЛАТНО (ограничение: 1 запрос/секунду)
- **Pro:** $5/мес — 50 000 запросов/мес
- **Ultra:** $20/мес — 500 000 запросов/мес
- **Самый дешёвый из всех рассмотренных API**

### Точность
- Данные на основе USDA
- Хорошо работает для простых продуктов
- Не поддерживает составные блюда и региональную кухню
- Нет встроенного vision

---

## Сравнительная таблица

| API | Vision (фото) | Нутриенты | Формат запроса | Free tier | Стоимость | Точность |
|-----|:---:|:---:|----------------|-----------|-----------|----------|
| **LogMeal** | Да | Да | multipart/base64 | 50 req/день | от $49/мес | 85%+ |
| **Nutritionix** | Нет | Да | JSON (текст) | 500 req/день | от $99/мес | 95%+ (текст) |
| **Clarifai Food** | Да | Нет | JSON URL/base64 | 1 000/мес | от $30/мес | 85-90% |
| **GPT-4o Vision** | Да | Да | JSON URL/base64 | Нет | ~$0.004/запрос | Наилучшая |
| **Google Vision + Nutritionix** | Да | Через комбо | JSON URL/base64 | 1 000/мес | от $1.5/1000 | Средняя |
| **Edamam** | Нет | Да | GET/POST (текст) | 10 000/мес | от $99/мес | Высокая |
| **CalorieNinjas** | Нет | Да | GET (текст) | 10 000/мес | от $5/мес | Средняя |

---

## Рекомендуемая архитектура для FoodAbuser

### Вариант A: Максимальная точность (дороже)
```
Фото → GPT-4o Vision (распознавание + КБЖУ) → результат
```
- Стоимость: ~$0.004 за запрос
- Плюсы: один запрос, высокая точность, понимает контекст
- Минусы: недетерминирован, нет гарантии формата без `response_format`

### Вариант B: Баланс цены и точности (рекомендуется)
```
Фото → GPT-4o Vision (только распознавание блюда) → Nutritionix /natural/nutrients (КБЖУ)
```
- Стоимость: ~$0.003 (GPT-4o) + бесплатно (Nutritionix free tier)
- Плюсы: точные нутриенты из базы, структурированный ответ
- Минусы: два запроса, GPT-4o может ошибиться с названием

### Вариант C: Бюджетный вариант
```
Фото → Clarifai Food Model (теги) → CalorieNinjas (КБЖУ по топ-1 тегу)
```
- Стоимость: ~$0.003/запрос + почти бесплатно
- Минусы: низкая точность для сложных блюд, нет размера порции

### Вариант D: Только LogMeal (наиболее простой)
```
Фото → LogMeal (распознавание + КБЖУ) → результат
```
- Стоимость: от $49/мес
- Плюсы: всё в одном, специализированное решение
- Минусы: ограниченный free tier, хуже для нестандартных блюд

---

## Итог

**Для MVP FoodAbuser рекомендую Вариант B:**
`GPT-4o Vision` (распознавание) + `Nutritionix` (нутриенты)

Это даёт наилучшее соотношение точности и стоимости. GPT-4o можно попросить вернуть стандартизированное название блюда, а Nutritionix — точные нутриенты из проверенной базы. При этом Nutritionix бесплатен до 500 запросов/день, что достаточно для начала.

Если нужен полный end-to-end с одним запросом — `LogMeal API` или `GPT-4o` с промптом на JSON с нутриентами.
