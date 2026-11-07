<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'
import GradeDistributionChart from '@/components/ProgressGradeDistributionChart.vue'
import GradeDistributionBarChart from '@/components/ProgressGradeDistributionBarChart.vue'
import ProgressMaxGradeTimeline from '@/components/ProgressMaxGradeTimeline.vue'
import ProgressGradesBarChart from '@/components/ProgressGradesBarChart.vue'
import ProgressAttributeBarChart from '@/components/ProgressAttributeBarChart.vue'
import ProgressFilterAnalysis from '@/components/ProgressFilterAnalysis.vue'
import ProgressOverTimeChart from '@/components/ProgressOverTimeChart.vue'

import {
    getProgress,
    getGradeStats,
    getGradeDistribution,
    getMaxGradeOverTime,
    getStrengthsAndWeaknesses,
    getProgressByAttribute,
    getProgressByFilters,
    getFilterOptionCounts
} from '@/services/progressService'

import type { components } from '@/types/schema'

type ProgressResponse = components['schemas']['ProgressResponseDTO']
type GradeStatsResponse = components['schemas']['GradeStatsResponseDTO']
type GradeDistributionResponse = components['schemas']['GradeDistributionResponseDTO']
type MaxGradeOverTime = components['schemas']['MaxGradeOverTimeDTO']
type StrengthWeaknessResponse = components['schemas']['StrengthWeaknessResponseDTO']

const progress = ref<ProgressResponse | null>(null)
const gradeStats = ref<GradeStatsResponse[]>([])
const gradeDistribution = ref<GradeDistributionResponse | null>(null)
const maxGradeOverTime = ref<MaxGradeOverTime[]>([])
const strengthsWeaknesses = ref<StrengthWeaknessResponse | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)
const distributionView = ref<'bar' | 'doughnut'>('bar')

async function loadProgress() {
    loading.value = true
    error.value = null

    try {
        const [
            progressData,
            gradeStatsData,
            gradeDistributionData,
            maxGradeOverTimeData,
            strengthsWeaknessesData
        ] = await Promise.all([
            getProgress(),
            getGradeStats(),
            getGradeDistribution(),
            getMaxGradeOverTime(),
            getStrengthsAndWeaknesses()
        ])

        progress.value = progressData
        gradeStats.value = gradeStatsData
        gradeDistribution.value = gradeDistributionData
        maxGradeOverTime.value = maxGradeOverTimeData
        strengthsWeaknesses.value = strengthsWeaknessesData
    }
    catch (e) {
        error.value =
            e instanceof Error
                ? e.message
                : 'Progress konnte nicht geladen werden.'
    }
    finally {
        loading.value = false
    }
}

/*
|--------------------------------------------------------------------------
| Computed Statistics
|--------------------------------------------------------------------------
*/
const highestGradeEntry = computed(() => {
    if (!maxGradeOverTime.value.length) {
        return null
    }
    return maxGradeOverTime.value[maxGradeOverTime.value.length - 1]
})

const maxTops = computed(() => {
    if (!gradeStats.value.length) {
        return 1
    }
    return Math.max(
        ...gradeStats.value.map(
            stat => stat.amountOfTops ?? 0
        ),
        1
    )
})

function getGradeBarWidth(amount: number | undefined) {
    const value = amount ?? 0
    return `${Math.max((value / maxTops.value) * 100, 4)}%`
}

// Attribut-Vergleich
type AttributeStatsResponse = components['schemas']['AttributeStatsResponseDTO']
type BoulderAttribute =
    | 'GRIP_TYPE'
    | 'WALL_ANGLE'
    | 'CLIMBING_STYLE'
    | 'ROUTE_CHARACTER'

const attributeStats = ref<AttributeStatsResponse[]>([])

async function loadAttributeProgress(attribute: BoulderAttribute) {
    try {
        attributeStats.value = await getProgressByAttribute(attribute)
    }
    catch (e) {
        console.error(e)
    }
}

onMounted(() => {
    loadProgress()
    loadAttributeProgress('GRIP_TYPE')

    loadFilterOptionCounts({
        gripType: null,
        wallAngle: null,
        routeCharacter: null,
        climbingStyle: null,
        minGrade: null,
        maxGrade: null
    })

})

//Filter Suche
type FilterStats = components['schemas']['FilteredProgressDTO']
const filterStats = ref<FilterStats | null>(null)
const filterLoading = ref(false)
const filterGradeDistribution = ref<
    Array<{
            grade: string
            amount: number
        }> >([])

async function handleFilterSearch(filters: {
    gripType: string | null
    wallAngle: string | null
    routeCharacter: string | null
    climbingStyle: string | null
    minGrade: string | null
    maxGrade: string | null
}) {
    filterLoading.value = true

    try {
        filterStats.value = await getProgressByFilters(filters)
    }
    catch (error) {
        console.error(error)
    }
    finally {
        filterLoading.value = false
    }
}



//Filter Count
type FilterOptionCounts = components['schemas']['ProgressFilterCountResponseDTO']
const filterOptionCounts = ref<FilterOptionCounts>({ gripTypes: [], wallAngles: [], climbingStyles: [], routeCharacters: [], minGrades: [], maxGrades: [] })

async function loadFilterOptionCounts(filters:
{
    gripType: string | null
    wallAngle: string | null
    routeCharacter: string | null
    climbingStyle: string | null
    minGrade: string | null
    maxGrade: string | null
})
{
    try { filterOptionCounts.value = await getFilterOptionCounts(filters) }
    catch (error) { console.error('Filter-Counts konnten nicht geladen werden:', error) }
}

async function handleFilterChange(filters: {
    gripType: string | null
    wallAngle: string | null
    routeCharacter: string | null
    climbingStyle: string | null
    minGrade: string | null
    maxGrade: string | null
}) {
    try {
        filterOptionCounts.value = await getFilterOptionCounts(filters)
    }
    catch (error) {
        console.error(
            'Filter-Counts konnten nicht aktualisiert werden:',
            error
        )
    }
}

</script>


<template>

    <main class="progress-page">

        <!-- =========================================
            Page Header
        ========================================== -->

        <header class="page-header">

            <div>

                <p class="eyebrow">
                    ABOVE THE CLOUDS
                </p>

                <h1>
                    Mein Fortschritt
                </h1>

                <p class="subtitle">
                    Deine Boulder-Statistiken und Entwicklung.
                </p>

            </div>

        </header>


        <!-- =========================================
            Loading
        ========================================== -->

        <div
            v-if="loading"
            class="state"
        >

            <p>
                Progress wird geladen...
            </p>

        </div>


        <!-- =========================================
            Error
        ========================================== -->

        <div
            v-else-if="error"
            class="state error"
        >

            <p>
                {{ error }}
            </p>

            <button
                type="button"
                @click="loadProgress"
            >
                Erneut versuchen
            </button>

        </div>


        <!-- =========================================
            Content
        ========================================== -->

        <div
            v-else
            class="progress-content"
        >


            <!-- =====================================
                Overview
            ====================================== -->

            <section
                v-if="progress"
                class="progress-section"
            >

                <div class="section-heading">

                    <div>

                        <p class="detail-label">
                            ÜBERSICHT
                        </p>

                        <h2>
                            Dein Fortschritt
                        </h2>

                    </div>

                </div>


                <div class="overview-grid">

                    <!-- Tried -->
                    <article class="stat-card">
                        <div class="stat-card-header">
                            <span>
                                Geboulderte Boulder
                            </span>
                        </div>

                        <strong class="stat-value">
                            {{ progress.totalTriedBoulders }}
                        </strong>

                        <p>
                            Boulder ausprobiert
                        </p>
                    </article>


                    <!-- Tops -->
                    <article class="stat-card">
                        <div class="stat-card-header">
                            <span>
                                Geschaffte Boulder
                            </span>
                        </div>

                        <strong class="stat-value">
                            {{ progress.totalToppedBoulders }}
                        </strong>

                        <p>
                            Boulder getoppt
                        </p>
                    </article>


                    <!-- Success Rate -->
                    <article class="stat-card">
                        <div class="stat-card-header">
                            <span>
                                Erfolgsquote
                            </span>
                        </div>

                        <strong class="stat-value">
                            {{ (progress.totalSuccessRate ?? 0).toFixed(0) }}%
                        </strong>

                        <p>
                            Aller Projekte getoppt
                        </p>
                    </article>


                    <!-- Flash Rate -->
                    <article class="stat-card">
                        <div class="stat-card-header">
                            <span>
                                Flashrate
                            </span>
                        </div>

                        <strong class="stat-value">
                            {{ (progress.flashRate ?? 0).toFixed(0) }}%
                        </strong>

                        <p>
                            Beim ersten Versuch geschafft
                        </p>
                    </article>


                    <!-- Max Grade -->
                    <article class="stat-card stat-card-highlight">
                        <div class="stat-card-header">
                            <span>
                                Höchster Grad
                            </span>
                        </div>

                        <strong class="stat-value">
                            {{ progress.maxGrade }}
                        </strong>

                        <p>
                            Dein aktueller Bestwert
                        </p>
                    </article>


                    <!-- Average -->
                    <article class="stat-card">
                        <div class="stat-card-header">
                            <span>
                                Durchschnittlicher Grad
                            </span>
                        </div>

                        <strong class="stat-value">
                            {{ progress.avgGrade }}
                        </strong>

                        <p>
                            Durchschnitt deiner Boulder
                        </p>
                    </article>

                </div>

            </section>

            <!-- =====================================
                Progress Over Time
            ====================================== -->

            <section class="progress-section">
                <div class="section-heading">
                    <div>
                        <p class="detail-label">ENTWICKLUNG</p>
                        <h2>Maximaler Grad im Zeitverlauf</h2>
                    </div>

                    <div
                        v-if="highestGradeEntry"
                        class="section-meta"
                    >
                        Aktuell: {{ highestGradeEntry.maxGrade }}
                    </div>
                </div>

                <ProgressOverTimeChart />
            </section>

            <!-- =====================================
                Grade Distribution
            ====================================== -->

            <section
                v-if="gradeDistribution"
                class="progress-section"
            >
                <div class="section-heading">
                    <div>
                        <p class="detail-label">
                            VERTEILUNG
                        </p>

                        <h2>
                            Grade-Verteilung
                        </h2>
                    </div>

                    <div class="section-heading-actions">
                        <div class="section-meta">
                            {{ gradeDistribution.totalTops }} Tops
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
                                :class="{
                                    active:
                                        distributionView === 'doughnut'
                                }"
                                @click="
                                    distributionView = 'doughnut'
                                "
                            >
                                Doughnut
                            </button>
                        </div>
                    </div>
                </div>

                <GradeDistributionBarChart
                    v-if="distributionView === 'bar'"
                    :distribution="gradeDistribution"
                />

                <GradeDistributionChart
                    v-else
                    :distribution="gradeDistribution"
                />
            </section>

            <!-- =====================================
                Grade Statistics
            ====================================== -->

            <section
                v-if="gradeStats.length"
                class="progress-section"
            >
                <div class="section-heading">
                    <div>
                        <p class="detail-label">
                            VERGLEICH
                        </p>

                        <h2>
                            Grade im Vergleich
                        </h2>
                    </div>
                </div>

                <div class="timeline-card">
                    <ProgressGradesBarChart :stats="gradeStats" />
                </div>
            </section>

            <!-- =====================================
                Attribute Comparison
            ====================================== -->
            <section
                v-if="attributeStats.length"
                class="progress-section"
            >
                <div class="section-heading">
                    <div>
                        <p class="detail-label">
                            VERGLEICH
                        </p>

                        <h2>
                            Attribute im Vergleich
                        </h2>
                    </div>
                </div>

                <div class="timeline-card">
                    <ProgressAttributeBarChart :stats="attributeStats"
                    @attribute-change="loadAttributeProgress"
                    />
                </div>
            </section>

            <!-- =====================================
                Strengths / Weaknesses
            ====================================== -->

            <section
                v-if="strengthsWeaknesses"
                class="progress-section"
            >

                <div class="section-heading">

                    <div>

                        <p class="detail-label">
                            ANALYSE
                        </p>

                        <h2>
                            Stärken & Schwächen
                        </h2>

                    </div>

                </div>


                <div class="strengths-grid">


                    <!-- Strengths -->

                    <article class="analysis-card">

                        <div class="analysis-header">

                            <div>

                                <p class="detail-label">
                                    STÄRKEN
                                </p>

                                <h3>
                                    Was dir liegt
                                </h3>

                            </div>

                            <span class="analysis-symbol">
                                +
                            </span>

                        </div>


                        <ul
                            v-if="strengthsWeaknesses.strengths?.length"
                            class="analysis-list"
                        >
                            <li
                                v-for="(strength, index) in strengthsWeaknesses.strengths ?? []"
                                :key="index"
                            >
                                <span class="list-marker">
                                    +
                                </span>

                                <span>
                                    {{ strength.attribute }}
                                </span>
                            </li>
                        </ul>

                        <p
                            v-else
                            class="empty-analysis"
                        >
                            Noch keine Daten vorhanden.
                        </p>

                    </article>


                    <!-- Weaknesses -->

                    <article class="analysis-card">

                        <div class="analysis-header">

                            <div>

                                <p class="detail-label">
                                    SCHWÄCHEN
                                </p>

                                <h3>
                                    Wo du arbeiten kannst
                                </h3>

                            </div>

                            <span class="analysis-symbol">
                                —
                            </span>

                        </div>


                        <ul
                            v-if="strengthsWeaknesses.weaknesses?.length"
                            class="analysis-list"
                        >
                            <li
                                v-for="(weakness, index) in strengthsWeaknesses.weaknesses ?? []"
                                :key="index"
                            >
                                <span class="list-marker">
                                    —
                                </span>

                                <span>
                                    {{ weakness.attribute }}
                                </span>
                            </li>
                        </ul>

                        <p
                            v-else
                            class="empty-analysis"
                        >
                            Noch keine Daten vorhanden.
                        </p>

                    </article>

                </div>

            </section>

            <section>
                <ProgressFilterAnalysis
                    :stats="filterStats"
                    :grade-distribution="filterGradeDistribution"
                    :filter-option-counts="filterOptionCounts"
                    :loading="filterLoading"
                    @search="handleFilterSearch"
                    @filter-change="handleFilterChange"
                />
            </section>


        </div>

    </main>

</template>


<style scoped>

/* =====================================================
Page
===================================================== */

.progress-page {
    min-height: 100vh;
    padding: 6rem 3rem;
    background: #0f0f0f;
    color: white;
}


/* =====================================================
Header
===================================================== */

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
    font-size: clamp(
        2.5rem,
        6vw,
        5rem
    );
    line-height: 0.95;

}


.subtitle {
    margin: 1rem 0 0;
    color: rgba(255, 255, 255, 0.6);
}


/* =====================================================
Content
===================================================== */

.progress-content {
    max-width: 1100px;
    margin: 0 auto;
}


/* =====================================================
Sections
===================================================== */

.progress-section {
    margin-bottom: 4rem;
}


.section-heading {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2rem;
    margin-bottom: 1.25rem;
}

.section-heading-actions {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.section-heading h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
    letter-spacing: -0.02em;
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

.detail-label {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}


.section-meta {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
    white-space: nowrap;
}


/* =====================================================
Overview
===================================================== */

.overview-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
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
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}


.stat-card-header span:first-child {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.75rem;
    font-weight: 600;
    line-height: 1.3;
}


.stat-value {
    display: block;
    margin: 0;
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


/* =====================================================
Grade Statistics
===================================================== */

.grade-list {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}


.grade-card {
    padding: 1.25rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}


.grade-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}


.grade-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}


.grade-name {
    font-size: 1.25rem;
    font-weight: 700;
}


.grade-tops {
    display: flex;
    align-items: baseline;
    gap: 0.35rem;
}


.grade-tops strong {
    font-size: 1rem;
}


.grade-tops span {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.7rem;
}


.grade-progress {
    width: 100%;
    height: 4px;
    margin: 1rem 0;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.08);
}


.grade-progress-fill {
    height: 100%;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.75);
    transition: width 0.4s ease;
}


.grade-details {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
}


.grade-details span {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.7rem;
}


.grade-details strong {
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.75rem;
    font-weight: 600;
}


/* =====================================================
Distribution
===================================================== */

.distribution-card {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
}


.distribution-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}


.distribution-row {
    display: grid;
    grid-template-columns: 50px 1fr 45px;
    align-items: center;
    gap: 1rem;
}


.distribution-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    font-weight: 600;
}


.distribution-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.07);
}


.distribution-fill {
    height: 100%;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.65);
    transition: width 0.4s ease;
}


.distribution-value {
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.75rem;
    font-weight: 600;
    text-align: right;
}


.distribution-fallback {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
}


/* =====================================================
Timeline
===================================================== */

.timeline-card {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
}


.timeline {
    display: flex;
    flex-direction: column;
}


.timeline-entry {
    display: flex;
    gap: 1rem;
    min-height: 65px;
}


.timeline-line {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    width: 12px;
    flex-shrink: 0;
}


.timeline-dot {
    position: relative;
    z-index: 2;
    width: 8px;
    height: 8px;
    margin-top: 0.45rem;
    border: 2px solid rgba(255, 255, 255, 0.8);
    border-radius: 50%;
    background: #0f0f0f;
    box-sizing: border-box;
}


.timeline-connector {
    position: absolute;
    top: 0.8rem;
    bottom: -0.25rem;
    width: 1px;
    background: rgba(255, 255, 255, 0.12);
}


.timeline-content {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    flex: 1;
    gap: 1rem;
    padding-bottom: 1rem;
}


.timeline-date {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.8rem;
}


.timeline-grade {
    color: white;
    font-size: 0.9rem;
    font-weight: 700;
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


/* =====================================================
Strengths / Weaknesses
===================================================== */

.strengths-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
}


.analysis-card {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;
}


.analysis-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}


.analysis-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.5rem;
}


.analysis-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
}


.analysis-symbol {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 30px;
    height: 30px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1rem;
    font-weight: 500;
}


.analysis-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin: 0;
    padding: 0;
    list-style: none;
}


.analysis-list li {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem;
    border: 1px solid rgba(255, 255, 255, 0.07);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
}


.list-marker {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    flex-shrink: 0;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 50%;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.7rem;
}


.empty-analysis {
    margin: 0;
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.8rem;
}


/* =====================================================
Loading / Error
===================================================== */

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
    transition:
        background 0.2s ease,
        border-color 0.2s ease;
}


.state button:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.25);
}


/* =====================================================
Responsive
===================================================== */

@media (max-width: 700px) {
    .progress-page {
        padding: 5rem 1.5rem;
    }


    .page-header {
        align-items: flex-start;
        flex-direction: column;
    }


    .section-heading {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.5rem;
    }


    .grade-list,
    .strengths-grid {
        grid-template-columns: 1fr;
    }


    .section-meta {
        white-space: normal;
    }
}


@media (max-width: 950px) {
    .overview-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

@media (max-width: 500px) {
    .progress-page {
        padding: 5rem 1.25rem;
    }

    .overview-grid {
        grid-template-columns: 1fr;
    }

    .stat-card {
        padding: 1.25rem;
    }

    .stat-card-header {
        margin-bottom: 1.25rem;
    }

    .distribution-card,
    .timeline-card,
    .analysis-card {
        padding: 1.25rem;
    }

    .distribution-row {
        grid-template-columns: 40px 1fr 35px;
        gap: 0.65rem;
    }

    .timeline-entry {
        gap: 0.75rem;
    }
}

@media (max-width: 700px) {
    .section-heading-actions {
        width: 100%;
        justify-content: space-between;
    }
}

</style>