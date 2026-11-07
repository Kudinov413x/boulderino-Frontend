<script setup lang="ts">

import { onMounted, ref, computed, onBeforeUnmount } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { getBoulders, deleteBoulder } from '@/services/boulderService'
import type { components } from '@/types/schema'
import BoulderEditModal from '@/components/BoulderEditModal.vue'
import ConfirmDeleteModal from '@/components/ConfirmDeleteModal.vue'
import BoulderSessionsModal from '@/components/FindSessionForBoulderModal.vue'


type BoulderResponseDTO = components['schemas']['BoulderResponseDTO']

const boulders = ref<BoulderResponseDTO[]>([])
const loading = ref(false)
const error = ref<string | null>(null)
const route = useRoute()
const router = useRouter()
const searchTerm = ref('')

const clearSearch = () => {
    searchTerm.value = ''

    router.replace({
        path: '/boulders'
    })
}

async function loadBoulders() {
    loading.value = true
    error.value = null
    try {
        boulders.value = await getBoulders()
    }
    catch (e) {
        error.value =  e instanceof Error ? e.message : 'Boulder konnten nicht geladen werden.'
    }
    finally {
        loading.value = false
    }
}


const filteredBoulders = computed(() => {
    const search = searchTerm.value.trim().toLowerCase()

    return boulders.value.filter((boulder) => {

        // Statusfilter über Suchbegriffe
        const isTopped = boulder.firstAscent === true
        const isUntopped = !isTopped
        const hasFlash = boulder.flashed === true
        const hasZone = (boulder.totalZones ?? 0) >= 1

        // Getoppte Boulder
        if (['top', 'getoppt', 'geschafft'].includes(search)) {
            return isTopped
        }

        // Nicht getoppte Boulder / Projekte
        if (['projekt', 'projekte', 'offen', 'nicht getoppt', 'untopped'].includes(search)) {
            return isUntopped
        }

        // Flash-Boulder
        if (['flash', 'geflasht'].includes(search)) {
            return hasFlash
        }

        // Boulder mit Zone
        if (['zone', 'zonen'].includes(search)) {
            return hasZone
        }

        // Normale Textsuche
        if (!search) {
            return true
        }

        const searchableValues = [
            boulder.name,
            boulder.grade,
            boulder.gripType,
            boulder.wallAngle,
            boulder.routeCharacter,
            boulder.climbingStyle
        ]

        return searchableValues.some((value) =>
            value?.toString().toLowerCase().includes(search)
        )
    })
})


onMounted(() => {
    const search = route.query.search

    if (typeof search === 'string') {
        searchTerm.value = search
    }

    loadBoulders()
})


// Update Boulders
const showEditModal = ref(false)
const selectedBoulder = ref<BoulderResponseDTO | null>(null)

function openEditModal(boulder: BoulderResponseDTO) {
    selectedBoulder.value = boulder
    showEditModal.value = true
    closeActionMenu()
}


function closeEditModal() {
    showEditModal.value = false
    selectedBoulder.value = null
}


async function handleBoulderUpdated() {
    closeEditModal()
    await loadBoulders()
}

//Delete Boulders
const showDeleteModal = ref(false)
const selectedBoulderToDelete = ref<BoulderResponseDTO | null>(null)
const deletingBoulder = ref(false)

function openDeleteModal(boulder: BoulderResponseDTO) {
    selectedBoulderToDelete.value = boulder
    showDeleteModal.value = true
    closeActionMenu()
}


function closeDeleteModal() {

    if (deletingBoulder.value) {
        return
    }
    showDeleteModal.value = false
    selectedBoulderToDelete.value = null
}


async function handleDeleteBoulder() {

    const boulderId = selectedBoulderToDelete.value?.id
    if (boulderId === undefined) {
        return
    }
    deletingBoulder.value = true
    error.value = null
    try {
        await deleteBoulder(boulderId)
        showDeleteModal.value = false
        selectedBoulderToDelete.value = null
        await loadBoulders()
    }
    catch (e) {
        error.value = e instanceof Error ? e.message : 'Boulder konnte nicht gelöscht werden.'

    } finally {
        deletingBoulder.value = false
    }
}

// Dropdown-Menü
const openMenuBoulderId = ref<number | null>(null)


function toggleActionMenu(boulderId: number | undefined) {
    if (boulderId === undefined) {
        return
    }
    openMenuBoulderId.value = openMenuBoulderId.value === boulderId ? null : boulderId
}


function closeActionMenu() {
    openMenuBoulderId.value = null
}


function handleDocumentClick() {
    closeActionMenu()
}

// Find Session By Boulder Modal
const showSessionsModal = ref(false)
const selectedBoulderForSessions =
    ref<BoulderResponseDTO | null>(null)

function openSessionsModal(boulder: BoulderResponseDTO) {
    selectedBoulderForSessions.value = boulder
    showSessionsModal.value = true

    closeActionMenu()
}

function closeSessionsModal() {
    showSessionsModal.value = false
    selectedBoulderForSessions.value = null
}

function openSelectedSession(sessionId: number) {
    closeSessionsModal()

    router.push({
        name: 'session-details',
        params: {
            id: sessionId
        }
    })
}


onMounted(() => {
    document.addEventListener('click', handleDocumentClick)
})


onBeforeUnmount(() => {
    document.removeEventListener('click', handleDocumentClick)
})

</script>


<template>

    <main class="boulder-page">

        <header class="page-header">

            <div>

                <p class="eyebrow">
                    ABOVE THE CLOUDS
                </p>

                <h1>
                    Meine Boulder
                </h1>

                <p class="subtitle">
                    Deine gespeicherten Boulder
                </p>

            </div>

        </header>


        <section class="boulder-content">

            <div
                v-if="!loading && !error && boulders.length > 0"
                class="toolbar"
            >

                <div class="search-wrapper">
                    <input
                        v-model="searchTerm"
                        class="search-input"
                        type="search"
                        placeholder="Boulder, Grad, Projekt, Flash..."
                        aria-label="Boulder oder Status suchen"
                    />

                    <button
                        v-if="searchTerm"
                        type="button"
                        class="clear-search"
                        aria-label="Suche zurücksetzen"
                        title="Suche zurücksetzen"
                        @click="clearSearch"
                    >
                        ×
                    </button>
                </div>

                <span class="boulder-count">
                    {{ filteredBoulders.length }}
                    Boulder
                </span>

            </div>


            <p
                v-if="loading"
                class="status"
            >
                Boulder werden geladen...
            </p>


            <p
                v-else-if="error"
                class="error"
            >
                {{ error }}
            </p>


            <div
                v-else-if="boulders.length === 0"
                class="empty-state"
            >

                <h2>
                    Keine Boulder gefunden.
                </h2>

                <p>
                    Du hast bisher noch keine Boulder gespeichert.
                </p>

            </div>


            <div
                v-else-if="filteredBoulders.length === 0"
                class="empty-state"
            >

                <h2>
                    Kein Boulder gefunden.
                </h2>

                <p>
                    Für "{{ searchTerm }}" gibt es keinen passenden Boulder.
                </p>

            </div>


            <section
                v-else
                class="boulder-grid"
            >

                <article
                    v-for="boulder in filteredBoulders"
                    :key="boulder.id"
                    class="boulder-card"
                    tabindex="0"
                    @click="openSessionsModal(boulder)"
                    @keydown.enter="openSessionsModal(boulder)"
                    @keydown.space.prevent="openSessionsModal(boulder)"
                >

                    <!-- Header -->

                    <div class="card-header">

                        <div class="card-title">

                            <p class="detail-label">
                                BOULDER
                            </p>

                            <h2>
                                {{ boulder.name }}
                            </h2>

                        </div>


                        <div class="card-actions">

                            <div class="grade">
                                {{ boulder.grade }}
                            </div>


                            <div
                                class="action-menu"
                                @click.stop
                            >

                                <button
                                    type="button"
                                    class="menu-button"
                                    title="Aktionen"
                                    aria-label="Boulder-Aktionen öffnen"
                                    :aria-expanded="openMenuBoulderId === boulder.id"
                                    @click="toggleActionMenu(boulder.id)"
                                >
                                    ⋮
                                </button>


                                <div
                                    v-if="openMenuBoulderId === boulder.id"
                                    class="action-dropdown"
                                >

                                    <button
                                        type="button"
                                        class="dropdown-item"
                                        @click="openEditModal(boulder)"
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
                                        :disabled="deletingBoulder && selectedBoulderToDelete?.id === boulder.id"
                                        @click="openDeleteModal(boulder)"
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


                    <!-- Boulder Status -->

                    <div class="boulder-status">

                        <!-- Flash -->

                        <span
                            v-if="boulder.flashed"
                            class="status-badge"
                            title="Flash"
                        >
                            ⚡ Flash
                        </span>


                        <!-- Top -->

                        <span
                            v-if="boulder.firstAscent"
                            class="status-badge status-badge-tooltip"
                        >

                            🏆 Top

                            <span
                                v-if="boulder.firstAscentDate"
                                class="top-date-tooltip"
                            >
                                {{ boulder.firstAscentDate }}
                            </span>

                        </span>


                        <!-- Zone -->

                        <span
                            v-if="(boulder.totalZones ?? 0) >= 1"
                            class="status-badge"
                            title="Zone"
                        >
                            🏅 Zone
                        </span>

                    </div>


                    <!-- Boulder Eigenschaften -->

                    <div class="boulder-info">

                        <div class="info-item">

                            <span>
                                Griffart
                            </span>

                            <strong>
                                {{ boulder.gripType }}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Wandneigung
                            </span>

                            <strong>
                                {{ boulder.wallAngle }}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Routencharakter
                            </span>

                            <strong>
                                {{ boulder.routeCharacter }}
                            </strong>

                        </div>


                        <div class="info-item">

                            <span>
                                Kletterstil
                            </span>

                            <strong>
                                {{ boulder.climbingStyle }}
                            </strong>

                        </div>

                    </div>


                    <!-- Boulder Statistik -->

                    <div class="boulder-stats">

                        <div class="stat-item">

                            <strong>
                                {{ boulder.totalTries }}
                            </strong>

                            <span>
                                Versuche
                            </span>

                        </div>


                        <div class="stat-item">

                            <strong>
                                {{ boulder.totalTops }}
                            </strong>

                            <span>
                                Tops
                            </span>

                        </div>


                        <div class="stat-item">

                            <strong>
                                {{ boulder.totalZones }}
                            </strong>

                            <span>
                                Zones
                            </span>

                        </div>

                    </div>

                </article>

            </section>

        </section>


        <BoulderEditModal
            v-if="showEditModal && selectedBoulder"
            :boulder="selectedBoulder"
            @close="closeEditModal"
            @updated="handleBoulderUpdated"
        />

        <ConfirmDeleteModal
            v-if="showDeleteModal && selectedBoulderToDelete"
            title="Boulder löschen?"
            message="Möchtest du diesen Boulder wirklich löschen?"
            :item-name="selectedBoulderToDelete.name"
            :deleting="deletingBoulder"
            @close="closeDeleteModal"
            @confirm="handleDeleteBoulder"
        />

        <BoulderSessionsModal
            v-if="showSessionsModal && selectedBoulderForSessions"
            :boulder="selectedBoulderForSessions"
            @close="closeSessionsModal"
            @open-session="openSelectedSession"
        />

    </main>

</template>


<style scoped>

.boulder-page {
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


.boulder-content {

    max-width: 1100px;

    margin: 0 auto;
}


.toolbar {

    display: flex;

    align-items: center;

    justify-content: space-between;

    gap: 1rem;

    margin-bottom: 1.5rem;
}

.search-wrapper {
    position: relative;
    width: 100%;
    max-width: 360px;
}

.search-input {
    width: 100%;
    max-width: 360px;
    box-sizing: border-box;
    padding: 0.85rem 1rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    outline: none;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font: inherit;
}


.search-input::placeholder {
    color: rgba(255, 255, 255, 0.35);
}


.search-input:focus {
    border-color: rgba(255, 255, 255, 0.4);
    background: rgba(255, 255, 255, 0.07);
}


.clear-search {
    position: absolute;
    top: 50%;
    right: 0.65rem;
    transform: translateY(-50%);

    display: flex;
    align-items: center;
    justify-content: center;

    width: 1.75rem;
    height: 1.75rem;

    padding: 0;
    border: none;
    border-radius: 50%;

    background: transparent;
    color: rgba(255, 255, 255, 0.45);

    font-size: 1.25rem;
    line-height: 1;

    cursor: pointer;

    transition:
        background 0.15s ease,
        color 0.15s ease;
}

.clear-search:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
}

.clear-search:focus-visible {
    outline: 2px solid rgba(255, 255, 255, 0.5);
    outline-offset: 2px;
}

.boulder-count {
    color: rgba(255, 255, 255, 0.45);
    font-size: 0.8rem;
    white-space: nowrap;
}


.boulder-grid {
    display: grid;
    grid-template-columns: repeat( auto-fill, minmax(320px, 1fr) );
    gap: 1.5rem;
}


.boulder-card {
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


.boulder-card:hover {
    background: rgba(255, 255, 255, 0.06);
    border-color: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
}


.card-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 1rem;
    margin-bottom: 1.25rem;
}


.card-title {
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


.boulder-card h2 {
    margin: 0;
    font-size: 1.5rem;
}


.grade {
    padding: 0.45rem 0.7rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 6px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    font-weight: 700;
    white-space: nowrap;
}


/* Boulder Status */
.boulder-status {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    min-height: 1.5rem;
    margin-bottom: 1rem;
}


.status-badge {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0.35rem 0.6rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.04);
    color: rgba(255, 255, 255, 0.75);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.02em;
}


/* Top Datum */
.status-badge-tooltip {
    cursor: default;
}


.top-date-tooltip {
    position: absolute;
    left: 50%;
    top: calc(100% + 0.5rem);
    transform: translateX(-50%);
    z-index: 10;
    padding: 0.45rem 0.65rem;
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 7px;
    background: rgba(15, 15, 15, 0.95);
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.7rem;
    font-weight: 500;
    white-space: nowrap;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.35);
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition:
        opacity 0.15s ease,
        visibility 0.15s ease;
}

.status-badge-tooltip:hover .top-date-tooltip {
    opacity: 1;
    visibility: visible;
}


/* Boulder Eigenschaften */

.boulder-info {
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


/* Boulder Statistik */

.boulder-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-top: 1.25rem;
    padding-top: 1.25rem;
    border-top: 1px solid rgba(255, 255, 255, 0.08);
}


.stat-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25rem;
    padding: 0.75rem 0.5rem;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.025);
}


.stat-item strong {
    font-size: 1.1rem;
    font-weight: 700;
}


.stat-item span {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.7rem;
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


.card-actions {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    flex-shrink: 0;
}

@media (max-width: 700px) {
    .boulder-page {
        padding: 5rem 1.5rem;
    }

    .boulder-grid {
        grid-template-columns: 1fr;
    }

    .toolbar {
        align-items: stretch;
        flex-direction: column;
    }

    .search-input {
        max-width: none;
    }
}


@media (max-width: 450px) {
    .boulder-info {
        grid-template-columns: 1fr;
    }

    .boulder-stats {
        gap: 0.5rem;
    }

    .stat-item {
        padding: 0.65rem 0.25rem;
    }
}

/* Dropdown-Menu */
.action-menu {
    position: relative;
}

.menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: auto; height: auto;
    padding: 20;
    margin: -8px;
    border: none;
    background: transparent;
    color: rgba(255, 255, 255, 0.45);
    font: 1.25rem;
    font-size: 1.4rem;
    line-height: 1;
    cursor: pointer;
    transition: color 0.15s ease, opacity 0.15s ease;
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


</style>