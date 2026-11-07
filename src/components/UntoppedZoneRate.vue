
<script setup lang="ts">
import type { components } from '@/types/schema'

import { computed } from 'vue'

type UntoppedGradeDistributionResponse =
  components['schemas']['UntoppedGradeDistributionResponseDTO']

const props = defineProps<{
  distribution: UntoppedGradeDistributionResponse
}>()

const totalUntopped = computed(() => {
  return props.distribution.totalUntopped ?? 0
})

const zoneCount = computed(() => {
  return props.distribution.zoneCount ?? 0
})

const zoneRate = computed(() => {
  return props.distribution.zoneRate ?? 0
})

function formatPercentage(
  percentage: number | undefined
): string {
  return (percentage ?? 0).toFixed(1)
}
</script>

<template>
  <div
    v-if="totalUntopped > 0"
    class="zone-indicator"
  >
    <div class="zone-indicator-bar">
      <div
        class="zone-indicator-fill"
        :style="{
          width: `${Math.min(100, Math.max(0, zoneRate))}%`
        }"
      ></div>
    </div>

    <span class="zone-indicator-value">
      {{ formatPercentage(zoneRate) }}%
    </span>

    <div class="zone-tooltip">
      Zonenquote: {{ zoneCount }}/{{ totalUntopped }}
      Zonen bei offenen Projekten
    </div>
  </div>
</template>

<style scoped>
.zone-indicator {
  display: flex;
  align-items: center;
  gap: 9px;
  cursor: help;
  position: relative;
}

.zone-indicator-bar {
  width: 65px;
  height: 6px;
  overflow: hidden;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.10);
}

.zone-indicator-fill {
  height: 100%;
  border-radius: inherit;
  background: rgba(234, 210, 8, 0.72);
  transition: width 300ms ease;
}

.zone-indicator-value {
  min-width: 42px;
  color: rgba(234, 210, 8, 0.72);
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  text-align: right;
}

.zone-tooltip {
  position: absolute;
  right: 0;
  bottom: calc(100% + 9px);
  z-index: 10;
  width: max-content;
  padding: 8px 11px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  background: #181818;
  color: rgba(255, 255, 255, 0.85);
  font-size: 14px;
  opacity: 0;
  visibility: hidden;
  transition: opacity 150ms ease;
  pointer-events: none;
}

.zone-indicator:hover .zone-tooltip {
  opacity: 1;
  visibility: visible;
}
</style>
