<script setup lang="ts">
import { computed, ref } from 'vue'
import type { components } from '@/types/schema'

type GripType =
    | 'CRIMP'
    | 'JUG'
    | 'SLOPER'
    | 'PINCH'
    | 'POCKET'
    | 'VOLUME'
    | 'UNDERCLING'
    | 'SIDEPULL'

type WallAngle =
    | 'SLAB'
    | 'VERTICAL'
    | 'OVERHANG'
    | 'ROOF'
    | 'DIHEDRAL'
    | 'ARETE'

type RouteCharacter =
    | 'TECHNICAL'
    | 'PHYSICAL'
    | 'BALANCE'
    | 'NEUTRAL'

type ClimbingStyle =
    | 'STATIC'
    | 'DYNAMIC'
    | 'NEUTRAL'


type FilterStats = components['schemas']['FilteredProgressDTO']


interface GradeDistribution {
    grade: string
    amount: number
}

const props = withDefaults(defineProps<{
    stats?: FilterStats | null
    gradeDistribution?: GradeDistribution[]
    loading?: boolean
}>(), {
    stats: null,
    gradeDistribution: () => [],
    loading: false
})

const emit = defineEmits<{
    search: [{
        gripType: GripType | null
        wallAngle: WallAngle | null
        routeCharacter: RouteCharacter | null
        climbingStyle: ClimbingStyle | null
        minGrade: string | null
        maxGrade: string | null
    }]
}>()

const gripType = ref<GripType | null>(null)
const wallAngle = ref<WallAngle | null>(null)
const routeCharacter = ref<RouteCharacter | null>(null)
const climbingStyle = ref<ClimbingStyle | null>(null)

const minGrade = ref<string | null>(null)
const maxGrade = ref<string | null>(null)

const gradeOptions = [
    { value: '1', label: 'FB1' },
    { value: '1+', label: 'FB1+' },
    { value: '2', label: 'FB2' },
    { value: '2+', label: 'FB2+' },
    { value: '3', label: 'FB3' },
    { value: '3+', label: 'FB3+' },
    { value: '4', label: 'FB4' },
    { value: '4+', label: 'FB4+' },
    { value: '5', label: 'FB5' },
    { value: '5+', label: 'FB5+' },
    { value: '6', label: 'FB6' },
    { value: '6+', label: 'FB6+' },
    { value: '6a', label: 'FB6A' },
    { value: '6b', label: 'FB6B' },
    { value: '6c', label: 'FB6C' },
    { value: '7', label: 'FB7' },
    { value: '7+', label: 'FB7+' },
    { value: '7a', label: 'FB7A' },
    { value: '7b', label: 'FB7B' },
    { value: '7c', label: 'FB7C' },
    { value: '8', label: 'FB8' },
    { value: '8+', label: 'FB8+' }
]

const gripOptions = [
    { value: 'CRIMP', label: 'Crimp' },
    { value: 'JUG', label: 'Jug' },
    { value: 'SLOPER', label: 'Sloper' },
    { value: 'PINCH', label: 'Pinch' },
    { value: 'POCKET', label: 'Pocket' },
    { value: 'VOLUME', label: 'Volume' },
    { value: 'UNDERCLING', label: 'Undercling' },
    { value: 'SIDEPULL', label: 'Sidepull' }
]

const wallOptions = [
    { value: 'SLAB', label: 'Platte' },
    { value: 'VERTICAL', label: 'Vertikal' },
    { value: 'OVERHANG', label: 'Überhang' },
    { value: 'ROOF', label: 'Dach' },
    { value: 'DIHEDRAL', label: 'Diedre' },
    { value: 'ARETE', label: 'Aret' }
]

const characterOptions = [
    { value: 'TECHNICAL', label: 'Technisch' },
    { value: 'PHYSICAL', label: 'Kraftvoll' },
    { value: 'BALANCE', label: 'Balance' },
    { value: 'NEUTRAL', label: 'Neutral' }
]

const styleOptions = [
    { value: 'STATIC', label: 'Statisch' },
    { value: 'DYNAMIC', label: 'Dynamisch' },
    { value: 'NEUTRAL', label: 'Neutral' }
]

const hasFilters = computed(() => {
    return Boolean(
        gripType.value ||
        wallAngle.value ||
        routeCharacter.value ||
        climbingStyle.value ||
        minGrade.value ||
        maxGrade.value
    )
})

const filterDescription = computed(() => {
    const parts: string[] = []

    if (gripType.value) {
        parts.push(
            gripOptions.find(option => option.value === gripType.value)?.label ?? ''
        )
    }

    if (wallAngle.value) {
        parts.push(
            wallOptions.find(option => option.value === wallAngle.value)?.label ?? ''
        )
    }

    if (routeCharacter.value) {
        parts.push(
            characterOptions.find(option => option.value === routeCharacter.value)?.label ?? ''
        )
    }

    if (climbingStyle.value) {
        parts.push(
            styleOptions.find(option => option.value === climbingStyle.value)?.label ?? ''
        )
    }

    if (minGrade.value || maxGrade.value) {
        const min = gradeOptions.find(option => option.value === minGrade.value)?.label
        const max = gradeOptions.find(option => option.value === maxGrade.value)?.label

        if (min && max) {
            parts.push(`${min} – ${max}`)
        } else if (min) {
            parts.push(`ab ${min}`)
        } else if (max) {
            parts.push(`bis ${max}`)
        }
    }

    return parts.join(' · ')
})

const maxGradeDistribution = computed(() => {
    return Math.max(
        ...props.gradeDistribution.map(item => item.amount),
        1
    )
})

function submitSearch() {
    emit('search', {
        gripType: gripType.value,
        wallAngle: wallAngle.value,
        routeCharacter: routeCharacter.value,
        climbingStyle: climbingStyle.value,
        minGrade: minGrade.value,
        maxGrade: maxGrade.value
    })
}

function resetFilters() {
    gripType.value = null
    wallAngle.value = null
    routeCharacter.value = null
    climbingStyle.value = null
    minGrade.value = null
    maxGrade.value = null

    submitSearch()
}

function formatPercentage(value: number | undefined) {
    if (value === undefined || value === null) {
        return '–'
    }

    return `${Math.round(value)} %`
}

function formatDecimal(value: number | undefined) {
    if (value === undefined || value === null) {
        return '–'
    }

    return value.toFixed(1).replace('.', ',')
}
</script>

<template>
    <section class="filter-analysis">
        <div class="section-heading">
            <div>
                <p class="detail-label">ANALYSE</p>
                <h2>Routen analysieren</h2>
                <p class="section-description">
                    Untersuche deine Performance bei einer bestimmten Kombination
                    von Boulder-Eigenschaften.
                </p>
            </div>
        </div>

        <div class="filter-card">
            <div class="filter-grid">
                <label class="filter-field">
                    <span>Grifftyp</span>
                    <select v-model="gripType">
                        <option :value="null">
                            Alle
                        </option>
                        <option
                            v-for="option in gripOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </label>

                <label class="filter-field">
                    <span>Wandneigung</span>
                    <select v-model="wallAngle">
                        <option :value="null">
                            Alle
                        </option>
                        <option
                            v-for="option in wallOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </label>

                <label class="filter-field">
                    <span>Routencharakter</span>
                    <select v-model="routeCharacter">
                        <option :value="null">
                            Alle
                        </option>
                        <option
                            v-for="option in characterOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </label>

                <label class="filter-field">
                    <span>Kletterstil</span>
                    <select v-model="climbingStyle">
                        <option :value="null">
                            Alle
                        </option>
                        <option
                            v-for="option in styleOptions"
                            :key="option.value"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </label>
            </div>

            <div class="grade-filter">
                <div class="grade-filter-header">
                    <span>Schwierigkeit</span>
                    <span class="optional-label">optional</span>
                </div>

                <div class="grade-range">
                    <select v-model="minGrade">
                        <option :value="null">
                            Von
                        </option>
                        <option
                            v-for="option in gradeOptions"
                            :key="`min-${option.value}`"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>

                    <span class="range-separator">–</span>

                    <select v-model="maxGrade">
                        <option :value="null">
                            Bis
                        </option>
                        <option
                            v-for="option in gradeOptions"
                            :key="`max-${option.value}`"
                            :value="option.value"
                        >
                            {{ option.label }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="filter-actions">
                <button
                    v-if="hasFilters"
                    type="button"
                    class="reset-button"
                    @click="resetFilters"
                >
                    Filter zurücksetzen
                </button>

                <button
                    type="button"
                    class="analyze-button"
                    :disabled="loading"
                    @click="submitSearch"
                >
                    {{ loading ? 'Wird analysiert...' : 'Analyse starten' }}
                </button>
            </div>
        </div>

        <div
            v-if="hasFilters && filterDescription"
            class="active-filter"
        >
            <span class="active-filter-label">DEINE ANALYSE</span>
            <strong>{{ filterDescription }}</strong>
        </div>

        <div
            v-if="loading"
            class="result-card loading-card"
        >
            <div class="loading-title">
                Analyse wird geladen...
            </div>
        </div>

        <div
            v-else-if="stats"
            class="result-card"
        >
            <div class="result-header">
                <div>
                    <p class="detail-label">ERGEBNIS</p>
                    <h3>
                        {{ filterDescription || 'Alle Boulder' }}
                    </h3>
                </div>
            </div>

            <div class="primary-stats">
                <div class="primary-stat">
                    <span class="stat-value">
                        {{ stats.amountOfTriedBoulders }}
                    </span>
                    <span class="stat-label">
                        Geboulderte Boulder
                    </span>
                </div>

                <div class="primary-stat">
                    <span class="stat-value">
                        {{ stats.amountOfTops }}
                    </span>
                    <span class="stat-label">
                        Tops
                    </span>
                </div>

                <div class="primary-stat">
                    <span class="stat-value">
                        {{ formatPercentage(stats.successRate) }}
                    </span>
                    <span class="stat-label">
                        Erfolgsquote
                    </span>
                </div>
            </div>

            <div class="secondary-stats">
                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ formatDecimal(stats.averageAttemptsUntilTop) }}
                    </span>
                    <span class="stat-item-label">
                        Ø Versuche bis Top
                    </span>
                </div>

                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.avgGrade || '–' }}
                    </span>
                    <span class="stat-item-label">
                        Ø Top-Grade
                    </span>
                </div>

                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.maxGrade || '–' }}
                    </span>
                    <span class="stat-item-label">
                        Höchster Top
                    </span>
                </div>

                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.amountOfFlashes }}
                    </span>
                    <span class="stat-item-label">
                        Flashes
                    </span>
                </div>
            </div>

            <div class="result-divider"></div>

            <div class="secondary-stats compact">
                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.openProjects }}
                    </span>
                    <span class="stat-item-label">
                        Offene Projekte
                    </span>
                </div>

                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.amountOfZones }}
                    </span>
                    <span class="stat-item-label">
                        Zonen
                    </span>
                </div>

                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.highestProjectZoneGrade || '–' }}
                    </span>
                    <span class="stat-item-label">
                        Höchster Zone-Grade
                    </span>
                </div>

                <div class="stat-item">
                    <span class="stat-item-value">
                        {{ stats.avgGradeOnOpenProjects || '–' }}
                    </span>
                    <span class="stat-item-label">
                        Ø Grade offene Projekte
                    </span>
                </div>
            </div>

            <div
                v-if="gradeDistribution.length"
                class="grade-distribution"
            >
                <div class="distribution-header">
                    <div>
                        <p class="detail-label">VERTEILUNG</p>
                        <h4>Boulder nach Schwierigkeit</h4>
                    </div>
                </div>

                <div class="grade-list">
                    <div
                        v-for="item in gradeDistribution"
                        :key="item.grade"
                        class="grade-row"
                    >
                        <span class="grade-label">
                            {{ item.grade }}
                        </span>

                        <div class="grade-bar-track">
                            <div
                                class="grade-bar"
                                :style="{
                                    width: `${(item.amount / maxGradeDistribution) * 100}%`
                                }"
                            ></div>
                        </div>

                        <span class="grade-count">
                            {{ item.amount }}
                        </span>
                    </div>
                </div>
            </div>
        </div>

        <div
            v-else-if="hasFilters && !loading"
            class="empty-result"
        >
            <p class="empty-title">
                Keine Boulder gefunden
            </p>
            <p class="empty-description">
                Für diese Filterkombination gibt es noch keine passenden
                Boulder in deiner Historie.
            </p>
        </div>

        <div
            v-else
            class="empty-result initial-state"
        >
            <p class="empty-title">
                Wähle deine Filter
            </p>
            <p class="empty-description">
                Kombiniere Grifftyp, Wand, Charakter, Kletterstil und
                Schwierigkeit, um deine persönliche Performance zu analysieren.
            </p>
        </div>
    </section>
</template>

<style scoped>
.filter-analysis {
    width: 100%;
}

.section-heading {
    margin-bottom: 1.5rem;
}

.detail-label {
    margin: 0 0 0.5rem;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.22em;
}

.section-heading h2 {
    margin: 0;
    color: white;
    font-size: 1.75rem;
    font-weight: 600;
}

.section-description {
    max-width: 650px;
    margin: 0.75rem 0 0;
    color: rgba(255, 255, 255, 0.55);
    line-height: 1.5;
}

.filter-card {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
}

.filter-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.filter-field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.filter-field > span,
.grade-filter-header > span:first-child {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    font-weight: 600;
}

.filter-field select,
.grade-range select {
    width: 100%;
    min-height: 44px;
    padding: 0.7rem 0.8rem;
    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 8px;
    outline: none;
    background: rgba(0, 0, 0, 0.25);
    color: white;
    font: inherit;
    cursor: pointer;
    transition:
        border-color 0.15s ease,
        background 0.15s ease;
}

.filter-field select:hover,
.grade-range select:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.32);
}

.filter-field select:focus,
.grade-range select:focus {
    border-color: rgba(255, 255, 255, 0.4);
}

.filter-field select option,
.grade-range select option {
    background: #161616;
    color: white;
}

.grade-filter {
    margin-top: 1rem;
}

.grade-filter-header {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    margin-bottom: 0.5rem;
}

.optional-label {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.7rem;
}

.grade-range {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr);
    align-items: center;
    gap: 0.75rem;
}

.range-separator {
    color: rgba(255, 255, 255, 0.35);
}

.filter-actions {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.5rem;
}

.reset-button,
.analyze-button {
    padding: 0.75rem 1rem;
    border-radius: 8px;
    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.15s ease,
        opacity 0.15s ease;
}

.reset-button {
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: transparent;
    color: rgba(255, 255, 255, 0.65);
}

.reset-button:hover {
    background: rgba(255, 255, 255, 0.06);
    color: white;
}

.analyze-button {
    border: 1px solid rgba(255, 255, 255, 0.8);
    background: white;
    color: #0f0f0f;
}

.analyze-button:hover {
    transform: translateY(-1px);
    background: rgba(255, 255, 255, 0.9);
}

.analyze-button:disabled {
    opacity: 0.45;
    cursor: not-allowed;
    transform: none;
}

.active-filter {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin: 2rem 0 1rem;
}

.active-filter-label {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.18em;
}

.active-filter strong {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.9rem;
    font-weight: 500;
}

.result-card {
    overflow: hidden;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
}

.result-header {
    padding: 1.5rem 1.5rem 0;
}

.result-header h3 {
    margin: 0;
    color: white;
    font-size: 1.25rem;
    font-weight: 600;
}

.primary-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    margin-top: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.primary-stat {
    padding: 1.5rem;
    text-align: center;
}

.primary-stat + .primary-stat {
    border-left: 1px solid rgba(255, 255, 255, 0.08);
}

.stat-value {
    display: block;
    color: white;
    font-size: 2rem;
    font-weight: 600;
    line-height: 1;
}

.stat-label {
    display: block;
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.72rem;
}

.secondary-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
}

.secondary-stats.compact {
    padding-bottom: 0.5rem;
}

.stat-item {
    padding: 1.25rem 1rem;
    text-align: center;
}

.stat-item-value {
    display: block;
    color: rgba(255, 255, 255, 0.9);
    font-size: 1.25rem;
    font-weight: 600;
}

.stat-item-label {
    display: block;
    margin-top: 0.4rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.7rem;
    line-height: 1.3;
}

.result-divider {
    height: 1px;
    margin: 0 1.5rem;
    background: rgba(255, 255, 255, 0.08);
}

.grade-distribution {
    padding: 1.5rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.distribution-header {
    margin-bottom: 1.25rem;
}

.distribution-header h4 {
    margin: 0;
    color: white;
    font-size: 1rem;
    font-weight: 500;
}

.grade-list {
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
}

.grade-row {
    display: grid;
    grid-template-columns: 55px minmax(0, 1fr) 30px;
    align-items: center;
    gap: 0.75rem;
}

.grade-label {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.75rem;
    text-align: right;
}

.grade-bar-track {
    height: 8px;
    overflow: hidden;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.06);
}

.grade-bar {
    height: 100%;
    min-width: 2px;
    border-radius: inherit;
    background: rgba(255, 255, 255, 0.65);
    transition: width 0.3s ease;
}

.grade-count {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.7rem;
    text-align: left;
}

.loading-card {
    min-height: 220px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-title {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

.empty-result {
    padding: 3rem 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    text-align: center;
}

.empty-title {
    margin: 0;
    color: rgba(255, 255, 255, 0.8);
    font-size: 1rem;
    font-weight: 600;
}

.empty-description {
    max-width: 500px;
    margin: 0.6rem auto 0;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
    line-height: 1.5;
}

@media (max-width: 700px) {
    .filter-grid {
        grid-template-columns: 1fr;
    }

    .primary-stats {
        grid-template-columns: 1fr;
    }

    .primary-stat + .primary-stat {
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        border-left: 0;
    }

    .secondary-stats {
        grid-template-columns: repeat(2, 1fr);
    }

    .filter-actions {
        flex-direction: column-reverse;
        align-items: stretch;
    }

    .reset-button,
    .analyze-button {
        width: 100%;
    }

    .active-filter {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.35rem;
    }
}

</style>