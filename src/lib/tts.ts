// Voice reader. Two backends:
//  - Web Speech API (desktop / any webview that has it), with a voice picker
//  - window.AndroidTTS — a native TextToSpeech bridge injected by the Android
//    shell (MainActivity), because Android's system WebView has no Web Speech
//    API at all. One system Japanese voice, same rate setting.

export interface TtsSettings {
  voiceURI: string | null
  rate: number
}

const SETTINGS_KEY = 'nihongo:tts'

interface AndroidTtsBridge {
  speak(text: string, rate: number): void
  stop(): void
  isSpeaking(): boolean
  available(): boolean
}

function androidTts(): AndroidTtsBridge | null {
  const w = window as unknown as { AndroidTTS?: AndroidTtsBridge }
  return w.AndroidTTS ?? null
}

export function ttsSupported(): boolean {
  if (typeof window === 'undefined') return false
  return androidTts() !== null || 'speechSynthesis' in window
}

/** True when speech goes through the native Android bridge (single system
 *  voice — no voice picker). */
export function usingNativeTts(): boolean {
  return typeof window !== 'undefined' && androidTts() !== null
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

/** Japanese voices, resolving Chromium's async getVoices() quirk. The native
 *  Android backend has a single system voice, so it reports none here (the
 *  voice menu shows a note instead of a picker). */
export function getJapaneseVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (androidTts() || !('speechSynthesis' in window)) return resolve([])
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
let androidPoll: ReturnType<typeof setInterval> | null = null

export function stopSpeaking() {
  const native = androidTts()
  if (native) {
    if (androidPoll) clearInterval(androidPoll)
    androidPoll = null
    native.stop()
    return
  }
  if (!('speechSynthesis' in window)) return
  current = null
  speechSynthesis.cancel()
}

/** Speak Japanese text with the saved voice/rate. Calls onEnd when done. */
export function speak(text: string, onEnd?: () => void): void {
  if (!ttsSupported()) return
  stopSpeaking()
  const s = loadSettings()

  const native = androidTts()
  if (native) {
    native.speak(text, s.rate)
    // the bridge has no completion callback — poll the engine instead
    androidPoll = setInterval(() => {
      if (!native.isSpeaking()) {
        if (androidPoll) clearInterval(androidPoll)
        androidPoll = null
        onEnd?.()
      }
    }, 400)
    return
  }

  const u = new SpeechSynthesisUtterance(text)
  u.lang = 'ja-JP'
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
  const native = androidTts()
  if (native) return native.isSpeaking()
  return 'speechSynthesis' in window && speechSynthesis.speaking
}

/** Pronounce a single kanji: prefer its kun reading, else on, else the char.
 *  Strips dictionary notation (okurigana dots, hyphens) before speaking. */
export function pronounceReading(kun?: string[], on?: string[], fallback?: string) {
  const text = (kun?.[0] ?? on?.[0] ?? fallback)?.replace(/[.．・-]/g, '')
  if (text) speak(text)
}
