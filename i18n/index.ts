// Инициализация i18n (react-i18next)
// Стартовый язык: ru. Переключение доступно на Welcome Screen.

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ru from './ru.json';
import en from './en.json';

const resources = {
  ru: { translation: ru },
  en: { translation: en },
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: 'ru',           // язык по умолчанию — русский
    fallbackLng: 'ru',
    interpolation: {
      escapeValue: false, // React Native не нуждается в экранировании
    },
    compatibilityJSON: 'v4',
  });

export default i18n;
