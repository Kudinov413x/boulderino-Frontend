<script setup lang="ts">

import { ref } from 'vue'

import { useAuthStore } from '@/stores/auth'
import { register } from '@/services/authService'


const emit = defineEmits<{
    close: []
}>()


const authStore = useAuthStore()


const name = ref('')
const email = ref('')
const password = ref('')

const error = ref<string | null>(null)
const loading = ref(false)

const mode = ref<'login' | 'register'>('login')


async function handleLogin() {

    error.value = null
    loading.value = true

    try {

        await authStore.login(
            email.value,
            password.value
        )

        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Login fehlgeschlagen.'

    } finally {

        loading.value = false

    }
}


async function handleRegister() {

    error.value = null
    loading.value = true

    try {

        await register({
            name: name.value,
            email: email.value,
            password: password.value
        })

        await authStore.login(
            email.value,
            password.value
        )

        emit('close')

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Registrierung fehlgeschlagen.'

    } finally {

        loading.value = false

    }
}


function closeModal() {

    emit('close')

}


function switchMode() {

    error.value = null

    mode.value =
        mode.value === 'login'
            ? 'register'
            : 'login'

}

</script>


<template>

    <div
        class="modal-backdrop"
        @click.self="closeModal"
    >

        <div class="modal">

            <!-- CLOSE -->

            <button
                class="close-button"
                type="button"
                aria-label="Fenster schließen"
                @click="closeModal"
            >
                ×
            </button>


            <!-- HEADER -->

            <div class="modal-header">

                <p class="eyebrow">
                    ABOVE THE CLOUDS
                </p>

                <h2>
                    {{
                        mode === 'login'
                            ? 'Willkommen zurück.'
                            : 'Willkommen bei Above The Clouds.'
                    }}
                </h2>

                <p class="subtitle">
                    {{
                        mode === 'login'
                            ? 'Logge dich ein, um dein Boulder-Tagebuch weiterzuführen.'
                            : 'Erstelle dein Konto und starte dein persönliches Boulder-Tagebuch.'
                    }}
                </p>

            </div>


            <!-- FORM -->

            <form
                class="login-form"
                @submit.prevent="
                    mode === 'login'
                        ? handleLogin()
                        : handleRegister()
                "
            >

                <!-- NAME -->

                <div
                    v-if="mode === 'register'"
                    class="field"
                >

                    <label for="register-name">
                        Name
                    </label>

                    <input
                        id="register-name"
                        v-model="name"
                        type="text"
                        autocomplete="name"
                        required
                    />

                </div>


                <!-- EMAIL -->

                <div class="field">

                    <label for="auth-email">
                        E-Mail
                    </label>

                    <input
                        id="auth-email"
                        v-model="email"
                        type="email"
                        autocomplete="email"
                        required
                    />

                </div>


                <!-- PASSWORD -->

                <div class="field">

                    <label for="auth-password">
                        Passwort
                    </label>

                    <input
                        id="auth-password"
                        v-model="password"
                        type="password"
                        :autocomplete="
                            mode === 'login'
                                ? 'current-password'
                                : 'new-password'
                        "
                        required
                    />

                </div>


                <!-- ERROR -->

                <p
                    v-if="error"
                    class="error"
                >
                    {{ error }}
                </p>


                <!-- SUBMIT -->

                <button
                    class="login-button"
                    type="submit"
                    :disabled="loading"
                >
                    {{
                        loading
                            ? mode === 'login'
                                ? 'Anmelden...'
                                : 'Registrieren...'
                            : mode === 'login'
                                ? 'Anmelden'
                                : 'Registrieren'
                    }}
                </button>

            </form>


            <!-- MODE SWITCH -->

            <p class="register-hint">

                <template v-if="mode === 'login'">

                    Noch kein Konto?

                    <button
                        type="button"
                        class="register-button"
                        @click="switchMode"
                    >
                        Registrieren
                    </button>

                </template>


                <template v-else>

                    Du hast bereits ein Konto?

                    <button
                        type="button"
                        class="register-button"
                        @click="switchMode"
                    >
                        Anmelden
                    </button>

                </template>

            </p>

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

    box-shadow:
        0 25px 80px rgba(0, 0, 0, 0.5);

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

    transition:
        background 0.2s ease,
        color 0.2s ease;

}


.close-button:hover {

    background: rgba(255, 255, 255, 0.1);

    color: white;

}


/* ---------------------------------
HEADER
--------------------------------- */

.modal-header {

    margin-bottom: 2rem;

}


.eyebrow {

    margin: 0 0 0.75rem;

    font-size: 0.7rem;
    font-weight: 700;

    letter-spacing: 0.25em;

    opacity: 0.6;

}


h2 {

    margin: 0;

    font-size: 2rem;

    line-height: 1.1;

}


.subtitle {

    margin: 1rem 0 0;

    color: rgba(255, 255, 255, 0.65);

    line-height: 1.5;

}


/* ---------------------------------
FORM
--------------------------------- */

.login-form {

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

    transition:
        border-color 0.2s ease,
        background 0.2s ease;

}


.field input:focus {

    border-color: rgba(255, 255, 255, 0.7);

    background: rgba(255, 255, 255, 0.1);

}


.error {

    margin: 0;

    color: #ff8a8a;

    font-size: 0.9rem;

}


.login-button {

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
        transform 0.2s ease,
        opacity 0.2s ease;

}


.login-button:hover:not(:disabled) {

    transform: translateY(-2px);

}


.login-button:disabled {

    opacity: 0.5;

    cursor: not-allowed;

}


/* ---------------------------------
REGISTER
--------------------------------- */

.register-hint {

    margin: 1.75rem 0 0;

    text-align: center;

    color: rgba(255, 255, 255, 0.55);

    font-size: 0.9rem;

}


.register-button {

    padding: 0;

    border: none;

    background: none;

    color: white;

    font: inherit;

    font-weight: 600;

    cursor: pointer;

}


.register-button:hover {

    text-decoration: underline;

}


/* ---------------------------------
RESPONSIVE
--------------------------------- */

@media (max-width: 600px) {

    .modal {

        padding: 2rem 1.5rem;

    }

}

</style>