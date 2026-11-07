import { api } from '@/services/api'
import type { components } from '@/types/schema'

export type HighlightResponse =
    components['schemas']['HighlightResponseDTO']

export function getHighlights(): Promise<HighlightResponse[]> {
    return api.get<HighlightResponse[]>('/highlights')
}
