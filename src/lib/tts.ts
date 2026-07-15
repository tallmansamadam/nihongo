// Voice reader built on the Web Speech API. Exposes every Japanese voice the
// device/webview provides (on Android these are the system TTS voices; on
// Windows, the installed OS voices). No engine offers authentic regional
// Japanese accents, so the picker offers real voice variety, not fake accents.

export interface TtsSettings {
  voiceURI: string | null
  rate: number
}

const SETTINGS_KEY = 'nihongo:tts'

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function loadSettings(): TtsSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (raw) return { rate: 1, voiceURI: null, ...JSON.parse(raw) }
  } catch {
    /* ignore */
  }
  return { voiceURI: null, rate: 1 }
}

export function saveSettings(s: TtsSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    /* ignore */
  }
}

/** Japanese voices, resolving Chromium's async getVoices() quirk. */
export function getJapaneseVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!ttsSupported()) return resolve([])
    const pick = () =>
      speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith('ja'))
    const now = pick()
    if (now.length > 0) return resolve(now)
    let done = false
    const finish = () => {
      if (done) return
      done = true
      resolve(pick())
    }
    speechSynthesis.addEventListener('voiceschanged', finish, { once: true })
    setTimeout(finish, 1500) // some webviews never fire voiceschanged
  })
}

let current: SpeechSynthesisUtterance | null = null

export function stopSpeaking() {
  if (!ttsSupported()) return
  current = null
  speechSynthesis.cancel()
}

/** Speak Japanese text with the saved voice/rate. Resolves when done/stopped. */
export function speak(text: string, onEnd?: () => void): void {
  if (!ttsSupported()) return
  stopSpeaking()
  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
  const s = loadSettings()
  u.rate = s.rate
  getJapaneseVoices().then((voices) => {
    const chosen = voices.find((v) => v.voiceURI === s.voiceURI) ?? voices[0]
    if (chosen) u.voice = chosen
    u.onend = () => {
      if (current === u) current = null
      onEnd?.()
    }
    u.onerror = u.onend
    current = u
    speechSynthesis.speak(u)
  })
}

export function isSpeaking(): boolean {
  return ttsSupported() && speechSynthesis.speaking
}

/** Pronounce a single kanji: prefer its kun reading, else on, else the char.
 *  Strips dictionary notation (okurigana dots, hyphens) before speaking. */
export function pronounceReading(kun?: string[], on?: string[], fallback?: string) {
  const text = (kun?.[0] ?? on?.[0] ?? fallback)?.replace(/[.．・-]/g, '')
  if (text) speak(text)
}
