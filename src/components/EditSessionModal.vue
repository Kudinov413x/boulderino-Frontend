<script setup lang="ts">

import { ref } from 'vue'

import { updateSession, resetSessionName } from '@/services/sessionService'

import type { components } from '@/types/schema'


type SessionResponseDTO = components['schemas']['SessionResponseDTO']


const props = defineProps<{
    session: SessionResponseDTO
}>()


const emit = defineEmits<{
    close: []
    updated: []
}>()

const name = ref('')
const location = ref(props.session.location)
const date = ref(props.session.date)

const error = ref<string | null>(null)
const updating = ref(false)


async function handleUpdateSession() {

    error.value = null

    if (props.session.id === undefined) {
        error.value = 'Session-ID fehlt.'
        return
    }

    updating.value = true

    try {

        await updateSession(
            props.session.id,
            {
                name: name.value.trim() || undefined,
                location: location.value,
                date: date.value
            }
        )

        emit('updated')
        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Session konnte nicht aktualisiert werden.'

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

//reset name
const handleResetName = async () => {
    if (props.session.id === undefined) {
        error.value = 'Session-ID fehlt.'
        return
    }

    error.value = null
    updating.value = true

    try {
        await resetSessionName(props.session.id)

        emit('updated')
        emit('close')
    } catch (e) {
        error.value =
            e instanceof Error
                ? e.message
                : 'Session-Name konnte nicht zurückgesetzt werden.'
    } finally {
        updating.value = false
    }
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
                    SESSION BEARBEITEN
                </p>

                <h2>
                    Session bearbeiten
                </h2>

                <p class="subtitle">
                    Passe die Daten deiner Session an.
                </p>

            </div>


            <form
                class="session-form"
                @submit.prevent="handleUpdateSession"
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

                <button
                    v-if="props.session.name"
                    type="button"
                    class="reset-name-button"
                    @click="handleResetName"
                >
                    Namen entfernen
                </button>


                <div class="field">

                    <label for="session-location">
                        Ort
                    </label>

                    <input
                        id="session-location"
                        v-model="location"
                        type="text"
                        required
                    />

                </div>


                <div class="field">

                    <label for="session-date">
                        Datum
                    </label>

                    <input
                        id="session-date"
                        v-model="date"
                        type="date"
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
                    :disabled="updating"
                >
                    {{
                        updating
                            ? 'Speichern...'
                            : 'Änderungen speichern'
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

.reset-name-button {
    align-self: flex-end;
    margin-top: -0.5rem;
    padding: 0.35rem 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 6px;
    background: transparent;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    transition:
        color 0.2s ease,
        background 0.2s ease,
        border-color 0.2s ease;
}

.reset-name-button:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.75);
}

.reset-name-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.error {
    margin: 0;
    color: #ff8a8a;
}

</style>