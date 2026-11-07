<script setup lang="ts">

import { onMounted, ref } from 'vue'

import { useRouter } from 'vue-router'

import { getSessions } from '@/services/sessionService'

import type { components } from '@/types/schema'

import CreateSessionModal from '@/components/CreateSessionModal.vue'
import EditSessionModal from '@/components/EditSessionModal.vue'

import { deleteSession } from '@/services/sessionService'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'


type SessionResponseDTO = components['schemas']['SessionResponseDTO']


const sessions = ref<SessionResponseDTO[]>([])

const loading = ref(false)

const error = ref<string | null>(null)


async function loadSessions() {

    loading.value = true
    error.value = null

    try {

        sessions.value = await getSessions()

    } catch (e) {

        error.value =
            e instanceof Error
                ? e.message
                : 'Sessions konnten nicht geladen werden.'

    } finally {

        loading.value = false

    }

}


onMounted(() => {

    loadSessions()

})

//Create Sessions
const showCreateModal = ref(false)

// Edit Sessions
const showEditModal = ref(false)

const selectedSession = ref<SessionResponseDTO | null>(null)


function openEditModal(session: SessionResponseDTO) {

    selectedSession.value = session
    showEditModal.value = true

}

// Hilfsmethode für ModalComponents
async function handleSessionUpdated() {

    await loadSessions()

}

//Details Weiterleitung
const router = useRouter()

function openSessionDetails(session: SessionResponseDTO) {

    if (session.id === undefined) {
        return
    }

    router.push(`/sessions/${session.id}`)

}

function openSessionStats(session: SessionResponseDTO) {

    if (session.id === undefined) {
        return
    }

    router.push(`/sessionsStats/${session.id}`)

}

//Delete Session
const showDeleteModal = ref(false)
const deletingSession = ref(false)
const sessionToDelete = ref<SessionResponseDTO | null>(null)

function openDeleteModal(session: SessionResponseDTO) {
    sessionToDelete.value = session
    showDeleteModal.value = true
}


function closeDeleteModal() {
    if (deletingSession.value) {
        return
    }
    showDeleteModal.value = false
    sessionToDelete.value = null
}


async function handleDeleteSession() {
    if (sessionToDelete.value?.id === undefined) {
        return
    }
    deletingSession.value = true
    error.value = null
    try {
        await deleteSession(sessionToDelete.value.id)
        showDeleteModal.value = false
        sessionToDelete.value = null
        await loadSessions()
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Session konnte nicht gelöscht werden.'
    }
    finally {
        deletingSession.value = false
    }

}

</script>


<template>

    <main class="sessions-page">

        <header class="page-header">

            <div>

                <p class="eyebrow">
                    ABOVE THE CLOUDS
                </p>

                <h1>
                    Meine Sessions
                </h1>

                <p class="subtitle">
                    Deine vergangenen Boulder-Sessions.
                </p>

            </div>

            <button
                class="create-button"
                type="button"
                @click="showCreateModal = true"
            >
                Neue Session
            </button>

        </header>

        <CreateSessionModal
            v-if="showCreateModal"
            @close="showCreateModal = false"
            @created="handleSessionUpdated"
        />

        <EditSessionModal
            v-if="showEditModal && selectedSession"
            :session="selectedSession"
            @close="showEditModal = false"
            @updated="handleSessionUpdated"
        />
        
        <ConfirmDeleteModal
            v-if="showDeleteModal && sessionToDelete"
            title="Session löschen?"
            message="Möchtest du diese Session wirklich löschen?"
            :item-name="
                sessionToDelete.name ||
                sessionToDelete.location
            "
            :deleting="deletingSession"
            @close="closeDeleteModal"
            @confirm="handleDeleteSession"
        />

        <p
            v-if="loading"
            class="status"
        >
            Sessions werden geladen...
        </p>


        <p
            v-else-if="error"
            class="error"
        >
            {{ error }}
        </p>


        <div
            v-else-if="sessions.length === 0"
            class="empty-state"
        >

            <h2>
                Noch keine Sessions.
            </h2>

            <p>
                Starte deine erste Boulder-Session.
            </p>

        </div>


        <section
            v-else
            class="sessions-grid"
        >

            <article
                v-for="session in sessions"
                :key="session.id"
                class="session-card"
            >

                <div class="session-date">
                    {{ session.location }} • {{ session.date }}
                </div>

                <h2>
                    {{ session.name || session.location }}
                </h2>

                <div class="session-actions">

                    <button
                        type="button"
                        @click="openEditModal(session)"
                    >
                        Bearbeiten
                    </button>

                    <button
                        type="button"
                        @click="openSessionDetails(session)"
                    >
                        Details
                    </button>

                    <button
                        type="button"
                        @click="openSessionStats(session)"
                    >
                        Stats
                    </button>

                    <button
                        type="button"
                        @click="openDeleteModal(session)"
                    >
                        🗑️
                    </button>

                </div>

            </article>

        </section>

    </main>

</template>


<style scoped>

.sessions-page {

    min-height: 100vh;

    padding: 6rem 3rem;

    background: #0f0f0f;

    color: white;

}


.page-header {

    max-width: 1100px;

    margin: 0 auto 3rem;

    display: flex;

    align-items: flex-end;

    justify-content: space-between;

    gap: 2rem;

}


.eyebrow {

    margin: 0 0 0.75rem;

    font-size: 0.7rem;

    font-weight: 700;

    letter-spacing: 0.25em;

    opacity: 0.6;

}


h1 {

    margin: 0;

    font-size: clamp(2.5rem, 6vw, 5rem);

    line-height: 0.95;

}


.subtitle {

    margin: 1rem 0 0;

    color: rgba(255, 255, 255, 0.6);

}


.create-button {

    padding: 0.9rem 1.3rem;

    border: none;

    border-radius: 8px;

    background: white;

    color: black;

    font: inherit;

    font-weight: 700;

    cursor: pointer;

}


.sessions-grid {

    max-width: 1100px;

    margin: 0 auto;

    display: grid;

    grid-template-columns:
        repeat(auto-fill, minmax(280px, 1fr));

    gap: 1.5rem;

}


.session-card {

    padding: 1.5rem;

    border: 1px solid rgba(255, 255, 255, 0.12);

    border-radius: 14px;

    background: rgba(255, 255, 255, 0.04);

}


.session-date {

    margin-bottom: 0.75rem;

    color: rgba(255, 255, 255, 0.5);

    font-size: 0.85rem;

}


.session-card h2 {

    margin: 0;

    font-size: 1.5rem;

}


.session-actions {

    display: flex;

    gap: 0.75rem;

    margin-top: 1.5rem;

}


.session-actions button {

    padding: 0.6rem 0.9rem;

    border: 1px solid rgba(255, 255, 255, 0.2);

    border-radius: 6px;

    background: transparent;

    color: white;

    cursor: pointer;

}


.status,
.error,
.empty-state {

    max-width: 1100px;

    margin: 3rem auto;

}


.error {

    color: #ff8a8a;

}


.empty-state {

    text-align: center;

}


.empty-state h2 {

    margin-bottom: 0.5rem;

}


.empty-state p {

    color: rgba(255, 255, 255, 0.6);

}


@media (max-width: 700px) {

    .sessions-page {

        padding: 5rem 1.5rem;

    }

    .page-header {

        align-items: flex-start;

        flex-direction: column;

    }

}

</style>