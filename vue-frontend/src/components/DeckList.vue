<script setup lang="ts">
const decks = [
  {
    id: 1,
    title: 'Java Grundlagen',
    description: 'Karteikarten zu Klassen, Objekten und Vererbung',
    cardCount: 12,
  },
  {
    id: 2,
    title: 'Webtechnologien',
    description: 'HTML, CSS, Vue.js und REST APIs',
    cardCount: 18,
  },
  {
    id: 3,
    title: 'Datenbanken',
    description: 'SQL, Tabellen und Beziehungen',
    cardCount: 9,
  },
]
</script>

<template>
  <section class="deck-list">
    <h1>Lernkarten-Decks</h1>

    <article v-for="deck in decks" :key="deck.id" class="deck-card">
      <h2>{{ deck.title }}</h2>
      <p>{{ deck.description }}</p>
      <span>{{ deck.cardCount }} Karten</span>
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
