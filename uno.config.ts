import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetWind4,
} from 'unocss'

export default defineConfig({
  shortcuts: [
    [
      'btn-primary',
      'inline-flex items-center justify-center px-6 py-3 rounded-[12px] bg-[var(--theme_accent)] text-white font-medium text-[16px] tracking-[0.08px] cursor-pointer transition-all hover:bg-[var(--theme_accent_hover)] hover:shadow-[var(--theme_shadow_md)] disabled:opacity-50 disabled:cursor-not-allowed',
    ],
    [
      'btn-ghost',
      'inline-flex items-center justify-center px-5 py-2.5 rounded-[12px] bg-[var(--theme_surface)] text-[var(--theme_text)] font-medium text-[14px] tracking-[0.08px] cursor-pointer transition-all border border-[var(--theme_border)] hover:bg-[var(--theme_surface_hover)] hover:border-[var(--theme_border_strong)]',
    ],
    [
      'icon-btn',
      'inline-flex items-center justify-center w-10 h-10 rounded-[12px] cursor-pointer text-[var(--theme_text_weak)] transition-all hover:bg-[var(--theme_surface_hover)] hover:text-[var(--theme_accent)]',
    ],
    [
      'card',
      'bg-[var(--theme_surface)] border border-[var(--theme_border)] rounded-[16px] transition-all',
    ],
  ],
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      warn: true,
      collections: {
        carbon: () => import('@iconify-json/carbon/icons.json').then(i => i.default as any),
      },
    }),
  ],
  theme: {
    colors: {
      airtable: {
        navy: '#181d26',
        blue: '#1b61c9',
        midblue: '#254fad',
      },
    },
  },
})
