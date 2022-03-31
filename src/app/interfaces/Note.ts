export interface Note {
    id?: number,
    title: string,
    startDate: number,
    endDate: number,
    labels: number[],
    summary?: string
}