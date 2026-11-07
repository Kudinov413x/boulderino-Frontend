import { useAuthStore } from '@/stores/auth'

const API_URL = 'http://localhost:8080'

async function request<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<T> {

    const authStore = useAuthStore()

    const headers = new Headers(options.headers)

    headers.set('Content-Type', 'application/json')

    if (authStore.token) {
        headers.set(
            'Authorization',
            `Bearer ${authStore.token}`
        )
    }

    const response = await fetch(
        `${API_URL}${endpoint}`,
        {
            ...options,
            headers
        }
    )

    if (!response.ok) {

        if (response.status === 401) {
            authStore.logout()
            throw new Error('Nicht autorisiert.')
        }

        if (response.status === 403) {
            throw new Error('Zugriff verweigert.')
        }

        throw new Error(
            `API-Fehler: ${response.status}`
        )
    }

    if (response.status === 204) {
        return undefined as T
    }

    return response.json()
}

export const api = {

    get<T>(endpoint: string): Promise<T> {
        return request<T>(
            endpoint,
            {
                method: 'GET'
            }
        )
    },

    post<T>(
        endpoint: string,
        body?: unknown
    ): Promise<T> {

        return request<T>(
            endpoint,
            {
                method: 'POST',
                body: body
                    ? JSON.stringify(body)
                    : undefined
            }
        )
    },

    put<T>(
        endpoint: string,
        body?: unknown
    ): Promise<T> {

        return request<T>(
            endpoint,
            {
                method: 'PUT',
                body: body
                    ? JSON.stringify(body)
                    : undefined
            }
        )
    },

    delete<T>(endpoint: string): Promise<T> {

        return request<T>(
            endpoint,
            {
                method: 'DELETE'
            }
        )
    }
}