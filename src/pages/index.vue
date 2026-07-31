<script setup lang="ts">
import type { Phonetic } from '~/composables/usePhonetics'
import { categories, getPhoneticsByCategory } from '~/composables/usePhonetics'

const search = ref('')

const grouped = computed(() => {
  const q = search.value.trim().toLowerCase()
  return categories.map((c) => {
    let items = getPhoneticsByCategory(c.key)
    if (q) {
      items = items.filter((p) => {
        if (p.symbol.toLowerCase().includes(q))
          return true
        return p.examples.some(e =>
          e.word.toLowerCase().includes(q)
          || e.ipa.toLowerCase().includes(q)
          || e.meaning.toLowerCase().includes(q),
        )
      })
    }
    return { ...c, items }
  })
})

const totalShown = computed(() => grouped.value.reduce((s, g) => s + g.items.length, 0))

const dark = useDark()
const toggle = useToggle(dark)

const openPhonetic = ref<Phonetic | null>(null)
const openRect = ref<DOMRect | null>(null)
const openAccent = ref<string>('')

function handleOpen(p: Phonetic, rect: DOMRect, accent: string) {
  openPhonetic.value = p
  openRect.value = rect
  openAccent.value = accent
}

function handleClose() {
  openPhonetic.value = null
  openRect.value = null
}

function handleNavigate(p: Phonetic, rect: DOMRect | null) {
  openPhonetic.value = p
  openRect.value = rect
}
</script>

<template>
  <div class="page-index">
    <div class="container">
      <section class="hero">
        <div class="hero-head">
          <div class="brand">
            <div class="brand-mark">
              <img src="/voca-mark.svg" alt="">
            </div>
            <span class="brand-name">Voca</span>
          </div>
          <button class="theme-btn" :aria-label="dark ? '切换浅色模式' : '切换深色模式'" @click="toggle()">
            <div v-if="dark" class="i-carbon-sun" />
            <div v-else class="i-carbon-moon" />
          </button>
        </div>

        <div class="hero-content">
          <div class="hero-copy">
            <p class="hero-kicker">
              English pronunciation, clearly
            </p>
            <h1 class="hero-title">
              英语音标，<br>
              <span class="hero-title-accent">听见 48 个发音。</span>
            </h1>
          </div>

          <div class="hero-guide">
            <p class="hero-sub">
              从音标到口型，再到真实例词。点开任意卡片，跟着声音练习每一个细微的发音。
            </p>
            <div class="hero-search">
              <SearchBar v-model="search" />
              <div class="search-meta" aria-live="polite">
                {{ search ? `找到 ${totalShown} 个匹配项` : '可搜索音标、单词或中文释义' }}
              </div>
            </div>
          </div>
        </div>
      </section>

      <template v-for="cat in grouped" :key="cat.key">
        <section v-if="cat.items.length" class="category-block">
          <div class="category-header">
            <div class="category-title">
              <span class="category-index">0{{ categories.findIndex(item => item.key === cat.key) + 1 }}</span>
              <span class="category-group">{{ cat.group }}</span>
              <span class="category-sep">/</span>
              <span class="category-name">{{ cat.name }}</span>
            </div>
            <div class="category-count">
              {{ cat.items.length }} sounds
            </div>
          </div>

          <div class="card-grid">
            <PhoneticCard
              v-for="p in cat.items"
              :key="p.id"
              :phonetic="p"
              :accent="cat.accent"
              @open="handleOpen"
            />
          </div>
        </section>
      </template>

      <div v-if="totalShown === 0" class="empty">
        <div class="empty-icon i-carbon-search" />
        <div class="empty-title">
          没有匹配的结果
        </div>
        <div class="empty-sub">
          试试别的关键词
        </div>
      </div>
    </div>

    <PhoneticModal
      :phonetic="openPhonetic"
      :origin-rect="openRect"
      :origin-accent="openAccent"
      @close="handleClose"
      @navigate="handleNavigate"
    />
  </div>
</template>

<style scoped>
.page-index {
  width: 100%;
}

.container {
  max-width: 1180px;
  margin: 0 auto;
  padding: 0 32px 32px;
}

.hero {
  margin-bottom: 88px;
}

.hero-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 82px;
  margin-bottom: clamp(52px, 8vw, 104px);
  border-bottom: 1px solid var(--theme_border);
}

.brand {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-mark {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: var(--theme_accent);
  box-shadow: 0 0 0 1px rgba(122, 68, 48, 0.18);
  overflow: hidden;
}

.brand-mark img {
  display: block;
  width: 100%;
  height: 100%;
}

.brand-name {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--theme_text);
}

.theme-btn {
  width: 38px;
  height: 38px;
  border: 1px solid var(--theme_border);
  border-radius: 8px;
  background: transparent;
  color: var(--theme_text_secondary);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}
.theme-btn:hover {
  color: var(--theme_text);
  background: var(--theme_surface_hover);
  box-shadow: var(--theme_shadow_sm);
}

.hero-content {
  display: grid;
  grid-template-columns: minmax(0, 1.45fr) minmax(300px, 0.75fr);
  gap: clamp(48px, 8vw, 112px);
  align-items: end;
}

.hero-kicker {
  margin: 0 0 18px;
  color: var(--theme_accent);
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-title {
  max-width: 760px;
  font-family: Georgia, 'Times New Roman', serif;
  font-size: clamp(44px, 6.2vw, 72px);
  font-weight: 500;
  line-height: 1.08;
  letter-spacing: 0;
  color: var(--theme_text);
  margin: 0;
}

.hero-title-accent {
  color: var(--theme_accent);
}

.hero-sub {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 17px;
  line-height: 1.7;
  color: var(--theme_text_secondary);
  letter-spacing: 0;
  margin: 0 0 28px;
}

.hero-search {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.search-meta {
  min-height: 20px;
  font-size: 12px;
  color: var(--theme_text_weak);
  letter-spacing: 0.02em;
}

.category-block {
  margin-bottom: 64px;
  scroll-margin-top: 24px;
}

.category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-height: 52px;
  margin-bottom: 16px;
  border-top: 1px solid var(--theme_border_strong);
  border-bottom: 1px solid var(--theme_border);
}

.category-title {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0;
  color: var(--theme_text);
}

.category-index {
  font-size: 11px;
  font-weight: 600;
  color: var(--theme_accent);
  letter-spacing: 0.08em;
}

.category-group {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 21px;
  font-weight: 500;
}

.category-sep {
  color: var(--theme_text_weak);
  font-weight: 300;
}

.category-name {
  color: var(--theme_text_secondary);
  font-weight: 400;
}

.category-count {
  font-size: 11px;
  font-weight: 600;
  color: var(--theme_text_weak);
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;
}

.empty {
  text-align: center;
  padding: 80px 24px;
  color: var(--theme_text_weak);
  border-top: 1px solid var(--theme_border);
}

.empty-icon {
  font-size: 36px;
  margin: 0 auto 12px;
  opacity: 0.5;
}

.empty-title {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 22px;
  color: var(--theme_text);
  font-weight: 500;
  margin-bottom: 6px;
}

.empty-sub {
  font-size: 13px;
}

@media (max-width: 960px) {
  .hero-content {
    grid-template-columns: 1fr;
    gap: 32px;
  }

  .hero-guide {
    max-width: 560px;
  }

  .card-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .container {
    padding: 0 16px 16px;
  }
  .hero {
    margin-bottom: 64px;
  }
  .hero-head {
    min-height: 70px;
    margin-bottom: 52px;
  }
  .hero-title {
    font-size: 42px;
  }
  .hero-sub {
    font-size: 16px;
  }
  .category-block {
    margin-bottom: 48px;
  }
  .category-title {
    gap: 8px;
  }
  .card-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
}

@media (max-width: 390px) {
  .hero-title {
    font-size: 37px;
  }

  .category-count {
    display: none;
  }
}
</style>
