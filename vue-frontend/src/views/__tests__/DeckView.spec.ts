import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeckView from '../DeckView.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' },
    query: { title: 'Mathe', category: 'Schule' },
  }),
  useRouter: () => ({ push: vi.fn() }),
}))

const mockCards = [
  { id: 10, question: 'Was ist 2+2?', answer: '4' },
  { id: 11, question: 'Hauptstadt von Frankreich?', answer: 'Paris' },
]

describe('DeckView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lädt Karten beim Mounten und rendert die Fragen', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCards),
      }),
    )

    const wrapper = mount(DeckView)
    await flushPromises()

    expect(wrapper.text()).toContain('Was ist 2+2?')
    expect(wrapper.text()).toContain('Hauptstadt von Frankreich?')
    expect(wrapper.findAll('.card-item')).toHaveLength(2)
  })

  it('zeigt Fehlermeldung wenn Karten nicht geladen werden können', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    const wrapper = mount(DeckView)
    await flushPromises()

    expect(wrapper.text()).toContain('Karten konnten nicht geladen werden.')
  })

  it('deckt Antwort nach Klick auf "Antwort anzeigen" auf', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCards),
      }),
    )

    const wrapper = mount(DeckView)
    await flushPromises()

    expect(wrapper.text()).not.toContain('4')
    await wrapper.find('.btn-reveal').trigger('click')
    expect(wrapper.text()).toContain('4')
  })

  it('deaktiviert Quiz-Button wenn keine Karten vorhanden', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve([]),
      }),
    )

    const wrapper = mount(DeckView)
    await flushPromises()

    const quizBtn = wrapper.find('.btn-quiz')
    expect((quizBtn.element as HTMLButtonElement).disabled).toBe(true)
  })

  it('fügt eine neue Karte hinzu und lädt die Liste neu', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockCards) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 12, question: 'Neue Frage?', answer: 'Antwort' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve([...mockCards, { id: 12, question: 'Neue Frage?', answer: 'Antwort' }]),
      })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(DeckView)
    await flushPromises()

    await wrapper.find('textarea[placeholder="Frage"]').setValue('Neue Frage?')
    await wrapper.find('textarea[placeholder="Antwort"]').setValue('Antwort')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/decks/1/cards'),
      expect.objectContaining({ method: 'POST' }),
    )
    expect(wrapper.text()).toContain('Neue Frage?')
  })
})
