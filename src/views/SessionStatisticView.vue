<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import GradeDistributionChart from '@/components/ProgressGradeDistributionChart.vue'
import GradeDistributionBarChart from '@/components/ProgressGradeDistributionBarChart.vue'
import UntoppedGradeDistributionBarChart from '@/components/UntoppedGradeDistributionBarChart.vue'
import UntoppedZoneRate from '@/components/UntoppedZoneRate.vue'
import SessionInsightsPanel from '@/components/SessionInsights.vue'
import SessionNotes from '@/components/SessionNotes.vue'

import { getSession } from '@/services/sessionService'
import {
    getSessionStats,
    getSessionGradeDistribution,
    getSessionUntoppedGradeDistribution,
    getSessionInsightsResponseDTO
} from '@/services/statsService'

import type { components } from '@/types/schema'

// Backend DTOs
type SessionResponseDTO = components['schemas']['SessionResponseDTO']
type SessionStatsDTO = components['schemas']['SessionStatsDTO']
type GradeDistributionDTO = components['schemas']['GradeDistributionResponseDTO']
type UntoppedGradeDistributionResponse = components['schemas']['UntoppedGradeDistributionResponseDTO']

type SessionInsightsResponseDTO = components['schemas']['SessionInsightsResponseDTO']



const route = useRoute()
const router = useRouter()

// Daten
const session = ref<SessionResponseDTO | null>(null)
const sessionStats = ref<SessionStatsDTO | null>(null)
const gradeDistribution = ref<GradeDistributionDTO | null>(null)
const sessionInsights = ref<SessionInsightsResponseDTO | null>(null)

const loading = ref(false)
const error = ref<string | null>(null)

const distributionView = ref<'bar' | 'doughnut'>('bar')

// WICHTIG: Deine SessionDetailsView verwendet route.params.id.
// Deshalb verwenden wir hier ebenfalls "id".
const sessionId = computed(() => {
    const routeId = route.params.id
    const id = Array.isArray(routeId) ? routeId[0] : routeId

    return Number(id)
})

// Session-Datum formatieren
const sessionDate = computed(() => {
    const date = session.value?.date

    if (!date) {
        return 'Unbekanntes Datum'
    }

    // LocalDate ohne UTC-Verschiebung formatieren
    const parts = date.split('-')

    if (parts.length !== 3) {
        return date
    }

    const [year, month, day] = parts.map(Number)

    if (!year || !month || !day) {
        return date
    }

    return new Date(year, month - 1, day).toLocaleDateString(
        'de-DE',
        {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }
    )
})

// Session-Typen
const sessionTypes = computed(() => {
    return sessionStats.value?.labels ?? []
})

const sessionTypeNames: Record<string, string> = {
    HIGH_VOLUME: 'High Volume',
    PROJECT: 'Project Session',
    LIMIT: 'Limit Session',
    FLASHES: 'Flash Session',
    TECHNIQUE: 'Technique Session',
    FUN: 'Fun Session',
    DEFAULT: 'Mixed Session'
}

function getSessionTypeName(type: string): string {
    return sessionTypeNames[type] ?? type
}

function getSessionTypeDescription(type: string): string {
    const descriptions: Record<string, string> = {
        HIGH_VOLUME: 'Mindestens 12 verschiedene Boulder mit einer Erfolgsquote von mindestens 60 %.',
        PROJECT: 'Du hast mindestens einen Boulder mit 6 oder mehr Versuchen bearbeitet.',
        LIMIT: 'Eine anspruchsvolle Session mit höchstens 40 % Erfolgsquote und mindestens einem Boulder nahe deinem persönlichen Maximalgrad.',
        FLASHES: 'Mindestens 60 % deiner ausprobierten Boulder hast du direkt im ersten Versuch getoppt.',
        TECHNIQUE: 'Mindestens 60 % der Boulder waren bereits vor dieser Session getoppt.',
        FUN: 'Eine abwechslungsreiche Session mit einer Gradspanne von mindestens 3 Stufen und maximal 6 Versuchen pro Boulder.',
        DEFAULT: 'Eine gemischte Session, die keiner speziellen Kategorie zugeordnet werden kann.'
    }

    return descriptions[type] ?? 'Keine Beschreibung verfügbar.'
}

// Grade-Verteilung: grades ist laut OpenAPI optional
const grades = computed(() => {
    return gradeDistribution.value?.grades ?? []
})

const totalTops = computed(() => {
    return gradeDistribution.value?.totalTops ?? 0
})

// Zurück zur Session-Übersicht
function goBack() {
    router.push('/sessions')
}

function goToDetails(session: SessionResponseDTO) {

    if (session.id === undefined) {
        return
    }

    router.push(`/sessions/${session.id}`)

}

// Daten laden
async function loadSessionStatistics() {
    loading.value = true
    error.value = null

    try {
        if (!Number.isInteger(sessionId.value) || sessionId.value <= 0) {
            throw new Error('Ungültige Session-ID. Bitte überprüfe den URL-Pfad.')
        }

        const [
            sessionData,
            statsData,
            distributionData,
            untoppedDistributionData,
            insightsData
        ] = await Promise.all([
            getSession(sessionId.value),
            getSessionStats(sessionId.value),
            getSessionGradeDistribution(sessionId.value),
            getSessionUntoppedGradeDistribution(sessionId.value),
            getSessionInsightsResponseDTO(sessionId.value)
        ])

        session.value = sessionData
        sessionStats.value = statsData
        gradeDistribution.value = distributionData
        untoppedGradeDistribution.value = untoppedDistributionData
        sessionInsights.value = insightsData
    }
    catch (e) {
        error.value = e instanceof Error
            ? e.message
            : 'Session-Statistiken konnten nicht geladen werden.'
    }
    finally {
        loading.value = false
    }
}

const untoppedGradeDistribution = ref<UntoppedGradeDistributionResponse | null>(null)

onMounted(loadSessionStatistics)
</script>


<template>
    <main class="session-page">

        <!-- Page Header -->
        <header class="page-header">

            <div>
                <p class="eyebrow">
                    ABOVE THE CLOUDS
                </p>

                <h1>
                    Session Statistics
                </h1>

                <p class="subtitle">
                    Deine persönliche Analyse dieser Boulder-Session.
                </p>
            </div>

            <button
                type="button"
                class="back-button"
                @click="goBack"
            >
                ← Zurück
            </button>

        </header>


        <!-- Loading -->
        <div
            v-if="loading"
            class="state"
        >
            <p>
                Session-Statistiken werden geladen...
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
                @click="loadSessionStatistics"
            >
                Erneut versuchen
            </button>
        </div>


        <!-- Content -->
        <div
            v-else-if="sessionStats && session"
            class="session-content"
        >

            <!-- 1. Key Statistics -->
            <section class="session-section">

                <div class="section-heading">

                    <div>
                        <p class="detail-label">
                            SESSION ÜBERSICHT
                        </p>

                        <h2>
                            {{ session.location || 'Boulder Session' }} , {{ sessionDate }}: {{session.name||''}}
                        </h2>
                    </div>
                    <div class="session-types">
                        <span
                            v-for="type in sessionTypes"
                            :key="type"
                            class="session-type-wrapper"
                        >
                            <span class="session-type">
                                {{ getSessionTypeName(type) }}
                            </span>

                            <span class="session-tooltip">
                                {{ getSessionTypeDescription(type) }}
                            </span>
                        </span>

                        <span v-if="sessionTypes.length === 0" class="session-type">
                            Keine Klassifizierung
                        </span>
                    </div>

                </div>


                <div class="overview-grid">

                    <!-- Boulder -->
                    <article class="stat-card">

                        <div class="stat-card-header">
                            <span>Verschiedene Boulder</span>
                        </div>

                        <strong class="stat-value">
                            {{ sessionStats.sessionBoulders ?? 0 }}
                        </strong>

                        <p>
                            Boulder ausprobiert
                        </p>

                    </article>


                    <!-- Tops -->
                    <article class="stat-card stat-card-highlight">

                        <div class="stat-card-header">
                            <span>Tops</span>
                        </div>

                        <strong class="stat-value">
                            {{ sessionStats.sessionTops ?? 0 }}
                        </strong>

                        <p>
                            Boulder erfolgreich getoppt
                        </p>

                    </article>


                    <!-- Zones -->
                    <article class="stat-card">

                        <div class="stat-card-header">
                            <span>Zones</span>
                        </div>

                        <strong class="stat-value">
                            {{ sessionStats.sessionZones ?? 0 }}
                        </strong>

                        <p>
                            Erreichte Zonen
                        </p>

                    </article>


                    <!-- Versuche -->
                    <article class="stat-card">

                        <div class="stat-card-header">
                            <span>Versuche</span>
                        </div>

                        <strong class="stat-value">
                            {{ sessionStats.sessionTries ?? 0 }}
                        </strong>

                        <p>
                            Gesamte Versuche
                        </p>

                    </article>


                    <!-- Flashes -->
                    <article class="stat-card">

                        <div class="stat-card-header">
                            <span>Flashes</span>
                        </div>

                        <strong class="stat-value">
                            {{ sessionStats.sessionFlashes ?? 0 }}
                        </strong>

                        <p>
                            Im ersten Versuch getoppt
                        </p>

                    </article>


                    <!-- Flash Rate -->
                    <article class="stat-card">

                        <div class="stat-card-header">
                            <span>Flash-Rate</span>
                        </div>

                        <strong class="stat-value">
                            {{ (sessionStats.flashRate ?? 0).toFixed(0) }}%
                        </strong>

                        <p>
                            Anteil der geflashten Boulder
                        </p>

                    </article>


                    <!-- Erfolgsquote -->
                    <article class="stat-card stat-card-highlight">

                        <div class="stat-card-header">
                            <span>Erfolgsquote</span>
                        </div>

                        <strong class="stat-value">
                            {{ (sessionStats.successRate ?? 0).toFixed(0) }}%
                        </strong>

                        <p>
                            Anteil der getoppten Boulder
                        </p>

                    </article>

                </div>

            </section>


            <!-- 3. Grade Distribution -->
            <section class="session-section">

                <div class="section-heading">

                    <div>
                        <p class="detail-label">
                            GRADE ANALYSIS
                        </p>

                        <h2>
                            Grade Distribution
                        </h2>
                    </div>


                    <div class="section-heading-actions">

                        <div class="section-meta">
                            {{ totalTops }} Tops
                        </div>

                        <div
                            class="view-switch"
                            role="group"
                            aria-label="Darstellung der Grade-Verteilung"
                        >

                            <button
                                type="button"
                                :class="{ active: distributionView === 'bar' }"
                                @click="distributionView = 'bar'"
                            >
                                Balken
                            </button>

                            <button
                                type="button"
                                :class="{ active: distributionView === 'doughnut' }"
                                @click="distributionView = 'doughnut'"
                            >
                                Doughnut
                            </button>

                        </div>

                    </div>

                </div>


                <div
                    v-if="grades.length > 0 && gradeDistribution"
                    class="timeline-card"
                >

                    <GradeDistributionBarChart
                        v-if="distributionView === 'bar'"
                        :distribution="gradeDistribution"
                    />

                    <GradeDistributionChart
                        v-else
                        :distribution="gradeDistribution"
                    />

                </div>

                <div
                    v-else
                    class="empty-inline"
                >
                    <p>
                        Für diese Session liegen noch keine Grade-Daten vor.
                    </p>
                </div>

                <div class="untopped-section">
                    <div class="section-heading-3">
                        <div>
                            <p class="detail-label">PROJECT ANALYSIS</p>
                            <h2>Nicht getoppte Routen</h2>
                        </div>

                        <div v-if="untoppedGradeDistribution" class="zone-section">
                            <UntoppedZoneRate
                            :distribution="untoppedGradeDistribution"
                            />
                        </div>
                        </div>

                    <div
                        v-if="untoppedGradeDistribution"
                        class="timeline-card"
                    >
                        <UntoppedGradeDistributionBarChart
                            :distribution="untoppedGradeDistribution"
                        />
                    </div>

                    <div
                        v-else
                        class="empty-inline"
                    >
                        <p>
                            Keine Daten zur Verteilung offener Projekte vorhanden.
                        </p>
                    </div>
                </div>

            </section>

            <!-- 4. Session Insights -->
            <section
                v-if="sessionInsights"
                class="session-section"
            >
                <SessionInsightsPanel
                    :insights="sessionInsights"
                />
            </section>

            <!-- 5. Session Notes -->
            <section
                v-if="session"
                class="session-section"
            >
                <SessionNotes
                    :session-id="session.id!"
                />
            </section>

        </div>

    </main>
</template>


<style scoped>
.session-page {
    min-height: 100vh;
    padding: 6rem 3rem;
    background: #0f0f0f;
    color: white;
}

.page-header {
    max-width: 1100px;
    margin: 0 auto 3rem;
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
}

.eyebrow {
    margin: 0 0 0.75rem;
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.25em;
    opacity: 0.6;
}

h1 {
    margin: 0;
    font-size: clamp(2.5rem, 6vw, 5rem);
    line-height: 0.95;
}

.subtitle {
    margin: 1rem 0 0;
    color: rgba(255, 255, 255, 0.6);
}

.back-button {
    padding: 0.9rem 1.3rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: transparent;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition: background 0.2s ease, border-color 0.2s ease;
}

.back-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
}

.session-content {
    max-width: 1100px;
    margin: 0 auto;
}

.session-section {
    margin-bottom: 4rem;
}

.session-header-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 2rem;
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
}

.session-header-main h2 {
    margin: 0;
    font-size: clamp(1.6rem, 4vw, 2.4rem);
    letter-spacing: -0.03em;
}

.session-date {
    margin: 0.75rem 0 0;
    color: rgba(255, 255, 255, 0.5);
}

.session-types {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 0.5rem;
}

.session-type {
    padding: 0.55rem 0.85rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 999px;
    background: transparent;
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.75rem;
    font-weight: 600;
}

.detail-label {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}

.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 1.25rem;
}

.section-heading h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.02em;
}

.section-heading-3 {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    gap: 1rem;
}

.zone-section {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    transform: translateY(10px);
}

.overview-grid {
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

.stat-card-header {
    margin-bottom: 1.5rem;
}

.stat-card-header span {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.75rem;
    font-weight: 600;
}

.stat-value {
    display: block;
    color: white;
    font-size: clamp(2rem, 4vw, 2.8rem);
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.04em;
}

.stat-card p {
    margin: 0.8rem 0 0;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.75rem;
}

.section-heading-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.section-meta {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
    white-space: nowrap;
}

.view-switch {
    display: flex;
    padding: 3px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.04);
}

.view-switch button {
    padding: 0.4rem 0.65rem;
    border: 0;
    border-radius: 5px;
    background: transparent;
    color: rgba(255, 255, 255, 0.4);
    font: inherit;
    font-size: 0.7rem;
    font-weight: 600;
    cursor: pointer;
}

.view-switch button.active {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.timeline-card {
    padding: 1.5rem;
}

.empty-inline {
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    color: rgba(255, 255, 255, 0.4);
    text-align: center;
}

.empty-inline p {
    margin: 0;
}

.state {
    max-width: 1100px;
    margin: 3rem auto;
    color: rgba(255, 255, 255, 0.5);
    text-align: center;
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

.session-types {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.session-type-wrapper {
    position: relative;
    display: inline-flex;
}

.session-type {
    cursor: help;
}

.session-tooltip {
    position: absolute;
    bottom: calc(100% + 10px);
    left: 50%;
    transform: translateX(-50%) translateY(4px);

    width: max-content;
    max-width: 260px;
    padding: 0.65rem 0.85rem;

    background: #1f2937;
    color: #f9f9fb;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;

    font-size: 0.8rem;
    line-height: 1.45;
    text-align: center;

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    z-index: 20;

    transition: opacity 0.2s ease, transform 0.2s ease;
}

.session-type-wrapper:hover .session-tooltip {
    opacity: 1;
    visibility: visible;
    transform: translateX(-50%) translateY(0);
}

@media (max-width: 950px) {
    .overview-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 700px) {
    .session-page {
        padding: 5rem 1.5rem;
    }

    .page-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .session-header-card {
        align-items: flex-start;
        flex-direction: column;
    }

    .session-types {
        justify-content: flex-start;
    }

    .section-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.75rem;
    }

    .section-heading-actions {
        width: 100%;
        justify-content: space-between;
    }
}

@media (max-width: 500px) {
    .session-page {
        padding: 5rem 1.25rem;
    }

    .overview-grid {
        grid-template-columns: 1fr;
    }

    .stat-card,
    .timeline-card,
    .session-header-card {
        padding: 1.25rem;
    }
}
</style>