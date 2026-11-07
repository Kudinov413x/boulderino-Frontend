<script setup lang="ts">
import { computed, ref } from 'vue'

import { Bar } from 'vue-chartjs'

import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
} from 'chart.js'

import type { ChartData, ChartOptions } from 'chart.js'
import type { components } from '@/types/schema'

type GradeStatsResponse = components['schemas']['GradeStatsResponseDTO']

const props = defineProps<{
    stats: GradeStatsResponse[]
}>()

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
)

const activeView = ref<'tops' | 'rates' | 'tries'>('tops')

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

const sortedStats = computed(() => {
    return [...props.stats].sort(
        (a, b) =>
        gradeOrder.indexOf(a.grade ?? '') -
        gradeOrder.indexOf(b.grade ?? '')
    )
})

const labels = computed(() =>
    sortedStats.value.map(stat => stat.grade ?? '')
)

const colors = {
    blue: {
        background: 'rgba(59, 130, 246, 0.72)',
        border: 'rgba(96, 165, 250, 1)'
    },

    orange: {
        background: 'rgba(249, 115, 22, 0.72)',
        border: 'rgba(251, 146, 60, 1)'
    },

    green: {
        background: 'rgba(34, 197, 94, 0.72)',
        border: 'rgba(74, 222, 128, 1)'
    },

    purple: {
        background: 'rgba(168, 85, 247, 0.72)',
        border: 'rgba(192, 132, 252, 1)'
    },
    yellow: {
        background: 'rgba(234, 210, 8, 0.72)',
        border: 'rgba(250, 204, 21, 1)'
    }
}

const chartData = computed<ChartData<'bar'>>(() => {
    switch (activeView.value) {
        case 'rates':
            return {
                labels: labels.value,

                datasets: [
                    {
                        label: 'Erfolgsquote',

                        data: sortedStats.value.map( stat => stat.successRate ?? 0 ),

                        backgroundColor: colors.green.background,
                        borderColor: colors.green.border,

                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: ' Flashquote',

                        data: sortedStats.value.map( stat => stat.flashRate ?? 0 ),

                        backgroundColor: colors.purple.background,
                        borderColor: colors.purple.border,

                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            }

        case 'tries':
            return {
                labels: labels.value,

                datasets: [
                    {
                        label: 'Ø Versuche bis zum Top',
                        data: sortedStats.value.map( stat => stat.averageAttemptsUntilTop ?? 0 ),
                        backgroundColor: colors.green.background,
                        borderColor: colors.green.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Ø Anzahl von Versuchen bei offenen Projekten',
                        data: sortedStats.value.map( stat => stat.averageTriesOnOpenProjects ?? 0 ),
                        backgroundColor: colors.orange.background,
                        borderColor: colors.orange.border,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            }

        case 'tops':
        default:
            return {
                labels: labels.value,
                datasets: [
                    {
                        label: 'Geboulderte Boulder',
                        data: sortedStats.value.map( stat => stat.amountOfTriedBoulders ?? 0),
                        backgroundColor: colors.blue.background,
                        borderColor: colors.blue.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Tops',
                        data: sortedStats.value.map(stat => stat.amountOfTops ?? 0),
                        backgroundColor: colors.green.background,
                        borderColor: colors.green.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },
    
                    {
                        label: 'Flashes',
                        data: sortedStats.value.map(
                            stat => stat.amountOfFlashes ?? 0
                        ),
                        backgroundColor: colors.purple.background,
                        borderColor: colors.purple.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Offene Projekte',
                        data: sortedStats.value.map( stat => stat.openProjects ?? 0 ),
                        backgroundColor: colors.orange.background,
                        borderColor: colors.orange.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Erreichte Zonen bei offenen Projekten',
                        data: sortedStats.value.map(
                            stat => stat.amountOfZones ?? 0
                        ),
                        backgroundColor: colors.yellow.background,
                        borderColor: colors.yellow.border,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            }
        }
})

const yAxisLabel = computed(() => {
    switch (activeView.value) {
        case 'rates':
        return 'Prozent'

        case 'tries':
        return 'Versuche'

        case 'tops':
        default:
        return 'Anzahl'
    }
})

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,

    interaction: {
        mode: 'index',
        intersect: false
    },

    scales: {
        x: {
        stacked: false,

        grid: {
            display: false
        },

        ticks: {
            color: 'rgba(255, 255, 255, 0.65)',

            font: {
            size: 11
            },

            maxRotation: 45,
            minRotation: 0
        },

        border: {
            color: 'rgba(255, 255, 255, 0.12)'
        }
        },

        y: {
        stacked: false,

        beginAtZero: true,

        suggestedMax:
            activeView.value === 'rates'
            ? 100
            : undefined,

        grid: {
            color: 'rgba(255, 255, 255, 0.08)'
        },

        ticks: {
            color: 'rgba(255, 255, 255, 0.55)',

            font: {
            size: 11
            },

            callback: value => {
            if (activeView.value === 'rates') {
                return `${value}%`
            }

            return value
            }
        },

        title: {
            display: true,

            text: yAxisLabel.value,

            color: 'rgba(255, 255, 255, 0.55)',

            font: {
            size: 11,
            weight: 'normal'
            }
        },

        border: {
            color: 'rgba(255, 255, 255, 0.12)'
        }
        }
    },

    plugins: {
        legend: {
        position: 'bottom',

        labels: {
            color: 'rgba(255, 255, 255, 0.7)',

            usePointStyle: true,
            pointStyle: 'rect',

            padding: 20,

            font: {
            size: 11
            }
        }
        },

        tooltip: {
            position: 'average',
            yAlign: 'bottom',
            xAlign: 'center',
            caretPadding: 50,
            backgroundColor: '#181818',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: 'rgba(255, 255, 255, 0.75)',
            padding: 10,
            callbacks: {
                label: context => {
                const value = context.raw as number

                if (activeView.value === 'rates') {
                    return `${context.dataset.label}: ${value.toFixed(1)}%`
                }

                if (activeView.value === 'tries') {
                    return `${context.dataset.label}: ${value.toFixed(1)}`
                }

                return `${context.dataset.label}: ${value}`
                }
            }
        }
    }
}))
</script>

<template>
    <div class="grade-chart-wrapper">
        <div class="chart-header">
        <div class="chart-switcher">
            <button
            type="button"
            :class="{ active: activeView === 'tops' }"
            @click="activeView = 'tops'"
            >
            Tops
            </button>

            <button
            type="button"
            :class="{ active: activeView === 'rates' }"
            @click="activeView = 'rates'"
            >
            Rates
            </button>

            <button
            type="button"
            :class="{ active: activeView === 'tries' }"
            @click="activeView = 'tries'"
            >
            Tries
            </button>
        </div>
        </div>

        <div class="grade-chart-scroll">
        <div class="grade-chart">
            <Bar
            :data="chartData"
            :options="chartOptions"
            />
        </div>
        </div>
    </div>
</template>

<style scoped>
.grade-chart-wrapper {
    width: 100%;
}

.chart-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.chart-switcher {
    display: inline-flex;
    gap: 4px;
    padding: 4px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.025);
}

.chart-switcher button {
    appearance: none;
    border: 0;
    outline: none;
    padding: 7px 13px;
    border-radius: 7px;
    background: transparent;
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    cursor: pointer;
    transition:
        background 0.15s ease,
        color 0.15s ease;
}

.chart-switcher button:hover {
    color: rgba(255, 255, 255, 0.8);
}

.chart-switcher button.active {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
}

.grade-chart-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

.grade-chart {
    min-width: 1100px;
    height: 460px;
}
</style>