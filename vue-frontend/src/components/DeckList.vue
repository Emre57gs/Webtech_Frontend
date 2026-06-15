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
    <h2 class="section-title">Meine Decks</h2>

    <form class="deck-form" @submit.prevent="createDeck">
      <input v-model="newTitle" type="text" placeholder="Titel" required />
      <input v-model="newCategory" type="text" placeholder="Kategorie" required />
      <button type="submit">+ Deck erstellen</button>
    </form>

    <p v-if="error" class="error">{{ error }}</p>

    <p v-if="!error && decks.length === 0" class="empty">
      Noch keine Decks vorhanden. Erstelle dein erstes Deck!
    </p>

    <div class="deck-grid">
      <article v-for="deck in decks" :key="deck.id" class="deck-card">
        <span class="deck-category">{{ deck.category }}</span>
        <h3 class="deck-title">{{ deck.title }}</h3>
      </article>
    </div>
  </section>
</template>

<style scoped>
.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #1a1a2e;
}

.deck-form {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
}

.deck-form input {
  flex: 1;
  min-width: 140px;
  padding: 0.6rem 0.9rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  font-size: 0.95rem;
  outline: none;
  transition: border-color 0.2s;
}

.deck-form input:focus {
  border-color: #1a1a2e;
}

.deck-form button {
  padding: 0.6rem 1.2rem;
  background-color: #1a1a2e;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.95rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.deck-form button:hover {
  background-color: #2e2e5e;
}

.error {
  color: #c0392b;
  background: #fdecea;
  border: 1px solid #e74c3c;
  border-radius: 6px;
  padding: 0.6rem 1rem;
  margin-bottom: 1rem;
}

.empty {
  color: #888;
  font-style: italic;
  text-align: center;
  padding: 2rem 0;
}

.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1rem;
}

.deck-card {
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 10px;
  padding: 1.25rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s;
}

.deck-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.deck-category {
  display: inline-block;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1a1a2e;
  background: #e8e8f0;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
  margin-bottom: 0.5rem;
}

.deck-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: #222;
}
</style>
