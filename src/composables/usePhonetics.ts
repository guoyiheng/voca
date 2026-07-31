import data from '~/data/phonetics.json'

export interface PhoneticExample {
  word: string
  ipa: string
  meaning: string
  audio: string
}

export interface Phonetic {
  id: number
  symbol: string
  category: 'long_vowel' | 'short_vowel' | 'diphthong' | 'voiceless' | 'voiced'
  categoryName: string
  group: '元音' | '辅音'
  audio: string
  video: string
  poster: string
  examples: PhoneticExample[]
}

export const phonetics: Phonetic[] = data as Phonetic[]

export const categories = [
  { key: 'long_vowel', name: '长元音', group: '元音', accent: '#c96442' },
  { key: 'short_vowel', name: '短元音', group: '元音', accent: '#6f7f68' },
  { key: 'diphthong', name: '双元音', group: '元音', accent: '#9b6a4f' },
  { key: 'voiceless', name: '清辅音', group: '辅音', accent: '#9a7b38' },
  { key: 'voiced', name: '浊辅音', group: '辅音', accent: '#8d5d5b' },
] as const

export type CategoryKey = typeof categories[number]['key']

export function getPhoneticById(id: number): Phonetic | undefined {
  return phonetics.find(p => p.id === id)
}

export function getPhoneticsByCategory(key: CategoryKey): Phonetic[] {
  return phonetics.filter(p => p.category === key)
}

export function assetUrl(p: string): string {
  if (!p)
    return ''
  return `/${p.replace(/^\/+/, '')}`
}
