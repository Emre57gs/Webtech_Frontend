<script setup lang="ts">
import { ref, onMounted } from 'vue'

interface Deck {
  id: number
  title: string
  category: string
}

const decks = ref<Deck[]>([])
const error = ref<string | null>(null)
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const newTitle = ref('')
const newCategory = ref('')

async function loadDecks() {
  try {
    const response = await fetch(`${apiUrl}/api/decks`)
    if (!response.ok) throw new Error(`Serverfehler: ${response.status}`)
    decks.value = await response.json()
  } catch (e) {
    error.value = 'Decks konnten nicht geladen werden.'
  }
}

async function createDeck() {
  if (!newTitle.value || !newCategory.value) return
  try {
    const response = await fetch(`${apiUrl}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.value, category: newCategory.value }),
    })
    if (!response.ok) throw new Error(`Serverfehler: ${response.status}`)
    newTitle.value = ''
    newCategory.value = ''
    await loadDecks()
  } catch (e) {
    error.value = 'Deck konnte nicht erstellt werden.'
  }
}

onMounted(loadDecks)
</script>

<template>
  <section class="deck-list">
    <h1>Lernkarten-Decks</h1>

    <form class="deck-form" @submit.prevent="createDeck">
      <input v-model="newTitle" type="text" placeholder="Titel" required />
      <input v-model="newCategory" type="text" placeholder="Kategorie" required />
      <button type="submit">Deck erstellen</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <article v-for="deck in decks" :key="deck.id" class="deck-card">
      <h2>{{ deck.title }}</h2>
      <p>{{ deck.category }}</p>
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
