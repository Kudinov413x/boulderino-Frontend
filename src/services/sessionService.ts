import type { components } from '@/types/schema'

type SessionCreateDTO =
    components['schemas']['SessionCreateDTO']

type SessionUpdateDTO =
    components['schemas']['SessionUpdateDTO']

type SessionResponseDTO =
    components['schemas']['SessionResponseDTO']

type SessionDetailsResponseDTO =
    components['schemas']['SessionDetailsResponseDTO']


const API_URL = 'http://localhost:8080'


function getAuthHeaders() {

    const token = localStorage.getItem('token')

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

}


export async function getSessions(): Promise<SessionResponseDTO[]> {

    const response = await fetch(
        `${API_URL}/sessions`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {

        throw new Error(
            `Sessions konnten nicht geladen werden: ${response.status}`
        )

    }

    return response.json()

}


export async function getSession(
    id: number
): Promise<SessionResponseDTO> {

    const response = await fetch(
        `${API_URL}/sessions/${id}`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {

        throw new Error(
            `Session konnte nicht geladen werden: ${response.status}`
        )

    }

    return response.json()

}


export async function createSession(
    request: SessionCreateDTO
): Promise<SessionResponseDTO> {

    const response = await fetch(
        `${API_URL}/sessions`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        throw new Error(
            `Session konnte nicht erstellt werden: ${response.status}`
        )

    }

    return response.json()

}


export async function updateSession(
    id: number,
    request: SessionUpdateDTO
): Promise<SessionResponseDTO> {

    const response = await fetch(
        `${API_URL}/sessions/${id}`,
        {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        throw new Error(
            `Session konnte nicht aktualisiert werden: ${response.status}`
        )

    }

    return response.json()

}


export async function deleteSession(
    id: number
): Promise<void> {

    const response = await fetch(
        `${API_URL}/sessions/${id}`,
        {
            method: 'DELETE',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {

        throw new Error(
            `Session konnte nicht gelöscht werden: ${response.status}`
        )

    }

}


export async function getSessionDetails(
    sessionId: number
): Promise<SessionDetailsResponseDTO[]> {

    const response = await fetch(
        `${API_URL}/sessions/${sessionId}/details`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {

        throw new Error(
            `Session-Details konnten nicht geladen werden: ${response.status}`
        )

    }

    return response.json()

}

export async function getTodaySessions(): Promise<SessionResponseDTO[]> {
    const response = await fetch(
        `${API_URL}/sessions/today`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error(
            `Heutige Sessions konnten nicht geladen werden: ${response.status}`
        )
    }

    return response.json()
}


export async function resetSessionName(sessionId: number): Promise<SessionResponseDTO> {
    const response = await fetch(
        `${API_URL}/sessions/${sessionId}/reset-name`,
        {
            method: 'PUT',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error(
            `Session-Name konnte nicht zurückgesetzt werden: ${response.status}`
        )
    }

    return response.json()
}

export async function getLatestSession(): Promise<SessionResponseDTO | null> {
    const response = await fetch(
        `${API_URL}/sessions/latest`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (response.status === 204) {
        return null
    }

    if (!response.ok) {
        throw new Error(
            `Letzte Session konnte nicht geladen werden: ${response.status}`
        )
    }

    return response.json()
}

export async function getSessionsByBoulder(
    boulderId: number
): Promise<SessionResponseDTO[]> {
    const response = await fetch(
        `${API_URL}/sessions/boulder/${boulderId}`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {
        throw new Error(
            `Sessions für den Boulder konnten nicht geladen werden: ${response.status}`
        )
    }

    return response.json()
}