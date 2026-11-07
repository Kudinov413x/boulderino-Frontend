<script setup lang="ts">
import { ref, watch } from 'vue'
import {
    getSessionNotes,
    updateSessionNotes
} from '@/services/statsService'

const props = defineProps<{
    sessionId: number
}>()

const notes = ref('')
const savedNotes = ref('')

const loading = ref(false)
const saving = ref(false)
const error = ref<string | null>(null)
const saveSuccess = ref(false)

const hasChanges = ref(false)

// Notizen laden
async function loadNotes() {
    loading.value = true
    error.value = null
    saveSuccess.value = false

    try {
        const response = await getSessionNotes(props.sessionId)

        notes.value = response.notes ?? ''
        savedNotes.value = notes.value
        hasChanges.value = false
    } catch (e) {
        error.value = e instanceof Error
            ? e.message
            : 'Notizen konnten nicht geladen werden.'
    } finally {
        loading.value = false
    }
}

// Änderungen erkennen
function onNotesChange() {
    hasChanges.value = notes.value !== savedNotes.value
    saveSuccess.value = false
}

// Notizen speichern
async function saveNotes() {
    if (saving.value || !hasChanges.value) return

    saving.value = true
    error.value = null
    saveSuccess.value = false

    try {
        const response = await updateSessionNotes(
            props.sessionId,
            notes.value
        )

        notes.value = response.notes ?? ''
        savedNotes.value = notes.value
        hasChanges.value = false
        saveSuccess.value = true
    } catch (e) {
        error.value = e instanceof Error
            ? e.message
            : 'Notizen konnten nicht gespeichert werden.'
    } finally {
        saving.value = false
    }
}

// Bei Änderung der Session neue Notizen laden
watch(
    () => props.sessionId,
    () => loadNotes(),
    { immediate: true }
)
</script>

<template>
    <section class="notes-section">

        <div class="notes-header">
            <div>
                <p class="detail-label">SESSION JOURNAL</p>
                <h2>Meine Session-Notizen</h2>
                <p class="notes-description">
                    Halte deine Eindrücke, Erkenntnisse und Ziele für
                    deine nächste Session fest.
                </p>
            </div>

            <span
                v-if="saveSuccess"
                class="save-status success"
            >
                ✓ Gespeichert
            </span>

            <span
                v-else-if="hasChanges"
                class="save-status unsaved"
            >
                Ungespeicherte Änderungen
            </span>
        </div>

        <div v-if="loading" class="notes-state">
            Notizen werden geladen...
        </div>

        <div v-else class="notes-card">

            <textarea
                v-model="notes"
                class="notes-input"
                placeholder="Wie lief deine Session? Was hast du gelernt? Welche Boulder möchtest du beim nächsten Mal angehen?"
                rows="8"
                @input="onNotesChange"
            />

            <div class="notes-footer">

                <span class="character-count">
                    {{ notes.length }} Zeichen
                </span>

                <button
                    type="button"
                    class="save-button"
                    :disabled="saving || !hasChanges"
                    @click="saveNotes"
                >
                    {{ saving ? 'Wird gespeichert...' : 'Notiz speichern' }}
                </button>

            </div>

        </div>

        <p v-if="error" class="notes-error">
            {{ error }}
        </p>

    </section>
</template>

<style scoped>
.notes-section {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.notes-header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 1rem;
}

.notes-header h2 {
    margin: 0;
    font-size: 1.4rem;
    font-weight: 600;
}

.detail-label {
    margin: 0 0 0.45rem;
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}

.notes-description {
    margin: 0.6rem 0 0;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.85rem;
    line-height: 1.5;
}

.save-status {
    flex-shrink: 0;
    font-size: 0.75rem;
    font-weight: 600;
}

.success {
    color: #8bd6a4;
}

.unsaved {
    color: rgb(223, 30, 30);
}

.notes-card {
    padding: 3rem;
    border: 1px transparent rgba(255, 255, 255, 0.1);
    border-radius: 2px;
    background: transparent;
}

.notes-input {
    display: block;
    width: 100%;
    min-height: 180px;
    padding: 1rem;
    resize: vertical;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 10px;
    outline: none;
    background: rgba(255, 255, 255, 0.025);
    color: white;
    font: inherit;
    font-size: 0.9rem;
    line-height: 1.7;
    transition: border-color 0.2s ease;
}

.notes-input::placeholder {
    color: rgba(255, 255, 255, 0.3);
}

.notes-input:focus {
    border-color: rgba(255, 255, 255, 0.35);
}

.notes-footer {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
    margin-top: 1rem;
}

.character-count {
    color: rgba(255, 255, 255, 0.35);
    font-size: 0.7rem;
}

.save-button {
    padding: 0.75rem 1.2rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    font: inherit;
    font-size: 0.8rem;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s ease;
}

.save-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.18);
}

.save-button:disabled {
    opacity: 0.35;
    cursor: not-allowed;
}

.notes-state {
    padding: 2rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 14px;
    color: rgba(255, 255, 255, 0.45);
    text-align: center;
}

.notes-error {
    margin: 0;
    color: #ff8a8a;
    font-size: 0.8rem;
}

@media (max-width: 600px) {
    .notes-header {
        align-items: flex-start;
        flex-direction: column;
    }

    .notes-card {
        padding: 1rem;
    }

    .notes-footer {
        align-items: flex-start;
        flex-direction: column;
    }

    .save-button {
        width: 100%;
    }
}
</style>
