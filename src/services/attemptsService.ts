import type { components } from '@/types/schema'

type AttemptsCreateDTO =
    components['schemas']['AttemptsCreateDTO']

type AttemptsResponseDTO =
    components['schemas']['AttemptsResponseDTO']


const API_URL = 'http://localhost:8080'


function getAuthHeaders() {

    const token = localStorage.getItem('token')

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

}


export async function createAttempt(request: AttemptsCreateDTO): Promise<AttemptsResponseDTO> {

    const response = await fetch(
        `${API_URL}/attempts`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        throw new Error(
            `Attempt konnte nicht erstellt werden: ${response.status}`
        )

    }

    return response.json()

}

export async function updateAttempt(id: number, request: AttemptsResponseDTO): Promise<AttemptsResponseDTO> {

    const response = await fetch(
        `${API_URL}/attempts/${id}`,
        {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        throw new Error(
            `Attempt konnte nicht aktualisiert werden: ${response.status}`
        )

    }

    return response.json()

}

export async function deleteAttempt( id: number ): Promise<void> {
    const response = await fetch( `${API_URL}/attempts/${id}`, { method: 'DELETE', headers: getAuthHeaders() } )
    if (!response.ok) {
        throw new Error( `Attempt konnte nicht gelöscht werden: ${response.status}` )
    }
}