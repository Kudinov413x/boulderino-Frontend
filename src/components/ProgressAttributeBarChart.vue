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

type AttributeStatsResponse =
    components['schemas']['AttributeStatsResponseDTO']

type BoulderAttribute =
    | 'GRIP_TYPE'
    | 'WALL_ANGLE'
    | 'CLIMBING_STYLE'
    | 'ROUTE_CHARACTER'

const props = defineProps<{
    stats: AttributeStatsResponse[]
}>()

const emit = defineEmits<{
    attributeChange: [attribute: BoulderAttribute]
}>()

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Tooltip,
    Legend
)

const activeAttribute = ref<BoulderAttribute>('GRIP_TYPE')

const activeView = ref<
    'tops' |
    'rates' |
    'tries' |
    'grades'
>('tops')

const attributeTypes: BoulderAttribute[] = [
    'GRIP_TYPE',
    'WALL_ANGLE',
    'CLIMBING_STYLE',
    'ROUTE_CHARACTER'
]

const attributeLabels: Record<BoulderAttribute, string> = {
    GRIP_TYPE: 'Griffart',
    WALL_ANGLE: 'Wandtyp',
    CLIMBING_STYLE: 'Kletterstil',
    ROUTE_CHARACTER: 'Routencharakter'
}

const attributeOrder: Record<BoulderAttribute, string[]> = {
    GRIP_TYPE: [
        'CRIMP',
        'JUG',
        'SLOPER',
        'PINCH',
        'POCKET',
        'VOLUME',
        'UNDERCLING',
        'SIDEPULL'
    ],

    WALL_ANGLE: [
        'SLAB',
        'VERTICAL',
        'OVERHANG',
        'ROOF',
        'DIHEDRAL',
        'ARETE'
    ],

    CLIMBING_STYLE: [
        'STATIC',
        'DYNAMIC',
        'NEUTRAL'
    ],

    ROUTE_CHARACTER: [
        'TECHNICAL',
        'PHYSICAL',
        'BALANCE',
        'NEUTRAL'
    ]
}

const displayLabels: Record<string, string> = {
    CRIMP: 'Crimp',
    JUG: 'Jug',
    SLOPER: 'Sloper',
    PINCH: 'Pinch',
    POCKET: 'Pocket',
    VOLUME: 'Volume',
    UNDERCLING: 'Undercling',
    SIDEPULL: 'Sidepull',

    SLAB: 'Slab',
    VERTICAL: 'Vertikal',
    OVERHANG: 'Überhang',
    ROOF: 'Dach',
    DIHEDRAL: 'Diedre',
    ARETE: 'Arete',

    STATIC: 'Statisch',
    DYNAMIC: 'Dynamisch',
    NEUTRAL: 'Neutral',

    TECHNICAL: 'Technisch',
    PHYSICAL: 'Physisch',
    BALANCE: 'Balance'
}

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
        background: 'rgba(234, 179, 8, 0.72)',
        border: 'rgba(250, 204, 21, 1)'
    }
}

const gradeValues: Record<string, number> = {
    '1': 1,
    '1+': 2,
    '2': 3,
    '2+': 4,
    '3': 5,
    '3+': 6,
    '4': 7,
    '4+': 8,
    '5': 9,
    '5+': 10,
    '6': 11,
    '6+': 12,
    '6a': 13,
    '6b': 14,
    '6c': 15,
    '7': 16,
    '7+': 17,
    '7a': 18,
    '7b': 19,
    '7c': 20,
    '8': 21,
    '8+': 22
}

const gradeLabels: Record<number, string> = {
    1: 'FB1',
    2: 'FB1+',
    3: 'FB2',
    4: 'FB2+',
    5: 'FB3',
    6: 'FB3+',
    7: 'FB4',
    8: 'FB4+',
    9: 'FB5',
    10: 'FB5+',
    11: 'FB6',
    12: 'FB6+',
    13: 'FB6A',
    14: 'FB6B',
    15: 'FB6C',
    16: 'FB7',
    17: 'FB7+',
    18: 'FB7A',
    19: 'FB7B',
    20: 'FB7C',
    21: 'FB8',
    22: 'FB8+'
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

    const normalizedGrade = grade.trim().toLowerCase()

    if (!normalizedGrade) {
        return 0
    }

    return gradeValues[normalizedGrade] ?? 0
}

function formatGradeValue(value: number): string {
    return gradeLabels[Math.round(value)] ?? ''
}



const sortedStats = computed(() => {
    const order = attributeOrder[activeAttribute.value]

    return [...props.stats].sort((a, b) => {
        const aIndex = order.indexOf(a.attribute ?? '')
        const bIndex = order.indexOf(b.attribute ?? '')

        return aIndex - bIndex
    })
})

const labels = computed(() =>
    sortedStats.value.map(stat =>
        displayLabels[stat.attribute ?? ''] ??
        stat.attribute ??
        ''
    )
)

const chartData = computed<ChartData<'bar'>>(() => {

    switch (activeView.value) {

        case 'rates':
            return {
                labels: labels.value,

                datasets: [
                    {
                        label: 'Erfolgsquote',

                        data: sortedStats.value.map(
                            stat => stat.successRate ?? 0
                        ),

                        backgroundColor: colors.green.background,
                        borderColor: colors.green.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Flashquote',

                        data: sortedStats.value.map(
                            stat => stat.flashRate ?? 0
                        ),

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

                        data: sortedStats.value.map(
                            stat =>
                                stat.averageAttemptsUntilTop ?? 0
                        ),

                        backgroundColor: colors.green.background,
                        borderColor: colors.green.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Ø Versuche bei offenen Projekten',

                        data: sortedStats.value.map(
                            stat =>
                                stat.averageTriesOnOpenProjects ?? 0
                        ),

                        backgroundColor: colors.orange.background,
                        borderColor: colors.orange.border,
                        borderWidth: 1,
                        borderRadius: 4
                    }
                ]
            }

        case 'grades':
            return {
                labels: labels.value,

                datasets: [
                    {
                        label: 'Max. Top-Grade',

                        data: sortedStats.value.map(
                            stat => getGradeValue(stat.maxGrade)
                        ),

                        backgroundColor: colors.blue.background,
                        borderColor: colors.blue.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Ø Top-Grade',

                        data: sortedStats.value.map(
                            stat => getGradeValue(stat.avgGrade)
                        ),

                        backgroundColor: colors.green.background,
                        borderColor: colors.green.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Ø Grade bei offenen Projekten',

                        data: sortedStats.value.map(
                            stat =>
                                getGradeValue(
                                    stat.avgGradeOnOpenProjects
                                )
                        ),

                        backgroundColor: colors.orange.background,
                        borderColor: colors.orange.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Höchster Zone-Grade bei offenen Projekten',

                        data: sortedStats.value.map(
                            stat =>
                                getGradeValue(
                                    stat.highestProjectZoneGrade
                                )
                        ),

                        backgroundColor: colors.yellow.background,
                        borderColor: colors.yellow.border,
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

                        data: sortedStats.value.map(
                            stat =>
                                stat.amountOfTriedBoulders ?? 0
                        ),

                        backgroundColor: colors.blue.background,
                        borderColor: colors.blue.border,
                        borderWidth: 1,
                        borderRadius: 4
                    },

                    {
                        label: 'Tops',

                        data: sortedStats.value.map(
                            stat => stat.amountOfTops ?? 0
                        ),

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

                        data: sortedStats.value.map(
                            stat => stat.openProjects ?? 0
                        ),

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

        case 'grades':
            return 'Bouldergrad'

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

            beginAtZero: activeView.value !== 'grades',

            min:
                activeView.value === 'grades'
                    ? 1
                    : undefined,

            max:
                activeView.value === 'grades'
                    ? 22
                    : undefined,

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

                stepSize:
                    activeView.value === 'grades'
                        ? 1
                        : undefined,

                callback: value => {

                    if (activeView.value === 'rates') {
                        return `${value}%`
                    }

                    if (activeView.value === 'grades') {
                        return formatGradeValue(
                            Number(value)
                        )
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

                    if (activeView.value === 'grades') {
                        const grade = formatGradeValue(value)

                        return `${context.dataset.label}: ${grade || '–'}`
                    }

                    return `${context.dataset.label}: ${value}`
                }
            }
        }
    }
}))

function changeAttribute(attribute: BoulderAttribute) {
    activeAttribute.value = attribute
    emit('attributeChange', attribute)
}

</script>

<template>

    <div class="attribute-chart-wrapper">

        <div class="chart-header">

            <div class="toggle-groups">

                <div class="toggle-group">

                    <span class="toggle-label">
                        Attribut
                    </span>

                    <div class="chart-switcher">

                        <button
                            v-for="attribute in attributeTypes"
                            :key="attribute"
                            type="button"
                            :class="{
                                active:
                                    activeAttribute === attribute
                            }"
                            @click="changeAttribute(attribute)"
                        >
                            {{ attributeLabels[attribute] }}
                        </button>

                    </div>

                </div>

                <div class="toggle-group">

                    <span class="toggle-label">
                        Ansicht
                    </span>

                    <div class="chart-switcher">

                        <button
                            type="button"
                            :class="{
                                active: activeView === 'tops'
                            }"
                            @click="activeView = 'tops'"
                        >
                            Tops
                        </button>

                        <button
                            type="button"
                            :class="{
                                active: activeView === 'rates'
                            }"
                            @click="activeView = 'rates'"
                        >
                            Rates
                        </button>

                        <button
                            type="button"
                            :class="{
                                active: activeView === 'tries'
                            }"
                            @click="activeView = 'tries'"
                        >
                            Tries
                        </button>

                        <button
                            type="button"
                            :class="{
                                active: activeView === 'grades'
                            }"
                            @click="activeView = 'grades'"
                        >
                            Grades
                        </button>

                    </div>

                </div>

            </div>

        </div>

        <div class="attribute-chart-scroll">

            <div class="attribute-chart">

                <Bar
                    :data="chartData"
                    :options="chartOptions"
                />

            </div>

        </div>

    </div>

</template>

<style scoped>

.attribute-chart-wrapper {
    width: 100%;
}

.chart-header {
    display: flex;
    justify-content: flex-end;
    margin-bottom: 20px;
}

.toggle-groups {
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-end;
    gap: 1rem;
}

.toggle-group {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.toggle-label {
    color: rgba(255, 255, 255, 0.4);
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
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

.attribute-chart-scroll {
    width: 100%;
    overflow-x: auto;
    overflow-y: hidden;
}

.attribute-chart {
    min-width: 1100px;
    height: 460px;
}

@media (max-width: 900px) {

    .chart-header {
        justify-content: flex-start;
    }

    .toggle-groups {
        justify-content: flex-start;
        width: 100%;
    }

    .toggle-group {
        flex-direction: column;
        align-items: flex-start;
    }
}

</style>