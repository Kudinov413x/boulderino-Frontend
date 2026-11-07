import type { components } from '@/types/schema'

type BoulderCreateDTO =
    components['schemas']['BoulderCreateDTO']

type BoulderResponseDTO =
    components['schemas']['BoulderResponseDTO']


const API_URL = 'http://localhost:8080'


function getAuthHeaders() {

    const token = localStorage.getItem('token')

    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    }

}


export async function getBoulders(): Promise<BoulderResponseDTO[]> {

    const response = await fetch(
        `${API_URL}/boulders`,
        {
            method: 'GET',
            headers: getAuthHeaders()
        }
    )

    if (!response.ok) {

        throw new Error(
            `Boulder konnten nicht geladen werden: ${response.status}`
        )

    }

    return response.json()

}


export async function createBoulder(request: BoulderCreateDTO): Promise<BoulderResponseDTO> {

    const response = await fetch(
        `${API_URL}/boulders`,
        {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        throw new Error(
            `Boulder konnte nicht erstellt werden: ${response.status}`
        )

    }

    return response.json()

}

export async function updateBoulder( id: number, data: BoulderCreateDTO): Promise<BoulderResponseDTO> {

    const response = await fetch(
        `${API_URL}/boulders/${id}`,
        {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${localStorage.getItem('token')}`
            },
            body: JSON.stringify(data)
        }
    )

    if (!response.ok) {
        throw new Error(
            'Boulder konnte nicht aktualisiert werden.'
        )
    }

    return response.json()
}

export async function deleteBoulder( id: number ): Promise<void> {
    const response = await fetch( `${API_URL}/boulders/${id}`, { method: 'DELETE', headers: getAuthHeaders() } )
    if (!response.ok) {
        throw new Error( `Boulder konnte nicht gelöscht werden: ${response.status}` )
    }
}