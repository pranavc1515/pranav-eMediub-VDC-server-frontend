// eslint-disable-next-line import/no-named-as-default
import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import en from './lang/en.json'
import hi from './lang/hi.json'
import kn from './lang/kn.json'
import appConfig from '@/configs/app.config'

const resources = {
    en: {
        translation: en,
    },
    hi: {
        translation: hi,
    },
    kn: {
        translation: kn,
    },
}

i18n.use(initReactI18next).init({
    resources,
    fallbackLng: appConfig.locale,
    lng: appConfig.locale,
    interpolation: {
        escapeValue: false,
    },
})

export const dateLocales: {
    [key: string]: () => Promise<ILocale>
} = {
    en: () => import('dayjs/locale/en'),
    hi: () => import('dayjs/locale/hi'),
    kn: () => import('dayjs/locale/en'), // Fallback to English for Kannada as dayjs doesn't have native Kannada support
}

export default i18n
