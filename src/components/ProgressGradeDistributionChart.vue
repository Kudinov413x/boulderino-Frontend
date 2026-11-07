<script setup lang="ts">
import { computed, ref } from 'vue'
import { Chart as ChartJS, ArcElement, Tooltip, type Plugin } from 'chart.js'
import type { TooltipItem, ChartOptions } from 'chart.js'
import { Doughnut } from 'vue-chartjs'
import type { components } from '@/types/schema'

type GradeDistributionResponse = components['schemas']['GradeDistributionResponseDTO']

type GradeDistributionEntry = NonNullable<GradeDistributionResponse['grades']>[number]

const props = defineProps<{
    distribution: GradeDistributionResponse
}>()


const doughnutLabelsPlugin: Plugin<'doughnut'> = {
    id: 'doughnutLabels',

    afterDatasetsDraw(chart) {
        const { ctx } = chart
        const meta = chart.getDatasetMeta(0)

        ctx.save()

        meta.data.forEach((element, index) => {
            const arc = element as ArcElement
            const entry = visibleGrades.value[index]

            if (!entry) {
                return
            }

            const percentage = entry.percentage ?? 0

            // Sehr kleine Segmente nicht beschriften
            if (percentage < 4) {
                return
            }

            // Mittelpunkt des jeweiligen Doughnut-Segments
            const angle = (arc.startAngle + arc.endAngle) / 2
            const radius = (arc.innerRadius + arc.outerRadius) / 2

            const x = arc.x + Math.cos(angle) * radius
            const y = arc.y + Math.sin(angle) * radius

            ctx.textAlign = 'center'
            ctx.textBaseline = 'middle'

            // Grade
            ctx.fillStyle = 'rgba(255, 255, 255, 1)'
            ctx.font = '600 12px sans-serif'
            ctx.fillText(
                entry.grade ?? '',
                x,
                y - 7
            )
        })

        ctx.restore()
    }
}

ChartJS.register( ArcElement, Tooltip, doughnutLabelsPlugin )


const gradeOrder = [
    'FB1',
    'FB1_PLUS',
    'FB2',
    'FB2_PLUS',
    'FB3',
    'FB3_PLUS',
    'FB4',
    'FB4_PLUS',
    'FB5',
    'FB5_PLUS',
    'FB6',
    'FB6_PLUS',
    'FB6_A',
    'FB6_B',
    'FB6_C',
    'FB7',
    'FB7_PLUS',
    'FB7_A',
    'FB7_B',
    'FB7_C',
    'FB8',
    'FB8_PLUS'
]
const hiddenGrades = ref<Set<string>>(new Set())

const hoveredGrade = ref<string | undefined>(undefined)

const grades = computed<GradeDistributionEntry[]>(() => {
    return props.distribution.grades ?? []
})

const sortedGrades = computed(() => {
    return [...grades.value].sort(
        (a, b) =>
            (a.percentage ?? 0) -
            (b.percentage ?? 0)
    )
})

const visibleGrades = computed(() => {
    return sortedGrades.value.filter(
        entry =>
            entry.grade !== undefined &&
            !hiddenGrades.value.has(entry.grade)
    )
})

const totalTops = computed(() => {
    return grades.value.reduce(
        (total, entry) =>
            total + (entry.absoluteTops ?? 0),
        0
    )
})

const visibleTops = computed(() => {
    return visibleGrades.value.reduce(
        (total, entry) =>
            total + (entry.absoluteTops ?? 0),
        0
    )
})

const hasData = computed(() => {
    return totalTops.value > 0
})

const hasVisibleGrades = computed(() => {
    return visibleGrades.value.length > 0
})

function getGradeDifficultyIndex(
    grade: string | undefined
): number {

    if (!grade) {
        return 0
    }

    const index =
        gradeOrder.indexOf(grade)

    return index >= 0
        ? index
        : 0
}

function getGradeColor(grade: string | undefined, alpha = 1 ): string {
    const index = getGradeDifficultyIndex(grade)

    const maxIndex = Math.max(gradeOrder.length - 1, 1)

    const difficulty = index / maxIndex

    const lightness = 0.75 - difficulty * 0.70
    const chroma = 0.50 + difficulty * 0.08
    const hue = 210 - difficulty * 10

    return `oklch(${lightness} ${chroma} ${hue} / ${alpha})`
}

function getChartGradeColor(
    grade: string | undefined
): string {
    if (
        hoveredGrade.value &&
        grade !== hoveredGrade.value
    ) {
        return getGradeColor(grade, 0.3)
    }

    return getGradeColor(grade, 1)
}

const chartData = computed(() => ({
    labels: visibleGrades.value.map(
        entry => entry.grade
    ),

    datasets: [
        {
            data: visibleGrades.value.map(
                entry =>
                    entry.absoluteTops ?? 0
            ),

            backgroundColor:
                visibleGrades.value.map(
                    entry =>
                        getChartGradeColor(
                            entry.grade
                        )
                ),

            borderColor: '#0f0f0f',
            borderWidth: 3,

            hoverBorderColor: '#ffffff',
            hoverBorderWidth: 3,
            hoverOffset: 8
        }
    ]
}))

const chartOptions: ChartOptions<'doughnut'> = {
    responsive: true,
    maintainAspectRatio: false,

    rotation: -90,

    cutout: '68%',

    animation: {
        duration: 700,
        easing: 'easeOutQuart'
    },

    plugins: {
        legend: {
            display: false
        },

        tooltip: {
            displayColors: true,

            backgroundColor: '#181818',
            titleColor: '#ffffff',
            bodyColor:
                'rgba(255, 255, 255, 0.7)',

            borderColor:
                'rgba(255, 255, 255, 0.12)',

            borderWidth: 1,
            padding: 12,

            callbacks: {

                title(
                    context: TooltipItem<'doughnut'>[]
                ) {
                    return (
                        context[0]?.label ?? ''
                    )
                },

                label(
                    context: TooltipItem<'doughnut'>
                ) {

                    const entry =
                        visibleGrades.value[
                            context.dataIndex
                        ]

                    if (!entry) {
                        return ''
                    }

                    const tops =
                        entry.absoluteTops ?? 0

                    const percentage =
                        entry.percentage ?? 0

                    return ` ${tops} Tops · ${formatPercentage(percentage)}%`
                }
            }
        }
    }
}

function formatPercentage(
    percentage: number
): string {
    return percentage.toFixed(2)
}

function isHidden(
    grade: string | undefined
): boolean {
    if (!grade) {
        return false
    }

    return hiddenGrades.value.has(grade)
}

function toggleGrade(grade: string | undefined): void {

    if (!grade) {
        return
    }

    const next =
        new Set(hiddenGrades.value)

    if (next.has(grade)) {
        next.delete(grade)
    } else {
        next.add(grade)
    }

    hiddenGrades.value = next
}

function showAllGrades(): void {
    hiddenGrades.value = new Set()
}

const legendGrades = computed(() => {
    return [...grades.value].sort(
        (a, b) =>
            getGradeDifficultyIndex(a.grade) -
            getGradeDifficultyIndex(b.grade)
    )
})


</script>

<template>
    <div class="chart-card">

        <!-- Kein einziger Top vorhanden -->
        <div
            v-if="!hasData"
            class="empty-chart"
        >
            <div class="empty-icon">
                —
            </div>

            <p>
                Noch keine Tops vorhanden.
            </p>

            <span>
                Sobald du deinen ersten Boulder toppst,
                erscheint hier deine Verteilung.
            </span>
        </div>

        <!-- Daten vorhanden -->
        <div
            v-else
            class="chart-layout"
        >

            <!-- Donut -->
            <div class="chart-wrapper">

                <Doughnut
                    v-if="hasVisibleGrades"
                    :data="chartData"
                    :options="chartOptions"
                />

                <div
                    v-if="hasVisibleGrades"
                    class="chart-center"
                >
                    <strong>
                        {{ visibleTops }}
                    </strong>

                    <span>
                        erreichte Tops
                    </span>
                </div>

                <!-- Alles ausgeblendet -->
                <div
                    v-else
                    class="chart-hidden-state"
                >
                    <strong>
                        —
                    </strong>

                    <span>
                        Keine Grades
                    </span>

                    <button
                        type="button"
                        @click="showAllGrades"
                    >
                        Alle anzeigen
                    </button>
                </div>
            </div>

            <!-- Eigene Legende -->
            <div class="chart-legend">

                <button
                    v-for="entry in legendGrades"
                    :key="entry.grade"
                    type="button"
                    class="legend-item"
                    :class="{
                        'is-hidden':
                            isHidden(entry.grade),
                        'is-hovered':
                            hoveredGrade === entry.grade
                    }"
                    @mouseenter="
                        hoveredGrade = entry.grade
                    "
                    @mouseleave="
                        hoveredGrade = undefined
                    "
                    @click="
                        toggleGrade(entry.grade)
                    "
                >
                    <div class="legend-left">

                        <span
                            class="legend-dot"
                            :style="{
                                background:
                                    getGradeColor(
                                        entry.grade
                                    )
                            }"
                        />

                        <span class="legend-grade">
                            {{ entry.grade }}
                        </span>
                    </div>

                    <div class="legend-value">

                        <strong>
                            {{ entry.absoluteTops ?? 0 }}
                        </strong>

                        <span>
                            {{ formatPercentage(
                                entry.percentage ?? 0
                            ) }}%
                        </span>
                    </div>
                </button>

                <button
                    v-if="hiddenGrades.size > 0"
                    type="button"
                    class="show-all-button"
                    @click="showAllGrades"
                >
                    Alle Grades anzeigen
                </button>

            </div>
        </div>
    </div>
</template>

<style scoped>
.chart-card {
    padding: 1.5rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 14px;
    background:
        linear-gradient(
            145deg,
            rgba(255, 255, 255, 0.055),
            rgba(255, 255, 255, 0.025)
        );
    overflow: hidden;
}

.chart-layout {
    display: grid;
    grid-template-columns:
        minmax(260px, 1fr)
        minmax(220px, 0.8fr);
    align-items: center;
    gap: 2rem;
}

.chart-wrapper {
    position: relative;
    width: 100%;
    height: 320px;
    max-width: 360px;
    margin: 0 auto;
}

.chart-center {
    position: absolute;
    top: 50%;
    left: 50%;

    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    transform: translate(-50%, -50%);
    pointer-events: none;
    text-align: center;
}

.chart-center strong {
    color: white;
    font-size: 2.2rem;
    font-weight: 700;
    line-height: 1;
    letter-spacing: -0.05em;
}

.chart-center span {
    max-width: 100px;
    margin-top: 0.45rem;

    color:
        rgba(255, 255, 255, 0.4);

    font-size: 0.7rem;
    font-weight: 600;
    line-height: 1.3;
    letter-spacing: 0.08em;
    text-align: center;
    text-transform: uppercase;
}

.chart-legend {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;

    max-height: 280px;
    overflow-y: auto;

    padding-right: 0.35rem;
}

.chart-legend::-webkit-scrollbar {
    width: 4px;
}

.chart-legend::-webkit-scrollbar-track {
    background: transparent;
}

.chart-legend::-webkit-scrollbar-thumb {
    background:
        rgba(255, 255, 255, 0.15);
    border-radius: 999px;
}

.legend-item {
    display: flex;
    align-items: center;
    justify-content: space-between;

    width: 100%;

    gap: 1rem;
    padding: 0.65rem 0.75rem;

    border: 1px solid transparent;
    border-radius: 9px;

    background: transparent;

    color: inherit;
    font: inherit;
    text-align: left;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        opacity 0.2s ease;
}

.legend-item:hover {
    background:
        rgba(255, 255, 255, 0.04);

    border-color:
        rgba(255, 255, 255, 0.08);
}

.legend-item:focus-visible {
    outline: 2px solid
        rgba(255, 255, 255, 0.35);

    outline-offset: 2px;
}

.legend-item.is-hidden {
    opacity: 0.35;
}

.legend-item.is-hovered {
    background:
        rgba(255, 255, 255, 0.06);
    border-color:
        rgba(255, 255, 255, 0.12);
}

.legend-item.is-hovered .legend-grade {
    color: white;
}

.legend-item.is-hovered .legend-dot {
    transform: scale(1.25);
    box-shadow:
        0 0 0 4px
        rgba(255, 255, 255, 0.06);
}

.legend-left {
    display: flex;
    align-items: center;

    gap: 0.65rem;
    min-width: 0;
}

.legend-dot {
    width: 9px;
    height: 9px;

    flex-shrink: 0;

    border-radius: 50%;

    box-shadow:
        0 0 0 3px
        rgba(255, 255, 255, 0.025);

    transition:
        filter 0.2s ease,
        transform 0.2s ease,
        box-shadow 0.2s ease;
}

.legend-item.is-hidden
.legend-dot {
    filter: grayscale(1);
}

.legend-grade {
    color:
        rgba(255, 255, 255, 0.75);

    font-size: 0.85rem;
    font-weight: 600;
}

.legend-value {
    display: flex;
    align-items: baseline;

    gap: 0.45rem;
    white-space: nowrap;
}

.legend-value strong {
    color: white;

    font-size: 0.8rem;
    font-weight: 600;
}

.legend-value span {
    color:
        rgba(255, 255, 255, 0.35);

    font-size: 0.7rem;
}

.show-all-button {
    align-self: flex-start;

    margin-top: 0.5rem;
    padding: 0.45rem 0.7rem;

    border: 1px solid
        rgba(255, 255, 255, 0.1);

    border-radius: 7px;

    background:
        rgba(255, 255, 255, 0.03);

    color:
        rgba(255, 255, 255, 0.55);

    font-size: 0.7rem;
    font-weight: 600;

    cursor: pointer;

    transition:
        background 0.2s ease,
        color 0.2s ease,
        border-color 0.2s ease;
}

.show-all-button:hover {
    background:
        rgba(255, 255, 255, 0.06);

    border-color:
        rgba(255, 255, 255, 0.18);

    color: white;
}

.chart-hidden-state {
    position: absolute;
    top: 50%;
    left: 50%;

    display: flex;
    flex-direction: column;
    align-items: center;

    transform: translate(-50%, -50%);

    text-align: center;
}

.chart-hidden-state strong {
    color:
        rgba(255, 255, 255, 0.25);

    font-size: 2rem;
    font-weight: 400;
}

.chart-hidden-state span {
    margin-top: 0.35rem;

    color:
        rgba(255, 255, 255, 0.4);

    font-size: 0.75rem;
}

.chart-hidden-state button {
    margin-top: 0.8rem;

    padding: 0.45rem 0.7rem;

    border: 1px solid
        rgba(255, 255, 255, 0.1);

    border-radius: 7px;

    background:
        rgba(255, 255, 255, 0.03);

    color:
        rgba(255, 255, 255, 0.55);

    font-size: 0.7rem;
    font-weight: 600;

    cursor: pointer;
}

.empty-chart {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;

    min-height: 320px;

    text-align: center;
}

.empty-icon {
    display: flex;
    align-items: center;
    justify-content: center;

    width: 42px;
    height: 42px;

    margin-bottom: 1rem;

    border: 1px solid
        rgba(255, 255, 255, 0.12);

    border-radius: 50%;

    color:
        rgba(255, 255, 255, 0.35);

    font-size: 1.2rem;
}

.empty-chart p {
    margin: 0;

    color:
        rgba(255, 255, 255, 0.6);

    font-size: 0.9rem;
}

.empty-chart span {
    max-width: 280px;

    margin-top: 0.5rem;

    color:
        rgba(255, 255, 255, 0.3);

    font-size: 0.75rem;
    line-height: 1.5;
}

@media (max-width: 700px) {

    .chart-layout {
        grid-template-columns: 1fr;
        gap: 1.5rem;
    }

    .chart-wrapper {
        height: 280px;
        max-width: 320px;
    }

    .chart-legend {
        max-height: none;
        overflow-y: visible;
    }
}

@media (max-width: 450px) {

    .chart-card {
        padding: 1.25rem;
    }

    .chart-wrapper {
        height: 250px;
    }

    .chart-center strong {
        font-size: 1.9rem;
    }
}

</style>