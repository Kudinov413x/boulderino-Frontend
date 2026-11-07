<script setup lang="ts">

import { computed, onMounted, ref } from 'vue'

import { getBoulders, createBoulder } from '@/services/boulderService'

import { createAttempt } from '@/services/attemptsService'

import type { components } from '@/types/schema'


type BoulderResponseDTO =
    components['schemas']['BoulderResponseDTO']

type BoulderCreateDTO =
    components['schemas']['BoulderCreateDTO']

type AttemptsCreateDTO =
    components['schemas']['AttemptsCreateDTO']


const props = defineProps<{
    sessionId: number
}>()


const emit = defineEmits<{
    close: []
    created: []
}>()


// --------------------------------------------------
// State
// --------------------------------------------------

const mode = ref<'existing' | 'new'>('existing')

const boulders = ref<BoulderResponseDTO[]>([])

const selectedBoulderId = ref<number | null>(null)

const searchTerm = ref('')

const loading = ref(false)

const error = ref<string | null>(null)


// --------------------------------------------------
// New Boulder Form
// --------------------------------------------------

const newBoulder = ref<BoulderCreateDTO>({
    name: '',
    grade: 'FB1',
    wallAngle: 'VERTICAL',
    gripType: 'JUG',
    routeCharacter: 'NEUTRAL',
    climbingStyle: 'NEUTRAL'
})


// --------------------------------------------------
// Filter
// --------------------------------------------------

const filteredBoulders = computed(() => {

    const search = searchTerm.value
        .trim()
        .toLowerCase()

    if (!search) {
        return boulders.value
    }

    return boulders.value.filter((boulder) =>
        boulder.name
            ?.toLowerCase()
            .includes(search)
    )

})


// --------------------------------------------------
// Load Boulders
// --------------------------------------------------

async function loadBoulders() {

    loading.value = true
    error.value = null

    try {

        boulders.value = await getBoulders()

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Boulder konnten nicht geladen werden.'

    } finally {

        loading.value = false

    }

}


// --------------------------------------------------
// Mode wechseln
// --------------------------------------------------

function selectMode(newMode: 'existing' | 'new') {

    mode.value = newMode
    error.value = null

    if (newMode === 'existing') {
        selectedBoulderId.value = null
    }

}


// --------------------------------------------------
// Boulder auswählen
// --------------------------------------------------

function selectBoulder(boulderId: number | undefined) {

    if (boulderId === undefined) {
        return
    }

    selectedBoulderId.value = boulderId

}


// --------------------------------------------------
// Existing Boulder -> Attempt erstellen
// --------------------------------------------------

async function createAttemptForExistingBoulder() {

    if (selectedBoulderId.value === null) {

        error.value = 'Bitte wähle zuerst einen Boulder aus.'

        return

    }

    loading.value = true
    error.value = null

    const request: AttemptsCreateDTO = {
        sessionId: props.sessionId,
        boulderId: selectedBoulderId.value,
        tries: 0,
        done: false,
        zone: false
    }

    try {

        await createAttempt(request)

        emit('created')
        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Attempt konnte nicht erstellt werden.'

    } finally {

        loading.value = false

    }

}


// --------------------------------------------------
// New Boulder -> Boulder erstellen
// -> anschließend Attempt erstellen
// --------------------------------------------------

async function createNewBoulderAndAttempt() {

    if (!newBoulder.value.name.trim()) {

        error.value = 'Bitte gib einen Namen für den Boulder ein.'

        return

    }

    loading.value = true
    error.value = null

    try {

        // 1. Boulder erstellen
        const createdBoulder =
            await createBoulder(newBoulder.value)

        // Das Backend sollte die ID des neuen Boulders zurückgeben
        if (createdBoulder.id === undefined) {

            throw new Error(
                'Der neue Boulder wurde erstellt, aber es wurde keine ID zurückgegeben.'
            )

        }

        // 2. Attempt für den neuen Boulder erstellen
        const request: AttemptsCreateDTO = {
            sessionId: props.sessionId,
            boulderId: createdBoulder.id,
            tries: 0,
            done: false,
            zone: false
        }

        await createAttempt(request)

        emit('created')
        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Boulder oder Attempt konnte nicht erstellt werden.'

    } finally {

        loading.value = false

    }

}


// --------------------------------------------------
// Close
// --------------------------------------------------

function closeModal() {

    if (loading.value) {
        return
    }

    emit('close')

}


onMounted(() => {
    loadBoulders()
})

</script>


<template>

    <div
        class="modal-backdrop"
        @click.self="closeModal"
    >

        <div class="modal">

            <!-- Header -->
            <header class="modal-header">

                <div>

                    <p class="eyebrow">
                        SESSION
                    </p>

                    <h2>
                        Neuer Versuch
                    </h2>

                </div>

                <button
                    class="close-button"
                    type="button"
                    :disabled="loading"
                    @click="closeModal"
                >
                    ×
                </button>

            </header>


            <!-- Mode Auswahl -->
            <div class="mode-switch">

                <button
                    type="button"
                    class="mode-button"
                    :class="{ active: mode === 'existing' }"
                    @click="selectMode('existing')"
                >
                    Bestehender Boulder
                </button>

                <button
                    type="button"
                    class="mode-button"
                    :class="{ active: mode === 'new' }"
                    @click="selectMode('new')"
                >
                    Neuer Boulder
                </button>

            </div>


            <!-- Error -->
            <p
                v-if="error"
                class="error"
            >
                {{ error }}
            </p>


            <!-- ====================================== -->
            <!-- EXISTING BOULDER                       -->
            <!-- ====================================== -->

            <section
                v-if="mode === 'existing'"
                class="modal-content"
            >

                <label
                    class="field"
                    for="boulder-search"
                >

                    <span>
                        Boulder suchen
                    </span>

                    <input
                        id="boulder-search"
                        v-model="searchTerm"
                        type="text"
                        placeholder="z.B. Sloper, FB6..."
                    >

                </label>


                <div
                    v-if="loading && boulders.length === 0"
                    class="loading"
                >
                    Boulder werden geladen...
                </div>


                <div
                    v-else-if="filteredBoulders.length === 0"
                    class="empty"
                >
                    Keine passenden Boulder gefunden.
                </div>


                <div
                    v-else
                    class="boulder-list"
                >

                    <button
                        v-for="boulder in filteredBoulders"
                        :key="boulder.id"
                        type="button"
                        class="boulder-option"
                        :class="{
                            selected:
                                selectedBoulderId === boulder.id
                        }"
                        @click="selectBoulder(boulder.id)"
                    >

                        <div class="boulder-main">

                            <strong>
                                {{ boulder.name }}
                            </strong>

                            <span>
                                {{ boulder.grade }}
                            </span>

                        </div>

                        <div class="boulder-details">

                            <span>
                                {{ boulder.wallAngle }}
                            </span>

                            <span>
                                {{ boulder.gripType }}
                            </span>

                        </div>

                    </button>

                </div>


                <footer class="modal-footer">

                    <button
                        type="button"
                        class="secondary-button"
                        :disabled="loading"
                        @click="closeModal"
                    >
                        Abbrechen
                    </button>

                    <button
                        type="button"
                        class="primary-button"
                        :disabled="
                            loading ||
                            selectedBoulderId === null
                        "
                        @click="createAttemptForExistingBoulder"
                    >
                        {{ loading ? 'Wird erstellt...' : 'Versuch anlegen' }}
                    </button>

                </footer>

            </section>


            <!-- ====================================== -->
            <!-- NEW BOULDER                            -->
            <!-- ====================================== -->

            <section
                v-else
                class="modal-content"
            >

                <div class="form-grid">

                    <!-- Name -->
                    <label
                        class="field full-width"
                    >

                        <span>
                            Name
                        </span>

                        <input
                            v-model="newBoulder.name"
                            type="text"
                            placeholder="z.B. Blue Monster"
                        >

                    </label>


                    <!-- Grade -->
                    <label class="field">

                        <span>
                            Schwierigkeit
                        </span>

                        <select v-model="newBoulder.grade">

                            <option value="FB1">
                                FB1
                            </option>

                            <option value="FB1_PLUS">
                                FB1+
                            </option>

                            <option value="FB2">
                                FB2
                            </option>

                            <option value="FB2_PLUS">
                                FB2+
                            </option>

                            <option value="FB3">
                                FB3
                            </option>

                            <option value="FB3_PLUS">
                                FB3+
                            </option>

                            <option value="FB4">
                                FB4
                            </option>

                            <option value="FB4_PLUS">
                                FB4+
                            </option>

                            <option value="FB5">
                                FB5
                            </option>

                            <option value="FB5_PLUS">
                                FB5+
                            </option>

                            <option value="FB6">
                                FB6
                            </option>

                            <option value="FB6_PLUS">
                                FB6+
                            </option>

                            <option value="FB6_A">
                                FB6A
                            </option>

                            <option value="FB6_B">
                                FB6B
                            </option>

                            <option value="FB6_C">
                                FB6C
                            </option>

                            <option value="FB7">
                                FB7
                            </option>

                            <option value="FB7_PLUS">
                                FB7+
                            </option>

                            <option value="FB7_A">
                                FB7A
                            </option>

                            <option value="FB7_B">
                                FB7B
                            </option>

                            <option value="FB7_C">
                                FB7C
                            </option>

                            <option value="FB8">
                                FB8
                            </option>

                            <option value="FB8_PLUS">
                                FB8+
                            </option>

                        </select>

                    </label>


                    <!-- Wall Angle -->
                    <label class="field">

                        <span>
                            Wandneigung
                        </span>

                        <select v-model="newBoulder.wallAngle">

                            <option value="SLAB">
                                Slab
                            </option>

                            <option value="VERTICAL">
                                Vertikal
                            </option>

                            <option value="OVERHANG">
                                Überhang
                            </option>

                            <option value="ROOF">
                                Dach
                            </option>

                            <option value="DIHEDRAL">
                                Dieder
                            </option>

                            <option value="ARETE">
                                Arete
                            </option>

                        </select>

                    </label>


                    <!-- Grip -->
                    <label class="field">

                        <span>
                            Griffart
                        </span>

                        <select v-model="newBoulder.gripType">

                            <option value="CRIMP">
                                Crimp
                            </option>

                            <option value="JUG">
                                Jug
                            </option>

                            <option value="SLOPER">
                                Sloper
                            </option>

                            <option value="PINCH">
                                Pinch
                            </option>

                            <option value="POCKET">
                                Pocket
                            </option>

                            <option value="VOLUME">
                                Volume
                            </option>

                            <option value="UNDERCLING">
                                Undercling
                            </option>

                            <option value="SIDEPULL">
                                Sidepull
                            </option>

                        </select>

                    </label>


                    <!-- Route Character -->
                    <label class="field">

                        <span>
                            Routencharakter
                        </span>

                        <select v-model="newBoulder.routeCharacter">

                            <option value="TECHNICAL">
                                Technisch
                            </option>

                            <option value="PHYSICAL">
                                Körperlich
                            </option>

                            <option value="BALANCE">
                                Balance
                            </option>

                            <option value="NEUTRAL">
                                Neutral
                            </option>

                        </select>

                    </label>


                    <!-- Climbing Style -->
                    <label class="field">

                        <span>
                            Kletterstil
                        </span>

                        <select v-model="newBoulder.climbingStyle">

                            <option value="STATIC">
                                Statisch
                            </option>

                            <option value="DYNAMIC">
                                Dynamisch
                            </option>

                            <option value="NEUTRAL">
                                Neutral
                            </option>

                        </select>

                    </label>

                </div>


                <footer class="modal-footer">

                    <button
                        type="button"
                        class="secondary-button"
                        :disabled="loading"
                        @click="closeModal"
                    >
                        Abbrechen
                    </button>

                    <button
                        type="button"
                        class="primary-button"
                        :disabled="
                            loading ||
                            !newBoulder.name.trim()
                        "
                        @click="createNewBoulderAndAttempt"
                    >
                        {{
                            loading
                                ? 'Wird erstellt...'
                                : 'Boulder & Versuch anlegen'
                        }}
                    </button>

                </footer>

            </section>

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
    max-width: 620px;
    max-height: 90vh;

    overflow-y: auto;

    padding: 2.5rem;

    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;

    background: rgba(15, 15, 15, 0.95);

    color: white;

    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
}


/* --------------------------------------------- */
/* Close                                         */
/* --------------------------------------------- */

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


.close-button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}


/* --------------------------------------------- */
/* Header                                        */
/* --------------------------------------------- */

.modal-header {
    margin-bottom: 1.75rem;
}


.eyebrow {
    margin: 0 0 0.5rem;

    color: rgba(255, 255, 255, 0.5);

    font-size: 0.75rem;
    font-weight: 700;

    letter-spacing: 0.12em;
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


/* --------------------------------------------- */
/* Mode Switch                                   */
/* --------------------------------------------- */

.mode-switch {
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 0.5rem;

    margin-bottom: 1.5rem;

    padding: 0.25rem;

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 10px;

    background: rgba(255, 255, 255, 0.04);
}


.mode-button {
    padding: 0.75rem 0.8rem;

    border: none;
    border-radius: 7px;

    background: transparent;

    color: rgba(255, 255, 255, 0.55);

    font: inherit;
    font-size: 0.9rem;
    font-weight: 600;

    cursor: pointer;

    transition:
        background 0.2s ease,
        color 0.2s ease;
}


.mode-button:hover:not(:disabled) {
    color: white;
    background: rgba(255, 255, 255, 0.06);
}


.mode-button.active {
    background: rgba(255, 255, 255, 0.12);
    color: white;
}


.mode-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


/* --------------------------------------------- */
/* Content                                       */
/* --------------------------------------------- */

.modal-content {
    display: flex;
    flex-direction: column;

    gap: 1.25rem;
}

.modal-footer{
    display: flex;
    justify-content: flex-end;

    gap: 0.75rem;

    margin-top: 1.5rem;
}

.primary-button,
.secondary-button {
    padding: 0.75rem 1.1rem;

    border-radius: 8px;

    font: inherit;
    font-weight: 600;

    cursor: pointer;
}
/* --------------------------------------------- */
/* Fields                                        */
/* --------------------------------------------- */

.form-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;

    gap: 1.25rem;
}


.full-width {
    grid-column: 1 / -1;
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


.field input,
.field select {
    width: 100%;

    box-sizing: border-box;

    padding: 0.85rem 1rem;

    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;

    outline: none;

    background: rgba(255, 255, 255, 0.06);

    color: white;

    font: inherit;

    transition:
        border-color 0.2s ease,
        background 0.2s ease;
}


.field input:focus,
.field select:focus {
    border-color: rgba(255, 255, 255, 0.7);

    background: rgba(255, 255, 255, 0.1);
}


.field input::placeholder {
    color: rgba(255, 255, 255, 0.35);
}


.field input:disabled,
.field select:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


/* Select Pfeil / Optionen */

.field select option {
    background: #151515;
    color: white;
}


/* --------------------------------------------- */
/* Boulder List                                  */
/* --------------------------------------------- */

.boulder-list {
    display: flex;
    flex-direction: column;

    gap: 0.5rem;

    max-height: 300px;

    overflow-y: auto;

    padding-right: 0.25rem;
}


.boulder-option {
    width: 100%;

    padding: 0.9rem 1rem;

    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 9px;

    background: rgba(255, 255, 255, 0.04);

    color: white;

    text-align: left;

    cursor: pointer;

    transition:
        border-color 0.2s ease,
        background 0.2s ease;
}


.boulder-option:hover:not(:disabled) {
    border-color: rgba(255, 255, 255, 0.3);

    background: rgba(255, 255, 255, 0.08);
}


.boulder-option.selected {
    border-color: rgba(255, 255, 255, 0.65);

    background: rgba(255, 255, 255, 0.1);
}


.boulder-option:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


.boulder-main {
    display: flex;
    align-items: center;
    justify-content: space-between;

    gap: 1rem;
}


.boulder-main strong {
    font-size: 0.95rem;
}


.boulder-details {
    display: flex;

    gap: 0.75rem;

    margin-top: 0.35rem;

    color: rgba(255, 255, 255, 0.45);

    font-size: 0.75rem;
}


.grade {
    flex-shrink: 0;

    padding: 0.35rem 0.55rem;

    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;

    background: rgba(255, 255, 255, 0.06);

    color: rgba(255, 255, 255, 0.8);

    font-size: 0.8rem;
    font-weight: 700;
}


/* --------------------------------------------- */
/* Submit Button                                 */
/* --------------------------------------------- */

.submit-button {
    width: 100%;

    margin-top: 0.5rem;

    padding: 0.9rem 1rem;

    border: none;
    border-radius: 8px;

    background: white;

    color: black;

    font: inherit;
    font-weight: 700;

    cursor: pointer;

    transition:
        opacity 0.2s ease,
        transform 0.1s ease;
}


.submit-button:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.9);
}


.submit-button:active:not(:disabled) {
    transform: translateY(1px);
}


.submit-button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


/* --------------------------------------------- */
/* Status / Error                                */
/* --------------------------------------------- */

.status {
    padding: 1.25rem;

    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;

    background: rgba(255, 255, 255, 0.04);

    color: rgba(255, 255, 255, 0.55);

    text-align: center;
}


.error {
    margin: 0;

    color: #ff8a8a;

    line-height: 1.4;
}


/* --------------------------------------------- */
/* Scrollbar                                     */
/* --------------------------------------------- */

.boulder-list::-webkit-scrollbar,
.modal::-webkit-scrollbar {
    width: 6px;
}


.boulder-list::-webkit-scrollbar-track,
.modal::-webkit-scrollbar-track {
    background: transparent;
}


.boulder-list::-webkit-scrollbar-thumb,
.modal::-webkit-scrollbar-thumb {
    border-radius: 10px;

    background: rgba(255, 255, 255, 0.2);
}


/* --------------------------------------------- */
/* Mobile                                        */
/* --------------------------------------------- */

@media (max-width: 600px) {

    .modal {
        padding: 2rem 1.5rem;
    }

    .modal-header h2 {
        font-size: 1.7rem;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .full-width {
        grid-column: auto;
    }

    .mode-button {
        font-size: 0.8rem;
    }

}

</style>