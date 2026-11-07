<script setup lang="ts">
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import AuthModal from '@/components/AuthModal.vue'

const authStore = useAuthStore()
const showAuthModal = ref(false)
</script>

<template>
    <nav class="navbar">
        <div class="nav-links">
            <RouterLink to="/" class="nav-link">Home</RouterLink>
            <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
            <RouterLink to="/sessions" class="nav-link">Sessions</RouterLink>
            <RouterLink to="/boulders" class="nav-link">Boulder</RouterLink>
            <RouterLink to="/progress" class="nav-link">Progress</RouterLink>
            <RouterLink to="/aboutMe" class="nav-link">About Me</RouterLink>
            <RouterLink to="/impressum" class="nav-link">Impressum</RouterLink>
            <RouterLink to="/datenschutz" class="nav-link">Datenschutz</RouterLink>
        </div>

        <button
            v-if="!authStore.isLoggedIn"
            class="auth-button"
            @click="showAuthModal = true"
        >
            Anmelden
        </button>

        <button
            v-else
            class="auth-button"
            @click="authStore.logout"
        >
            Ausloggen
        </button>
    </nav>

    <AuthModal
        v-if="showAuthModal"
        @close="showAuthModal = false"
    />
</template>

<style scoped>
.navbar {
    position: relative;
    z-index: 50;

    display: flex;
    justify-content: center;
    align-items: center;

    padding: 1rem 1.5rem;

    background: rgba(15, 15, 15, 0.99);
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);

    backdrop-filter: blur(12px);
}

.nav-links {
    display: flex;
    align-items: center;
    gap: 0.4rem;
}

.auth-button {
    position: absolute;
    right: 1.5rem;
    top: 50%;
    transform: translateY(-50%);

    padding: 0.6rem 1.1rem;

    border: 1px solid rgba(255, 255, 255, 0.3);
    border-radius: 8px;

    background: rgba(255, 255, 255, 0.07);
    color: rgba(255, 255, 255, 0.95);

    font: inherit;
    font-size: 0.85rem;
    font-weight: 600;

    cursor: pointer;

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        color 0.2s ease;
}

.auth-button:hover {
    background: rgba(255, 255, 255, 0.13);
    border-color: rgba(255, 255, 255, 0.5);
    color: white;
}

.logout-button {
    background: transparent;
    border-color: rgba(255, 255, 255, 0.15);
    color: rgba(255, 255, 255, 0.65);
}

.logout-button:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.3);
    color: white;
}


.nav-link {
    position: relative;

    padding: 0.65rem 0.9rem;
    border-radius: 7px;

    color: rgba(255, 255, 255, 0.55);

    font-size: 0.85rem;
    font-weight: 600;
    text-decoration: none;

    transition:
        color 0.2s ease,
        background 0.2s ease;
}

.nav-link:hover {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.9);
}

.nav-link.router-link-active {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.nav-link.router-link-active::after {
    content: '';

    position: absolute;
    left: 50%;
    bottom: 0.25rem;

    width: 14px;
    height: 2px;

    border-radius: 999px;
    background: white;

    transform: translateX(-50%);
}


@media (max-width: 600px) {
    .navbar {
        padding: 0.75rem 0.5rem;
    }

    .nav-links {
        width: 100%;
        justify-content: space-between;
        gap: 0;
    }

    .nav-link {
        padding: 0.6rem 0.4rem;
        font-size: 0.7rem;
    }

    .auth-button {
        padding: 0.6rem 0.5rem;
        font-size: 0.7rem;
    }
}
</style>