<script setup lang="ts">
import type { Phonetic } from '~/composables/usePhonetics'
import { assetUrl } from '~/composables/usePhonetics'

const props = defineProps<{
  phonetic: Phonetic
  accent?: string
}>()

const emit = defineEmits<{
  (e: 'open', phonetic: Phonetic, rect: DOMRect, accent: string): void
}>()

const symbolEl = ref<HTMLElement | null>(null)
const audioRef = ref<HTMLAudioElement | null>(null)
const playing = ref(false)

function playSymbol(e: MouseEvent) {
  e.stopPropagation()
  e.preventDefault()
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

function openDetail() {
  const rect = symbolEl.value?.getBoundingClientRect()
  if (!rect)
    return
  emit('open', props.phonetic, rect, props.accent || 'var(--theme_accent)')
}
</script>

<template>
  <div
    class="phonetic-card"
    :style="{ '--card-accent': accent || 'var(--theme_accent)' }"
    role="button"
    tabindex="0"
    @click="openDetail"
    @keydown.enter="openDetail"
  >
    <div ref="symbolEl" class="symbol">
      {{ phonetic.symbol }}
    </div>

    <div class="meta">
      <span class="meta-id">{{ String(phonetic.id).padStart(2, '0') }}</span>
      <button
        class="play-btn"
        :class="{ playing }"
        :aria-label="`播放 ${phonetic.symbol}`"
        @click="playSymbol"
      >
        <div v-if="playing" class="i-carbon-volume-up-filled" />
        <div v-else class="i-carbon-play-filled-alt" />
      </button>
    </div>

    <audio
      ref="audioRef"
      :src="assetUrl(phonetic.audio)"
      preload="none"
      @play="onPlay"
      @ended="onEnded"
      @pause="onEnded"
    />
  </div>
</template>

<style scoped>
.phonetic-card {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 24px;
  padding: 18px 16px 14px;
  background: var(--theme_surface);
  border: 1px solid var(--theme_border);
  border-radius: 8px;
  cursor: pointer;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease,
    background-color 180ms ease;
  min-height: 126px;
  user-select: none;
  outline: none;
}

.phonetic-card:hover,
.phonetic-card:focus-visible {
  border-color: var(--card-accent);
  box-shadow: var(--theme_shadow_md);
  background: color-mix(in srgb, var(--theme_surface) 86%, var(--card-accent));
  transform: translateY(-3px);
}

.phonetic-card:focus-visible {
  outline: 2px solid var(--card-accent);
  outline-offset: 2px;
}

.symbol {
  font-family: Georgia, 'Times New Roman', serif;
  font-size: 34px;
  font-weight: 500;
  color: var(--theme_text);
  letter-spacing: 0;
  line-height: 1;
  margin-top: 4px;
  transform-origin: center;
}

.meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.meta-id {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 11px;
  color: var(--theme_text_weak);
  letter-spacing: 0.08em;
}

.play-btn {
  width: 31px;
  height: 31px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 1px solid color-mix(in srgb, var(--card-accent) 24%, var(--theme_border));
  cursor: pointer;
  background: color-mix(in srgb, var(--card-accent) 9%, var(--theme_surface));
  color: var(--card-accent);
  transition:
    transform 180ms ease,
    color 180ms ease,
    background-color 180ms ease;
  font-size: 14px;
}

.play-btn:hover {
  background: var(--card-accent);
  color: white;
  transform: scale(1.08);
}

.play-btn.playing {
  background: var(--card-accent);
  color: white;
  animation: pulse 1.4s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 0 0 0 color-mix(in srgb, var(--card-accent) 20%, transparent);
  }
  50% {
    box-shadow: 0 0 0 6px color-mix(in srgb, var(--card-accent) 0%, transparent);
  }
}
</style>
