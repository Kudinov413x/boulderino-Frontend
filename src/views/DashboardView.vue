<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

import type { components } from '@/types/schema'

import { getTodaySessions, getLatestSession } from '@/services/sessionService'
import { getHighlights, type HighlightResponse } from '@/services/highlightService'
import { getBoulders } from '@/services/boulderService'
import { getProgress } from '@/services/progressService'
import { getDashboardStats } from '@/services/statsService'
import CreateSessionModal from '@/components/CreateSessionModal.vue'
import TodaySessionModal from '@/components/TodaySessionModal.vue'
import SessionCalendar from '@/components/DashboardCalender.vue'
import { getSessions } from '@/services/sessionService'
import DashboardLineGraph from '@/components/DashboardLineGraph.vue'


type SessionResponse = components['schemas']['SessionResponseDTO']
type BoulderResponse = components['schemas']['BoulderResponseDTO']
type ProgressResponse = components['schemas']['ProgressResponseDTO']
type DashboardStatsResponse = components['schemas']['DashboardStatDTO']

const router = useRouter()

const loading = ref(true)
const error = ref<string | null>(null)

const todaySessions = ref<SessionResponse[]>([])
const showCreateSessionModal = ref(false)
const showTodaySessionModal = ref(false)
const loadingTodaySession = ref(false)
const todaySessionError = ref<string | null>(null)
const latestSession = ref<SessionResponse | null>(null)

const boulders = ref<BoulderResponse[]>([])
const progress = ref<ProgressResponse | null>(null)
const dashboardStats = ref<DashboardStatsResponse | null>(null)

const highlights = ref<HighlightResponse[]>([])

const today = new Date()

const formattedToday = computed(() =>
    today.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
    })
)

const todaySession = computed(() => {
    return todaySessions.value[0] ?? null
})

const hasTodaySession = computed(() => {
    return todaySessions.value.length > 0
})

const projectGradeSort = ref<'asc' | 'desc'>('asc')

const gradeOrder: Record<string, number> = {
    FB1: 1,
    FB1_PLUS: 2,

    FB2: 3,
    FB2_PLUS: 4,

    FB3: 5,
    FB3_PLUS: 6,

    FB4: 7,
    FB4_PLUS: 8,

    FB5: 9,
    FB5_PLUS: 10,

    FB6: 11,
    FB6_PLUS: 12,
    FB6_A: 13,
    FB6_B: 14,
    FB6_C: 15,

    FB7: 16,
    FB7_PLUS: 17,
    FB7_A: 18,
    FB7_B: 19,
    FB7_C: 20,

    FB8: 21,
    FB8_PLUS: 22
}

function getGradeValue(
    grade: string | number | null | undefined
): number {
    if (grade === null || grade === undefined) {
        return 0
    }

    if (typeof grade === 'number') {
        return grade
    }

    const normalizedGrade = grade
        .trim()
        .toUpperCase()

    if (!normalizedGrade) {
        return 0
    }

    return gradeOrder[normalizedGrade] ?? 0
}

function setProjectGradeSort(direction: 'asc' | 'desc') {
    projectGradeSort.value = direction
}

const openProjects = computed(() => {
    const projects = boulders.value.filter(
        boulder =>
            !boulder.firstAscent &&
            (boulder.totalTries ?? 0) > 0
    )

    const direction = projectGradeSort.value === 'asc' ? 1 : -1

    return [...projects].sort((a, b) => {
        const gradeA = getGradeValue(a.grade)
        const gradeB = getGradeValue(b.grade)

        if (gradeA !== gradeB) {
            return (gradeA - gradeB) * direction
        }

        // Bei gleichem Grad: mehr Versuche zuerst
        return (b.totalTries ?? 0) - (a.totalTries ?? 0)
    })
})

// TODO: Kann vermutlich weg
const recentTops = computed(() => {
    return boulders.value
        .filter(boulder => boulder.firstAscent)
        .sort((a, b) => {
            const dateA = a.firstAscentDate
                ? new Date(a.firstAscentDate).getTime()
                : 0

            const dateB = b.firstAscentDate
                ? new Date(b.firstAscentDate).getTime()
                : 0

            return dateB - dateA
        })
        .slice(0, 5)
})
function getHighlightIcon(type: string | null | undefined): string {
    switch (type) {
        case 'MILESTONE':
        case 'NEW_MAXGRADE_FOR_ATTRIBUTE':
            return '🏆'
        case 'FLASHRATE':
        case 'HARD_FLASH':
            return '⚡'
        case 'PROGRESS':
            return '📈'
        case 'EFFICIENCY':
            return '🎯'
        case 'SESSION_PEAK':
            return '💪'
        case 'SESSION_PROJECT':
        case 'PROJECT_SEND':
        case 'PROJECT_ZONE':
            return '🧗'
        case 'SESSION_HOT_STREAK':
        case 'CONSISTENCY':
            return '🔥'
        case 'SESSION_TRIES':
            return '🏋️'
        case 'SESSION_FUN':
            return '✨'
        case 'HARD_SEND':
            return '👑'
        default:
            return '✦'
    }
}

function formatHighlightDate(date: string | null | undefined): string {
    if (!date) {
        return ''
    }

    return formatRelativeDate(date)
}

const greeting = computed(() => {
    const hour = today.getHours()

    if (hour < 12) {
        return 'Guten Morgen'
    }

    if (hour < 18) {
        return 'Guten Tag'
    }

    return 'Guten Abend'
})

function getBoulderLabel(boulder: BoulderResponse) {
    return boulder.name || 'Unbenannter Boulder'
}

function getSessionLabel(session: SessionResponse) {
    return session.name || session.location || 'Session'
}

function formatSessionDate(date: string | undefined) {
    if (!date) {
        return ''
    }

    return new Date(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}


function formatRelativeDate(date: string | undefined): string {
    if (!date) {
        return ''
    }

    const target = new Date(date)
    const now = new Date()

    if (Number.isNaN(target.getTime())) {
        return ''
    }

    const targetDay = new Date(
        target.getFullYear(),
        target.getMonth(),
        target.getDate()
    )

    const currentDay = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate()
    )

    const difference = Math.floor(
        (currentDay.getTime() - targetDay.getTime()) /
        (1000 * 60 * 60 * 24)
    )

    if (difference < 0) {
        return 'Heute'
    }

    if (difference === 0) {
        return 'Heute'
    }

    if (difference === 1) {
        return 'Vor 1 Tag'
    }

    return `Vor ${difference} Tagen`
}

async function openTodaySession() {
    if (loadingTodaySession.value) {
        return
    }

    loadingTodaySession.value = true
    todaySessionError.value = null

    try {
        todaySessions.value = await getTodaySessions()

        if (todaySessions.value.length === 0) {
            showCreateSessionModal.value = true
            return
        }

        if (todaySessions.value.length === 1) {
            const session = todaySessions.value[0]

            if (session?.id === undefined) {
                todaySessionError.value =
                    'Die heutige Session besitzt keine gültige ID.'
                return
            }

            await router.push(`/sessions/${session.id}`)
            return
        }

        showTodaySessionModal.value = true
    } catch (e) {
        todaySessionError.value =
            e instanceof Error
                ? e.message
                : 'Heutige Session konnte nicht geladen werden.'
    } finally {
        loadingTodaySession.value = false
    }
}

function handleSessionCreated(
    session: SessionResponse
) {
    showCreateSessionModal.value = false

    if (session.id === undefined) {
        todaySessionError.value =
            'Session wurde erstellt, aber die Session-ID fehlt.'
        return
    }

    router.push(`/sessions/${session.id}`)
}

function openSelectedTodaySession(
    session: SessionResponse
) {
    showTodaySessionModal.value = false

    if (session.id === undefined) {
        todaySessionError.value =
            'Die ausgewählte Session besitzt keine gültige ID.'
        return
    }

    router.push(`/sessions/${session.id}`)
}

function closeTodaySessionModal() {
    showTodaySessionModal.value = false
}

function closeCreateSessionModal() {
    showCreateSessionModal.value = false
}

async function openLatestSession() {
    if (!latestSession.value) {
        return
    }

    await router.push(`/sessions/${latestSession.value.id}`)
}

// Session Calender functions

function getLocalDateKey(date: string | undefined | null): string {
    if (!date) return ''

    const match = date.match(/^(\d{4}-\d{2}-\d{2})/)
    const datePart = match?.[1]

    if (datePart) return datePart

    const parsed = new Date(date)
    if (Number.isNaN(parsed.getTime())) return ''

    const year = parsed.getFullYear()
    const month = String(parsed.getMonth() + 1).padStart(2, '0')
    const day = String(parsed.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}

function getTodayKey(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')

  return `${year}-${month}-${day}`
}

async function loadDashboard() {
    loading.value = true
    error.value = null

    try {
        const [
            todaySessionsData,
            bouldersData,
            progressData,
            dashboardStatsData,
            highlightsData,
            allSessionsData
            ] = await Promise.all([
            getTodaySessions(),
            getBoulders(),
            getProgress(),
            getDashboardStats(),
            getHighlights(),
            getSessions()
            ])

            todaySessions.value = todaySessionsData
            boulders.value = bouldersData
            progress.value = progressData
            dashboardStats.value = dashboardStatsData
            highlights.value = highlightsData

            const todayKey = getTodayKey()

            latestSession.value = allSessionsData
            .filter(session => {
                const dateKey = getLocalDateKey(session.date)
                return dateKey !== '' && dateKey < todayKey
            })
            .sort((a, b) =>
                getLocalDateKey(b.date).localeCompare(getLocalDateKey(a.date))
            )[0] ?? null
    } catch (e) {
        console.error(e)
        error.value =
            e instanceof Error
                ? e.message
                : 'Dashboard konnte nicht geladen werden.'
    } finally {
        loading.value = false
    }
}

onMounted(() => {
    loadDashboard()
})

</script>

<template>
    <main class="dashboard-page">
        <!-- 
          Der Hero-Container umschließt den oberen Bereich 
          (vom Header bis einschließlich Heutige Session / Offene Projekte) 
        -->
        <div class="dashboard-hero-background">
            <div class="dashboard-content">
                <!-- Header -->
                <header class="dashboard-header">
                    <div>
                        <p class="eyebrow">
                            ABOVE THE CLOUDS
                        </p>

                        <h1>
                            {{ greeting }}.
                        </h1>

                        <p class="subtitle">
                            Dein Boulder-Tagebuch auf einen Blick.
                        </p>
                    </div>

                    <div class="today-label">
                        {{ formattedToday }}
                    </div>
                </header>

                <!-- Loading -->
                <div
                    v-if="loading"
                    class="state"
                >
                    <p>
                        Dashboard wird geladen...
                    </p>
                </div>

                <!-- Error -->
                <div
                    v-else-if="error"
                    class="state error"
                >
                    <p>
                        {{ error }}
                    </p>

                    <button
                        type="button"
                        @click="loadDashboard"
                    >
                        Erneut versuchen
                    </button>
                </div>

                <template v-else>

                    <!-- 30 Tage Übersicht -->
                    <section
                        v-if="dashboardStats"
                        class="hero-section"
                    >
                        <div class="section-heading">
                            <div>
                                <p class="detail-label">
                                    LETZTE 30 TAGE
                                </p>

                                <h2>
                                    Deine Aktivität
                                </h2>
                            </div>
                        </div>

                        <div class="stats-grid">
                            <article class="stat-card">
                                <span>
                                    Sessions
                                </span>

                                <strong>
                                    {{ dashboardStats.sessionsLastThirtyDays }}
                                </strong>

                                <p>
                                    Trainingseinheiten
                                </p>
                            </article>


                            <article class="stat-card stat-card-highlight">
                                <span>
                                    Tops
                                </span>

                                <strong>
                                    {{ dashboardStats.topsLastThirtyDays }}
                                </strong>

                                <p>
                                    einzigartige Boulder
                                </p>
                            </article>


                            <article class="stat-card">
                                <span>
                                    Projekte
                                </span>

                                <strong>
                                    {{ dashboardStats.projectsLastThirtyDays }}
                                </strong>

                                <p>
                                    aktiv bearbeitet
                                </p>
                            </article>


                            <article class="stat-card">
                                <span>
                                    Versuche
                                </span>

                                <strong>
                                    {{ dashboardStats.totalTriesLastThirtyDays }}
                                </strong>

                                <p>
                                    in den letzten 30 Tagen
                                </p>
                            </article>
                        </div>
                    </section>

                    <!-- Today / Projects (Ende des Hero-Bereichs mit Bild) -->
                    <div class="dashboard-grid">

                        <!-- Today / Main Action -->
                        <section class="dashboard-section today-session-column">
                            <div class="section-heading">
                                <div>
                                    <p class="detail-label">
                                        HEUTE
                                    </p>

                                    <h2>
                                        Heutige Session
                                    </h2>
                                </div>

                            </div>

                            <div class="today-session-layout">
                                <div class="today-session-column">
                                    <div class="hero-card">
                                        <div class="hero-copy">

                                            <h2>
                                                {{ hasTodaySession
                                                    ? getSessionLabel(todaySession!)
                                                    : 'Bereit für die nächste Session?' }}
                                            </h2>

                                            <p v-if="hasTodaySession">
                                                Möchtest du deine heutige Session fortsetzen?
                                            </p>

                                            <p v-else>
                                                Starte eine neue Session und halte
                                                deinen nächsten Boulder-Tag fest.
                                            </p>
                                        </div>

                                        <button
                                            type="button"
                                            class="primary-button"
                                            :disabled="loadingTodaySession"
                                            @click="openTodaySession"
                                        >
                                            {{
                                                loadingTodaySession
                                                    ? 'Lade Session...'
                                                    : hasTodaySession
                                                        ? 'Session fortsetzen'
                                                        : 'Session starten'
                                            }}
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <p
                                v-if="todaySessionError"
                                class="today-session-error"
                            >
                                {{ todaySessionError }}
                            </p>

                        </section>


                        <!-- Open Projects -->
                        <section class="dashboard-section open-projects-column">
                            <div class="section-heading">
                                <div>
                                    <p class="detail-label">
                                        PROJEKTE
                                    </p>
                                    <h2>
                                        Offene Projekte
                                    </h2>
                                </div>

                                <RouterLink
                                    to="/boulders"
                                    class="section-link"
                                >
                                    Alle Boulder
                                </RouterLink>
                            </div>

                            <div
                                v-if="openProjects.length"
                                class="project-list-wrapper"
                            >
                                <!-- Sortierung -->
                                <div class="project-toolbar">
                                    <span class="project-count">
                                        {{ openProjects.length }}
                                        {{ openProjects.length === 1 ? 'Projekt' : 'Projekte' }}
                                    </span>

                                    <div class="grade-sort">
                                        <button
                                            type="button"
                                            :class="{ active: projectGradeSort === 'asc' }"
                                            @click="setProjectGradeSort('asc')"
                                        >
                                            Grade ↑
                                        </button>

                                        <button
                                            type="button"
                                            :class="{ active: projectGradeSort === 'desc' }"
                                            @click="setProjectGradeSort('desc')"
                                        >
                                            Grade ↓
                                        </button>
                                    </div>
                                </div>

                                <!-- Projekte -->
                                <div class="project-list">
                                    <RouterLink
                                        v-for="boulder in openProjects"
                                        :key="boulder.id"
                                        :to="{
                                            path: '/boulders',
                                            query: {
                                                search: boulder.name
                                            }
                                        }"
                                        class="project-card"
                                    >
                                        <!-- Zeile 1 -->
                                        <div class="project-row-main">
                                            <div class="project-info">
                                                <span class="project-name">
                                                    {{ getBoulderLabel(boulder) }}
                                                </span>

                                                <span class="project-tries">
                                                    {{ boulder.totalTries ?? 0 }} Versuche
                                                </span>
                                            </div>

                                            <span class="project-grade">
                                                {{ boulder.grade }}
                                            </span>
                                        </div>

                                        <!-- Zeile 2 -->
                                        <div class="project-row-meta">
                                            <span>
                                                {{ boulder.gripType || '—' }}
                                            </span>

                                            <span>
                                                {{ boulder.wallAngle || '—' }}
                                            </span>

                                            <span>
                                                {{ boulder.routeCharacter || '—' }}
                                            </span>

                                            <span>
                                                {{ boulder.climbingStyle || '—' }}
                                            </span>

                                            <span
                                                v-if="boulder.totalZones"
                                                class="project-status"
                                            >
                                                🏅 Zone
                                            </span>
                                        </div>
                                    </RouterLink>

                                </div>
                            </div>

                            <div
                                v-else
                                class="empty-card"
                            >
                                <p>
                                    Keine offenen Projekte.
                                </p>

                                <span>
                                    Starte eine Session und finde dein
                                    nächstes Projekt.
                                </span>
                            </div>
                        </section>
                    </div>

                </template>

            </div>
        </div>

        <!-- Ab hier geht das Dashboard im regulären einfarbigen Bereich weiter -->
        <div class="dashboard-content">
            <template v-if="!loading && !error">
                <!-- Erfolge / Letzte Aktivität -->
                <div class="dashboard-grid activity-grid">
                    <!-- Backend-Highlights -->
                    <section class="dashboard-section activity-tops">
                        <div class="section-heading">
                            <div>
                                <p class="detail-label">ERFOLGE</p>
                                <h2>Deine Boulder Highlights</h2>
                            </div>
                        </div>

                        <div v-if="highlights.length" class="highlights-list">
                            <article
                                v-for="(highlight, index) in highlights"
                                :key="`${highlight.type}-${highlight.date}-${index}`"
                                class="highlight-card"
                            >
                                <div class="highlight-icon">
                                    {{ getHighlightIcon(highlight.type) }}
                                </div>

                                <div class="highlight-content">
                                    <div class="highlight-heading">
                                        <h3>{{ highlight.title }}</h3>
                                        <span
                                            v-if="highlight.date"
                                            class="highlight-date"
                                        >
                                            {{ formatHighlightDate(highlight.date) }}
                                        </span>
                                    </div>

                                    <p>{{ highlight.description }}</p>

                                    <div
                                        v-if="highlight.grade || highlight.tries != null"
                                        class="highlight-meta"
                                    >
                                        <span v-if="highlight.grade">
                                            Grad: {{ highlight.grade }}
                                        </span>
                                        <span v-if="highlight.tries != null">
                                            {{ highlight.tries }} Versuche
                                        </span>
                                    </div>
                                </div>
                            </article>
                        </div>

                        <div v-else class="empty-card">
                            <p>Noch keine neuen Highlights.</p>
                            <span>
                                Sammle Erfahrungen, arbeite an deinen Projekten
                                und entdecke deine nächsten Fortschritte.
                            </span>
                        </div>
                    </section>

                    <!-- Letzte Aktivität -->
                    <section class="dashboard-section activity-session">
                        <div class="section-heading">
                            <div>
                            <p class="detail-label">AKTIVITÄT</p>
                            <h2>Dein Trainingsverlauf</h2>
                            </div>

                            <RouterLink to="/sessions" class="section-link">
                            Alle Sessions
                            </RouterLink>
                        </div>

                        <SessionCalendar />
                        </section>
                </div>


                <!-- Entwicklung / Liniendiagramm -->
                <section class="dashboard-section progress-chart-section">
                    <div class="section-heading">
                        <div>
                            <p class="detail-label">DEINE ENTWICKLUNG</p>
                            <h2>Fortschritt im Zeitverlauf</h2>
                        </div>
                        <RouterLink to="/progress" class="section-link">
                            mehr Fortschritt
                        </RouterLink>
                    </div>

                    <DashboardLineGraph />
                </section>
            </template>
        </div>
    </main>

    <CreateSessionModal
        v-if="showCreateSessionModal"
        @close="closeCreateSessionModal"
        @created="handleSessionCreated"
    />

    <TodaySessionModal
        v-if="showTodaySessionModal"
        :sessions="todaySessions"
        @close="closeTodaySessionModal"
        @select="openSelectedTodaySession"
    />
</template>


<style scoped>
.dashboard-page {
    min-height: 100vh;
    padding: 0 0 6rem 0;
    background: #0f0f0f;
    color: white;
}

.dashboard-content {
    max-width: 1100px;
    margin: 0 auto;
    padding: 0 3rem; /* Seitlicher Abstand für den Inhalt */
}

.dashboard-hero-background {
    position: relative;
    isolation: isolate;

    /* Oberer Abstand damit der Header atmen kann, unten genug Platz nach den Projekten */
    padding-top: 6rem;
    padding-bottom: 5rem;
    margin-bottom: 3rem;

    background-color: #0f0f0f;

    background-image:
        linear-gradient(
            to bottom,
            rgba(15, 15, 15, 0.1) 0%,
            rgba(15, 15, 15, 0.4) 40%,
            rgba(15, 15, 15, 0.85) 80%,
            #0f0f0f 100%
        ),
        url('@/assets/images/DashboardCamping1.jpg');

    background-size:
        100% 100%,
        100% auto;

    background-position:
        center,
        top center;

    background-repeat: no-repeat;
}


/* Header */

.dashboard-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 3rem;
}

.eyebrow {
    margin: 0 0 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.25em;
    opacity: 0.6;
}

.dashboard-header h1 {
    margin: 0;
    font-size: clamp(3rem, 7vw, 6rem);
    line-height: 0.9;
    letter-spacing: -0.05em;
}

.subtitle {
    margin: 1rem 0 0;
    color: rgba(255, 255, 255, 0.55);
    font-size: 1rem;
}

.today-label {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
    white-space: nowrap;
}


/* Hero */

.hero-section {
    margin-bottom: 4rem;
}

.hero-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.16);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.025);
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.25);
}

.hero-copy {
    min-width: 0;
}

.hero-copy h2 {
    margin: 0;
    font-size: clamp(1.5rem, 3vw, 2.2rem);
    line-height: 1.1;
}

.hero-copy p:last-child {
    margin: 0.75rem 0 0;
    color: rgba(255, 255, 255, 0.5);
}


/* Sections */

.dashboard-section {
    margin-bottom: 4rem;
}

.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 1.25rem;
}

.detail-label {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}

.section-heading h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.02em;
}

.section-link {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
    text-decoration: none;
    transition: color 0.2s ease;
}

.section-link:hover {
    color: white;
}


/* Buttons */

.primary-button,
.secondary-button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.8rem 1.15rem;
    border-radius: 8px;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.primary-button {
    flex-shrink: 0;
    border: 1px solid white;
    background: white;
    color: #0f0f0f;
    margin-left: 29rem;
    margin-top: 2rem;
}

.primary-button:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.88);
}

.secondary-button {
    border: 1px solid rgba(255, 255, 255, 0.18);
    background: transparent;
    color: white;
}

.secondary-button:hover {
    transform: translateY(-2px);
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.3);
}


/* Session */

.session-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.session-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.session-date {
    display: block;
    margin-bottom: 0.5rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.7rem;
}

.session-card h3 {
    margin: 0;
    font-size: 1.15rem;
    font-weight: 600;
}

.session-card p {
    margin: 0.35rem 0 0;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.8rem;
}

.session-arrow {
    color: rgba(255, 255, 255, 0.4);
    font-size: 1.5rem;
}


/* Statistics */

.stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
}

.stat-card {
    min-width: 0;
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.stat-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}

.stat-card-highlight {
    background: rgba(255, 255, 255, 0.07);
}

.stat-card span {
    display: block;
    margin-bottom: 1rem;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.7rem;
    font-weight: 600;
}

.stat-card strong {
    display: block;
    font-size: clamp(2rem, 4vw, 2.7rem);
    line-height: 1;
    letter-spacing: -0.04em;
}

.stat-card p {
    margin: 0.7rem 0 0;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7rem;
}


/* Projects */

.project-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.project-card {
    display: block;
    padding: 1rem 1.25rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
    color: white;
    text-decoration: none;
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.project-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.18);
    transform: translateX(3px);
}

.project-main,
.project-meta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}

.project-name {
    min-width: 0;
    overflow: hidden;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.85rem;
    font-weight: 600;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.project-grade {
    flex-shrink: 0;
    color: white;
    font-size: 0.85rem;
    font-weight: 700;
}

.project-meta {
    margin-top: 0.45rem;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.7rem;
}

.project-zone {
    color: rgba(255, 255, 255, 0.55);
}


/* Tops */

.tops-list {
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.top-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.top-row > div {
    display: flex;
    flex-direction: column;
    gap: 0.3rem;
}

.top-name {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    font-weight: 600;
}

.top-date {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.7rem;
}

.top-grade {
    flex-shrink: 0;
    color: white;
    font-size: 0.9rem;
    font-weight: 700;
}


/* Progress CTA */

.progress-cta {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 3rem;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
}

.progress-cta h2 {
    margin: 0;
    font-size: 1.25rem;
}

.progress-cta p:last-child {
    margin: 0.6rem 0 0;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
}


/* Empty */

.empty-card {
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    text-align: center;
}

.empty-card p {
    margin: 0;
    color: rgba(255, 255, 255, 0.55);
}

.empty-card span {
    display: block;
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.75rem;
}


/* Loading / Error */

.state {
    max-width: 1100px;
    margin: 3rem auto;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
}

.state p {
    margin: 0;
}

.error {
    color: #ff8a8a;
}

.state button {
    margin-top: 1rem;
    padding: 0.7rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    background: transparent;
    color: white;
    font: inherit;
    cursor: pointer;
}


/* Responsive */

@media (max-width: 900px) {
    .stats-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 700px) {
    .dashboard-page {
        padding: 5rem 1.5rem;
    }

    .dashboard-header {
        align-items: flex-start;
        flex-direction: column;
        margin-bottom: 2.5rem;
    }

    .today-label {
        white-space: normal;
    }

    .hero-card,
    .progress-cta {
        align-items: flex-start;
        flex-direction: column;
    }

    .section-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.5rem;
    }

    .primary-button,
    .secondary-button {
        width: 100%;
    }
}

@media (max-width: 500px) {
    .dashboard-page {
        padding: 5rem 1.25rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .hero-card,
    .stat-card,
    .progress-cta {
        padding: 1.25rem;
    }
}

/* Grids */
.dashboard-grid {
    display: grid;
    grid-template-columns: repeat(12, 1fr);
    gap: 1rem;
}

.today-session-column {
    grid-column: span 7;
}

.open-projects-column {
    grid-column: span 5;
}

.activity-grid {
    align-items: start;
}

.activity-tops {
    grid-column: span 7;
}

.activity-session {
    grid-column: span 5;
}

@media (max-width: 700px) {
    .today-session-column,
    .open-projects-column,
    .activity-column {
        grid-column: span 12;
    }
}

@media (max-width: 700px) {

    .today-session-column,
    .open-projects-column {
        grid-column: span 12;
    }
}
/* Projects */

.project-list-wrapper {
    min-width: 0;
}

/* Kopfzeile mit Projektanzahl und Sortierung */
.project-toolbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1rem;
}

.project-count {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.8rem;
    font-weight: 500;
}

/* Sortierbuttons etwas besser lesbar */
.grade-sort {
    display: flex;
    gap: 0.35rem;
}

.grade-sort button {
    padding: 0.4rem 0.65rem;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.5);
    font: inherit;
    font-size: 0.75rem;
    cursor: pointer;
    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;
}

.grade-sort button:hover {
    color: white;
}

.grade-sort button.active {
    border-color: rgba(255, 255, 255, 0.18);
    background: rgba(255, 255, 255, 0.09);
    color: white;
}

/* Scrollbereich: weiterhin zwei Karten sichtbar */
.project-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    height: calc((6.25rem * 2) + 0.75rem);
    overflow-y: auto;

    padding-right: 0.35rem;

    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.project-list::-webkit-scrollbar {
    width: 5px;
}

.project-list::-webkit-scrollbar-track {
    background: transparent;
}

.project-list::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.2);
}

.project-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.35);
}

/* Einzelne Projektkarte */
.project-card {
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.65rem;

    flex: 0 0 6.25rem;
    min-width: 0;
    padding: 0.9rem 1rem;

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;

    background: rgba(255, 255, 255, 0.045);
    color: white;
    text-decoration: none;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.project-card:hover {
    background: rgba(255, 255, 255, 0.085);
    border-color: rgba(255, 255, 255, 0.25);
    transform: translateX(3px);
}

/* Erste Zeile: Name, Versuche und Grad */
.project-row-main {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    min-width: 0;
}

/* Name und Versuche bleiben in einer Zeile */
.project-info {
    display: flex;
    align-items: baseline;
    flex-wrap: nowrap;
    min-width: 0;
    flex: 1;
    gap: 0.5rem;
}

/* Der Name darf schrumpfen und wird bei Bedarf gekürzt */
.project-name {
    display: block;
    flex: 0 1 auto;
    min-width: 0;
    overflow: hidden;

    color: rgba(255, 255, 255, 0.96);
    font-size: 1rem;
    font-weight: 650;
    line-height: 1.3;

    text-overflow: ellipsis;
    white-space: nowrap;
}

/* Versuche bleiben immer vollständig sichtbar */
.project-tries {
    flex-shrink: 0;
    white-space: nowrap;

    color: rgba(255, 255, 255, 0.55);
    font-size: 0.75rem;
}

/* Bouldergrad als deutlicher Blickfang */
.project-grade {
    flex-shrink: 0;
    padding: 0.35rem 0.6rem;

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 7px;
    background: rgba(255, 255, 255, 0.1);

    color: white;
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
}

/* Zweite Zeile: Eigenschaften */
.project-row-meta {
    display: flex;
    align-items: center;
    gap: 0.55rem;

    min-width: 0;
    overflow: hidden;

    color: rgba(255, 255, 255, 0.55);
    font-size: 0.72rem;
    line-height: 1.3;
    white-space: nowrap;
}

.project-row-meta > span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
}

/* Dezente Trennpunkte zwischen den Eigenschaften */
.project-row-meta > span:not(:last-child)::after {
    content: "·";
    margin-left: 0.55rem;
    color: rgba(255, 255, 255, 0.3);
}

/* Zone hervorheben */
.project-row-meta .project-status {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.72rem;
}

/* Mobile */
@media (max-width: 500px) {
    .project-list {
        height: calc((6rem * 2) + 0.75rem);
    }

    .project-card {
        flex-basis: 6rem;
        padding: 0.8rem;
    }

    .project-name {
        font-size: 0.9rem;
    }

    .project-tries {
        font-size: 0.7rem;
    }

    .project-row-meta {
        gap: 0.4rem;
        font-size: 0.65rem;
    }

    .project-row-meta > span:not(:last-child)::after {
        margin-left: 0.4rem;
    }
}

.grade {
    padding: 0.45rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
}

/* Highlights */
/* Highlights: vier Karten sichtbar, weitere scrollbar */
.highlights-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;

    /* Höhe von vier HighlightCards inklusive Abständen */
    height: 32rem;
    overflow-y: auto;

    padding-right: 0.25rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.15) transparent;
}

/* Scrollbar für Chrome, Edge und Safari */
.highlights-list::-webkit-scrollbar {
    width: 4px;
}

.highlights-list::-webkit-scrollbar-track {
    background: transparent;
}

.highlights-list::-webkit-scrollbar-thumb {
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.15);
}

.highlights-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.25);
}


.highlight-card {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.15rem;
    border: 1px solid rgba(255, 255, 255, 0.09);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}

.highlight-card:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.17);
    transform: translateY(-2px);
}

.highlight-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    width: 2.6rem;
    height: 2.6rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 9px;
    background: rgba(255, 255, 255, 0.05);
    font-size: 1.2rem;
}

.highlight-content {
    min-width: 0;
    flex: 1;
}

.highlight-heading {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
}

.highlight-heading h3 {
    margin: 0;
    color: rgba(255, 255, 255, 0.92);
    font-size: 0.9rem;
    font-weight: 600;
    line-height: 1.4;
}

.highlight-date {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.68rem;
}

.highlight-content > p {
    margin: 0.5rem 0 0;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.78rem;
    line-height: 1.6;
    overflow-wrap: anywhere;
}

.highlight-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.7rem;
}

.highlight-meta span {
    padding: 0.25rem 0.5rem;
    border-radius: 5px;
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.68rem;
}

@media (max-width: 500px) {
    .highlight-card {
        gap: 0.75rem;
        padding: 0.9rem;
    }

    .highlight-heading {
        flex-direction: column;
        gap: 0.35rem;
    }
}
/* Beide Dashboard-Spalten auf dieselbe Höhe bringen */
.dashboard-grid:not(.activity-grid) {
align-items: stretch;
}

.dashboard-grid:not(.activity-grid) > .dashboard-section {
box-sizing: border-box;
min-width: 0;
}

/* Die heutige Session nutzt die verfügbare Spaltenhöhe */
.today-session-column {
display: flex;
flex-direction: column;
}

.today-session-layout,
.today-session-layout > .today-session-column {
display: flex;
flex: 1;
flex-direction: column;
}

.today-session-layout .hero-card {
flex: 1;
min-height: 0;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
gap: 2.5rem;
text-align: center;
}

.today-session-layout .hero-copy {
width: 100%;
text-align: center;
}

.today-session-layout .hero-copy h2 {
text-align: center;
}

.today-session-layout .hero-copy p {
text-align: center;
}

.today-session-layout .primary-button {
margin: 0;
width: auto;
white-space: nowrap;
padding: 0.9rem 1.5rem;
}

/* Linien Grafik*/
.progress-card {
    width: 100%;
    padding: 24px;
    background: rgba(255, 255, 255, 0.025);
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    box-sizing: border-box;
    color: white;
}

.chart-header h2 {
    color: white;
}

.subtitle,
.status,
.chart-footnote {
    color: rgba(255, 255, 255, 0.5);
}

.refresh-button {
    border-color: rgba(255, 255, 255, 0.18);
    color: white;
}

.error-message {
    color: #ff8a8a;
    background: rgba(255, 100, 100, 0.08);
}

</style>