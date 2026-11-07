```vue
<script setup lang="ts">

import { ref } from 'vue'

import type { components } from '@/types/schema'

import { updateBoulder } from '@/services/boulderService'


type BoulderResponseDTO =
    components['schemas']['BoulderResponseDTO']

type BoulderCreateDTO =
    components['schemas']['BoulderCreateDTO']


const props = defineProps<{
    boulder: BoulderResponseDTO
}>()


const emit = defineEmits<{
    close: []
    updated: []
}>()


const name = ref(props.boulder.name ?? '')

const grade = ref<BoulderCreateDTO['grade']>(
    props.boulder.grade ?? 'FB1'
)

const gripType = ref<BoulderCreateDTO['gripType']>(
    props.boulder.gripType ?? 'JUG'
)

const wallAngle = ref<BoulderCreateDTO['wallAngle']>(
    props.boulder.wallAngle ?? 'VERTICAL'
)

const routeCharacter = ref<BoulderCreateDTO['routeCharacter']>(
    props.boulder.routeCharacter ?? 'NEUTRAL'
)

const climbingStyle = ref<BoulderCreateDTO['climbingStyle']>(
    props.boulder.climbingStyle ?? 'NEUTRAL'
)


const saving = ref(false)

const error = ref<string | null>(null)


async function handleSubmit() {

    if (!props.boulder.id) {
        error.value = 'Boulder-ID fehlt.'
        return
    }

    if (!name.value.trim()) {
        error.value = 'Bitte gib einen Namen ein.'
        return
    }

    saving.value = true
    error.value = null

    try {

        const data: BoulderCreateDTO = {
            name: name.value.trim(),
            grade: grade.value,
            gripType: gripType.value,
            wallAngle: wallAngle.value,
            routeCharacter: routeCharacter.value,
            climbingStyle: climbingStyle.value
        }

        await updateBoulder(
            props.boulder.id,
            data
        )

        emit('updated')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Boulder konnte nicht aktualisiert werden.'

    } finally {

        saving.value = false

    }
}

</script>


<template>

    <div
        class="modal-backdrop"
        @click.self="emit('close')"
    >

        <div class="modal">

            <div class="modal-header">

                <div>

                    <p class="eyebrow">
                        ABOVE THE CLOUDS
                    </p>

                    <h2>
                        Boulder bearbeiten
                    </h2>

                </div>

                <button
                    type="button"
                    class="close-button"
                    @click="emit('close')"
                >
                    ×
                </button>

            </div>


            <form
                class="form"
                @submit.prevent="handleSubmit"
            >

                <div class="form-group">

                    <label for="boulder-name">
                        Name
                    </label>

                    <input
                        id="boulder-name"
                        v-model="name"
                        type="text"
                        required
                    />

                </div>


                <div class="form-group">

                    <label for="boulder-grade">
                        Schwierigkeit
                    </label>

                    <select
                        id="boulder-grade"
                        v-model="grade"
                    >

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

                        <option value="FB7">
                            FB7
                        </option>

                        <option value="FB7_PLUS">
                            FB7+
                        </option>

                        <option value="FB8">
                            FB8
                        </option>

                        <option value="FB8_PLUS">
                            FB8+
                        </option>

                    </select>

                </div>


                <div class="form-row">

                    <div class="form-group">

                        <label for="grip-type">
                            Griffart
                        </label>

                        <select
                            id="grip-type"
                            v-model="gripType"
                        >

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

                    </div>


                    <div class="form-group">

                        <label for="wall-angle">
                            Wandneigung
                        </label>

                        <select
                            id="wall-angle"
                            v-model="wallAngle"
                        >

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

                    </div>

                </div>


                <div class="form-row">

                    <div class="form-group">

                        <label for="route-character">
                            Routencharakter
                        </label>

                        <select
                            id="route-character"
                            v-model="routeCharacter"
                        >

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

                    </div>


                    <div class="form-group">

                        <label for="climbing-style">
                            Kletterstil
                        </label>

                        <select
                            id="climbing-style"
                            v-model="climbingStyle"
                        >

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

                    </div>

                </div>


                <p
                    v-if="error"
                    class="error"
                >
                    {{ error }}
                </p>


                <div class="actions">

                    <button
                        type="button"
                        class="button secondary"
                        :disabled="saving"
                        @click="emit('close')"
                    >
                        Abbrechen
                    </button>

                    <button
                        type="submit"
                        class="button primary"
                        :disabled="saving"
                    >
                        {{ saving ? 'Speichern...' : 'Änderungen speichern' }}
                    </button>

                </div>

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
    max-width: 560px;
    max-height: 90vh;
    overflow-y: auto;
    padding: 2.5rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 16px;
    background: rgba(15, 15, 15, 0.95);
    color: white;
    box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);
}


.modal-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 2rem;
}


.eyebrow {
    margin: 0 0 0.6rem;
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.65rem;
    font-weight: 700;
    letter-spacing: 0.2em;
}


h2 {
    margin: 0;
    font-size: 1.5rem;
}


.close-button {
    width: 36px;
    height: 36px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-size: 1.5rem;
    line-height: 1;
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease;
}


.close-button:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.25);
}


.form {
    display: flex;
    flex-direction: column;
    gap: 1.25rem;
}


.form-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}


.form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
}


label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    font-weight: 600;
}


input,
select {
    width: 100%;
    box-sizing: border-box;
    padding: 0.8rem 0.9rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    outline: none;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font: inherit;
}


input:focus,
select:focus {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.07);
}


select option {
    background: #0f0f0f;
    color: white;
}


.error {
    margin: 0;
    color: #ff8a8a;
    font-size: 0.85rem;
}


.actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 0.5rem;
}


.button {
    padding: 0.8rem 1.1rem;
    border-radius: 8px;
    font: inherit;
    font-weight: 600;
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease,
        opacity 0.2s ease;
}


.button:hover:not(:disabled) {
    transform: translateY(-1px);
}


.button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}


.primary {
    border: 1px solid white;
    background: white;
    color: black;
}


.secondary {
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: white;
}


.secondary:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.07);
}


@media (max-width: 600px) {

    .modal {
        padding: 1.5rem;
    }

    .form-row {
        grid-template-columns: 1fr;
    }

    .actions {
        flex-direction: column-reverse;
    }

    .button {
        width: 100%;
    }

}

</style>