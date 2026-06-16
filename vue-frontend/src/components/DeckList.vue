<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

interface Deck {
  id: number
  title: string
  category: string
}

const router = useRouter()
const decks = ref<Deck[]>([])
const error = ref<string | null>(null)
const loading = ref(true)
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const newTitle = ref('')
const newCategory = ref('')
const creating = ref(false)
const deletingId = ref<number | null>(null)

async function loadDecks() {
  loading.value = true
  error.value = null
  try {
    const response = await fetch(`${apiUrl}/api/decks`)
    if (!response.ok) throw new Error()
    decks.value = await response.json()
  } catch {
    error.value = 'Decks konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

async function createDeck() {
  if (!newTitle.value.trim() || !newCategory.value.trim()) return
  creating.value = true
  error.value = null
  try {
    const response = await fetch(`${apiUrl}/api/decks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: newTitle.value.trim(), category: newCategory.value.trim() }),
    })
    if (!response.ok) throw new Error()
    newTitle.value = ''
    newCategory.value = ''
    await loadDecks()
  } catch {
    error.value = 'Deck konnte nicht erstellt werden.'
  } finally {
    creating.value = false
  }
}

async function deleteDeck(id: number) {
  error.value = null
  try {
    const response = await fetch(`${apiUrl}/api/decks/${id}`, { method: 'DELETE' })
    if (!response.ok) throw new Error()
    deletingId.value = null
    await loadDecks()
  } catch {
    error.value = 'Deck konnte nicht gelöscht werden.'
    deletingId.value = null
  }
}

function goToDeck(deck: Deck) {
  router.push({
    name: 'deck',
    params: { id: deck.id },
    query: { title: deck.title, category: deck.category },
  })
}

onMounted(loadDecks)
</script>

<template>
  <section class="deck-list" aria-label="Meine Lernkarten-Decks">
    <div class="form-card">
      <h2 class="form-title">Neues Deck erstellen</h2>
      <form class="deck-form" @submit.prevent="createDeck" novalidate>
        <input
          v-model="newTitle"
          type="text"
          placeholder="Titel"
          aria-label="Deck-Titel"
          autocomplete="off"
          required
        />
        <input
          v-model="newCategory"
          type="text"
          placeholder="Kategorie"
          aria-label="Kategorie"
          autocomplete="off"
          required
        />
        <button type="submit" class="btn-primary" :disabled="creating" :aria-busy="creating">
          {{ creating ? 'Wird erstellt…' : 'Erstellen' }}
        </button>
      </form>
    </div>

    <div v-if="error" role="alert" aria-live="assertive" class="error">⚠ {{ error }}</div>

    <div class="decks-header">
      <h2 class="section-title">Meine Decks</h2>
      <span class="deck-count" aria-label="{{ decks.length }} Decks vorhanden">
        {{ decks.length }} {{ decks.length === 1 ? 'Deck' : 'Decks' }}
      </span>
    </div>

    <div v-if="loading" class="loading" role="status" aria-label="Decks werden geladen">
      <span class="spinner" aria-hidden="true"></span>
      <span>Laden…</span>
    </div>

    <p v-else-if="!error && decks.length === 0" class="empty">
      Noch keine Decks vorhanden – erstelle dein erstes Deck!
    </p>

    <ul v-else class="deck-grid" role="list">
      <li v-for="deck in decks" :key="deck.id" role="listitem">
        <article class="deck-card" @click="goToDeck(deck)">
          <template v-if="deletingId !== deck.id">
            <div class="deck-card-top">
              <span class="deck-category">{{ deck.category }}</span>
              <button
                class="btn-delete"
                @click.stop="deletingId = deck.id"
                :aria-label="`Deck ${deck.title} löschen`"
              >
                ✕
              </button>
            </div>
            <h3 class="deck-title">{{ deck.title }}</h3>
            <p class="deck-hint" aria-hidden="true">Klicken zum Öffnen →</p>
          </template>

          <template v-else>
            <p class="delete-question">„{{ deck.title }}" löschen?</p>
            <div class="delete-actions">
              <button class="btn-cancel-inline" @click.stop="deletingId = null">Abbrechen</button>
              <button class="btn-danger-inline" @click.stop="deleteDeck(deck.id)">Löschen</button>
            </div>
          </template>
        </article>
      </li>
    </ul>
  </section>
</template>

<style scoped>
.deck-list {
  display: flex;
  flex-direction: column;
  gap: 1.75rem;
}

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
  min-width: 140px;
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

.btn-primary:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
}

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

/* Loading */
.loading {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #9ca3af;
  font-size: 0.9rem;
  padding: 2rem 0;
  justify-content: center;
}

.spinner {
  width: 18px;
  height: 18px;
  border: 2px solid #e5e7eb;
  border-top-color: #6366f1;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
  padding: 3rem 0;
}

.deck-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  list-style: none;
  padding: 0;
  margin: 0;
}

@media (min-width: 480px) {
  .deck-grid {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
}

.deck-card {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.1rem 1.25rem;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
  transition:
    box-shadow 0.15s,
    transform 0.15s;
  cursor: pointer;
  min-height: 90px;
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

.deck-hint {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.4rem;
}

.btn-delete {
  background: none;
  border: none;
  color: #d1d5db;
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.25rem 0.4rem;
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
