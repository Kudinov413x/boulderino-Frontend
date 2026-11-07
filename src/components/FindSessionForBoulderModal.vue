<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { getSessionsByBoulder } from '@/services/sessionService'
import type { components } from '@/types/schema'

type BoulderResponseDTO = components['schemas']['BoulderResponseDTO']

type SessionResponseDTO = components['schemas']['SessionResponseDTO']

const props = defineProps<{
    boulder: BoulderResponseDTO
}>()

const emit = defineEmits<{
    close: []
    'open-session': [sessionId: number]
}>()

const sessions = ref<SessionResponseDTO[]>([])
const selectedSessionId = ref<number | null>(null)

const loading = ref(true)
const error = ref<string | null>(null)

async function loadSessions() {
    loading.value = true
    error.value = null

    try {
        sessions.value = await getSessionsByBoulder(
            props.boulder.id!
        )

        const firstSession = sessions.value[0]

        if (firstSession?.id !== undefined) {
            selectedSessionId.value = firstSession.id
        }
    }
    catch (e) {
        error.value =
            e instanceof Error
                ? e.message
                : 'Sessions konnten nicht geladen werden.'
    }
    finally {
        loading.value = false
    }
}

function selectSession(sessionId: number | undefined) {
    if (sessionId === undefined) {
        return
    }

    selectedSessionId.value = sessionId
}

function confirmSession() {
    if (selectedSessionId.value === null) {
        return
    }

    emit('open-session', selectedSessionId.value)
}

onMounted(loadSessions)
</script>

<template>
    <div class="modal-backdrop" @click.self="emit('close')">
        <section
            class="sessions-modal"
            role="dialog"
            aria-modal="true"
            :aria-label="`Sessions für ${boulder.name}`"
        >
            <header class="modal-header">
                <div>
                    <p class="detail-label">BOULDER</p>
                    <h2>{{ boulder.name }}</h2>
                    <p class="modal-subtitle">
                        Befindet sich in folgenden Sessions. Wähle eine Session aus um sie anzuzeigen.
                    </p>
                </div>

                <button
                    type="button"
                    class="modal-close"
                    aria-label="Modal schließen"
                    @click="emit('close')"
                >
                    ×
                </button>
            </header>

            <div class="modal-content">
                <p v-if="loading" class="status">
                    Sessions werden geladen...
                </p>

                <p v-else-if="error" class="error">
                    {{ error }}
                </p>

                <div
                    v-else-if="sessions.length === 0"
                    class="empty-state"
                >
                    <h3>Keine Sessions gefunden.</h3>
                    <p>
                        Für diesen Boulder wurden noch keine
                        Versuche in einer Session gespeichert.
                    </p>
                </div>

                <div v-else class="session-list">
                    <button
                        v-for="session in sessions"
                        :key="session.id"
                        type="button"
                        class="session-option"
                        :class="{
                            selected:
                                selectedSessionId === session.id
                        }"
                        @click="selectSession(session.id)"
                    >
                        <span class="session-option-main">
                            <strong>
                                {{
                                    session.name ||
                                    `Session vom ${session.date}`
                                }}
                            </strong>

                            <span>
                                {{ session.date }}
                            </span>
                        </span>

                        <span
                            v-if="session.location"
                            class="session-location"
                        >
                            {{ session.location }}
                        </span>
                    </button>
                </div>
            </div>

            <footer class="modal-footer">
                <button
                    type="button"
                    class="secondary-button"
                    @click="emit('close')"
                >
                    Abbrechen
                </button>

                <button
                    type="button"
                    class="primary-button"
                    :disabled="
                        loading ||
                        selectedSessionId === null
                    "
                    @click="confirmSession"
                >
                    Session öffnen
                </button>
            </footer>
        </section>
    </div>
</template>

<style scoped>
/* --------------------------------------------- */
/* Backdrop                                      */
/* --------------------------------------------- */

.modal-backdrop {
    position: fixed;
    inset: 0;
    z-index: 1000;

    display: flex;
    align-items: center;
    justify-content: center;

    padding: 1.5rem;

    background: rgba(0, 0, 0, 0.72);
    backdrop-filter: blur(8px);
}


/* --------------------------------------------- */
/* Modal                                         */
/* --------------------------------------------- */

.sessions-modal {
    position: relative;

    width: 100%;
    max-width: 560px;
    max-height: 90vh;

    display: flex;
    flex-direction: column;

    overflow: hidden;

    border: 1px solid rgba(255, 255, 255, 0.14);
    border-radius: 16px;

    background: rgba(18, 18, 18, 0.97);
    color: white;

    box-shadow:
        0 25px 80px rgba(0, 0, 0, 0.55),
        0 8px 30px rgba(0, 0, 0, 0.3);

    animation: modal-enter 0.18s ease-out;
}

@keyframes modal-enter {
    from {
        opacity: 0;
        transform: translateY(8px) scale(0.98);
    }

    to {
        opacity: 1;
        transform: translateY(0) scale(1);
    }
}


/* --------------------------------------------- */
/* Header                                        */
/* --------------------------------------------- */

.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;

    gap: 1.5rem;

    padding: 2rem 2rem 1.5rem;

    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.modal-header > div {
    min-width: 0;
}

.detail-label {
    margin: 0 0 0.5rem;

    color: rgba(255, 255, 255, 0.4);

    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}

.modal-header h2 {
    margin: 0;

    font-size: 1.7rem;
    line-height: 1.1;

    overflow-wrap: anywhere;
}

.modal-subtitle {
    margin: 0.6rem 0 0;

    color: rgba(255, 255, 255, 0.5);

    font-size: 0.85rem;
    line-height: 1.4;
}


/* --------------------------------------------- */
/* Close Button                                  */
/* --------------------------------------------- */

.modal-close {
    flex-shrink: 0;

    display: flex;
    align-items: center;
    justify-content: center;

    width: 36px;
    height: 36px;

    padding: 0;

    border: none;
    border-radius: 50%;

    background: transparent;
    color: rgba(255, 255, 255, 0.55);

    font-size: 1.8rem;
    font-weight: 300;
    line-height: 1;

    cursor: pointer;

    transition:
        background 0.15s ease,
        color 0.15s ease;
}

.modal-close:hover {
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.modal-close:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
}


/* --------------------------------------------- */
/* Content                                       */
/* --------------------------------------------- */

.modal-content {
    min-height: 0;

    overflow-y: auto;

    padding: 1.5rem 2rem;
}

.modal-content::-webkit-scrollbar {
    width: 6px;
}

.modal-content::-webkit-scrollbar-track {
    background: transparent;
}

.modal-content::-webkit-scrollbar-thumb {
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.18);
}


/* --------------------------------------------- */
/* Session List                                  */
/* --------------------------------------------- */

.session-list {
    display: flex;
    flex-direction: column;

    gap: 0.6rem;
}


/* --------------------------------------------- */
/* Session Option                                */
/* --------------------------------------------- */

.session-option {
    width: 100%;

    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 1rem;

    padding: 1rem 1.1rem;

    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;

    background: rgba(255, 255, 255, 0.035);
    color: white;

    text-align: left;

    cursor: pointer;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        transform 0.15s ease;
}

.session-option:hover {
    border-color: rgba(255, 255, 255, 0.22);
    background: rgba(255, 255, 255, 0.07);

    transform: translateY(-1px);
}

.session-option:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
}

.session-option.selected {
    border-color: rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.09);
}


/* --------------------------------------------- */
/* Session Content                               */
/* --------------------------------------------- */

.session-option-main {
    min-width: 0;

    display: flex;
    flex-direction: column;

    gap: 0.35rem;
}

.session-option-main strong {
    font-size: 0.9rem;
    font-weight: 600;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
}

.session-option-main > span {
    color: rgba(255, 255, 255, 0.42);

    font-size: 0.75rem;
}

.session-location {
    flex-shrink: 0;

    max-width: 40%;

    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    color: rgba(255, 255, 255, 0.5);

    font-size: 0.75rem;
}


/* --------------------------------------------- */
/* Status / Error / Empty                       */
/* --------------------------------------------- */

.status {
    margin: 0;

    padding: 1.25rem;

    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;

    background: rgba(255, 255, 255, 0.035);

    color: rgba(255, 255, 255, 0.5);

    font-size: 0.85rem;
    text-align: center;
}

.error {
    margin: 0;

    padding: 1rem;

    border: 1px solid rgba(255, 100, 100, 0.2);
    border-radius: 10px;

    background: rgba(255, 100, 100, 0.06);

    color: #ff9b9b;

    font-size: 0.85rem;
    line-height: 1.5;
}

.empty-state {
    padding: 2rem 1rem;

    text-align: center;
}

.empty-state h3 {
    margin: 0 0 0.5rem;

    font-size: 1rem;
    font-weight: 600;
}

.empty-state p {
    max-width: 380px;

    margin: 0 auto;

    color: rgba(255, 255, 255, 0.45);

    font-size: 0.8rem;
    line-height: 1.5;
}


/* --------------------------------------------- */
/* Footer                                        */
/* --------------------------------------------- */

.modal-footer {
    display: flex;
    justify-content: flex-end;

    gap: 0.75rem;

    padding: 1.25rem 2rem 1.5rem;

    border-top: 1px solid rgba(255, 255, 255, 0.08);
}


/* --------------------------------------------- */
/* Buttons                                       */
/* --------------------------------------------- */

.primary-button,
.secondary-button {
    padding: 0.7rem 1rem;

    border-radius: 8px;

    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;

    cursor: pointer;

    transition:
        background 0.15s ease,
        border-color 0.15s ease,
        opacity 0.15s ease,
        transform 0.1s ease;
}

.primary-button {
    border: 1px solid rgba(255, 255, 255, 0.8);

    background: white;
    color: #111;
}

.primary-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.88);
}

.primary-button:active:not(:disabled) {
    transform: translateY(1px);
}

.primary-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}

.secondary-button {
    border: 1px solid rgba(255, 255, 255, 0.14);

    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.75);
}

.secondary-button:hover {
    border-color: rgba(255, 255, 255, 0.25);
    background: rgba(255, 255, 255, 0.08);
    color: white;
}

.secondary-button:active {
    transform: translateY(1px);
}


/* --------------------------------------------- */
/* Mobile                                        */
/* --------------------------------------------- */

@media (max-width: 600px) {
    .modal-backdrop {
        align-items: flex-end;

        padding: 0;
    }

    .sessions-modal {
        max-width: none;
        max-height: 90vh;

        border-radius: 16px 16px 0 0;
    }

    .modal-header {
        padding: 1.5rem 1.25rem 1.25rem;
    }

    .modal-header h2 {
        font-size: 1.5rem;
    }

    .modal-content {
        padding: 1.25rem;
    }

    .modal-footer {
        padding: 1rem 1.25rem 1.25rem;
    }

    .session-option {
        align-items: flex-start;
        flex-direction: column;
        gap: 0.5rem;
    }

    .session-location {
        max-width: 100%;
    }

    .primary-button,
    .secondary-button {
        flex: 1;
    }
}
</style>
