<template>
  <div class="app-shell">
    <main class="app-main">
      <RouterView />
    </main>
    <TheFooter />
  </div>
</template>

<style>
.app-shell {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.app-main {
  flex: 1;
}
</style>
