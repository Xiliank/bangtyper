const COMMON_WORDS = [
  "the", "be", "to", "of", "and", "a", "in", "that", "have", "I",
  "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
  "this", "but", "his", "by", "from", "they", "we", "say", "her", "she",
  "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
  "so", "up", "out", "if", "about", "who", "get", "which", "go", "me",
  "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
  "people", "into", "year", "your", "good", "some", "could", "them", "see", "other",
  "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
  "back", "after", "use", "two", "how", "our", "work", "first", "well", "way",
  "even", "new", "want", "because", "any", "these", "give", "day", "most", "us",
  "type", "speed", "focus", "rhythm", "keys", "hands", "flow", "pulse", "craft", "sharp",
  "clean", "quick", "steady", "bright", "signal", "target", "precise", "motion", "strike", "bang",
  "gold", "dark", "frame", "score", "level", "input", "output", "memory", "system", "engine",
  "vector", "matrix", "circuit", "power", "charge", "spark", "flame", "quiet", "calm", "desk",
  "letter", "space", "shift", "enter", "escape", "timer", "accuracy", "error", "correct", "practice",
  "session", "habit", "breath", "posture", "wrist", "finger", "reach", "return", "again", "next",
  "word", "line", "page", "story", "scene", "voice", "echo", "room", "window", "door",
  "bridge", "river", "stone", "path", "forest", "ocean", "cloud", "rain", "summer", "winter",
  "morning", "evening", "moment", "second", "minute", "hour", "week", "month", "future", "past",
  "begin", "finish", "start", "stop", "pause", "continue", "improve", "measure", "record", "review",
  "simple", "clear", "honest", "gentle", "strong", "soft", "heavy", "light", "open", "close",
  "under", "above", "beside", "between", "across", "around", "toward", "within", "without", "through",
  "always", "never", "often", "rarely", "maybe", "almost", "enough", "rather", "quite", "very",
  "should", "might", "must", "need", "try", "keep", "hold", "leave", "bring", "send",
  "read", "write", "listen", "speak", "learn", "teach", "build", "fix", "create", "change",
  "answer", "question", "reason", "choice", "chance", "effort", "result", "pattern", "balance", "detail",
  "surface", "center", "edge", "corner", "circle", "square", "angle", "distance", "height", "depth",
  "weather", "season", "sunset", "shadow", "mirror", "glass", "metal", "paper", "thread", "canvas",
];

/** Avoid the same word within this many previous picks (and never back-to-back). */
const RECENT_WINDOW = 7;

function pickWords(count: number): string[] {
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    const recent = out.slice(-RECENT_WINDOW).map((w) => w.toLowerCase());
    const banned = new Set(recent);
    const avoidPool = COMMON_WORDS.filter((w) => !banned.has(w.toLowerCase()));
    // Fallback: at least never identical to the previous word
    const source =
      avoidPool.length > 0
        ? avoidPool
        : COMMON_WORDS.filter(
            (w) => out.length === 0 || w.toLowerCase() !== out[out.length - 1]!.toLowerCase(),
          );
    const word =
      source[Math.floor(Math.random() * source.length)] ??
      COMMON_WORDS[Math.floor(Math.random() * COMMON_WORDS.length)]!;
    out.push(word);
  }
  return out;
}

export function generateRandomWords(count = 60): string {
  return pickWords(count).join(" ");
}

/** Test helper — exported for verification scripts. */
export function generateRandomWordsList(count = 60): string[] {
  return pickWords(count);
}
