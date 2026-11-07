<script setup lang="ts">
import { computed, ref, watch } from 'vue'
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

interface FilterState {
    gripType: GripType | null
    wallAngle: WallAngle | null
    routeCharacter: RouteCharacter | null
    climbingStyle: ClimbingStyle | null
    minGrade: string | null
    maxGrade: string | null
}

type FilterOptionCount = components['schemas']['ProgressFilterCountDTO']

type FilterOptionCounts = components['schemas']['ProgressFilterCountResponseDTO']

const props = withDefaults(defineProps<{
    stats?: FilterStats | null
    gradeDistribution?: GradeDistribution[]
    filterOptionCounts?: FilterOptionCounts
    loading?: boolean
}>(), {
    stats: null,
    gradeDistribution: () => [],
    filterOptionCounts: () => ({
        gripTypes: [],
        wallAngles: [],
        climbingStyles: [],
        routeCharacters: [],
        minGrades: [],
        maxGrades: []
    }),
    loading: false
})

const emit = defineEmits<{
    search: [FilterState]
    filterChange: [FilterState]
}>()

function notifyFilterChange() {
    emit('filterChange', getCurrentFilters())
}


const gripType = ref<GripType | null>(null)
const wallAngle = ref<WallAngle | null>(null)
const routeCharacter = ref<RouteCharacter | null>(null)
const climbingStyle = ref<ClimbingStyle | null>(null)
const minGrade = ref<string | null>(null)
const maxGrade = ref<string | null>(null)

/*
 * Das sind die Filter, die tatsächlich zum aktuell angezeigten
 * Ergebnis gehören.
 *
 * Wichtig:
 * Diese Werte werden NICHT beim Ändern der Selects aktualisiert,
 * sondern erst nachdem ein neues Ergebnis geladen wurde.
 */
const appliedFilters = ref<FilterState>({
    gripType: null,
    wallAngle: null,
    routeCharacter: null,
    climbingStyle: null,
    minGrade: null,
    maxGrade: null
})

/*
 * Merkt sich die Filter, mit denen die aktuelle Anfrage gestartet wurde.
 */
const pendingFilters = ref<FilterState | null>(null)

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
    { value: '8+', label: 'FB8+'
    }
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

/*
 * Filter, die momentan in den Selects ausgewählt sind.
 */
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

/*
 * Beschreibung der momentan ausgewählten Filter.
 *
 * Diese Beschreibung ist bewusst NICHT diejenige, die im Ergebnis-
 * Header verwendet wird.
 */
const currentFilterDescription = computed(() => {
    return buildFilterDescription({
        gripType: gripType.value,
        wallAngle: wallAngle.value,
        routeCharacter: routeCharacter.value,
        climbingStyle: climbingStyle.value,
        minGrade: minGrade.value,
        maxGrade: maxGrade.value
    })
})

/*
 * Beschreibung der Filter, mit denen das aktuell angezeigte Ergebnis
 * berechnet wurde.
 */
const appliedFilterDescription = computed(() => {
    return buildFilterDescription(appliedFilters.value)
})

const maxGradeDistribution = computed(() => {
    return Math.max(
        ...props.gradeDistribution.map(item => item.amount),
        1
    )
})

function buildFilterDescription(filters: FilterState): string {
    const parts: string[] = []

    if (filters.gripType) {
        parts.push(
            gripOptions.find(option => option.value === filters.gripType)?.label ?? ''
        )
    }

    if (filters.wallAngle) {
        parts.push(
            wallOptions.find(option => option.value === filters.wallAngle)?.label ?? ''
        )
    }

    if (filters.routeCharacter) {
        parts.push(
            characterOptions.find(
                option => option.value === filters.routeCharacter
            )?.label ?? ''
        )
    }

    if (filters.climbingStyle) {
        parts.push(
            styleOptions.find(
                option => option.value === filters.climbingStyle
            )?.label ?? ''
        )
    }

    if (filters.minGrade || filters.maxGrade) {
        const min = gradeOptions.find(
            option => option.value === filters.minGrade
        )?.label

        const max = gradeOptions.find(
            option => option.value === filters.maxGrade
        )?.label

        if (min && max) {
            parts.push(`${min} – ${max}`)
        } else if (min) {
            parts.push(`ab ${min}`)
        } else if (max) {
            parts.push(`bis ${max}`)
        }
    }

    return parts.filter(Boolean).join(' · ')
}

function getCurrentFilters(): FilterState {
    return {
        gripType: gripType.value,
        wallAngle: wallAngle.value,
        routeCharacter: routeCharacter.value,
        climbingStyle: climbingStyle.value,
        minGrade: minGrade.value,
        maxGrade: maxGrade.value
    }
}

function submitSearch() {
    const filters = getCurrentFilters()
    pendingFilters.value = filters
    emit('search', filters)
}

const suppressFilterChange = ref(false)

function resetFilters() {
    gripType.value = null
    wallAngle.value = null
    routeCharacter.value = null
    climbingStyle.value = null
    minGrade.value = null
    maxGrade.value = null

    submitSearch()
}

watch(
    () => props.stats,
    (newStats) => {
        if (newStats && pendingFilters.value) {
            appliedFilters.value = { ...pendingFilters.value }
            pendingFilters.value = null
        }
    }
)
watch(
    [
        gripType,
        wallAngle,
        routeCharacter,
        climbingStyle,
        minGrade,
        maxGrade
    ],
    () => {
        if (suppressFilterChange.value) {
            return
        }

        notifyFilterChange()
    }
)


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

// Filter Count Helper Methoden
function getCount(
    options: FilterOptionCount[],
    value: string
): number {
    return options.find(option => option.value === value)?.count ?? 0
}

function getGripCount(value: string): number {
    return getCount(
        props.filterOptionCounts?.gripTypes ?? [],
        value
    )
}

function getWallCount(value: string): number {
    return getCount(
        props.filterOptionCounts?.wallAngles ?? [],
        value
    )
}

function getCharacterCount(value: string): number {
    return getCount(
        props.filterOptionCounts?.routeCharacters ?? [],
        value
    )
}

function getStyleCount(value: string): number {
    return getCount(
        props.filterOptionCounts?.climbingStyles ?? [],
        value
    )
}

function getMinGradeCount(value: string): number {
    return getCount(
        props.filterOptionCounts?.minGrades ?? [],
        value
    )
}

function getMaxGradeCount(value: string): number {
    return getCount(
        props.filterOptionCounts?.maxGrades ?? [],
        value
    )
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

        <div class="analysis-layout">
            <!-- FILTER -->
            <div class="filter-card">
                <div class="card-heading">
                    <p class="detail-label">FILTER</p>
                    <h3>Eigenschaften auswählen</h3>
                </div>

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
                                {{ option.label }} ({{ getGripCount(option.value) }})
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
                                {{ option.label }} ({{ getWallCount(option.value) }})
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
                                {{ option.label }} ({{ getCharacterCount(option.value) }})
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
                                {{ option.label }} ({{ getStyleCount(option.value) }})
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
                                {{ option.label }} ({{ getMinGradeCount(option.value) }})
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
                                {{ option.label }} ({{ getMaxGradeCount(option.value) }})
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

                <div
                    v-if="hasFilters && currentFilterDescription"
                    class="pending-filter"
                >
                    <span class="pending-filter-label">
                        AUSGEWÄHLT
                    </span>

                    <strong>
                        {{ currentFilterDescription }}
                    </strong>
                </div>
            </div>

            <!-- ERGEBNIS -->
            <div class="result-column">
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
                                {{ appliedFilterDescription || 'Alle Boulder' }}
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
                        <div class="primary-stat">
                            <span class="stat-value">
                                {{ formatPercentage(stats.flashRate) }}
                            </span>

                            <span class="stat-label">
                                Flash-Rate
                            </span>
                        </div>
                    </div>

                    <!-- Weitere Infos zu getoppten Routen-->
                    <div class="secondary-stats">
                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ stats.maxGrade || '–' }}
                            </span>

                            <span class="stat-item-label">
                                MaxGrade
                            </span>
                        </div>

                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ stats.avgGrade || '–' }}
                            </span>

                            <span class="stat-item-label">
                                avgGrade
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

                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ formatDecimal(stats.averageAttemptsUntilTop) }}
                            </span>

                            <span class="stat-item-label">
                                Ø Versuche bis erreichen des Tops
                            </span>
                        </div>
                        

                    </div>

                    <div class="result-divider"></div>

                    <!-- Weitere Infos zu offenen Projekten-->
                    <div class="secondary-stats">
                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ stats.highestProjectZoneGrade || '–' }}
                            </span>

                            <span class="stat-item-label">
                                maxZoneGrade
                            </span>
                        </div>

                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ stats.avgGradeOnOpenProjects || '–' }}
                            </span>

                            <span class="stat-item-label">
                                avgGradeOnOpenProjects
                            </span>
                        </div>

                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ stats.amountOfZones }}
                            </span>

                            <span class="stat-item-label">
                                Erreichte Zonen bei offenen Projekten
                            </span>
                        </div>

                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ formatDecimal(stats.averageTriesOnOpenProjects) }}
                            </span>

                            <span class="stat-item-label">
                                avgTriesOnOpenProjects
                            </span>
                        </div>
                    </div>

                    <div class="secondary-stats compact">
                        <div class="stat-item">
                            <span class="stat-item-value">
                                {{ stats.openProjects }}
                            </span>

                            <span class="stat-item-label">
                                Offene Projekte
                            </span>
                        </div>

                    </div>

                    <!-- Output Header -->
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
                    v-else-if="!loading"
                    class="empty-result"
                >
                    <p class="empty-title">
                        Noch kein Ergebnis
                    </p>

                    <p class="empty-description">
                        Wähle deine Filter und starte anschließend die Analyse.
                    </p>
                </div>
            </div>
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

/*
 * Desktop:
 * Filter links, Ergebnis rechts.
 */
.analysis-layout {
    display: grid;
    grid-template-columns: minmax(320px, 0.85fr) minmax(0, 1.15fr);
    align-items: start;
    gap: 1.5rem;
}

.filter-card,
.result-card {
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
}

.filter-card {
    padding: 1.5rem;
}

.card-heading {
    margin-bottom: 1.5rem;
}

.card-heading h3 {
    margin: 0;
    color: white;
    font-size: 1.1rem;
    font-weight: 600;
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

/*
 * Zeigt die momentan ausgewählten Filter.
 * Das ist absichtlich NICHT der Ergebnis-Header.
 */
.pending-filter {
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
    margin-top: 1.5rem;
    padding-top: 1rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.pending-filter-label {
    color: rgba(255, 255, 255, 0.3);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.18em;
}

.pending-filter strong {
    color: rgba(255, 255, 255, 0.65);
    font-size: 0.85rem;
    font-weight: 500;
}

.result-column {
    min-width: 0;
}

.result-card {
    overflow: hidden;
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
    grid-template-columns: repeat(4, 1fr);
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
    min-height: 420px;
    display: flex;
    align-items: center;
    justify-content: center;
}

.loading-title {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

.empty-result {
    min-height: 220px;
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

@media (max-width: 1000px) {
    .analysis-layout {
        grid-template-columns: 1fr;
    }

    .loading-card {
        min-height: 220px;
    }
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
}
</style>