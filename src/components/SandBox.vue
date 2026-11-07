<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'

import { RouterLink, useRouter } from 'vue-router'

import type { components } from '@/types/schema'

import { getTodaySessions, getLatestSession } from '@/services/sessionService'

import { getBoulders } from '@/services/boulderService'

import { getProgress } from '@/services/progressService'

import { getDashboardStats } from '@/services/statsService'

import CreateSessionModal from '@/components/CreateSessionModal.vue'

import TodaySessionModal from '@/components/TodaySessionModal.vue'

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

const openProjects = computed(() => {

    return boulders.value

        .filter(boulder =>

            !boulder.firstAscent &&

            (boulder.totalTries ?? 0) > 0

        )

        .sort((a, b) =>

            (b.totalTries ?? 0) - (a.totalTries ?? 0)

        )

        .slice(0, 5)

})

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

function formatRelativeDate(date: string | undefined) {

    if (!date) {

        return ''

    }

    const target = new Date(date)

    const now = new Date()

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

    const difference =

        Math.round(

            (currentDay.getTime() - targetDay.getTime()) /

            (1000 * 60 * 60 * 24)

        )

    if (difference === 0) {

        return 'Heute'

    }

    if (difference === 1) {

        return 'Gestern'

    }

    if (difference > 1 && difference < 7) {

        return `Vor ${difference} Tagen`

    }

    return formatSessionDate(date)

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

async function loadDashboard() {

    loading.value = true

    error.value = null

    try {

        const [

            todaySessionData,

            latestSessionData,

            bouldersData,

            progressData,

            dashboardStatsData

        ] = await Promise.all([

            getTodaySessions(),

            getLatestSession(),

            getBoulders(),

            getProgress(),

            getDashboardStats()

        ])

        todaySessions.value = todaySessionData

        latestSession.value = latestSessionData

        boulders.value = bouldersData

        progress.value = progressData

        dashboardStats.value = dashboardStatsData

    }

    catch (e) {

        console.error(e)

        error.value =

            e instanceof Error

                ? e.message

                : 'Dashboard konnte nicht geladen werden.'

    }

    finally {

        loading.value = false

    }

}

onMounted(() => {

    loadDashboard()

})

</script>

<template>

    <main class="dashboard-page">

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

                <!-- Today / Projects -->

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

                                        <p class="detail-label">

                                            HEUTE

                                        </p>

                                        <h2>

                                            {{ hasTodaySession

                                                ? getSessionLabel(todaySession!)

                                                : 'Bereit für die nächste Session?' }}

                                        </h2>

                                        <p v-if="hasTodaySession">

                                            Deine heutige Session ist bereits angelegt.

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

                            class="project-list"

                        >

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

                                <div class="project-main">

                                    <span class="project-name">

                                        {{ getBoulderLabel(boulder) }}

                                    </span>

                                    <span class="project-grade">

                                        {{ boulder.grade }}

                                    </span>

                                </div>

                                <div class="project-meta">

                                    <span>

                                        {{ boulder.totalTries ?? 0 }} Versuche

                                    </span>

                                    <span

                                        v-if="boulder.totalZones"

                                        class="project-zone"

                                    >

                                        🏅 Zone

                                    </span>

                                </div>

                            </RouterLink>

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

                <!-- Session Overview -->

                <section class="dashboard-section">

                    <div class="section-heading">

                        <div>

                            <p class="detail-label">

                                AKTIVITÄT

                            </p>

                            <h2>

                                Deine letzte Session

                            </h2>

                        </div>

                        <RouterLink

                            to="/sessions"

                            class="section-link"

                        >

                            Alle Sessions

                        </RouterLink>

                    </div>

                    <div

                        v-if="latestSession"

                        class="session-card"

                        @click="openLatestSession"

                    >

                        <div>

                            <span class="session-date">

                                {{ formatRelativeDate(latestSession.date) }}

                            </span>

                            <h3>

                                {{ getSessionLabel(latestSession) }}

                            </h3>

                            <p>

                                {{ latestSession.location }}

                            </p>

                        </div>

                        <div class="session-arrow">

                            →

                        </div>

                    </div>

                    <div

                        v-else

                        class="empty-card"

                    >

                        <p>

                            Noch keine Sessions vorhanden.

                        </p>

                        <button

                            type="button"

                            class="secondary-button"

                            @click="openTodaySession"

                        >

                            Erste Session starten

                        </button>

                    </div>

                </section>

                <!-- Recent Tops -->

                <section class="dashboard-section">

                    <div class="section-heading">

                        <div>

                            <p class="detail-label">

                                ERFOLGE

                            </p>

                            <h2>

                                Deine letzten Tops

                            </h2>

                        </div>

                    </div>

                    <div

                        v-if="recentTops.length"

                        class="tops-list"

                    >

                        <div

                            v-for="boulder in recentTops"

                            :key="boulder.id"

                            class="top-row"

                        >

                            <div>

                                <span class="top-name">

                                    {{ getBoulderLabel(boulder) }}

                                </span>

                                <span class="top-date">

                                    {{ formatRelativeDate(boulder.firstAscentDate) }}

                                </span>

                            </div>

                            <span class="top-grade">

                                {{ boulder.grade }}

                            </span>

                        </div>

                    </div>

                    <div

                        v-else

                        class="empty-card"

                    >

                        <p>

                            Noch keine Tops vorhanden.

                        </p>

                        <span>

                            Dein erster Top wartet auf dich.

                        </span>

                    </div>

                </section>

                <!-- Progress CTA -->

                <section class="progress-cta">

                    <div>

                        <p class="detail-label">

                            ENTWICKLUNG

                        </p>

                        <h2>

                            Wie entwickelt sich dein Klettern?

                        </h2>

                        <p>

                            Entdecke deine Grade, Fortschritte,

                            Stärken und Schwächen.

                        </p>

                    </div>

                    <RouterLink

                        to="/progress"

                        class="secondary-button"

                    >

                        Fortschritt ansehen

                    </RouterLink>

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

    padding: 6rem 3rem;

    background: #0f0f0f;

    color: white;

}

.dashboard-content {

    max-width: 1100px;

    margin: 0 auto;

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

    background: rgba(255, 255, 255, 0.055);

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

    border: 1px solid rgba(255, 255, 255, 0.12);

    border-radius: 14px;

    background: rgba(255, 255, 255, 0.04);

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

    grid-column: span 8;

}

.open-projects-column {

    grid-column: span 4;

}

@media (max-width: 700px) {

    .today-session-column,

    .open-projects-column {

        grid-column: span 12;

    }

}

</style>