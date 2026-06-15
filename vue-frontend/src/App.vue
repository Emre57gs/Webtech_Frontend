<script setup lang="ts">
import { RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header">
    <span class="app-logo">🃏</span>
    <h1 class="app-title">Flipside</h1>
  </header>

  <main class="app-main">
    <RouterView />
  </main>
</template>

<style scoped>
.app-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 2rem;
  background-color: #1a1a2e;
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.app-logo {
  font-size: 1.75rem;
}

.app-title {
  font-size: 1.5rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin: 0;
}

.app-main {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1.5rem;
}
</style>
