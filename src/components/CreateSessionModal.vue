<script setup lang="ts">

import { ref } from 'vue'

import { createSession } from '@/services/sessionService'

import type { components } from '@/types/schema'

type SessionResponseDTO = components['schemas']['SessionResponseDTO']

const emit = defineEmits<{
    close: []
    created: [session: SessionResponseDTO]
}>()

const name = ref('')
const location = ref('')

const error = ref<string | null>(null)
const creating = ref(false)

async function handleCreateSession() {

    error.value = null
    creating.value = true

    try {

        const createdSession = await createSession({
            name: name.value.trim() || undefined,
            location: location.value
        })

        name.value = ''
        location.value = ''

        emit('created', createdSession)
        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Session konnte nicht erstellt werden.'

    } finally {

        creating.value = false

    }

}

function closeModal() {

    if (creating.value) {
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

            <button
                class="close-button"
                type="button"
                aria-label="Fenster schließen"
                @click="closeModal"
            >
                ×
            </button>

            <div class="modal-header">

                <p class="eyebrow">
                    NEUE SESSION
                </p>

                <h2>
                    Session erstellen
                </h2>

                <p class="subtitle">
                    Wo warst du heute bouldern?
                </p>

            </div>

            <form
                class="session-form"
                @submit.prevent="handleCreateSession"
            >

                <div class="field">

                    <label for="session-name">
                        Name
                    </label>

                    <input
                        id="session-name"
                        v-model="name"
                        type="text"
                        placeholder="z. B. Montag Abend"
                    />

                </div>


                <div class="field">

                    <label for="session-location">
                        Ort
                    </label>

                    <input
                        id="session-location"
                        v-model="location"
                        type="text"
                        placeholder="z. B. Boulderhalle XYZ"
                        required
                    />

                </div>

                <p
                    v-if="error"
                    class="error"
                >
                    {{ error }}
                </p>

                <button
                    class="submit-button"
                    type="submit"
                    :disabled="creating"
                >
                    {{
                        creating
                            ? 'Erstellen...'
                            : 'Session erstellen'
                    }}
                </button>

            </form>

        </div>

    </div>

</template>

<style scoped>

.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    background: rgba(0, 0, 0, 0.7);
    backdrop-filter: blur(8px);
}

.modal {
    position: relative;
    width: 100%;
    max-width: 440px;
    padding: 2.5rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    background: rgba(15, 15, 15, 0.95);
    color: white;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
}

.close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    background: transparent;
    color: rgba(255, 255, 255, 0.7);
    font-size: 1.8rem;
    line-height: 1;
    cursor: pointer;
}

.close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.modal-header {
    margin-bottom: 2rem;
}

.modal-header h2 {
    margin: 0;
    font-size: 2rem;
    line-height: 1.1;
}

.modal-header .subtitle {
    margin: 1rem 0 0;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.5;
}

.session-form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}

.field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.field label {
    font-size: 0.85rem;
    font-weight: 600;
}

.field input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    outline: none;
    background: rgba(255, 255, 255, 0.06);
    color: white;
    font: inherit;
}

.field input:focus {
    border-color: rgba(255, 255, 255, 0.7);
    background: rgba(255, 255, 255, 0.1);
}

.field input::placeholder {
    color: rgba(255, 255, 255, 0.35);
}

.submit-button {
    margin-top: 0.5rem;
    padding: 0.9rem 1rem;
    border: none;
    border-radius: 8px;
    background: white;
    color: black;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
}

.submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.error {
    margin: 0;
    color: #ff8a8a;
}

</style>