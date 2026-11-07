import { api } from '@/services/api'
import type { components } from '@/types/schema'

// Bestehende DTOs
type DashboardStatsResponse = components['schemas']['DashboardStatDTO']

// Session-Statistiken
type SessionStatsResponse = components['schemas']['SessionStatsDTO']

// Grade Distribution
type GradeDistributionResponse = components['schemas']['GradeDistributionResponseDTO']

// Session Insights
type SessionInsightsResponseDTO = components['schemas']['SessionInsightsResponseDTO']

// Session Notes
type SessionNotesDTO = components['schemas']['SessionNotesDTO']

/**
 * Lädt die Dashboard-Statistiken des eingeloggten Users.
 */
export function getDashboardStats(): Promise<DashboardStatsResponse> {
    return api.get<DashboardStatsResponse>(
        '/stats/dashboardStats'
    )
}


/**
 * Lädt die Statistiken einer bestimmten Session.
 */
export function getSessionStats(
    sessionId: number
): Promise<SessionStatsResponse> {
    return api.get<SessionStatsResponse>(
        `/stats/session/${sessionId}`
    )
}


/**
 * Lädt die Grade Distribution einer bestimmten Session.
 */
export function getSessionGradeDistribution(
    sessionId: number
): Promise<GradeDistributionResponse> {
    return api.get<GradeDistributionResponse>(
        `/stats/sessionGradeDistribution/${sessionId}`
    )
}

/**
 * Lädt die Grade Distribution von offenen Attempts einer bestimmten Session.
 */
type UntoppedGradeDistributionResponse = components['schemas']['UntoppedGradeDistributionResponseDTO']

export function getSessionUntoppedGradeDistribution(
    sessionId: number
): Promise<UntoppedGradeDistributionResponse> {
    return api.get<UntoppedGradeDistributionResponse>(
        `/stats/sessionUntoppedGradeDistribution/${sessionId}`
    )
}

/**
 * Lädt die Session Insights einer bestimmten Session.
 */
export function getSessionInsightsResponseDTO(
    sessionId: number
): Promise<SessionInsightsResponseDTO> {
    return api.get<SessionInsightsResponseDTO>(
        `/sessions/${sessionId}/insights`
    )
}

export async function getSessionNotes(sessionId: number) {
    return api.get<SessionNotesDTO>(`/sessions/${sessionId}/notes`)
}

export async function updateSessionNotes(
    sessionId: number,
    notes: string
) {
    return api.put<SessionNotesDTO>(`/sessions/${sessionId}/notes`, {
        notes
    })
}