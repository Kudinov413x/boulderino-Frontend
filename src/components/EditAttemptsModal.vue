<script setup lang="ts">

import { ref } from 'vue'

import { updateAttempt } from '@/services/attemptsService'

import type { components } from '@/types/schema'


type SessionDetailsResponseDTO = components['schemas']['SessionDetailsResponseDTO']

type AttemptsResponseDTO = components['schemas']['AttemptsResponseDTO']


const props = defineProps<{
    attempt: SessionDetailsResponseDTO
    sessionId: number
}>()


const emit = defineEmits<{
    close: []
    updated: []
}>()


const tries = ref(props.attempt.tries ?? 0)
const done = ref(props.attempt.done ?? false)
const zone = ref(props.attempt.zone ?? false)

const updating = ref(false)
const error = ref<string | null>(null)


async function handleUpdateAttempt() {

    error.value = null

    if (props.attempt.attemptId === undefined) {

        error.value = 'Attempt-ID fehlt.'
        return

    }

    if (props.attempt.boulderId === undefined) {

        error.value = 'Boulder-ID fehlt.'
        return

    }

    updating.value = true

    try {

        const request: AttemptsResponseDTO = {
            id: props.attempt.attemptId,
            tries: tries.value,
            done: done.value,
            zone: zone.value,
            sessionId: props.sessionId,
            boulderId: props.attempt.boulderId
        }

        await updateAttempt(
            props.attempt.attemptId,
            request
        )

        emit('updated')
        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Attempt konnte nicht aktualisiert werden.'

    } finally {

        updating.value = false

    }

}


function closeModal() {

    if (updating.value) {
        return
    }

    emit('close')

}

</script>


<template>

    <div
        class="modal-backdrop"
        @click.self="closeModal"
    >

        <div class="modal">

            <header class="modal-header">

                <div>

                    <p class="eyebrow">
                        ATTEMPT
                    </p>

                    <h2>
                        {{ attempt.boulderName }}
                    </h2>

                    <p class="subtitle">
                        {{ attempt.grade }}
                    </p>

                </div>

                <button
                    class="close-button"
                    type="button"
                    :disabled="updating"
                    @click="closeModal"
                >
                    ×
                </button>

            </header>


            <section class="modal-content">

                <div
                    v-if="error"
                    class="error"
                >
                    {{ error }}
                </div>


                <label class="field">

                    <span>
                        Versuche
                    </span>

                    <input
                        v-model.number="tries"
                        type="number"
                        min="0"
                    >

                </label>


                <label class="checkbox-field">

                    <input
                        v-model="done"
                        type="checkbox"
                    >

                    <span>
                        Top geschafft
                    </span>

                </label>


                <label class="checkbox-field">

                    <input
                        v-model="zone"
                        type="checkbox"
                    >

                    <span>
                        Zone erreicht
                    </span>

                </label>

            </section>


            <footer class="modal-footer">

                <button
                    type="button"
                    class="secondary-button"
                    :disabled="updating"
                    @click="closeModal"
                >
                    Abbrechen
                </button>

                <button
                    type="button"
                    class="primary-button"
                    :disabled="updating || tries < 0"
                    @click="handleUpdateAttempt"
                >
                    {{
                        updating
                            ? 'Wird gespeichert...'
                            : 'Speichern'
                    }}
                </button>

            </footer>

        </div>

    </div>

</template>


<style scoped>

.modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    z-index: 1000;
}

.modal {
    width: min(100%, 520px);
    background: #151515;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 1.5rem;
    color: white;
}

.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
}

.eyebrow {
    margin: 0 0 0.4rem;
    font-size: 0.72rem;
    letter-spacing: 0.12em;
    color: rgba(255, 255, 255, 0.45);
}

h2 {
    margin: 0;
}

.subtitle {
    margin: 0.4rem 0 0;
    color: rgba(255, 255, 255, 0.6);
}

.close-button {
    border: none;
    background: transparent;
    color: white;
    font-size: 1.8rem;
    cursor: pointer;
}

.modal-content {
    display: grid;
    gap: 1.25rem;
}

.field {
    display: grid;
    gap: 0.5rem;
}

.field span {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.6);
}

.field input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.8rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    background: #0f0f0f;
    color: white;
    font: inherit;
}

.checkbox-field {
    display: flex;
    align-items: center;
    gap: 0.7rem;
}

.checkbox-field input {
    width: 18px;
    height: 18px;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 2rem;
}

.secondary-button,
.primary-button {
    border-radius: 8px;
    padding: 0.75rem 1rem;
    font: inherit;
    cursor: pointer;
}

.secondary-button {
    background: transparent;
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.16);
}

.primary-button {
    background: white;
    color: black;
    border: none;
}

.error {
    color: #ff8f8f;
    font-size: 0.9rem;
}

button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

</style>