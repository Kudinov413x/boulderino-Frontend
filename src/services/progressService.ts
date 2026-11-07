import { api } from '@/services/api'
import type { components } from '@/types/schema'

type ProgressResponse = components['schemas']['ProgressResponseDTO']

type GradeStatsResponse = components['schemas']['GradeStatsResponseDTO']

type MaxGradeOverTime = components['schemas']['MaxGradeOverTimeDTO']

type GradeDistributionResponse = components['schemas']['GradeDistributionResponseDTO']

type AttributeStatsResponse = components['schemas']['AttributeStatsResponseDTO']

type FilteredProgress = components['schemas']['FilteredProgressDTO']

type StrengthWeaknessResponse = components['schemas']['StrengthWeaknessResponseDTO']


export function getProgress(): Promise<ProgressResponse> {

    return api.get<ProgressResponse>(
        '/progress'
    )
}


export function getGradeStats(): Promise<GradeStatsResponse[]> {

    return api.get<GradeStatsResponse[]>(
        '/progress/grades'
    )
}


export function getMaxGradeOverTime(): Promise<MaxGradeOverTime[]> {

    return api.get<MaxGradeOverTime[]>(
        '/progress/timeline/max-grade'
    )
}


export function getMaxGradeForPeriod(
    startDate: string,
    endDate: string
): Promise<string> {

    const params = new URLSearchParams({
        startDate,
        endDate
    })

    return api.get<string>(
        `/progress/withinTimeFrame/max-grade?${params.toString()}`
    )
}


export function getGradeDistribution(): Promise<GradeDistributionResponse> {

    return api.get<GradeDistributionResponse>(
        '/progress/grade-distribution'
    )
}


export function getProgressByAttribute(
    attributeType:
        | 'GRIP_TYPE'
        | 'WALL_ANGLE'
        | 'CLIMBING_STYLE'
        | 'ROUTE_CHARACTER'
): Promise<AttributeStatsResponse[]> {

    const params = new URLSearchParams({
        attributeType
    })

    return api.get<AttributeStatsResponse[]>(
        `/progress/attributes?${params.toString()}`
    )
}

const gradeMapping: Record<string, string> = {
    '1': 'FB1',
    '1+': 'FB1_PLUS',
    '2': 'FB2',
    '2+': 'FB2_PLUS',
    '3': 'FB3',
    '3+': 'FB3_PLUS',
    '4': 'FB4',
    '4+': 'FB4_PLUS',
    '5': 'FB5',
    '5+': 'FB5_PLUS',
    '6': 'FB6',
    '6+': 'FB6_PLUS',
    '6a': 'FB6_A',
    '6b': 'FB6_B',
    '6c': 'FB6_C',
    '7': 'FB7',
    '7+': 'FB7_PLUS',
    '7a': 'FB7_A',
    '7b': 'FB7_B',
    '7c': 'FB7_C',
    '8': 'FB8',
    '8+': 'FB8_PLUS'
}


export function getProgressByFilters(
    filters: {
        gripType?: string | null
        wallAngle?: string | null
        climbingStyle?: string | null
        routeCharacter?: string | null
        minGrade?: string | null
        maxGrade?: string | null
    }
): Promise<FilteredProgress> {

    const params = new URLSearchParams()

    if (filters.gripType) {
        params.set('gripType', filters.gripType)
    }

    if (filters.wallAngle) {
        params.set('wallAngle', filters.wallAngle)
    }

    if (filters.climbingStyle) {
        params.set('climbingStyle', filters.climbingStyle)
    }

    if (filters.routeCharacter) {
        params.set('routeCharacter', filters.routeCharacter)
    }

    if (filters.minGrade) {
        params.set(
            'minGrade',
            gradeMapping[filters.minGrade] ?? filters.minGrade
        )
    }

    if (filters.maxGrade) {
        params.set(
            'maxGrade',
            gradeMapping[filters.maxGrade] ?? filters.maxGrade
        )
    }

    const queryString = params.toString()

    return api.get<FilteredProgress>(
        `/progress/filter${queryString ? `?${queryString}` : ''}`
    )
}

export function getStrengthsAndWeaknesses(): Promise<StrengthWeaknessResponse> {

    return api.get<StrengthWeaknessResponse>(
        '/progress/strengths-weaknesses'
    )
}

// Filter Count
type ProgressFilterCountResponse =
    components['schemas']['ProgressFilterCountResponseDTO']

export function getFilterOptionCounts(
    filters: {
        gripType?: string | null
        wallAngle?: string | null
        climbingStyle?: string | null
        routeCharacter?: string | null
        minGrade?: string | null
        maxGrade?: string | null
    } = {}
): Promise<ProgressFilterCountResponse> {

    const params = new URLSearchParams()

    if (filters.gripType) {
        params.set('gripType', filters.gripType)
    }

    if (filters.wallAngle) {
        params.set('wallAngle', filters.wallAngle)
    }

    if (filters.climbingStyle) {
        params.set('climbingStyle', filters.climbingStyle)
    }

    if (filters.routeCharacter) {
        params.set('routeCharacter', filters.routeCharacter)
    }

    if (filters.minGrade) {
        params.set(
            'minGrade',
            gradeMapping[filters.minGrade] ?? filters.minGrade
        )
    }

    if (filters.maxGrade) {
        params.set(
            'maxGrade',
            gradeMapping[filters.maxGrade] ?? filters.maxGrade
        )
    }

    const queryString = params.toString()

    return api.get<ProgressFilterCountResponse>(
        `/progress/filter-options${queryString ? `?${queryString}` : ''}`
    )
}

type ProgressOverTimeResponse =
components['schemas']['ProgressOverTimeResponseDTO']

export function getProgressOverTime(): Promise<ProgressOverTimeResponse> {
return api.get<ProgressOverTimeResponse>(
'/progress/timeline/over-time'
)
}
