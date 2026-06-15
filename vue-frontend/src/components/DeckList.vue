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

const deletingId = ref<number | null>(null)

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

async function deleteDeck(id: number) {
  try {
    const response = await fetch(`${apiUrl}/api/decks/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error(`Serverfehler: ${response.status}`)
    deletingId.value = null
    await loadDecks()
  } catch (e) {
    error.value = 'Deck konnte nicht gelöscht werden.'
    deletingId.value = null
  }
}

onMounted(loadDecks)
</script>

<template>
  <section class="deck-list">
    <div class="form-card">
      <h2 class="form-title">Neues Deck erstellen</h2>
      <form class="deck-form" @submit.prevent="createDeck">
        <input v-model="newTitle" type="text" placeholder="Titel" required />
        <input v-model="newCategory" type="text" placeholder="Kategorie" required />
        <button type="submit" class="btn-primary">Erstellen</button>
      </form>
    </div>

    <p v-if="error" class="error">⚠ {{ error }}</p>

    <div class="decks-header">
      <h2 class="section-title">Meine Decks</h2>
      <span class="deck-count">{{ decks.length }} {{ decks.length === 1 ? 'Deck' : 'Decks' }}</span>
    </div>

    <p v-if="!error && decks.length === 0" class="empty">
      Noch keine Decks vorhanden – erstelle dein erstes Deck!
    </p>

    <div class="deck-grid">
      <article v-for="deck in decks" :key="deck.id" class="deck-card">
        <template v-if="deletingId !== deck.id">
          <div class="deck-card-top">
            <span class="deck-category">{{ deck.category }}</span>
            <button class="btn-delete" @click="deletingId = deck.id" title="Deck löschen">✕</button>
          </div>
          <h3 class="deck-title">{{ deck.title }}</h3>
        </template>

        <template v-else>
          <p class="delete-question">„{{ deck.title }}" löschen?</p>
          <div class="delete-actions">
            <button class="btn-cancel-inline" @click="deletingId = null">Abbrechen</button>
            <button class="btn-danger-inline" @click="deleteDeck(deck.id)">Löschen</button>
          </div>
        </template>
      </article>
    </div>
  </section>
</template>

<style scoped>
.deck-list {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

/* Form Card */
.form-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.form-title {
  font-size: 1rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 1rem;
}

.deck-form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.deck-form input {
  flex: 1;
  min-width: 150px;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #111;
  outline: none;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.deck-form input:focus {
  border-color: #6366f1;
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.btn-primary {
  padding: 0.6rem 1.4rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
}

.btn-primary:hover {
  background: #4f46e5;
}

/* Error */
.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
}

/* Decks Header */
.decks-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.deck-count {
  font-size: 0.8rem;
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

/* Empty state */
.empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
  padding: 3rem 0;
}

/* Grid */
.deck-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

/* Card */
.deck-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 0.15s,
    transform 0.15s;
}

.deck-card:hover {
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.1);
  transform: translateY(-2px);
}

.deck-card-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 0.6rem;
}

.deck-category {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6366f1;
  background: #eef2ff;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
}

.deck-title {
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
  margin: 0;
}

.btn-delete {
  background: none;
  border: none;
  color: #d1d5db;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.1rem 0.3rem;
  border-radius: 4px;
  line-height: 1;
  transition:
    color 0.15s,
    background 0.15s;
}

.btn-delete:hover {
  color: #ef4444;
  background: #fef2f2;
}

/* Inline Bestätigung */
.delete-question {
  font-size: 0.85rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.75rem;
}

.delete-actions {
  display: flex;
  gap: 0.5rem;
}

.btn-cancel-inline {
  flex: 1;
  padding: 0.45rem 0;
  border: 1px solid #d1d5db;
  border-radius: 7px;
  background: white;
  color: #374151;
  font-size: 0.82rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-cancel-inline:hover {
  background: #f9fafb;
}

.btn-danger-inline {
  flex: 1;
  padding: 0.45rem 0;
  border: none;
  border-radius: 7px;
  background: #ef4444;
  color: white;
  font-size: 0.82rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-danger-inline:hover {
  background: #dc2626;
}
</style>
