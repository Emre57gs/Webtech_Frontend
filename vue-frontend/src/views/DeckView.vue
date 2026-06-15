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
const error = ref<string | null>(null)
const newQuestion = ref('')
const newAnswer = ref('')
const revealedIds = ref<Set<number>>(new Set())

async function loadCards() {
  try {
    const res = await fetch(`${apiUrl}/api/decks/${deckId}/cards`)
    if (!res.ok) throw new Error()
    cards.value = await res.json()
  } catch {
    error.value = 'Karten konnten nicht geladen werden.'
  }
}

async function addCard() {
  if (!newQuestion.value || !newAnswer.value) return
  try {
    const res = await fetch(`${apiUrl}/api/decks/${deckId}/cards`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: newQuestion.value, answer: newAnswer.value }),
    })
    if (!res.ok) throw new Error()
    newQuestion.value = ''
    newAnswer.value = ''
    await loadCards()
  } catch {
    error.value = 'Karte konnte nicht erstellt werden.'
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
    <div class="deck-header">
      <button class="btn-back" @click="router.push('/')">← Zurück</button>
      <div class="deck-meta">
        <span class="deck-category-badge">{{ deckCategory }}</span>
        <h1 class="deck-heading">{{ deckTitle }}</h1>
      </div>
      <button class="btn-quiz" :disabled="cards.length === 0" @click="startQuiz">
        Quiz starten →
      </button>
    </div>

    <p v-if="error" class="error">⚠ {{ error }}</p>

    <div class="add-card-form">
      <h2 class="form-title">Neue Karte hinzufügen</h2>
      <form @submit.prevent="addCard" class="card-form">
        <textarea v-model="newQuestion" placeholder="Frage" rows="2" required></textarea>
        <textarea v-model="newAnswer" placeholder="Antwort" rows="2" required></textarea>
        <button type="submit" class="btn-primary">Karte hinzufügen</button>
      </form>
    </div>

    <div class="cards-section">
      <div class="cards-header">
        <h2 class="section-title">Karten</h2>
        <span class="card-count"
          >{{ cards.length }} {{ cards.length === 1 ? 'Karte' : 'Karten' }}</span
        >
      </div>

      <p v-if="cards.length === 0" class="empty">
        Noch keine Karten – füge deine erste Karte hinzu!
      </p>

      <ul class="card-list">
        <li v-for="card in cards" :key="card.id" class="card-item">
          <div class="card-question">{{ card.question }}</div>
          <div class="card-divider"></div>
          <div class="card-answer-wrap">
            <div v-if="revealedIds.has(card.id)" class="card-answer">{{ card.answer }}</div>
            <button v-else class="btn-reveal" @click="toggleReveal(card.id)">
              Antwort anzeigen
            </button>
          </div>
        </li>
      </ul>
    </div>
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
  align-items: center;
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
}

.btn-back:hover {
  background: #f9fafb;
}

.deck-meta {
  flex: 1;
}

.deck-category-badge {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: #6366f1;
  background: #eef2ff;
  border-radius: 4px;
  padding: 0.2rem 0.5rem;
}

.deck-heading {
  font-size: 1.6rem;
  font-weight: 700;
  color: #111827;
  margin-top: 0.35rem;
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
}

.btn-quiz:hover:not(:disabled) {
  background: #4f46e5;
}

.btn-quiz:disabled {
  opacity: 0.4;
  cursor: not-allowed;
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

/* Add card form */
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
  min-width: 180px;
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

.btn-primary:hover {
  background: #4f46e5;
}

/* Cards section */
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
  color: #6b7280;
  background: #f3f4f6;
  padding: 0.2rem 0.6rem;
  border-radius: 99px;
}

.empty {
  text-align: center;
  color: #9ca3af;
  font-size: 0.95rem;
  padding: 3rem 0;
}

.card-list {
  list-style: none;
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
}

.card-question {
  flex: 1;
  font-size: 0.95rem;
  color: #111827;
  font-weight: 500;
}

.card-divider {
  width: 1px;
  height: 2rem;
  background: #e5e7eb;
}

.card-answer-wrap {
  flex: 1;
}

.card-answer {
  font-size: 0.95rem;
  color: #6366f1;
  font-weight: 500;
}

.btn-reveal {
  background: none;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  padding: 0.3rem 0.75rem;
  font-size: 0.82rem;
  color: #9ca3af;
  cursor: pointer;
  transition:
    border-color 0.15s,
    color 0.15s;
}

.btn-reveal:hover {
  border-color: #6366f1;
  color: #6366f1;
}
</style>
