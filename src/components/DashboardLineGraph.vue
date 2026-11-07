<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
} from 'chart.js'
import type { ChartData, ChartOptions } from 'chart.js'

import { getProgressOverTime } from '@/services/progressService'
import type { components } from '@/types/schema'

type ProgressOverTimeResponse =
    components['schemas']['ProgressOverTimeResponseDTO']

type ProgressOverTimePoint =
    NonNullable<ProgressOverTimeResponse['sessions']>[number]

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Tooltip,
    Legend
)

const sessions = ref<ProgressOverTimePoint[]>([])
const loading = ref(false)
const error = ref('')

const gradeLabels = new Map<number, string>([
    [1, '1'],
    [2, '1+'],
    [3, '2'],
    [4, '2+'],
    [5, '3'],
    [6, '3+'],
    [7, '4'],
    [8, '4+'],
    [9, '5'],
    [10, '5+'],
    [11, '6'],
    [12, '6+'],
    [13, '6a'],
    [14, '6b'],
    [15, '6c'],
    [16, '7'],
    [17, '7+'],
    [18, '7a'],
    [19, '7b'],
    [20, '7c'],
    [21, '8'],
    [22, '8+']
])

function formatDate(dateString: string): string {
    const date = new Date(`${dateString}T00:00:00`)

    return new Intl.DateTimeFormat('de-DE', {
        day: '2-digit',
        month: '2-digit',
        year: '2-digit'
    }).format(date)
}

async function fetchProgress(): Promise<void> {
    loading.value = true
    error.value = ''

    try {
        const response = await getProgressOverTime()

        sessions.value = [...(response.sessions ?? [])]
            .filter(
                (session): session is typeof session & { date: string } =>
                    typeof session.date === 'string'
            )
            .sort((a, b) => a.date.localeCompare(b.date))
    } catch (err) {
        console.error('Fehler beim Laden des Dashboard-Fortschritts:', err)
        error.value = 'Die Fortschrittsdaten konnten nicht geladen werden.'
    } finally {
        loading.value = false
    }
}

const chartData = computed<ChartData<'line'>>(() => ({
    labels: sessions.value.map(session => formatDate(session.date ?? '')),
    datasets: [
        {
            label: 'Höchster getoppter Grad',
            data: sessions.value.map(session => session.maxGradeValue ?? null),
            borderColor: '#4ade80',
            backgroundColor: '#4ade80',
            pointBackgroundColor: '#4ade80',
            tension: 0.25,
            spanGaps: false
        },
        {
            label: 'Höchster Flash-Grad',
            data: sessions.value.map(session => session.maxFlashGradeValue ?? null),
            borderColor: 'rgba(168, 85, 247, 0.72)',
            backgroundColor: 'rgba(168, 85, 247, 0.72)',
            pointBackgroundColor: 'rgba(168, 85, 247, 0.72)',
            tension: 0.25,
            spanGaps: false
        },
        {
            label: 'Höchster Projekt-Zone-Grad',
            data: sessions.value.map(
                session => session.maxProjectZoneGradeValue ?? null
            ),
            borderColor: 'rgba(249, 115, 22, 0.72)',
            backgroundColor: 'rgba(249, 115, 22, 0.72)',
            pointBackgroundColor: 'rgba(249, 115, 22, 0.72)',
            tension: 0.25,
            spanGaps: false
        }
    ]
}))

const chartOptions = computed<ChartOptions<'line'>>(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
        mode: 'index',
        intersect: false
    },
    scales: {
        x: {
            grid: {
                display: false
            },
            ticks: {
                color: 'rgba(255, 255, 255, 0.6)',
                maxRotation: 45
            },
            border: {
                color: 'rgba(255, 255, 255, 0.12)'
            }
        },
        y: {
            min: 1,
            max: 22,
            ticks: {
                stepSize: 1,
                color: 'rgba(255, 255, 255, 0.6)',
                callback: value => gradeLabels.get(Number(value)) ?? ''
            },
            grid: {
                color: 'rgba(255, 255, 255, 0.08)'
            },
            title: {
                display: true,
                text: 'Schwierigkeitsgrad',
                color: 'rgba(255, 255, 255, 0.55)'
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
                padding: 20
            }
        },
        tooltip: {
            backgroundColor: '#181818',
            borderColor: 'rgba(255, 255, 255, 0.12)',
            borderWidth: 1,
            titleColor: '#fff',
            bodyColor: 'rgba(255, 255, 255, 0.8)',
            callbacks: {
                label: context => {
                    const value = context.parsed.y
                    const grade = value === null
                        ? null
                        : gradeLabels.get(value)

                    return `${context.dataset.label}: ${grade ?? 'Keine Daten'}`
                }
            }
        }
    }
}))

onMounted(fetchProgress)
</script>

<template>
    <section class="dashboard-line-graph">
        <div class="graph-header">
            <div>
                <h3>Kletterfortschritt</h3>
                <p class="subtitle">Deine höchsten Grade pro Session</p>
            </div>
        </div>

        <p v-if="loading" class="status">
            Fortschrittsdaten werden geladen ...
        </p>

        <p v-else-if="error" class="error-message">
            {{ error }}
        </p>

        <p v-else-if="sessions.length === 0" class="status">
            Noch keine Fortschrittsdaten vorhanden.
        </p>

        <div v-else class="chart-container">
            <Line
                :data="chartData"
                :options="chartOptions"
                aria-label="Kletterfortschritt im Zeitverlauf"
            />
        </div>
    </section>
</template>

<style scoped>
.dashboard-line-graph {
    width: 100%;
    padding: 22px;
    box-sizing: border-box;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.025);
    color: #fff;
}

.graph-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 16px;
    margin-bottom: 22px;
}

.graph-header h3 {
    margin: 0;
    color: #fff;
    font-size: 1.1rem;
    font-weight: 650;
}

.subtitle {
    margin: 6px 0 0;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
}

.chart-container {
    position: relative;
    width: 100%;
    height: 300px;
}

.status {
    padding: 28px 8px;
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
}

.error-message {
    padding: 12px;
    border-radius: 8px;
    background: rgba(255, 100, 100, 0.08);
    color: #ff8a8a;
}

@media (max-width: 600px) {
    .dashboard-line-graph {
        padding: 16px;
    }

    .graph-header {
        align-items: flex-start;
    }

    .chart-container {
        height: 260px;
    }
}
</style>