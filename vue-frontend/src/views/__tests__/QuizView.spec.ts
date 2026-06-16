import { describe, it, expect, vi, afterEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import QuizView from '../QuizView.vue'

vi.mock('vue-router', () => ({
  useRoute: () => ({
    params: { id: '1' },
    query: { title: 'Mathe' },
  }),
  useRouter: () => ({ push: vi.fn() }),
}))

const mockCards = [
  { id: 10, question: 'Was ist 2+2?', answer: '4' },
  { id: 11, question: 'Hauptstadt von Frankreich?', answer: 'Paris' },
]

describe('QuizView', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('lädt Karten und zeigt die erste Frage', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCards),
      }),
    )

    const wrapper = mount(QuizView)
    await flushPromises()

    expect(wrapper.text()).toContain('Was ist 2+2?')
    expect(wrapper.text()).toContain('1 / 2')
  })

  it('zeigt Fehlermeldung wenn fetch fehlschlägt', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: false, status: 500 }))

    const wrapper = mount(QuizView)
    await flushPromises()

    expect(wrapper.text()).toContain('Karten konnten nicht geladen werden.')
  })

  it('dreht Karte beim Klicken um und zeigt Antwort-Buttons', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCards),
      }),
    )

    const wrapper = mount(QuizView)
    await flushPromises()

    expect(wrapper.find('.answer-buttons').exists()).toBe(false)
    await wrapper.find('.flip-scene').trigger('click')
    expect(wrapper.find('.flip-card').classes()).toContain('flipped')
    expect(wrapper.find('.answer-buttons').exists()).toBe(true)
  })

  it('geht zur nächsten Karte nach "Gewusst"', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCards),
      }),
    )

    const wrapper = mount(QuizView)
    await flushPromises()

    await wrapper.find('.flip-scene').trigger('click')
    await wrapper.find('.btn-correct').trigger('click')

    expect(wrapper.text()).toContain('Hauptstadt von Frankreich?')
    expect(wrapper.text()).toContain('2 / 2')
  })

  it('zeigt Endscreen nach der letzten Karte', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockCards),
      }),
    )

    const wrapper = mount(QuizView)
    await flushPromises()

    // Karte 1 beantworten
    await wrapper.find('.flip-scene').trigger('click')
    await wrapper.find('.btn-correct').trigger('click')

    // Karte 2 beantworten
    await wrapper.find('.flip-scene').trigger('click')
    await wrapper.find('.btn-wrong').trigger('click')

    expect(wrapper.find('.endscreen').exists()).toBe(true)
    expect(wrapper.text()).toContain('1 von 2 Karten gewusst')
  })
})
