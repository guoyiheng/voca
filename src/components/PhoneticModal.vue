<script setup lang="ts">
import type { Phonetic } from '~/composables/usePhonetics'
import { assetUrl, categories, phonetics } from '~/composables/usePhonetics'

const props = defineProps<{
  phonetic: Phonetic | null
  originRect?: DOMRect | null
  originAccent?: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'navigate', p: Phonetic, rect: DOMRect | null): void
}>()

const cat = computed(() => categories.find(c => c.key === props.phonetic?.category))
const accent = computed(() => props.originAccent || cat.value?.accent || 'var(--theme_accent)')

const prevP = computed(() => props.phonetic ? phonetics.find(p => p.id === props.phonetic!.id - 1) : null)
const nextP = computed(() => props.phonetic ? phonetics.find(p => p.id === props.phonetic!.id + 1) : null)

const audioRef = ref<HTMLAudioElement | null>(null)
const playing = ref(false)
const exampleAudios = ref<Record<string, HTMLAudioElement | null>>({})

function playSymbol() {
  if (!audioRef.value)
    return
  audioRef.value.currentTime = 0
  audioRef.value.play().catch(() => {})
}

function onPlay() {
  playing.value = true
}

function onEnded() {
  playing.value = false
}

function playExample(key: string) {
  const el = exampleAudios.value[key]
  if (!el)
    return
  el.currentTime = 0
  el.play().catch(() => {})
}

function setRef(k: string, el: any) {
  exampleAudios.value[k] = el as HTMLAudioElement
}

function close() {
  emit('close')
}

function onKeydown(e: KeyboardEvent) {
  if (!props.phonetic)
    return
  if (e.key === 'Escape') {
    close()
  }
  else if (e.key === 'ArrowLeft' && prevP.value) {
    emit('navigate', prevP.value, null)
  }
  else if (e.key === 'ArrowRight' && nextP.value) {
    emit('navigate', nextP.value, null)
  }
  else if (e.key === ' ' || e.key === 'Enter') {
    e.preventDefault()
    playSymbol()
  }
}

watch(() => props.phonetic, () => {
  playing.value = false
})

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

const symbolEl = ref<HTMLElement | null>(null)
const contentEl = ref<HTMLElement | null>(null)
const backdropEl = ref<HTMLElement | null>(null)

const reduceMotion = typeof window !== 'undefined'
  && window.matchMedia('(prefers-reduced-motion: reduce)').matches

async function onEnter(_el: Element, done: () => void) {
  await nextTick()
  const rect = props.originRect
  const sym = symbolEl.value
  const content = contentEl.value
  const backdrop = backdropEl.value

  if (reduceMotion || !rect || !sym || !content || !backdrop) {
    done()
    return
  }

  const target = sym.getBoundingClientRect()
  const sx = rect.width / target.width
  const sy = rect.height / target.height
  const tx = (rect.left + rect.width / 2) - (target.left + target.width / 2)
  const ty = (rect.top + rect.height / 2) - (target.top + target.height / 2)

  backdrop.animate(
    [{ opacity: 0 }, { opacity: 1 }],
    { duration: 320, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'forwards' },
  )

  const symAnim = sym.animate(
    [
      {
        transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`,
        opacity: 0.6,
        filter: 'blur(2px)',
      },
      { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, filter: 'blur(0)' },
    ],
    { duration: 540, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
  )

  content.animate(
    [
      { opacity: 0, transform: 'translateY(28px) scale(0.96)' },
      { opacity: 1, transform: 'translateY(0) scale(1)' },
    ],
    { duration: 520, delay: 160, easing: 'cubic-bezier(0.22, 1, 0.36, 1)', fill: 'both' },
  )

  symAnim.finished.then(() => done()).catch(() => done())
}

async function onLeave(_el: Element, done: () => void) {
  const rect = props.originRect
  const sym = symbolEl.value
  const content = contentEl.value
  const backdrop = backdropEl.value

  if (reduceMotion || !sym || !content || !backdrop) {
    done()
    return
  }

  content.animate(
    [
      { opacity: 1, transform: 'translateY(0) scale(1)' },
      { opacity: 0, transform: 'translateY(20px) scale(0.97)' },
    ],
    { duration: 220, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' },
  )

  backdrop.animate(
    [{ opacity: 1 }, { opacity: 0 }],
    { duration: 360, delay: 120, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' },
  )

  if (rect) {
    const target = sym.getBoundingClientRect()
    const sx = rect.width / target.width
    const sy = rect.height / target.height
    const tx = (rect.left + rect.width / 2) - (target.left + target.width / 2)
    const ty = (rect.top + rect.height / 2) - (target.top + target.height / 2)

    const symAnim = sym.animate(
      [
        { transform: 'translate(0, 0) scale(1, 1)', opacity: 1, filter: 'blur(0)' },
        {
          transform: `translate(${tx}px, ${ty}px) scale(${sx}, ${sy})`,
          opacity: 0.4,
          filter: 'blur(2px)',
        },
      ],
      { duration: 460, delay: 80, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' },
    )
    symAnim.finished.then(() => done()).catch(() => done())
  }
  else {
    sym.animate(
      [
        { transform: 'scale(1)', opacity: 1 },
        { transform: 'scale(0.85)', opacity: 0 },
      ],
      { duration: 320, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', fill: 'both' },
    ).finished.then(() => done()).catch(() => done())
  }
}

function navTo(p: Phonetic | null | undefined) {
  if (p)
    emit('navigate', p, null)
}
</script>

<template>
  <Teleport to="body">
    <Transition
      :css="false"
      @enter="onEnter"
      @leave="onLeave"
    >
      <div
        v-if="phonetic"
        class="modal-root"
        :style="{ '--modal-accent': accent }"
        role="dialog"
        aria-modal="true"
      >
        <div ref="backdropEl" class="modal-backdrop" @click="close" />

        <div class="modal-stage">
          <div ref="contentEl" class="modal-card">
            <div class="modal-glow" />

            <button class="close-btn" aria-label="关闭" @click="close">
              <div class="i-carbon-close" />
            </button>

            <div class="hero-row">
              <div class="hero-meta">
                <span class="tag" :style="{ background: accent }">{{ phonetic.categoryName }}</span>
                <span class="meta-id">No. {{ String(phonetic.id).padStart(2, '0') }}</span>
              </div>
              <div class="hero-pager">
                <button class="pager-btn" :disabled="!prevP" aria-label="上一个" @click="navTo(prevP)">
                  <div class="i-carbon-chevron-left" />
                </button>
                <button class="pager-btn" :disabled="!nextP" aria-label="下一个" @click="navTo(nextP)">
                  <div class="i-carbon-chevron-right" />
                </button>
              </div>
            </div>

            <div class="hero-symbol-row">
              <div ref="symbolEl" class="hero-symbol">
                <span class="symbol">{{ phonetic.symbol }}</span>
              </div>
              <button class="big-play" :class="{ playing }" :aria-label="`播放 ${phonetic.symbol}`" @click="playSymbol">
                <div v-if="playing" class="i-carbon-volume-up-filled" />
                <div v-else class="i-carbon-play-filled-alt" />
              </button>
              <audio
                ref="audioRef"
                :src="assetUrl(phonetic.audio)"
                preload="metadata"
                @play="onPlay"
                @ended="onEnded"
                @pause="onEnded"
              />
            </div>

            <div class="modal-grid">
              <div class="video-section">
                <div class="section-label">
                  <div class="i-carbon-video" />
                  <span>口型视频</span>
                </div>
                <div class="video-card">
                  <video
                    :key="phonetic.video"
                    controls
                    playsinline
                    :poster="assetUrl(phonetic.poster)"
                    :src="assetUrl(phonetic.video)"
                    class="video-el"
                  >
                    当前浏览器无法显示视频
                  </video>
                </div>
              </div>

              <div class="examples-section">
                <div class="section-label">
                  <div class="i-carbon-bookmark" />
                  <span>例词练习</span>
                  <span class="count-pill">{{ phonetic.examples.length }}</span>
                </div>
                <div class="example-list">
                  <button
                    v-for="(ex, i) in phonetic.examples"
                    :key="ex.word + i"
                    class="example-card"
                    @click="playExample(ex.word + i)"
                  >
                    <div class="ex-top">
                      <div class="ex-word">
                        {{ ex.word }}
                      </div>
                      <div class="ex-play">
                        <div class="i-carbon-volume-up" />
                      </div>
                    </div>
                    <div class="ex-ipa">
                      {{ ex.ipa }}
                    </div>
                    <div class="ex-meaning">
                      {{ ex.meaning }}
                    </div>
                    <audio
                      :ref="(el: any) => setRef(ex.word + i, el)"
                      :src="assetUrl(ex.audio)"
                      preload="none"
                    />
                  </button>
                </div>
              </div>
            </div>

            <div class="hint-row">
              <kbd>Esc</kbd> 关闭 ·
              <kbd>←</kbd><kbd>→</kbd> 切换 ·
              <kbd>Space</kbd> 播放
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.modal-root {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  pointer-events: auto;
}

.modal-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(20, 20, 19, 0.62);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  opacity: 0;
}

html.dark .modal-backdrop {
  background: rgba(0, 0, 0, 0.72);
}

.modal-stage {
  position: relative;
  width: 100%;
  max-width: 920px;
  max-height: calc(100vh - 48px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-card {
  position: relative;
  width: 100%;
  max-height: calc(100vh - 48px);
  background: var(--theme_surface);
  border: 1px solid var(--theme_border);
  border-radius: 16px;
  padding: 32px 36px 24px;
  box-shadow: var(--theme_shadow_md), var(--theme_shadow_ambient);
  overflow: auto;
  will-change: transform, opacity;
}

html.dark .modal-card {
  box-shadow: var(--theme_shadow_md), var(--theme_shadow_ambient);
}

.modal-glow {
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: 26px;
  background: var(--modal-accent);
  opacity: 0.07;
  z-index: -1;
  filter: blur(18px);
  pointer-events: none;
}

.close-btn {
  position: absolute;
  top: 18px;
  right: 18px;
  width: 36px;
  height: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--theme_border);
  background: var(--theme_surface);
  color: var(--theme_text_secondary);
  cursor: pointer;
  z-index: 5;
  transition: all 0.15s ease;
}
.close-btn:hover {
  background: var(--theme_surface_hover);
  color: var(--theme_text);
  transform: rotate(90deg);
}

.hero-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
  padding-right: 44px;
}

.hero-meta {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.tag {
  display: inline-block;
  padding: 4px 12px;
  border-radius: 6px;
  color: #faf9f5;
  font-size: 12px;
  font-weight: 500;
  letter-spacing: 0.4px;
}

.meta-id {
  font-family: 'JetBrains Mono', monospace;
  font-size: 12px;
  color: var(--theme_text_weak);
  letter-spacing: 1px;
}

.hero-pager {
  display: inline-flex;
  gap: 6px;
}

.pager-btn {
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  border: 1px solid var(--theme_border);
  background: var(--theme_surface);
  color: var(--theme_text_secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}
.pager-btn:not(:disabled):hover {
  border-color: var(--modal-accent);
  color: var(--modal-accent);
  background: var(--theme_accent_soft);
}
.pager-btn:disabled {
  opacity: 0.35;
  cursor: not-allowed;
}

.hero-symbol-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 24px 0 32px;
  position: relative;
}

.hero-symbol-row::before,
.hero-symbol-row::after {
  content: '';
  position: absolute;
  height: 1px;
  background: var(--theme_border);
  bottom: 0;
  left: 0;
  right: 0;
}

.hero-symbol {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform-origin: center;
  will-change: transform, opacity;
}

.symbol {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 88px;
  font-weight: 500;
  line-height: 1;
  letter-spacing: 0;
  color: var(--modal-accent);
}

.big-play {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  border: none;
  background: var(--modal-accent);
  color: white;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 22px;
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--modal-accent) 70%, transparent),
    0 8px 24px color-mix(in srgb, var(--modal-accent) 24%, transparent);
  transition:
    transform 0.18s ease,
    box-shadow 0.18s ease;
}

.big-play:hover {
  transform: scale(1.06);
  box-shadow:
    0 0 0 1px var(--modal-accent),
    0 12px 30px color-mix(in srgb, var(--modal-accent) 34%, transparent);
}

.big-play.playing {
  animation: bigPulse 1.2s ease-in-out infinite;
}

@keyframes bigPulse {
  0%,
  100% {
    box-shadow:
      0 0 0 1px var(--modal-accent),
      0 8px 24px color-mix(in srgb, var(--modal-accent) 24%, transparent);
  }
  50% {
    box-shadow:
      0 0 0 1px var(--modal-accent),
      0 8px 24px color-mix(in srgb, var(--modal-accent) 40%, transparent),
      0 0 0 12px color-mix(in srgb, var(--modal-accent) 0%, transparent);
  }
}

.modal-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(0, 1fr);
  gap: 24px;
  padding-top: 24px;
}

.section-label {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.1px;
  color: var(--theme_text);
  margin-bottom: 12px;
}

.section-label > div:first-child {
  color: var(--modal-accent);
}

.count-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: var(--theme_accent_soft);
  color: var(--modal-accent);
  font-size: 11px;
  font-weight: 500;
}

.video-card {
  border-radius: 10px;
  border: 1px solid var(--theme_border);
  background: #000;
  overflow: hidden;
}

.video-el {
  display: block;
  width: 100%;
  height: auto;
  max-height: 320px;
  background: #000;
}

.example-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.example-card {
  text-align: left;
  padding: 14px 16px;
  background: var(--theme_surface);
  border: 1px solid var(--theme_border);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: inherit;
}

.example-card:hover {
  border-color: var(--modal-accent);
  background: var(--theme_accent_soft);
  transform: translateX(2px);
}

.ex-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.ex-word {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 20px;
  font-weight: 500;
  color: var(--theme_text);
  letter-spacing: 0.2px;
}

.ex-play {
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--theme_surface_subtle);
  color: var(--modal-accent);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
  font-size: 12px;
}

.example-card:hover .ex-play {
  background: var(--modal-accent);
  color: white;
}

.ex-ipa {
  font-family: 'JetBrains Mono', monospace;
  font-size: 13px;
  color: var(--theme_text_secondary);
  letter-spacing: 0.4px;
}

.ex-meaning {
  font-size: 13px;
  color: var(--theme_text_weak);
}

.hint-row {
  margin-top: 24px;
  padding-top: 16px;
  border-top: 1px dashed var(--theme_border);
  text-align: center;
  font-size: 12px;
  color: var(--theme_text_weak);
  letter-spacing: 0.2px;
}

kbd {
  font-family: 'JetBrains Mono', monospace;
  font-size: 11px;
  padding: 2px 6px;
  margin: 0 2px;
  background: var(--theme_surface_subtle);
  border: 1px solid var(--theme_border);
  border-bottom-width: 2px;
  border-radius: 5px;
  color: var(--theme_text_secondary);
}

@media (max-width: 720px) {
  .modal-root {
    padding: 12px;
  }
  .modal-card {
    padding: 24px 20px 18px;
    border-radius: 14px;
  }
  .symbol {
    font-size: 56px;
  }
  .big-play {
    width: 52px;
    height: 52px;
  }
  .modal-grid {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .hint-row {
    display: none;
  }
}
</style>
