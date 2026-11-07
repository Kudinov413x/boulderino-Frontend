
<script setup lang="ts">
import { computed, ref } from 'vue'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
} from 'chart.js'

import type { ChartOptions, TooltipItem } from 'chart.js'
import { Bar } from 'vue-chartjs'
import type { components } from '@/types/schema'

type UntoppedGradeDistributionResponse =
  components['schemas']['UntoppedGradeDistributionResponseDTO']

type UntoppedGradeDistributionEntry =
  NonNullable<UntoppedGradeDistributionResponse['grades']>[number]

const props = defineProps<{
  distribution: UntoppedGradeDistributionResponse
}>()

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip
)

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

const grades = computed<UntoppedGradeDistributionEntry[]>(() => {
  return props.distribution.grades ?? []
})

const sortedGrades = computed(() => {
  return [...grades.value].sort(
    (a, b) =>
      getGradeDifficultyIndex(a.grade) -
      getGradeDifficultyIndex(b.grade)
  )
})

const visibleGrades = computed(() => {
  return sortedGrades.value.filter((entry) => {
    if (!entry.grade) return false
    return !hiddenGrades.value.has(entry.grade)
  })
})

const totalUntopped = computed(() => {
  return props.distribution.totalUntopped ?? 0
})

const visibleUntopped = computed(() => {
  return visibleGrades.value.reduce(
    (sum, entry) => sum + (entry.absoluteCount ?? 0),
    0
  )
})

const hasData = computed(() => totalUntopped.value > 0)
const hasVisibleGrades = computed(() => visibleGrades.value.length > 0)

const chartWrapperStyle = computed(() => {
  const height = Math.max(
    280,
    visibleGrades.value.length * 38 + 50
  )

  return {
    height: `${height}px`
  }
})

function getGradeDifficultyIndex(
  grade: string | undefined
): number {
  if (!grade) return Number.MAX_SAFE_INTEGER

  const index = gradeOrder.indexOf(grade)

  return index >= 0
    ? index
    : Number.MAX_SAFE_INTEGER
}

function getGradeColor(
  grade: string | undefined,
  alpha = 1
): string {
  const index = getGradeDifficultyIndex(grade)

  if (index === Number.MAX_SAFE_INTEGER) {
    return `oklch(0.60 0.05 210 / ${alpha})`
  }

  const maxIndex = Math.max(gradeOrder.length - 1, 1)
  const difficulty = index / maxIndex

  const lightness = 0.67 - (difficulty - 0.5) * 0.20
  const chroma = 0.20
  const hue = 42

  return `oklch(${lightness} ${chroma} ${hue} / ${alpha})`
}

function getChartGradeColor(
  grade: string | undefined
): string {
  if (
    hoveredGrade.value &&
    hoveredGrade.value !== grade
  ) {
    return getGradeColor(grade, 0.25)
  }

  return getGradeColor(grade, 0.95)
}

function formatPercentage(
  percentage: number | undefined
): string {
  return (percentage ?? 0).toFixed(1)
}

function isHidden(grade: string | undefined): boolean {
  if (!grade) return false

  return hiddenGrades.value.has(grade)
}

function toggleGrade(grade: string | undefined) {
  if (!grade) return

  const next = new Set(hiddenGrades.value)

  if (next.has(grade)) {
    next.delete(grade)
  } else {
    next.add(grade)
  }

  hiddenGrades.value = next
}

function showAllGrades() {
  hiddenGrades.value = new Set()
}

const chartData = computed(() => ({
  labels: visibleGrades.value.map(
    (entry) => entry.grade ?? ''
  ),

  datasets: [
    {
      data: visibleGrades.value.map(
        (entry) => entry.absoluteCount ?? 0
      ),

      backgroundColor: visibleGrades.value.map(
        (entry) => getChartGradeColor(entry.grade)
      ),

      borderColor: visibleGrades.value.map(() =>
        'rgba(255, 255, 255, 0.08)'
      ),

      borderWidth: 1,
      borderRadius: 6,
      borderSkipped: false,
      barThickness: 20,
      maxBarThickness: 24
    }
  ]
}))

const chartOptions = computed<ChartOptions<'bar'>>(() => ({
  responsive: true,
  maintainAspectRatio: false,

  indexAxis: 'y',

  animation: {
    duration: 600,
    easing: 'easeOutQuart'
  },

  scales: {
    x: {
      beginAtZero: true,
      grid: {
        color: 'rgba(255, 255, 255, 0.06)',
        drawBorder: false
      },
      border: {
        display: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.40)',
        precision: 0,
        font: {
          size: 11
        }
      },
      title: {
        display: true,
        text: 'Offene Projekte',
        color: 'rgba(255, 255, 255, 0.55)',
        font: {
          size: 11,
          weight: 600
        },
        padding: {
          top: 10
        }
      }
    },

    y: {
      grid: {
        display: false
      },
      border: {
        display: false
      },
      ticks: {
        color: 'rgba(255, 255, 255, 0.72)',
        font: {
          size: 12,
          weight: 600
        }
      }
    }
  },

  plugins: {
    legend: {
      display: false
    },

    tooltip: {
      backgroundColor: '#181818',
      titleColor: '#ffffff',
      bodyColor: 'rgba(255, 255, 255, 0.72)',
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderWidth: 1,
      padding: 12,
      displayColors: false,

      callbacks: {
        title(context: TooltipItem<'bar'>[]) {
          return context[0]?.label ?? ''
        },

        label(context: TooltipItem<'bar'>) {
          const entry =
            visibleGrades.value[context.dataIndex]

          if (!entry) return ''

          const count = entry.absoluteCount ?? 0
          const percentage = formatPercentage(entry.percentage)

          return ` ${count} offene Projekte · ${percentage}%`
        }
      }
    }
  }
}))
</script>

<template>
  <div class="grade-bar-chart">
    <div
      v-if="!hasData"
      class="distribution-fallback"
    >
      <div class="fallback-icon">
        —
      </div>

      <p>
        Keine offenen Projekte in dieser Session.
      </p>
    </div>

    <template v-else>
      <div
        v-if="!hasVisibleGrades"
        class="distribution-fallback"
      >
        <div class="fallback-icon">
          —
        </div>

        <p>
          Keine Grades ausgewählt.
        </p>

        <button
          type="button"
          class="show-all-button"
          @click="showAllGrades"
        >
          Alle Grades anzeigen
        </button>
      </div>

      <div
        v-else
        class="chart-layout"
      >
        <div
          class="chart-wrapper"
          :style="chartWrapperStyle"
        >
          <Bar
            :data="chartData"
            :options="chartOptions"
          />
        </div>

        <aside class="grade-legend">
          <div class="legend-header">
            <span class="legend-title">
              Grades
            </span>

            <span class="legend-total">
              {{ visibleUntopped }} / {{ totalUntopped }}
            </span>
          </div>

          <div class="legend-list">
            <button
              v-for="entry in sortedGrades"
              :key="entry.grade"
              type="button"
              class="legend-item"
              :class="{
                'is-hidden': isHidden(entry.grade)
              }"
              :aria-pressed="!isHidden(entry.grade)"
              @mouseenter="hoveredGrade = entry.grade"
              @mouseleave="hoveredGrade = undefined"
              @click="toggleGrade(entry.grade)"
            >
              <span
                class="legend-color"
                :style="{
                  backgroundColor: getGradeColor(entry.grade)
                }"
              ></span>

              <span class="legend-grade">
                {{ entry.grade }}
              </span>

              <span class="legend-value">
                {{ entry.absoluteCount ?? 0 }}
              </span>

              <span class="legend-percentage">
                {{ formatPercentage(entry.percentage) }}%
              </span>
            </button>
          </div>

          <button
            v-if="hiddenGrades.size > 0"
            class="show-all-button"
            type="button"
            @click="showAllGrades"
          >
            Alle Grades anzeigen
          </button>
        </aside>
      </div>
    </template>
  </div>
</template>

<style scoped>
.grade-bar-chart {
  width: 100%;
  min-width: 0;
}

.chart-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 230px;
  gap: 24px;
  align-items: start;
}

.chart-wrapper {
  position: relative;
  width: 100%;
  min-width: 0;
}

.grade-legend {
  min-width: 0;
  padding: 4px 0;
}

.legend-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 12px;
}

.legend-title {
  color: rgba(255, 255, 255, 0.85);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.legend-total {
  color: rgba(255, 255, 255, 0.35);
  font-size: 11px;
}

.legend-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
  max-height: 560px;
  overflow-y: auto;
  padding-right: 4px;
}

.legend-item {
  display: grid;
  grid-template-columns: 10px minmax(0, 1fr) auto auto;
  align-items: center;
  gap: 8px;
  width: 100%;
  min-height: 32px;
  padding: 6px 8px;
  border: 1px solid transparent;
  border-radius: 8px;
  background: transparent;
  color: inherit;
  text-align: left;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    border-color 160ms ease,
    opacity 160ms ease;
}

.legend-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.08);
}

.legend-item.is-hidden {
  opacity: 0.35;
}

.legend-color {
  width: 9px;
  height: 9px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-grade {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.72);
  font-size: 12px;
  font-weight: 600;
}

.legend-value {
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
}

.legend-percentage {
  min-width: 42px;
  color: rgba(255, 255, 255, 0.35);
  font-size: 10px;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.show-all-button {
  margin-top: 12px;
  padding: 7px 10px;
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.65);
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background-color 160ms ease,
    color 160ms ease,
    border-color 160ms ease;
}

.show-all-button:hover {
  background: rgba(255, 255, 255, 0.08);
  border-color: rgba(255, 255, 255, 0.16);
  color: rgba(255, 255, 255, 0.9);
}

.distribution-fallback {
  min-height: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: rgba(255, 255, 255, 0.45);
  text-align: center;
}

.distribution-fallback p {
  margin: 0;
  font-size: 13px;
}

.fallback-icon {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  color: rgba(255, 255, 255, 0.25);
  font-size: 20px;
}

@media (max-width: 900px) {
  .chart-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .grade-legend {
    padding-top: 0;
  }

  .legend-list {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    max-height: none;
  }
}

@media (max-width: 600px) {
  .legend-list {
    grid-template-columns: 1fr;
  }
}
</style>
