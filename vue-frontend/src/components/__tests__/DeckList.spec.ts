import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import DeckList from '../DeckList.vue'

const mockDecks = [
  { id: 1, title: 'Mathe', category: 'Schule' },
  { id: 2, title: 'Vokabeln', category: 'Sprachen' },
]

describe('DeckList', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lädt Decks beim Mounten und rendert sie', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockDecks),
      }),
    )

    const wrapper = mount(DeckList)
    await flushPromises()

    expect(wrapper.text()).toContain('Mathe')
    expect(wrapper.text()).toContain('Schule')
    expect(wrapper.findAll('.deck-card')).toHaveLength(2)
  })

  it('zeigt Fehlermeldung wenn fetch fehlschlägt', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
      }),
    )

    const wrapper = mount(DeckList)
    await flushPromises()

    expect(wrapper.text()).toContain('Decks konnten nicht geladen werden.')
  })

  it('erstellt kein Deck wenn Felder leer sind', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockDecks),
    })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(DeckList)
    await flushPromises()

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    // Nur der initiale GET beim Mount, kein POST
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('zeigt Fehlermeldung wenn POST fehlschlägt', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockDecks) })
      .mockResolvedValueOnce({ ok: false, status: 500 })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(DeckList)
    await flushPromises()

    await wrapper.find('input[placeholder="Titel"]').setValue('Physik')
    await wrapper.find('input[placeholder="Kategorie"]').setValue('Schule')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(wrapper.text()).toContain('Deck konnte nicht erstellt werden.')
  })

  it('erstellt ein Deck und lädt die Liste neu', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(mockDecks) })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: 3, title: 'Physik', category: 'Schule' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([...mockDecks, { id: 3, title: 'Physik', category: 'Schule' }]),
      })
    vi.stubGlobal('fetch', fetchMock)

    const wrapper = mount(DeckList)
    await flushPromises()

    await wrapper.find('input[placeholder="Titel"]').setValue('Physik')
    await wrapper.find('input[placeholder="Kategorie"]').setValue('Schule')
    await wrapper.find('form').trigger('submit')
    await flushPromises()

    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('/api/decks'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ title: 'Physik', category: 'Schule' }),
      }),
    )
    expect(wrapper.text()).toContain('Physik')
  })
})
