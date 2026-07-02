<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

interface Card {
  id: number
  question: string
  answer: string
}

const route = useRoute()
const router = useRouter()
const deckId = Number(route.params.id)
const deckTitle = route.query.title as string
const deckCategory = route.query.category as string
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const cards = ref<Card[]>([])
const deletingCardId = ref<number | null>(null)
const error = ref<string | null>(null)
const loading = ref(true)
const adding = ref(false)
const newQuestion = ref('')
const newAnswer = ref('')
const revealedIds = ref<Set<number>>(new Set())

async function loadCards() {
  loading.value = true
  error.value = null
  try {
    const res = await fetch(`${apiUrl}/api/decks/${deckId}/cards`)
    if (!res.ok) throw new Error()
    cards.value = await res.json()
  } catch {
    error.value = 'Karten konnten nicht geladen werden.'
  } finally {
    loading.value = false
  }
}

async function addCard() {
  if (!newQuestion.value.trim() || !newAnswer.value.trim()) return
  adding.value = true
  error.value = null
  try {
    const res = await fetch(`${apiUrl}/api/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion.value.trim(), answer: newAnswer.value.trim() }),
    })
    if (!res.ok) throw new Error()
    newQuestion.value = ''
    newAnswer.value = ''
    await loadCards()
  } catch {
    error.value = 'Karte konnte nicht erstellt werden.'
  } finally {
    adding.value = false
  }
}

async function deleteCard(cardId: number) {
  deletingCardId.value = cardId
  error.value = null

  try {
    const res = await fetch(`${apiUrl}/api/decks/${deckId}/cards/${cardId}`, {
      method: 'DELETE',
    })

    if (!res.ok) throw new Error()

    revealedIds.value.delete(cardId)
    await loadCards()
  } catch {
    error.value = 'Karte konnte nicht gelöscht werden.'
  } finally {
    deletingCardId.value = null
  }
}

function toggleReveal(id: number) {
  const next = new Set(revealedIds.value)
  next.has(id) ? next.delete(id) : next.add(id)
  revealedIds.value = next
}

function startQuiz() {
  router.push({ name: 'quiz', params: { id: deckId }, query: { title: deckTitle } })
}

onMounted(loadCards)
</script>

<template>
  <div class="deck-view">
    <nav class="deck-header" aria-label="Deck-Navigation">
      <button class="btn-back" @click="router.push('/')" aria-label="Zurück zur Startseite">
        ← Zurück
      </button>
      <div class="deck-meta">
        <span class="deck-category-badge">{{ deckCategory }}</span>
        <h1 class="deck-heading">{{ deckTitle }}</h1>
      </div>
      <button
        class="btn-quiz"
        :disabled="cards.length === 0 || loading"
        :aria-disabled="cards.length === 0 || loading"
        @click="startQuiz"
      >
        Quiz starten →
      </button>
    </nav>

    <div v-if="error" role="alert" aria-live="assertive" class="error">⚠ {{ error }}</div>

    <section class="add-card-form" aria-label="Neue Karte hinzufügen">
      <h2 class="form-title">Neue Karte hinzufügen</h2>
      <form @submit.prevent="addCard" class="card-form" novalidate>
        <textarea
          v-model="newQuestion"
          placeholder="Frage"
          aria-label="Frage"
          rows="2"
          required
        ></textarea>
        <textarea
          v-model="newAnswer"
          placeholder="Antwort"
          aria-label="Antwort"
          rows="2"
          required
        ></textarea>
        <button type="submit" class="btn-primary" :disabled="adding" :aria-busy="adding">
          {{ adding ? 'Wird hinzugefügt…' : 'Karte hinzufügen' }}
        </button>
      </form>
    </section>

    <section class="cards-section" aria-label="Kartenliste">
      <div class="cards-header">
        <h2 class="section-title">Karten</h2>
        <span class="card-count"
          >{{ cards.length }} {{ cards.length === 1 ? 'Karte' : 'Karten' }}</span
        >
      </div>

      <div v-if="loading" class="loading" role="status" aria-label="Karten werden geladen">
        <span class="spinner" aria-hidden="true"></span>
        <span>Laden…</span>
      </div>

      <p v-else-if="cards.length === 0" class="empty">
        Noch keine Karten – füge deine erste Karte hinzu!
      </p>

      <ul v-else class="card-list" role="list">
        <li v-for="card in cards" :key="card.id" class="card-item" role="listitem">
          <div class="card-question">{{ card.question }}</div>
          <div class="card-divider" aria-hidden="true"></div>
          <div class="card-answer-wrap">
            <template v-if="revealedIds.has(card.id)">
              <div class="card-answer">{{ card.answer }}</div>
              <button
                class="btn-reveal"
                @click="toggleReveal(card.id)"
                :aria-label="`Antwort auf „${card.question}“ ausblenden`"
              >
                Antwort ausblenden
              </button>
            </template>

            <button
              v-else
              class="btn-reveal"
              @click="toggleReveal(card.id)"
              :aria-label="`Antwort auf „${card.question}“ anzeigen`"
            >
              Antwort anzeigen
            </button>
          </div>

          <button
            class="btn-delete-card"
            :disabled="deletingCardId === card.id"
            @click="deleteCard(card.id)"
            :aria-label="`Karte „${card.question}“ löschen`"
          >
            {{ deletingCardId === card.id ? 'Löscht…' : 'Löschen' }}
          </button>
        </li>
      </ul>
    </section>
  </div>
</template>

<style scoped>
.deck-view {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.deck-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.btn-back {
  background: none;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  color: #6b7280;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-back:hover {
  background: #f9fafb;
}

.deck-meta {
  flex: 1;
  min-width: 0;
}

.deck-category-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #312e81;
  background: #e0e7ff;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
}

.deck-heading {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.35rem;
  word-break: break-word;
}

@media (min-width: 640px) {
  .deck-heading {
    font-size: 1.6rem;
  }
}

.btn-quiz {
  padding: 0.65rem 1.4rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
  white-space: nowrap;
  flex-shrink: 0;
}

.btn-quiz:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-quiz:disabled {
  opacity: 0.4;
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

.add-card-form {
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

.card-form {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  align-items: flex-start;
}

.card-form textarea {
  flex: 1;
  min-width: 160px;
  padding: 0.6rem 0.9rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-size: 0.9rem;
  font-family: inherit;
  color: #111;
  outline: none;
  resize: vertical;
  transition:
    border-color 0.15s,
    box-shadow 0.15s;
}

.card-form textarea:focus {
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

.cards-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #111827;
}

.card-count {
  font-size: 0.8rem;
  color: #374151;
  background: #e5e7eb;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

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

.card-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.card-item {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1rem 1.25rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);
  flex-wrap: wrap;
}

.card-question {
  flex: 1;
  min-width: 120px;
  font-size: 0.95rem;
  color: #111827;
  font-weight: 500;
}

.card-divider {
  width: 1px;
  height: 2rem;
  background: #e5e7eb;
  flex-shrink: 0;
}

@media (max-width: 480px) {
  .card-divider {
    display: none;
  }
  .card-item {
    flex-direction: column;
    align-items: flex-start;
  }
}

.card-answer-wrap {
  flex: 1;
  min-width: 120px;
}

.card-answer {
  font-size: 0.95rem;
  color: #6366f1;
  font-weight: 500;
}

.btn-reveal {
  background: none;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.82rem;
  color: #6b7280;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.btn-reveal:hover {
  border-color: #6366f1;
  color: #4f46e5;
}

.btn-delete-card {
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.82rem;
  color: #b91c1c;
  cursor: pointer;
  transition:
    background 0.15s,
    border-color 0.15s;
}

.btn-delete-card:hover:not(:disabled) {
  background: #fee2e2;
  border-color: #fca5a5;
}

.btn-delete-card:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
