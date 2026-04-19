import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import eng from './locales/eng';
import arm from './locales/arm';
import rus from './locales/rus';
import { DEFAULT_LANG, LANG_TO_I18N } from '../constants/languages';

i18n.use(initReactI18next).init({
  resources: {
    eng: { translation: eng },
    arm: { translation: arm },
    rus: { translation: rus },
  },
  lng: LANG_TO_I18N[DEFAULT_LANG],
  fallbackLng: 'eng',
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
