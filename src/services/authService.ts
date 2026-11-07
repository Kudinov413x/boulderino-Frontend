import type { components } from '@/types/schema'

type LoginRequestDTO =
    components['schemas']['LoginRequestDTO']

type LoginResponseDTO =
    components['schemas']['LoginResponseDTO']

type RegisterRequestDTO =
    components['schemas']['RegisterRequestDTO']

type UserResponseDTO =
    components['schemas']['UserResponseDTO']


const API_URL = 'http://localhost:8080/api'


export async function login(
    request: LoginRequestDTO
): Promise<LoginResponseDTO> {

    const response = await fetch(
        `${API_URL}/auth/login`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        if (response.status === 401) {
            throw new Error(
                'E-Mail oder Passwort ist falsch.'
            )
        }

        throw new Error(
            `Login fehlgeschlagen: ${response.status}`
        )
    }

    return response.json()
}


export async function register(
    request: RegisterRequestDTO
): Promise<UserResponseDTO> {

    const response = await fetch(
        `${API_URL}/auth/register`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(request)
        }
    )

    if (!response.ok) {

        if (response.status === 409) {
            throw new Error(
                'Diese E-Mail-Adresse ist bereits registriert.'
            )
        }

        throw new Error(
            `Registrierung fehlgeschlagen: ${response.status}`
        )
    }

    return response.json()
}