<script setup lang="ts">

defineProps<{
    title: string
    message: string
    itemName?: string
    deleting?: boolean
}>()

const emit = defineEmits<{
    close: []
    confirm: []
}>()

</script>


<template>

    <div
        class="modal-backdrop"
        @click.self="emit('close')"
    >

        <div
            class="modal"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title"
        >

            <h2 :id="title">
                {{ title }}
            </h2>

            <p class="message">
                {{ message }}
            </p>

            <p
                v-if="itemName"
                class="item-name"
            >
                „{{ itemName }}“
            </p>

            <p class="warning">
                Diese Aktion kann nicht rückgängig gemacht werden.
            </p>

            <div class="actions">

                <button
                    type="button"
                    class="cancel-button"
                    :disabled="deleting"
                    @click="emit('close')"
                >
                    Abbrechen
                </button>

                <button
                    type="button"
                    class="delete-button"
                    :disabled="deleting"
                    @click="emit('confirm')"
                >
                    {{ deleting ? 'Wird gelöscht...' : 'Löschen' }}
                </button>

            </div>

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

.message {
    margin: 1rem 0 0;
    color: rgba(255, 255, 255, 0.65);
    line-height: 1.5;
}


.item-name {
    margin: 1.25rem 0 0;
    padding: 0.8rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.9);
    font-weight: 600;
    overflow-wrap: anywhere;
}


.warning {

    margin: 1rem 0 0;

    color: rgba(255, 255, 255, 0.4);

    font-size: 0.8rem;

}


.actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    margin-top: 1.75rem;
}


.actions button {
    padding: 0.7rem 1rem;
    border-radius: 8px;
    font: inherit;
    cursor: pointer;
}


.cancel-button {
    border: 1px solid rgba(255, 255, 255, 0.15);
    background: transparent;
    color: white;
}


.cancel-button:hover {
    background: rgba(255, 255, 255, 0.06);
}


.delete-button {
    border: 1px solid rgba(255, 100, 100, 0.35);
    background: rgba(255, 80, 80, 0.1);
    color: #ffb0b0;
}


.delete-button:hover {
    background: rgba(255, 80, 80, 0.18);
    border-color: rgba(255, 100, 100, 0.5);
}


.actions button:disabled {
    opacity: 0.4;
    cursor: not-allowed;
}


h2 {
    margin: 0;
    font-size: 1.5rem;
}

</style>