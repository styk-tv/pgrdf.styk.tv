<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { withBase } from 'vitepress'

const props = defineProps({
  chapter: { type: String, required: true },
})

// ── Singleton audio enforcement ───────────────────────────────────────────
// The design spec's hard constraint: exactly one audio engine, two sources
// structurally impossible. We model that with one <audio> element owned by
// this component and a module-level guard that pauses any other instance
// before this one plays. (A page only embeds one ChapterPlayer, but the
// guard makes overlap unrepresentable even if that changes.)
let activePlayer = null

const audioEl   = ref(null)
const manifest  = ref(null)
const episodes  = ref([])
const chapName  = ref('')
const idx       = ref(0)
const playing   = ref(false)
const curTime   = ref(0)
const duration  = ref(0)
const loadError = ref('')

const current = computed(() => episodes.value[idx.value] || null)
const available = computed(() => episodes.value.filter(e => e.status === 'available'))
const positionLabel = computed(() => {
  if (!current.value) return '—'
  const n = idx.value + 1
  const m = episodes.value.length
  return `${n} of ${m} — ${current.value.title}`
})

function fmt (s) {
  if (!s || !isFinite(s)) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60).toString().padStart(2, '0')
  return `${m}:${sec}`
}

const progressPct = computed(() =>
  duration.value > 0 ? (curTime.value / duration.value) * 100 : 0
)

async function loadManifest () {
  try {
    const res = await fetch(withBase('/audio/manifest.json'))
    if (!res.ok) throw new Error(`manifest ${res.status}`)
    manifest.value = await res.json()
    const ch = manifest.value.chapters?.[props.chapter]
    if (!ch) throw new Error(`chapter "${props.chapter}" not in manifest`)
    chapName.value = ch.name
    episodes.value = ch.episodes || []
    // Start index at the first available episode.
    const firstAvail = episodes.value.findIndex(e => e.status === 'available')
    idx.value = firstAvail >= 0 ? firstAvail : 0
  } catch (e) {
    loadError.value = String(e.message || e)
  }
}

function srcFor (ep) {
  return ep?.file ? withBase(ep.file) : ''
}

function selectEpisode (i) {
  const ep = episodes.value[i]
  if (!ep || ep.status !== 'available') return
  idx.value = i
  const a = audioEl.value
  if (!a) return
  a.src = srcFor(ep)
  a.load()
  play()
}

function play () {
  const a = audioEl.value
  if (!a || !current.value || current.value.status !== 'available') return
  if (!a.src) { a.src = srcFor(current.value); a.load() }
  // Singleton guard: stop any other ChapterPlayer before we start.
  if (activePlayer && activePlayer !== a) {
    try { activePlayer.pause() } catch {}
  }
  activePlayer = a
  a.play().then(() => { playing.value = true }).catch(() => {})
}

function pause () {
  const a = audioEl.value
  if (a) { a.pause(); playing.value = false }
}

function toggle () { playing.value ? pause() : play() }

function nextAvailableFrom (i, dir) {
  let j = i + dir
  while (j >= 0 && j < episodes.value.length) {
    if (episodes.value[j]?.status === 'available') return j
    j += dir
  }
  return -1
}

function next () {
  const j = nextAvailableFrom(idx.value, +1)
  if (j >= 0) selectEpisode(j)
}
function prev () {
  const j = nextAvailableFrom(idx.value, -1)
  if (j >= 0) selectEpisode(j)
}

function onTime () {
  const a = audioEl.value
  if (a) { curTime.value = a.currentTime; duration.value = a.duration || 0 }
}
function onEnded () {
  playing.value = false
  // Auto-advance to the next available episode (spec §4.1).
  const j = nextAvailableFrom(idx.value, +1)
  if (j >= 0) selectEpisode(j)
}
function seek (e) {
  const a = audioEl.value
  if (!a || !duration.value) return
  const rect = e.currentTarget.getBoundingClientRect()
  const ratio = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width))
  a.currentTime = ratio * duration.value
}

onMounted(loadManifest)
onBeforeUnmount(() => {
  const a = audioEl.value
  if (a) a.pause()
  if (activePlayer === a) activePlayer = null
})
</script>

<template>
  <div class="chapter-player">
    <div class="cp-head">
      <span class="material-symbols-outlined icon-blue">psychology</span>
      <div>
        <div class="cp-chapter">{{ chapName || chapter }}</div>
        <div class="cp-sub">Audio companion · Kokoro TTS · Apache-2.0</div>
      </div>
    </div>

    <p v-if="loadError" class="cp-error">
      Audio manifest unavailable ({{ loadError }}).
    </p>

    <template v-else>
      <!-- Now playing + transport -->
      <div class="cp-now">
        <div class="cp-position">{{ positionLabel }}</div>
        <div class="cp-bar" @click="seek">
          <div class="cp-bar-fill" :style="{ width: progressPct + '%' }"></div>
        </div>
        <div class="cp-time">{{ fmt(curTime) }} / {{ fmt(duration) }}</div>
        <div class="cp-transport">
          <button class="cp-btn" :disabled="available.length < 2" @click="prev" title="previous episode">
            <span class="material-symbols-outlined">skip_previous</span>
          </button>
          <button class="cp-btn cp-primary" @click="toggle"
                  :disabled="!current || current.status !== 'available'">
            <span class="material-symbols-outlined">{{ playing ? 'pause' : 'play_arrow' }}</span>
            {{ playing ? 'Pause' : 'Play' }}
          </button>
          <button class="cp-btn" :disabled="available.length < 2" @click="next" title="next episode">
            <span class="material-symbols-outlined">skip_next</span>
          </button>
        </div>
      </div>

      <!-- Episode list -->
      <ol class="cp-list">
        <li v-for="(ep, i) in episodes" :key="ep.id"
            :class="{ active: i === idx, pending: ep.status !== 'available' }">
          <button v-if="ep.status === 'available'" class="cp-ep" @click="selectEpisode(i)">
            <span class="material-symbols-outlined cp-ep-ic">{{ i === idx && playing ? 'graphic_eq' : 'play_circle' }}</span>
            <span class="cp-ep-title">{{ ep.title }}</span>
            <span class="cp-ep-dur" v-if="ep.duration_s">{{ fmt(ep.duration_s) }}</span>
          </button>
          <span v-else class="cp-ep cp-ep-disabled">
            <span class="material-symbols-outlined cp-ep-ic">schedule</span>
            <span class="cp-ep-title">{{ ep.title }}</span>
            <span class="cp-ep-dur">pending</span>
          </span>
        </li>
      </ol>

      <p class="cp-foot">
        Test slice — {{ available.length }} of {{ episodes.length }} episodes
        rendered. Single audio engine; selecting an episode stops any other.
        Auto-advances to the next available episode on finish.
      </p>
    </template>

    <audio ref="audioEl" preload="none"
           @timeupdate="onTime" @loadedmetadata="onTime"
           @ended="onEnded" @play="playing = true" @pause="playing = false"></audio>
  </div>
</template>

<style scoped>
.chapter-player {
  border: 1px solid var(--vp-c-divider);
  border-radius: 12px;
  padding: 18px 20px;
  margin: 22px 0;
  background: var(--vp-c-bg-soft);
}
.cp-head { display: flex; align-items: center; gap: 12px; margin-bottom: 14px; }
.cp-head .material-symbols-outlined { font-size: 1.9em; }
.cp-chapter { font-weight: 700; font-size: 1.05em; }
.cp-sub { font-size: 0.8em; color: var(--vp-c-text-2); }
.cp-error { color: var(--vp-c-danger-1, #d33); font-size: 0.9em; }

.cp-now { margin-bottom: 14px; }
.cp-position { font-weight: 600; font-size: 0.95em; margin-bottom: 8px; }
.cp-bar {
  height: 8px; border-radius: 4px; background: var(--vp-c-divider);
  cursor: pointer; overflow: hidden;
}
.cp-bar-fill {
  height: 100%; background: var(--vp-c-brand-1);
  transition: width 0.15s linear;
}
.cp-time { font-size: 0.78em; color: var(--vp-c-text-2); margin: 6px 0 12px; font-variant-numeric: tabular-nums; }
.cp-transport { display: flex; gap: 8px; align-items: center; }
.cp-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: 1px solid var(--vp-c-divider); background: var(--vp-c-bg);
  border-radius: 8px; padding: 7px 12px; cursor: pointer;
  font-size: 0.88em; color: var(--vp-c-text-1);
}
.cp-btn:hover:not(:disabled) { border-color: var(--vp-c-brand-1); }
.cp-btn:disabled { opacity: 0.4; cursor: not-allowed; }
.cp-btn .material-symbols-outlined { font-size: 1.2em; }
.cp-primary { background: var(--vp-c-brand-1); color: #fff; border-color: var(--vp-c-brand-1); }
.cp-primary:hover:not(:disabled) { background: var(--vp-c-brand-2); }

.cp-list { list-style: none; padding: 0; margin: 0 0 12px; }
.cp-list li { margin: 2px 0; }
.cp-ep {
  display: flex; align-items: center; gap: 10px; width: 100%;
  text-align: left; border: 0; background: transparent;
  padding: 8px 10px; border-radius: 8px; cursor: pointer;
  color: var(--vp-c-text-1); font-size: 0.9em;
}
.cp-ep:hover { background: var(--vp-c-default-soft); }
.cp-list li.active .cp-ep { background: var(--vp-c-brand-soft); font-weight: 600; }
.cp-ep-ic { font-size: 1.3em; color: var(--vp-c-brand-1); }
.cp-ep-title { flex: 1; }
.cp-ep-dur { font-size: 0.8em; color: var(--vp-c-text-2); font-variant-numeric: tabular-nums; }
.cp-ep-disabled { cursor: default; color: var(--vp-c-text-3, var(--vp-c-text-2)); }
.cp-ep-disabled .cp-ep-ic { color: var(--vp-c-text-3, var(--vp-c-text-2)); }
.cp-list li.pending { opacity: 0.65; }

.cp-foot { font-size: 0.78em; color: var(--vp-c-text-2); margin: 0; }
</style>
