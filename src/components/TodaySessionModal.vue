<script setup lang="ts">
import { ref } from 'vue'
import type { components } from '@/types/schema'

type SessionResponseDTO =
    components['schemas']['SessionResponseDTO']

const props = defineProps<{
    sessions: SessionResponseDTO[]
}>()

const emit = defineEmits<{
    close: []
    select: [session: SessionResponseDTO]
}>()

const selectedSessionId = ref<number | null>(null)

function selectSession(session: SessionResponseDTO) {
    if (session.id === undefined) {
        return
    }

    selectedSessionId.value = session.id
}

function confirmSelection() {
    const session = props.sessions.find(
        session => session.id === selectedSessionId.value
    )

    if (!session) {
        return
    }

    emit('select', session)
}

function closeModal() {
    emit('close')
}
</script>

<template>
    <div
        class="modal-backdrop"
        @click.self="closeModal"
    >

        <div class="modal">

            <div class="modal-header">

                <div>
                    <p class="eyebrow">
                        ABOVE THE CLOUDS
                    </p>

                    <h2>
                        HEUTIGE SESSIONS
                    </h2>

                    <p class="subtitle">
                        Du hast heute mehrere Sessions.
                        Welche möchtest du öffnen?
                    </p>
                </div>

                <button
                    type="button"
                    class="close-button"
                    @click="closeModal"
                >
                    ×
                </button>

            </div>

            <div class="session-list">

                <button
                    v-for="session in sessions"
                    :key="session.id"
                    type="button"
                    class="session-option"
                    :class="{
                        selected:
                            selectedSessionId === session.id
                    }"
                    @click="selectSession(session)"
                >

                    <div class="session-info">

                        <span class="session-location">
                            {{ session.location }}
                        </span>

                        <span class="session-date">
                            {{ session.date }}
                        </span>

                    </div>

                    <span
                        class="selection-indicator"
                        :class="{
                            selected:
                                selectedSessionId === session.id
                        }"
                    >
                        {{
                            selectedSessionId === session.id
                                ? '✓'
                                : ''
                        }}
                    </span>

                </button>

            </div>

            <div class="modal-actions">

                <button
                    type="button"
                    class="cancel-button"
                    @click="closeModal"
                >
                    Abbrechen
                </button>

                <button
                    type="button"
                    class="confirm-button"
                    :disabled="selectedSessionId === null"
                    @click="confirmSelection"
                >
                    Session öffnen
                </button>

            </div>

        </div>

    </div>
</template>

<style scoped>

.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 1.5rem;

    background: rgba(0, 0, 0, 0.75);

    backdrop-filter: blur(8px);
}

.modal {
    width: 100%;
    max-width: 520px;

    padding: 2rem;

    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 16px;

    background: #111;

    color: white;

    box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    margin-bottom: 1.5rem;
}

.eyebrow {
    margin: 0 0 0.5rem;

    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.25em;

    color: rgba(255, 255, 255, 0.5);
}

h2 {
    margin: 0;

    font-size: 1.5rem;
    letter-spacing: 0.04em;
}

.subtitle {
    margin: 0.75rem 0 0;

    color: rgba(255, 255, 255, 0.55);

    font-size: 0.85rem;
    line-height: 1.5;
}

.close-button {
    border: none;

    background: transparent;

    color: rgba(255, 255, 255, 0.6);

    font-size: 1.8rem;
    line-height: 1;

    cursor: pointer;
}

.close-button:hover {
    color: white;
}

.session-list {
    display: flex;
    flex-direction: column;

    gap: 0.75rem;
}

.session-option {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    padding: 1rem;

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;

    background: rgba(255, 255, 255, 0.04);

    color: white;

    text-align: left;

    cursor: pointer;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.15s ease;
}

.session-option:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.25);
}

.session-option.selected {
    border-color: rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.1);
}

.session-info {
    display: flex;
    flex-direction: column;

    gap: 0.3rem;
}

.session-location {
    font-weight: 600;
}

.session-date {
    color: rgba(255, 255, 255, 0.45);

    font-size: 0.75rem;
}

.selection-indicator {
    width: 22px;
    height: 22px;

    display: flex;
    align-items: center;
    justify-content: center;

    border: 1px solid rgba(255, 255, 255, 0.25);
    border-radius: 50%;

    color: black;

    font-size: 0.75rem;
    font-weight: 800;
}

.selection-indicator.selected {
    border-color: white;
    background: white;
}

.modal-actions {
    display: flex;
    justify-content: flex-end;

    gap: 0.75rem;

    margin-top: 1.5rem;
}

.cancel-button,
.confirm-button {
    padding: 0.75rem 1rem;

    border-radius: 8px;

    font: inherit;
    font-weight: 600;

    cursor: pointer;
}

.cancel-button {
    border: 1px solid rgba(255, 255, 255, 0.15);

    background: transparent;

    color: white;
}

.confirm-button {
    border: none;

    background: white;

    color: black;
}

.confirm-button:disabled {
    cursor: default;
    opacity: 0.35;
}

@media (max-width: 600px) {

    .modal {
        padding: 1.5rem;
    }

    .modal-actions {
        flex-direction: column-reverse;
    }

    .cancel-button,
    .confirm-button {
        width: 100%;
    }

}

</style>