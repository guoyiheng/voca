<script setup lang="ts">
defineProps<{
  modelValue: string
}>()
defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()
</script>

<template>
  <div class="search-wrap">
    <div class="search-icon i-carbon-search" />
    <input
      class="search-input"
      type="text"
      :value="modelValue"
      placeholder="搜索音标 / 单词 / 中文释义"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
    <button v-if="modelValue" class="clear-btn" @click="$emit('update:modelValue', '')">
      <div class="i-carbon-close" />
    </button>
  </div>
</template>

<style scoped>
.search-wrap {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  max-width: 560px;
  background: var(--theme_surface);
  border: 1px solid var(--theme_border);
  border-radius: 10px;
  padding: 0 14px;
  box-shadow: 0 0 0 1px rgba(232, 230, 220, 0.2);
  transition:
    border-color 180ms ease,
    box-shadow 180ms ease,
    background-color 180ms ease;
}

.search-wrap:focus-within {
  border-color: var(--theme_accent);
  box-shadow: 0 0 0 4px var(--theme_accent_soft);
}

.search-icon {
  color: var(--theme_accent);
  font-size: 17px;
  flex-shrink: 0;
}

.search-input {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  padding: 15px 10px;
  font-size: 14px;
  color: var(--theme_text);
  font-family: inherit;
  letter-spacing: 0.01em;
}

.search-input::placeholder {
  color: var(--theme_text_weak);
}

.clear-btn {
  border: none;
  background: transparent;
  color: var(--theme_text_weak);
  cursor: pointer;
  padding: 5px;
  display: inline-flex;
  border-radius: 6px;
  transition:
    color 150ms ease,
    background-color 150ms ease;
}
.clear-btn:hover {
  color: var(--theme_text);
  background: var(--theme_surface_hover);
}
</style>
