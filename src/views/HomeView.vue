<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

import AuthModal from '@/components/AuthModal.vue'
import IcarusIntro from '@/components/IcarusIntro.vue'
import TodaySessionModal from '@/components/TodaySessionModal.vue'
import { useAuthStore } from '@/stores/auth'
import { getTodaySessions } from '@/services/sessionService'
import CreateSessionModal from '@/components/CreateSessionModal.vue'

import type { components } from '@/types/schema'

import icarusImage from '@/assets/icarus/AboveTheCloudsLanding.jpg'

const authStore = useAuthStore()
const showAuthModal = ref(false)

//Heutige Session
type SessionResponseDTO = components['schemas']['SessionResponseDTO']
const router = useRouter()
const showCreateSessionModal = ref(false)
const showTodaySessionModal = ref(false)
const loadingTodaySession = ref(false)
const todaySessionError = ref<string | null>(null)
const todaySessions = ref<SessionResponseDTO[]>([])

function getToday(): string {
    const today = new Date()

    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')

    return `${year}-${month}-${day}`
}


async function openTodaySession() {
    if (!authStore.isLoggedIn) {
        showAuthModal.value = true
        return
    }

    if (loadingTodaySession.value) {
        return
    }

    loadingTodaySession.value = true
    todaySessionError.value = null

    try {
        todaySessions.value = await getTodaySessions()

        if (todaySessions.value.length === 0) {
            showCreateSessionModal.value = true
            return
        }

        if (todaySessions.value.length === 1) {
            const session = todaySessions.value[0]

            if (session?.id === undefined) {
                todaySessionError.value =
                    'Die heutige Session besitzt keine gültige ID.'
                return
            }

            router.push(`/sessions/${session.id}`)
            return
        }

        showTodaySessionModal.value = true
    } catch (e) {
        todaySessionError.value =
            e instanceof Error
                ? e.message
                : 'Heutige Session konnte nicht geladen werden.'
    } finally {
        loadingTodaySession.value = false
    }
}


function handleSessionCreated(
    session: SessionResponseDTO
) {

    showCreateSessionModal.value = false

    if (session.id === undefined) {
        todaySessionError.value =
            'Session wurde erstellt, aber die Session-ID fehlt.'

        return
    }

    router.push(`/sessions/${session.id}`)
}


function openSelectedTodaySession(
    session: SessionResponseDTO
) {

    showTodaySessionModal.value = false

    if (session.id === undefined) {
        todaySessionError.value =
            'Die ausgewählte Session besitzt keine gültige ID.'

        return
    }

    router.push(`/sessions/${session.id}`)
}


function closeTodaySessionModal() {
    showTodaySessionModal.value = false
}


function closeCreateSessionModal() {
    showCreateSessionModal.value = false
}

</script>


<template>

    <IcarusIntro :image="icarusImage">

        <div class="home-content">

            <p class="eyebrow">
                Above The Clouds
            </p>

            <h1>
                Fall deeper.
                <br>
                Climb higher.
            </h1>

            <p class="description">
                Dein persönliches Boulder-Tagebuch.
                Tracke deine Boulder und entdecke
                deinen Fortschritt.
            </p>

            <div class="actions">

                <button
                    type="button"
                    class="button primary"
                    :disabled="loadingTodaySession"
                    @click="openTodaySession"
                >
                    {{ loadingTodaySession ? 'Lade Session...' : 'Heutige Session' }}
                </button>

                <RouterLink
                    to="/sessions"
                    class="button secondary"
                >
                    Meine Sessions
                </RouterLink>

                <RouterLink
                    to="/boulders"
                    class="button secondary"
                    >
                        Meine Boulder
                </RouterLink>

                <RouterLink
                    to="/progress"
                    class="button secondary"
                >
                    Mein Progress
                </RouterLink>

            </div>

            <p
                v-if="todaySessionError"
                class="today-session-error"
            >
                {{ todaySessionError }}
            </p>

        </div>

    </IcarusIntro>


    <CreateSessionModal
        v-if="showCreateSessionModal"
        @close="closeCreateSessionModal"
        @created="handleSessionCreated"
    />


    <TodaySessionModal
        v-if="showTodaySessionModal"
        :sessions="todaySessions"
        @close="closeTodaySessionModal"
        @select="openSelectedTodaySession"
    />

</template>


<style scoped>

.home-content {
    width: 100%;
    max-width: 700px;

    text-align: center;

    color: white;
}


.eyebrow {
    margin-bottom: 1rem;

    font-size: 0.85rem;
    font-weight: 700;

    letter-spacing: 0.3em;
}


h1 {
    margin: 0;

    font-size: clamp(
        3rem,
        8vw,
        7rem
    );

    line-height: 0.95;
}


.description {
    max-width: 550px;

    margin: 2rem auto;

    font-size: 1.2rem;
    line-height: 1.6;
}


.actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    margin-top: 2rem;
}


.button {
    padding: 0.9rem 1.5rem;
    border: none;
    border-radius: 8px;
    background: transparent;
    color: inherit;
    font: inherit;
    font-weight: 600;
    text-decoration: none;
    cursor: pointer;
    transition:
        transform 0.2s ease,
        opacity 0.2s ease;
}


.button:hover {
    transform: translateY(-2px);
}


.primary {
    border: none;
    background: white;
    color: black;
}


.secondary {
    border: 1px solid white;
    color: white;
}

.auth-button {
    position: absolute;

    top: 2rem;
    right: 2rem;

    z-index: 20;

    padding: 0.7rem 1.2rem;

    border: 1px solid rgba(255, 255, 255, 0.6);
    border-radius: 8px;

    background: rgba(0, 0, 0, 0.25);
    color: white;

    font: inherit;
    font-weight: 600;

    cursor: pointer;

    backdrop-filter: blur(8px);

    transition:
        background 0.2s ease,
        transform 0.2s ease;
}


.auth-button:hover {
    background: rgba(255, 255, 255, 0.15);

    transform: translateY(-2px);
}


@media (max-width: 600px) {

    .actions {
        flex-direction: column;
    }

}

</style>