
<script setup lang="ts">
import { computed } from 'vue'
import type { components } from '@/types/schema'

type SessionInsights = components['schemas']['SessionInsightsResponseDTO']

type AttemptInsight = NonNullable<SessionInsights['mostEfficientSend']>
type PerformanceInsight = NonNullable<SessionInsights['performanceInsights']>[number]
type Highlight = NonNullable<SessionInsights['newHighlights']>[number]
type FormerWeaknessTop = NonNullable<SessionInsights['formerWeaknessTops']>[number]
type GradeInsight = NonNullable<SessionInsights['gradeDistributionInsights']>[number]
type AttributeInsight = NonNullable<SessionInsights['untoppedAttributeInsights']>[number]

const props = defineProps<{
    insights: SessionInsights
}>()

// --------------------------------------------------
// Sichere Listen und abgeleitete Daten
// --------------------------------------------------

const efficientSends = computed<AttemptInsight[]>(() => {
    const sends = props.insights.efficientSends ?? []

    // Boulder nur einmal anzeigen.
    const unique = new Map<string, AttemptInsight>()

    sends.forEach((attempt, index) => {
        const id = attempt.boulder?.id
        const key = id != null ? String(id) : `attempt-${index}`

        if (!unique.has(key)) {
            unique.set(key, attempt)
        }
    })

    return [...unique.values()]
})

const performanceInsights = computed(
    () => props.insights.performanceInsights ?? []
)

const highlights = computed(
    () => props.insights.newHighlights ?? []
)

const formerWeaknessTops = computed(
    () => props.insights.formerWeaknessTops ?? []
)

const gradeInsights = computed(
    () => props.insights.gradeDistributionInsights ?? []
)

const untoppedAttributeInsights = computed(
    () => props.insights.untoppedAttributeInsights ?? []
)

const highGradeRoutes = computed(
    () => props.insights.highGradeRoutes ?? []
)

// --------------------------------------------------
// Texte und Formatierung
// --------------------------------------------------

const metricNames: Record<string, string> = {
    SUCCESS_RATE: 'Erfolgsquote',
    TRIES: 'Versuche',
    TOPS: 'Tops',
    FLASHES: 'Flashes',
    FLASHRATE: 'Flash-Rate',
    DIFFERENT_BOULDERS: 'Verschiedene Boulder'
}

const attributeNames: Record<string, string> = {
    GRIP_TYPE: 'Griffart',
    WALL_ANGLE: 'Wandneigung',
    CLIMBING_STYLE: 'Kletterstil',
    ROUTE_CHARACTER: 'Routencharakter'
}

const highlightNames: Record<string, string> = {
    NEW_MAXGRADE_FOR_ATTRIBUTE: 'Neuer persönlicher Bestwert',
    HARD_FLASH: 'Schwieriger Flash'
}

const gradeInsightNames: Record<string, string> = {
    MOST_TOPS: 'Hier hast du die meisten Tops geholt',
    MOST_ATTEMPTS: 'Hier hast du die meisten Versuche verbracht'
}

function metricName(metric?: string | null): string {
    return metricNames[metric ?? ''] ?? metric ?? 'Performance'
}

function attributeName(attribute?: string | null): string {
    return attributeNames[attribute ?? ''] ?? attribute ?? 'Attribut'
}

function highlightName(type?: string | null): string {
    return highlightNames[type ?? ''] ?? type ?? 'Highlight'
}

function gradeInsightName(type?: string | null): string {
    return gradeInsightNames[type ?? ''] ?? type ?? 'Grade-Analyse'
}

function isRateMetric(metric?: string | null): boolean {
    return metric === 'SUCCESS_RATE' || metric === 'FLASHRATE'
}

function formatMetricValue(
    metric: string | null | undefined,
    value: number | null | undefined
): string {
    if (value == null) return '–'

    if (isRateMetric(metric)) {
        return `${value.toFixed(1)} %`
    }

    return Number.isInteger(value) ? String(value) : value.toFixed(1)
}

function formatImprovement(insight: PerformanceInsight): string {
    const value = insight.improvement ?? 0
    const prefix = value > 0 ? '+' : ''

    if (isRateMetric(insight.metric)) {
        return `${prefix}${value.toFixed(1)} Prozentpunkte`
    }

    return `${prefix}${Number.isInteger(value) ? value : value.toFixed(1)}`
}

function boulderName(attempt?: AttemptInsight | null): string {
    return attempt?.boulder?.name || 'Unbekannter Boulder'
}

// Der Grad liegt auf SessionAttemptInsightDTO,
// nicht auf BoulderInsightDTO.
function boulderGrade(attempt?: AttemptInsight | null): string {
    return attempt?.grade ?? '–'
}

function triesLabel(tries?: number | null): string {
    if (tries == null) return 'Versuche unbekannt'
    return `${tries} ${tries === 1 ? 'Versuch' : 'Versuche'}`
}

function formatPercentage(value?: number | null): string {
    return value == null ? '–' : `${value.toFixed(1)} %`
}

function formatAttributeValue(value?: string | null): string {
    if (!value) return 'Unbekannt'

    return value
        .replaceAll('_', ' ')
        .toLowerCase()
        .replace(/\b\w/g, char => char.toUpperCase())
}

const highlightEmojis: Record<string, string> = {
    HARD_SEND: '💪',
    HARD_FLASH: '⚡',
    NEW_MAXGRADE_FOR_ATTRIBUTE: '🏆',
    PROJECT_ZONE: '🎯',
    PROJECT_SEND: '🚀',
    SESSION_TRIES: '🔥',
    SESSION_PEAK: '📈',
    SESSION_FUN: '🎉',
    SESSION_PROJECT: '🧗',
    SESSION_HOT_STREAK: '🔥',
    PROGRESS: '🌱',
    EFFICIENCY: '⚡',
    CONSISTENCY: '🎖️',
    MILESTONE: '🏅',
    FLASHRATE: '✨'
}

function highlightEmoji(type?: string | null): string {
    return highlightEmojis[type ?? ''] ?? '✦'
}

function boulderAttributes(attempt?: AttemptInsight | null) {
    const boulder = attempt?.boulder

    if (!boulder) return []

    return [
        boulder.wallAngle,
        boulder.gripType,
        boulder.routeCharacter,
        boulder.climbingStyle
    ].filter((value) => value !== undefined && value !== null)
}

function efficientSendEmoji(tries?: number): string {
    if (tries === 1) return '⚡'
    if (tries === 2) return '🥈'
    if (tries === 3) return '🥉'

    return ''
}

// --------------------------------------------------
// Gesamtprüfung
// --------------------------------------------------

const hasAnyInsights = computed(() => {
    return Boolean(
        props.insights.mostEfficientSend ||
        props.insights.mostDifficultProject ||
        highlights.value.length ||
        performanceInsights.value.length ||
        efficientSends.value.length ||
        gradeInsights.value.length ||
        highGradeRoutes.value.length ||
        untoppedAttributeInsights.value.length ||
        formerWeaknessTops.value.length
    )
})
</script>

<template>
    <section class="insights-panel">

        <header class="panel-heading">
            <div>
                <p class="detail-label">SESSION INSIGHTS</p>
                <h2>Was diese Session besonders macht</h2>
                <p class="panel-subtitle">
                    Deine persönlichen Highlights und Erkenntnisse aus dieser Session.
                </p>
            </div>
        </header>

        <!-- 1. Persönliche Highlights -->
        <section class="insight-section">
            <div class="section-title">
                <div>
                    <p class="detail-label">HIGHLIGHTS</p>
                    <h3>Besondere Momente</h3>
                </div>
            </div>

            <div class="featured-grid">

                <article
                    v-if="insights.mostEfficientSend"
                    class="insight-card featured-card"
                >
                    <span class="card-kicker">Effizientester Send</span>
                    <h4>{{ boulderName(insights.mostEfficientSend) }}</h4>

                    <div class="card-main-value">
                        {{ boulderGrade(insights.mostEfficientSend) }}
                    </div>

                    <p>
                        Getoppt in
                        {{ triesLabel(insights.mostEfficientSend.tries) }}
                    </p>
                </article>

                <article
                    v-if="insights.mostDifficultProject"
                    class="insight-card featured-card"
                >
                    <span class="card-kicker">Größtes Projekt</span>
                    <h4>{{ boulderName(insights.mostDifficultProject) }}</h4>

                    <div class="card-main-value">
                        {{ boulderGrade(insights.mostDifficultProject) }}
                    </div>

                    <p>
                        {{ triesLabel(insights.mostDifficultProject.tries) }}
                        bisher – noch nicht getoppt
                    </p>
                </article>

            </div>

            <div v-if="highlights.length" class="highlight-list">
                <article
                    v-for="(highlight, index) in highlights"
                    :key="`${highlight.type}-${index}`"
                    class="highlight-item"
                >
                    <span class="highlight-marker">
                        {{ highlightEmoji(highlight.type) }}
                    </span>

                    <div class="highlight-content">
                        <strong>{{ highlightName(highlight.type) }}</strong>
                        <p>{{ highlight.message }}</p>

                        <div
                            v-if="highlight.sessionAttemptInsightDTO"
                            class="highlight-route"
                        >
                            <span>
                                {{ highlight.sessionAttemptInsightDTO.boulder?.name || 'Boulder' }}
                            </span>

                            <span>
                                {{ highlight.sessionAttemptInsightDTO.grade ?? '–' }}
                            </span>

                            <span>
                                {{ triesLabel(highlight.sessionAttemptInsightDTO.tries) }}
                            </span>
                        </div>
                    </div>
                </article>
            </div>

            <p
                v-if="
                    !insights.mostEfficientSend &&
                    !insights.mostDifficultProject &&
                    !highlights.length
                "
                class="empty-message"
            >
                Für diese Session wurden keine besonderen Highlights erkannt.
            </p>
        </section>

        <!-- 2. Performance-Vergleich -->
        <section
            v-if="performanceInsights.length"
            class="insight-section"
        >
            <div class="section-title">
                <div>
                    <p class="detail-label">PERFORMANCE</p>
                    <h3>Stärker als deine letzten Sessions</h3>
                    <p class="section-description">
                        Vergleich mit dem Median deiner vorherigen Sessions.
                    </p>
                </div>
            </div>

            <div class="performance-grid">
                <article
                    v-for="insight in performanceInsights"
                    :key="insight.metric"
                    class="performance-card"
                >
                    <span class="card-kicker">
                        {{ metricName(insight.metric) }}
                    </span>

                    <strong class="performance-value">
                        {{ formatMetricValue(insight.metric, insight.currentValue) }}
                    </strong>

                    <div class="performance-comparison">
                        <span class="positive-value">
                            {{ formatImprovement(insight) }}
                        </span>

                        <span class="median-value">
                            Median:
                            {{ formatMetricValue(insight.metric, insight.medianValue) }}
                        </span>
                    </div>
                </article>
            </div>
        </section>

        <section v-else class="insight-section">
            <div class="empty-message">
                Noch nicht genügend vorherige Sessions für einen Performance-Vergleich.
            </div>
        </section>

        <!-- 3. Effiziente Sends -->
        <section
            v-if="efficientSends.length"
            class="insight-section"
        >
            <div class="section-title">
                <div>
                    <p class="detail-label">EFFICIENCY</p>
                    <h3>Effiziente Sends</h3>
                    <p class="section-description">
                        Getoppte Boulder mit maximal drei Versuchen.
                    </p>
                </div>

                <span class="section-count">
                    {{ efficientSends.length }} Boulder
                </span>
            </div>

            <div class="route-list scroll">
                <article
                    v-for="(attempt, index) in efficientSends"
                    :key="attempt.boulder?.id ?? index"
                    class="route-row"
                >
                    <span class="route-number">
                        {{ efficientSendEmoji(attempt.tries) }}
                    </span>

                    <div class="route-info">
                        <strong>{{ boulderName(attempt) }}</strong>
                        <span>{{ boulderGrade(attempt) }} |  {{ boulderAttributes(attempt).join(' · ') }}</span>
                    </div>

                    <div class="route-tries">
                        {{ triesLabel(attempt.tries) }}
                    </div>
                </article>
            </div>
        </section>

        <!-- 4. Grade-Analyse -->
        <section
            v-if="gradeInsights.length || highGradeRoutes.length"
            class="insight-section"
        >
            <div class="section-title">
                <div>
                    <p class="detail-label">GRADE ANALYSIS</p>
                    <h3>Ein näherer Blick auf deine Grade-Verteilung</h3>
                </div>
            </div>

            <div v-if="gradeInsights.length" class="grade-insight-grid">
                <article
                    v-for="(insight, index) in gradeInsights"
                    :key="`${insight.type}-${index}`"
                    class="insight-card"
                >
                    <span class="card-kicker">
                        {{ gradeInsightName(insight.type) }}
                    </span>

                    <strong class="grade-value">
                        {{ insight.grade ?? '–' }}
                    </strong>

                    <p>
                        {{ insight.value ?? 0 }} {{ insight.type === 'MOST_TOPS' ? 'Boulder' : 'Versuche' }}
                        <span v-if="insight.percentage != null">
                            · {{ formatPercentage(insight.percentage) }} {{ insight.type === 'MOST_TOPS' ? 'aller Tops' : 'der Gesamtversuche' }}
                        </span>
                    </p>
                </article>
            </div>

            <div v-if="highGradeRoutes.length" class="high-grade-list">
                <h4>Anspruchsvolle Boulder dieser Session</h4>

                <div class="route-list scroll">
                    <article
                        v-for="(attempt, index) in highGradeRoutes"
                        :key="attempt.boulder?.id ?? index"
                        class="route-row"
                    >
                        <div class="route-info">
                            <strong>{{ boulderName(attempt) }} </strong>
                            <span>{{ boulderAttributes(attempt).join(' · ') }} | {{ triesLabel(attempt.tries) }}</span>
                        </div>

                        <strong class="route-grade">
                            {{ boulderGrade(attempt) }}
                        </strong>
                    </article>
                </div>
            </div>
        </section>

        <!-- 5. Attribute und ehemalige Schwächen -->
        <section
            v-if="untoppedAttributeInsights.length || formerWeaknessTops.length"
            class="insight-section"
        >
            <div class="section-title">
                <div>
                    <p class="detail-label">CLIMBING PROFILE</p>
                    <h3>Was du über dein Klettern lernst</h3>
                </div>
            </div>

            <div
                v-if="untoppedAttributeInsights.length"
                class="attribute-insights"
            >
                <h4>Herausfordernde Attribute</h4>

                <p class="section-description">
                    Attribute, die bei mehreren noch offenen Bouldern auffallen.
                </p>

                <div class="attribute-grid">
                    <article
                        v-for="(insight, index) in untoppedAttributeInsights"
                        :key="`${insight.attribute}-${insight.value}-${index}`"
                        class="attribute-card"
                    >
                        <span class="card-kicker">
                            {{ attributeName(insight.attribute) }}
                        </span>

                        <strong>
                            {{ formatAttributeValue(insight.value) }}
                        </strong>

                        <p>
                            {{ insight.matchingBoulders ?? 0 }} von
                            {{ insight.totalBoulders ?? 0 }} offenen Bouldern
                        </p>

                        <div class="attribute-bar">
                            <div
                                class="attribute-bar-fill"
                                :style="{
                                    width: `${Math.min(Math.max(insight.percentage ?? 0, 0), 100)}%`
                                }"
                            />
                        </div>

                        <span class="attribute-percentage">
                            {{ formatPercentage(insight.percentage) }}
                        </span>
                    </article>
                </div>
            </div>

            <div
                v-if="formerWeaknessTops.length"
                class="former-weaknesses"
            >
                <h4>Frühere Schwächen überwunden</h4>

                <p class="section-description">
                    Du hast Boulder getoppt, deren Attribute zuvor zu deinen Schwächen gehörten.
                </p>

                <div class="route-list scroll">
                    <article
                        v-for="(item, index) in formerWeaknessTops"
                        :key="item.boulder?.id ?? index"
                        class="weakness-row"
                    >
                        <div class="route-info">
                            <strong>
                                {{ item.boulder?.name || 'Boulder' }}
                            </strong>

                            <span>
                                {{ item.grade ?? '–' }} · {{ triesLabel(item.tries) }}
                            </span>

                            <div class="weakness-tags">
                                <span
                                    v-for="(weakness, weaknessIndex) in (item.formerWeaknesses ?? [])"
                                    :key="`${weakness.attribute}-${weakness.value}-${weaknessIndex}`"
                                    class="weakness-tag"
                                >
                                    {{ attributeName(weakness.attribute) }}:
                                    {{ formatAttributeValue(weakness.value) }}
                                </span>
                            </div>
                        </div>

                        <span class="overcome-marker">✓</span>
                    </article>
                </div>
            </div>
        </section>

        <!-- Keine Insights -->
        <div v-if="!hasAnyInsights" class="empty-message">
            Für diese Session liegen aktuell noch keine Insights vor.
        </div>

    </section>
</template>

<style scoped>
.insights-panel {
    display: flex;
    flex-direction: column;
    gap: 3rem;
}

.panel-heading {
    margin-bottom: -1rem;
}

.panel-heading h2 {
    margin: 0;
    font-size: 1.6rem;
    font-weight: 600;
    letter-spacing: -0.03em;
}

.panel-subtitle,
.section-description {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.85rem;
    line-height: 1.5;
}

.panel-subtitle {
    margin: 0.6rem 0 0;
}

.insight-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.section-title {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
}

.section-title h3 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 600;
}

.section-title .section-description {
    margin: 0.4rem 0 0;
}

.detail-label {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}

.featured-grid,
.performance-grid,
.grade-insight-grid,
.attribute-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1rem;
}

.insight-card,
.performance-card,
.attribute-card {
    min-width: 0;
    padding: 1.4rem;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.035);
}

.featured-card {
    background: rgba(255, 255, 255, 0.055);
}

.card-kicker {
    display: block;
    margin-bottom: 0.8rem;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.72rem;
    font-weight: 600;
}

.insight-card h4 {
    margin: 0;
    font-size: 1rem;
}

.card-main-value,
.grade-value {
    display: block;
    margin-top: 0.8rem;
    font-size: 2rem;
    font-weight: 700;
    letter-spacing: -0.04em;
}

.insight-card p,
.attribute-card p {
    margin: 0.6rem 0 0;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.78rem;
}

.highlight-list,
.route-list {
    display: flex;
    flex-direction: column;
    gap: 0.6rem;
}

.scroll {
    max-height: 350px;
    overflow-y: auto;
    padding-right: 0.4rem;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
}

.highlight-item {
    display: flex;
    gap: 1rem;
    padding: 1rem 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
}

.highlight-marker {
    color: #e5c47b;
    font-size: 1.1rem;
}

.highlight-content {
    min-width: 0;
}

.highlight-content strong {
    font-size: 0.85rem;
}

.highlight-content p {
    margin: 0.35rem 0;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.82rem;
}

.highlight-route {
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
    margin-top: 0.6rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.72rem;
}

.performance-card {
    display: flex;
    flex-direction: column;
}

.performance-value {
    font-size: 2rem;
    line-height: 1.1;
    letter-spacing: -0.04em;
}

.performance-comparison {
    display: flex;
    flex-wrap: wrap;
    justify-content: space-between;
    gap: 0.5rem;
    margin-top: 0.9rem;
    font-size: 0.72rem;
}

.positive-value {
    color: #8bd6a4;
    font-weight: 700;
}

.median-value {
    color: rgba(255, 255, 255, 0.4);
}

.section-count {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.75rem;
}

.route-row,
.weakness-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.95rem 1.1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
}

.route-rank {
    display: grid;
    flex: 0 0 28px;
    width: 28px;
    height: 28px;
    place-items: center;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.08);
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.75rem;
    font-weight: 700;
}

.route-info {
    display: flex;
    flex: 1;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 0;
}

.route-info strong {
    overflow-wrap: anywhere;
    font-size: 0.85rem;
}

.route-info > span {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.72rem;
}

.route-tries,
.route-grade {
    flex-shrink: 0;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.78rem;
}

.high-grade-list h4,
.attribute-insights h4,
.former-weaknesses h4 {
    margin: 0 0 0.3rem;
    font-size: 0.95rem;
}

.attribute-card strong {
    display: block;
    font-size: 1.1rem;
    text-transform: capitalize;
}

.attribute-bar {
    height: 5px;
    margin-top: 1rem;
    overflow: hidden;
    border-radius: 99px;
    background: rgba(255, 255, 255, 0.1);
}

.attribute-bar-fill {
    height: 100%;
    border-radius: inherit;
    background: rgba(249, 115, 22, 0.72);
}

.attribute-percentage {
    display: block;
    margin-top: 0.5rem;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.72rem;
}

.weakness-row {
    align-items: flex-start;
}

.weakness-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 0.4rem;
    margin-top: 0.4rem;
}

.weakness-tag {
    padding: 0.3rem 0.55rem;
    border: 1px solid rgba(212, 184, 117, 0.2);
    border-radius: 999px;
    color: rgba(34, 197, 94, 0.72);
    font-size: 0.68rem;
}

.overcome-marker {
    flex-shrink: 0;
    color: #8bd6a4;
    font-size: 1.1rem;
    font-weight: 700;
}

.empty-message {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.025);
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.85rem;
    text-align: center;
}

@media (max-width: 650px) {
    .featured-grid,
    .performance-grid,
    .grade-insight-grid,
    .attribute-grid {
        grid-template-columns: 1fr;
    }

    .section-title {
        align-items: flex-start;
        flex-direction: column;
    }

    .route-row,
    .weakness-row {
        padding: 0.85rem;
    }

    .route-tries {
        font-size: 0.7rem;
    }
}
</style>
