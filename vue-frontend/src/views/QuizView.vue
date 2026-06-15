<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
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
const apiUrl = import.meta.env.VITE_API_URL ?? 'http://localhost:8080'

const cards = ref<Card[]>([])
const currentIndex = ref(0)
const flipped = ref(false)
const correctCount = ref(0)
const done = ref(false)
const error = ref<string | null>(null)

const currentCard = computed(() => cards.value[currentIndex.value])
const progressPercent = computed(() =>
  cards.value.length ? Math.round((currentIndex.value / cards.value.length) * 100) : 0,
)
const scorePercent = computed(() =>
  cards.value.length ? Math.round((correctCount.value / cards.value.length) * 100) : 0,
)

const scoreClass = computed(() => {
  if (scorePercent.value >= 80) return 'great'
  if (scorePercent.value >= 50) return 'ok'
  return 'poor'
})

const scoreHeading = computed(() => {
  if (scorePercent.value === 100) return 'Perfekt!'
  if (scorePercent.value >= 80) return 'Sehr gut!'
  if (scorePercent.value >= 50) return 'Nicht schlecht!'
  return 'Weiter üben!'
})

async function loadCards() {
  try {
    const res = await fetch(`${apiUrl}/api/decks/${deckId}/cards`)
    if (!res.ok) throw new Error()
    cards.value = await res.json()
  } catch {
    error.value = 'Karten konnten nicht geladen werden.'
  }
}

function flip() {
  if (!flipped.value) flipped.value = true
}

function answer(knew: boolean) {
  if (knew) correctCount.value++
  flipped.value = false
  if (currentIndex.value + 1 >= cards.value.length) {
    done.value = true
  } else {
    currentIndex.value++
  }
}

function restart() {
  currentIndex.value = 0
  correctCount.value = 0
  flipped.value = false
  done.value = false
}

function backToDeck() {
  router.push({ name: 'deck', params: { id: deckId }, query: { title: deckTitle } })
}

onMounted(loadCards)
</script>

<template>
  <div class="quiz-view">
    <div class="quiz-header">
      <button class="btn-back" @click="backToDeck">← {{ deckTitle }}</button>
      <span class="quiz-label">Quiz</span>
    </div>

    <p v-if="error" class="error">⚠ {{ error }}</p>

    <div v-else-if="cards.length === 0 && !error" class="empty">Keine Karten in diesem Deck.</div>

    <!-- Quiz läuft -->
    <template v-else-if="!done">
      <div class="progress-bar-wrap">
        <div class="progress-bar" :style="{ width: progressPercent + '%' }"></div>
      </div>
      <p class="progress-text">{{ currentIndex + 1 }} / {{ cards.length }}</p>

      <div class="flip-scene" @click="flip">
        <div class="flip-card" :class="{ flipped }">
          <div class="flip-front">
            <span class="card-label">Frage</span>
            <p class="card-text">{{ currentCard?.question }}</p>
            <span class="flip-hint">Klicken zum Aufdecken</span>
          </div>
          <div class="flip-back">
            <span class="card-label">Antwort</span>
            <p class="card-text">{{ currentCard?.answer }}</p>
          </div>
        </div>
      </div>

      <div v-if="flipped" class="answer-buttons">
        <button class="btn-wrong" @click="answer(false)">✗ Nicht gewusst</button>
        <button class="btn-correct" @click="answer(true)">✓ Gewusst</button>
      </div>
      <p v-else class="flip-cta">Karte anklicken um die Antwort zu sehen</p>
    </template>

    <!-- Endscreen -->
    <div v-else class="endscreen">
      <div class="score-circle" :class="scoreClass">
        <span class="score-percent">{{ scorePercent }}%</span>
      </div>
      <h2 class="score-heading">{{ scoreHeading }}</h2>
      <p class="score-sub">{{ correctCount }} von {{ cards.length }} Karten gewusst</p>
      <div class="end-actions">
        <button class="btn-restart" @click="restart">Nochmal</button>
        <button class="btn-back-deck" @click="backToDeck">Zurück zum Deck</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.quiz-view {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.quiz-header {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
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
}

.btn-back:hover {
  background: #f9fafb;
}

.quiz-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6366f1;
  background: #eef2ff;
  padding: 0.25rem 0.75rem;
  border-radius: 99px;
}

.error {
  background: #fef2f2;
  border: 1px solid #fca5a5;
  color: #b91c1c;
  border-radius: 8px;
  padding: 0.7rem 1rem;
  font-size: 0.9rem;
  width: 100%;
}

.empty {
  color: #9ca3af;
  font-size: 0.95rem;
  padding: 4rem 0;
}

/* Progress */
.progress-bar-wrap {
  width: 100%;
  height: 6px;
  background: #e5e7eb;
  border-radius: 99px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: #6366f1;
  border-radius: 99px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 0.85rem;
  color: #9ca3af;
  align-self: flex-end;
}

/* Flip card */
.flip-scene {
  width: 100%;
  max-width: 540px;
  height: 260px;
  perspective: 1200px;
  cursor: pointer;
}

.flip-card {
  width: 100%;
  height: 100%;
  position: relative;
  transform-style: preserve-3d;
  transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

.flip-card.flipped {
  transform: rotateY(180deg);
}

.flip-front,
.flip-back {
  position: absolute;
  inset: 0;
  backface-visibility: hidden;
  border-radius: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 0.75rem;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
}

.flip-front {
  background: white;
  border: 1px solid #e5e7eb;
}

.flip-back {
  background: #6366f1;
  transform: rotateY(180deg);
}

.card-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
}

.flip-front .card-label {
  color: #9ca3af;
}

.flip-back .card-label {
  color: rgba(255, 255, 255, 0.7);
}

.card-text {
  font-size: 1.25rem;
  font-weight: 600;
  text-align: center;
  line-height: 1.4;
}

.flip-front .card-text {
  color: #111827;
}

.flip-back .card-text {
  color: white;
}

.flip-hint {
  font-size: 0.78rem;
  color: #d1d5db;
  position: absolute;
  bottom: 1rem;
}

.flip-cta {
  font-size: 0.85rem;
  color: #9ca3af;
}

/* Answer buttons */
.answer-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 540px;
}

.btn-wrong,
.btn-correct {
  flex: 1;
  padding: 0.85rem;
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.1s,
    opacity 0.15s;
}

.btn-wrong:hover,
.btn-correct:hover {
  opacity: 0.88;
  transform: translateY(-1px);
}

.btn-wrong {
  background: #fee2e2;
  color: #b91c1c;
}

.btn-correct {
  background: #dcfce7;
  color: #15803d;
}

/* Endscreen */
.endscreen {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  padding: 2rem 0;
}

.score-circle {
  width: 110px;
  height: 110px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.6rem;
  font-weight: 800;
}

.score-circle.great {
  background: #dcfce7;
  color: #15803d;
}
.score-circle.ok {
  background: #fef9c3;
  color: #854d0e;
}
.score-circle.poor {
  background: #fee2e2;
  color: #b91c1c;
}

.score-heading {
  font-size: 1.4rem;
  font-weight: 700;
  color: #111827;
}

.score-sub {
  font-size: 0.95rem;
  color: #6b7280;
}

.end-actions {
  display: flex;
  gap: 0.75rem;
  margin-top: 0.5rem;
}

.btn-restart {
  padding: 0.65rem 1.4rem;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  background: white;
  color: #374151;
  font-size: 0.9rem;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-restart:hover {
  background: #f9fafb;
}

.btn-back-deck {
  padding: 0.65rem 1.4rem;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}

.btn-back-deck:hover {
  background: #4f46e5;
}
</style>
