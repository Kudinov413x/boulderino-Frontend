<script setup lang="ts">
import { computed } from 'vue'
import {
    Chart as ChartJS,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
} from 'chart.js'
import { Line } from 'vue-chartjs'
import type { ChartData, ChartOptions } from 'chart.js'
import type { components } from '@/types/schema'

ChartJS.register(
    LinearScale,
    PointElement,
    LineElement,
    Tooltip
)

type MaxGradeOverTime =
    components['schemas']['MaxGradeOverTimeDTO']

const props = defineProps<{
    entries: MaxGradeOverTime[]
}>()

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

function getGradeDifficultyIndex(
    grade: string | undefined
): number {
    if (!grade) {
        return 0
    }

    return Math.max(gradeOrder.indexOf(grade), 0)
}

function parseDate(date: string): Date {
    const parts = date.split('-')

    if (parts.length === 3) {
        const year = Number(parts[0])
        const month = Number(parts[1])
        const day = Number(parts[2])

        return new Date(year, month - 1, day)
    }

    return new Date(date)
}

function formatDate(date: string): string {
    return parseDate(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
    })
}

function formatShortDate(date: string): string {
    return parseDate(date).toLocaleDateString('de-DE', {
        day: '2-digit',
        month: '2-digit'
    })
}

type ChartPoint = {
    x: number
    y: number
    isTodayExtension?: boolean
}

type EventPoint = ChartPoint & {
    grade: string
    date: string
}

const eventPoints = computed<EventPoint[]>(() => {
    return props.entries
        .filter(
            (
                entry
            ): entry is MaxGradeOverTime & {
                date: string
                maxGrade: string
            } =>
                entry.date !== undefined &&
                entry.date !== null &&
                entry.maxGrade !== undefined &&
                entry.maxGrade !== null
        )
        .map(entry => ({
            x: parseDate(entry.date).getTime(),
            y: getGradeDifficultyIndex(entry.maxGrade),
            grade: entry.maxGrade,
            date: entry.date
        }))
})

const linePoints = computed<ChartPoint[]>(() => {
    const events = eventPoints.value

    if (events.length === 0) {
        return []
    }

    const points: ChartPoint[] = events.map(event => ({
        x: event.x,
        y: event.y,
        isTodayExtension: false
    }))

    const lastEvent = events[events.length - 1]

    if (!lastEvent) {
        return points
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const todayTimestamp = today.getTime()

    if (lastEvent.x < todayTimestamp) {
        points.push({
            x: todayTimestamp,
            y: lastEvent.y,
            isTodayExtension: true
        })
    }

    return points
})

const chartData = computed<ChartData<'line'>>(() => {
    return {
        datasets: [
            {
                label: 'Max Grade',

                data: linePoints.value,

                stepped: 'before',

                borderWidth: 2,

                borderColor: '#ffffff',

                backgroundColor: 'transparent',

                pointRadius: context => {
                    const point = linePoints.value[context.dataIndex]

                    return point?.isTodayExtension ? 4 : 5
                },

                pointHoverRadius: context => {
                    const point = linePoints.value[context.dataIndex]

                    return point?.isTodayExtension ? 6 : 7
                },

                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#0f0f0f',
                pointBorderWidth: 2,
                pointHoverBackgroundColor: '#ffffff',
                pointHoverBorderColor: '#ffffff',
                pointHoverBorderWidth: 2,
                tension: 0,
                fill: false
            }
        ]
    }
})

const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,

    maintainAspectRatio: false,

    layout: {
        padding: {
            top: 12,
            bottom: 12,
            left: 0,
            right: 0
        }
    },

    interaction: {
        mode: 'nearest',
        intersect: true
    },

    plugins: {
        legend: {
            display: false
        },

        tooltip: {
            displayColors: false,

            backgroundColor: '#181818',

            borderColor: 'rgba(255, 255, 255, 0.12)',

            borderWidth: 1,

            padding: 12,

            titleColor: '#ffffff',

            bodyColor: 'rgba(255, 255, 255, 0.75)',

            callbacks: {
                title: items => {
                    const index = items[0]?.dataIndex

                    if (index === undefined) {
                        return ''
                    }

                    const point = linePoints.value[index]

                    if (!point) {
                        return ''
                    }

                    if (point.isTodayExtension) {
                        const today = new Date()

                        return today.toLocaleDateString('de-DE', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                        })
                    }

                    const entry = eventPoints.value[index]

                    return entry
                        ? formatDate(entry.date)
                        : ''
                },

                label: context => {
                    const index = context.dataIndex

                    const point = linePoints.value[index]

                    if (!point) {
                        return ''
                    }

                    if (point.isTodayExtension) {
                        const lastEvent =
                            eventPoints.value[eventPoints.value.length - 1]

                        if (!lastEvent) {
                            return ''
                        }

                        return [
                            `MaxGrade: ${lastEvent.grade}`,
                            `seit ${formatDate(lastEvent.date)}`
                        ]
                    }

                    const entry = eventPoints.value[index]

                    if (!entry) {
                        return ''
                    }

                    return `MaxGrade: ${entry.grade}`
                }
            }
        }
    },

    scales: {
        x: {
            type: 'linear',

            grid: {
                display: false
            },

            border: {
                display: false
            },

            ticks: {
                color: 'rgba(255, 255, 255, 0.45)',

                maxTicksLimit: 6,

                callback: value => {
                    const timestamp = Number(value)

                    if (!Number.isFinite(timestamp)) {
                        return ''
                    }

                    return formatShortDate(
                        new Date(timestamp)
                            .toISOString()
                            .slice(0, 10)
                    )
                }
            }
        },

        y: {
            min: -0.5,

            max: gradeOrder.length - 0.5,

            grid: {
                color: 'rgba(255, 255, 255, 0.06)',

                drawTicks: false
            },

            border: {
                display: false
            },

            ticks: {
                color: 'rgba(255, 255, 255, 0.55)',

                padding: 10,


                callback: value => {
                    const index = Number(value)

                    return gradeOrder[index] ?? ''
                }
            }
        }
    }
}))

const firstEntry = computed(() => {
    return props.entries[0] ?? null
})

const latestEntry = computed(() => {
    return props.entries[props.entries.length - 1] ?? null
})
</script>

<template>
    <div class="max-grade-timeline">
        <div
            v-if="entries.length"
            class="timeline-header"
        >
            <div>
                <div class="timeline-summary">
                    <span v-if="firstEntry">
                        Start:
                        <strong>
                            {{ firstEntry.maxGrade }}
                        </strong>
                    </span>

                    <span class="timeline-arrow">
                        →
                    </span>

                    <span v-if="latestEntry">
                        Aktuell:
                        <strong>
                            {{ latestEntry.maxGrade }}
                        </strong>
                    </span>
                </div>
            </div>
        </div>

        <div
            v-if="entries.length"
            class="chart-container"
        >
            <Line
                :data="chartData"
                :options="chartOptions"
            />
        </div>

        <div
            v-else
            class="empty-state"
        >
            <span>
                Noch keine MaxGrade-Entwicklung vorhanden.
            </span>
        </div>
    </div>
</template>

<style scoped>
.max-grade-timeline {
    width: 100%;
}

.timeline-header {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 1rem;

    margin-bottom: 1.5rem;
}

.timeline-label {
    display: block;

    margin-bottom: 0.45rem;

    font-size: 0.68rem;
    font-weight: 700;

    letter-spacing: 0.12em;

    color: rgba(255, 255, 255, 0.38);
}

.timeline-summary {
    display: flex;
    align-items: center;

    gap: 0.55rem;

    font-size: 0.85rem;

    color: rgba(255, 255, 255, 0.5);
}

.timeline-summary strong {
    color: rgba(255, 255, 255, 0.9);

    font-weight: 600;
}

.timeline-arrow {
    color: rgba(255, 255, 255, 0.25);
}

.chart-container {
    position: relative;

    width: 100%;

    height: 340px;
}

.empty-state {
    display: flex;
    align-items: center;
    justify-content: center;

    min-height: 220px;

    border: 1px dashed rgba(255, 255, 255, 0.1);

    border-radius: 12px;

    color: rgba(255, 255, 255, 0.35);

    font-size: 0.85rem;
}

@media (max-width: 700px) {
    .timeline-header {
        align-items: flex-start;
    }

    .timeline-summary {
        flex-wrap: wrap;
    }

    .chart-container {
        height: 280px;
    }
}
</style>