<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Card {
  name: string
}

const cards = ref<Card[]>([])
const error = ref<string | null>(null)
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

onMounted(async () => {
  try {
    const response = await fetch(`${apiUrl}/test`)
    if (!response.ok) throw new Error(`Serverfehler: ${response.status}`)
    cards.value = await response.json()
  } catch (e) {
    error.value = 'Karten konnten nicht geladen werden.'
  }
})
</script>

<template>
  <section class="deck-list">
    <h1>Lernkarten-Decks</h1>

    <p v-if="error" class="error">{{ error }}</p>

    <article v-for="card in cards" :key="card.name" class="deck-card">
      <h2>{{ card.name }}</h2>
    </article>
  </section>
</template>

<style scoped>
.deck-list {
  display: grid;
  gap: 1rem;
}

.deck-card {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 1rem;
}

.deck-card h2 {
  margin-bottom: 0.5rem;
}
</style>
