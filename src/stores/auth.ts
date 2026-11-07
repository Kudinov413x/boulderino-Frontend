import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { login as loginRequest } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {

    const token = ref<string | null>(
        localStorage.getItem('token')
    )

    const isLoggedIn = computed(() => {
        return token.value !== null
    })

    async function login(email: string, password: string) {

        const response = await loginRequest({
            email,
            password
        })

        token.value = response.token

        localStorage.setItem('token', response.token)
    }

    function logout() {

        token.value = null

        localStorage.removeItem('token')
    }

    return {
        token,
        isLoggedIn,
        login,
        logout
    }
})