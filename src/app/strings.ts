import 'server-only'
 
const strings = {
  en: () => import('@/../strings/en.json').then((module) => module.default),
  ru: () => import('@/../strings/ru.json').then((module) => module.default),
}
 
export const getStrings = async (locale: 'en' | 'ru') =>
  strings[locale]?.() ?? strings.en();