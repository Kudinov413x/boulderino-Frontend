<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const email = ref('')
const password = ref('')

const error = ref<string | null>(null)
const loading = ref(false)

async function handleLogin() {

    error.value = null
    loading.value = true

    try {

        await authStore.login(
            email.value,
            password.value
        )

        console.log('Login erfolgreich!')
        console.log('JWT:', authStore.token)

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Login fehlgeschlagen.'

    } finally {

        loading.value = false

    }
}
</script>

<template>

    <main>

        <h1>Login</h1>

        <form @submit.prevent="handleLogin">

            <div>

                <label for="email">
                    E-Mail
                </label>

                <input
                    id="email"
                    v-model="email"
                    type="email"
                    required
                />

            </div>

            <div>

                <label for="password">
                    Passwort
                </label>

                <input
                    id="password"
                    v-model="password"
                    type="password"
                    required
                />

            </div>

            <button
                type="submit"
                :disabled="loading"
            >
                {{ loading? 'Einloggen...' : 'Einloggen' }}
            </button>

        </form>

        <p v-if="error">
            {{ error }}
        </p>

        <p v-if="authStore.isLoggedIn">
            Du bist eingeloggt! 🎉
        </p>
        <p v-if="authStore.token">
            Dein Token:
        </p>
        <pre v-if="authStore.token">{{ authStore.token }}</pre>

    </main>

</template>