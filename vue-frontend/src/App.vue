<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header" role="banner">
    <div class="app-header-inner">
      <RouterLink to="/" class="app-brand" aria-label="Flipside – zur Startseite">
        <span class="app-logo" aria-hidden="true">🃏</span>
        <span class="app-title">Flipside</span>
      </RouterLink>
      <p class="app-subtitle" aria-hidden="true">Deine Lernkarten-App</p>
    </div>
  </header>

  <main class="app-main" id="main-content">
    <RouterView />
  </main>

  <footer class="app-footer" role="contentinfo">
    <p>Flipside &copy; 2025</p>
  </footer>
</template>

<style scoped>
.app-header {
  background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
  color: white;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.25);
}

.app-header-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 1.25rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.app-brand {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  text-decoration: none;
  color: inherit;
  border-radius: 6px;
  outline-offset: 4px;
}

.app-brand:focus-visible {
  outline: 2px solid #6366f1;
}

.app-logo {
  font-size: 1.6rem;
}

.app-title {
  font-size: 1.4rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.app-subtitle {
  font-size: 0.85rem;
  opacity: 0.6;
  font-style: italic;
}

.app-main {
  flex: 1;
  max-width: 860px;
  width: 100%;
  margin: 2rem auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .app-main {
    padding: 0 1.5rem;
  }
}

.app-footer {
  text-align: center;
  padding: 1.25rem;
  font-size: 0.8rem;
  color: #999;
  border-top: 1px solid #eee;
}
</style>
