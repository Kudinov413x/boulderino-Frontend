<script setup lang="ts">

import { onMounted, ref, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getSession, getSessionDetails } from '@/services/sessionService'
import type { components } from '@/types/schema'
import { updateAttempt, deleteAttempt } from '@/services/attemptsService'
import CreateAttemptModal from '@/components/CreateAttemptModal.vue'
import EditAttemptModal from '@/components/EditAttemptsModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'


type SessionDetailsResponseDTO = components['schemas']['SessionDetailsResponseDTO']

type SessionResponseDTO = components['schemas']['SessionResponseDTO']


const route = useRoute()
const router = useRouter()
const details = ref<SessionDetailsResponseDTO[]>([])
const session = ref<SessionResponseDTO | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

async function loadSessionDetails() {
    loading.value = true
    error.value = null
    const sessionId = Number(route.params.id)
    if (Number.isNaN(sessionId)) {
        error.value = 'Ungültige Session-ID.'
        loading.value = false
        return
    }
    try {
        const [sessionResponse, detailsResponse] =
            await Promise.all([
                getSession(sessionId),
                getSessionDetails(sessionId)
            ])

        session.value = sessionResponse
        details.value = detailsResponse
    }
    catch (e) {
        error.value =
            e instanceof Error ? e.message : 'Session-Details konnten nicht geladen werden.'
    }
    finally {
        loading.value = false
    }
}


function goBack() {
    router.push('/sessions')
}


onMounted(() => {
    loadSessionDetails()
})

// Create Attempt Modal
const showCreateAttemptModal = ref(false)
const sessionId = Number(route.params.id)

// Update Attempts Modal
const showEditAttemptModal = ref(false)
const selectedAttempt = ref<SessionDetailsResponseDTO | null>(null)
const updatingAttemptId = ref<number | null>(null)

function openEditAttemptModal(attempt: SessionDetailsResponseDTO) {
    selectedAttempt.value = attempt
    showEditAttemptModal.value = true
    closeActionMenu()
}


async function handleAttemptUpdated() {
    showEditAttemptModal.value = false
    selectedAttempt.value = null
    await loadSessionDetails()
}

// Schnell Aktionen
async function toggleDone(detail: SessionDetailsResponseDTO) {
    if (detail.attemptId === undefined) {
        return
    }
    if (detail.boulderId === undefined) {
        return
    }

    updatingAttemptId.value = detail.attemptId
    error.value = null
    try {
        const response = await updateAttempt(
            detail.attemptId,
            {
                id: detail.attemptId,
                tries: detail.tries ?? 0,
                done: !detail.done,
                zone: detail.zone ?? false,
                sessionId,
                boulderId: detail.boulderId
            }
        )
        detail.done = response.done ?? detail.done
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Top konnte nicht aktualisiert werden.'
    }
    finally {
        updatingAttemptId.value = null
    }
}

async function toggleZone(detail: SessionDetailsResponseDTO) {
    if (detail.attemptId === undefined) {
        return
    }
    if (detail.boulderId === undefined) {
        return
    }
    updatingAttemptId.value = detail.attemptId
    error.value = null
    try {
        const response = await updateAttempt(
            detail.attemptId,
            {
                id: detail.attemptId,
                tries: detail.tries ?? 0,
                done: detail.done ?? false,
                zone: !detail.zone,
                sessionId,
                boulderId: detail.boulderId
            }
        )
        detail.zone = response.zone ?? detail.zone
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Zone konnte nicht aktualisiert werden.'
    }
    finally {
        updatingAttemptId.value = null
    }
}

async function incrementTries(detail: SessionDetailsResponseDTO) {
    if (detail.attemptId === undefined) {
        return
    }
    if (detail.boulderId === undefined) {
        return
    }
    updatingAttemptId.value = detail.attemptId
    error.value = null
    try {
        const newTries = (detail.tries ?? 0) + 1
        const response = await updateAttempt(
            detail.attemptId,
            {
                id: detail.attemptId,
                tries: newTries,
                done: detail.done ?? false,
                zone: detail.zone ?? false,
                sessionId,
                boulderId: detail.boulderId
            }
        )
        detail.tries = response.tries ?? newTries
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Versuche konnten nicht aktualisiert werden.'
    }
    finally {
        updatingAttemptId.value = null
    }
}


// Boulder Status
function getBoulderStatus(detail: SessionDetailsResponseDTO): string {
    if (detail.flashed) {
        return '⚡'
    }
    if (detail.firstAscent) {
        return '🏆'
    }
    return '⛰️'
}

// Delete Attempt
const showDeleteAttemptModal = ref(false)
const selectedAttemptToDelete = ref<SessionDetailsResponseDTO | null>(null)
const deletingAttemptId = ref<number | null>(null)

function openDeleteAttemptModal(detail: SessionDetailsResponseDTO) {
    selectedAttemptToDelete.value = detail
    showDeleteAttemptModal.value = true
    closeActionMenu()
}

function closeDeleteAttemptModal() {
    if (deletingAttemptId.value !== null) {
        return
    }
    showDeleteAttemptModal.value = false
    selectedAttemptToDelete.value = null
}

async function handleDeleteAttempt() {
    const attemptId = selectedAttemptToDelete.value?.attemptId
    if (attemptId === undefined) {
        return
    }
    deletingAttemptId.value = attemptId
    error.value = null
    try {
        await deleteAttempt(attemptId)
        showDeleteAttemptModal.value = false
        selectedAttemptToDelete.value = null
        await loadSessionDetails()
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Attempt konnte nicht gelöscht werden.'
    }
    finally {
        deletingAttemptId.value = null
    }
}


// Dropdown-Menü
const openMenuAttemptId = ref<number | null>(null)

function toggleActionMenu(attemptId: number | undefined) {
    if (attemptId === undefined) {
        return
    }

    openMenuAttemptId.value = openMenuAttemptId.value === attemptId ? null : attemptId
}

function closeActionMenu() {
    openMenuAttemptId.value = null
}


function handleDocumentClick() {
    closeActionMenu()
}


onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
})


onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
})

</script>


<template>

    <main class="session-details-page">

        <header class="page-header">

            <div>

                <p class="eyebrow">
                    ABOVE THE CLOUDS
                </p>

                <h1>
                    Session Details
                </h1>

                <p class="subtitle">
                    Deine Boulder im
                    {{ session?.location }}
                    vom
                    {{ session?.date }}
                </p>

            </div>


            <div class="header-actions">

                <button
                    class="create-button"
                    type="button"
                    @click="showCreateAttemptModal = true"
                >
                    Neuer Versuch
                </button>

                <button
                    class="back-button"
                    type="button"
                    @click="goBack"
                >
                    ← Zurück
                </button>

            </div>


            <CreateAttemptModal
                v-if="showCreateAttemptModal"
                :session-id="sessionId"
                @close="showCreateAttemptModal = false"
                @created="handleAttemptUpdated"
            />


            <EditAttemptModal
                v-if="
                    showEditAttemptModal &&
                    selectedAttempt
                "
                :attempt="selectedAttempt"
                :session-id="sessionId"
                @close="
                    showEditAttemptModal = false;
                    selectedAttempt = null
                "
                @updated="handleAttemptUpdated"
            />


            <ConfirmDeleteModal
                v-if="showDeleteAttemptModal && selectedAttemptToDelete"
                title="Attempt löschen?"
                message="Möchtest du diesen Versuch wirklich löschen?"
                :item-name="selectedAttemptToDelete.boulderName"
                :deleting="deletingAttemptId !== null"
                @close="closeDeleteAttemptModal"
                @confirm="handleDeleteAttempt"
            />

        </header>


        <p
            v-if="loading"
            class="status"
        >
            Details werden geladen...
        </p>


        <p
            v-else-if="error"
            class="error"
        >
            {{ error }}
        </p>


        <div
            v-else-if="details.length === 0"
            class="empty-state"
        >

            <h2>
                Keine Boulder gefunden.
            </h2>

            <p>
                Für diese Session wurden noch keine
                Versuche gespeichert.
            </p>

        </div>


        <section
            v-else
            class="details-grid"
        >

            <article
                v-for="detail in details"
                :key="detail.attemptId"
                class="detail-card"
            >

                <div class="detail-header">

                    <div class="detail-title">

                        <p class="detail-label">
                            BOULDER {{ getBoulderStatus(detail) }}
                        </p>

                        <h2>
                            {{ detail.boulderName }}
                        </h2>

                    </div>


                    <div class="detail-actions">

                        <div class="grade">
                            {{ detail.grade }}
                        </div>


                        <div
                            class="action-menu"
                            @click.stop
                        >

                            <button
                                type="button"
                                class="menu-button"
                                title="Aktionen"
                                aria-label="Attempt-Aktionen öffnen"
                                :aria-expanded="openMenuAttemptId === detail.attemptId"
                                @click="toggleActionMenu(detail.attemptId)"
                            >
                                ⋮
                            </button>


                            <div
                                v-if="openMenuAttemptId === detail.attemptId"
                                class="action-dropdown"
                            >

                                <button
                                    type="button"
                                    class="dropdown-item"
                                    :disabled="updatingAttemptId === detail.attemptId"
                                    @click="openEditAttemptModal(detail)"
                                >

                                    <span>
                                        ✏️
                                    </span>

                                    <span>
                                        Bearbeiten
                                    </span>

                                </button>


                                <button
                                    type="button"
                                    class="dropdown-item delete-item"
                                    :disabled="
                                        updatingAttemptId === detail.attemptId ||
                                        deletingAttemptId === detail.attemptId
                                    "
                                    @click="
                                        openDeleteAttemptModal(detail)
                                    "
                                >

                                    <span>
                                        🗑️
                                    </span>

                                    <span>
                                        Löschen
                                    </span>

                                </button>

                            </div>

                        </div>

                    </div>

                </div>


                <div class="result-row">

                    <button
                        type="button"
                        class="result result-button"
                        :class="{ successful: detail.done }"
                        :disabled="updatingAttemptId === detail.attemptId"
                        :aria-pressed="detail.done"
                        title="Top umschalten"
                        @click="toggleDone(detail)"
                    >

                        <span class="result-label">
                            Top
                        </span>

                        <span class="result-value">
                            {{ detail.done ? 'Ja' : 'Nein' }}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="result result-button"
                        :class="{ successful: detail.zone }"
                        :disabled="updatingAttemptId === detail.attemptId"
                        :aria-pressed="detail.zone"
                        title="Zone umschalten"
                        @click="toggleZone(detail)"
                    >

                        <span class="result-label">
                            Zone
                        </span>

                        <span class="result-value">
                            {{ detail.zone ? 'Ja' : 'Nein' }}
                        </span>

                    </button>


                    <button
                        type="button"
                        class="result result-button"
                        :disabled="updatingAttemptId === detail.attemptId"
                        title="Versuch hinzufügen"
                        @click="incrementTries(detail)"
                    >

                        <span class="result-label">
                            Versuche
                        </span>

                        <span class="result-value">
                            {{ detail.tries }}
                        </span>

                    </button>

                </div>


                <div class="detail-info">

                    <div class="info-item">

                        <span>
                            Griffart
                        </span>

                        <strong>
                            {{ detail.gripType }}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Wandneigung
                        </span>

                        <strong>
                            {{ detail.wallAngle }}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Routencharakter
                        </span>

                        <strong>
                            {{ detail.routeCharacter }}
                        </strong>

                    </div>


                    <div class="info-item">

                        <span>
                            Kletterstil
                        </span>

                        <strong>
                            {{ detail.climbingStyle }}
                        </strong>

                    </div>

                </div>

            </article>

        </section>

    </main>

</template>


<style scoped>

.session-details-page {
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
    font-size: clamp(
        2.5rem,
        6vw,
        5rem
    );
    line-height: 0.95;
}


.subtitle {
    margin: 1rem 0 0;
    color: rgba(255, 255, 255, 0.6);
}


.back-button {
    padding: 0.9rem 1.3rem;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    background: transparent;
    color: white;
    font: inherit;
    font-weight: 700;
    cursor: pointer;
    transition:
        background 0.2s ease,
        border-color 0.2s ease;
}


.back-button:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.4);
}


.details-grid {
    max-width: 1100px;
    margin: 0 auto;
    display: grid;
    grid-template-columns:
        repeat(auto-fill, minmax(320px, 1fr));
    gap: 1.5rem;
}


.detail-card {

    padding: 1.5rem;

    border: 1px solid rgba(255, 255, 255, 0.12);

    border-radius: 14px;

    background: rgba(255, 255, 255, 0.04);

    transition:
        background 0.2s ease,
        border-color 0.2s ease,
        transform 0.2s ease;

    overflow-wrap: anywhere;

    word-break: break-word;

}


.detail-card:hover {

    background: rgba(255, 255, 255, 0.06);

    border-color: rgba(255, 255, 255, 0.2);

    transform: translateY(-2px);

}


.detail-header {

    display: flex;

    align-items: flex-start;

    justify-content: space-between;

    gap: 1rem;

    margin-bottom: 1.5rem;

}


.detail-title {

    min-width: 0;

    flex: 1;

}


.detail-label {

    margin: 0 0 0.4rem;

    color: rgba(255, 255, 255, 0.4);

    font-size: 0.65rem;

    font-weight: 700;

    letter-spacing: 0.2em;

}


.detail-card h2 {

    margin: 0;

    font-size: 1.5rem;

}


.grade {

    padding: 0.5rem 0.5rem;

    border: 1px solid rgba(255, 255, 255, 0.15);

    border-radius: 6px;

    color: rgba(255, 255, 255, 0.8);

    font-size: 0.85rem;

    font-weight: 700;

    white-space: nowrap;

}


.result-row {

    display: grid;

    grid-template-columns: repeat(3, 1fr);

    gap: 0.75rem;

    margin-bottom: 1.5rem;

}


.result {

    padding: 0.75rem;

    border-radius: 8px;

    background: rgba(255, 255, 255, 0.04);

    text-align: center;

}


.result-label {

    display: block;

    margin-bottom: 0.3rem;

    color: rgba(255, 255, 255, 0.45);

    font-size: 0.7rem;

}


.result-value {

    font-size: 0.95rem;

    font-weight: 700;

}


.result.successful {

    background: rgba(255, 255, 255, 0.09);

}


.result.successful .result-value {

    color: white;

}


.detail-info {

    display: grid;

    grid-template-columns: 1fr 1fr;

    gap: 1rem;

    padding-top: 1.25rem;

    border-top: 1px solid rgba(255, 255, 255, 0.08);

}


.info-item {

    display: flex;

    flex-direction: column;

    gap: 0.3rem;

}


.info-item span {

    color: rgba(255, 255, 255, 0.45);

    font-size: 0.75rem;

}


.info-item strong {

    font-size: 0.9rem;

    font-weight: 500;

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


/* Header-Aktionen */

.header-actions {

    display: flex;

    align-items: center;

    gap: 0.75rem;

    flex-shrink: 0;

}


/* Detail-Aktionen */

.detail-actions {

    display: flex;

    align-items: center;

    gap: 0.6rem;

    flex-shrink: 0;

}


/* Dropdown-Menü */

.action-menu {

    position: relative;

}


.menu-button {

    display: flex;

    align-items: center;

    justify-content: center;

    width: auto;

    height: auto;

    padding: 8px;

    margin: -8px;

    border: none;

    background: transparent;

    color: rgba(255, 255, 255, 0.45);

    font: inherit;

    font-size: 1.4rem;

    line-height: 1;

    cursor: pointer;

    transition:
        color 0.15s ease,
        opacity 0.15s ease;

}


.menu-button:hover,
.menu-button[aria-expanded="true"] {

    border: none;

    background: transparent;

    color: white;

}


.action-dropdown {

    position: absolute;

    top: calc(100% + 0.5rem);

    right: 0;

    z-index: 20;

    min-width: 150px;

    padding: 0.35rem;

    border: 1px solid rgba(255, 255, 255, 0.14);

    border-radius: 10px;

    background: rgba(20, 20, 20, 0.96);

    box-shadow:
        0 12px 30px rgba(0, 0, 0, 0.45),
        0 2px 8px rgba(0, 0, 0, 0.25);

    backdrop-filter: blur(12px);

}


.dropdown-item {

    width: 100%;

    display: flex;

    align-items: center;

    gap: 0.65rem;

    padding: 0.65rem 0.75rem;

    border: 0;

    border-radius: 7px;

    background: transparent;

    color: rgba(255, 255, 255, 0.85);

    font: inherit;

    font-size: 0.85rem;

    text-align: left;

    cursor: pointer;

    transition:
        background 0.15s ease,
        color 0.15s ease;

}


.dropdown-item:hover {

    background: rgba(255, 255, 255, 0.08);

    color: white;

}


.dropdown-item.delete-item {

    color: rgba(255, 150, 150, 0.9);

}


.dropdown-item.delete-item:hover {

    background: rgba(255, 100, 100, 0.08);

    color: #ffb0b0;

}


.dropdown-item:disabled {

    opacity: 0.5;

    cursor: not-allowed;

}


.result-button {

    width: 100%;

    font: inherit;

    color: inherit;

    text-align: left;

    cursor: pointer;

}


.result-button:hover {

    background: rgba(255, 255, 255, 0.04);

}


.result-button:disabled {

    opacity: 0.5;

    cursor: not-allowed;

}


@media (max-width: 700px) {

    .session-details-page {

        padding: 5rem 1.5rem;

    }


    .page-header {

        align-items: flex-start;

        flex-direction: column;

    }


    .details-grid {

        grid-template-columns: 1fr;

    }


    .result-row {

        grid-template-columns: repeat(3, 1fr);

    }

}


@media (max-width: 450px) {

    .detail-info {

        grid-template-columns: 1fr;

    }

}

</style>