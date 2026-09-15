<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getBoulder } from '@/services/boulderService'
import type { TestDTO } from '@/types/testDTO'

const data = ref<TestDTO | null>(null)

onMounted(async () => {
    data.value = await getBoulder()
})
</script>

<template>
    <div v-if="data">
        <p>{{ data.username }}</p>
        <p>Schwierigkeit: {{ data.maxGrade }}</p>
        <p>Versuchte Boulder: {{ data.totalTriedBoulders }}</p>
        <p>Geschaffte Boulder: {{ data.totalToppedBoulders }}</p>
    </div>

    <p v-else>
        Irgendwo ein SyntaxError :/...
    </p>
</template>