import { useMemo, useState } from 'react'
import { buildDecks, loadKnown, saveKnown, type Flashcard } from '../lib/flashcards'

function shuffled<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export default function FlashcardView() {
  const decks = useMemo(() => buildDecks(), [])
  const [deckId, setDeckId] = useState(decks[0].id)
  const deck = decks.find((d) => d.id === deckId)!

  const [known, setKnown] = useState<Set<string>>(() => loadKnown(deckId))
  const [order, setOrder] = useState<Flashcard[]>(() =>
    shuffled(deck.cards.filter((c) => !loadKnown(deckId).has(c.key))),
  )
  const [pos, setPos] = useState(0)
  const [flipped, setFlipped] = useState(false)

  function switchDeck(id: string) {
    const d = decks.find((x) => x.id === id)!
    const k = loadKnown(id)
    setDeckId(id)
    setKnown(k)
    setOrder(shuffled(d.cards.filter((c) => !k.has(c.key))))
    setPos(0)
    setFlipped(false)
  }
  function restart(includeKnown: boolean) {
    const base = includeKnown ? deck.cards : deck.cards.filter((c) => !known.has(c.key))
    setOrder(shuffled(base))
    setPos(0)
    setFlipped(false)
  }
  function resetProgress() {
    const empty = new Set<string>()
    setKnown(empty)
    saveKnown(deckId, empty)
    setOrder(shuffled(deck.cards))
    setPos(0)
    setFlipped(false)
  }
  function advance() {
    setFlipped(false)
    setPos((p) => p + 1)
  }
  function markKnown() {
    const card = order[pos]
    const next = new Set(known)
    next.add(card.key)
    setKnown(next)
    saveKnown(deckId, next)
    advance()
  }

  const card = order[pos]
  const done = pos >= order.length

  return (
    <div className="flash">
      <header className="reader-head">
        <div>
          <h1 className="story-title">Flashcards</h1>
          <p className="story-summary">
            Flip to reveal the reading and meaning. Mark cards you know and they drop out of the
            rotation. Progress is saved on this device.
          </p>
        </div>
      </header>

      <div className="flash-decks">
        {decks.map((d) => (
          <button
            key={d.id}
            className={'flash-deck' + (d.id === deckId ? ' active' : '')}
            onClick={() => switchDeck(d.id)}
          >
            {d.name}
            <span className="flash-deck-count">{d.cards.length}</span>
          </button>
        ))}
      </div>

      <div className="flash-stage">
        {done ? (
          <div className="flash-done">
            <div className="flash-done-big">✓</div>
            <p>
              {known.size >= deck.cards.length
                ? 'You’ve marked every card as known in this deck!'
                : `Round complete — ${known.size} of ${deck.cards.length} marked known.`}
            </p>
            <div className="flash-done-actions">
              <button className="test-submit" onClick={() => restart(false)}>
                Review remaining
              </button>
              <button onClick={() => restart(true)}>Shuffle all</button>
            </div>
          </div>
        ) : (
          <>
            <div className="flash-progress">
              {pos + 1} / {order.length}
              <span className="flash-known"> · {known.size} known</span>
            </div>
            <button
              className={'flash-card' + (flipped ? ' flipped' : '')}
              onClick={() => setFlipped((f) => !f)}
            >
              {!flipped ? (
                <span className="flash-front">{card.front}</span>
              ) : (
                <span className="flash-back">
                  {card.reading && <span className="flash-reading">{card.reading}</span>}
                  <span className="flash-meaning">{card.back}</span>
                  {card.sub && <span className="flash-sub">{card.sub}</span>}
                </span>
              )}
              <span className="flash-tap">{flipped ? 'tap to hide' : 'tap to flip'}</span>
            </button>
            <div className="flash-actions">
              <button className="flash-again" onClick={advance}>
                Again
              </button>
              <button className="flash-got" onClick={markKnown}>
                Got it ✓
              </button>
            </div>
          </>
        )}
      </div>

      <div className="flash-foot">
        <button onClick={() => restart(true)}>↻ Shuffle deck</button>
        <button onClick={resetProgress}>Reset progress</button>
      </div>
    </div>
  )
}
