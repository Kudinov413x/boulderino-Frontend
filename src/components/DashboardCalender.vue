<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { components } from '@/types/schema'
import { getSessions } from '@/services/sessionService'

type Session = components['schemas']['SessionResponseDTO']

type CalendarDay = {
  key: string
  day: number
  hasSessions: boolean
  isToday: boolean
}

const router = useRouter()

const sessions = ref<Session[]>([])
const loading = ref(true)
const error = ref<string | null>(null)

const now = new Date()
const todayKey = toDateKey(now)

const displayedMonth = ref(
  new Date(now.getFullYear(), now.getMonth(), 1)
)

const selectedDate = ref<string | null>(todayKey)

const weekdays = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

// Verhindert Datumsverschiebungen bei ISO-Datumswerten.
function toDateKey(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

function sessionDateKey(date: string | null | undefined): string {
  if (!date) return ''

  // Bei YYYY-MM-DD oder ISO-Zeitstempeln den Datumsteil verwenden.
  const match = date.match(/^(\d{4}-\d{2}-\d{2})/)
  const datePart = match?.[1]

  if (datePart) return datePart

  const parsed = new Date(date)
  return Number.isNaN(parsed.getTime()) ? '' : toDateKey(parsed)
}

const monthTitle = computed(() =>
  displayedMonth.value.toLocaleDateString('de-DE', {
    month: 'long',
    year: 'numeric'
  })
)

const currentMonthStart = new Date(
  now.getFullYear(),
  now.getMonth(),
  1
)

const isCurrentMonth = computed(() =>
  displayedMonth.value.getFullYear() === currentMonthStart.getFullYear() &&
  displayedMonth.value.getMonth() === currentMonthStart.getMonth()
)

const sessionDates = computed(() => {
  const dates = new Set<string>()

  for (const session of sessions.value) {
    const key = sessionDateKey(session.date)
    if (key) dates.add(key)
  }

  return dates
})

const calendarDays = computed<(CalendarDay | null)[]>(() => {
  const year = displayedMonth.value.getFullYear()
  const month = displayedMonth.value.getMonth()
  const firstDay = new Date(year, month, 1)

  // JavaScript: Sonntag = 0. Kalender: Montag = 0.
  const leadingEmptyDays = (firstDay.getDay() + 6) % 7
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const days: (CalendarDay | null)[] = Array(leadingEmptyDays).fill(null)

  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const key = toDateKey(date)

    days.push({
      key,
      day,
      hasSessions: sessionDates.value.has(key),
      isToday: key === todayKey
    })
  }

  return days
})

const selectedSessions = computed(() => {
  if (!selectedDate.value) return []

  return sessions.value
    .filter(session => sessionDateKey(session.date) === selectedDate.value)
    .sort((a, b) =>
      sessionDateKey(b.date).localeCompare(sessionDateKey(a.date))
    )
})

const selectedDateLabel = computed(() => {
  if (!selectedDate.value) return ''

  const parts = selectedDate.value.split('-')

  if (parts.length !== 3) return ''

  const year = Number(parts[0])
  const month = Number(parts[1])
  const day = Number(parts[2])

  if (
    !Number.isInteger(year) ||
    !Number.isInteger(month) ||
    !Number.isInteger(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return ''
  }

  return new Date(year, month - 1, day).toLocaleDateString('de-DE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long'
  })
})

function previousMonth() {
  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() - 1,
    1
  )
  selectedDate.value = null
}

function nextMonth() {
  if (isCurrentMonth.value) return

  displayedMonth.value = new Date(
    displayedMonth.value.getFullYear(),
    displayedMonth.value.getMonth() + 1,
    1
  )
  selectedDate.value = null
}

function selectDay(day: CalendarDay) {
  selectedDate.value = day.key
}

function getSessionLabel(session: Session) {
  return session.name || session.location || 'Session'
}

function formatSessionTime(date: string | undefined) {
  if (!date) return ''

  // Bei reinen Datumswerten keine Uhrzeit anzeigen.
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) return ''

  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return ''

  return parsed.toLocaleTimeString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function openSession(session: Session) {
  if (session.id == null) return
  await router.push(`/sessionsStats/${session.id}`)
}

onMounted(async () => {
  try {
    sessions.value = await getSessions()
  } catch {
    error.value = 'Der Kalender konnte nicht geladen werden.'
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <section class="calendar-card">
    <div class="calendar-heading">
      <div>
        <p class="detail-label">Session-Kalender</p>
      </div>

      <div class="month-navigation">
        <button
          type="button"
          class="month-button"
          aria-label="Vorheriger Monat"
          @click="previousMonth"
        >
          ‹
        </button>

        <button
          type="button"
          class="month-button"
          aria-label="Nächster Monat"
          :disabled="isCurrentMonth"
          @click="nextMonth"
        >
          ›
        </button>
      </div>
    </div>

    <p class="month-title">{{ monthTitle }}</p>

    <p v-if="loading" class="calendar-message">
      Kalender wird geladen …
    </p>

    <p v-else-if="error" class="calendar-message calendar-error">
      {{ error }}
    </p>

    <template v-else>
      <div class="calendar-grid calendar-weekdays">
        <span v-for="weekday in weekdays" :key="weekday">
          {{ weekday }}
        </span>
      </div>

      <div class="calendar-grid calendar-dates">
        <span
          v-for="(day, index) in calendarDays"
          :key="day?.key ?? `empty-${index}`"
          class="calendar-cell"
        >
          <span
            v-if="day"
            class="calendar-day"
            :class="{
              'has-sessions': day.hasSessions,
              'is-today': day.isToday,
              'is-selected': selectedDate === day.key
            }"
            :aria-label="`${day.day}${day.hasSessions ? ', Session vorhanden' : ''}`"
          >
            <button
              type="button"
              class="day-button"
              :class="{ 'day-with-session': day.hasSessions }"
              :aria-pressed="selectedDate === day.key"
              @click="selectDay(day)"
            >
              {{ day.day }}
            </button>
          </span>
        </span>
      </div>

      <div class="calendar-legend">
        <span class="legend-dot"></span>
        <span>Session vorhanden</span>
      </div>

      <div class="selected-day-sessions">
        <h4>
          {{ selectedDate ? selectedDateLabel : 'Tag auswählen' }}
        </h4>

        <p v-if="!selectedDate" class="calendar-message">
          Wähle einen Tag im Kalender aus.
        </p>

        <p v-else-if="selectedSessions.length === 0" class="calendar-message">
          Für diesen Tag gibt es keine Sessions.
        </p>

        <button
          v-for="session in selectedSessions"
          :key="session.id"
          type="button"
          class="calendar-session"
          @click="openSession(session)"
        >
          <span class="calendar-session-copy">
            <strong>{{ getSessionLabel(session) }}</strong>
            <small v-if="session.location">{{ session.location }}</small>
          </span>

          <span class="calendar-session-time">
            {{ formatSessionTime(session.date) }}
            <span aria-hidden="true">→</span>
          </span>
        </button>
      </div>
    </template>
  </section>
</template>

<style scoped>
.calendar-card {
  margin-top: 1rem;
  padding: 1.25rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.09));
  border-radius: 18px;
  background: var(--card-background, rgba(255, 255, 255, 0.025));
  min-width: 0;
}

.calendar-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.detail-label {
  margin: 0 0 0.35rem;
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  opacity: 0.65;
}

.calendar-heading h3 {
  margin: 0;
  font-size: 1.1rem;
}

.month-navigation {
  display: flex;
  gap: 0.4rem;
}

.month-button {
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border: 1px solid var(--border-color, rgba(255, 255, 255, 0.12));
  border-radius: 10px;
  background: transparent;
  color: inherit;
  font-size: 1.5rem;
  cursor: pointer;
}

.month-button:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.month-title {
  margin: 1.25rem 0 0.85rem;
  font-weight: 600;
  text-transform: capitalize;
}

.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  text-align: center;
}

.calendar-weekdays {
  margin-bottom: 0.45rem;
  color: var(--muted-text, #999);
  font-size: 0.75rem;
}

.calendar-cell {
  display: grid;
  place-items: center;
  min-width: 0;
  padding: 0.15rem 0;
}

.calendar-day {
  position: relative;
  display: grid;
  place-items: center;
  width: 2.2rem;
  height: 2.2rem;
  border-radius: 50%;
}

.day-button {
  display: grid;
  place-items: center;
  width: 100%;
  height: 100%;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: inherit;
  font: inherit;
  cursor: pointer;
}

.calendar-day.has-sessions .day-button {
  background: rgba(255, 255, 255, 0.15);
  color: var(--accent-color, rgba(255, 255, 255, 0.88));
  font-weight: 700;
}

.calendar-day.has-sessions::after {
  position: absolute;
  bottom: 0.05rem;
  left: 50%;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--accent-color, rgba(255, 255, 255, 0.88));
  content: '';
  transform: translateX(-50%);
  pointer-events: none;
}

.calendar-day.is-today {
  outline: 1px solid currentColor;
  outline-offset: 1px;
}

.calendar-day.is-selected .day-button {
  background: var(--accent-color, rgba(255, 255, 255, 0.88));
  color: #172015;
  font-weight: 800;
}

.calendar-day.is-selected.has-sessions::after {
  background: #172015;
}

.day-button:focus-visible,
.month-button:focus-visible,
.calendar-session:focus-visible {
  outline: 2px solid var(--accent-color, rgba(255, 255, 255, 0.88));
  outline-offset: 3px;
}

.calendar-legend {
  display: flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.85rem;
  color: var(--muted-text, #999);
  font-size: 0.75rem;
}

.legend-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: var(--accent-color, rgba(255, 255, 255, 0.88));
}

.selected-day-sessions {
  margin-top: 1.25rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color, rgba(255, 255, 255, 0.09));
}

.selected-day-sessions h4 {
  margin: 0 0 0.75rem;
  font-size: 0.9rem;
  text-transform: capitalize;
}

.calendar-message {
  margin: 0.5rem 0;
  color: var(--muted-text, #999);
  font-size: 0.85rem;
  line-height: 1.5;
}

.calendar-error {
  color: #ff9292;
}

.calendar-session {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    width: 100%;
    margin-top: 0.5rem;
    padding: 0.8rem;
    border: 1px solid var(--border-color, rgba(255, 255, 255, 0.09));
    border-radius: 12px;
    background: transparent;
    color: inherit;
    text-align: left;
    cursor: pointer;
}

.calendar-session:hover {
    background: rgba(255, 255, 255, 0.04);
}

.calendar-session-copy {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.calendar-session-copy strong {
    overflow-wrap: anywhere;
    font-size: 0.85rem;
}

.calendar-session-copy small {
    color: var(--muted-text, #999);
    font-size: 0.75rem;
}

.calendar-session-time {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: 0.6rem;
    color: var(--muted-text, #999);
    font-size: 0.8rem;
}

@media (max-width: 420px) {
  .calendar-card {
    padding: 0.9rem;
  }

  .calendar-day {
    width: 1.9rem;
    height: 1.9rem;
  }
}
</style>