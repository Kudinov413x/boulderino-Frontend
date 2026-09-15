import type { TestDTO } from '@/types/testDTO'

const API_URL = 'http://localhost:8080'

export async function getBoulder(): Promise<TestDTO> {
    const response = await fetch(`${API_URL}/frontend/test/FrontendTest`, {
        method: 'POST'
    })

    if (!response.ok) {
        throw new Error(`Fehler beim Laden der Testdaten: ${response.status}`)
    }

    return response.json()
}