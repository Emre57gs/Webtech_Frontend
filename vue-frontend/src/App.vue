<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>

<template>
  <header class="app-header" role="banner">
    <div class="app-header-inner">
      <RouterLink to="/" class="app-brand" aria-label="Flipside – zur Startseite">
        <span class="app-title">Flip<span class="app-accent">side</span></span>
      </RouterLink>
      <span class="app-tagline" aria-hidden="true">Lernkarten-App</span>
    </div>
  </header>
  <main class="app-main" id="main-content"><RouterView /></main>
  <footer class="app-footer" role="contentinfo"><p>&copy; 2025 Flipside</p></footer>
</template>

<style scoped>
.app-header {
  background: #ffffff;
  border-bottom: 1px solid #e5e7eb;
}

.app-header-inner {
  max-width: 860px;
  margin: 0 auto;
  padding: 1rem 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.app-brand {
  text-decoration: none;
  color: inherit;
  border-radius: 4px;
  outline-offset: 4px;
}

.app-brand:focus-visible {
  outline: 2px solid #6366f1;
}

.app-title {
  font-size: 1.35rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  color: #111827;
}

.app-accent {
  color: #6366f1;
}

.app-tagline {
  font-size: 0.8rem;
  color: #9ca3af;
  font-weight: 400;
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
  padding: 1.5rem;
  font-size: 0.78rem;
  color: #9ca3af;
  border-top: 1px solid #f3f4f6;
}
</style>
